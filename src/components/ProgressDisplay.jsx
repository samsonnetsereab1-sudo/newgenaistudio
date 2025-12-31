/**
 * ProgressDisplay Component
 * Shows Triple Power Combo progress steps
 */

import React from 'react';

export default function ProgressDisplay({ steps, visible }) {
  if (!visible || !steps || steps.length === 0) return null;

  const getStepIcon = (status) => {
    switch (status) {
      case 'complete': return '✅';
      case 'active': return '⏳';
      case 'error': return '❌';
      default: return '⏸️';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
      border: '1px solid #c4b5fd',
      borderRadius: '12px',
      padding: '16px 18px',
      marginBottom: '16px',
      boxShadow: '0 4px 12px rgba(139,92,246,0.1)'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '700',
        color: '#5b21b6',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '18px' }}>🔄</span>
        <span>Triple Power Combo in Progress</span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {steps.map((step, index) => (
          <div
            key={step.id || index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: step.status === 'active' ? '#5b21b6' : '#6b7280',
              fontWeight: step.status === 'active' ? '600' : '500'
            }}
          >
            <span style={{ 
              fontSize: '16px',
              minWidth: '20px' 
            }}>
              {getStepIcon(step.status)}
            </span>
            <span>
              Step {index + 1}: {step.label}
            </span>
            {step.status === 'active' && (
              <div style={{
                marginLeft: 'auto',
                fontSize: '11px',
                color: '#7c3aed',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                Processing...
              </div>
            )}
          </div>
        ))}
      </div>

      {steps.every(s => s.status === 'complete') && (
        <div style={{
          marginTop: '10px',
          padding: '8px 12px',
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#065f46',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          ✨ Generation Complete!
        </div>
      )}
    </div>
  );
}
