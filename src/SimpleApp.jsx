import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { exportToPlatform, fetchMetrics as fetchMetricsApi, getApiBase, importFromPlatform } from './api/client';
import Landing from './pages/Landing';
import Portfolio from './pages/Portfolio';
import RequireAuth from './auth/RequireAuth';
import WelcomeModal from './components/WelcomeModal';
import StatusPage from './pages/StatusPage';
import ComingSoon from './pages/ComingSoon';
import ModeSelector from './components/ModeSelector';
import FormatIndicator from './components/FormatIndicator';
import RoutingModal from './components/RoutingModal';
import ProgressDisplay from './components/ProgressDisplay';
import FeedbackPrompt from './components/FeedbackPrompt';
import LearningInsights from './components/LearningInsights';

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

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSignOut = () => {
    localStorage.removeItem('ng_beta_access');
    navigate('/gate', { replace: true });
  };
  
  const navItems = [
    { label: 'Dashboard', path: '/app', icon: '📊' },
    { label: 'Build', path: '/app/build', icon: '⚗️' },
    { label: 'Insights', path: '/app/insights', icon: '🧠' },
    { label: 'Status', path: '/app/status', icon: '🩺' },
    { label: 'Projects', path: '/app/projects', icon: '🧪' },
    { label: 'Templates', path: '/app/templates', icon: '🧬' },
  ];

  const NavButton = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <div
        onClick={() => navigate(item.path)}
        style={{
          padding: '12px 14px',
          borderRadius: '12px',
          marginBottom: '10px',
          cursor: 'pointer',
          background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
          color: active ? 'white' : '#0f172a',
          fontWeight: 600,
          boxShadow: active ? '0 10px 30px rgba(99,102,241,0.28)' : 'none',
          border: active ? '1px solid rgba(255,255,255,0.25)' : '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at 22% 18%, #eef2ff 0%, #f4f7fb 35%, #f8fafc 100%)' }}>
      <div style={{ width: '280px', padding: '22px', backdropFilter: 'blur(10px)', background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245,248,252,0.95) 100%)', borderRight: '1px solid #e5e7eb', boxShadow: '6px 0 32px rgba(109,125,255,0.08)' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>NewGen Studio</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Biologics & Pharma Builder</div>
        </div>
        <nav>
          {navItems.map(item => <NavButton key={item.path} item={item} />)}
        </nav>
        <div style={{ marginTop: '28px', padding: '14px', borderRadius: '12px', background: 'rgba(248,250,252,0.85)', border: '1px solid #e5e7eb', color: '#475569', fontSize: '12px', lineHeight: 1.5, boxShadow: '0 10px 26px rgba(15,23,42,0.05)' }}>
          <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>Safety-first</strong>
          Domain-aware workflows with compliant defaults for regulated teams.
        </div>
        <button
          onClick={handleSignOut}
          style={{
            marginTop: '18px',
            width: '100%',
            padding: '10px 14px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 12px 24px rgba(239,68,68,0.25)'
          }}
        >
          Sign Out
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 24px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div onClick={() => navigate('/app/build')} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>Build New App</h3>
          <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>Describe what you want and we'll generate it</p>
        </div>
      </div>
    </div>
  );
}

