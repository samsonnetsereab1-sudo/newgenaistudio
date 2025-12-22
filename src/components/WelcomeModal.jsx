import React from 'react';

export default function WelcomeModal({ onClose, onStatus }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: 'min(760px, 90vw)', background: 'white', borderRadius: '16px', boxShadow: '0 30px 60px rgba(2,6,23,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>🎉 Welcome to NewGen Studio (Beta)</h2>
          <p style={{ margin: '8px 0 0', color: '#475569' }}><strong>You’re early — and that matters.</strong> NewGen Studio is an AI-native workspace for designing modern apps and websites from plain language.</p>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>This beta is focused on <strong>speed, structure, and learning from real use</strong>. Some features are intentionally lightweight while we validate what matters most.</p>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gap: '14px' }}>
          <section>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>What you can do right now</h3>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#334155' }}>
              <li>✨ <strong>Build from plain language</strong> — describe an app or website and generate a functional UI and project structure.</li>
              <li>🧱 <strong>Explore templates & concepts</strong> — start from examples or generated ideas to iterate quickly.</li>
              <li>🧪 <strong>Domain-aware generation (early)</strong> — initial support for <strong>biologics, pharma, and regulated workflows</strong>, alongside general app and website generation.</li>
              <li>📊 <strong>Check system health anytime</strong> — use the <strong>Status</strong> page to see live availability of core services.</li>
            </ul>
          </section>
          <section>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>What to expect during beta</h3>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#334155' }}>
              <li>Generations may be <strong>partial or iterative</strong></li>
              <li>Some features are marked <em>coming soon</em></li>
              <li>Errors are handled safely and transparently</li>
              <li>Improvements ship frequently</li>
            </ul>
            <p style={{ margin: '6px 0 0', color: '#64748b' }}>This phase is about <strong>direction and clarity</strong>, not final polish.</p>
          </section>
          <section>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Best results tip</h3>
            <p style={{ margin: '8px 0 0', color: '#334155' }}>
              Start simple, then refine:
              <br/>
              <em>“A landing page for a biotech SaaS”</em> → then add requirements step by step.
            </p>
          </section>
          <section>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Help shape the platform</h3>
            <p style={{ margin: '8px 0 0', color: '#334155' }}>
              If something feels confusing, broken, or surprisingly good — that feedback directly shapes what we build next.
              <br/>
              You’re not just using NewGen Studio. <strong>You’re helping define it.</strong>
            </p>
          </section>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={onStatus} style={{ padding: '10px 14px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 600 }}>View System Status</button>
          <button onClick={onClose} style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700 }}>Get Started</button>
        </div>
        <div style={{ padding: '10px 24px', fontSize: '12px', color: '#94a3b8' }}>Beta access — features, outputs, and domain coverage may evolve.</div>
      </div>
    </div>
  );
}
