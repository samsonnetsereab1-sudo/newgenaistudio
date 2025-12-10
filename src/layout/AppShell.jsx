// src/layout/AppShell.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from '../components/TopBar';

export default function AppShell({ onSignOut }) {
  return (
    <div className="dash-layout">
      <Sidebar onSignOut={onSignOut} />
      <div className="dash-main">
        <TopBar onSignOut={onSignOut} />
        <Outlet />
      </div>
    </div>
  );
}
 

