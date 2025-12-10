import {
  OPCUAServer,
  Variant,
  DataType,
  StatusCodes,
  AttributeIds,
  makeNodeId,
  coerceNodeId,
} from 'node-opcua'

/**
 * Virtual fermentor device simulator
 * Exposes telemetry nodes and control methods
 */
export class VirtualFermentor {
  private deviceId: string
  private volume: number = 1.0 // liters
  private temperature: number = 37 // celsius
  private pH: number = 7.0
  private dissolvedOxygen: number = 50 // percent saturation
  private agitationRpm: number = 500
  private aerationVvm: number = 1.0
  private biomass: number = 1.0 // g/L
  private isRunning: boolean = false
  private startTime: number = 0

  constructor(deviceId: string = 'FERM-001') {
    this.deviceId = deviceId
  }

  /**
   * Get current device state
   */
  getState() {
    return {
      deviceId: this.deviceId,
      volume: this.volume,
      temperature: this.temperature,
      pH: this.pH,
      dissolvedOxygen: this.dissolvedOxygen,
      agitationRpm: this.agitationRpm,
      aerationVvm: this.aerationVvm,
      biomass: this.biomass,
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
    }
  }

  /**
   * Start fermentation
   */
  startFermentation(): boolean {
    if (this.isRunning) return false
    this.isRunning = true
    this.startTime = Date.now()
    this.biomass = 0.5 // Reset biomass on start
    return true
  }

  /**
   * Stop fermentation
   */
  stopFermentation(): boolean {
    if (!this.isRunning) return false
    this.isRunning = false
    return true
  }

  /**
   * Set temperature setpoint
   */
  setTemperature(target: number): boolean {
    if (target < 15 || target > 45) return false
    this.temperature = target
    return true
  }

  /**
   * Simulate fermentation dynamics (Monod kinetics)
   */
  updateTelemetry(): void {
    if (!this.isRunning) return

    const uptime = (Date.now() - this.startTime) / 1000 // seconds
    const uMax = 0.6 // max specific growth rate (1/hour)
    const Ks = 1.0 // half-saturation constant (g/L)

    // Monod kinetics: μ = μ_max * S / (K_s + S)
    const substrate = Math.max(0, 20 - this.biomass * 2) // Simplified substrate
    const mu = (uMax * substrate) / (Ks + substrate)

    // Update biomass exponentially
    if (this.biomass < 15) {
      this.biomass += (mu / 3600) * this.biomass // Growth per second
    }

    // Update other parameters with small random perturbations
    this.pH += (Math.random() - 0.5) * 0.1
    this.pH = Math.max(6.5, Math.min(8.5, this.pH))

    this.dissolvedOxygen = Math.max(10, 70 - this.biomass * 3 + Math.random() * 10)
    this.temperature += (Math.random() - 0.5) * 0.5
  }
}

/**
 * Virtual cell sorter device simulator
 */
export class VirtualCellSorter {
  private deviceId: string
  private purity: number = 0 // percent
  private recovery: number = 0 // percent
  private eventsSorted: number = 0
  private currentPopulation: string = 'none'
  private isSorting: boolean = false
  private sortStartTime: number = 0

  constructor(deviceId: string = 'SORTER-001') {
    this.deviceId = deviceId
  }

  /**
   * Get current device state
   */
  getState() {
    return {
      deviceId: this.deviceId,
      purity: this.purity,
      recovery: this.recovery,
      eventsSorted: this.eventsSorted,
      currentPopulation: this.currentPopulation,
      isSorting: this.isSorting,
      uptime: this.isSorting ? Date.now() - this.sortStartTime : 0,
    }
  }

  /**
   * Start sorting
   */
  startSort(populationName?: string): boolean {
    if (this.isSorting) return false
    this.isSorting = true
    this.sortStartTime = Date.now()
    this.currentPopulation = populationName || 'CD4+'
    this.purity = 40 // Start low, increase during sort
    this.recovery = 50
    this.eventsSorted = 0
    return true
  }

  /**
   * Stop sorting
   */
  stopSort(): boolean {
    if (!this.isSorting) return false
    this.isSorting = false
    return true
  }

  /**
   * Set sorting gate (filter)
   */
  setGate(populationName: string): boolean {
    if (this.isSorting) return false // Cannot change gate while sorting
    this.currentPopulation = populationName
    return true
  }

  /**
   * Update telemetry during sort
   */
  updateTelemetry(): void {
    if (!this.isSorting) return

    const elapsedSeconds = (Date.now() - this.sortStartTime) / 1000
    const maxDuration = 300 // 5 minutes max sort

    if (elapsedSeconds > maxDuration) {
      this.isSorting = false
      return
    }

    // Purity increases over time (asymptotic)
    const maxPurity = 95
    this.purity = maxPurity * (1 - Math.exp(-0.01 * elapsedSeconds))

    // Recovery decreases slightly as purity increases
    this.recovery = Math.max(60, 95 - this.purity * 0.3 + Math.random() * 5)

    // Events increase linearly
    this.eventsSorted = Math.floor(elapsedSeconds * 1000) // ~1000 events/sec
  }
}
