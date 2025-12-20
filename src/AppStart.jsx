import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BuilderView from './pages/BuilderView';

function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>NewGen Studio</h1>
      <p>Low-code platform for biologics & pharma apps</p>
      <a href="/build" style={{ 
        padding: '12px 24px', 
        background: '#3b82f6', 
        color: 'white', 
        borderRadius: '8px',
        textDecoration: 'none',
        display: 'inline-block',
        marginTop: '20px'
      }}>
        Start Building
      </a>
    </div>
  );
}

export default function AppStart() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/build" element={<BuilderView />} />
    </Routes>
  );
}
