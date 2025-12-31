/**
 * ModeSelector Component
 * Toggle between No-Code and Technical input modes
 */

import React from 'react';

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
      padding: '8px 12px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#64748b'
      }}>
        Input Mode:
      </span>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        flex: 1
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: '8px',
          background: mode === 'no-code' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'white',
          color: mode === 'no-code' ? 'white' : '#0f172a',
          border: mode === 'no-code' ? '1px solid rgba(255,255,255,0.25)' : '1px solid #e2e8f0',
          fontWeight: '500',
          fontSize: '13px',
          transition: 'all 0.2s ease',
          boxShadow: mode === 'no-code' ? '0 4px 12px rgba(99,102,241,0.25)' : 'none'
        }}>
          <input
            type="radio"
            name="inputMode"
            value="no-code"
            checked={mode === 'no-code'}
            onChange={(e) => onModeChange(e.target.value)}
            style={{ display: 'none' }}
          />
          <span>📝</span>
          <span>No-Code Mode</span>
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '6px 12px',
          borderRadius: '8px',
          background: mode === 'technical' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'white',
          color: mode === 'technical' ? 'white' : '#0f172a',
          border: mode === 'technical' ? '1px solid rgba(255,255,255,0.25)' : '1px solid #e2e8f0',
          fontWeight: '500',
          fontSize: '13px',
          transition: 'all 0.2s ease',
          boxShadow: mode === 'technical' ? '0 4px 12px rgba(99,102,241,0.25)' : 'none'
        }}>
          <input
            type="radio"
            name="inputMode"
            value="technical"
            checked={mode === 'technical'}
            onChange={(e) => onModeChange(e.target.value)}
            style={{ display: 'none' }}
          />
          <span>💻</span>
          <span>Technical Mode</span>
        </label>
      </div>

      <div style={{
        fontSize: '11px',
        color: '#94a3b8',
        fontStyle: 'italic'
      }}>
        {mode === 'no-code' 
          ? 'Natural language descriptions'
          : 'Paste JSX, HTML, JSON, or component lists'}
      </div>
    </div>
  );
}
