import { OPCUAServer, coerceNodeId, makeNodeId, DataType, StatusCodes } from 'node-opcua'
import { DeviceStatePublisher, TelemetryFormatter } from './telemetry'

/**
 * OPC-UA server for device simulation
 * Exposes virtual devices with telemetry nodes and command methods
 */
export class SimulatorOPCServer {
  private server: OPCUAServer
  private publisher: DeviceStatePublisher
  private isRunning: boolean = false

  constructor() {
    this.server = new OPCUAServer({
      port: 4334,
      nodeset_filename: [],
      buildInfo: {
        productName: 'NewGen Studio Device Simulator',
        productUri: 'https://newgenstudio.com/simulator',
        manufacturerName: 'NewGen Studio',
        softwareVersion: '1.0.0-alpha',
      },
    })

    this.publisher = new DeviceStatePublisher()
  }

  /**
   * Start the OPC-UA server and register devices
   */
  async start(): Promise<void> {
    try {
      // Initialize server
      await this.server.initialize()
      console.log('[OPC-UA] Server initialized')

      // Setup namespace
      const addressSpace = this.server.engine.addressSpace
      const rootFolder = addressSpace.rootFolder

      // Create NewGen folder
      const newgenFolder = addressSpace.addFolder(rootFolder.objects, {
        browsingName: 'NewGen',
        displayName: 'NewGen Studio',
      })

      // Create Devices folder
      const devicesFolder = addressSpace.addFolder(newgenFolder, {
        browsingName: 'Devices',
        displayName: 'Virtual Devices',
      })

      // Setup fermentor device
      this.setupFermentorDevice(addressSpace, devicesFolder)

      // Setup sorter device
      this.setupSorterDevice(addressSpace, devicesFolder)

      // Create Methods folder
      const methodsFolder = addressSpace.addFolder(newgenFolder, {
        browsingName: 'Methods',
        displayName: 'Device Methods',
      })

      // Setup command methods
      this.setupCommandMethods(addressSpace, methodsFolder)

      // Start server
      await this.server.start()
      this.isRunning = true

      console.log('[OPC-UA] Server started on opc.tcp://localhost:4334/UA/NewGenSimulator')
      console.log('[Device] Registered virtual fermentor: FERM-001')
      console.log('[Device] Registered virtual sorter: SORTER-001')

      // Start telemetry publisher
      this.publisher.start(5000)
      console.log('[Telemetry] Publishing fermentor state every 5s')
    } catch (error) {
      console.error('[OPC-UA] Server startup failed:', error)
      throw error
    }
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return

    try {
      this.publisher.stop()
      await this.server.shutdown()
      this.isRunning = false
      console.log('[OPC-UA] Server stopped')
    } catch (error) {
      console.error('[OPC-UA] Server shutdown failed:', error)
      throw error
    }
  }

