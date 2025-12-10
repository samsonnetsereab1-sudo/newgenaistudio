// src/builder/BuilderView.jsx
import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { generateWithGemini, MOCK_PROJECTS } from '../lib/data';

export default function BuilderView({ initialPrompt }) {
  const [messages, setMessages] = useState([{role:'assistant', content:'Describe the app you want to build.'}]);
  const [input, setInput] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [files, setFiles] = useState(MOCK_PROJECTS.default);

  useEffect(() => {
    if (initialPrompt) {
       setMessages(prev => [...prev, {role: 'user', content: initialPrompt}]);
       handleAiBuild(initialPrompt);
    }
  }, [initialPrompt]);

  const handleAiBuild = async (prompt) => {
    setIsBuilding(true);
    try {
      const { files: genFiles, messages: genMsgs } = await generateWithGemini({ prompt, addLog: console.log });
      if(genFiles) setFiles(prev => ({...prev, ...genFiles}));
      if(genMsgs && genMsgs.length > 0) genMsgs.forEach(m => setMessages(prev => [...prev, {role: 'assistant', content: m.content}]));
      else setMessages(prev => [...prev, {role: 'assistant', content: 'Code updated based on your request.'}]);
    } catch {
      setMessages(prev => [...prev, {role: 'assistant', content: 'Error generating code.'}]);
    } finally { setIsBuilding(false); }
  };

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages(prev => [...prev, {role:'user', content:input}]);
    const prompt = input; setInput(""); handleAiBuild(prompt);
  };

  const compileFiles = () => {
     const css = files["styles.css"] || "";
     const js = files["App.jsx"] || "";
     const sanitizedJS = js.replace(/import .*?;/g, "").replace(/export default function\s+App/, "function App").replace(/export default\s+App;/g, "");
     return `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><style>${css}</style><script src="https://unpkg.com/react@17/umd/react.development.js"></script><script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script></head><body class="bg-slate-50 flex items-center justify-center h-screen"><div id="root"></div><script type="text/babel">${sanitizedJS}ReactDOM.render(<App />, document.getElementById('root'));</script></body></html>`;
  };

  return (
    <div className="builder-overlay">
       <div className="ide-left">
          <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between bg-white">
             <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><Sparkles size={16} className="text-purple-600"/> AI Architect</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
             {messages.map((m,i) => (
               <div key={i} className={`p-3 rounded text-sm ${m.role==='user'?'bg-indigo-600 text-white ml-4':'bg-white border shadow-sm mr-4'}`}>{m.content}</div>
             ))}
             {isBuilding && <div className="text-xs text-indigo-600 animate-pulse flex gap-2"><Loader2 size={12} className="animate-spin"/> Generating code...</div>}
          </div>
          <div className="p-3 bg-white border-t border-slate-200">
             <div className="flex gap-2">
               <input className="flex-1 border rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500" placeholder="Instruction..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') handleSend()}} />
               <button onClick={handleSend} className="bg-indigo-600 text-white p-1.5 rounded"><ArrowRight size={16}/></button>
             </div>
          </div>
       </div>
       <div className="ide-main bg-slate-100 relative">
          <iframe srcDoc={compileFiles()} className="w-full h-full border-none" title="Preview" />
       </div>
    </div>
  );
}
