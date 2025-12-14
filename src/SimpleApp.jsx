import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import RequireAuth from './auth/RequireAuth';

const ACCESS_CODE = 'newgen-beta';

function BetaGate() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      localStorage.setItem('ng_beta_access', 'true');
      navigate('/app', { replace: true });
    } else {
      setError('Invalid access code.');
    }
  };
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at center, #EEF4FF 0%, #EDEAFF 100%)' 
    }}>
      <div style={{ 
        background: '#ffffff', 
        padding: '48px 40px', 
        borderRadius: '24px', 
        boxShadow: '0 20px 40px -10px rgba(97, 228, 197, 0.15)', 
        width: '100%', 
        maxWidth: '420px', 
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e1b4b', margin: '0 0 8px' }}>NewGen Studio</h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>Private Beta Access</p>
        <form onSubmit={handleSubmit}>
          <input 
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              margin: '16px 0', 
              textAlign: 'center', 
              fontSize: '16px' 
            }}
            type="password" 
            placeholder="Enter Access Code" 
            value={code} 
            onChange={e => setCode(e.target.value)} 
            autoFocus 
          />
          {error && <p style={{ color: '#ef4444', fontSize: '12px', margin: '8px 0' }}>{error}</p>}
          <button 
            type="submit"
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              color: 'white', 
              padding: '14px', 
              borderRadius: '12px', 
              fontWeight: '600', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '16px' 
            }}
          >
            Enter Studio
          </button>
        </form>
      </div>
    </div>
  );
}

