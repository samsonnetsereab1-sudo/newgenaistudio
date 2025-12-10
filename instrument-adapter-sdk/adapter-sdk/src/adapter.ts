import axios, { AxiosInstance } from 'axios'
import { v4 as uuidv4 } from 'uuid'

import {
  AdapterConfig,
  Command,
  CommandResult,
  DeviceMetadata,
  DeviceStatus,
  OperatorSignature,
  SimulationConfig,
  TelemetryPayload,
  TelemetryResponse,
} from './types'
import { Validator } from './validator'
import { ManifestGenerator, AuditTrailBuilder, ComplianceReporter } from './manifest'
import {
  CryptoUtils,
  Logger,
  TimeUtils,
  RetryUtils,
} from './utils'

/**
 * Main Instrument Adapter SDK
 * Handles device registration, telemetry ingestion, and command dispatch
 */
export class InstrumentAdapter {
  private config: AdapterConfig
  private logger: Logger
  private httpClient: AxiosInstance
  private devices: Map<string, DeviceMetadata> = new Map()
  private deviceStatus: Map<string, DeviceStatus> = new Map()
  private commandHistory: CommandResult[] = []

  constructor(config: AdapterConfig) {
    // Validate configuration
    Validator.validateAdapterConfig(config)

    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      logLevel: 'info',
      enableMetrics: false,
      ...config,
    }

    this.logger = new Logger('InstrumentAdapter')

