import { fetchAuthSession } from 'aws-amplify/auth';

const TIMEOUT_DURATION = 600000; // 10 minutes in milliseconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export class SecureWebSocket {
  private ws: WebSocket | null = null;
  private lastActivity: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;
  private onStatusChangeCallback: ((isConnected: boolean) => void) | null = null;

  constructor(private url: string) {}

  async connect() {
    try {
      const { tokens } = await fetchAuthSession();
      const token = tokens?.idToken?.toString();
      
      const secureUrl = `${this.url}?token=${token}`;
      this.ws = new WebSocket(secureUrl);

      this.ws.onopen = () => {
        this.startHeartbeat();
        this.onStatusChangeCallback?.(true);
      };

      this.ws.onmessage = (event) => {
        this.lastActivity = Date.now();
        if (event.data === 'pong') return;
        
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallback?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.cleanup();
        this.scheduleReconnect();
      };

      this.checkTimeout();
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, HEARTBEAT_INTERVAL);
  }

  private checkTimeout() {
    const checkInterval = setInterval(() => {
      const inactive = Date.now() - this.lastActivity > TIMEOUT_DURATION;
      if (inactive && this.ws?.readyState === WebSocket.OPEN) {
        console.log('Connection timed out due to inactivity');
        this.ws.close();
        clearInterval(checkInterval);
      }
    }, 60000); // Check every minute
  }

  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.onStatusChangeCallback?.(false);
  }

  private scheduleReconnect() {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, 3000);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.lastActivity = Date.now();
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (isConnected: boolean) => void) {
    this.onStatusChangeCallback = callback;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}