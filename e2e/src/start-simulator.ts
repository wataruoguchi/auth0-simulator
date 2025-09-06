#!/usr/bin/env node

import { startAuth0Simulator } from './auth0-simulator.js'

async function main() {
  try {
    const url = await startAuth0Simulator()
    console.log(`\n🚀 Auth0 Simulator is running at ${url}`)
    console.log('Press Ctrl+C to stop the simulator')
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping Auth0 Simulator...')
      process.exit(0)
    })
    
    // Keep alive
    setInterval(() => {}, 1000)
  } catch (error) {
    console.error('Failed to start Auth0 Simulator:', error)
    process.exit(1)
  }
}

main()
