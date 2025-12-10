export const runAI = async (prompt) => {
  // TODO: Replace with real AI call (Gemini/OpenAI/etc.)
  return {
    status: 'ok',
    files: {
      'App.jsx': `import React from "react";

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold">NewGen App Preview</h1>
        <p className="text-slate-600">Generated from prompt:</p>
        <pre className="text-xs bg-slate-900 text-slate-100 p-3 rounded-lg text-left overflow-auto">
${prompt}
        </pre>
      </div>
    </div>
  );
}`,
      'styles.css': 'body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }'
    },
    messages: [
      { role: 'assistant', content: 'I have generated the project structure based on your request.' }
    ]
  };
};
