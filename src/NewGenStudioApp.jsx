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
    <div className="beta-wrapper">
      <div className="beta-card">
        <div className="beta-logo-icon">NG</div>
        <h1 className="beta-title">NewGen Studio</h1>
        <p className="beta-subtitle">Private Beta Access</p>
        <form onSubmit={handleSubmit}>
          <input className="beta-input" type="password" placeholder="Access Code" value={code} onChange={e => setCode(e.target.value)} autoFocus />
          {error && <p className="beta-error">{error}</p>}
          <button className="beta-button">Enter Studio</button>
        </form>
      </div>
    </div>
  );
}

export default function NewGenStudioApp() {
  const hasAccess = localStorage.getItem('ng_beta_access') === 'true';
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAccess);

  const handleUnlock = () => {
    localStorage.setItem('ng_beta_access', 'true');
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('ng_beta_access');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/gate" element={<BetaGate onUnlock={handleUnlock} />} />
        <Route path="/" element={<Navigate to="/gate" replace />} />
      </Routes>
    );
  }

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
