# API Reference — Instrument Adapter SDK

## Table of Contents

1. [InstrumentAdapter](#instrumentadapter-class)
2. [Types](#types)
3. [Validator](#validator-class)
4. [ManifestGenerator](#manifestgenerator-class)
5. [Utilities](#utilities)

---

## InstrumentAdapter Class

Main class for device integration and telemetry management.

### Constructor

```typescript
new InstrumentAdapter(config: AdapterConfig)
```

**Parameters:**
- `config: AdapterConfig` — Configuration object

**Example:**
```typescript
const adapter = new InstrumentAdapter({
  platformUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
  operatorId: 'OP-2025-001',
  operatorName: 'Dr. Jane Smith',
  timeout: 30000,
  retryAttempts: 3,
})
```

### Methods

#### `registerDevice(metadata: DeviceMetadata): void`

Register a new device with the adapter.

**Parameters:**
- `metadata: DeviceMetadata` — Device metadata object

**Throws:** Error if validation fails

**Example:**
```typescript
adapter.registerDevice({
  deviceId: 'SORTER-BD-001',
  vendorName: 'BD Biosciences',
  modelNumber: 'FACSAria Fusion',
  serialNumber: 'SN12345678',
  capabilities: ['sort', 'analyze', 'gate'],
  telemetryStreams: ['purity', 'recovery', 'sort_events'],
})
```

---

#### `async pushTelemetry(deviceId: string, streamName: string, payload: TelemetryPayload): Promise<TelemetryResponse>`

Ingest telemetry from a device.

**Parameters:**
- `deviceId: string` — Device ID
- `streamName: string` — Telemetry stream name
- `payload: TelemetryPayload` — Telemetry data

**Returns:** Promise<TelemetryResponse>

**Throws:** Error if device not registered or validation fails

**Example:**
```typescript
const response = await adapter.pushTelemetry(
  'SORTER-BD-001',
  'purity',
  {
    value: 96.5,
    unit: 'percent',
    timestamp: new Date(),
    sensorId: 'SENSOR-PMT-01',
    confidence: 0.95,
  }
)

console.log(`Record ID: ${response.recordId}`)
```

---

#### `async sendCommand(deviceId: string, commandName: string, params: Record<string, unknown>, operatorSignature: OperatorSignature): Promise<CommandResult>`

Send a command to a device (requires operator e-signature).

**Parameters:**
- `deviceId: string` — Device ID
- `commandName: string` — Command name
- `params: Record<string, unknown>` — Command parameters
- `operatorSignature: OperatorSignature` — Operator's digital signature

**Returns:** Promise<CommandResult>

**Throws:** Error if validation fails or signature is invalid

**Example:**
```typescript
const result = await adapter.sendCommand(
  'SORTER-BD-001',
  'startSort',
  {
    populationName: 'CD4+ cells',
    sortingStrategy: 'double_sort',
    targetCount: 1000000,
  },
  {
    operatorId: 'OP-2025-001',
    operatorName: 'Dr. Jane Smith',
    signature: 'base64_encoded_signature',
    timestamp: new Date(),
    reason: 'Patient CAR-T manufacturing batch',
    signingAlgorithm: 'RSA-PSS-SHA256',
  }
)

if (result.status === 'SUCCESS') {
  console.log(`Command executed: ${result.commandId}`)
  console.log(`Manifest: ${result.manifest?.manifestId}`)
} else {
  console.error(`Command failed: ${result.error}`)
}
```

---

#### `getDeviceStatus(deviceId: string): DeviceStatus`

Get current device status and health metrics.

**Parameters:**
- `deviceId: string` — Device ID

**Returns:** DeviceStatus

**Throws:** Error if device not found

**Example:**
```typescript
const status = adapter.getDeviceStatus('SORTER-BD-001')

console.log(`Device: ${status.deviceId}`)
console.log(`Online: ${status.isOnline}`)
console.log(`Health Score: ${status.healthScore}%`)
console.log(`Errors: ${status.errorCount}`)
```

---

#### `listDevices(): DeviceMetadata[]`

Get all registered devices.

**Returns:** Array of DeviceMetadata

**Example:**
```typescript
const devices = adapter.listDevices()
devices.forEach((device) => {
  console.log(`${device.deviceId}: ${device.vendorName} ${device.modelNumber}`)
})
```

---

#### `getCommandHistory(filter?: { deviceId?: string; status?: string }): CommandResult[]`

Get command execution history with optional filtering.

**Parameters:**
- `filter?: { deviceId?: string; status?: string }` — Optional filter criteria

**Returns:** Array of CommandResult

**Example:**
```typescript
// Get all commands
const allCommands = adapter.getCommandHistory()

// Get only failed commands for a device
const failedCommands = adapter.getCommandHistory({
  deviceId: 'SORTER-BD-001',
  status: 'FAILURE',
})
```

---

#### `generateComplianceReport(): Record<string, unknown>`

Generate FDA 21 CFR Part 11 compliance report.

**Returns:** Compliance report object

**Example:**
```typescript
const report = adapter.generateComplianceReport()

console.log(`Total Commands: ${report.summary.total_commands}`)
console.log(`Success Rate: ${report.summary.success_rate}`)
console.log(`Operators: ${report.operators_involved.join(', ')}`)
```

---

#### `async runSim(deviceId: string, simConfig: SimulationConfig): Promise<void>`

Run simulation test for CI/CD validation.

**Parameters:**
- `deviceId: string` — Device ID
- `simConfig: SimulationConfig` — Simulation configuration

**Throws:** Error if device not registered

**Example:**
```typescript
await adapter.runSim('SORTER-BD-001', {
  duration: 60000, // 60 seconds
  telemetryInterval: 5000, // Every 5 seconds
  failureMode: 'none',
})
```

---

## Types

### AdapterConfig

Configuration object for InstrumentAdapter.

```typescript
interface AdapterConfig {
  platformUrl: string          // Platform API URL
  apiKey: string               // API authentication key
  operatorId: string           // Operator identifier
  operatorName?: string        // Human-readable operator name
  timeout?: number             // Request timeout (ms, default: 30000)
  retryAttempts?: number       // Retry count (default: 3)
  logLevel?: 'debug' | 'info' | 'warn' | 'error'  // Log level
  enableMetrics?: boolean      // Enable metrics collection
}
```

---

### DeviceMetadata

Device registration metadata.

```typescript
interface DeviceMetadata {
  deviceId: string                    // Unique device ID
  vendorName: string                  // Manufacturer name
  modelNumber: string                 // Model designation
  serialNumber: string                // Serial number
  capabilities: string[]              // Device capabilities
  telemetryStreams: string[]          // Available telemetry streams
  commandTypes?: string[]             // Supported commands
  location?: string                   // Physical location
  maintenanceWindow?: {
    dayOfWeek: string                 // e.g., 'Monday'
    startHour: number                 // 0-23
    endHour: number                   // 0-23
  }
}
```

---

### DeviceStatus

Current device state and health.

```typescript
interface DeviceStatus {
  deviceId: string
  isOnline: boolean              // Connection status
  healthScore: number            // 0-100
  lastTelemetry: string          // ISO 8601 timestamp
  activeOperations: string[]     // Running operation IDs
  errorCount: number             // Total errors
  uptime: number                 // Milliseconds
  metadata: DeviceMetadata       // Device info
}
```

---

### TelemetryPayload

Telemetry data point.

```typescript
interface TelemetryPayload {
  value: number | string | boolean | object  // Actual value
  unit?: string                               // Unit of measurement
  timestamp: Date                             // When measured
  sensorId?: string                           // Sensor identifier
  confidence?: number                         // 0-1 confidence level
  derivedFrom?: string[]                      // Source data lineage
  metadata?: Record<string, unknown>          // Additional metadata
}
```

---

### OperatorSignature

Operator's digital signature for command authorization.

```typescript
interface OperatorSignature {
  operatorId: string                             // Operator ID
  operatorName?: string                          // Display name
  signature: string                              // Base64 signature
  timestamp: Date                                // When signed
  reason?: string                                // Signature purpose
  signingAlgorithm?: 'RSA-PSS-SHA256' | 'ECDSA-SHA256'
  certificatePEM?: string                        // Public certificate
}
```

---

### CommandResult

Result of command execution.

```typescript
interface CommandResult {
  commandId: string                  // Unique command ID
  deviceId: string                   // Target device
  commandName: string                // Command name
  status: 'PENDING' | 'SENT' | 'ACKNOWLEDGED' | 'EXECUTING' | 'SUCCESS' | 'FAILURE'
  result?: unknown                   // Command result data
  error?: string                     // Error message if failed
  executionTimeMs?: number           // Execution duration
  manifest?: CommandManifest         // FDA 21 CFR Part 11 manifest
  auditTrail: AuditEvent[]          // Full audit trail
}
```

---

### CommandManifest

FDA 21 CFR Part 11 compliant manifest.

```typescript
interface CommandManifest {
  manifestId: string                           // Unique manifest ID
  timestamp: string                            // ISO 8601 timestamp
  deviceId: string
  commandName: string
  operatorId: string
  operatorName?: string
  status: 'SUCCESS' | 'FAILURE'
  commandHash: string                          // SHA-256 hash
  signatureAlgorithm: string                   // Algorithm used
  signature: string                            // Digital signature
  paramsSnapshot: Record<string, unknown>      // Original params
  errorDetails?: string
  auditTrail: AuditEvent[]
  complianceFrameworks: string[]               // FDA-21CFR-Part11, etc.
}
```

---

### AuditEvent

Single audit log entry.

```typescript
interface AuditEvent {
  event: string                      // Event type
  timestamp: string                  // ISO 8601
  details?: Record<string, unknown>  // Event details
  actorId?: string                   // Who triggered event
}
```

---

## Validator Class

Input validation using Joi schemas.

### Static Methods

#### `validateDeviceMetadata(data: unknown): DeviceMetadata`

Validate and return device metadata.

```typescript
try {
  const validated = Validator.validateDeviceMetadata(data)
  console.log(`Valid device: ${validated.deviceId}`)
} catch (error) {
  console.error(`Invalid metadata: ${error.message}`)
}
```

---

#### `validateOperatorSignature(data: unknown): OperatorSignature`

Validate and return operator signature.

```typescript
const signature = Validator.validateOperatorSignature({
  operatorId: 'OP-2025-001',
  signature: 'long-base64-string',
  timestamp: new Date(),
})
```

---

#### `validateTelemetryPayload(data: unknown): TelemetryPayload`

Validate and return telemetry payload.

```typescript
const payload = Validator.validateTelemetryPayload({
  value: 37.5,
  unit: '°C',
  timestamp: new Date(),
})
```

---

#### `validateTelemetryAgainstStream(payload: TelemetryPayload, stream: TelemetryStream): boolean`

Check if telemetry matches stream schema.

```typescript
const stream: TelemetryStream = {
  streamName: 'temperature',
  dataType: 'numeric',
  unit: '°C',
  minValue: 35,
  maxValue: 40,
}

if (Validator.validateTelemetryAgainstStream(payload, stream)) {
  console.log('Telemetry matches stream definition')
}
```

---

## ManifestGenerator Class

Generate and manage FDA compliance manifests.

### Static Methods

#### `generateCommandManifest(data: {...}): CommandManifest`

Create a signed manifest for command execution.

```typescript
const manifest = ManifestGenerator.generateCommandManifest({
  deviceId: 'DEVICE-001',
  commandName: 'start',
  commandParams: { duration: 60 },
  operatorSignature: signature,
  status: 'SUCCESS',
  auditTrail: [
    { event: 'command_queued', timestamp: new Date().toISOString() },
  ],
})
```

---

#### `verifyManifestIntegrity(manifest: CommandManifest): boolean`

Verify manifest has not been tampered with.

```typescript
if (ManifestGenerator.verifyManifestIntegrity(manifest)) {
  console.log('✓ Manifest integrity verified')
} else {
  console.error('✗ Manifest has been modified')
}
```

---

#### `manifestToJSON(manifest: CommandManifest): string`

Convert manifest to JSON for storage.

```typescript
const json = ManifestGenerator.manifestToJSON(manifest)
fs.writeFileSync('manifest.json', json)
```

---

## Utilities

### CryptoUtils

Cryptographic operations.

```typescript
// Generate hash
const hash = CryptoUtils.hash256('input string')

// Generate nonce
const nonce = CryptoUtils.generateNonce()

// Generate command hash
const cmdHash = CryptoUtils.commandHash('DEVICE-001', 'start', { duration: 60 })
```

### TimeUtils

Time and timestamp utilities.

```typescript
// Current ISO 8601 timestamp
const now = TimeUtils.now()

// Check if timestamp is valid (within clock skew tolerance)
if (TimeUtils.isValidTimestamp(timestamp)) {
  console.log('Timestamp is recent and valid')
}

// Format duration
const formatted = TimeUtils.formatDuration(5000) // "5.0s"
```

### Logger

Structured logging.

```typescript
const logger = new Logger('MyContext')

logger.info('Something happened', { details: 'data' })
logger.error('An error occurred', error)
logger.debug('Debug message') // Only if DEBUG env var set
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Device not registered | Device ID doesn't exist | Call `registerDevice()` first |
| Validation failed | Invalid input data | Check input matches schema |
| Stale operator signature | Signature timestamp too old | Re-sign with current timestamp |
| Device offline | No connection | Check device connectivity |

### Example Error Handling

```typescript
try {
  const result = await adapter.sendCommand(deviceId, 'start', {}, signature)
  
  if (result.status === 'FAILURE') {
    console.error(`Command failed: ${result.error}`)
    // Handle specific error
  }
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Device not registered')) {
      // Register device and retry
      adapter.registerDevice(metadata)
    } else {
      console.error(`Unexpected error: ${error.message}`)
    }
  }
}
```

---

## Examples

### Complete Integration Example

```typescript
import { InstrumentAdapter } from '@newgen/adapter-sdk'

async function main() {
  // Initialize adapter
  const adapter = new InstrumentAdapter({
    platformUrl: 'http://localhost:3000',
    apiKey: 'your-api-key',
    operatorId: 'OP-2025-001',
  })

  // Register device
  adapter.registerDevice({
    deviceId: 'SORTER-BD-001',
    vendorName: 'BD Biosciences',
    modelNumber: 'FACSAria Fusion',
    serialNumber: 'SN12345678',
    capabilities: ['sort', 'analyze'],
    telemetryStreams: ['purity', 'recovery'],
  })

  // Ingest telemetry
  const telemetry = await adapter.pushTelemetry(
    'SORTER-BD-001',
    'purity',
    {
      value: 96.5,
      unit: 'percent',
      timestamp: new Date(),
    }
  )
  console.log(`Telemetry recorded: ${telemetry.recordId}`)

  // Send command with operator signature
  const result = await adapter.sendCommand(
    'SORTER-BD-001',
    'startSort',
    { populationName: 'CD4+ cells', targetCount: 1000000 },
    {
      operatorId: 'OP-2025-001',
      signature: 'base64_signature',
      timestamp: new Date(),
    }
  )

  if (result.status === 'SUCCESS') {
    console.log(`✓ Sort started (manifest: ${result.manifest?.manifestId})`)
  } else {
    console.error(`✗ Sort failed: ${result.error}`)
  }

  // Generate compliance report
  const report = adapter.generateComplianceReport()
  console.log(`Compliance Report:`, report)
}

main().catch(console.error)
```

---

**Last Updated**: December 10, 2025  
**Version**: 1.0.0-alpha
