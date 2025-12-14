import React, { useMemo } from 'react';
import Canvas from './Canvas';
import Sidebar from './Sidebar';
import { Trash2, Settings } from 'lucide-react';

const rid = () => Math.random().toString(36).slice(2, 10);

export default function VisualEditor({ layoutDocument, selectedNodeId, onSelectNode, onLayoutChange }) {
  const layout = useMemo(() => layoutDocument || { nodes: [] }, [layoutDocument]);

  const addNode = (type) => {
    const newNode = { id: rid(), type, props: {}, children: [] };
    const next = { ...layout, nodes: [...(layout.nodes || []), newNode] };
    onLayoutChange?.(next);
    onSelectNode?.(newNode.id);
  };

  const findNode = (nodes, id) => {
    for (const n of nodes || []) {
      if (n.id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  };

  const updateNode = (updated) => {
    const replace = (nodes) => nodes?.map(n => {
      if (n.id === updated.id) return updated;
      if (n.children) return { ...n, children: replace(n.children) };
      return n;
    });
    onLayoutChange?.({ ...layout, nodes: replace(layout.nodes || []) });
  };

  const deleteNode = (id) => {
    const filter = (nodes) => nodes?.filter(n => {
      if (n.id === id) return false;
      if (n.children) n.children = filter(n.children);
      return true;
    });
    onLayoutChange?.({ ...layout, nodes: filter(layout.nodes || []) });
    onSelectNode?.(null);
  };

  const selectedNode = selectedNodeId ? findNode(layout.nodes, selectedNodeId) : null;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 space-y-3">
        <Sidebar onAddComponent={addNode} />
        {selectedNode && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-white text-sm font-semibold">
              <Settings size={14} /> Inspector
            </div>
            <div className="text-xs text-slate-400">{selectedNode.type}</div>
            {['text', 'button', 'card', 'section'].includes(selectedNode.type) && (
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Title/Label</label>
                <input
                  className="w-full px-2 py-1 rounded bg-slate-700 text-white text-sm border border-slate-600 focus:border-emerald-500 outline-none"
                  value={selectedNode.props?.label || selectedNode.props?.title || ''}
                  onChange={(e) => updateNode({ ...selectedNode, props: { ...selectedNode.props, title: e.target.value, label: e.target.value } })}
                />
              </div>
            )}
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
      <div className="col-span-9">
        <Canvas layoutDocument={layout} onSelectNode={onSelectNode} />
      </div>
    </div>
  );
}
