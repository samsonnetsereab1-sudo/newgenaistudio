/**
 * AI Output Normalization Service
 */

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32);
}

export function normalizeField(raw) {
  if (typeof raw === 'string') {
    return { id: slugify(raw), label: raw, name: slugify(raw), type: 'text', required: false };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!raw.id && !raw.name && !raw.label) return null;
  const normalized = {
    id: raw.id || raw.name || slugify(raw.label || ''),
    name: raw.name || raw.id || slugify(raw.label || ''),
    label: raw.label || raw.name || raw.id || '',
    type: ['text','number','email','date','select','textarea','checkbox'].includes(raw.type) ? raw.type : 'text',
    required: !!raw.required
  };
  if (raw.placeholder) normalized.placeholder = raw.placeholder;
  if (Array.isArray(raw.options)) normalized.options = raw.options;
  return normalized;
}

function normalizeProps(props) {
  if (!props || typeof props !== 'object') return {};
  const normalized = { ...props };
  if (Array.isArray(props.fields)) {
    normalized.fields = props.fields.map(normalizeField).filter(Boolean);
  }
  if (normalized.title && typeof normalized.title !== 'string') normalized.title = String(normalized.title);
  if (normalized.label && typeof normalized.label !== 'string') normalized.label = String(normalized.label);
  return normalized;
}

function normalizeNode(node) {
  if (!node) return node;
  return {
    id: node.id || `node-${Date.now()}`,
    type: node.type || 'section',
    props: normalizeProps(node.props),
    children: (node.children || []).map(normalizeNode).filter(Boolean)
  };
}

export function normalizeLayout(layout) {
  if (!layout || !layout.nodes) return layout;
  return { ...layout, nodes: (layout.nodes || []).map(normalizeNode) };
}

export function normalizeAppSpec(spec) {
  if (!spec) return spec;
  const normalized = { ...spec };
  if (spec.layout) normalized.layout = normalizeLayout(spec.layout);
  if (Array.isArray(spec.nodes)) normalized.nodes = spec.nodes.map(normalizeNode);
  // Preserve domain model
  if (spec.schema && typeof spec.schema === 'object') {
    normalized.schema = spec.schema;
    if (Array.isArray(spec.schema.entities)) {
      normalized.schema.entities = spec.schema.entities.filter(e => e && typeof e === 'object' && e.name);
    }
  }
  if (Array.isArray(spec.agents)) normalized.agents = spec.agents.filter(a => a && typeof a === 'object' && a.name);
  if (Array.isArray(spec.workflows)) normalized.workflows = spec.workflows.filter(w => w && typeof w === 'object' && w.name);
  return normalized;
}

export default {
  normalizeField,
  normalizeLayout,
  normalizeNode,
  normalizeAppSpec
};