    // Setup HTTP client for platform communication
    this.httpClient = axios.create({
      baseURL: this.config.platformUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'newgen-adapter-sdk/1.0',
      },
    })

    this.logger.info('Adapter initialized', {
      operatorId: this.config.operatorId,
      platform: this.config.platformUrl,
    })
  }

  /**
   * Register a new device with the adapter
   */
  registerDevice(metadata: DeviceMetadata): void {
    this.logger.debug('Registering device', metadata)

    // Validate metadata
    const validated = Validator.validateDeviceMetadata(metadata)

    // Store device
    this.devices.set(validated.deviceId, validated)

    // Initialize device status
    this.deviceStatus.set(validated.deviceId, {
      deviceId: validated.deviceId,
      isOnline: false,
      healthScore: 0,
      lastTelemetry: TimeUtils.now(),
      activeOperations: [],
      errorCount: 0,
      uptime: 0,
      metadata: validated,
    })

    this.logger.info(`Device registered: ${validated.deviceId}`, {
      vendor: validated.vendorName,
      model: validated.modelNumber,
    })
  }

  /**
   * Ingest telemetry from a device (with retry logic)
   */
  async pushTelemetry(
    deviceId: string,
    streamName: string,
    payload: TelemetryPayload
  ): Promise<TelemetryResponse> {
    // Validate device exists
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device not registered: ${deviceId}`)
    }

    // Validate telemetry
    const validated = Validator.validateTelemetryPayload(payload)

    // Send to platform with retry logic
    const response = await RetryUtils.retry(
      async () => {
        return this.httpClient.post('/api/telemetry/ingest', {
          deviceId,
          streamName,
          payload: validated,
          timestamp: TimeUtils.now(),
        })
      },
      this.config.retryAttempts
    )

    // Update device status
    const status = this.deviceStatus.get(deviceId)
    if (status) {
      status.lastTelemetry = TimeUtils.now()
      status.isOnline = true
    }

    this.logger.debug(`Telemetry ingested: ${deviceId}/${streamName}`)

    return {
      recordId: uuidv4(),
      deviceId,
      timestamp: TimeUtils.now(),
      received: true,
    }
  }

  /**
   * Send a command to a device (requires operator e-signature)
   */
  async sendCommand(
    deviceId: string,
    commandName: string,
    params: Record<string, unknown>,
    operatorSignature: OperatorSignature
  ): Promise<CommandResult> {
    // Validate device exists
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device not registered: ${deviceId}`)
    }

    // Validate operator signature
    Validator.validateOperatorSignature(operatorSignature)

    // Verify signature timestamp is recent (prevent replay attacks)
    if (!TimeUtils.isValidTimestamp(operatorSignature.timestamp.toISOString())) {
      throw new Error('Operator signature timestamp is too old (potential replay attack)')
    }

    const commandId = uuidv4()
    const auditTrail = new AuditTrailBuilder()

    try {
      // Start audit trail
      auditTrail.addEvent('command_queued', { commandId }, deviceId)

      // Record operator signature
      auditTrail.addEvent(
        'operator_signature_captured',
        {
          operatorId: operatorSignature.operatorId,
          algorithm: operatorSignature.signingAlgorithm,
        },
        operatorSignature.operatorId
      )

      // Compute command hash
      const commandHash = CryptoUtils.commandHash(deviceId, commandName, params)

      // Send to platform
      auditTrail.addEvent('platform_transmission_initiated', { commandId }, this.config.operatorId)

      const response = await RetryUtils.retry(
        async () => {
          return this.httpClient.post('/api/commands/execute', {
            commandId,
            deviceId,
            commandName,
            params,
            operatorSignature: {
              operatorId: operatorSignature.operatorId,
              operatorName: operatorSignature.operatorName,
              timestamp: operatorSignature.timestamp.toISOString(),
            },
            commandHash,
          })
        },
        this.config.retryAttempts
      )

      auditTrail.addEvent('device_acknowledged', { status: response.data?.status }, deviceId)

      // Generate manifest
      const manifest = ManifestGenerator.generateCommandManifest({
        deviceId,
        commandName,
        commandParams: params,
        operatorSignature,
        status: 'SUCCESS',
        auditTrail: auditTrail.getEvents(),
      })

      auditTrail.addEvent('manifest_generated', { manifestId: manifest.manifestId })

      const result: CommandResult = {
        commandId,
        deviceId,
        commandName,
        status: 'SUCCESS',
        result: response.data?.result,
        executionTimeMs: Date.now(),
        manifest,
        auditTrail: auditTrail.getEvents(),
      }

      // Store command in history
      this.commandHistory.push(result)

      // Update device status
      const status = this.deviceStatus.get(deviceId)
      if (status) {
        status.activeOperations = status.activeOperations.filter((op) => op !== commandId)
      }

      this.logger.info(`Command executed: ${commandId} on ${deviceId}/${commandName}`, {
        operatorId: operatorSignature.operatorId,
        status: 'SUCCESS',
      })

      return result
    } catch (error) {
      // Handle failure
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      auditTrail.addEvent('command_failed', { error: errorMessage })

      const manifest = ManifestGenerator.generateCommandManifest({
        deviceId,
        commandName,
        commandParams: params,
        operatorSignature,
        status: 'FAILURE',
        error: errorMessage,
        auditTrail: auditTrail.getEvents(),
      })

      const result: CommandResult = {
        commandId,
        deviceId,
        commandName,
        status: 'FAILURE',
        error: errorMessage,
        manifest,
        auditTrail: auditTrail.getEvents(),
      }

      // Store command in history
      this.commandHistory.push(result)

      // Update device status
      const status = this.deviceStatus.get(deviceId)
      if (status) {
        status.errorCount++
        status.activeOperations = status.activeOperations.filter((op) => op !== commandId)
      }

      this.logger.error(`Command failed: ${commandId} on ${deviceId}/${commandName}`, error as Error)

      return result
    }
  }

  /**
   * Get current device status
   */
  getDeviceStatus(deviceId: string): DeviceStatus {
    const status = this.deviceStatus.get(deviceId)
    if (!status) {
      throw new Error(`Device not found: ${deviceId}`)
    }
    return { ...status }
  }

  /**
   * Get all registered devices
   */
  listDevices(): DeviceMetadata[] {
    return Array.from(this.devices.values())
  }

  /**
   * Get command history with filtering
   */
  getCommandHistory(filter?: { deviceId?: string; status?: string }): CommandResult[] {
    return this.commandHistory.filter((cmd) => {
      if (filter?.deviceId && cmd.deviceId !== filter.deviceId) return false
      if (filter?.status && cmd.status !== filter.status) return false
      return true
    })
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(): Record<string, unknown> {
    return ComplianceReporter.generateCommandSummary(this.commandHistory)
  }

  /**
   * Run simulation test (for CI/CD validation)
   */
  async runSim(deviceId: string, simConfig: SimulationConfig): Promise<void> {
    // Validate config
    const validated = Validator.validateSimulationConfig(simConfig)

    this.logger.info(`Starting simulation for ${deviceId}`, validated)

    // Simulate telemetry ingestion
    const startTime = Date.now()
    const duration = validated.duration
    const interval = validated.telemetryInterval

    while (Date.now() - startTime < duration) {
      try {
        // Simulate telemetry based on device type
        const deviceMeta = this.devices.get(deviceId)
        if (!deviceMeta) break

        // Ingest sample telemetry
        for (const stream of deviceMeta.telemetryStreams) {
          await this.pushTelemetry(deviceId, stream, {
            value: Math.random() * 100,
            unit: '%',
            timestamp: new Date(),
            sensorId: `SENSOR-${stream.toUpperCase()}`,
          })
        }

        // Simulate command execution
        if (Math.random() > 0.7 && validated.failureMode !== 'command_rejected') {
          const mockOperatorSig: OperatorSignature = {
            operatorId: this.config.operatorId,
            signature: CryptoUtils.generateNonce(),
            timestamp: new Date(),
          }

          await this.sendCommand(deviceId, 'test_command', { test: true }, mockOperatorSig)
        }

        await new Promise((resolve) => setTimeout(resolve, interval))
      } catch (error) {
        this.logger.debug(`Simulation error: ${error instanceof Error ? error.message : 'unknown'}`)
      }
    }

    this.logger.info(`Simulation completed for ${deviceId}`)
  }
}

/**
 * Export main adapter class
 */
export default InstrumentAdapter
