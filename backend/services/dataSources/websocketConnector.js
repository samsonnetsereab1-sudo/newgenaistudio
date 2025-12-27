/**
 * WebSocket Connector
 * Provides real-time bidirectional communication for data sources
 */

/**
 * WebSocket Connector Class
 */
export class WebSocketConnector {
  constructor(config) {
    this.config = config;
    this.url = config.url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = config.config?.maxReconnectAttempts || 5;
    this.reconnectDelay = config.config?.reconnectDelay || 2000;
    this.messageQueue = [];
    this.subscribers = new Set();
    this.isConnected = false;
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[WebSocket Connector] Connecting to ${this.url}`);
        
        // For Node.js environment, we'd need 'ws' package
        // For browser, use native WebSocket
        if (typeof WebSocket === 'undefined') {
          console.warn('[WebSocket Connector] WebSocket not available in this environment');
          // In Node.js, we would: import WebSocket from 'ws';
          reject(new Error('WebSocket not available'));
          return;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log(`[WebSocket Connector] Connected to ${this.url}`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.notifySubscribers(data);
          } catch (error) {
            console.error('[WebSocket Connector] Message parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket Connector] Error:', error);
          this.isConnected = false;
        };

        this.ws.onclose = () => {
          console.log('[WebSocket Connector] Connection closed');
          this.isConnected = false;
          this.attemptReconnect();
        };

      } catch (error) {
        console.error('[WebSocket Connector] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket Connector] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket Connector] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    await this.delay(delay);
    
    try {
      await this.connect();
    } catch (error) {
      console.error('[WebSocket Connector] Reconnection failed:', error);
    }
  }

  /**
   * Send data through WebSocket
   * @param {object} data - Data to send
   */
  send(data) {
    const message = JSON.stringify(data);

    if (!this.isConnected || this.ws.readyState !== WebSocket.OPEN) {
      console.log('[WebSocket Connector] Not connected, queuing message');
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(message);
      console.log('[WebSocket Connector] Message sent');
    } catch (error) {
      console.error('[WebSocket Connector] Send error:', error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Fetch data (for compatibility with data source interface)
   * For WebSocket, this sends a request and waits for response
   */
  async fetch(options = {}) {
    return new Promise((resolve, reject) => {
      const { requestId = Date.now(), ...data } = options;
      
      // Create one-time subscriber for this request
      const responseHandler = (message) => {
        if (message.requestId === requestId) {
          this.subscribers.delete(responseHandler);
          resolve(message.data);
        }
      };

      this.subscribers.add(responseHandler);
      
      // Send request
      this.send({ requestId, ...data });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        this.subscribers.delete(responseHandler);
        reject(new Error('WebSocket fetch timeout'));
      }, 30000);
    });
  }

  /**
   * Subscribe to WebSocket messages
   * @param {function} callback - Callback function for messages
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of new message
   */
  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[WebSocket Connector] Subscriber error:', error);
      }
    });
  }

  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      try {
        this.ws.send(message);
      } catch (error) {
        console.error('[WebSocket Connector] Queue flush error:', error);
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
    this.messageQueue = [];
    console.log(`[WebSocket Connector] Disconnected from ${this.url}`);
  }
}
