/**
 * LearningInsights Component
 * Displays learning metrics and insights dashboard
 */

import React, { useState, useEffect } from 'react';
import { getApiBase } from '../api/client';

export default function LearningInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBase()}/api/generate/insights`);
      const data = await response.json();
      
      if (data.status === 'ok') {
        setInsights(data.insights);
      } else {
        setError('Failed to load insights');
      }
    } catch (err) {
      console.error('Insights fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        Loading insights...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div style={{
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '900',
          margin: '0 0 8px',
          color: '#0f172a'
        }}>
          🧠 AI Learning Insights
        </h1>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '14px'
        }}>
          NewGen Studio learns from every generation to improve suggestions
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#1e40af',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Total Patterns Learned
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#1e3a8a'
          }}>
            {insights.totalPatterns || 0}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #d1fae5 0%, #d9f99d 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #86efac'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#15803d',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Component Types
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#14532d'
          }}>
            {insights.componentTypes || 0}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#92400e',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Layout Patterns
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#78350f'
          }}>
            {insights.layoutTypes || 0}
          </div>
        </div>
      </div>

      {/* Top Components */}
      {insights.topComponents && insights.topComponents.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 16px',
            color: '#0f172a'
          }}>
            Top Components by Usage
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {insights.topComponents.map((comp, index) => (
              <div
                key={comp.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px'
                }}>
                  {index + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '2px'
                  }}>
                    {comp.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    Used {comp.usageCount} time{comp.usageCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <div style={{
                  padding: '4px 10px',
                  background: comp.successRate >= 80 ? '#d1fae5' : comp.successRate >= 50 ? '#fef3c7' : '#fee2e2',
                  color: comp.successRate >= 80 ? '#065f46' : comp.successRate >= 50 ? '#92400e' : '#991b1b',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {comp.successRate}% success
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Patterns */}
      {insights.layoutPatterns && insights.layoutPatterns.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 16px',
            color: '#0f172a'
          }}>
            Layout Patterns
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {insights.layoutPatterns.map((layout) => (
              <div
                key={layout.type}
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  marginBottom: '8px',
                  textTransform: 'capitalize'
                }}>
                  {layout.type.replace('-', ' ')}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#6366f1'
                }}>
                  {layout.usageCount}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '4px'
                }}>
                  generations
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        Last updated: {insights.lastUpdated ? new Date(insights.lastUpdated).toLocaleString() : 'Never'}
      </div>
    </div>
  );
}
