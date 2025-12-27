/**
 * Workflow Schema
 * JSON Schema for workflow definitions
 */

import Ajv from 'ajv';

/**
 * Workflow JSON Schema
 */
export const WorkflowSchema = {
  type: 'object',
  required: ['id', 'name', 'steps'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    trigger: {
      type: 'string',
      enum: ['manual', 'auto', 'cron', 'event']
    },
    steps: {
      type: 'array',
      items: { $ref: '#/$defs/WorkflowStep' }
    },
    onSuccess: { $ref: '#/$defs/Effect' },
    onError: { $ref: '#/$defs/Effect' }
  },
  $defs: {
    WorkflowStep: {
      type: 'object',
      required: ['id', 'name', 'type'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'validation',
            'api-call',
            'llm-task',
            'conditional',
            'loop',
            'parallel'
          ]
        },
        // Validation step properties
        rules: {
          type: 'object',
          patternProperties: {
            '.*': {
              type: 'object',
              properties: {
                required: { type: 'boolean' },
                pattern: { type: 'string' },
                min: { type: 'number' },
                max: { type: 'number' }
              }
            }
          }
        },
        // API call step properties
        url: { type: 'string' },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        },
        body: { type: 'object' },
        // LLM task step properties
        prompt: { type: 'string' },
        // Conditional step properties
        condition: { type: 'string' },
        then: {
          type: 'array',
          items: { $ref: '#/$defs/WorkflowStep' }
        },
        else: {
          type: 'array',
          items: { $ref: '#/$defs/WorkflowStep' }
        },
        // Loop step properties
        items: { type: 'string' },
        itemVariable: { type: 'string' },
        // Parallel step properties
        steps: {
          type: 'array',
          items: { $ref: '#/$defs/WorkflowStep' }
        }
      }
    },
    Effect: {
      type: 'object',
      required: ['type'],
      properties: {
        type: {
          type: 'string',
          enum: ['notify', 'update-state', 'navigate', 'api-call']
        },
        message: { type: 'string' },
        variant: {
          type: 'string',
          enum: ['success', 'error', 'warning', 'info']
        }
      }
    }
  }
};

/**
 * Validate workflow against schema
 * @param {object} workflow - Workflow to validate
 * @returns {object} { valid: boolean, errors: array }
 */
export function validateWorkflow(workflow) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(WorkflowSchema);
  
  const valid = validate(workflow);
  
  if (valid) {
    return { valid: true, errors: [] };
  }
  
  const errors = (validate.errors || []).map(err => {
    const path = err.instancePath || 'root';
    return `${path}: ${err.message}`;
  });
  
  console.error('[Workflow Validator] Validation failed:');
  errors.forEach(err => console.error(`  - ${err}`));
  
  return { valid: false, errors };
}

/**
 * Example workflow: Batch Release Process
 */
export const ExampleBatchReleaseWorkflow = {
  id: 'workflow-batch-release',
  name: 'Batch Release Process',
  trigger: 'manual',
  steps: [
    {
      id: 'step-validate',
      name: 'Validate Batch Data',
      type: 'validation',
      rules: {
        'batchId': { required: true, pattern: '^BATCH-' },
        'qcResults': { required: true }
      }
    },
    {
      id: 'step-fetch-data',
      name: 'Fetch Batch Data',
      type: 'api-call',
      url: '/api/batches/{{batchId}}',
      method: 'GET'
    },
    {
      id: 'step-ai-review',
      name: 'AI Quality Review',
      type: 'llm-task',
      prompt: 'Review batch {{batchId}} quality data: {{step-fetch-data.qcResults}}. Determine if batch meets release criteria.'
    },
    {
      id: 'step-decision',
      name: 'Release Decision',
      type: 'conditional',
      condition: 'step-ai-review.approved === true',
      then: [
        {
          id: 'step-release',
          name: 'Release Batch',
          type: 'api-call',
          url: '/api/batches/{{batchId}}/release',
          method: 'POST',
          body: { status: 'released', reviewer: 'AI' }
        }
      ],
      else: [
        {
          id: 'step-reject',
          name: 'Reject Batch',
          type: 'api-call',
          url: '/api/batches/{{batchId}}/reject',
          method: 'POST',
          body: { status: 'rejected', reason: '{{step-ai-review.reason}}' }
        }
      ]
    }
  ],
  onSuccess: {
    type: 'notify',
    message: 'Batch release workflow completed',
    variant: 'success'
  },
  onError: {
    type: 'notify',
    message: 'Batch release workflow failed',
    variant: 'error'
  }
};
