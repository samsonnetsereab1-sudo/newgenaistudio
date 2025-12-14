/**
 * Enhanced AI Service for NewGen Studio
 * Supports biologics/pharma-specific templates and general-purpose apps
 * with real OpenAI integration
 */

import OpenAI from 'openai';

const rid = () => Math.random().toString(36).slice(2, 10);

// Detect if prompt is biologics/pharma related
function isBiologicsPrompt(prompt) {
  const biologicsKeywords = [
    'protein', 'antibody', 'drug', 'molecule', 'pharmaceutical', 'biologics',
    'assay', 'chromatography', 'mass spec', 'sequencing', 'clinical', 'trial',
    'pipeline', 'formulation', 'batch', 'manufacturing', 'qc', 'quality control',
    'alphafold', 'maxquant', 'galaxy', 'openms', 'nextflow', 'proteomics'
  ];
  const lowerPrompt = prompt.toLowerCase();
  return biologicsKeywords.some(kw => lowerPrompt.includes(kw));
}

function buildGeneralLayout(prompt) {
  return {
    id: `layout-${rid()}`,
    name: 'AI Generated Layout',
    domain: 'generic',
    nodes: [
      {
        id: rid(),
        type: 'page',
        props: { title: 'Workspace' },
        children: [
          {
            id: rid(),
            type: 'section',
            props: { title: 'Overview' },
            children: [
              { id: rid(), type: 'card', props: { title: 'Summary', body: 'Generated from your prompt.' } },
              { id: rid(), type: 'table', props: { columns: ['Name', 'Status', 'Owner'] } },
              { id: rid(), type: 'chart', props: { kind: 'line' } },
            ],
          },
          {
            id: rid(),
            type: 'section',
            props: { title: 'Actions' },
            children: [
              { id: rid(), type: 'button', props: { label: 'Primary Action', variant: 'primary' } },
              { id: rid(), type: 'button', props: { label: 'Secondary', variant: 'outline' } },
              { id: rid(), type: 'text', props: { value: prompt.slice(0, 120) } },
            ],
          },
        ],
      },
    ],
  };
}

function buildBiologicsLayout(prompt) {
  return {
    id: `layout-${rid()}`,
    name: 'Biologics Dashboard',
    domain: 'biologics',
    nodes: [
      {
        id: rid(),
        type: 'page',
        props: { title: 'Biologics Operations' },
        children: [
          {
            id: rid(),
            type: 'section',
            props: { title: 'Pipeline Health' },
            children: [
              { id: rid(), type: 'card', props: { title: 'Active Assays', body: 'Track assay throughput and status.' } },
              { id: rid(), type: 'card', props: { title: 'Success Rate', body: 'Quality and yield trends.' } },
              { id: rid(), type: 'table', props: { columns: ['Stage', 'Owner', 'Status'] } },
            ],
          },
          {
            id: rid(),
            type: 'section',
            props: { title: 'Analytics' },
            children: [
              { id: rid(), type: 'chart', props: { kind: 'bar' } },
              { id: rid(), type: 'text', props: { value: 'Generated from prompt: ' + prompt.slice(0, 80) } },
            ],
          },
          {
            id: rid(),
            type: 'section',
            props: { title: 'Actions' },
            children: [
              { id: rid(), type: 'button', props: { label: 'Sync LIMS', variant: 'primary' } },
              { id: rid(), type: 'button', props: { label: 'Export Report', variant: 'ghost' } },
            ],
          },
        ],
      },
    ],
  };
}

