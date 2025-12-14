import React from 'react';

const baseStyles = {
  card: 'bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm',
  heading: 'text-white font-semibold text-lg',
  text: 'text-slate-300 text-sm',
  button: 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold',
};

const Button = ({ label = 'Button', variant = 'primary', size = 'md' }) => {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ghost: 'bg-slate-700 hover:bg-slate-600 text-white',
    outline: 'border border-slate-500 text-white hover:bg-slate-700',
  };
  const sizes = { sm: 'py-1 px-3 text-xs', md: 'py-2 px-4 text-sm', lg: 'py-3 px-6 text-base' };
  const buttonClass = `${baseStyles.button} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md}`;
  return React.createElement('button', { className: buttonClass }, label);
};

function NodeRenderer({ node }) {
  const renderChildren = (children) => 
    children?.map(child => React.createElement(NodeRenderer, { key: child.id, node: child }));

  switch (node.type) {
    case 'page':
      return React.createElement('div', { className: 'space-y-4' },
        node.props?.title && React.createElement('h2', { className: 'text-xl font-bold text-white' }, node.props.title),
        React.createElement('div', { className: 'space-y-4' }, renderChildren(node.children))
      );
    case 'section':
      return React.createElement('div', { className: 'bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3' },
        node.props?.title && React.createElement('h3', { className: 'text-lg font-semibold text-white' }, node.props.title),
        renderChildren(node.children)
      );
    case 'card':
      return React.createElement('div', { className: baseStyles.card },
        node.props?.title && React.createElement('div', { className: baseStyles.heading }, node.props.title),
        node.props?.body && React.createElement('p', { className: baseStyles.text }, node.props.body),
        renderChildren(node.children)
      );
    case 'text':
      return React.createElement('p', { className: baseStyles.text }, node.props?.value || 'Text block');
    case 'button':
      return React.createElement(Button, { label: node.props?.label, variant: node.props?.variant, size: node.props?.size });
    case 'table':
      return React.createElement('div', { className: 'bg-slate-800 border border-slate-700 rounded-xl overflow-hidden' },
        React.createElement('div', { className: 'px-4 py-2 border-b border-slate-700 text-slate-300 text-sm' }, 'Table (design preview)'),
        React.createElement('div', { className: 'p-4 text-slate-500 text-xs' }, 'Columns: ' + (node.props?.columns?.join(', ') || '—'))
      );
    case 'chart':
      return React.createElement('div', { className: 'bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-400 text-sm' }, 'Chart placeholder');
    default:
      return React.createElement('div', { className: 'text-slate-500 text-xs' }, 'Unsupported node: ' + node.type);
  }
}

export function renderLayoutDocument(layout) {
  if (!layout) return null;
  return React.createElement('div', { className: 'space-y-4' },
    layout.nodes?.map(node => React.createElement(NodeRenderer, { key: node.id, node: node }))
  );
}
