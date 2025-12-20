/**
 * Template Library
 * Hardcoded fallback AppSpecs for when AI fails
 */

export const TEMPLATES = {
  dashboard: {
    status: 'ok',
    version: '2.0',
    mode: 'template',
    layout: {
      id: 'layout-dashboard-default',
      name: 'Dashboard',
      domain: 'generic',
      nodes: [
        {
          id: 'page-dashboard',
          type: 'page',
          props: {
            title: 'Dashboard'
          },
          children: [
            {
              id: 'section-overview',
              type: 'section',
              props: { title: 'Overview' },
              children: [
                {
                  id: 'card-metric-1',
                  type: 'card',
                  props: {
                    title: 'Total Items',
                    body: '—'
                  },
                  children: []
                },
                {
                  id: 'card-metric-2',
                  type: 'card',
                  props: {
                    title: 'Active Users',
                    body: '—'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      ]
    },
    files: {
      'App.jsx': '// Template: Dashboard\nexport default function Dashboard() { return <div>Dashboard Template</div>; }'
    },
    problems: []
  },

  crud: {
    status: 'ok',
    version: '2.0',
    mode: 'template',
    layout: {
      id: 'layout-crud-default',
      name: 'CRUD Manager',
      domain: 'generic',
      nodes: [
        {
          id: 'page-list',
          type: 'page',
          props: {
            title: 'Items'
          },
          children: [
            {
              id: 'table-items',
              type: 'table',
              props: {
                title: 'All Items',
                columns: ['ID', 'Name', 'Status', 'Actions']
              },
              children: []
            }
          ]
        },
        {
          id: 'page-create',
          type: 'page',
          props: {
            title: 'Create Item'
          },
          children: [
            {
              id: 'form-create',
              type: 'form',
              props: {
                title: 'New Item',
                fields: [
                  {
                    name: 'name',
                    label: 'Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Enter name'
                  },
                  {
                    name: 'description',
                    label: 'Description',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Enter description'
                  }
                ]
              },
              children: []
            }
          ]
        }
      ]
    },
    files: {
      'App.jsx': '// Template: CRUD\nexport default function CRUD() { return <div>CRUD Template</div>; }'
    },
    problems: []
  },

  form: {
    status: 'ok',
    version: '2.0',
    mode: 'template',
    layout: {
      id: 'layout-form-default',
      name: 'Form',
      domain: 'generic',
      nodes: [
        {
          id: 'page-form',
          type: 'page',
          props: {
            title: 'Form'
          },
          children: [
            {
              id: 'form-main',
              type: 'form',
              props: {
                title: 'Submit Information',
                fields: [
                  {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                    placeholder: 'your@email.com'
                  },
                  {
                    name: 'message',
                    label: 'Message',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Your message here'
                  }
                ]
              },
              children: []
            }
          ]
        }
      ]
    },
    files: {
      'App.jsx': '// Template: Form\nexport default function Form() { return <div>Form Template</div>; }'
    },
    problems: []
  }
};

/**
 * Pick best template based on user prompt
 * @param {string} prompt - User's original prompt
 * @returns {string} Template key (dashboard, crud, or form)
 */
export function pickTemplate(prompt) {
  const lower = (prompt || '').toLowerCase();

  if (lower.includes('dashboard') || lower.includes('overview') || lower.includes('summary')) {
    return 'dashboard';
  }
  if (lower.includes('crud') || lower.includes('manage') || lower.includes('list') || lower.includes('table')) {
    return 'crud';
  }
  if (lower.includes('form') || lower.includes('submit') || lower.includes('sign up')) {
    return 'form';
  }

  // Default fallback
  return 'dashboard';
}

/**
 * Get a template by key
 * @param {string} key - Template key (dashboard, crud, form)
 * @returns {object} Template spec
 */
export function getTemplate(key) {
  return TEMPLATES[key] || TEMPLATES.dashboard;
}

export default {
  TEMPLATES,
  pickTemplate,
  getTemplate
};
