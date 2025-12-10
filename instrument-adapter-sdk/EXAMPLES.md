# Integration Examples — Instrument Adapter SDK

## Table of Contents

1. [Basic Device Integration](#basic-device-integration)
2. [Telemetry Streaming](#telemetry-streaming)
3. [Command Execution with E-Signatures](#command-execution-with-e-signatures)
4. [Error Handling](#error-handling)
5. [Compliance Reporting](#compliance-reporting)
6. [Integration with NewGen Studio Agents](#integration-with-newgen-studio-agents)

---

## Basic Device Integration

### Example 1: Register a Cell Sorter

```typescript
import { InstrumentAdapter } from '@newgen/adapter-sdk'

const adapter = new InstrumentAdapter({
  platformUrl: 'http://localhost:3000',
  apiKey: 'your-api-key',
  operatorId: 'OP-2025-001',
})

// Register BD FACSAria sorter
adapter.registerDevice({
  deviceId: 'SORTER-BD-001',
  vendorName: 'BD Biosciences',
  modelNumber: 'FACSAria Fusion',
  serialNumber: 'SN12345678',
  capabilities: ['sort', 'analyze', 'gate_definition'],
  telemetryStreams: ['purity', 'recovery', 'events_sorted', 'sort_time'],
  commandTypes: ['startSort', 'stopSort', 'setGate'],
  location: 'Lab A, Floor 3',
})

console.log('✓ Cell sorter registered')
```

### Example 2: Register a Fermentation Bioreactor

```typescript
adapter.registerDevice({
  deviceId: 'FERM-SARTORIUS-001',
  vendorName: 'Sartorius',
  modelNumber: 'BIOSTAT B-DCU',
  serialNumber: 'SN789012',
  capabilities: [
    'fermentation',
    'temperature_control',
    'ph_control',
    'do_control',
    'agitation_control',
  ],
  telemetryStreams: [
    'volume',
    'temperature',
    'pH',
    'dissolved_oxygen',
    'agitation_rpm',
    'aeration_vvm',
    'biomass',
    'product_titer',
  ],
  commandTypes: ['startFermentation', 'stopFermentation', 'setTemperature'],
  maintenanceWindow: {
    dayOfWeek: 'Sunday',
    startHour: 0,
    endHour: 6,
  },
})

console.log('✓ Fermentor registered with maintenance window')
```

---

## Telemetry Streaming

### Example 3: Stream Temperature Data

```typescript
import { setInterval } from 'timers'

// Simulate reading temperature from device every 30 seconds
setInterval(async () => {
  try {
    const response = await adapter.pushTelemetry(
      'FERM-SARTORIUS-001',
      'temperature',
      {
        value: 37.5,
        unit: '°C',
        timestamp: new Date(),
        sensorId: 'SENSOR-TEMP-RTD01',
        confidence: 0.99, // 99% confidence
      }
    )

    console.log(`✓ Temperature recorded: ${response.recordId}`)
  } catch (error) {
    console.error(`✗ Telemetry ingestion failed: ${error.message}`)
  }
}, 30000) // Every 30 seconds
```

### Example 4: Batch Telemetry Ingestion

```typescript
async function ingestBatchTelemetry(deviceId: string, batch: Array<{
  stream: string
  value: number
  unit?: string
}>) {
  const timestamp = new Date()

  const results = await Promise.all(
    batch.map((item) =>
      adapter.pushTelemetry(deviceId, item.stream, {
        value: item.value,
        unit: item.unit,
        timestamp,
      })
    )
  )

  const successful = results.filter((r) => r.received).length
  console.log(`✓ Ingested ${successful}/${batch.length} telemetry streams`)

  return results
}

// Usage
await ingestBatchTelemetry('FERM-SARTORIUS-001', [
  { stream: 'temperature', value: 37.5, unit: '°C' },
  { stream: 'pH', value: 7.2, unit: 'pH' },
  { stream: 'dissolved_oxygen', value: 65, unit: '%' },
  { stream: 'agitation_rpm', value: 500, unit: 'RPM' },
])
```

### Example 5: Stream Derived Data (ML Model Output)

```typescript
// Stream predictions from ML surrogate model
async function streamMLPrediction(deviceId: string) {
  const prediction = await yourMLModel.predict({
    temperature: 37.5,
    pH: 7.2,
    DO: 65,
  })

  await adapter.pushTelemetry(deviceId, 'predicted_biomass', {
    value: prediction.biomass, // e.g., 8.5 g/L
    unit: 'g/L',
    timestamp: new Date(),
    sensorId: 'MODEL-GP-BIOMASS-V1',
    confidence: prediction.confidence, // e.g., 0.92
    derivedFrom: ['temperature', 'pH', 'dissolved_oxygen'],
    metadata: {
      modelVersion: '1.0.0',
      modelType: 'GaussianProcess',
      estimatedGrowthRate: prediction.growthRate,
    },
  })
}
```

---

## Command Execution with E-Signatures

### Example 6: Start Fermentation with Operator Approval

```typescript
import crypto from 'crypto'

// Simulate operator signature (in production, use PKI-based signatures)
function createMockOperatorSignature(
  operatorId: string,
  commandParams: Record<string, unknown>
) {
  const payload = JSON.stringify({ operatorId, commandParams, timestamp: Date.now() })
  const signature = crypto.createHmac('sha256', 'mock-secret').update(payload).digest('base64')

  return {
    operatorId,
    operatorName: 'Dr. Jane Smith',
    signature,
    timestamp: new Date(),
    reason: 'Starting fermentation run for CHO culture optimization',
    signingAlgorithm: 'RSA-PSS-SHA256',
  }
}

// Execute command with operator signature
const signature = createMockOperatorSignature('OP-2025-001', { duration: 48 })

const result = await adapter.sendCommand(
  'FERM-SARTORIUS-001',
  'startFermentation',
  {
    duration: 48, // hours
    temperature: 37.5, // °C
    initialPH: 7.0,
    initialDO: 50, // %
  },
  signature
)

if (result.status === 'SUCCESS') {
  console.log(`✓ Fermentation started`)
  console.log(`  Command ID: ${result.commandId}`)
  console.log(`  Manifest: ${result.manifest?.manifestId}`)
  console.log(`  Operator: ${result.manifest?.operatorName}`)
  console.log(`  Time: ${result.manifest?.timestamp}`)

  // Save manifest to audit trail
  fs.writeFileSync(`manifests/${result.manifest?.manifestId}.json`, 
    JSON.stringify(result.manifest, null, 2)
  )
} else {
  console.error(`✗ Command failed: ${result.error}`)
}
```

### Example 7: Cell Sorting with Population Gating

```typescript
const sortSignature = createMockOperatorSignature('OP-2025-001', {
  populationName: 'CD4+ cells',
})

const sortResult = await adapter.sendCommand(
  'SORTER-BD-001',
  'startSort',
  {
    populationName: 'CD4+ cells',
    sortingStrategy: 'double_sort',
    targetCount: 1000000,
    plateId: 'PLATE-001',
    sampleId: 'SAM-2025-001-CD4',
  },
  sortSignature
)

if (sortResult.status === 'SUCCESS') {
  console.log(`✓ Cell sort initiated`)

  // Monitor sort progress
  let sortComplete = false
  while (!sortComplete) {
    const status = adapter.getDeviceStatus('SORTER-BD-001')

    console.log(`  Purity: ${status.metadata}%, Recovery: ${status.healthScore}%`)

    await new Promise((resolve) => setTimeout(resolve, 5000)) // Check every 5s

    // Check if sort is complete (would come from telemetry)
    // sortComplete = ...
  }
}
```

---

## Error Handling

### Example 8: Robust Error Handling with Retry

```typescript
import { RetryUtils } from '@newgen/adapter-sdk'

async function robustPushTelemetry(
  deviceId: string,
  streamName: string,
  payload: any
) {
  try {
    return await RetryUtils.retry(
      async () => adapter.pushTelemetry(deviceId, streamName, payload),
      3, // Max attempts
      1000 // Base delay (exponential backoff)
    )
  } catch (error) {
    console.error(`✗ Failed after retries: ${error.message}`)
    // Fallback: queue for later or alert operator
  }
}
```

### Example 9: Handle Validation Errors

```typescript
import { Validator } from '@newgen/adapter-sdk'

function safeRegisterDevice(metadata: unknown) {
  try {
    const validated = Validator.validateDeviceMetadata(metadata)
    adapter.registerDevice(validated)
    console.log(`✓ Device registered: ${validated.deviceId}`)
  } catch (error) {
    if (error instanceof Error) {
      console.error(`✗ Invalid device metadata: ${error.message}`)
      // Example output:
      // "Validation failed [DeviceMetadata]: deviceId: fails custom regex, 
      //  vendorName: must be at least 2 characters long"

      // Show user-friendly error
      const validationErrors = error.message.match(/(?:.*?:)([^,;]+)/g)
      validationErrors?.forEach((err) => console.error(`  - ${err.trim()}`))
    }
  }
}

// Test with invalid data
safeRegisterDevice({
  deviceId: 'invalid id', // Contains spaces!
  vendorName: 'X', // Too short
  modelNumber: 'Model',
  serialNumber: 'SN123',
  capabilities: [],
  telemetryStreams: [],
})
```

### Example 10: Handle Stale Operator Signatures

```typescript
// This signature is 10 minutes old (will be rejected)
const staleSignature = {
  operatorId: 'OP-2025-001',
  signature: 'sig_...',
  timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
}

const result = await adapter.sendCommand(
  'FERM-SARTORIUS-001',
  'stopFermentation',
  {},
  staleSignature
)

if (result.status === 'FAILURE') {
  if (result.error?.includes('too old')) {
    console.error('✗ Signature expired. Operator must re-sign with current timestamp.')
  }
}
```

---

## Compliance Reporting

### Example 11: Generate FDA Compliance Report

```typescript
function generateComplianceReport() {
  const report = adapter.generateComplianceReport()

  console.log('=== FDA 21 CFR Part 11 Compliance Report ===')
  console.log(`Total Commands: ${report.summary.total_commands}`)
  console.log(`Successful: ${report.summary.successful}`)
  console.log(`Failed: ${report.summary.failed}`)
  console.log(`Success Rate: ${report.summary.success_rate}`)
  console.log(`\nOperators Involved: ${report.operators_involved.join(', ')}`)

  console.log('\nManifests Generated:')
  report.manifests.forEach((m: any) => {
    console.log(`  - ${m.manifest_id}: ${m.status} (${m.timestamp})`)
  })

  return report
}

// Example output:
// === FDA 21 CFR Part 11 Compliance Report ===
// Total Commands: 5
// Successful: 4
// Failed: 1
// Success Rate: 80.00%
//
// Operators Involved: OP-2025-001, OP-2025-002
//
// Manifests Generated:
//   - MF-20251210-000001: SUCCESS (2025-12-10T14:32:15.123Z)
//   - MF-20251210-000002: SUCCESS (2025-12-10T14:35:22.456Z)
//   - MF-20251210-000003: FAILURE (2025-12-10T14:38:45.789Z)
```

### Example 12: Verify Manifest Integrity

```typescript
import { ManifestGenerator, ComplianceReporter } from '@newgen/adapter-sdk'

function validateManifests() {
  const commands = adapter.getCommandHistory()

  console.log('=== Manifest Integrity Check ===')
  
  commands.forEach((cmd) => {
    if (!cmd.manifest) return

    // Check integrity
    const isIntact = ManifestGenerator.verifyManifestIntegrity(cmd.manifest)

    // Check compliance
    const compliance = ComplianceReporter.validateCompliance(cmd.manifest)

    console.log(`\n${cmd.manifest.manifestId}:`)
    console.log(`  Integrity: ${isIntact ? '✓ OK' : '✗ TAMPERED'}`)
    console.log(`  Compliance: ${compliance.compliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}`)

    if (!compliance.compliant) {
      compliance.issues.forEach((issue) => console.log(`    - ${issue}`))
    }
  })
}
```

---

## Integration with NewGen Studio Agents

### Example 13: Integration with Planner Agent

```typescript
// Planner Agent calls adapter to check device capabilities
async function plannerAgentGetCapabilities(deviceId: string) {
  try {
    const status = adapter.getDeviceStatus(deviceId)
    const metadata = status.metadata

    return {
      deviceId,
      available: status.isOnline,
      capabilities: metadata.capabilities,
      telemetryStreams: metadata.telemetryStreams,
      supportedCommands: metadata.commandTypes || [],
      healthScore: status.healthScore,
    }
  } catch (error) {
    return { error: error.message }
  }
}

// Usage
const capabilities = await plannerAgentGetCapabilities('FERM-SARTORIUS-001')
console.log('Device Capabilities:', capabilities)
// Output:
// {
//   deviceId: 'FERM-SARTORIUS-001',
//   available: true,
//   capabilities: ['fermentation', 'temperature_control', ...],
//   telemetryStreams: ['volume', 'temperature', ...],
//   supportedCommands: ['startFermentation', 'stopFermentation', ...],
//   healthScore: 95
// }
```

### Example 14: Integration with Simulator Agent

```typescript
// Simulator Agent uses digital twin to predict outcomes
async function simulatorAgentPredictOutcome(
  deviceId: string,
  commandParams: Record<string, unknown>
) {
  // Run simulation
  await adapter.runSim(deviceId, {
    duration: 10000, // 10 seconds of simulation
    telemetryInterval: 1000,
    failureMode: 'none',
  })

  // Get simulated telemetry
  const history = adapter.getCommandHistory({ deviceId })

  return {
    predictedOutcome: 'success',
    expectedYield: 8.5, // g/L
    timeToCompletion: 48, // hours
    riskLevel: 'low',
    confidence: 0.92,
  }
}
```

### Example 15: Integration with Executor Agent

```typescript
// Executor Agent dispatches approved commands
async function executorAgentDispatchCommand(
  deviceId: string,
  commandName: string,
  params: Record<string, unknown>,
  approvalSignature: any // From Safety Agent
) {
  console.log(`Executing: ${commandName} on ${deviceId}`)

  const result = await adapter.sendCommand(
    deviceId,
    commandName,
    params,
    {
      operatorId: 'EXECUTOR-AGENT',
      operatorName: 'Executor Agent',
      signature: approvalSignature,
      timestamp: new Date(),
      reason: 'Approved by Safety Agent',
    }
  )

  return {
    commandId: result.commandId,
    status: result.status,
    manifestId: result.manifest?.manifestId,
    auditTrail: result.auditTrail,
  }
}
```

### Example 16: Integration with Validator Agent

```typescript
// Validator Agent checks manifests post-execution
function validatorAgentCheckManifests() {
  const commands = adapter.getCommandHistory()
  const validation = {
    totalCommands: commands.length,
    validManifests: 0,
    invalidManifests: 0,
    issues: [],
  }

  commands.forEach((cmd) => {
    if (!cmd.manifest) return

    const isValid = ManifestGenerator.verifyManifestIntegrity(cmd.manifest)
    const compliance = ComplianceReporter.validateCompliance(cmd.manifest)

    if (isValid && compliance.compliant) {
      validation.validManifests++
    } else {
      validation.invalidManifests++
      validation.issues.push({
        manifestId: cmd.manifest.manifestId,
        issues: compliance.issues,
      })
    }
  })

  return validation
}
```

---

## Full End-to-End Workflow

### Example 17: Complete CAR-T Manufacturing Workflow

```typescript
async function manufactureCARTCells(
  sorterId: string,
  fermentorId: string,
  operatorId: string
) {
  console.log('=== CAR-T Cell Manufacturing Workflow ===\n')

  // Step 1: Check device availability
  console.log('1. Verifying device health...')
  const sorterStatus = adapter.getDeviceStatus(sorterId)
  const fermentorStatus = adapter.getDeviceStatus(fermentorId)

  if (!sorterStatus.isOnline || !fermentorStatus.isOnline) {
    throw new Error('Devices offline')
  }
  console.log('✓ Devices ready\n')

  // Step 2: Start cell sorting
  console.log('2. Starting cell sorting...')
  const sortSig = createMockOperatorSignature(operatorId, {
    populationName: 'CD4+ cells',
  })

  const sortResult = await adapter.sendCommand(
    sorterId,
    'startSort',
    {
      populationName: 'CD4+ cells',
      targetCount: 10000000, // 10M cells
    },
    sortSig
  )

  if (sortResult.status !== 'SUCCESS') {
    throw new Error(`Sort failed: ${sortResult.error}`)
  }
  console.log(`✓ Sort started (${sortResult.commandId})\n`)

  // Step 3: Monitor sorting
  console.log('3. Monitoring sort progress...')
  for (let i = 0; i < 5; i++) {
    await adapter.pushTelemetry(sorterId, 'purity', {
      value: 70 + i * 5, // Purity increases over time
      unit: 'percent',
      timestamp: new Date(),
    })

    console.log(`  Purity: ${70 + i * 5}%`)
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  console.log('✓ Sort complete\n')

  // Step 4: Start fermentation
  console.log('4. Starting fermentation...')
  const fermSig = createMockOperatorSignature(operatorId, {
    duration: 48,
  })

  const fermResult = await adapter.sendCommand(
    fermentorId,
    'startFermentation',
    {
      duration: 48, // hours
      temperature: 37.0,
      initialPH: 7.2,
      agitation: 500, // RPM
    },
    fermSig
  )

  if (fermResult.status !== 'SUCCESS') {
    throw new Error(`Fermentation failed: ${fermResult.error}`)
  }
  console.log(`✓ Fermentation started (${fermResult.commandId})\n`)

  // Step 5: Stream telemetry
  console.log('5. Streaming fermentation telemetry...')
  for (let i = 0; i < 3; i++) {
    await ingestBatchTelemetry(fermentorId, [
      { stream: 'temperature', value: 37.0 + Math.random() * 0.5, unit: '°C' },
      { stream: 'pH', value: 7.2 + (Math.random() - 0.5) * 0.2, unit: 'pH' },
      { stream: 'dissolved_oxygen', value: 65 + Math.random() * 10, unit: '%' },
      { stream: 'biomass', value: 1.0 + i * 2.5, unit: 'g/L' },
    ])

    console.log(`  Biomass: ${1.0 + i * 2.5} g/L`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  console.log('✓ Telemetry streaming complete\n')

  // Step 6: Generate compliance report
  console.log('6. Generating compliance report...')
  const report = adapter.generateComplianceReport()
  console.log(`✓ ${report.summary.total_commands} commands executed`)
  console.log(`✓ Success rate: ${report.summary.success_rate}\n`)

  console.log('=== Workflow Complete ===')
  return {
    sortResult,
    fermResult,
    report,
  }
}

// Execute workflow
manufactureCARTCells('SORTER-BD-001', 'FERM-SARTORIUS-001', 'OP-2025-001')
  .then(() => console.log('✓ Manufacturing succeeded'))
  .catch((error) => console.error(`✗ Manufacturing failed: ${error.message}`))
```

---

**For more examples, see:**
- `API.md` — Complete API reference
- `DEVELOPMENT.md` — Developer guide with testing examples
- `src/__tests__/adapter.test.ts` — Jest unit tests
