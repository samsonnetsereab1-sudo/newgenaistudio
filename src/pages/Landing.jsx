import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
          NEWGEN STUDIO
        </div>
        <nav style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>Services</span>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>About</span>
          <span 
            onClick={() => navigate('/portfolio')}
            style={{ color: '#94a3b8', cursor: 'pointer' }}
          >
            Work
          </span>
          <button 
            onClick={() => navigate('/gate')}
            style={{ 
              background: '#f97316', 
              color: 'white', 
              border: 'none', 
              padding: '8px 24px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Beta Access
          </button>
        </nav>
      </header>

      {/* Hero */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '120px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '56px', 
            fontWeight: '800', 
            lineHeight: '1.1',
            margin: '0 0 24px',
            letterSpacing: '-0.02em'
          }}>
            AI-Native Studio for Modern Brands
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#94a3b8', 
            lineHeight: '1.7',
            margin: '0 0 40px'
          }}>
            NewGen Studio combines design, development, and AI to help you launch products, automate workflows, and tell better stories.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => navigate('/gate')}
              style={{ 
                background: 'linear-gradient(135deg, #f97316, #ea580c)', 
                color: 'white', 
                border: 'none', 
                padding: '16px 32px', 
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)'
              }}
            >
              Book a call
            </button>
            <button 
              onClick={() => navigate('/portfolio')}
              style={{ 
                background: 'transparent', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.2)', 
                padding: '16px 32px', 
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              View recent work
            </button>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '32px' }}>
            From landing pages to full AI experiences — we help you ship faster.
          </p>
        </div>

        {/* What we build */}
        <div style={{ 
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '40px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>What we build</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              <span style={{ fontSize: '15px', color: '#cbd5e1' }}>AI-powered web experiences</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>🎨</span>
              <span style={{ fontSize: '15px', color: '#cbd5e1' }}>Brand-first landing pages</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>🤖</span>
              <span style={{ fontSize: '15px', color: '#cbd5e1' }}>Workflow & assistant prototypes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <span style={{ fontSize: '15px', color: '#cbd5e1' }}>Marketing experiments & funnels</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