// Simple inline AppShell
function AppShell() {
  const navigate = useNavigate();
  
  const handleSignOut = () => {
    localStorage.removeItem('ng_beta_access');
    navigate('/gate', { replace: true });
  };
  
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <div style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '20px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>NewGen Studio</h2>
        <nav>
          <div 
            onClick={() => navigate('/app')}
            style={{ padding: '10px', background: '#8b5cf6', color: 'white', borderRadius: '8px', marginBottom: '5px', cursor: 'pointer' }}
          >
            Dashboard
          </div>
          <div 
            onClick={() => navigate('/app/build')}
            style={{ padding: '10px', color: '#64748b', cursor: 'pointer' }}
          >
            Build
          </div>
          <div 
            onClick={() => navigate('/app/projects')}
            style={{ padding: '10px', color: '#64748b', cursor: 'pointer' }}
          >
            Projects
          </div>
          <div 
            onClick={() => navigate('/app/templates')}
            style={{ padding: '10px', color: '#64748b', cursor: 'pointer' }}
          >
            Templates
          </div>
        </nav>
        <button 
          onClick={handleSignOut}
          style={{ 
            marginTop: '20px', 
            padding: '8px 16px', 
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          Sign Out
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Welcome to NewGen Studio!</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Describe your app, preview instantly, refine with AI.</p>
      
      <div style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div 
            onClick={() => navigate('/app/build')}
            style={{ padding: '20px', background: '#f5f3ff', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚀</div>
            <div style={{ fontWeight: '600' }}>Build New App</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Start from scratch</div>
          </div>
          <div 
            onClick={() => navigate('/app/templates')}
            style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontWeight: '600' }}>Templates</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Browse prebuilt apps</div>
          </div>
          <div 
            onClick={() => navigate('/app/simulations')}
            style={{ padding: '20px', background: '#eff6ff', borderRadius: '12px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔬</div>
            <div style={{ fontWeight: '600' }}>Simulations</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Run protocol tests</div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0' 
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Recent Projects</h3>
        <div style={{ fontSize: '14px', color: '#64748b' }}>No projects yet. Start building!</div>
      </div>
    </div>
  );
}

function BuildPage() {
  const [prompt, setPrompt] = useState(() => {
    const saved = localStorage.getItem('ng_build_prompt');
    return saved || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState(() => {
    const saved = localStorage.getItem('ng_generated_app');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Save prompt to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('ng_build_prompt', prompt);
  }, [prompt]);

  // Save generated app to localStorage whenever it changes
  React.useEffect(() => {
    if (generatedApp) {
      localStorage.setItem('ng_generated_app', JSON.stringify(generatedApp));
    }
  }, [generatedApp]);

  const handleClear = () => {
    setGeneratedApp(null);
    localStorage.removeItem('ng_generated_app');
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setStatusMessage('Initializing...');
    
    let progressInterval;
    let timeoutId;
    
    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      
      setStatusMessage('Analyzing your requirements...');
      
      console.log('Sending request to:', 'http://localhost:4000/api/generate');
      console.log('Prompt:', prompt.trim());
      
      // Set a 60 second timeout
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000);
      
      const response = await fetch('http://localhost:4000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          currentApp: generatedApp // Send existing app for refinement
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage('Generation complete!');
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Generation failed: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Generated data:', data);
      console.log('Generation mode:', data.mode); // Log mode: 'demo' | 'generated' | 'refined'
      
      // Show warning if in demo mode
      if (data.mode === 'demo') {
        console.warn('⚠️ DEMO MODE: Backend returned placeholder data');
      }
      
      setGeneratedApp(data);
      setPrompt(''); // Clear prompt after success
      
      setTimeout(() => {
        setProgress(0);
        setStatusMessage('');
      }, 1000);
    } catch (err) {
      console.error('Generation error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. The AI service is taking too long. Please try a simpler prompt or try again later.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on port 4000.');
      } else {
        setError(err.message || 'Failed to generate app');
      }
      setProgress(0);
      setStatusMessage('');
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Build New App</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Describe your app in plain language, and we'll generate a fully functional interface
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '24px',
        height: 'calc(100vh - 240px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                {generatedApp ? 'Refine Your App' : 'Describe Your App'}
              </h3>
              {generatedApp && (
                <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                  Refine Mode
                </span>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={generatedApp ? "Refine the app: 'Add a search bar', 'Make it more modern', 'Add validation'..." : "Example: Create a sample tracking app for a biologics lab. Include fields for sample ID, collection date, storage location, and test results."}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                marginBottom: '12px'
              }}
            />
            
            {attachments.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {attachments.map(file => (
                  <div key={file.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    marginBottom: '6px',
                    fontSize: '13px'
                  }}>
                    <span>📎</span>
                    <span style={{ flex: 1, color: '#475569' }}>{file.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      onClick={() => removeAttachment(file.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '0 4px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{
                padding: '10px 16px',
                background: '#f1f5f9',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <span style={{ fontSize: '18px' }}>+</span>
                <span>Attach</span>
                <input 
                  type="file" 
                  multiple
                  onChange={handleFileAttach}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.txt,.json,.csv"
                />
              </label>
              <button 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                style={{
                  flex: 1,
                  background: !prompt.trim() || isGenerating 
                    ? '#e2e8f0' 
                    : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: !prompt.trim() || isGenerating ? '#94a3b8' : 'white',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {isGenerating ? 'Generating...' : (generatedApp ? '🔄 Refine App' : '✨ Generate App')}
              </button>
              {generatedApp && (
                <button 
                  onClick={() => { setGeneratedApp(null); setPrompt(''); }}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + New App
                </button>
              )}
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              💡 {generatedApp ? 'Refinement Ideas' : 'Tips'}
            </h3>
            {generatedApp ? (
              <ul style={{ fontSize: '13px', color: '#64748b', margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>"Add a search bar to filter results"</li>
                <li>"Make the design more modern"</li>
                <li>"Add validation to the form"</li>
                <li>"Include export to Excel button"</li>
                <li>"Add user authentication"</li>
                <li>"Show charts for analytics"</li>
              </ul>
            ) : (
              <ul style={{ fontSize: '13px', color: '#64748b', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Be specific about data fields and workflows</li>
                <li>Mention user roles if needed</li>
                <li>Include any calculations or automation</li>
              </ul>
            )}
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          padding: '32px', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
          {error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#ef4444' }}>
                Error
              </h3>
              <p style={{ color: '#64748b' }}>{error}</p>
              <button 
                onClick={() => setError(null)}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
            </div>
          ) : isGenerating ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>⚡</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                Generating Your App...
              </h3>
              <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>{statusMessage}</p>
              
              <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ 
                  background: '#e2e8f0', 
                  height: '8px', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                    height: '100%',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease',
                    borderRadius: '4px'
                  }} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                  {Math.round(progress)}%
                </div>
              </div>
              
              <div style={{ marginTop: '24px', fontSize: '13px', color: '#94a3b8' }}>
                <div style={{ marginBottom: '8px' }}>✓ Parsing requirements</div>
                <div style={{ marginBottom: '8px' }}>✓ Designing layout</div>
                <div style={{ opacity: progress > 50 ? 1 : 0.3 }}>✓ Generating components</div>
              </div>
            </div>
          ) : generatedApp ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Preview</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      const projectData = {
                        id: Date.now(),
                        name: prompt.substring(0, 50) || 'Untitled App',
                        data: generatedApp,
                        createdAt: new Date().toISOString()
                      };
                      const saved = JSON.parse(localStorage.getItem('ng_projects') || '[]');
                      saved.push(projectData);
                      localStorage.setItem('ng_projects', JSON.stringify(saved));
                      alert('✓ App saved to Projects!');
                    }}
                    style={{
                      padding: '6px 16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    💾 Save
                  </button>
                  <button 
                    onClick={handleClear}
                    style={{
                      padding: '6px 12px',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
                {generatedApp?.mode === 'demo' && (
                  <div style={{
                    background: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                        DEMO MODE
                      </div>
                      <div style={{ fontSize: '13px', color: '#78350f' }}>
                        This is placeholder data. Configure OPENAI_API_KEY and set DEMO_MODE=false in backend/.env for real AI generation.
                      </div>
                    </div>
                  </div>
                )}
                <GeneratedAppPreview data={generatedApp} />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>App Preview</h3>
              <p style={{ color: '#64748b' }}>Your generated app will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GeneratedAppPreview({ data }) {
  const [formData, setFormData] = React.useState({});
  const [submittedData, setSubmittedData] = React.useState([]);
  const [showToast, setShowToast] = React.useState(false);
  
  if (!data || !data.children) return null;
  
  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = () => {
    setSubmittedData(prev => [...prev, { ...formData, timestamp: new Date().toISOString() }]);
    setFormData({});
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const renderNode = (node) => {
    const { type, props, children } = node;
    
    const baseStyles = {
      section: { marginBottom: '24px' },
      card: { background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' },
      header: { fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e293b' },
      subheader: { fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#334155' },
      text: { fontSize: '14px', color: '#64748b', marginBottom: '8px' },
      label: { fontSize: '13px', fontWeight: '500', color: '#475569', marginBottom: '4px', display: 'block' },
      input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '12px' },
      button: { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
      grid: { display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' },
      flex: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
      table: { width: '100%', borderCollapse: 'collapse' },
      th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#475569' },
      td: { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b' }
    };
    
    const style = { ...baseStyles[type], ...props?.style };
    const key = node.id || Math.random();
    
    if (type === 'input') {
      return (
        <input 
          key={key} 
          type="text" 
          placeholder={props?.placeholder}
          value={formData[node.id] || ''}
          onChange={(e) => handleInputChange(node.id, e.target.value)}
          style={style} 
        />
      );
    }
    
    if (type === 'button') {
      return (
        <button 
          key={key} 
          onClick={handleSubmit}
          style={style}
        >
          {props?.label || 'Button'}
        </button>
      );
    }
    
    if (type === 'table') {
      const allRows = [...(props?.rows || []), ...submittedData.map(item => 
        Object.values(item).slice(0, props?.columns?.length || 3)
      )];
      
      return (
        <table key={key} style={style}>
          <thead>
            <tr>
              {props?.columns?.map((col, i) => (
                <th key={i} style={baseStyles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={baseStyles.td}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    const Tag = ['section', 'card', 'header', 'grid', 'flex'].includes(type) ? 'div' : 'div';
    
    return (
      <Tag key={key} style={style}>
        {props?.title && <div style={baseStyles.subheader}>{props.title}</div>}
        {props?.label && <label style={baseStyles.label}>{props.label}</label>}
        {props?.text && <div style={baseStyles.text}>{props.text}</div>}
        {children?.map(child => renderNode(child))}
      </Tag>
    );
  };
  
  return (
    <div style={{ maxWidth: '1200px' }}>
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontWeight: '600'
        }}>
          ✓ Data submitted successfully!
        </div>
      )}
      {data.children.map(node => renderNode(node))}
    </div>
  );
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState([]);
  
  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ng_projects') || '[]');
    setProjects(saved);
  }, []);
  
  const handleDelete = (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('ng_projects', JSON.stringify(updated));
  };
  
  if (projects.length === 0) {
    return (
      <div style={{ padding: '40px', maxWidth: '1400px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Projects</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Manage your NewGen Studio projects</p>
        
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>No Projects Yet</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Start building your first app to see it here
          </p>
          <button 
            onClick={() => navigate('/app/build')}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}>
            Create New Project
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '40px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Projects</h1>
          <p style={{ color: '#64748b', margin: 0 }}>You have {projects.length} saved project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button 
          onClick={() => navigate('/app/build')}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
          + New Project
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {projects.map(project => (
          <div key={project.id} style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            cursor: 'pointer'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{project.name}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => {
                  localStorage.setItem('ng_generated_app', JSON.stringify(project.data));
                  navigate('/app/build');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                Open
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this project?')) handleDelete(project.id);
                }}
                style={{
                  padding: '8px 12px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplatesPage() {
  const templates = [
    { id: 1, name: 'General Lab App', description: 'Complete lab management system', icon: '🔬', color: '#f5f3ff' },
    { id: 2, name: 'Biologics Manufacturing', description: 'Track fermentation and purification', icon: '🧪', color: '#f0fdf4' },
    { id: 3, name: 'Clinical Trials', description: 'Patient enrollment and data collection', icon: '📊', color: '#eff6ff' },
    { id: 4, name: 'Quality Control Lab', description: 'Sample testing and COA generation', icon: '✓', color: '#fef3f2' },
    { id: 5, name: 'Research Lab', description: 'Experiment design and data analysis', icon: '🧬', color: '#fffbeb' },
    { id: 6, name: 'Inventory Management', description: 'Track reagents and equipment', icon: '📦', color: '#fdf2f8' }
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>App Templates</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Start with a pre-built template and customize it to your needs
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '24px' 
      }}>
        {templates.map(template => (
          <div 
            key={template.id}
            style={{ 
              background: 'white', 
              padding: '32px', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              width: '72px',
              height: '72px',
              background: template.color,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {template.icon}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              {template.name}
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              {template.description}
            </p>
            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              padding: '10px',
              borderRadius: '10px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimulationsPage() {
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const protocols = [
    {
      id: 1,
      name: 'Fermentation Scale-Up',
      description: 'Simulate scaling from 5L to 500L bioreactor',
      parameters: ['Temperature', 'pH', 'Dissolved Oxygen', 'Agitation Speed'],
      icon: '🔬',
      color: '#f5f3ff'
    },
    {
      id: 2,
      name: 'Protein Purification',
      description: 'Optimize column chromatography conditions',
      parameters: ['Buffer Composition', 'Flow Rate', 'Gradient Profile'],
      icon: '⚗️',
      color: '#f0fdf4'
    },
    {
      id: 3,
      name: 'Cell Culture Growth',
      description: 'Predict cell density and viability over time',
      parameters: ['Seeding Density', 'Media Type', 'Feed Schedule'],
      icon: '🧫',
      color: '#eff6ff'
    }
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1400px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Protocol Simulations</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        Run virtual experiments and optimize your protocols before executing in the lab
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: selectedProtocol ? '1fr 2fr' : '1fr', 
        gap: '24px' 
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            Available Protocols
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {protocols.map(protocol => (
              <div 
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol)}
                style={{ 
                  background: selectedProtocol?.id === protocol.id ? protocol.color : 'white',
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: selectedProtocol?.id === protocol.id ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '24px' }}>{protocol.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{protocol.name}</div>
                </div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                  {protocol.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedProtocol && (
          <div style={{ 
            background: 'white', 
            padding: '32px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0' 
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{selectedProtocol.icon}</div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                {selectedProtocol.name}
              </h2>
              <p style={{ color: '#64748b' }}>{selectedProtocol.description}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Simulation Parameters
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedProtocol.parameters.map((param, idx) => (
                  <div key={idx}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '6px',
                      color: '#1e293b'
                    }}>
                      {param}
                    </label>
                    <input 
                      type="text" 
                      placeholder={`Enter ${param.toLowerCase()}`}
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}>
                Run Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function SimpleApp() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/gate" element={<BetaGate />} />
      <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="simulations" element={<SimulationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
