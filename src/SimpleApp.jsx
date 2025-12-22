import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
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
            onClick={() => navigate('/app/status')}
            style={{ padding: '10px', color: '#64748b', cursor: 'pointer' }}
          >
            Status
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
    <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      {showWelcome && (
        <WelcomeModal
          onClose={() => { localStorage.setItem('ng_welcome_seen', 'true'); sessionStorage.setItem('ng_welcome_dismissed', 'true'); setShowWelcome(false); }}
          onStatus={() => { localStorage.setItem('ng_welcome_seen', 'true'); sessionStorage.setItem('ng_welcome_dismissed', 'true'); setShowWelcome(false); window.location.href = '/app/status'; }}
        />
      )}
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Build New App</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Describe your app in plain language, and we'll generate a fully functional interface</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your app..."
            style={{ width: '100%', height: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '14px', resize: 'vertical' }}
          />
          <button 
            onClick={handleGenerate}
            style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' }}
            disabled={isGenerating}
          >
            {isGenerating ? `Generating... (${elapsed}s)` : 'Generate App'}
          </button>
          {generatedApp && (
            <>
              <button 
                onClick={handleExport}
                disabled={exportStatus === 'loading'}
                style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', fontWeight: '600' }}
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
                style={{ width: '100%', padding: '8px', background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '8px', fontWeight: '500' }}
              >
                Clear
              </button>
            </>
          )}

          <div style={{ marginTop: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ color: '#1e1b4b' }}>Generation Metrics</strong>
              <button
                onClick={() => fetchMetrics()}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '12px' }}
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
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
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
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>App Preview</h3>
              <p style={{ color: '#64748b' }}>Your generated app will appear here</p>
            </div>
          )}
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