  /**
   * Setup fermentor device nodes
   */
  private setupFermentorDevice(addressSpace: any, parent: any): void {
    const fermentor = this.publisher.getFermentor()

    const fermentorFolder = addressSpace.addFolder(parent, {
      browsingName: 'FERM-001',
      displayName: 'Virtual Fermentor (Sartorius BIOSTAT B-DCU)',
    })

    // Telemetry nodes
    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'Volume',
      displayName: 'Volume (L)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: fermentor.getState().volume,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'Temperature',
      displayName: 'Temperature (°C)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: fermentor.getState().temperature,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'pH',
      displayName: 'pH (units)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: fermentor.getState().pH,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'DissolvedOxygen',
      displayName: 'Dissolved Oxygen (% saturation)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: fermentor.getState().dissolvedOxygen,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'AgitationRPM',
      displayName: 'Agitation (RPM)',
      dataType: 'Int32',
      value: {
        get: () => ({
          dataType: DataType.Int32,
          value: fermentor.getState().agitationRpm,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'AerationVVM',
      displayName: 'Aeration (vvm)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: fermentor.getState().aerationVvm,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'Biomass',
      displayName: 'Biomass Concentration (g/L)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: fermentor.getState().biomass,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: fermentorFolder,
      browseName: 'IsRunning',
      displayName: 'Fermentation Running',
      dataType: 'Boolean',
      value: {
        get: () => ({
          dataType: DataType.Boolean,
          value: fermentor.getState().isRunning,
        }),
      },
    })
  }

  /**
   * Setup sorter device nodes
   */
  private setupSorterDevice(addressSpace: any, parent: any): void {
    const sorter = this.publisher.getSorter()

    const sorterFolder = addressSpace.addFolder(parent, {
      browsingName: 'SORTER-001',
      displayName: 'Virtual Cell Sorter (BD FACSAria)',
    })

    // Telemetry nodes
    addressSpace.addVariable({
      componentOf: sorterFolder,
      browseName: 'Purity',
      displayName: 'Sort Purity (%)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: sorter.getState().purity,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: sorterFolder,
      browseName: 'Recovery',
      displayName: 'Recovery (%)',
      dataType: 'Double',
      value: {
        get: () => ({
          dataType: DataType.Double,
          value: sorter.getState().recovery,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: sorterFolder,
      browseName: 'EventsSorted',
      displayName: 'Events Sorted',
      dataType: 'Int64',
      value: {
        get: () => ({
          dataType: DataType.Int64,
          value: sorter.getState().eventsSorted,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: sorterFolder,
      browseName: 'CurrentPopulation',
      displayName: 'Current Population',
      dataType: 'String',
      value: {
        get: () => ({
          dataType: DataType.String,
          value: sorter.getState().currentPopulation,
        }),
      },
    })

    addressSpace.addVariable({
      componentOf: sorterFolder,
      browseName: 'IsSorting',
      displayName: 'Sorting Active',
      dataType: 'Boolean',
      value: {
        get: () => ({
          dataType: DataType.Boolean,
          value: sorter.getState().isSorting,
        }),
      },
    })
  }

  /**
   * Setup RPC command methods
   */
  private setupCommandMethods(addressSpace: any, parent: any): void {
    const fermentor = this.publisher.getFermentor()
    const sorter = this.publisher.getSorter()

    // Fermentor methods
    const startFermMethod = addressSpace.addMethod(parent, {
      browseName: 'StartFermentation',
      description: { text: 'Start fermentation cycle' },
    })

    startFermMethod.bindMethod((inputArguments: any[], context: any, callback: any) => {
      const result = fermentor.startFermentation()
      callback(null, {
        statusCode: result ? StatusCodes.Good : StatusCodes.BadRequest,
        outputArguments: [{ dataType: DataType.Boolean, value: result }],
      })
    })

    const stopFermMethod = addressSpace.addMethod(parent, {
      browseName: 'StopFermentation',
      description: { text: 'Stop fermentation cycle' },
    })

    stopFermMethod.bindMethod((inputArguments: any[], context: any, callback: any) => {
      const result = fermentor.stopFermentation()
      callback(null, {
        statusCode: result ? StatusCodes.Good : StatusCodes.BadRequest,
        outputArguments: [{ dataType: DataType.Boolean, value: result }],
      })
    })

    // Sorter methods
    const startSortMethod = addressSpace.addMethod(parent, {
      browseName: 'StartSort',
      description: { text: 'Start cell sorting operation' },
      inputArguments: [
        {
          name: 'populationName',
          description: { text: 'Name of cell population to sort' },
          dataType: 'String',
        },
      ],
    })

    startSortMethod.bindMethod((inputArguments: any[], context: any, callback: any) => {
      const populationName = inputArguments[0]?.value || 'default'
      const result = sorter.startSort(populationName)
      callback(null, {
        statusCode: result ? StatusCodes.Good : StatusCodes.BadRequest,
        outputArguments: [{ dataType: DataType.Boolean, value: result }],
      })
    })

    const stopSortMethod = addressSpace.addMethod(parent, {
      browseName: 'StopSort',
      description: { text: 'Stop cell sorting operation' },
    })

    stopSortMethod.bindMethod((inputArguments: any[], context: any, callback: any) => {
      const result = sorter.stopSort()
      callback(null, {
        statusCode: result ? StatusCodes.Good : StatusCodes.BadRequest,
        outputArguments: [{ dataType: DataType.Boolean, value: result }],
      })
    })
  }
}
