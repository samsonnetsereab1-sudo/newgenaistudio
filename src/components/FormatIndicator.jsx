/**
 * FormatIndicator Component
 * Shows detected format with validation feedback
 */

import React from 'react';

export default function FormatIndicator({ format, confidence, errors = [] }) {
  if (!format || format === 'natural-language') {
    return null; // Don't show for natural language
  }

  const formatLabels = {
    'json': { label: 'JSON', icon: '{ }', color: '#10b981' },
    'jsx': { label: 'React JSX', icon: '⚛️', color: '#3b82f6' },
    'html': { label: 'HTML', icon: '<>', color: '#f59e0b' },
    'component-list': { label: 'Component List', icon: '📋', color: '#8b5cf6' }
  };

  const info = formatLabels[format] || { label: 'Unknown', icon: '?', color: '#6b7280' };
  const hasErrors = errors.length > 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: hasErrors ? '#fef2f2' : `${info.color}15`,
        color: hasErrors ? '#dc2626' : info.color,
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        border: `1px solid ${hasErrors ? '#fecaca' : `${info.color}30`}`
      }}>
        <span>{info.icon}</span>
        <span>Detected: {info.label}</span>
        {!hasErrors && (
          <span style={{ 
            fontSize: '11px', 
            opacity: 0.7 
          }}>
            ({Math.round(confidence * 100)}%)
          </span>
        )}
      </div>

      {hasErrors && (
        <div style={{
          fontSize: '11px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⚠️</span>
          <span>{errors.length} validation error{errors.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
