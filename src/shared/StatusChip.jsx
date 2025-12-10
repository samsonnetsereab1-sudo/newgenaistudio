// src/shared/StatusChip.jsx
import React from 'react';
import Tooltip from './Tooltip';

export default function StatusChip({ type, icon, label, tooltip }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    accent: "bg-indigo-50 text-indigo-700 border-indigo-200",
    neutral: "bg-slate-100 text-slate-600 border-slate-200"
  };
  return (
    <Tooltip text={tooltip}>
      <span className={`stat-chip ${styles[type]}`}>
        {icon} {label}
      </span>
    </Tooltip>
  );
}
