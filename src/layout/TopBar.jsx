// src/layout/TopBar.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  const path = location.pathname === '/' ? 'dashboard' : location.pathname.replace('/', '');
  return (
    <header className="dash-topbar">
      <div className="breadcrumbs"><span className="text-slate-400">Studio</span><ChevronDown size={12} className="-rotate-90 text-slate-300"/><span className="curr capitalize">{path}</span></div>
      <div className="flex items-center"><div className="status-pill">Private Beta</div><div className="user-avatar">SN</div></div>
    </header>
  );
}
 

