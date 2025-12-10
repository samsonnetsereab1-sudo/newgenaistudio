// src/lib/data.js
export const MOCK_PROJECTS = {
  default: {
    "App.jsx": `export default function App() { return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-800 text-2xl font-sans">NewGen App Preview</div> }`,
    "styles.css": `body { margin: 0; }`
  },
  saas: {
    "App.jsx": `import React, { useState } from 'react';
import { Menu, X, ArrowRight, Zap, Database, Activity, Share2, Lock, Play } from 'lucide-react';
export default function App() { return (<div className="min-h-screen font-sans text-slate-800 bg-white">SaaS</div>) }`,
    "styles.css": `body { margin: 0; font-family: sans-serif; }`
  }
};

export const RECENT_PROJECTS = [
  { id: 1, name: "LysisLogic Ops Console", type: "Analytics", status: "Live", date: "2h ago", sClass: "status-live" },
  { id: 2, name: "NewGen Studio Landing", type: "SaaS Website", status: "Draft", date: "1d ago", sClass: "status-draft" },
  { id: 3, name: "Smart Manager AI", type: "Internal Tool", status: "Building", date: "3d ago", sClass: "status-build" },
];

export const TICKETS = [
  { id: 1043, title: "Connect custom domain", priority: "High", status: "In Progress" },
  { id: 1039, title: "CRM template request", priority: "Medium", status: "Open" },
];

export const APP_TEMPLATES = [
  { 
    id: 'biotech-crm', 
    title: 'Biotech CRM', 
    desc: 'Track leads, trials, and customer interactions for biotech companies.',
    icon: '🧬',
    category: 'CRM',
    badge: 'Popular'
  },
  { 
    id: 'analytics-dashboard', 
    title: 'Analytics Dashboard', 
    desc: 'Real-time KPIs, charts, and performance metrics.',
    icon: '📊',
    category: 'Analytics',
    badge: 'New'
  },
  { 
    id: 'saas-landing', 
    title: 'SaaS Landing Page', 
    desc: 'High-converting landing page with hero, pricing, testimonials.',
    icon: '🚀',
    category: 'Marketing',
    badge: 'Featured'
  },
  { 
    id: 'lims-interface', 
    title: 'LIMS Interface', 
    desc: 'Lab information management system for sample tracking.',
    icon: '🧪',
    category: 'Lab',
    badge: 'Professional'
  },
  { 
    id: 'batch-tracker', 
    title: 'Batch Release Tracker', 
    desc: 'FDA-compliant batch production record manager.',
    icon: '📦',
    category: 'Manufacturing',
    badge: 'Compliance'
  },
  { 
    id: 'protocol-builder', 
    title: 'Protocol Builder', 
    desc: 'Create, validate, and execute lab protocols.',
    icon: '📝',
    category: 'Workflows',
    badge: 'AI-Powered'
  },
];

import apiClient from './apiClient';

export async function generateWithGemini({ prompt, addLog }) {
  try {
    addLog?.("Calling backend /api/generate …");

    const response = await apiClient.post("/api/generate", {
      prompt,
    });

    // 💡 Adjust these lines if your backend returns a different shape
    const { files, messages, status } = response.data;

    return {
      status: status || "ok",
      files: files || {},
      messages: messages || [],
    };
  } catch (error) {
    console.error("generateWithGemini error", error);
    addLog?.("Backend call failed. Check console/network tab for details.");

    return {
      status: "error",
      files: {},
      messages: [
        {
          role: "assistant",
          content:
            "I hit an error talking to the backend. Please check the server logs and network tab.",
        },
      ],
    };
  }
}
