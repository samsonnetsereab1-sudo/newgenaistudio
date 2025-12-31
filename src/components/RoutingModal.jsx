/**
 * RoutingModal Component
 * Shows routing options when medium complexity detected
 */

import React from 'react';

export default function RoutingModal({ routing, options, onChoose, onCancel }) {
  if (!routing || !options) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{
          margin: '0 0 8px',
          fontSize: '24px',
          fontWeight: '800',
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🤔</span>
          <span>Choose Generation Method</span>
        </h2>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '4px'
          }}>
            Analysis Results
          </div>
          <div style={{
            fontSize: '12px',
            color: '#78350f',
            lineHeight: '1.5'
          }}>
            {routing.reasoning}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#78350f',
            marginTop: '6px',
            display: 'flex',
            gap: '12px'
          }}>
            <span><strong>Complexity:</strong> {routing.complexity?.score || 0}/10</span>
            <span><strong>Confidence:</strong> {routing.confidence}%</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {options.map((option, index) => (
            <div
              key={option.route}
              onClick={() => onChoose(option.route)}
              style={{
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'white',
                ':hover': {
                  borderColor: '#6366f1',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.15)'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '28px',
                marginBottom: '8px'
              }}>
                {option.icon}
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '6px'
              }}>
                {option.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                marginBottom: '10px',
                lineHeight: '1.4'
              }}>
                {option.description}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '11px',
                color: '#94a3b8'
              }}>
                <div><strong>Speed:</strong> {option.speed}</div>
                <div><strong>Quality:</strong> {option.quality}</div>
                <div><strong>Confidence:</strong> {option.confidence}%</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '12px',
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
