import React, { memo } from 'react';
import type { Message } from './types';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      role="listitem"
      aria-label={`Message from ${message.sender}`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwnMessage && (
          <div className="text-sm font-medium text-gray-600 mb-1">
            {message.sender}
          </div>
        )}
        <div>{message.content}</div>
        <div 
          className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}
          aria-label={`Sent at ${new Date(message.timestamp).toLocaleString()}`}
        >
          {new Date(message.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default memo(ChatMessage, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isOwnMessage === nextProps.isOwnMessage
  );
});