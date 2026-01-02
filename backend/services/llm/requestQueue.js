/**
 * Request Queue for Gemini API
 * Prevents rate limits by controlling concurrency and request timing
 */

class RequestQueue {
  constructor(maxConcurrent = 2, minDelayMs = 1000) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
    this.minDelayMs = minDelayMs;
    this.lastRequestTime = 0;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Enforce minimum delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelayMs) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minDelayMs - timeSinceLastRequest)
      );
    }

    const { fn, resolve, reject } = this.queue.shift();
    this.running++;
    this.lastRequestTime = Date.now();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

export const geminiQueue = new RequestQueue(2, 1000);
