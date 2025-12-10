// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, Plus, FolderOpen, Grid, BookOpen, LifeBuoy, User, Settings } from 'lucide-react';

export default function Sidebar() {
  const menus = [
    { to: '/', label: 'Dashboard', icon: <Layout size={18}/> },
    { to: '/build', label: 'Build New App', icon: <Plus size={18}/> },
    { to: '/projects', label: 'My Projects', icon: <FolderOpen size={18}/> },
    { to: '/templates', label: 'Templates', icon: <Grid size={18}/> },
    { type: 'label', label: 'RESOURCES' },
    { to: '/docs', label: 'Docs & Guides', icon: <BookOpen size={18}/> },
    { to: '/support', label: 'Ticket Desk', icon: <LifeBuoy size={18}/> },
    { type: 'label', label: 'SETTINGS' },
    { to: '/account', label: 'Account', icon: <User size={18}/> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18}/> },
  ];

  return (
    <aside className="dash-sidebar">
      <div className="sidebar-header">
        <div className="logo-tile"><Layout size={20}/></div>
        <div>
          <div className="brand-name">NewGen Studio</div>
          <div className="brand-sub">AI Builder</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {menus.map((item, i) => item.type === 'label' ? (
          <div key={i} className="nav-label">{item.label}</div>
        ) : (
          <NavLink key={item.to} to={item.to} className={({isActive}) => `nav-item ${isActive? 'active':''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label-text">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer px-4 py-3">
        <button className="btn-cta w-full">Build New App</button>
      </div>
    </aside>
  );
}
