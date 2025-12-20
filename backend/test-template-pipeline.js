import { validateAppSpecStrict } from './validators/appspec.validator.js';
import { getTemplate, pickTemplate } from './services/templates.service.js';
import { appSpecToFrontend } from './schemas/appspec.schema.js';

console.log('🧪 Testing Full Template Pipeline\n');

const testPrompts = ['dashboard', 'manage users', 'contact form'];

testPrompts.forEach(prompt => {
  console.log(`\n📝 Testing prompt: "${prompt}"`);
  
  // Step 1: Pick template
  const templateName = pickTemplate(prompt);
  console.log(`  Selected template: ${templateName}`);
  
  // Step 2: Get template spec
  const spec = getTemplate(templateName);
  console.log(`  Spec mode: ${spec.mode}`);
  
  // Step 3: Validate
  const validation = validateAppSpecStrict(spec);
  console.log(`  Valid: ${validation.valid}`);
  console.log(`  Problems: ${validation.problems.length}`);
  
  if (validation.valid) {
    // Step 4: Convert to frontend format
    try {
      const frontendResp = appSpecToFrontend(spec);
      frontendResp.problems = spec.problems || [];
      frontendResp.mode = spec.mode || 'template';
      
      console.log(`  Frontend conversion: ✅ Success`);
      console.log(`  Children count: ${frontendResp.children.length}`);
      console.log(`  Response keys: ${Object.keys(frontendResp).join(', ')}`);
    } catch (err) {
      console.log(`  Frontend conversion: ❌ ${err.message}`);
    }
  } else {
    console.log(`  Errors:`, validation.problems.slice(0, 3).map(p => p.message));
  }
});
