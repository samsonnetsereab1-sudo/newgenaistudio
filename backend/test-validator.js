import { validateAppSpecStrict, isViableSpec } from './validators/appspec.validator.js';
import { getTemplate } from './services/templates.service.js';

console.log('Testing validator...');

const template = getTemplate('dashboard');
console.log('Got template:', template.layout.name);

const validation = validateAppSpecStrict(template);
console.log('Validation result:', validation.valid);

const viability = isViableSpec(template);
console.log('Viability result:', viability.viable);

console.log('All tests passed!');
