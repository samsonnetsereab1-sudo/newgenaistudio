import { CryptoUtils, ManifestUtils, TimeUtils } from './utils'
import {
  AuditEvent,
  CommandManifest,
  CommandResult,
  OperatorSignature,
  TelemetryResponse,
} from './types'

/**
 * Manifest generation and management
 * Ensures FDA 21 CFR Part 11 compliance with signed audit trails
 */
export class ManifestGenerator {
  /**
   * Generate a signed command manifest for BPR inclusion
   */
  static generateCommandManifest(data: {
    deviceId: string
    commandName: string
    commandParams: Record<string, unknown>
    operatorSignature: OperatorSignature
    status: 'SUCCESS' | 'FAILURE'
    error?: string
    auditTrail: AuditEvent[]
  }): CommandManifest {
    const commandHash = CryptoUtils.commandHash(
      data.deviceId,
      data.commandName,
      data.commandParams
    )

    const manifestId = ManifestUtils.generateManifestId()

    return {
      manifestId,
      timestamp: TimeUtils.now(),
      deviceId: data.deviceId,
      commandName: data.commandName,
      operatorId: data.operatorSignature.operatorId,
      operatorName: data.operatorSignature.operatorName || 'Unknown',
      status: data.status,
      commandHash,
      signatureAlgorithm: data.operatorSignature.signingAlgorithm || 'RSA-PSS-SHA256',
      signature: data.operatorSignature.signature,
      paramsSnapshot: data.commandParams,
      errorDetails: data.error,
      auditTrail: data.auditTrail,
      complianceFrameworks: [
        'FDA-21CFR-Part11',
        'ICH-Q7',
        'ALCOA+',
      ],
    }
  }

  /**
   * Convert manifest to JSON for storage/transmission
   */
  static manifestToJSON(manifest: CommandManifest): string {
    return JSON.stringify(manifest, null, 2)
  }

  /**
   * Verify manifest integrity (check if hash matches snapshot)
   */
  static verifyManifestIntegrity(manifest: CommandManifest): boolean {
    const recomputedHash = CryptoUtils.commandHash(
      manifest.deviceId,
      manifest.commandName,
      manifest.paramsSnapshot
    )
    return recomputedHash === manifest.commandHash
  }

  /**
   * Convert CommandResult to exportable format (for BPR)
   */
  static commandResultToManifest(result: CommandResult): CommandManifest {
    if (!result.manifest) {
      throw new Error('CommandResult does not contain manifest')
    }
    return result.manifest
  }

  /**
   * Create telemetry manifest for batch ingestion
   */
  static generateTelemetryManifest(data: {
    deviceId: string
    streamName: string
    recordCount: number
    hash: string
    timestamp: string
  }): Record<string, unknown> {
    return {
      manifest_id: ManifestUtils.generateManifestId(),
      timestamp: data.timestamp,
      device_id: data.deviceId,
      stream_name: data.streamName,
      record_count: data.recordCount,
      batch_hash: data.hash,
      compliance_frameworks: [
        'FDA-21CFR-Part11',
        'ALCOA+',
      ],
    }
  }
}

/**
 * Audit trail builder for immutable event logging
 */
export class AuditTrailBuilder {
  private events: AuditEvent[] = []

  /**
   * Add an event to the trail
   */
  addEvent(event: string, details?: Record<string, unknown>, actorId?: string): this {
    this.events.push({
      event,
      timestamp: TimeUtils.now(),
      details,
      actorId,
    })
    return this
  }

  /**
   * Get all events
   */
  getEvents(): AuditEvent[] {
    return [...this.events]
  }

  /**
   * Get audit trail as JSON string
   */
  toString(): string {
    return JSON.stringify(this.events, null, 2)
  }

  /**
   * Clear trail (use with caution)
   */
  clear(): this {
    this.events = []
    return this
  }

  /**
   * Get trail length
   */
  length(): number {
    return this.events.length
  }
}

/**
 * FDA compliance report generator
 */
export class ComplianceReporter {
  /**
   * Generate summary of all commands executed with operator signatures
   */
  static generateCommandSummary(commands: CommandResult[]): Record<string, unknown> {
    const successCount = commands.filter((c) => c.status === 'SUCCESS').length
    const failureCount = commands.filter((c) => c.status === 'FAILURE').length
    const uniqueOperators = new Set(
      commands
        .flatMap((c) => c.auditTrail)
        .filter((e) => e.actorId)
        .map((e) => e.actorId)
    )

    return {
      summary: {
        total_commands: commands.length,
        successful: successCount,
        failed: failureCount,
        success_rate: (successCount / commands.length * 100).toFixed(2) + '%',
      },
      operators_involved: Array.from(uniqueOperators),
      manifests: commands
        .filter((c) => c.manifest)
        .map((c) => ({
          manifest_id: c.manifest?.manifestId,
          command_id: c.commandId,
          status: c.status,
          timestamp: c.manifest?.timestamp,
        })),
    }
  }

  /**
   * Check 21 CFR Part 11 compliance
   */
  static validateCompliance(manifest: CommandManifest): {
    compliant: boolean
    issues: string[]
  } {
    const issues: string[] = []

    // Check required fields
    if (!manifest.manifestId) issues.push('Missing manifest ID')
    if (!manifest.timestamp) issues.push('Missing timestamp')
    if (!manifest.operatorId) issues.push('Missing operator ID')
    if (!manifest.signature) issues.push('Missing digital signature')
    if (!manifest.commandHash) issues.push('Missing command hash')

    // Check timestamp validity
    if (!TimeUtils.isValidTimestamp(manifest.timestamp)) {
      issues.push('Timestamp outside acceptable range (clock skew detected)')
    }

    // Check audit trail
    if (!manifest.auditTrail || manifest.auditTrail.length === 0) {
      issues.push('Missing audit trail')
    }

    // Check compliance frameworks listed
    if (!manifest.complianceFrameworks || manifest.complianceFrameworks.length === 0) {
      issues.push('No compliance frameworks specified')
    }

    return {
      compliant: issues.length === 0,
      issues,
    }
  }
}