function BuildPage() {
  const [prompt, setPrompt] = useState(() => localStorage.getItem('ng_build_prompt') || '');
  const [status, setStatus] = useState('idle');
  const [slowHint, setSlowHint] = useState(false);
  const [generatedApp, setGeneratedApp] = useState(null);
  const [problems, setProblems] = useState([]);
  const [mode, setMode] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [metricsStatus, setMetricsStatus] = useState('idle');
  const [exportStatus, setExportStatus] = useState('idle');
  const [exportFormat, setExportFormat] = useState('base44');
  const fileInputRef = React.useRef(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [polishMode, setPolishMode] = useState(false);
  const [phases, setPhases] = useState([
    { id: 'prep', label: 'Prep request', status: 'pending' },
    { id: 'ai', label: 'AI generation', status: 'pending' },
    { id: 'validate', label: 'Validation', status: 'pending' },
    { id: 'render', label: 'Render', status: 'pending' }
  ]);

  // New state for dual-mode input
  const [inputMode, setInputMode] = useState('no-code');
  const [detectedFormat, setDetectedFormat] = useState(null);
  const [formatConfidence, setFormatConfidence] = useState(0);
  const [formatErrors, setFormatErrors] = useState([]);
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [routingOptions, setRoutingOptions] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimer, setFeedbackTimer] = useState(null);
  const [triplePowerSteps, setTriplePowerSteps] = useState([]);
  const [showTripleProgress, setShowTripleProgress] = useState(false);

  const apiBase = getApiBase();
  const isGenerating = status === 'loading';

  React.useEffect(() => {
    localStorage.setItem('ng_build_prompt', prompt);
  }, [prompt]);

  const fetchMetrics = React.useCallback(async () => {
    setMetricsStatus('loading');
    try {
      const data = await fetchMetricsApi();
      setMetrics(data.metrics || null);
      setMetricsStatus('success');
    } catch (e) {
      console.warn('Metrics fetch failed:', e.message);
      setMetricsStatus('error');
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics().catch(() => {});
  }, [fetchMetrics]);

  // Welcome modal: show once per user/session after entering builder
  React.useEffect(() => {
    const seen = localStorage.getItem('ng_welcome_seen') === 'true' || sessionStorage.getItem('ng_welcome_dismissed') === 'true';
    if (!seen) setShowWelcome(true);
  }, []);

  // Timer to show elapsed time during generation
  React.useEffect(() => {
    let interval;
    if (isGenerating && generationStartTime) {
      interval = setInterval(() => {
        setElapsed(Math.round((Date.now() - generationStartTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generationStartTime]);

  const resetPhases = React.useCallback(() => {
    setPhases([
      { id: 'prep', label: 'Prep request', status: 'active' },
      { id: 'ai', label: 'AI generation', status: 'pending' },
      { id: 'validate', label: 'Validation', status: 'pending' },
      { id: 'render', label: 'Render', status: 'pending' }
    ]);
  }, []);

  const setPhaseStatus = React.useCallback((id, status) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  const advancePhase = React.useCallback((fromId, toId) => {
    setPhases(prev => prev.map(p => {
      if (p.id === fromId) return { ...p, status: 'done' };
      if (p.id === toId) return { ...p, status: 'active' };
      return p;
    }));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const HARD_TIMEOUT_MS = 90000; // Allow up to 90s for backend AI calls (domain-complete generation)

    resetPhases();
    setStatus('loading');
    setSlowHint(false);
    setProblems([]);
    setMode(null);
    setElapsed(0);
    setGenerationStartTime(Date.now());
    setDebugInfo(null); // Clear previous debug info

    const slowHintTimer = setTimeout(() => setSlowHint(true), 5000); // Show hint after 5s
    const controller = new AbortController();
    const hardTimer = setTimeout(() => controller.abort(), HARD_TIMEOUT_MS);
    
    const requestPayload = { 
      prompt, 
      currentApp: polishMode ? generatedApp : null, 
      mode: polishMode ? 'polish' : 'generate',
      inputMode  // Add input mode to request
    };
    const requestStartTime = Date.now();
    advancePhase('prep', 'ai');
    
    try {
      const resp = await fetch(`${apiBase}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });
      const requestDuration = Date.now() - requestStartTime;
      
      clearTimeout(hardTimer);
      clearTimeout(slowHintTimer);
      setSlowHint(false);
      
      if (!resp.ok) {
        setPhaseStatus('ai', 'error');
        throw new Error(`Server returned ${resp.status}`);
      }
      
      const result = await resp.json();
      console.log('Generation result:', result);

      // Check if routing confirmation is needed
      if (result.status === 'needs-confirmation') {
        console.log('Routing confirmation needed');
        clearTimeout(hardTimer);
        clearTimeout(slowHintTimer);
        setSlowHint(false);
        setStatus('idle');
        setGenerationStartTime(null);
        
        // Show routing modal
        setRoutingOptions(result);
        setShowRoutingModal(true);
        return;
      }

      setPhaseStatus('ai', 'done');
      setPhaseStatus('validate', 'active');

      // Capture debug metadata for debug mode
      const capturedDebug = {
        requestUrl: `${apiBase}/api/generate`,
        requestPayload,
        requestDuration,
        responseStatus: resp.status,
        responseMode: result.mode,
        responseProblems: result.problems || [],
        rawSpec: result,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(capturedDebug);

      // Capture metrics snapshot when present (dev-only from backend)
      if (result?.meta?.metrics) {
        setMetrics(result.meta.metrics);
        setMetricsStatus('success');
      }
      
      // Extract response data
      const hasChildren = Array.isArray(result.children) && result.children.length > 0;
      const hasProblems = Array.isArray(result.problems) && result.problems.length > 0;
      
      // Update state with complete response
      setMode(result.mode || 'generated');
      setProblems(result.problems || []);
      setStatus('success');
      setPhaseStatus('validate', 'done');
      setPhaseStatus('render', 'done');

      // Start feedback timer (show feedback modal after 30 seconds)
      if (hasChildren && !hasProblems) {
        const timer = setTimeout(() => {
          setShowFeedback(true);
        }, 30000);
        setFeedbackTimer(timer);
      }
      
      if (hasProblems || result.status === 'error') {
        // Has errors or fallback was used
        setGeneratedApp(result);
      } else if (hasChildren) {
        // Clean generation
        setGeneratedApp(result);
      } else {
        // No children and no problems — shouldn't happen with new backend
        setGeneratedApp(null);
        setProblems([{
          severity: 'warning',
          message: 'No layout was generated. Try a simpler prompt or run again.'
        }]);
      }
    } catch (err) {
      console.error('Generation error:', err);
      clearTimeout(hardTimer);
      clearTimeout(slowHintTimer);

      const isTimeout = err.name === 'AbortError' || err?.message === 'timeout';
      const errorMsg = isTimeout
        ? 'Generation took longer than 90s. Try a simpler prompt or check Status page for backend health.'
        : `Error: ${err.message}`;
      
      setPhases(prev => prev.map(p => p.status === 'active' ? { ...p, status: 'error' } : p));

      // Capture error in debug info
      setDebugInfo({
        requestUrl: `${apiBase}/api/generate`,
        requestPayload,
        requestDuration: Date.now() - requestStartTime,
        error: errorMsg,
        timestamp: new Date().toISOString()
      });
      
      setProblems([{
        severity: 'error',
        message: errorMsg
      }]);
      setGeneratedApp(null);
      setStatus(isTimeout ? 'timeout' : 'error');
    } finally {
      setStatus(prev => (prev === 'loading' ? 'idle' : prev));
      setGenerationStartTime(null);
      setSlowHint(false);
      fetchMetrics().catch(() => {});
    }
  };

  const handleExport = async () => {
    if (!generatedApp) return;
    setExportStatus('loading');
    try {
      const data = await exportToPlatform(
        generatedApp,
        { domain: 'pharma' },
        exportFormat === 'base44' ? 'base44' : 'raw'
      );
      
      // Download manifest as JSON
      const payload = exportFormat === 'base44' ? data.manifest : generatedApp;
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFormat === 'base44' ? `newgen-app-${Date.now()}.base44.json` : `newgen-app-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('success');
    } catch (err) {
      console.error('Export error:', err);
      setExportStatus('error');
    }
  };

  const handleRouteChoice = async (route) => {
    console.log('User chose route:', route);
    setShowRoutingModal(false);
    
    // Call confirm-route endpoint
    try {
      setStatus('loading');
      setGenerationStartTime(Date.now());
      resetPhases();
      
      const resp = await fetch(`${apiBase}/api/generate/confirm-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          route,
          inputMode
        })
      });
      
      const result = await resp.json();
      
      // Process result same as normal generation
      setPhaseStatus('ai', 'done');
      setPhaseStatus('validate', 'done');
      setPhaseStatus('render', 'done');
      
      setMode(result.mode || 'generated');
      setProblems(result.problems || []);
      setStatus('success');
      
      const hasChildren = Array.isArray(result.children) && result.children.length > 0;
      if (hasChildren) {
        setGeneratedApp(result);
        
        // Start feedback timer
        const timer = setTimeout(() => {
          setShowFeedback(true);
        }, 30000);
        setFeedbackTimer(timer);
      }
      
    } catch (err) {
      console.error('Route confirmation error:', err);
      setProblems([{ severity: 'error', message: err.message }]);
      setStatus('error');
    } finally {
      setGenerationStartTime(null);
    }
  };

  const handleFeedbackSubmit = async (rating) => {
    console.log('Feedback submitted:', rating);
    
    try {
      await fetch(`${apiBase}/api/generate/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: generatedApp?.id || Date.now().toString(),
          rating,
          comments: ''
        })
      });
    } catch (err) {
      console.error('Feedback submission error:', err);
    }
  };

  const handleFeedbackSkip = () => {
    setShowFeedback(false);
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      setFeedbackTimer(null);
    }
  };

  // Cleanup feedback timer on unmount
  React.useEffect(() => {
    return () => {
      if (feedbackTimer) {
        clearTimeout(feedbackTimer);
      }
    };
  }, [feedbackTimer]);

  const extractAppSpecFromManifest = (manifest) => {
    if (!manifest || typeof manifest !== 'object') return null;
    const candidates = [
      manifest.appSpec,
      manifest.schema,
      manifest.layout,
      manifest.spec,
      manifest
    ].filter(Boolean);
    for (const c of candidates) {
      if (c && Array.isArray(c.nodes)) {
        return { id: c.id || 'imported', name: c.name || 'Imported App', domain: c.domain || 'generic', children: c.nodes };
      }
      if (c && Array.isArray(c.children)) {
        return c;
      }
      if (c && c.layout && Array.isArray(c.layout.nodes)) {
        return { id: c.id || 'imported', name: c.name || 'Imported App', domain: c.domain || 'generic', children: c.layout.nodes };
      }
    }
    return null;
  };

  /**
   * Convert Base44 JSON to NewGen prompt text
   * @param {Object} base44Json - The imported Base44 format JSON
   * @returns {string} - Human-readable prompt text
   */
  const convertBase44ToPrompt = (base44Json) => {
    const parts = [];
    
    // Add app name/title
    if (base44Json.name || base44Json.title) {
      parts.push((base44Json.name || base44Json.title).toLowerCase());
    } else if (base44Json.project?.name) {
      parts.push(base44Json.project.name.toLowerCase());
    } else if (base44Json.layout?.name) {
      parts.push(base44Json.layout.name.toLowerCase());
    }
    
    // Process components from various possible locations
    const components = base44Json.components || 
                      base44Json.children || 
                      base44Json.layout?.components ||
                      base44Json.layout?.nodes ||
                      [];
    
    components.forEach(component => {
      const type = component.type;
      const props = component.props || {};
      
      // Handle table components
      if (type === 'table' || type === 'Table') {
        parts.push('with table');
        
        // Add columns
        if (props.columns && props.columns.length > 0) {
          const columnNames = props.columns.map(col => 
            typeof col === 'string' ? col : (col.label || col.key || col)
          );
          parts.push(`Columns: ${columnNames.join(', ')}`);
        }
        
        // Add sample data (first 2-3 rows)
        const data = props.data || props.rows || [];
        if (data.length > 0) {
          const sampleRows = data.slice(0, 2).map(row => {
            const columnNames = props.columns.map(col => 
              typeof col === 'string' ? col : (col.key || col.label)
            );
            return columnNames.map(colKey => row[colKey] || '-').join(' / ');
          });
          parts.push(`Data: ${sampleRows.join(', ')}`);
        }
      }
      
      // Handle form components
      else if (type === 'form' || type === 'Form') {
        parts.push('with form');
        
        const fields = props.fields || props.inputs || [];
        if (fields.length > 0) {
          const fieldNames = fields.map(f => f.name || f.label || f.key).join(', ');
          parts.push(`Fields: ${fieldNames}`);
        }
      }
      
      // Handle card/metric components
      else if (type === 'card' || type === 'Card' || type === 'metric') {
        if (props.title && props.value) {
          parts.push(`${props.title}: ${props.value}`);
        } else if (props.title) {
          parts.push(`${props.title} card`);
        }
      }
      
      // Handle section components
      else if (type === 'section' || type === 'Section') {
        if (props.title) {
          parts.push(`section: ${props.title}`);
        }
      }
      
      // Handle button components
      else if (type === 'button' || type === 'Button') {
        if (props.label || props.text) {
          parts.push(`button: ${props.label || props.text}`);
        }
      }
      
      // Generic component handling
      else if (type) {
        parts.push(`with ${type}`);
      }
    });
    
    // Join parts into readable prompt
    return parts.join('. ') + (parts.length > 0 ? '.' : '');
  };

  const handleImportFile = async (file) => {
    try {
      // Read file contents
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      // Convert Base44 JSON to prompt text
      const promptText = convertBase44ToPrompt(importedData);
      
      if (promptText) {
        // Update prompt state
        setPrompt(promptText);
        
        console.log('✅ Imported Base44 and populated prompt:', promptText);
        
        // Clear any existing generated app and show success
        setProblems([{ 
          severity: 'info', 
          message: 'BASE44 file imported successfully. Review the prompt and click "Generate App" to create your app.' 
        }]);
        setGeneratedApp(null);
        setMode(null);
      } else {
        setProblems([{ 
          severity: 'warning', 
          message: 'Imported file does not contain valid Base44 components. Please check the file format.' 
        }]);
      }
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      setProblems([{ 
        severity: 'error', 
        message: 'Failed to import file. Please ensure it is valid JSON.' 
      }]);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      {showWelcome && (
        <WelcomeModal
          onClose={() => { localStorage.setItem('ng_welcome_seen', 'true'); sessionStorage.setItem('ng_welcome_dismissed', 'true'); setShowWelcome(false); }}
          onStatus={() => { localStorage.setItem('ng_welcome_seen', 'true'); sessionStorage.setItem('ng_welcome_dismissed', 'true'); setShowWelcome(false); window.location.href = '/app/status'; }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(99,102,241,0.12)', color: '#4f46e5', borderRadius: '999px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(99,102,241,0.18)' }}>
            🧬 Biologics-ready • Compliance-minded
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: '900', margin: '12px 0 6px', color: '#0f172a' }}>Build New App</h1>
          <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>Describe your app in plain language. We’ll generate a structured, compliant layout for regulated domains.</p>
        </div>
        <div style={{ padding: '12px 14px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)', fontSize: '12px', color: '#0f172a' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Live guardrails</div>
          <div style={{ color: '#64748b' }}>Domain-aware patterns + AppSpec validation before render.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '20px' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', boxShadow: '0 14px 40px rgba(15,23,42,0.06)' }}>
          {/* Mode Selector */}
          <ModeSelector mode={inputMode} onModeChange={setInputMode} />
          
          {/* Format Indicator (for technical mode) */}
          <FormatIndicator 
            format={detectedFormat} 
            confidence={formatConfidence} 
            errors={formatErrors} 
          />
          
          <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Prompt</label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Sample Management (LIMS)', prompt: 'Build a GMP-compliant sample management app with sample tracking, chain of custody, test results, and audit trail for biologics lab' },
              { label: 'Biologics Batch Tracker', prompt: 'Create a batch tracking dashboard for biologics manufacturing with lot numbers, fermentation runs, quality checks, deviations, and batch genealogy' },
              { label: 'Stability Study Dashboard', prompt: 'Design a stability study management system with study protocols, time points, sample pull schedules, storage conditions, and trend analysis for pharma products' }
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(preset.prompt)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={inputMode === 'no-code' 
              ? "Describe your app in natural language..." 
              : "Paste JSX, HTML, JSON, or component list..."}
            style={{ 
              width: '100%', 
              height: inputMode === 'no-code' ? '150px' : '300px', 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              fontFamily: inputMode === 'no-code' ? 'inherit' : 'monospace', 
              fontSize: '14px', 
              resize: 'vertical', 
              background: '#f8fafc',
              transition: 'all 0.3s ease'
            }}
          />
          <button 
            onClick={handleGenerate}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '12px', boxShadow: '0 14px 30px rgba(99,102,241,0.30)' }}
            disabled={isGenerating}
          >
            {isGenerating ? `Generating... (${elapsed}s)` : 'Generate App'}
          </button>
          
          {/* Polish + Debug Mode */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => { setPolishMode(!polishMode); }}
              style={{ 
                flex: 1,
                padding: '10px', 
                background: polishMode ? '#10b981' : '#f8fafc', 
                color: polishMode ? 'white' : '#0f172a', 
                border: polishMode ? '1px solid #059669' : '1px solid #e2e8f0', 
                borderRadius: '10px', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontSize: '13px'
              }}
              disabled={!generatedApp}
              title={polishMode ? "Refinement mode ON - next generate will build on current app" : "Turn on to iteratively polish current app"}
            >
              {polishMode ? '✨ Polish Mode ON' : '🎯 Polish Mode'}
            </button>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              style={{ 
                flex: 1,
                padding: '10px', 
                background: debugMode ? '#f59e0b' : '#f8fafc', 
                color: debugMode ? 'white' : '#64748b', 
                border: debugMode ? '1px solid #d97706' : '1px solid #e2e8f0', 
                borderRadius: '10px', 
                fontWeight: 600, 
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {debugMode ? '🐛 Debug ON' : '🔍 Debug'}
            </button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Status phases</div>
            <PhaseTimeline phases={phases} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#0f172a', fontWeight: 600 }}>
              <option value="base44">Export: BASE44</option>
              <option value="raw">Export: Raw JSON</option>
            </select>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Import BASE44</button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ''; }} />
          </div>
          {generatedApp && (
            <>
              <button 
                onClick={handleExport}
                disabled={exportStatus === 'loading'}
                style={{ width: '100%', padding: '12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '10px', fontWeight: '700', boxShadow: '0 10px 24px rgba(14,165,233,0.25)' }}
              >
                {exportStatus === 'loading' ? 'Exporting...' : exportStatus === 'success' ? '✓ Exported' : 'Export BASE44'}
              </button>
              <button 
                onClick={() => {
                  setGeneratedApp(null);
                  setProblems([]);
                  setMode(null);
                  setMetrics(null);
                  setExportStatus('idle');
                }}
                style={{ width: '100%', padding: '10px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', marginTop: '8px', fontWeight: '600' }}
              >
                Clear
              </button>
            </>
          )}

          <div style={{ marginTop: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ color: '#0f172a' }}>Generation Metrics</strong>
              <button
                onClick={() => fetchMetrics()}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontSize: '12px' }}
              >
                {metricsStatus === 'loading' ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {metrics ? (
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Requests: {metrics.totals?.requests ?? 0}</span>
                  <span>Generated: {metrics.totals?.generated ?? 0}</span>
                  <span>Template: {metrics.totals?.templateFallbacks ?? 0}</span>
                  <span>Errors: {metrics.totals?.errors ?? 0}</span>
                </div>
                <div style={{ marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Avg elapsed: {metrics.averages?.elapsedMs ?? 0} ms</span>
                  <span>AI avg: {metrics.averages?.aiMs ?? 0} ms</span>
                  <span>Validation fails: {metrics.validationFailures ?? 0}</span>
                  <span>Viability fails: {metrics.viabilityFailures ?? 0}</span>
                </div>
                {metrics.ratios && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Generated: {metrics.ratios.generatedPct}%</span>
                    <span>Template: {metrics.ratios.templatePct}%</span>
                    <span>Error: {metrics.ratios.errorPct}%</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {metricsStatus === 'loading' ? 'Loading metrics...' : 'Metrics not available'}
              </div>
            )}
          </div>
          
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 14px 40px rgba(15,23,42,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(14,165,233,0.08), transparent 35%)' }} />
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isGenerating ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e1b4b', marginBottom: '8px' }}>Generating your app...</div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  {slowHint ? `Still generating (${elapsed}s elapsed, can take up to 90s)...` : `Elapsed: ${elapsed}s (up to 90s)`}
                </div>
                <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: '#e2e8f0', borderRadius: '999px', margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', width: `${Math.min((elapsed / 90) * 100, 100)}%`, transition: 'width 0.3s ease', borderRadius: '999px' }} />
                </div>
              </div>
            ) : problems.length > 0 ? (
              <ProblemCard problems={problems} mode={mode} app={generatedApp} />
            ) : generatedApp && Array.isArray(generatedApp.children) && generatedApp.children.length > 0 ? (
              <RenderApp app={generatedApp} />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>App Preview</h3>
                <p style={{ color: '#64748b' }}>Your generated app will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Routing Confirmation Modal */}
      {showRoutingModal && routingOptions && (
        <RoutingModal
          routing={routingOptions.routing}
          options={routingOptions.options}
          onChoose={handleRouteChoice}
          onCancel={() => setShowRoutingModal(false)}
        />
      )}

      {/* Feedback Prompt Modal */}
      {showFeedback && (
        <FeedbackPrompt
          appId={generatedApp?.id || Date.now().toString()}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
        />
      )}

      {/* Triple Power Combo Progress */}
      <ProgressDisplay steps={triplePowerSteps} visible={showTripleProgress} />

      <DebugDrawer open={debugMode} info={debugInfo} phases={phases} />
    </div>
  );
}

function PhaseTimeline({ phases }) {
  const statusStyle = (status) => {
    switch (status) {
      case 'done':
        return { background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' };
      case 'active':
        return { background: '#e0e7ff', borderColor: '#c7d2fe', color: '#4338ca' };
      case 'error':
        return { background: '#fee2e2', borderColor: '#fecaca', color: '#991b1b' };
      default:
        return { background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' };
    }
  };

  return (
    <div style={{ display: 'grid', gap: '6px', marginTop: '10px' }}>
      {phases.map((phase) => (
        <div key={phase.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', ...statusStyle(phase.status) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>{phase.status === 'done' ? '✅' : phase.status === 'active' ? '⏳' : phase.status === 'error' ? '⚠️' : '•'}</span>
            <span>{phase.label}</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>{phase.status}</span>
        </div>
      ))}
    </div>
  );
}

function DebugDrawer({ open, info, phases }) {
  if (!open || !info) return null;

  const copy = () => navigator.clipboard.writeText(JSON.stringify(info, null, 2));

  return (
    <div style={{ position: 'fixed', right: '16px', bottom: '16px', width: '360px', maxHeight: '70vh', overflow: 'auto', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(15,23,42,0.15)', borderRadius: '14px', padding: '14px', zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontWeight: 800, color: '#0f172a' }}>Debug drawer</div>
        <button onClick={copy} style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}>Copy JSON</button>
      </div>
      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
        <div><strong>URL:</strong> {info.requestUrl}</div>
        <div><strong>Duration:</strong> {info.requestDuration}ms</div>
        <div><strong>Status:</strong> {info.responseStatus || info.error || 'N/A'}</div>
        <div><strong>Mode:</strong> {info.responseMode || info.requestPayload?.mode || 'N/A'}</div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Phases</div>
        <PhaseTimeline phases={phases} />
      </div>
      <details style={{ marginTop: '10px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#111827' }}>Response</summary>
        <pre style={{ marginTop: '6px', padding: '8px', background: '#0f172a', color: '#e2e8f0', borderRadius: '8px', fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>{JSON.stringify(info.rawSpec, null, 2)}</pre>
      </details>
      <details style={{ marginTop: '8px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#111827' }}>Request</summary>
        <pre style={{ marginTop: '6px', padding: '8px', background: '#0f172a', color: '#e2e8f0', borderRadius: '8px', fontSize: '11px', maxHeight: '160px', overflow: 'auto' }}>{JSON.stringify(info.requestPayload, null, 2)}</pre>
      </details>
    </div>
  );
}

function ProblemCard({ problems, mode, app }) {
  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;
  const infoCount = problems.filter(p => p.severity === 'info').length;
  
  const modeLabel = {
    'template': '📋 Using Template',
    'fallback': '⚠️ Fallback Layout',
    'error': '❌ Generation Failed',
    'generated': '✅ AI Generated',
    'refined': '🔄 Refined'
  }[mode] || '⚙️ Generated';

  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
      <div style={{ marginBottom: '16px' }}>
        {problems.map((p, idx) => (
          <div
            key={idx}
            style={{
              background: p.severity === 'error' ? '#fee2e2' : p.severity === 'warning' ? '#fef3c7' : '#dbeafe',
              border: `1px solid ${p.severity === 'error' ? '#fecaca' : p.severity === 'warning' ? '#fcd34d' : '#bfdbfe'}`,
              color: p.severity === 'error' ? '#991b1b' : p.severity === 'warning' ? '#92400e' : '#1e40af',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              marginBottom: '8px'
            }}
          >
            <strong>{p.severity === 'error' ? '❌' : p.severity === 'warning' ? '⚠️' : 'ℹ️'}</strong> {p.message}
          </div>
        ))}
      </div>

      {app && Array.isArray(app.children) && app.children.length > 0 && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
            Below is the {mode === 'template' || mode === 'fallback' ? 'fallback' : 'generated'} preview:
          </p>
          <RenderApp app={app} />
        </div>
      )}
    </div>
  );
}

function RenderApp({ app }) {
  if (!app || !app.children) return <div>No app to display</div>;
  
  // ✅ ADD: State to track all form inputs
  const [formData, setFormData] = useState({});
  
  const handleInputChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const renderNode = (node) => {
    if (!node) return null;
    const { id, type, props = {}, children = [] } = node;
    
    switch (type) {
      case 'page':
        return (
          <div key={id} style={{ background: '#f8fafc', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
            {props.title && <h1 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: '700' }}>{props.title}</h1>}
            <div>{children.map((child, idx) => <div key={idx}>{renderNode(child)}</div>)}</div>
          </div>
        );
      
      case 'section':
        return (
          <div key={id} style={{ marginBottom: '16px' }}>
            {props.title && <h2 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '600' }}>{props.title}</h2>}
            <div>{children.map((child, idx) => <div key={idx}>{renderNode(child)}</div>)}</div>
          </div>
        );
      
      case 'card':
        return (
          <div key={id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            {props.title && <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600' }}>{props.title}</h3>}
            {props.body && <p style={{ margin: '0', color: '#64748b' }}>{props.body}</p>}
          </div>
        );
      
      case 'form':
        return (
          <form key={id} {...props} style={{ marginBottom: '16px', ...props.style }}>
            {children.map((child, idx) => <div key={idx}>{renderNode(child)}</div>)}
          </form>
        );
      
      case 'input':
        return (
          <input
            key={id}
            id={id}
            type={props.type || 'text'}
            placeholder={props.placeholder}
            value={formData[id] ?? props.value ?? ''}
            onChange={(e) => handleInputChange(id, e.target.value)}
            required={props.required}
            disabled={props.disabled}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              marginBottom: '12px',
              ...props.style
            }}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            key={id}
            id={id}
            placeholder={props.placeholder}
            value={formData[id] ?? props.value ?? ''}
            onChange={(e) => handleInputChange(id, e.target.value)}
            required={props.required}
            disabled={props.disabled}
            rows={props.rows || 4}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              marginBottom: '12px',
              minHeight: '100px',
              resize: 'vertical',
              ...props.style
            }}
          />
        );
      
      case 'select':
        return (
          <select
            key={id}
            id={id}
            value={formData[id] ?? props.value ?? ''}
            onChange={(e) => handleInputChange(id, e.target.value)}
            required={props.required}
            disabled={props.disabled}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              marginBottom: '12px',
              background: 'white',
              cursor: 'pointer',
              ...props.style
            }}
          >
            {props.placeholder && (
              <option value="" disabled>
                {props.placeholder}
              </option>
            )}
            {(props.options || []).map((option, idx) => (
              <option key={idx} value={typeof option === 'string' ? option : option.value}>
                {typeof option === 'string' ? option : option.label}
              </option>
            ))}
            {children}
          </select>
        );
      
      case 'button':
        return (
          <button
            key={id}
            {...props}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#6366f1',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              marginRight: '8px',
              ...props.style
            }}
          >
            {props.label || props.children || 'Button'}
          </button>
        );
      
      case 'label':
        return (
          <label
            key={id}
            htmlFor={props.for || props.htmlFor}
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              color: '#0f172a',
              fontSize: '14px',
              cursor: props.for || props.htmlFor ? 'pointer' : 'default',
              ...props.style
            }}
          >
            {props.text || props.label || props.children || ''}
          </label>
        );
      
      default:
        return (
          <div key={id} style={{ background: '#f1f5f9', padding: '12px', borderRadius: '6px', marginBottom: '8px', fontSize: '13px' }}>
            {type && <strong>[{type}]</strong>} {props.title || props.label || ''}
          </div>
        );
    }
  };
  
  return <div>{app.children.map((node, idx) => <div key={idx}>{renderNode(node)}</div>)}</div>;
}

function ProjectsPage() {
  return <div style={{ padding: '40px' }}>Projects Page</div>;
}

function TemplatesPage() {
  return <div style={{ padding: '40px' }}>Templates Page</div>;
}

function SimulationsPage() {
  return <div style={{ padding: '40px' }}>Simulations Page</div>;
}

export default function SimpleApp() {
  return (
    <Routes>
      <Route path="/" element={<ComingSoon />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/gate" element={<BetaGate />} />
      <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="insights" element={<LearningInsights />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="simulations" element={<SimulationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
