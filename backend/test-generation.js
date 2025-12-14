/**
 * Direct backend test - bypass UI completely
 * Run: node test-generation.js
 */

import { runAI } from './services/ai.service.enhanced.js';
import fs from 'fs';

const prompt = `Create a GMP Sample Management application for a biologics lab.

Requirements:
- Track samples from receipt through testing to disposition
- Fields: Sample ID, Batch/Lot, Material Type, Storage Location, Quantity, Units, Received Date, Status
- Workflow: Received → Quarantined → In Testing → Released/Rejected
- Role-based actions: QC Analyst can test, QA Manager can release
- Chain of custody tracking
- Audit trail with timestamps and user info
- Compliance controls (21 CFR Part 11)`;

console.log('🧪 Testing backend generation directly...\n');
console.log('Prompt:', prompt.substring(0, 100) + '...\n');

const result = await runAI(prompt);

console.log('✅ Generation complete\n');
console.log('Status:', result.status);
console.log('Has layout:', !!result.layout);
console.log('Has schema:', !!result.schema);
console.log('Layout nodes:', result.layout?.nodes?.length || 0);
console.log('Files generated:', Object.keys(result.files || {}).length);
console.log('Messages:', result.messages?.length || 0);

// Save the full AppSpec
const appSpec = {
  status: result.status,
  layout: result.layout,
  schema: result.schema,
  files: result.files,
  messages: result.messages
};

fs.writeFileSync('appspec_output.json', JSON.stringify(appSpec, null, 2));
console.log('\n📄 Full AppSpec saved to: appspec_output.json');

// Show structure
console.log('\n📋 Layout structure:');
if (result.layout?.nodes?.[0]) {
  const firstNode = result.layout.nodes[0];
  console.log('  Root node:', firstNode.type);
  console.log('  Children:', firstNode.children?.length || 0);
  if (firstNode.children) {
    firstNode.children.forEach((child, i) => {
      console.log(`    [${i}] ${child.type} - ${child.props?.title || '(no title)'}`);
    });
  }
}

console.log('\n✅ Test complete. Check appspec_output.json for full spec.');
