// src/builder/BuilderView.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Loader2, Sparkles, Code2, LayoutGrid, Eye, FileText } from 'lucide-react';
import { generate, fetchLayout, saveLayout } from '../lib/apiClient';
import { createEmptyLayoutDocument } from '../lib/layoutSchema';
import { renderLayoutDocument } from '../lib/renderLayout';
import VisualEditor from '../visual-editor/VisualEditor';
import { MOCK_PROJECTS } from '../lib/data';

const tabs = [
  { id: 'prompt', label: 'Prompt', icon: Sparkles },
  { id: 'visual', label: 'Visual', icon: LayoutGrid },
  { id: 'code', label: 'Code', icon: Code2 }
];

export default function BuilderView({ initialPrompt }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Describe the app you want to build.' }]);
  const [input, setInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [files, setFiles] = useState(MOCK_PROJECTS.default);
  const [layoutDocument, setLayoutDocument] = useState(createEmptyLayoutDocument('New Screen'));
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeTab, setActiveTab] = useState('prompt');

  useEffect(() => {
    if (initialPrompt) {
      setMessages(prev => [...prev, { role: 'user', content: initialPrompt }]);
      handleAiBuild(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    let isActive = true;
    (async () => {
      try {
        const res = await fetchLayout('current');
        if (res?.layout && isActive) {
          setLayoutDocument(res.layout);
        }
      } catch (err) {
        console.warn('Layout fetch skipped:', err?.message || err);
      }
    })();
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!layoutDocument) return;
      saveLayout('current', layoutDocument).catch(err => console.warn('Layout save skipped:', err?.message || err));
    }, 800);
    return () => clearTimeout(timer);
  }, [layoutDocument]);

  const handleAiBuild = async (prompt) => {
    setIsBuilding(true);
    try {
      const response = await generate(prompt);
      const { files: genFiles, messages: genMsgs, layout } = response;

      if (genFiles) setFiles(prev => ({ ...prev, ...genFiles }));
      if (layout) setLayoutDocument(layout);

      if (genMsgs && genMsgs.length > 0) {
        genMsgs.forEach(m => setMessages(prev => [...prev, { role: 'assistant', content: m.content }]));
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Code and layout updated based on your request.' }]);
      }
    } catch (error) {
      console.error('AI Build Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error generating code. Make sure backend is running on port 4000.';
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${errorMsg}` }]);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const prompt = input; setInput(''); handleAiBuild(prompt);
  };

  const codePreview = useMemo(() => {
    const layoutJson = JSON.stringify(layoutDocument, null, 2);
    const appJs = files['App.jsx'] || '// generated code pending';
    return { layoutJson, appJs };
  }, [layoutDocument, files]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles size={16} className="text-emerald-400" /> AI Architect + Visual Editor
        </div>
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${active ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-700 text-slate-300 hover:text-white'}`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'prompt' && (
        <div className="grid grid-cols-12 h-[calc(100vh-56px)]">
          <div className="col-span-5 border-r border-slate-800 flex flex-col bg-slate-900/60">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded text-sm ${m.role === 'user'
                    ? 'bg-emerald-600 text-white ml-6'
                    : 'bg-slate-800 border border-slate-700 mr-6 text-slate-100'}`}
                >
                  {m.content}
                </div>
              ))}
              {isBuilding && (
                <div className="text-xs text-emerald-400 animate-pulse flex gap-2">
                  <Loader2 size={12} className="animate-spin" /> Generating code & layout...
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900">
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-700 rounded px-3 py-2 text-sm bg-slate-800 text-white outline-none focus:border-emerald-500"
                  placeholder="Describe the change..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 rounded">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-7 bg-slate-900/40 p-6 overflow-y-auto">
            <div className="mb-3 text-sm text-slate-400 flex items-center gap-2"><Eye size={14} /> Live Preview (Layout)</div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 min-h-[60vh]">
              {renderLayoutDocument(layoutDocument)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visual' && (
        <div className="p-6 bg-slate-900/60">
          <div className="max-w-7xl mx-auto space-y-4">
            <VisualEditor
              layoutDocument={layoutDocument}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onLayoutChange={(next) => setLayoutDocument(next)}
            />
            <div className="mt-6">
              <div className="text-sm text-slate-400 mb-2 flex items-center gap-2"><FileText size={14} /> Preview</div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                {renderLayoutDocument(layoutDocument)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="p-6 bg-slate-900/60">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-2">LayoutDocument (JSON)</div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap max-h-[70vh] overflow-auto bg-slate-900 p-3 rounded-lg border border-slate-700">{codePreview.layoutJson}</pre>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="text-sm text-slate-400 mb-2">App.jsx (latest)</div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap max-h-[70vh] overflow-auto bg-slate-900 p-3 rounded-lg border border-slate-700">{codePreview.appJs}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
