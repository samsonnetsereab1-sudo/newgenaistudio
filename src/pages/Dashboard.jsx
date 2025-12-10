// src/pages/Dashboard.jsx
import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { RECENT_PROJECTS, TICKETS } from '../lib/data';
import StatusChip from '../shared/StatusChip';
import BackendStatusCard from '../components/BackendStatusCard';
import TemplateGallery from '../components/TemplateGallery';

export default function Dashboard() {
  return (
    <div className="content-wrapper animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="hero-card">
        <div className="hero-graphic"></div>
        <div className="relative z-10">
          <h1 className="hero-h1">Welcome to NewGen Studio (Beta)</h1>
          <p className="hero-p">Describe your app, preview instantly, refine with AI.</p>
          <a className="cta-button" href="/build">Build a New App <ArrowRight size={18}/></a>
          <div className="how-it-works">
             <div className="step-item"><div className="step-num">1</div><span className="step-text">Describe your app</span></div>
             <ChevronDown className="step-arrow -rotate-90 text-slate-300" size={16}/>
             <div className="step-item"><div className="step-num">2</div><span className="step-text">Review live preview</span></div>
             <ChevronDown className="step-arrow -rotate-90 text-slate-300" size={16}/>
             <div className="step-item"><div className="step-num">3</div><span className="step-text">Refine & Export</span></div>
          </div>
        </div>
      </div>

      <div className="split-grid">
        <div className="flex flex-col gap-6">
            <div className="featured-template" onClick={() => window.location.href = '/build'}>
               <div className="ft-icon">📦</div>
               <div className="ft-content">
                  <h4>NewGen SaaS Starter</h4>
                  <p>Load a polished SaaS layout with pricing and hero.</p>
               </div>
               <div className="ft-arrow"><ArrowRight size={20}/></div>
            </div>

            <div className="projects-section">
                <div className="section-head"><h3 className="section-title">Recent Projects</h3><a className="view-all" href="/projects">View all</a></div>
                <div className="table-head table-row"><span>Project Name</span><span>Type</span><span>Status</span><span>Updated</span></div>
                {RECENT_PROJECTS.map(p => (
                <div key={p.id} className="table-row">
                    <span className="p-name">{p.name}</span><span className="p-meta">{p.type}</span><span><span className={`status-badge ${p.sClass}`}>{p.status}</span></span><span className="p-meta">{p.date}</span>
                </div>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-6">
             <BackendStatusCard />
             
             <div className="section-card">
                <div className="card-header"><h3 className="card-title">System Status</h3></div>
                <div className="flex flex-col gap-3">
                   <StatusChip type="success" icon={<div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>} label="Domain: Connected" tooltip="newgenaistudio.com is live." />
                   <StatusChip type="accent" icon={<div style={{width:12}}/>} label="API: Active" tooltip="Gemini AI Backend is operational." />
                   <StatusChip type="neutral" icon={<div style={{width:12}}/>} label="Private Beta" tooltip="Invite-only environment." />
                </div>
             </div>

             <div className="section-card">
                <div className="card-header"><h3 className="card-title">Template Gallery</h3></div>
                <TemplateGallery />
             </div>

             <div className="section-card">
                <div className="card-header"><h3 className="card-title">Ticket Desk</h3><a className="view-all" href="/support">View</a></div>
                <div className="flex flex-col gap-1">
                {TICKETS.map(t => (
                    <div key={t.id} className="ticket-item">
                    <div className="ticket-meta"><span className="ticket-title">{t.title}</span><span className="ticket-sub">#{t.id}</span></div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{t.status}</span>
                    </div>
                ))}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
 
