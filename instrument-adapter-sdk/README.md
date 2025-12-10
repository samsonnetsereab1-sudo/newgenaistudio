# NewGen Studio — Instrument Adapter SDK (TypeScript) + OPC-UA Simulator

## Overview

This starter kit provides a complete scaffolding for integrating lab instruments (cell sorters, fermentors, plate readers) with NewGen Studio's core platform:

- **TypeScript Instrument Adapter SDK**: Minimal, extensible API for device onboarding, telemetry ingestion, and command dispatch
- **OPC-UA Device Simulator**: Node-based OPC-UA server exposing realistic instrument telemetry and command handlers
- **Safety & Compliance Built-In**: Operator e-signatures, audit trails, FDA 21 CFR Part 11 provenance logging
- **Unit Tests & CI/CD**: Jest tests + GitHub Actions workflow for smoke tests and integration validation
- **Type-Safe**: Full TypeScript with strict null checks and interface validation

## Quick Start (Local)

### Prerequisites
- Node.js v18+ (LTS recommended)
- npm v9+
- Basic familiarity with OPC-UA concepts

### 1. Install Dependencies

```bash
cd adapter-sdk
npm ci

cd ../simulator
npm ci

cd ..
```

### 2. Start the OPC-UA Simulator

```bash
cd simulator
npm start
```

Expected output:
```
[OPC-UA] Server started on opc.tcp://localhost:4334/UA/NewGenSimulator
[Device] Registered virtual fermentor: FERM-001
[Device] Registered virtual sorter: SORTER-001
[Telemetry] Publishing fermentor state every 5s
```

### 3. Run SDK Tests (in another terminal)

```bash
cd adapter-sdk
npm test
```

Expected output:
```
PASS  src/__tests__/adapter.test.ts
  ✓ registerDevice initializes device with metadata
  ✓ pushTelemetry validates and stores stream data
  ✓ sendCommand requires operator signature
  ✓ getDeviceStatus returns current state
  ✓ runSim connects to OPC-UA and ingests telemetry

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

### 4. Run Integration Tests (CI Simulation)

```bash
npm run test:integration
```

## Architecture

### Adapter SDK (`adapter-sdk/`)

The SDK exposes a single main class: `InstrumentAdapter`

#### Core Methods

```typescript
class InstrumentAdapter {
  // Register a new device with metadata and capabilities
  registerDevice(metadata: DeviceMetadata): void

  // Ingest telemetry from device (streaming or batch)
  pushTelemetry(
    deviceId: string,
    streamName: string,
    payload: TelemetryPayload
  ): Promise<void>

  // Send a command (requires operator e-signature)
  sendCommand(
    deviceId: string,
    commandName: string,
    params: Record<string, unknown>,
    operatorSignature: OperatorSignature
  ): Promise<CommandResult>

  // Get current device state and health
  getDeviceStatus(deviceId: string): DeviceStatus

  // Run integration test with simulator
  runSim(deviceId: string, simConfig: SimulationConfig): Promise<void>
}
```

#### Example Usage

```typescript
import { InstrumentAdapter } from './adapter'

const adapter = new InstrumentAdapter({
  platformUrl: 'http://localhost:3000',
  apiKey: process.env.NEWGEN_API_KEY,
  operatorId: 'OP-2025-001',
})

// Register a device
adapter.registerDevice({
  deviceId: 'SORTER-BD-001',
  vendorName: 'BD Biosciences',
  modelNumber: 'FACSAria Fusion',
  serialNumber: 'SN12345678',
  capabilities: ['sort', 'analyze', 'gate'],
  telemetryStreams: ['purity', 'recovery', 'sort_events'],
})

// Stream telemetry
adapter.pushTelemetry('SORTER-BD-001', 'purity', {
  value: 96.5,
  unit: 'percent',
  timestamp: new Date(),
  sensorId: 'SENSOR-PMT-01',
})

// Send a command with operator signature
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
    signature: 'sig_abcd1234...', // E-signature (PKI or biometric)
    timestamp: new Date(),
    reason: 'Patient CAR-T manufacturing batch BIO-2025-001',
  }
)

