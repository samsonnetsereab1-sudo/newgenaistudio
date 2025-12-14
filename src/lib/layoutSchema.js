// Canonical layout schema for Visual Editor and AI Builder
const rid = () => Math.random().toString(36).slice(2, 10);

export function createEmptyLayoutDocument(name = 'New Layout') {
  return {
    id: rid(),
    name,
    domain: 'generic',
    nodes: [
      {
        id: rid(),
        type: 'page',
        props: { title: name },
        children: [
          {
            id: rid(),
            type: 'section',
            props: { title: 'Hero' },
            children: [
              { id: rid(), type: 'text', props: { value: 'Start building visually.' } },
              { id: rid(), type: 'button', props: { label: 'Call to Action', variant: 'primary' } }
            ]
          }
        ]
      }
    ]
  };
}

// Layout types (JSDoc for editor intelligence)
/**
 * @typedef {Object} LayoutNode
 * @property {string} id
 * @property {('page'|'section'|'grid'|'card'|'text'|'chart'|'table'|'form'|'button'|'plugin')} type
 * @property {Object} [props]
 * @property {LayoutNode[]} [children]
 * @property {Array<{ sourceId?: string; path?: string; }>} [dataBindings]
 */

/**
 * @typedef {Object} LayoutDocument
 * @property {string} id
 * @property {string} name
 * @property {('biologics'|'pharma'|'generic')} [domain]
 * @property {LayoutNode[]} nodes
 */
