import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv2020 from 'ajv/dist/2020.js';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, '..', 'resources', 'templates');
const schemaPath = path.join(templatesDir, 'template.schema.json');

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function loadYaml(p) {
  return yaml.load(readFileSync(p, 'utf8'));
}

function main() {
  const schema = loadJson(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);

  const files = readdirSync(templatesDir).filter((f) => f.endsWith('.yaml'));
  if (files.length === 0) {
    console.log('No template YAML files found.');
    return;
  }

  let hasErrors = false;
  files.forEach((file) => {
    const fullPath = path.join(templatesDir, file);
    const data = loadYaml(fullPath);
    const valid = validate(data);
    if (!valid) {
      hasErrors = true;
      console.error(`❌ ${file}`);
      console.error(validate.errors);
    } else {
      console.log(`✅ ${file}`);
    }
  });

  if (hasErrors) {
    console.error('Template validation failed.');
    process.exit(1);
  } else {
    console.log('All templates valid.');
  }
}

main();