// Monitor device status
const status = adapter.getDeviceStatus('SORTER-BD-001')
console.log(`Device: ${status.deviceId}, Health: ${status.healthScore}%`)
```

### OPC-UA Simulator (`simulator/`)

A lightweight Node.js OPC-UA server that simulates two devices:

1. **Virtual Fermentor** (`FERM-001`)
   - Exposes nodes: `volume`, `temperature`, `pH`, `dissolved_oxygen`, `agitation_rpm`, `aeration_vvm`
   - Methods: `startFermentation()`, `stopFermentation()`, `setTemperature(target)`
   - Publishes state every 5 seconds

2. **Virtual Cell Sorter** (`SORTER-001`)
   - Exposes nodes: `purity`, `recovery`, `events_sorted`, `current_population`
   - Methods: `startSort()`, `stopSort()`, `setGate()`
   - Publishes events on sort completion

#### Starting the Simulator

```bash
npm start
```

The simulator will:
1. Start OPC-UA server on `opc.tcp://localhost:4334/UA/NewGenSimulator`
2. Create device node tree under `Objects > NewGen > Devices`
3. Expose RPC methods under `Objects > NewGen > Methods`
4. Listen for adapter connections (see logs)

## Compliance & Safety

### FDA 21 CFR Part 11 Compliance

Every command execution generates a **signed manifest** containing:
- `operator_id` — Identifies operator (and their signature authority)
- `command_hash` — SHA-256 hash of command params (tamper detection)
- `timestamp` — ISO 8601 timestamp (no timezone ambiguity)
- `signature_algorithm` — Algorithm used (e.g., `RSA-PSS-SHA256`, `ECDSA-SHA256`)
- `device_id`, `command_name` — What was executed
- `status` — Success / Failure with error details

### Manifest Example

```json
{
  "manifest_id": "MF-2025-12-10-001",
  "timestamp": "2025-12-10T14:32:15.123Z",
  "device_id": "SORTER-BD-001",
  "command_name": "startSort",
  "operator_id": "OP-2025-001",
  "operator_name": "Dr. Jane Smith",
  "status": "SUCCESS",
  "command_hash": "sha256:abc123def456...",
  "signature_algorithm": "RSA-PSS-SHA256",
  "signature": "-----BEGIN SIGNATURE-----\n...",
  "params_snapshot": {
    "populationName": "CD4+ cells",
    "sortingStrategy": "double_sort",
    "targetCount": 1000000
  },
  "audit_trail": [
    {
      "event": "command_queued",
      "timestamp": "2025-12-10T14:32:10.000Z"
    },
    {
      "event": "operator_signature_captured",
      "timestamp": "2025-12-10T14:32:12.500Z"
    },
    {
      "event": "device_acknowledged",
      "timestamp": "2025-12-10T14:32:14.000Z"
    },
    {
      "event": "command_completed",
      "timestamp": "2025-12-10T14:32:15.123Z"
    }
  ]
}
```

### Provenance Tracking

Every telemetry batch and command is tagged with:
1. **Source**: Device ID, sensor ID, method name
2. **Timestamp**: Synchronized with network time (NTP)
3. **Hash Chain**: Linked to previous telemetry/command (immutable audit trail)
4. **Operator**: If human-initiated, operator ID and signature

### Device Registry & Credential Handling

**Phase 2 Enhancement**: Device registry with encrypted credentials (HashiCorp Vault / AWS KMS)

```typescript
// (Planned) Integration with device registry
const deviceRegistry = new DeviceRegistry({
  vaultAddr: process.env.VAULT_ADDR,
  vaultToken: process.env.VAULT_TOKEN,
})

const credentials = await deviceRegistry.getCredentials('SORTER-BD-001')
// Returns encrypted OPC-UA creds, certificate pins, etc.
```

## File Structure