// Generate biologics-specific app
function generateBiologicsApp(prompt) {
  return {
    'App.jsx': `import React, { useState } from "react";
import { FlaskConical, Microscope, TrendingUp, Database, Activity, FileBarChart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="text-indigo-600" size={28} />
            <h1 className="text-2xl font-bold text-slate-800">Biologics Dashboard</h1>
          </div>
          <div className="text-sm text-slate-600">NewGen Studio • Pharma Edition</div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {['overview', 'pipeline', 'analytics', 'data'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={\`px-4 py-3 text-sm font-medium capitalize transition-colors \${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 hover:text-slate-900'}\`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Active Assays */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Microscope className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Active Assays</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">24</p>
            <p className="text-sm text-slate-600 mt-2">+3 from last week</p>
          </div>

          {/* Card 2: Success Rate */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">89%</p>
            <p className="text-sm text-slate-600 mt-2">Above target threshold</p>
          </div>

          {/* Card 3: Datasets */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Datasets</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">156</p>
            <p className="text-sm text-slate-600 mt-2">Ready for analysis</p>
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="text-indigo-600" size={20} />
            Pipeline Status
          </h3>
          <div className="space-y-3">
            {['Protein Purification', 'Mass Spectrometry', 'Quality Control'].map((stage, idx) => (
              <div key={stage} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">{stage}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  {idx === 0 ? 'In Progress' : idx === 1 ? 'Pending' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Display */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <FileBarChart className="text-slate-600" size={20} />
            Generated from Prompt
          </h3>
          <pre className="text-sm bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto">{prompt}</pre>
        </div>
      </main>
    </div>
  );
}`,
    'styles.css': `body { margin: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
* { box-sizing: border-box; }
.lucide { display: inline-block; }`
  };
}

