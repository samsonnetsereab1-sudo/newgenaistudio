/**
 * Core type definitions for Instrument Adapter SDK
 * These types enforce FDA 21 CFR Part 11 compliance and safety requirements
 */

/**
 * Device metadata for registration
 */
export interface DeviceMetadata {
  deviceId: string
  vendorName: string
  modelNumber: string
  serialNumber: string
  capabilities: string[]
  telemetryStreams: string[]
  commandTypes?: string[]
  location?: string
  maintenanceWindow?: { dayOfWeek: string; startHour: number; endHour: number }
}

/**
 * Device status including health metrics
 */
export interface DeviceStatus {
  deviceId: string
  isOnline: boolean
  healthScore: number // 0-100
  lastTelemetry: string // ISO 8601 timestamp
  activeOperations: string[]
  errorCount: number
  uptime: number // milliseconds
  metadata: DeviceMetadata
}

/**
 * Telemetry payload with full lineage tracking
 */
export interface TelemetryPayload {
  value: number | string | boolean | object
  unit?: string
  timestamp: Date
  sensorId?: string
  confidence?: number // 0-1, for ML predictions
  derivedFrom?: string[] // Lineage tracking
  metadata?: Record<string, unknown>
}

/**
 * Telemetry stream with validation schema
 */
export interface TelemetryStream {
  streamName: string
  dataType: 'numeric' | 'string' | 'boolean' | 'json'
  unit?: string
  minValue?: number
  maxValue?: number
  allowedValues?: (string | number)[]
}

/**
 * Operator signature for command authorization (PKI + timestamp)
 */
export interface OperatorSignature {
  operatorId: string
  operatorName?: string
  signature: string // Base64-encoded cryptographic signature
  timestamp: Date
  reason?: string // Why operator approved this command
  signingAlgorithm?: 'RSA-PSS-SHA256' | 'ECDSA-SHA256' // Default: RSA-PSS-SHA256
  certificatePEM?: string // Optional public cert for verification
}

/**
 * Command execution result with full audit trail
 */
export interface CommandResult {
  commandId: string
  deviceId: string
  commandName: string
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'EXECUTING' | 'SUCCESS' | 'FAILURE'
  result?: unknown
  error?: string
  executionTimeMs?: number
  manifest?: CommandManifest
  auditTrail: AuditEvent[]
}

/**
 * Command manifest for BPR (Batch Production Record) inclusion
 * Meets FDA 21 CFR Part 11 requirements for electronic signatures
 */
export interface CommandManifest {
  manifestId: string
  timestamp: string // ISO 8601
  deviceId: string
  commandName: string
  operatorId: string
  operatorName?: string
  status: 'SUCCESS' | 'FAILURE'
  commandHash: string // SHA-256 of command params
  signatureAlgorithm: string
  signature: string // Digital signature by operator
  paramsSnapshot: Record<string, unknown>
  errorDetails?: string
  auditTrail: AuditEvent[]
  complianceFrameworks: string[] // FDA-21CFR-Part11, ALCOA+, etc.
}

/**
 * Audit event for immutable trail
 */
export interface AuditEvent {
  event: string
  timestamp: string // ISO 8601
  details?: Record<string, unknown>
  actorId?: string
}

/**
 * Configuration for SDK initialization
 */
export interface AdapterConfig {
  platformUrl: string
  apiKey: string
  operatorId: string
  operatorName?: string
  timeout?: number // milliseconds
  retryAttempts?: number
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  enableMetrics?: boolean
}

/**
 * Simulation configuration for testing
 */
export interface SimulationConfig {
  duration: number // milliseconds
  telemetryInterval: number // how often to publish telemetry
  failureMode?: 'none' | 'sensor_drift' | 'communication_timeout' | 'command_rejected'
  failureRate?: number // 0-1
}

/**
 * Telemetry ingestion response from platform
 */
export interface TelemetryResponse {
  recordId: string
  deviceId: string
  timestamp: string
  received: boolean
  validationErrors?: string[]
}

/**
 * Device registry entry (for future use with Vault)
 */
export interface DeviceRegistryEntry {
  deviceId: string
  metadata: DeviceMetadata
  credentials: {
    // Encrypted credentials stored in Vault/KMS
    username?: string
    password?: string
    apiKey?: string
    certificate?: string
  }
  createdAt: string
  updatedAt: string
  encryptionKeyId: string
}

/**
 * Command sent to device
 */
export interface Command {
  commandId: string
  deviceId: string
  commandName: string
  params: Record<string, unknown>
  operatorSignature: OperatorSignature
  createdAt: string
  timeout?: number
}
