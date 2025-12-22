// src/components/TopBar.jsx
import React, { useEffect, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { fetchBackendHealth } from '../api/client';

export default function TopBar({ onSignOut }) {
  const location = useLocation();
  const path = location.pathname === '/' ? 'dashboard' : location.pathname.replace('/', '');
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    const checkHealth = async () => {
      try {
        const res = await fetchBackendHealth();
        if (!cancelled) setApiStatus(res?.status === 'ok' ? 'ok' : 'degraded');
      } catch (err) {
        if (!cancelled) setApiStatus('down');
      }
    };

    checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const apiLabel = apiStatus === 'ok' ? 'API: healthy' : apiStatus === 'checking' ? 'API: checking' : 'API: down';
  const apiStyle = apiStatus === 'ok'
    ? { background: '#dcfce7', color: '#166534' }
    : apiStatus === 'checking'
      ? { background: '#e2e8f0', color: '#475569' }
      : { background: '#fee2e2', color: '#991b1b' };
  return (
    <header className="dash-topbar">
      <div className="breadcrumbs"><span className="text-slate-400">Studio</span><ChevronDown size={12} className="-rotate-90 text-slate-300"/><span className="curr capitalize">{path}</span></div>
      <div className="flex items-center gap-3">
        <div className="status-pill">Private Beta</div>
        <div className="status-pill" style={apiStyle}>{apiLabel}</div>
        <div className="user-avatar">SN</div>
        <button onClick={onSignOut} className="text-slate-400 hover:text-slate-600 p-2" title="Sign Out"><LogOut size={18} /></button>
      </div>
    </header>
  );
}
