// src/shared/Tooltip.jsx
import React from 'react';

export default function Tooltip({ text, children }) {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-box">{text}</div>
    </div>
  );
}
