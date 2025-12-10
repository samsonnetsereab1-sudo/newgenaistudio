import { createHash, randomBytes } from 'crypto'

/**
 * Logging utility with pino
 */
export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  info(message: string, data?: unknown): void {
    console.log(`[${this.context}] ${message}`, data ? JSON.stringify(data) : '')
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.context}] ERROR: ${message}`, error?.message || '')
  }

  debug(message: string, data?: unknown): void {
    if (process.env.DEBUG) {
      console.debug(`[${this.context}] ${message}`, data ? JSON.stringify(data) : '')
    }
  }
}

/**
 * Cryptographic utilities for command signing and manifest hashing
 */
export class CryptoUtils {
  /**
   * Generate SHA-256 hash of input string
   */
  static hash256(input: string | object): string {
    const str = typeof input === 'string' ? input : JSON.stringify(input)
    return createHash('sha256').update(str).digest('hex')
  }

  /**
   * Generate a random nonce (for replay attack prevention)
   */
  static generateNonce(): string {
    return randomBytes(16).toString('hex')
  }

  /**
   * Generate a secure random ID
   */
  static generateId(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = randomBytes(6).toString('hex').toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Compute command hash for tamper detection
   */
  static commandHash(
    deviceId: string,
    commandName: string,
    params: Record<string, unknown>
  ): string {
    const payload = {
      deviceId,
      commandName,
      params,
      timestamp: new Date().toISOString(),
    }
    return this.hash256(payload)
  }
}

/**
 * Time utilities with NTP synchronization support
 */
export class TimeUtils {
  /**
   * Get current ISO 8601 timestamp (no timezone ambiguity)
   */
  static now(): string {
    return new Date().toISOString()
  }

  /**
   * Validate timestamp is not too far in past/future (prevent clock skew)
   */
  static isValidTimestamp(timestamp: string, maxSkewMs: number = 60000): boolean {
    const ts = new Date(timestamp).getTime()
    const now = Date.now()
    const diff = Math.abs(now - ts)
    return diff <= maxSkewMs
  }

  /**
   * Format duration in milliseconds as human-readable string
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }
}

/**
 * Validation utilities using Joi schemas
 */
export class ValidationUtils {
  /**
   * Validate object against schema, throw if invalid
   */
  static validate<T>(
    object: unknown,
    schema: any,
    context: string
  ): T {
    const { error, value } = schema.validate(object, {
      abortEarly: false,
      stripUnknown: false,
    })

    if (error) {
      const messages = error.details
        .map((d) => `${d.path.join('.')}: ${d.message}`)
        .join('; ')
      throw new Error(`Validation failed [${context}]: ${messages}`)
    }

    return value as T
  }

  /**
   * Safe validate (return null on error instead of throwing)
   */
  static validateSafe<T>(
    object: unknown,
    schema: any
  ): T | null {
    const { error, value } = schema.validate(object, {
      abortEarly: false,
      stripUnknown: false,
    })

    return error ? null : (value as T)
  }
}

/**
 * Manifest utilities for generating signed audit records
 */
export class ManifestUtils {
  /**
   * Create a manifest ID with timestamp
   */
  static generateManifestId(): string {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
    const seq = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(6, '0')
    return `MF-${dateStr}-${seq}`
  }

  /**
   * Build command manifest for BPR inclusion
   */
  static buildCommandManifest(data: {
    manifestId: string
    deviceId: string
    commandName: string
    operatorId: string
    operatorName: string
    status: 'SUCCESS' | 'FAILURE'
    commandHash: string
    signature: string
    params: Record<string, unknown>
    error?: string
    auditTrail: Array<{ event: string; timestamp: string }>
  }): Record<string, unknown> {
    return {
      manifest_id: data.manifestId,
      timestamp: TimeUtils.now(),
      device_id: data.deviceId,
      command_name: data.commandName,
      operator_id: data.operatorId,
      operator_name: data.operatorName,
      status: data.status,
      command_hash: data.commandHash,
      signature_algorithm: 'RSA-PSS-SHA256',
      signature: data.signature,
      params_snapshot: data.params,
      error_details: data.error || null,
      audit_trail: data.auditTrail,
      compliance_frameworks: [
        'FDA-21CFR-Part11',
        'ICH-Q7',
        'ALCOA+',
      ],
    }
  }
}

/**
 * Retry utilities for resilient network calls
 */
export class RetryUtils {
  /**
   * Exponential backoff retry
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null

    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        const delay = baseDelayMs * Math.pow(2, i)
        if (i < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }
}
