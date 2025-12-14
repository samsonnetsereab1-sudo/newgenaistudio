import React from 'react';
import { renderLayoutDocument } from '../lib/renderLayout';

export default function Canvas({ layoutDocument, onSelectNode }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 min-h-[500px]">
      <div className="text-xs uppercase text-slate-400 mb-3">Live Preview</div>
      <div
        onClick={() => onSelectNode(null)}
        className="space-y-4 cursor-default"
      >
        {renderLayoutDocument(layoutDocument)}
      </div>
    </div>
  );
}
