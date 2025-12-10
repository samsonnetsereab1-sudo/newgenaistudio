import Joi from 'joi'
import { ValidationUtils } from './utils'
import {
  DeviceMetadata,
  TelemetryPayload,
  OperatorSignature,
  TelemetryStream,
  AdapterConfig,
  SimulationConfig,
} from './types'

/**
 * Validation schemas for strict type-checking at runtime
 */
export class Validator {
  /**
   * Schema for device metadata
   */
  static readonly DEVICE_METADATA_SCHEMA = Joi.object({
    deviceId: Joi.string().regex(/^[A-Z0-9\-]+$/).required(),
    vendorName: Joi.string().min(2).max(100).required(),
    modelNumber: Joi.string().min(2).max(50).required(),
    serialNumber: Joi.string().min(2).max(50).required(),
    capabilities: Joi.array().items(Joi.string()).min(1).required(),
    telemetryStreams: Joi.array().items(Joi.string()).required(),
    commandTypes: Joi.array().items(Joi.string()).optional(),
    location: Joi.string().max(200).optional(),
    maintenanceWindow: Joi.object({
      dayOfWeek: Joi.string()
        .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
        .required(),
      startHour: Joi.number().integer().min(0).max(23).required(),
      endHour: Joi.number().integer().min(0).max(23).required(),
    }).optional(),
  }).strict()

  /**
   * Schema for telemetry payload
   */
  static readonly TELEMETRY_PAYLOAD_SCHEMA = Joi.object({
    value: Joi.alternatives()
      .try(
        Joi.number(),
        Joi.string(),
        Joi.boolean(),
        Joi.object()
      )
      .required(),
    unit: Joi.string().max(50).optional(),
    timestamp: Joi.date().required(),
    sensorId: Joi.string().max(100).optional(),
    confidence: Joi.number().min(0).max(1).optional(),
    derivedFrom: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object().optional(),
  }).strict()

  /**
   * Schema for operator signature
   */
  static readonly OPERATOR_SIGNATURE_SCHEMA = Joi.object({
    operatorId: Joi.string().regex(/^[A-Z0-9\-]+$/).required(),
    operatorName: Joi.string().max(100).optional(),
    signature: Joi.string().min(100).required(), // Base64-encoded sig
    timestamp: Joi.date().required(),
    reason: Joi.string().max(500).optional(),
    signingAlgorithm: Joi.string()
      .valid('RSA-PSS-SHA256', 'ECDSA-SHA256')
      .optional(),
    certificatePEM: Joi.string().optional(),
  }).strict()

  /**
   * Schema for telemetry stream definition
   */
  static readonly TELEMETRY_STREAM_SCHEMA = Joi.object({
    streamName: Joi.string().regex(/^[a-z_]+$/).required(),
    dataType: Joi.string()
      .valid('numeric', 'string', 'boolean', 'json')
      .required(),
    unit: Joi.string().max(50).optional(),
    minValue: Joi.number().optional(),
    maxValue: Joi.number().optional(),
    allowedValues: Joi.array()
      .items(Joi.alternatives().try(Joi.string(), Joi.number()))
      .optional(),
  }).strict()

  /**
   * Schema for adapter config
   */
  static readonly ADAPTER_CONFIG_SCHEMA = Joi.object({
    platformUrl: Joi.string().uri().required(),
    apiKey: Joi.string().min(20).required(),
    operatorId: Joi.string().regex(/^[A-Z0-9\-]+$/).required(),
    operatorName: Joi.string().max(100).optional(),
    timeout: Joi.number().integer().min(100).max(300000).optional(),
    retryAttempts: Joi.number().integer().min(1).max(10).optional(),
    logLevel: Joi.string().valid('debug', 'info', 'warn', 'error').optional(),
    enableMetrics: Joi.boolean().optional(),
  }).strict()

  /**
   * Schema for simulation config
   */
  static readonly SIMULATION_CONFIG_SCHEMA = Joi.object({
    duration: Joi.number().integer().min(1000).required(),
    telemetryInterval: Joi.number().integer().min(100).required(),
    failureMode: Joi.string()
      .valid('none', 'sensor_drift', 'communication_timeout', 'command_rejected')
      .optional(),
    failureRate: Joi.number().min(0).max(1).optional(),
  }).strict()

  /**
   * Validate device metadata
   */
  static validateDeviceMetadata(data: unknown): DeviceMetadata {
    return ValidationUtils.validate<DeviceMetadata>(
      data,
      this.DEVICE_METADATA_SCHEMA,
      'DeviceMetadata'
    )
  }

  /**
   * Validate telemetry payload
   */
  static validateTelemetryPayload(data: unknown): TelemetryPayload {
    return ValidationUtils.validate<TelemetryPayload>(
      data,
      this.TELEMETRY_PAYLOAD_SCHEMA,
      'TelemetryPayload'
    )
  }

  /**
   * Validate operator signature
   */
  static validateOperatorSignature(data: unknown): OperatorSignature {
    return ValidationUtils.validate<OperatorSignature>(
      data,
      this.OPERATOR_SIGNATURE_SCHEMA,
      'OperatorSignature'
    )
  }

  /**
   * Validate telemetry stream definition
   */
  static validateTelemetryStream(data: unknown): TelemetryStream {
    return ValidationUtils.validate<TelemetryStream>(
      data,
      this.TELEMETRY_STREAM_SCHEMA,
      'TelemetryStream'
    )
  }

  /**
   * Validate adapter config
   */
  static validateAdapterConfig(data: unknown): void {
    ValidationUtils.validate<AdapterConfig>(
      data,
      this.ADAPTER_CONFIG_SCHEMA,
      'AdapterConfig'
    )
  }

  /**
   * Validate simulation config
   */
  static validateSimulationConfig(data: unknown): SimulationConfig {
    return ValidationUtils.validate<SimulationConfig>(
      data,
      this.SIMULATION_CONFIG_SCHEMA,
      'SimulationConfig'
    )
  }

  /**
   * Validate telemetry payload against stream definition
   */
  static validateTelemetryAgainstStream(
    payload: TelemetryPayload,
    stream: TelemetryStream
  ): boolean {
    // Type check
    const valueType = typeof payload.value
    if (stream.dataType === 'numeric' && valueType !== 'number') {
      return false
    }
    if (stream.dataType === 'string' && valueType !== 'string') {
      return false
    }
    if (stream.dataType === 'boolean' && valueType !== 'boolean') {
      return false
    }

    // Range check
    if (stream.dataType === 'numeric' && typeof payload.value === 'number') {
      if (stream.minValue !== undefined && payload.value < stream.minValue) {
        return false
      }
      if (stream.maxValue !== undefined && payload.value > stream.maxValue) {
        return false
      }
    }

    // Allowed values check
    if (stream.allowedValues !== undefined) {
      if (!stream.allowedValues.includes(payload.value as any)) {
        return false
      }
    }

    return true
  }
}
