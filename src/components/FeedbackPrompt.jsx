/**
 * FeedbackPrompt Component
 * Shows 5-star rating modal after successful generation
 */

import React, { useState } from 'react';

export default function FeedbackPrompt({ appId, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      setSubmitted(true);
      onSubmit(rating);
      setTimeout(() => {
        onSkip(); // Close after showing thank you
      }, 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '28px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        textAlign: 'center',
        animation: 'slideUp 0.3s ease'
      }}>
        {!submitted ? (
          <>
            <div style={{
              fontSize: '48px',
              marginBottom: '12px'
            }}>
              🎉
            </div>

            <h3 style={{
              margin: '0 0 8px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a'
            }}>
              How was your experience?
            </h3>

            <p style={{
              margin: '0 0 20px',
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              Help NewGen Studio learn and improve by rating this generation
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '40px',
                    transition: 'transform 0.2s ease',
                    transform: (hoveredRating >= star || rating >= star) ? 'scale(1.1)' : 'scale(1)',
                    filter: 'grayscale(0)'
                  }}
                >
                  {(hoveredRating >= star || rating >= star) ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: rating > 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0',
                  color: rating > 0 ? 'white' : '#94a3b8',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: rating > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                Submit Rating
              </button>

              <button
                onClick={onSkip}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'white',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontSize: '56px',
              marginBottom: '12px'
            }}>
              🧠
            </div>

            <h3 style={{
              margin: '0 0 8px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#10b981'
            }}>
              ✅ Thank you!
            </h3>

            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#64748b'
            }}>
              NewGen Studio just got smarter!
            </p>
          </>
        )}
      </div>
    </div>
  );
}
