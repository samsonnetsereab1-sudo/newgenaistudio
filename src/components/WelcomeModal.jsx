import React from 'react';

export default function WelcomeModal({ onClose, onStatus }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: 'min(520px, 92vw)',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)',
        border: '1px solid #e2e8f0',
        zIndex: 30,
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 18px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>🎉 Welcome to NewGen Studio (Beta)</h2>
          <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '13px' }}>
            You’re early — and that matters. Build from plain language, explore templates, and preview regulated-domain workflows.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: '14px 18px', display: 'grid', gap: '10px', fontSize: '13px', color: '#334155' }}>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>✨ Build from plain language — generate UI + project structure.</li>
          <li>🧪 Domain-aware (early) — biologics, pharma, regulated flows.</li>
          <li>📊 Check system health anytime — see Status.</li>
          <li>🚧 Beta focus — some features are coming soon.</li>
        </ul>
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <strong style={{ color: '#0f172a' }}>Tip:</strong> Start simple, then refine. “A landing page for a biotech SaaS” → add requirements step by step.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '12px 18px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={onStatus}
          style={{ padding: '10px 12px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
        >
          View Status
        </button>
        <button
          onClick={onClose}
          style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
