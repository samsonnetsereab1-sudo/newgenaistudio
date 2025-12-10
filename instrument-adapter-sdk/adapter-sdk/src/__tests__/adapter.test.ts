import { InstrumentAdapter } from '../adapter'
import { Validator } from '../validator'
import { OperatorSignature, DeviceMetadata } from '../types'
import { CryptoUtils, TimeUtils } from '../utils'

describe('InstrumentAdapter', () => {
  let adapter: InstrumentAdapter

  beforeEach(() => {
    adapter = new InstrumentAdapter({
      platformUrl: 'http://localhost:3000',
      apiKey: 'test-api-key-' + Math.random().toString(36).substr(2, 20),
      operatorId: 'OP-TEST-001',
    })
  })

  describe('Device Registration', () => {
    it('should register a device with valid metadata', () => {
      const metadata: DeviceMetadata = {
        deviceId: 'SORTER-TEST-001',
        vendorName: 'BD Biosciences',
        modelNumber: 'FACSAria',
        serialNumber: 'SN123456',
        capabilities: ['sort', 'analyze'],
        telemetryStreams: ['purity', 'recovery'],
      }

      adapter.registerDevice(metadata)
      const devices = adapter.listDevices()

      expect(devices).toHaveLength(1)
      expect(devices[0].deviceId).toBe('SORTER-TEST-001')
    })

    it('should reject invalid device metadata', () => {
      const invalidMetadata = {
        deviceId: 'invalid-id-with-spaces',
        vendorName: 'X', // Too short
        modelNumber: 'FACSAria',
        serialNumber: 'SN123456',
        capabilities: [],
        telemetryStreams: ['purity'],
      }

      expect(() => {
        Validator.validateDeviceMetadata(invalidMetadata)
      }).toThrow()
    })

    it('should initialize device status on registration', () => {
      const metadata: DeviceMetadata = {
        deviceId: 'FERM-TEST-001',
        vendorName: 'Sartorius',
        modelNumber: 'BIOSTAT B-DCU',
        serialNumber: 'SN789012',
        capabilities: ['ferment'],
        telemetryStreams: ['temperature', 'pH', 'DO'],
      }

      adapter.registerDevice(metadata)
      const status = adapter.getDeviceStatus('FERM-TEST-001')

      expect(status.deviceId).toBe('FERM-TEST-001')
      expect(status.isOnline).toBe(false)
      expect(status.healthScore).toBe(0)
    })
  })

  describe('Telemetry Ingestion', () => {
    beforeEach(() => {
      const metadata: DeviceMetadata = {
        deviceId: 'TEST-DEVICE-001',
        vendorName: 'Test Vendor',
        modelNumber: 'Test Model',
        serialNumber: 'TEST123',
        capabilities: ['test'],
        telemetryStreams: ['temperature', 'pressure'],
      }
      adapter.registerDevice(metadata)
    })

    it('should validate and ingest telemetry', async () => {
      const response = await adapter.pushTelemetry('TEST-DEVICE-001', 'temperature', {
        value: 37.5,
        unit: '°C',
        timestamp: new Date(),
        sensorId: 'SENSOR-TEMP-01',
      })

      expect(response.received).toBe(true)
      expect(response.deviceId).toBe('TEST-DEVICE-001')
      expect(response.timestamp).toBeDefined()
    })

    it('should reject telemetry for unregistered device', async () => {
      await expect(
        adapter.pushTelemetry('NONEXISTENT-DEVICE', 'temperature', {
          value: 37.5,
          unit: '°C',
          timestamp: new Date(),
        })
      ).rejects.toThrow('Device not registered')
    })

    it('should update device status on telemetry', async () => {
      await adapter.pushTelemetry('TEST-DEVICE-001', 'temperature', {
        value: 37.5,
        unit: '°C',
        timestamp: new Date(),
      })

      const status = adapter.getDeviceStatus('TEST-DEVICE-001')
      expect(status.isOnline).toBe(true)
    })
  })

  describe('Command Execution', () => {
    beforeEach(() => {
      const metadata: DeviceMetadata = {
        deviceId: 'CMD-TEST-001',
        vendorName: 'Test Vendor',
        modelNumber: 'Test Model',
        serialNumber: 'CMD123',
        capabilities: ['command'],
        telemetryStreams: ['status'],
        commandTypes: ['start', 'stop'],
      }
      adapter.registerDevice(metadata)
    })

    it('should require operator signature for commands', async () => {
      const invalidResult = await adapter.sendCommand(
        'CMD-TEST-001',
        'start',
        { duration: 60 },
        {
          operatorId: 'OP-INVALID',
          signature: 'invalid-short-sig',
          timestamp: new Date(),
        }
      )

      expect(invalidResult.status).toBe('FAILURE')
    })

    it('should generate manifest with operator signature', async () => {
      const validSignature: OperatorSignature = {
        operatorId: 'OP-TEST-002',
        operatorName: 'Dr. Test',
        signature: 'sig_' + CryptoUtils.generateNonce(),
        timestamp: new Date(),
        reason: 'Testing command execution',
      }

      const result = await adapter.sendCommand(
        'CMD-TEST-001',
        'start',
        { duration: 60 },
        validSignature
      )

      expect(result.commandId).toBeDefined()
      expect(result.manifest).toBeDefined()
      if (result.manifest) {
        expect(result.manifest.operatorId).toBe('OP-TEST-002')
        expect(result.manifest.commandHash).toBeDefined()
      }
    })

    it('should reject stale operator signatures (replay attack prevention)', async () => {
      const staleTimestamp = new Date()
      staleTimestamp.setMinutes(staleTimestamp.getMinutes() - 10) // 10 minutes old

      const staleSignature: OperatorSignature = {
        operatorId: 'OP-STALE',
        signature: 'sig_' + CryptoUtils.generateNonce(),
        timestamp: staleTimestamp,
      }

      const result = await adapter.sendCommand(
        'CMD-TEST-001',
        'start',
        { duration: 60 },
        staleSignature
      )

      expect(result.status).toBe('FAILURE')
      expect(result.error).toContain('too old')
    })

    it('should record audit trail for each command', async () => {
      const signature: OperatorSignature = {
        operatorId: 'OP-AUDIT-001',
        signature: 'sig_' + CryptoUtils.generateNonce(),
        timestamp: new Date(),
      }

      const result = await adapter.sendCommand(
        'CMD-TEST-001',
        'start',
        { duration: 60 },
        signature
      )

      expect(result.auditTrail.length).toBeGreaterThan(0)
      expect(result.auditTrail.some((e) => e.event === 'command_queued')).toBe(true)
      expect(result.auditTrail.some((e) => e.event === 'operator_signature_captured')).toBe(true)
    })
  })

  describe('Device Status', () => {
    it('should track device health score', () => {
      const metadata: DeviceMetadata = {
        deviceId: 'HEALTH-TEST-001',
        vendorName: 'Test Vendor',
        modelNumber: 'Test Model',
        serialNumber: 'HEALTH123',
        capabilities: ['test'],
        telemetryStreams: ['status'],
      }

      adapter.registerDevice(metadata)
      const status = adapter.getDeviceStatus('HEALTH-TEST-001')

      expect(status.healthScore).toBeDefined()
      expect(status.healthScore).toBeGreaterThanOrEqual(0)
      expect(status.healthScore).toBeLessThanOrEqual(100)
    })

    it('should throw error for nonexistent device status', () => {
      expect(() => {
        adapter.getDeviceStatus('NONEXISTENT')
      }).toThrow('Device not found')
    })
  })

  describe('Compliance & Audit', () => {
    beforeEach(() => {
      const metadata: DeviceMetadata = {
        deviceId: 'COMP-TEST-001',
        vendorName: 'Test Vendor',
        modelNumber: 'Test Model',
        serialNumber: 'COMP123',
        capabilities: ['test'],
        telemetryStreams: ['compliance'],
      }
      adapter.registerDevice(metadata)
    })

    it('should generate compliance report', async () => {
      const signature: OperatorSignature = {
        operatorId: 'OP-COMP-001',
        signature: 'sig_' + CryptoUtils.generateNonce(),
        timestamp: new Date(),
      }

      await adapter.sendCommand('COMP-TEST-001', 'test_cmd', {}, signature)

      const report = adapter.generateComplianceReport()

      expect(report).toHaveProperty('summary')
      expect(report).toHaveProperty('manifests')
    })

    it('should include operator information in manifests', async () => {
      const signature: OperatorSignature = {
        operatorId: 'OP-INFO-001',
        operatorName: 'Dr. Compliance',
        signature: 'sig_' + CryptoUtils.generateNonce(),
        timestamp: new Date(),
      }

      const result = await adapter.sendCommand('COMP-TEST-001', 'test_cmd', {}, signature)

      if (result.manifest) {
        expect(result.manifest.operatorId).toBe('OP-INFO-001')
        expect(result.manifest.operatorName).toBe('Dr. Compliance')
      }
    })
  })

  describe('Simulation', () => {
    it('should run simulation test', async () => {
      const metadata: DeviceMetadata = {
        deviceId: 'SIM-TEST-001',
        vendorName: 'Test Vendor',
        modelNumber: 'Test Model',
        serialNumber: 'SIM123',
        capabilities: ['test'],
        telemetryStreams: ['sim_data'],
      }

      adapter.registerDevice(metadata)

      await adapter.runSim('SIM-TEST-001', {
        duration: 2000,
        telemetryInterval: 500,
      })

      // Simulation should complete without error
      expect(adapter.getDeviceStatus('SIM-TEST-001')).toBeDefined()
    })
  })
})
