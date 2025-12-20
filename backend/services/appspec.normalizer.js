/**
 * AppSpec Normalizer & Minimal Viability Fix
 * - Normalizes AI outputs into strict AppSpec shape
 * - Converts top-level `nodes` into `layout.nodes`
 * - Ensures required root fields
 * - Auto-injects interactive children for empty pages/containers
 */

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeProps(props) {
  if (!props || typeof props !== 'object') return {};
  const out = { ...props };
  if (out.title && typeof out.title !== 'string') out.title = String(out.title);
  if (out.label && typeof out.label !== 'string') out.label = String(out.label);
  if (Array.isArray(out.columns)) out.columns = out.columns.map(String);
  return out;
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object') return null;
  const children = Array.isArray(node.children) ? node.children.map(normalizeNode).filter(Boolean) : [];
  return {
    id: node.id || uid('node'),
    type: node.type || 'section',
    props: normalizeProps(node.props || {}),
    children
  };
}

function ensureInteractiveChildren(list) {
  if (!Array.isArray(list)) return;
  const interactive = new Set(['table', 'form', 'button', 'input', 'chart', 'list']);
  let hasInteractive = false;
  for (const n of list) {
    if (n && interactive.has(n.type)) { hasInteractive = true; break; }
  }
  if (!hasInteractive) {
    list.push({ id: uid('tbl'), type: 'table', props: { title: 'Records', columns: ['ID', 'Name'] }, children: [] });
    list.push({ id: uid('btn'), type: 'button', props: { label: 'Add', variant: 'primary', action: 'create' }, children: [] });
  }
}

function applyMinimalViabilityFix(spec) {
  const clone = JSON.parse(JSON.stringify(spec || {}));

  // Ensure required top-level fields
  if (!clone.status) clone.status = 'ok';
  if (!clone.version) clone.version = '2.0';
  if (!clone.mode) clone.mode = clone.mode || 'generated';

  // Normalize: convert top-level `nodes` → `layout.nodes`
  if (Array.isArray(clone.nodes)) {
    clone.layout = clone.layout || { id: clone.id || uid('layout'), name: clone.name || 'Generated App', domain: clone.domain || 'generic' };
    if (!Array.isArray(clone.layout.nodes) || clone.layout.nodes.length === 0) {
      clone.layout.nodes = clone.nodes.map(normalizeNode).filter(Boolean);
    }
  }

  // Ensure layout exists
  if (!clone.layout) {
    clone.layout = { id: clone.id || uid('layout'), name: clone.name || 'Generated App', domain: clone.domain || 'generic', nodes: [] };
  }

  // Ensure nodes array
  if (!Array.isArray(clone.layout.nodes)) clone.layout.nodes = [];

  // If empty, create a minimal page with interactive children
  if (clone.layout.nodes.length === 0) {
    clone.layout.nodes.push({
      id: uid('page'),
      type: 'page',
      props: { title: 'Dashboard' },
      children: [
        {
          id: uid('sec'),
          type: 'section',
          props: { title: 'Overview' },
          children: [
            { id: uid('tbl'), type: 'table', props: { title: 'Records', columns: ['ID', 'Name'] }, children: [] },
            { id: uid('btn'), type: 'button', props: { label: 'Add', variant: 'primary', action: 'create' }, children: [] }
          ]
        }
      ]
    });
  }

  // Walk pages → ensure non-empty children and at least one interactive child under a container
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      if (!Array.isArray(node.children)) node.children = [];
      if (node.type === 'page') {
        if (node.children.length === 0) {
          node.children.push({ id: uid('sec'), type: 'section', props: { title: 'Overview' }, children: [] });
        }
        const first = node.children[0];
        if (first && first.type === 'section') {
          first.children = Array.isArray(first.children) ? first.children : [];
          ensureInteractiveChildren(first.children);
        } else {
          ensureInteractiveChildren(node.children);
        }
      }
      if (node.children.length > 0) walk(node.children);
    }
  };
  walk(clone.layout.nodes);

  return clone;
}

export function normalizeAndFixAppSpec(raw) {
  // Normalize structure and apply minimal viability fix
  const normalized = applyMinimalViabilityFix(raw || {});
  // Deep-normalize nodes
  normalized.layout.nodes = normalized.layout.nodes.map(normalizeNode).filter(Boolean);
  return normalized;
}

export default { normalizeAndFixAppSpec };
