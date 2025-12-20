#!/usr/bin/env node
/**
 * Test script to validate normalizer + strict prompt improvements
 * Run: node test-improvements.cjs
 */

const http = require('http');

function makeRequest(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ prompt });
    const opts = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 40000
    };
    
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('\n=== VALIDATION TEST SUITE ===\n');
  
  const tests = [
    { name: 'Domain 1: Sentinel-GxP Sample Tracker', prompt: 'Sentinel-GxP sample tracker with agents (CustodyBot, QualityBot), states (RECEIVED, IN_LAB, OOS_LOCK, RELEASED)' },
    { name: 'Domain 2: LIMS System', prompt: 'LIMS with agents (LabTech, QA, Admin), workflow state machine (sample_submitted, testing, results_review, release)' },
    { name: 'Domain 3: Batch Management', prompt: 'Batch management system with agents (BatchOwner, QualityOwner), states (Created, InProgress, Testing, Released)' },
    { name: 'Normal 1: Simple Dashboard', prompt: 'simple user dashboard with metrics and cards' },
    { name: 'Normal 2: Batch Tracking', prompt: 'batch tracking system with status column' },
    { name: 'Normal 3: Inventory', prompt: 'inventory management with stock levels and SKU' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const start = Date.now();
      const resp = await makeRequest(test.prompt);
      const elapsed = Date.now() - start;
      
      results.push({
        name: test.name,
        mode: resp.mode,
        elapsed,
        agents: resp.agents?.length ?? 0,
        workflows: resp.workflows?.length ?? 0,
        problems: resp.problems?.length ?? 0,
        children: resp.children?.length ?? 0
      });
      
      const color = resp.mode === 'generated' ? '\x1b[32m' : resp.mode === 'template' ? '\x1b[33m' : '\x1b[31m';
      const reset = '\x1b[0m';
      console.log(`  ${color}✓ ${resp.mode}${reset} | ${elapsed}ms | agents=${resp.agents?.length ?? 0} | workflows=${resp.workflows?.length ?? 0}\n`);
    } catch (err) {
      console.log(`  \x1b[31m✗ ERROR: ${err.message}\x1b[0m\n`);
      results.push({ name: test.name, mode: 'error', error: err.message });
    }
  }
  
  // Summary
  const generated = results.filter(r => r.mode === 'generated').length;
  const templates = results.filter(r => r.mode === 'template').length;
  const errors = results.filter(r => r.mode === 'error').length;
  const total = results.length;
  const pct = total > 0 ? ((generated / total) * 100).toFixed(1) : 0;
  
  console.log('\n=== RESULTS ===');
  console.log(`Total: ${total} | Generated: ${generated} (${pct}%) | Template: ${templates} | Errors: ${errors}`);
  console.log(`\nTarget: >=60% AI generation (from baseline 37.5%)`);
  
  if (pct >= 60) {
    console.log('\n\x1b[32m✓ TARGET MET - Improvements successful!\x1b[0m\n');
  } else {
    console.log(`\n\x1b[33m⚠ Below target (${pct}%) - May need fallback strategy\x1b[0m\n`);
  }
  
  process.exit(0);
}

setTimeout(() => {
  runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}, 2000);