```
instrument-adapter-sdk/
├── README.md                          # This file
├── package.json                       # Root workspace config (monorepo)
├── tsconfig.json                      # TypeScript config (root)
├── jest.config.js                     # Jest test runner config
│
├── adapter-sdk/                       # TypeScript SDK
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── types.ts                   # Core interfaces (Device, Telemetry, Command, etc.)
│   │   ├── adapter.ts                 # Main InstrumentAdapter class
│   │   ├── manifest.ts                # Manifest & provenance generation
│   │   ├── validator.ts               # Input validation & schema checking
│   │   ├── utils.ts                   # Crypto, hashing, logging utilities
│   │   └── __tests__/
│   │       └── adapter.test.ts        # Unit tests (Jest)
│   └── dist/                          # Compiled JavaScript (auto-generated)
│
├── simulator/                         # OPC-UA Simulator
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts                  # OPC-UA server setup
│   │   ├── devices/
│   │   │   ├── fermentor.ts           # Virtual fermentor device
│   │   │   └── sorter.ts              # Virtual cell sorter device
│   │   ├── telemetry.ts               # Telemetry generation & publishing
│   │   └── index.ts                   # Entry point
│   └── dist/                          # Compiled JavaScript (auto-generated)
│
└── .github/
    └── workflows/
        └── ci.yml                     # GitHub Actions CI (simulator + tests)
```

## Testing

### Unit Tests (Adapter SDK)

```bash
cd adapter-sdk
npm test
```

Covers:
- Device registration with invalid metadata
- Telemetry validation (schema, types, timestamps)
- Command execution with/without operator signature
- Manifest generation and signing
- Device status aggregation

### Integration Tests

```bash
npm run test:integration
```

Covers:
- Simulator startup and device registration
- OPC-UA connection handshake
- Telemetry ingestion from simulator
- Command dispatch to simulator
- Manifest persistence and audit trail

### CI/CD (GitHub Actions)

See `.github/workflows/ci.yml`:
1. Spin up simulator in background
2. Run adapter unit tests
3. Run integration smoke tests
4. Validate manifest schemas
5. Check code coverage (target: >80%)

## Security & Best Practices

### Development

- **Never commit credentials**: Use `.env.example` as template
- **Validate all inputs**: Adapter validates device metadata, command params, telemetry schemas
- **Sign all commands**: Operator e-signatures are mandatory (no unsigned commands)
- **Immutable audit trails**: Manifests are stored and cannot be modified retroactively

### Production Deployment

- **Use mTLS**: Enable certificate pinning between adapter and platform
- **Encrypt at rest**: Store manifests in encrypted S3 buckets or PostgreSQL columns
- **Credential rotation**: Implement automated credential refresh via Vault/KMS
- **Network isolation**: Run adapter in VPC with restricted egress (only to platform)
- **Monitoring**: Ship logs to Datadog/CloudWatch with alerts on command failures

## Next Steps

### Phase 1 (MVP)
- [x] Adapter SDK scaffold
- [x] OPC-UA simulator
- [x] Unit tests
- [x] CI/CD workflow
- [ ] Add real BD FACSAria OPC-UA driver (requires vendor SDK license)

### Phase 2 (Enterprise)
- [ ] Device registry (Vault integration)
- [ ] mTLS + cert-based auth
- [ ] Local operator UI (React + e-signature capture)
- [ ] Offline command queuing (SQLite on edge device)
- [ ] Multi-device orchestration (parallel commands)

### Phase 3 (Advanced)
- [ ] Vendor plugin SDK (Hamilton, Tecan, Opentrons)
- [ ] Real-time closed-loop control (feedback loops)
- [ ] ML-powered predictive maintenance
- [ ] Federated device networks (mesh topology)

## Support & Contributing

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section below
2. Review test files (`adapter-sdk/src/__tests__/`) for usage examples
3. Open an issue on GitHub with reproduction steps

### Troubleshooting

**OPC-UA Simulator fails to start**
- Check port 4334 is available: `lsof -i :4334` (macOS/Linux) or `netstat -ano | findstr 4334` (Windows)
- Ensure Node.js v18+ installed: `node --version`

**Adapter cannot connect to simulator**
- Ensure simulator is running: `cd simulator && npm start`
- Check firewall rules: allow localhost connections on port 4334

**Tests fail with timeout**
- Increase Jest timeout: `npm test -- --testTimeout=30000`
- Ensure simulator running in background

**Manifest signature mismatch**
- Verify operator private key in `OPERATOR_KEY_PATH` environment variable
- Check NTP time sync: `ntpq -p` (should show low offset)

## License

Proprietary — NewGen Studio, Inc. (2025)

---

**Last Updated**: December 10, 2025  
**Version**: 1.0.0-alpha  
**Maintainer**: NewGen Studio Engineering Team
