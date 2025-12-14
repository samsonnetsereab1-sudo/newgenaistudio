import React from 'react';
import { toolboxItems } from './ComponentRegistry';
import { Plus } from 'lucide-react';

export default function Sidebar({ onAddComponent }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="text-sm font-semibold text-white">Components</div>
      <div className="space-y-2">
        {toolboxItems.map((item) => (
          <button
            key={item.type}
            onClick={() => onAddComponent(item.type)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 text-white"
          >
            <span>{item.label}</span>
            <Plus size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
