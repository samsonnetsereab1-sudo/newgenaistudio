/**
 * NewGen Studio Instrument Adapter SDK
 * Public API exports
 */

// Main adapter class
export { InstrumentAdapter } from './adapter'

// Types
export type {
  AdapterConfig,
  Command,
  CommandResult,
  CommandManifest,
  DeviceMetadata,
  DeviceStatus,
  DeviceRegistryEntry,
  TelemetryPayload,
  TelemetryResponse,
  TelemetryStream,
  OperatorSignature,
  AuditEvent,
  SimulationConfig,
} from './types'

// Validation
export { Validator } from './validator'

// Manifest & Compliance
export { ManifestGenerator, AuditTrailBuilder, ComplianceReporter } from './manifest'

// Utilities
export {
  Logger,
  CryptoUtils,
  TimeUtils,
  ValidationUtils,
  ManifestUtils,
  RetryUtils,
} from './utils'

/**
 * Version information
 */
export const SDK_VERSION = '1.0.0-alpha'
export const SDK_NAME = '@newgen/adapter-sdk'
