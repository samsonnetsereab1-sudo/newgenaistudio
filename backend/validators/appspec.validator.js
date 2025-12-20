/**
 * AppSpec Validator using Ajv
 * Ensures all generated specs strictly conform to the schema
 */

import Ajv from 'ajv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeAndFixAppSpec } from '../services/appspec.normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '../schemas/appspec.json');
const appspecSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

const ajv = new Ajv({ 
  allErrors: true, 
  verbose: true,
  strict: false 
});

const validateAppSpec = ajv.compile(appspecSchema);

/**
 * Validate an AppSpec object against the schema
 * @param {object} spec - The AppSpec to validate
 * @returns {object} { valid: boolean, errors: array, problems: array }
 */
export function validateAppSpecStrict(spec) {
  const valid = validateAppSpec(spec);
  
  if (valid) {
    return {
      valid: true,
      errors: [],
      problems: []
    };
  }

  // Convert Ajv errors to human-readable problems
  const problems = (validateAppSpec.errors || []).map(err => {
    const path = err.instancePath || 'root';
    return {
      severity: 'error',
      message: `${path || 'root'}: ${err.message}`,
      path,
      code: err.keyword,
      schemaPath: err.schemaPath
    };
  });

  console.error('[AppSpec Validator] ❌ Validation failed:');
  problems.forEach(p => console.error(`  - ${p.message}`));

  return {
    valid: false,
    errors: validateAppSpec.errors || [],
    problems
  };
}

/**
 * Validate then run viability on a spec, after normalization/minimal fix.
 * @param {object} rawSpec - AI or repaired spec
 * @returns {{ spec: object, validation: object, viability: object }}
 */
export function validateAndCheckViability(rawSpec) {
  const normalized = normalizeAndFixAppSpec(rawSpec || {});
  const validation = validateAppSpecStrict(normalized);
  const viability = validation.valid ? isViableSpec(normalized) : { viable: false, reason: 'validation failed' };
  return { spec: normalized, validation, viability };
}

/**
 * Enforce minimum viability: spec must have at least one page/node with content
 * @param {object} spec - The AppSpec to check (normalized format with root `children` array)
 * @returns {object} { viable: boolean, reason: string }
 */
export function isViableSpec(spec) {
  if (!spec) {
    return { viable: false, reason: 'Missing spec' };
  }

  // Check for normalized format (children at root) OR frontend format (layout.nodes)
  const children = spec.children || spec.layout?.nodes;
  
  if (!Array.isArray(children) || children.length === 0) {
    return { viable: false, reason: 'No children nodes' };
  }

  const interactiveTypes = new Set(['table', 'form', 'button', 'input', 'chart', 'list']);
  let hasInteractive = false;
  let pagesHaveChildren = true;
  let hasContent = false;

  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (!node) continue;
      if (node.type === 'page' && (!Array.isArray(node.children) || node.children.length === 0)) {
        pagesHaveChildren = false;
      }
      if (interactiveTypes.has(node.type)) {
        hasInteractive = true;
      }
      if (node.type === 'page' || node.type === 'section' || node.type === 'card') {
        if (Array.isArray(node.children) && node.children.length > 0) {
          hasContent = true;
        }
      } else if (node.props && (node.props.title || node.props.label || node.props.body || node.props.text)) {
        hasContent = true;
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(children);

  if (!pagesHaveChildren) {
    return { viable: false, reason: 'Page nodes missing children' };
  }

  if (!hasInteractive) {
    return { viable: false, reason: 'No interactive components (table/form/button/input/chart/list)' };
  }

  if (!hasContent) {
    return { viable: false, reason: 'All nodes are empty (no children or content)' };
  }

  return { viable: true, reason: 'OK' };
}

/**
 * Extract human-readable error messages for the frontend
 * @param {array} problems - Problems array from validation
 * @returns {array} Simplified error messages
 */
export function formatProblems(problems) {
  return problems.map(p => ({
    severity: p.severity,
    message: p.message.replace(/^\//, '').replace(/\//g, ' > ') || 'Unknown error'
  }));
}

/**
 * Check if a spec is repairable (has some structure but validation failed)
 * @param {object} spec - The spec to check
 * @returns {boolean}
 */
export function isRepairableSpec(spec) {
  try {
    // If it's JSON and has a layout with at least some nodes, it's potentially repairable
    return spec && 
           spec.layout && 
           Array.isArray(spec.layout.nodes) && 
           spec.layout.nodes.length > 0;
  } catch {
    return false;
  }
}

export default {
  validateAppSpecStrict,
  isViableSpec,
  validateAndCheckViability,
  formatProblems,
  isRepairableSpec
};
