export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

export interface User {
  username: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface APIResponse<T> {
  statusCode: number;
  body: T;
}

export interface WebSocketConnectionResponse {
  url: string;
  connectionId: string;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface UsersResponse {
  users: User[];
}