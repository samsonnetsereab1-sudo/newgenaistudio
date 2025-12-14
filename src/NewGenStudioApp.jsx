import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Dashboard from './pages/Dashboard';
import SupportDesk from './pages/SupportDesk';
import BuilderView from './builder/BuilderView';
import Projects from './pages/Projects';
import Templates from './pages/Templates';
import Simulations from './pages/Simulations';
import Graphs from './pages/Graphs';
import Presets from './pages/Presets';
import AgentWorkbench from './pages/AgentWorkbench';
import './styles/global.css';

const ACCESS_CODE = 'newgen-beta';

function BetaGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) onUnlock(); else setError('Invalid access code.');
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

export default function NewGenStudioApp() {
  console.log('NewGenStudioApp mounted');
  const hasAccess = localStorage.getItem('ng_beta_access') === 'true';
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAccess);
  console.log('isAuthenticated:', isAuthenticated);

  const handleUnlock = () => {
    localStorage.setItem('ng_beta_access', 'true');
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('ng_beta_access');
    setIsAuthenticated(false);
  };

  console.log('Rendering routes, authenticated:', isAuthenticated);

  if (!isAuthenticated) {
    console.log('Rendering beta gate');
    return (
      <Routes>
        <Route path="/gate" element={<BetaGate onUnlock={handleUnlock} />} />
        <Route path="/" element={<Navigate to="/gate" replace />} />
      </Routes>
    );
  }

  console.log('Rendering authenticated app');
  return (
    <Routes>
      <Route path="/" element={<AppShell onSignOut={handleSignOut} />}>
        <Route index element={<Dashboard />} />
        <Route path="build" element={<BuilderView />} />
        <Route path="builder" element={<BuilderView />} />
        <Route path="support" element={<SupportDesk />} />
        <Route path="projects" element={<Projects />} />
        <Route path="templates" element={<Templates />} />
        <Route path="simulations" element={<Simulations />} />
        <Route path="graphs" element={<Graphs />} />
        <Route path="presets" element={<Presets />} />
        <Route path="agents" element={<AgentWorkbench />} />
      </Route>
    </Routes>
  );
}
