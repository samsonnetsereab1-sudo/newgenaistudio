/**
 * Test Dynamic App Generation System
 * Basic smoke tests for all new endpoints
 */

const API_BASE = process.env.API_BASE || 'http://localhost:4000';

async function testEndpoint(name, path, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json();
    
    console.log(`✅ ${name}: PASS`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ ${name}: FAIL -`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Dynamic App Generation System\n');
  
  const results = [];
  
  // Test 1: Health check
  results.push(await testEndpoint(
    'Health Check',
    '/api/health'
  ));
  
  // Test 2: Dynamic generation - Sample Tracker
  results.push(await testEndpoint(
    'Generate Sample Tracker',
    '/api/generate/dynamic',
    'POST',
    {
      prompt: 'sample tracker',
      context: {
        domain: 'pharma',
        fields: ['Sample ID', 'Batch', 'Status']
      }
    }
  ));
  
  // Test 3: Dynamic generation - Dashboard
  results.push(await testEndpoint(
    'Generate Dashboard',
    '/api/generate/dynamic',
    'POST',
    {
      prompt: 'dashboard',
      context: {
        metrics: ['Total', 'Active', 'Pending']
      }
    }
  ));
  
  // Test 4: Workflow examples
  results.push(await testEndpoint(
    'Workflow Examples',
    '/api/workflows/examples'
  ));
  
  // Test 5: Workflow history
  results.push(await testEndpoint(
    'Workflow History',
    '/api/workflows/history'
  ));
  
  // Summary
  console.log('\n📊 Test Summary');
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed');
  }
}

runTests().catch(console.error);
