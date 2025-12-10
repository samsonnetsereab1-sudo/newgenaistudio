import { VirtualFermentor, VirtualCellSorter } from './devices'

/**
 * OPC-UA device state publisher
 * Continuously updates device state variables for telemetry
 */
export class DeviceStatePublisher {
  private fermentor: VirtualFermentor
  private sorter: VirtualCellSorter
  private updateInterval: NodeJS.Timer | null = null
  private updateFrequency: number = 5000 // milliseconds

  constructor() {
    this.fermentor = new VirtualFermentor('FERM-001')
    this.sorter = new VirtualCellSorter('SORTER-001')
  }

  /**
   * Start publishing device telemetry
   */
  start(frequencyMs: number = 5000): void {
    this.updateFrequency = frequencyMs

    this.updateInterval = setInterval(() => {
      this.fermentor.updateTelemetry()
      this.sorter.updateTelemetry()
    }, frequencyMs)

    console.log(
      `[Publisher] Started publishing device state every ${frequencyMs}ms`
    )
  }

  /**
   * Stop publishing
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    console.log('[Publisher] Stopped publishing device state')
  }

  /**
   * Get fermentor reference
   */
  getFermentor(): VirtualFermentor {
    return this.fermentor
  }

  /**
   * Get sorter reference
   */
  getSorter(): VirtualCellSorter {
    return this.sorter
  }
}

/**
 * Telemetry formatter for OPC-UA node values
 */
export class TelemetryFormatter {
  /**
   * Create numeric variant for OPC-UA
   */
  static numeric(value: number) {
    return {
      dataType: 'Double',
      value,
    }
  }

  /**
   * Create string variant for OPC-UA
   */
  static string(value: string) {
    return {
      dataType: 'String',
      value,
    }
  }

  /**
   * Create boolean variant for OPC-UA
   */
  static boolean(value: boolean) {
    return {
      dataType: 'Boolean',
      value,
    }
  }

  /**
   * Create timestamp variant
   */
  static timestamp(date: Date) {
    return {
      dataType: 'DateTime',
      value: date,
    }
  }
}
