import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { get } from 'aws-amplify/api';
import { SecureWebSocket } from '../../utils/websocket';
import { sanitizeMessage } from '../../utils/sanitize';
import type { Message, MessagesResponse, WebSocketConnectionResponse } from './types/index';
import ChatMessage from './ChatMessage';
import UserList from './UserList';

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const wsRef = useRef<SecureWebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    fetchChatHistory();
    return () => {
      wsRef.current?.disconnect();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = async () => {
    try {
      const result = await get({
        apiName: 'chatAPI',
        path: '/socket-connection'
      }).response;
      
      const responseData = (await result.body.json()) as unknown as WebSocketConnectionResponse;
      if (responseData?.url) {
        const ws = new SecureWebSocket(responseData.url);
        
        ws.onMessage((message) => {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        });

        ws.onStatusChange((connected) => {
          setIsConnected(connected);
          if (connected) {
            setSendError(null);
          }
        });
        
        ws.connect();
        wsRef.current = ws;
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (!retryTimeoutRef.current) {
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        connectWebSocket();
      }, 5000);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const result = await get({
        apiName: 'chatAPI',
        path: '/messages'
      }).response;
      const responseData = (await result.body.json()) as unknown as MessagesResponse;
      if (responseData?.messages) {
        setMessages(responseData.messages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current) return;

    try {
      setSendError(null);
      const sanitizedContent = sanitizeMessage(newMessage);
      
      const message: Omit<Message, 'id'> = {
        content: sanitizedContent,
        sender: user.username,
        timestamp: new Date().toISOString(),
      };

      const sent = wsRef.current.send(message);
      if (sent) {
        setNewMessage('');
      } else {
        setSendError('Failed to send message: WebSocket not connected');
        scheduleReconnect();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setSendError(errorMessage);
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen bg-gray-100" role="main" aria-label="Chat Room">
      <div className="w-1/4 bg-white border-r">
        <UserList />
      </div>
      <div className="flex-1 flex flex-col">
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.sender === user.username}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form 
          onSubmit={sendMessage} 
          className="p-4 bg-white border-t"
          aria-label="Message input form"
        >
          {!isConnected && (
            <div className="text-red-500 text-sm mb-2" role="alert">
              Reconnecting to chat...
            </div>
          )}
          {sendError && (
            <div className="text-red-500 text-sm mb-2" role="alert">
              {sendError}
            </div>
          )}
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Message input"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;