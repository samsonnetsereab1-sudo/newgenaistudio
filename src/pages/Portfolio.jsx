import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Portfolio() {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: 'AI-Powered E-commerce Platform',
      description: 'Built a dynamic shopping experience with personalized product recommendations using OpenAI',
      category: 'E-commerce',
      image: '🛍️',
      details: 'Real-time inventory, AI chatbot, dynamic pricing'
    },
    {
      id: 2,
      title: 'Workflow Automation Dashboard',
      description: 'Automated business processes with custom workflows and task management',
      category: 'Automation',
      image: '⚙️',
      details: 'Process automation, team collaboration, analytics'
    },
    {
      id: 3,
      title: 'Brand Landing Page Generator',
      description: 'AI-first landing pages created in minutes for modern brands',
      category: 'Design',
      image: '🎨',
      details: 'Template system, AI copy generation, A/B testing'
    },
    {
      id: 4,
      title: 'Customer Support Assistant',
      description: 'Intelligent support system with AI-powered responses and human handoff',
      category: 'AI Assistant',
      image: '🤖',
      details: 'Multi-language support, sentiment analysis, escalation'
    },
    {
      id: 5,
      title: 'Marketing Funnel Platform',
      description: 'Complete marketing automation with conversion optimization',
      category: 'Marketing',
      image: '📊',
      details: 'Lead scoring, email automation, analytics dashboard'
    },
    {
      id: 6,
      title: 'Content Creation Studio',
      description: 'AI-assisted content generation for social media and blogs',
      category: 'Content',
      image: '✍️',
      details: 'Multi-format content, scheduling, performance analytics'
    }
  ];

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
        <div
          onClick={() => navigate('/')}
          style={{
            fontSize: '20px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            cursor: 'pointer'
          }}
        >
          NEWGEN STUDIO
        </div>
        <nav style={{ display: 'flex', gap: '32px', fontSize: '14px' }}>
          <span
            onClick={() => navigate('/')}
            style={{ color: '#94a3b8', cursor: 'pointer' }}
          >
            Home
          </span>
          <span style={{ color: '#f97316', cursor: 'pointer' }}>Work</span>
          <span style={{ color: '#94a3b8', cursor: 'pointer' }}>About</span>
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

      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            lineHeight: '1.1',
            margin: '0 0 24px',
            letterSpacing: '-0.02em'
          }}>
            Recent Work
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            lineHeight: '1.7',
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            From AI-powered experiences to custom workflows — here's what we've built for forward-thinking brands
          </p>
        </div>

        {/* Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px',
          marginBottom: '80px'
        }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                ':hover': {
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(249, 115, 22, 0.5)'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.5)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {project.image}
              </div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(249, 115, 22, 0.2)',
                color: '#f97316',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {project.category}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: '12px 0',
                lineHeight: '1.3'
              }}>
                {project.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#cbd5e1',
                lineHeight: '1.6',
                margin: '12px 0'
              }}>
                {project.description}
              </p>
              <div style={{
                fontSize: '13px',
                color: '#94a3b8',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                {project.details}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: 'rgba(249, 115, 22, 0.1)',
          borderRadius: '16px',
          border: '1px solid rgba(249, 115, 22, 0.2)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 16px'
          }}>
            Ready to build something amazing?
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#cbd5e1',
            margin: '0 0 32px'
          }}>
            Let's discuss your project and see how we can help you succeed
          </p>
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
        </div>
      </div>
    </div>
  );
}
