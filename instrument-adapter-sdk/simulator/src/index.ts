import { SimulatorOPCServer } from './server'

/**
 * Entry point for OPC-UA simulator
 */
async function main() {
  const server = new SimulatorOPCServer()

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n[Simulator] Shutting down...')
    await server.stop()
    process.exit(0)
  })

  try {
    await server.start()
    console.log('[Simulator] Ready for connections')
  } catch (error) {
    console.error('[Simulator] Fatal error:', error)
    process.exit(1)
  }
}

main()
