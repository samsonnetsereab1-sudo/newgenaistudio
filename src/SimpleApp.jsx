import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Portfolio from './pages/Portfolio';
import RequireAuth from './auth/RequireAuth';
import WelcomeModal from './components/WelcomeModal';
import StatusPage from './pages/StatusPage';
import ComingSoon from './pages/ComingSoon';

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at 20% 20%, #f0f4ff 0%, #f8fafc 35%, #f8fafc 100%)' }}>
      <div style={{ width: '280px', padding: '22px', backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.9)', borderRight: '1px solid #e2e8f0', boxShadow: '4px 0 30px rgba(15,23,42,0.05)' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>NewGen Studio</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Biologics & Pharma Builder</div>
        </div>
        <nav>
          {navItems.map(item => <NavButton key={item.path} item={item} />)}
        </nav>
        <div style={{ marginTop: '28px', padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', lineHeight: 1.5 }}>
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
  const [showWelcome, setShowWelcome] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const isGenerating = status === 'loading';

  React.useEffect(() => {
    localStorage.setItem('ng_build_prompt', prompt);
  }, [prompt]);

  const fetchMetrics = React.useCallback(async () => {
    setMetricsStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMetrics(data.metrics || null);
      setMetricsStatus('success');
    } catch (e) {
      console.warn('Metrics fetch failed:', e.message);
      setMetricsStatus('error');
    }
  }, [API_BASE]);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const HARD_TIMEOUT_MS = 25000; // above current backend worst-case (~19s)

    setStatus('loading');
    setSlowHint(false);
    setProblems([]);
    setMode(null);
    setElapsed(0);
    setGenerationStartTime(Date.now());

    const slowHintTimer = setTimeout(() => setSlowHint(true), 2000); // non-terminal hint
    const controller = new AbortController();
    const hardTimer = setTimeout(() => controller.abort(), HARD_TIMEOUT_MS);
    
    try {
      const resp = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, currentApp: generatedApp }),
        signal: controller.signal
      });
      clearTimeout(hardTimer);
      clearTimeout(slowHintTimer);
      setSlowHint(false);
      
      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }
      
      const result = await resp.json();
      console.log('Generation result:', result);

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
        ? 'The request took too long (25s cap). Please try again.'
        : `Error: ${err.message}`;
      
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
      const res = await fetch(`${API_BASE}/api/platform/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appSpec: generatedApp, options: { domain: 'pharma' } })
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const data = await res.json();
      
      // Download manifest as JSON
      const blob = new Blob([JSON.stringify(data.manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newgen-app-${Date.now()}.base44.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('success');
    } catch (err) {
      console.error('Export error:', err);
      setExportStatus('error');
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
          <label style={{ display: 'block', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your app..."
            style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '14px', resize: 'vertical', background: '#f8fafc' }}
          />
          <button 
            onClick={handleGenerate}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '12px', boxShadow: '0 14px 30px rgba(99,102,241,0.30)' }}
            disabled={isGenerating}
          >
            {isGenerating ? `Generating... (${elapsed}s)` : 'Generate App'}
          </button>
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
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {slowHint ? 'This is taking longer than usual (still working)...' : 'This may take up to 25 seconds'}
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
    <div style={{ 
      background: 'white', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      padding: '20px',
      maxWidth: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e1b4b' }}>
          {modeLabel}
        </h3>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          {errorCount > 0 && <span style={{ color: '#dc2626' }}>🔴 {errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
          {warningCount > 0 && <span style={{ marginLeft: '8px', color: '#ea580c' }}>🟠 {warningCount} warning{warningCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>

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
        <Route path="status" element={<StatusPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="simulations" element={<SimulationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