// Generate general-purpose app
function generateGeneralApp(prompt) {
  return {
    'App.jsx': `import React, { useState } from "react";
import { Sparkles, Zap, Rocket, Star, CheckCircle } from "lucide-react";

export default function App() {
  const [count, setCount] = useState(0);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Design interface', done: true },
    { id: 2, text: 'Implement features', done: false },
    { id: 3, text: 'Deploy to production', done: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? {...t, done: !t.done} : t));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="text-violet-600" size={40} />
            <h1 className="text-5xl font-bold text-slate-800">NewGen App</h1>
          </div>
          <p className="text-slate-600 text-lg">Built with NewGen Studio AI</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Counter Widget */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" size={24} />
              Interactive Counter
            </h2>
            <div className="bg-gradient-to-r from-violet-100 to-pink-100 rounded-xl p-8 mb-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-slate-900 mb-6">{count}</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setCount(count - 1)}
                    className="px-6 py-3 bg-white text-slate-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    - Decrease
                  </button>
                  <button
                    onClick={() => setCount(0)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setCount(count + 1)}
                    className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:bg-violet-700 transition-all hover:scale-105"
                  >
                    Increase +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Task List Widget */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={24} />
              Task Tracker
            </h2>
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={\`p-4 rounded-lg cursor-pointer transition-all \${
                    task.done 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-slate-50 border-2 border-slate-200 hover:border-violet-300'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <div className={\`w-5 h-5 rounded-full flex items-center justify-center \${
                      task.done ? 'bg-green-500' : 'bg-slate-300'
                    }\`}>
                      {task.done && <CheckCircle className="text-white" size={14} />}
                    </div>
                    <span className={\`font-medium \${task.done ? 'text-green-700 line-through' : 'text-slate-700'}\`}>
                      {task.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <Zap className="text-yellow-500 mb-3" size={32} />
            <h3 className="font-semibold text-slate-800 mb-1">Fast</h3>
            <p className="text-sm text-slate-600">Lightning performance</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <Rocket className="text-blue-500 mb-3" size={32} />
            <h3 className="font-semibold text-slate-800 mb-1">Powerful</h3>
            <p className="text-sm text-slate-600">Full-featured suite</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <Sparkles className="text-purple-500 mb-3" size={32} />
            <h3 className="font-semibold text-slate-800 mb-1">AI-Powered</h3>
            <p className="text-sm text-slate-600">Smart generation</p>
          </div>
        </div>

        {/* Prompt Display */}
        <div className="mt-6 bg-slate-900 rounded-2xl shadow-xl p-6">
          <p className="text-slate-400 text-xs mb-3 uppercase tracking-wide">Generated from prompt:</p>
          <pre className="text-slate-100 text-sm overflow-auto leading-relaxed">{prompt}</pre>
        </div>
      </div>
    </div>
  );
}`,
    'styles.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body { 
  margin: 0; 
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

* { 
  box-sizing: border-box; 
}

.lucide { 
  display: inline-block; 
}`
  };
}

export const runAI = async (prompt) => {
  // Check for explicit DEMO_MODE flag
  if (process.env.DEMO_MODE === 'true') {
    console.warn('[AI Service] Running in DEMO_MODE - returning placeholder spec');
    const isBiologics = isBiologicsPrompt(prompt);
    const files = isBiologics ? generateBiologicsApp(prompt) : generateGeneralApp(prompt);
    const layout = isBiologics ? buildBiologicsLayout(prompt) : buildGeneralLayout(prompt);
    
    return {
      status: 'ok',
      mode: 'demo',
      files,
      layout,
      schema: layout,
      messages: [
        { 
          role: 'assistant', 
          content: '⚠️ DEMO MODE: This is placeholder data. Set DEMO_MODE=false and configure OPENAI_API_KEY for real generation.'
        }
      ]
    };
  }
  
  // REAL OPENAI GENERATION
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
    throw new Error('OPENAI_API_KEY not configured. Cannot generate app. Set DEMO_MODE=true for placeholder behavior.');
  }
  
  try {
    console.log('[AI Service] Using OpenAI for real generation');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const systemPrompt = `You are an expert React application generator for NewGen Studio.

Generate a complete, production-ready React application based on the user's description.

Return ONLY valid JSON in this EXACT format:
{
  "status": "ok",
  "mode": "generated",
  "files": {
    "App.jsx": "...complete React component code...",
    "styles.css": "...complete CSS code..."
  },
  "layout": {
    "id": "layout-xxx",
    "name": "App Name",
    "domain": "generic",
    "nodes": [
      {
        "id": "xxx",
        "type": "page",
        "props": {"title": "Page Title"},
        "children": [...]
      }
    ]
  },
  "schema": {...same as layout...},
  "messages": [
    {"role": "assistant", "content": "Brief description of what was generated"}
  ]
}

REQUIREMENTS:
- App.jsx must be a complete, working React component
- Use modern React (hooks, functional components)
- Use Tailwind CSS for styling
- Include lucide-react icons where appropriate
- Make it beautiful and professional
- Ensure all imports are correct
- Code must be production-ready`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096, // Allow longer responses for complete apps
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    console.log('[AI Service] Successfully generated app with OpenAI');
    
    return {
      status: 'ok',
      mode: 'generated',
      ...result
    };
  } catch (error) {
    console.error('[AI Service] OpenAI error:', error.message);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};

/**
 * TODO: Replace with real AI integration
 * 
 * Example OpenAI Integration:
 * 
 * import OpenAI from 'openai';
 * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 * 
 * export const runAI = async (prompt) => {
 *   const systemPrompt = `You are a code generator for NewGen Studio. Generate React components with Tailwind CSS.
 *   Return JSON: { files: { "App.jsx": "...", "styles.css": "..." }, messages: [{role: "assistant", content: "..."}] }`;
 *   
 *   const response = await openai.chat.completions.create({
 *     model: 'gpt-4-turbo-preview',
 *     messages: [
 *       { role: 'system', content: systemPrompt },
 *       { role: 'user', content: prompt }
 *     ],
 *     response_format: { type: 'json_object' }
 *   });
 *   
 *   return JSON.parse(response.choices[0].message.content);
 * };
 * 
 * Example Google Gemini Integration:
 * 
 * import { GoogleGenerativeAI } from '@google/generative-ai';
 * const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 * 
 * export const runAI = async (prompt) => {
 *   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
 *   const result = await model.generateContent(prompt);
 *   // Parse and format response...
 *   return formattedResponse;
 * };
 */
