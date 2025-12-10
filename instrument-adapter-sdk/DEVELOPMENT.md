# Development Guide — Instrument Adapter SDK

## Quick Start for Developers

### Prerequisites
- Node.js v18+ (LTS recommended)
- npm v9+
- Git
- VS Code (recommended) with TypeScript extension

### Setup Development Environment

```bash
# Clone repo (or navigate to existing)
cd instrument-adapter-sdk

# Install root dependencies
npm install

# Install workspace dependencies
npm -w adapter-sdk install
npm -w simulator install

# Build both packages
npm run build

# Run tests
npm test

# Start simulator
npm -w simulator start
```

### Project Structure

```
instrument-adapter-sdk/
├── adapter-sdk/              # Main TypeScript SDK
│   ├── src/
│   │   ├── adapter.ts       # Main InstrumentAdapter class
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── validator.ts     # Input validation with Joi
│   │   ├── manifest.ts      # FDA compliance manifests
│   │   ├── utils.ts         # Utilities (crypto, logging, time)
│   │   └── __tests__/       # Jest unit tests
│   ├── dist/                # Compiled output (auto-generated)
│   ├── package.json
│   └── tsconfig.json
│
├── simulator/               # OPC-UA Device Simulator
│   ├── src/
│   │   ├── server.ts        # OPC-UA server setup
│   │   ├── devices.ts       # Virtual fermentor & sorter
│   │   ├── telemetry.ts     # Telemetry publishing
│   │   └── index.ts         # Entry point
│   ├── dist/                # Compiled output (auto-generated)
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
│
├── package.json             # Root workspace config
├── tsconfig.json            # Root TypeScript config
├── jest.config.js           # Jest configuration
└── README.md                # User documentation
```

## Development Workflow

### Adding a New Telemetry Stream

1. **Define the stream type in `adapter-sdk/src/types.ts`**:
   ```typescript
   export interface DeviceMetadata {
     // ... existing fields
     telemetryStreams: ['temperature', 'pressure', 'my_new_stream']
   }
   ```

2. **Add validation in `adapter-sdk/src/validator.ts`**:
   ```typescript
   static readonly MY_STREAM_SCHEMA = Joi.object({
     streamName: Joi.string().valid('my_new_stream').required(),
     value: Joi.number().min(0).max(100).required(),
     unit: Joi.string().optional(),
     timestamp: Joi.date().required(),
   })
   ```

3. **Update the simulator in `simulator/src/devices.ts`**:
   ```typescript
   addressSpace.addVariable({
     componentOf: fermentorFolder,
     browseName: 'MyNewStream',
     displayName: 'My New Stream (units)',
     dataType: 'Double',
     value: {
       get: () => ({
         dataType: DataType.Double,
         value: device.getState().myNewStream,
       }),
     },
   })
   ```

4. **Add tests in `adapter-sdk/src/__tests__/adapter.test.ts`**:
   ```typescript
   it('should ingest new stream telemetry', async () => {
     await adapter.pushTelemetry('DEVICE-ID', 'my_new_stream', {
       value: 50,
       unit: 'percent',
       timestamp: new Date(),
     })
     // Assert success
   })
   ```

### Implementing a Device Driver

Create a new file in `simulator/src/devices.ts`:

```typescript
export class VirtualMyDevice {
  private deviceId: string
  private telemetryValue: number = 0

  constructor(deviceId: string = 'MY-DEVICE-001') {
    this.deviceId = deviceId
  }

  getState() {
    return {
      deviceId: this.deviceId,
      telemetryValue: this.telemetryValue,
    }
  }

  updateTelemetry(): void {
    // Update simulated state
    this.telemetryValue += Math.random() * 10
  }

  executeCommand(commandName: string, params: Record<string, unknown>): boolean {
    if (commandName === 'my_command') {
      // Handle command
      return true
    }
    return false
  }
}
```

Then register in `simulator/src/server.ts`:
```typescript
private setupMyDeviceDevice(addressSpace: any, parent: any): void {
  const device = this.publisher.getMyDevice()
  // Setup nodes...
}
```

### Running Tests Locally

```bash
# Run all tests
npm test

# Run specific test file
npm test adapter.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run integration tests only
npm run test:integration

# Run with specific pattern
npm test -- --testNamePattern="Device Registration"
```

### Type Checking

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### Building for Production

```bash
# Clean all builds
npm run clean

# Build both packages
npm run build

# Build only adapter SDK
npm -w adapter-sdk run build

# Build only simulator
npm -w simulator run build

# Check output
ls -la adapter-sdk/dist/
ls -la simulator/dist/
```

## Security Considerations

### Operator Signature Validation

When implementing signature verification:
1. **Always validate timestamp** to prevent replay attacks
2. **Check signature format** (must be Base64-encoded)
3. **Verify certificate chain** if using PKI
4. **Log all signature failures** for audit trail

### Credential Management

