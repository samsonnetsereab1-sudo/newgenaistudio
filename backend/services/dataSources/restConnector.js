/**
 * REST API Connector
 * Provides HTTP client for REST API data sources
 */

/**
 * REST API Connector Class
 */
export class RestConnector {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.url;
    this.methods = config.methods || ['GET', 'POST', 'PUT', 'DELETE'];
    this.headers = config.config?.headers || {};
    this.retryCount = config.config?.retryCount || 3;
    this.retryDelay = config.config?.retryDelay || 1000;
    this.cache = new Map();
    this.cacheEnabled = config.config?.cache || false;
  }

  /**
   * Connect to the data source (for REST, this is a no-op)
   */
  async connect() {
    console.log(`[REST Connector] Connected to ${this.baseUrl}`);
    return true;
  }

  /**
   * Fetch data from the REST API
   * @param {object} options - Fetch options
   * @returns {Promise<object>} - Response data
   */
  async fetch(options = {}) {
    const {
      method = 'GET',
      path = '',
      body = null,
      headers = {},
      params = {}
    } = options;

    const url = this.buildUrl(path, params);
    const cacheKey = `${method}:${url}`;

    // Check cache for GET requests
    if (method === 'GET' && this.cacheEnabled && this.cache.has(cacheKey)) {
      console.log(`[REST Connector] Cache hit for ${url}`);
      return this.cache.get(cacheKey);
    }

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...headers
      }
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await this.fetchWithRetry(url, fetchOptions);
      const data = await response.json();

      // Cache GET responses
      if (method === 'GET' && this.cacheEnabled) {
        this.cache.set(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`[REST Connector] Fetch error for ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch with automatic retry on failure
   */
  async fetchWithRetry(url, options, attempt = 0) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (attempt < this.retryCount) {
        console.log(`[REST Connector] Retry ${attempt + 1}/${this.retryCount} for ${url}`);
        await this.delay(this.retryDelay * (attempt + 1));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Subscribe to data updates (polling for REST)
   * @param {function} callback - Callback function for updates
   * @param {object} options - Subscription options
   */
  subscribe(callback, options = {}) {
    const { interval = 5000, path = '', params = {} } = options;

    const intervalId = setInterval(async () => {
      try {
        const data = await this.fetch({ method: 'GET', path, params });
        callback(data);
      } catch (error) {
        console.error('[REST Connector] Subscription error:', error.message);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }

  /**
   * Build URL with query parameters
   */
  buildUrl(path, params) {
    const url = new URL(path || '', this.baseUrl);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    return url.toString();
  }

  /**
   * Delay helper for retry
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Disconnect (cleanup)
   */
  disconnect() {
    this.clearCache();
    console.log(`[REST Connector] Disconnected from ${this.baseUrl}`);
  }
}
