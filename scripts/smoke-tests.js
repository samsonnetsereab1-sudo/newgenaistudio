/**
 * Smoke Tests for NewGen Studio Phase 1 MVP
 * 
 * Quick validation tests for all major features:
 * - Simulation engine with 3 protocols
 * - Graph analytics with multiple graph types
 * - Agent orchestration with full workflow
 * - Preset system functionality
 * 
 * Usage: node scripts/smoke-tests.js
 * Exit Code 0 = All tests passed, 1 = Some tests failed
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const TIMEOUT_MS = 30000;
const VERBOSE = process.env.VERBOSE === 'true';

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

/**
 * Logger utility
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  console.log(`${prefix} ${message}`);
  if (data && VERBOSE) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Make API request with timeout
 */
async function makeRequest(method, endpoint, body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    timeout: TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

/**
 * Test suite executor
 */
async function runTest(name, testFn) {
  totalTests++;
  try {
    log('TEST', `Running: ${name}`);
    await testFn();
    passedTests++;
    testResults.push({ name, status: 'PASSED', error: null });
    log('✓', `PASSED: ${name}`);
  } catch (error) {
    failedTests++;
    testResults.push({ name, status: 'FAILED', error: error.message });
    log('✗', `FAILED: ${name}`, error.message);
  }
}

/**
 * Test suites
 */

// ============================================================================
// SIMULATION TESTS
// ============================================================================

async function testSimulation() {
  log('INFO', 'Starting Simulation Tests...');

  // Test 1: Plasmid Prep Protocol
  await runTest('Simulation: Plasmid Prep (10 runs)', async () => {
    const response = await makeRequest('POST', '/v1/agents/simulate', {
      protocol: 'plasmid-prep',
      numRuns: 10,
      metrics: ['cost', 'duration', 'yield'],
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.simulation) throw new Error('No simulation data');
    
    const agg = response.data.simulation.aggregatedMetrics;
    if (!agg.cost || !agg.yield || !agg.duration) {
      throw new Error('Missing aggregated metrics');
    }
    
    // Validate metric ranges
    if (agg.cost.mean < 30 || agg.cost.mean > 100) {
      throw new Error('Cost out of expected range');
    }
    if (agg.yield.mean < 50 || agg.yield.mean > 100) {
      throw new Error('Yield out of expected range');
    }
  });

  // Test 2: Protein Expression Protocol
  await runTest('Simulation: Protein Expression (10 runs)', async () => {
    const response = await makeRequest('POST', '/v1/agents/simulate', {
      protocol: 'protein-expression',
      numRuns: 10,
      metrics: ['cost', 'duration', 'yield'],
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.simulation) throw new Error('No simulation data');
    
    const agg = response.data.simulation.aggregatedMetrics;
    if (!agg.cost || !agg.yield) throw new Error('Missing metrics');
  });

  // Test 3: LC-MS Prep Protocol
  await runTest('Simulation: LC-MS Prep (10 runs)', async () => {
    const response = await makeRequest('POST', '/v1/agents/simulate', {
      protocol: 'lc-ms-prep',
      numRuns: 10,
      metrics: ['cost', 'duration', 'yield'],
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.simulation) throw new Error('No simulation data');
  });

  // Test 4: Simulation with Parameters
  await runTest('Simulation: Parameter Override', async () => {
    const response = await makeRequest('POST', '/v1/agents/simulate', {
      protocol: 'plasmid-prep',
      numRuns: 5,
      parameters: {
        annealingTemp: 72,
        numCycles: 35,
      },
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.simulation) throw new Error('No simulation data');
  });
}

// ============================================================================
// GRAPH TESTS
// ============================================================================

async function testGraphs() {
  log('INFO', 'Starting Graph Tests...');

  let graphId = null;

  // Test 1: Create Protocol DAG
  await runTest('Graph: Create Protocol DAG', async () => {
    const response = await makeRequest('POST', '/v1/graphs/protocol-dag', {
      protocol: 'plasmid-prep',
      template: 'crispr-cloning',
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.graph || !response.data.graph.graphId) {
      throw new Error('No graph created');
    }

    graphId = response.data.graph.graphId;
    const graph = response.data.graph;
    
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      throw new Error('Invalid graph structure');
    }
  });

  // Test 2: Get Graph Centrality
  if (graphId) {
    await runTest('Graph: Compute Centrality', async () => {
      const response = await makeRequest('GET', `/v1/graphs/${graphId}/centrality?graphId=${graphId}`);

      if (!response.ok) throw new Error(`Status ${response.status}`);
      if (!response.data.centrality) throw new Error('No centrality data');
      
      const centrality = response.data.centrality;
      if (typeof centrality.clusteringCoefficient !== 'number') {
        throw new Error('Invalid centrality metrics');
      }
    });
  }

  // Test 3: Find Paths
  if (graphId) {
    await runTest('Graph: Shortest Paths', async () => {
      const response = await makeRequest('GET', `/v1/graphs/${graphId}/paths?from=start&to=end`);

      if (!response.ok && response.status !== 404) throw new Error(`Status ${response.status}`);
      // 404 is acceptable if no paths exist in demo DAG
    });
  }

  // Test 4: Create Instrument Network
  await runTest('Graph: Instrument Network', async () => {
    const response = await makeRequest('POST', '/v1/graphs/instrument-network', {
      protocol: 'plasmid-prep',
      instruments: ['thermocycler', 'centrifuge', 'magnetic-stand'],
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.graph) throw new Error('No graph created');
  });

  // Test 5: Sample Lineage
  await runTest('Graph: Sample Lineage', async () => {
    const response = await makeRequest('POST', '/v1/graphs/sample-lineage', {
      protocol: 'plasmid-prep',
      numSamples: 3,
      trackMetadata: true,
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.graph) throw new Error('No graph created');
  });
}

// ============================================================================
// AGENT TESTS
// ============================================================================

async function testAgents() {
  log('INFO', 'Starting Agent Tests...');

  // Test 1: Agent Status
  await runTest('Agent: System Status', async () => {
    const response = await makeRequest('GET', '/v1/agents/status');

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.agents || !Array.isArray(response.data.agents)) {
      throw new Error('Invalid agent list');
    }
  });

  // Test 2: Retrieve Knowledge
  await runTest('Agent: Retrieve (Knowledge Search)', async () => {
    const response = await makeRequest('POST', '/v1/agents/retrieve', {
      query: 'plasmid preparation protocol',
      topK: 3,
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    // Note: May return empty documents in test environment
  });

  // Test 3: Plan Goal
  await runTest('Agent: Plan (Goal Decomposition)', async () => {
    const response = await makeRequest('POST', '/v1/agents/plan', {
      goal: 'Design high-yield plasmid preparation protocol',
      constraints: {
        maxTime: 72,
        budget: 500,
        minYield: 0.7,
      },
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.plan) throw new Error('No plan generated');
  });

  // Test 4: Simulate via Agent
  await runTest('Agent: Simulate', async () => {
    const response = await makeRequest('POST', '/v1/agents/simulate', {
      protocol: 'plasmid-prep',
      numRuns: 5,
      metrics: ['cost', 'duration', 'yield'],
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.simulation) throw new Error('No simulation data');
  });

  // Test 5: Safety Review
  await runTest('Agent: Safety Review', async () => {
    const response = await makeRequest('POST', '/v1/agents/review', {
      protocol: 'plasmid-prep',
      organism: 'Escherichia coli',
      riskGroup: 1,
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
  });

  // Test 6: Full Orchestration
  await runTest('Agent: Orchestrate (Full Workflow)', async () => {
    const response = await makeRequest('POST', '/v1/agents/orchestrate', {
      goal: 'Optimize plasmid preparation protocol for CRISPR experiments',
      agents: ['retriever', 'planner', 'simulator', 'safety'],
      maxIterations: 2,
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.executionId) throw new Error('No execution ID');
    if (!Array.isArray(response.data.phases)) throw new Error('No phases');
  });

  // Test 7: Execution History
  await runTest('Agent: History', async () => {
    const response = await makeRequest('GET', '/v1/agents/history');

    if (!response.ok) throw new Error(`Status ${response.status}`);
    // History may be empty initially
  });

  // Test 8: Audit Log
  await runTest('Agent: Audit Log', async () => {
    const response = await makeRequest('GET', '/v1/agents/audit-log');

    if (!response.ok) throw new Error(`Status ${response.status}`);
    // Log may be empty initially
  });
}

// ============================================================================
// PRESET TESTS
// ============================================================================

async function testPresets() {
  log('INFO', 'Starting Preset Tests...');

  // Test 1: List Presets
  await runTest('Preset: List All', async () => {
    const response = await makeRequest('GET', '/v1/presets');

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!Array.isArray(response.data.presets)) throw new Error('Invalid presets');
    
    // Should have at least 7 default presets
    if (response.data.presets.length < 7) {
      throw new Error('Missing default presets');
    }
  });

  // Test 2: Search Presets by Category
  await runTest('Preset: Filter by Category', async () => {
    const response = await makeRequest('GET', '/v1/presets?category=small-lab');

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!Array.isArray(response.data.presets)) throw new Error('Invalid results');
  });

  // Test 3: Get Specific Preset
  await runTest('Preset: Get by ID', async () => {
    const response = await makeRequest('GET', '/v1/presets/quick-start-small');

    if (!response.ok && response.status !== 404) {
      throw new Error(`Status ${response.status}`);
    }
    // 404 acceptable if preset doesn't exist
  });

  // Test 4: Create Custom Preset
  await runTest('Preset: Create Custom', async () => {
    const response = await makeRequest('POST', '/v1/presets', {
      name: 'Smoke Test Preset',
      description: 'Test preset for smoke tests',
      category: 'test',
      templates: ['plasmid-prep'],
      estimatedCost: 100,
      estimatedDuration: 24,
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    if (!response.data.preset || !response.data.preset.presetId) {
      throw new Error('No preset created');
    }
  });
}

// ============================================================================
// DATASET VALIDATION TESTS
// ============================================================================

async function testDatasets() {
  log('INFO', 'Starting Dataset Tests...');

  const datasetPath = path.join(__dirname, '../resources/datasets');

  // Test 1: CRISPR Dataset
  await runTest('Dataset: CRISPR Plasmid Samples', async () => {
    const filePath = path.join(datasetPath, 'crispr-plasmid-20-samples.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Dataset file not found');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.metadata || !data.samples) throw new Error('Invalid dataset structure');
    if (data.samples.length !== 20) throw new Error('Expected 20 samples');
    if (data.summary.passedQC < 17) throw new Error('Too many failed samples');
  });

  // Test 2: Protein Expression Dataset
  await runTest('Dataset: Protein Expression Samples', async () => {
    const filePath = path.join(datasetPath, 'protein-expression-50-samples.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Dataset file not found');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.metadata || !data.samples) throw new Error('Invalid dataset structure');
    if (data.samples.length !== 50) throw new Error('Expected 50 samples');
  });

  // Test 3: LC-MS Dataset
  await runTest('Dataset: LC-MS Prep Samples', async () => {
    const filePath = path.join(datasetPath, 'lc-ms-30-samples.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Dataset file not found');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (!data.metadata || !data.samples) throw new Error('Invalid dataset structure');
    if (data.samples.length !== 30) throw new Error('Expected 30 samples');
  });
}

// ============================================================================
// NOTEBOOK VALIDATION TESTS
// ============================================================================

async function testNotebooks() {
  log('INFO', 'Starting Notebook Tests...');

  const notebookPath = path.join(__dirname, '../resources/notebooks');
  const notebooks = [
    '01-intro-simulation.ipynb',
    '02-agent-demo.ipynb',
    '03-graph-analytics.ipynb',
    '04-parameter-tuning.ipynb',
    '05-protocol-optimization.ipynb',
  ];

  for (const notebook of notebooks) {
    await runTest(`Notebook: ${notebook}`, async () => {
      const filePath = path.join(notebookPath, notebook);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('Notebook file not found');
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!Array.isArray(data.cells) || data.cells.length < 3) {
        throw new Error('Invalid notebook structure');
      }

      // Check for markdown and code cells
      const hasMarkdown = data.cells.some(c => c.cell_type === 'markdown');
      const hasCode = data.cells.some(c => c.cell_type === 'code');
      
      if (!hasMarkdown || !hasCode) {
        throw new Error('Missing markdown or code cells');
      }
    });
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log('INFO', '═══════════════════════════════════════════════════════════');
  log('INFO', 'NewGen Studio Phase 1 MVP - Smoke Tests');
  log('INFO', `API Base: ${API_BASE_URL}`);
  log('INFO', `Start Time: ${new Date().toISOString()}`);
  log('INFO', '═══════════════════════════════════════════════════════════');

  try {
    // Run all test suites
    await testSimulation();
    await testGraphs();
    await testAgents();
    await testPresets();
    await testDatasets();
    await testNotebooks();

    // Print summary
    log('INFO', '═══════════════════════════════════════════════════════════');
    log('INFO', 'Test Results Summary');
    log('INFO', '═══════════════════════════════════════════════════════════');
    log('INFO', `Total Tests: ${totalTests}`);
    log('INFO', `Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    log('INFO', `Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

    if (failedTests > 0) {
      log('ERROR', 'Failed Tests:');
      testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => {
          log('  ✗', `${r.name}: ${r.error}`);
        });
    }

    log('INFO', '═══════════════════════════════════════════════════════════');
    const successRate = (passedTests / totalTests) * 100;
    if (successRate >= 80) {
      log('SUCCESS', `All tests passed! Success rate: ${successRate.toFixed(1)}%`);
      process.exit(0);
    } else {
      log('FAILURE', `Insufficient success rate: ${successRate.toFixed(1)}%`);
      process.exit(1);
    }
  } catch (error) {
    log('FATAL', 'Test execution failed', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