For production deployments:
1. **Never commit credentials** to Git (use `.env.local`, not `.env`)
2. **Encrypt credentials in transit** (use HTTPS/TLS 1.3+)
3. **Rotate credentials regularly** (monthly for API keys)
4. **Use secret management service** (HashiCorp Vault, AWS Secrets Manager)

### Data Retention

Per FDA 21 CFR Part 11:
- Manifests retained for **20 years**
- Stored in **immutable storage** (S3 Glacier)
- **Cryptographic hash chain** prevents tampering
- **Audit logs** capture all access

## Testing Best Practices

### Unit Test Example

```typescript
describe('MyFeature', () => {
  it('should do something specific', () => {
    // Arrange
    const input = { /* ... */ }

    // Act
    const result = adapter.someMethod(input)

    // Assert
    expect(result).toBeDefined()
    expect(result.status).toBe('SUCCESS')
  })

  it('should handle error cases', () => {
    // Arrange
    const invalidInput = { /* ... */ }

    // Act & Assert
    expect(() => adapter.someMethod(invalidInput)).toThrow()
  })
})
```

### Integration Test Example

```typescript
describe('Adapter ↔ Simulator Integration', () => {
  it('should connect and ingest telemetry', async () => {
    // Start simulator
    const simulator = new SimulatorOPCServer()
    await simulator.start()

    try {
      // Create adapter
      const adapter = new InstrumentAdapter({ /* ... */ })

      // Register device
      adapter.registerDevice({ /* ... */ })

      // Ingest telemetry
      const response = await adapter.pushTelemetry(
        'FERM-001',
        'temperature',
        { value: 37, unit: '°C', timestamp: new Date() }
      )

      expect(response.received).toBe(true)
    } finally {
      await simulator.stop()
    }
  })
})
```

## Debugging

### Enable Debug Logging

```bash
# Unix/Linux/macOS
DEBUG=* npm test

# Windows (PowerShell)
$env:DEBUG = '*'; npm test

# Windows (CMD)
set DEBUG=* && npm test
```

### VS Code Debugging

1. Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-coverage"],
  "console": "integratedTerminal"
}
```

2. Press `F5` to start debugging

3. Set breakpoints with `F9`

## Performance Optimization

### Telemetry Batching

Instead of pushing telemetry one-at-a-time:

```typescript
// Slow (multiple API calls)
await adapter.pushTelemetry('DEVICE-001', 'temp', { value: 37, timestamp: new Date() })
await adapter.pushTelemetry('DEVICE-001', 'pH', { value: 7.2, timestamp: new Date() })

// Fast (single batch)
const batch = [
  { stream: 'temp', payload: { value: 37, timestamp: new Date() } },
  { stream: 'pH', payload: { value: 7.2, timestamp: new Date() } },
]
await adapter.batchPushTelemetry('DEVICE-001', batch) // (future feature)
```

### Command Parallelization

```typescript
// Slow (sequential)
await adapter.sendCommand('DEV-001', 'cmd1', {}, sig)
await adapter.sendCommand('DEV-002', 'cmd2', {}, sig)

// Fast (parallel)
await Promise.all([
  adapter.sendCommand('DEV-001', 'cmd1', {}, sig),
  adapter.sendCommand('DEV-002', 'cmd2', {}, sig),
])
```

## Troubleshooting

### OPC-UA Port Already in Use

```bash
# macOS/Linux: Find process using port 4334
lsof -i :4334

# Kill process
kill -9 <PID>

# Windows: Find process
netstat -ano | findstr 4334

# Kill process
taskkill /PID <PID> /F
```

### Module Not Found Errors

```bash
# Rebuild all modules
rm -rf node_modules package-lock.json
npm install

# Or rebuild workspaces specifically
npm ci --workspace=adapter-sdk
npm ci --workspace=simulator
```

### TypeScript Compilation Errors

```bash
# Check TypeScript version
npx tsc --version

# Rebuild type definitions
npm run build -- --declaration

# Check for conflicting types
npm ls @types/*
```

## CI/CD Troubleshooting

### GitHub Actions Failing

1. Check workflow logs in GitHub Actions tab
2. Look for error messages in "Run build-and-test" step
3. Check for missing environment variables
4. Verify Node.js version matches local development

### Test Coverage Below Threshold

1. Run coverage locally: `npm test -- --coverage`
2. Check coverage report in `adapter-sdk/coverage/`
3. Add missing tests for uncovered lines
4. Update threshold in `jest.config.js` if intentional

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/my-feature`
3. **Make changes and add tests**: `npm test`
4. **Build and verify**: `npm run build`
5. **Commit with clear message**: `git commit -m "feat: add my feature"`
6. **Push and create PR**: `git push origin feature/my-feature`

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:
```
feat(adapter): add batch telemetry ingestion

Implement batchPushTelemetry method to support
multiple telemetry streams in a single API call.

Fixes: #42
```

## Resources

- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-hooks/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [OPC-UA Specification](https://reference.opcfoundation.org/)
- [FDA 21 CFR Part 11](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application)
