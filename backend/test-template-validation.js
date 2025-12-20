import { validateAppSpecStrict } from './validators/appspec.validator.js';
import { TEMPLATES } from './services/templates.service.js';

console.log('🧪 Testing Template Validation\n');

// Test dashboard template
console.log('📊 Dashboard Template:');
const dashboardResult = validateAppSpecStrict(TEMPLATES.dashboard);
console.log('  Valid:', dashboardResult.valid);
console.log('  Problems:', dashboardResult.problems.length);
if (!dashboardResult.valid) {
  console.log('  Errors:', JSON.stringify(dashboardResult.problems.slice(0, 5), null, 2));
}

// Test CRUD template
console.log('\n📝 CRUD Template:');
const crudResult = validateAppSpecStrict(TEMPLATES.crud);
console.log('  Valid:', crudResult.valid);
console.log('  Problems:', crudResult.problems.length);
if (!crudResult.valid) {
  console.log('  Errors:', JSON.stringify(crudResult.problems.slice(0, 5), null, 2));
}

// Test form template
console.log('\n📋 Form Template:');
const formResult = validateAppSpecStrict(TEMPLATES.form);
console.log('  Valid:', formResult.valid);
console.log('  Problems:', formResult.problems.length);
if (!formResult.valid) {
  console.log('  Errors:', JSON.stringify(formResult.problems.slice(0, 5), null, 2));
}
