import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate floating particles for visual interest
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      size: 4 + Math.random() * 8
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Animated background particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            backdropFilter: 'blur(2px)'
          }}
        />
      ))}

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(100vh) scale(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) scale(1); opacity: 0; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .pulse-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '60px 50px',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Icon/Logo */}
        <div style={{
          fontSize: '72px',
          marginBottom: '24px',
          animation: 'pulse 3s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 20px rgba(102, 126, 234, 0.4))'
        }}>
          🧬
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '42px',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 16px',
          letterSpacing: '-0.02em'
        }}>
          The Future of Biologics Software
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          fontWeight: '500',
          margin: '0 0 32px',
          lineHeight: '1.6'
        }}>
          AI-powered low-code platform for pharma, biotech, and regulated workflows
        </p>

        {/* Feature Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          margin: '32px 0'
        }}>
          {['🧪 GMP Compliance', '🔬 Bioprocess Ready', '📊 Real-time Analytics', '🤖 AI-Powered'].map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                padding: '10px 20px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#5a67d8',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Status Message */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 50%, rgba(102, 126, 234, 0.05) 100%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 3s linear infinite',
          padding: '24px',
          borderRadius: '16px',
          margin: '32px 0',
          border: '2px dashed rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{
            fontSize: '32px',
            marginBottom: '12px'
          }}>⚡</div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1e1b4b',
            margin: '0 0 8px'
          }}>
            Platform Launching Q1 2026
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0,
            lineHeight: '1.6'
          }}>
            We're building something extraordinary. Domain-aware generation for biologics, pharma compliance built-in, and export to any platform via BASE44.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => navigate('/app/build')}
            className="pulse-btn"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: '180px'
            }}
          >
            🚀 Try Beta Preview
          </button>

          <button
            onClick={() => navigate('/app/status')}
            style={{
              background: 'white',
              color: '#667eea',
              padding: '16px 32px',
              borderRadius: '16px',
              border: '2px solid #667eea',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '180px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#667eea';
            }}
          >
            📊 System Status
          </button>
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: '32px',
          fontSize: '12px',
          color: '#94a3b8',
          fontStyle: 'italic'
        }}>
          Early access? Contact us with code: <code style={{
            background: 'rgba(102, 126, 234, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            color: '#667eea',
            fontWeight: '600'
          }}>newgen-beta</code>
        </p>
      </div>
    </div>
  );
}
