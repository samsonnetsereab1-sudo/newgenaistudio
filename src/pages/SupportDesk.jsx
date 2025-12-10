// src/pages/SupportDesk.jsx
import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { TICKETS } from '../lib/data';
import { useNavigate } from 'react-router-dom';

export default function SupportDesk() {
  const [tickets, setTickets] = useState(TICKETS);
  const [form, setForm] = useState({ subject: '', category: 'Studio', severity: 'Medium', desc: '' });
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    const newTicket = {
      id: `NG-${100 + tickets.length + 1}`,
      title: form.subject,
      status: 'Open',
      priority: form.severity,
      date: 'Just now'
    };
    setTickets([newTicket, ...tickets]);
    setForm({ subject: '', category: 'Studio', severity: 'Medium', desc: '' });
  };

  return (
    <div className="content-wrapper animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition"><ChevronLeft size={20} className="text-slate-600"/></button>
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Support & Ticket Desk</h1>
          <p className="text-slate-500 text-sm">Get help with NewGen Studio, domains, and API usage.</p>
        </div>
      </div>

      <div className="support-layout" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        <div className="section-card">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Open a New Ticket</h2>
          <p className="text-sm text-slate-500 mb-6">Describe your issue and we’ll route it to the right engineer.</p>
          <form className="support-form" style={{display:'flex', flexDirection:'column', gap:16}} onSubmit={handleCreate}>
            <div className="form-group" style={{display:'flex', flexDirection:'column', gap:6}}>
              <label className="form-label" style={{fontSize:13, fontWeight:500, color:'#334155'}}>Subject</label>
              <input style={{padding:10, borderRadius:8, border:'1px solid #e2e8f0', fontSize:14}} placeholder="e.g. Domain not connecting" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group" style={{display:'flex', flexDirection:'column', gap:6}}>
                <label className="form-label" style={{fontSize:13, fontWeight:500, color:'#334155'}}>Product Area</label>
                <select style={{padding:10, borderRadius:8, border:'1px solid #e2e8f0', fontSize:14}} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Studio / Builder</option>
                  <option>Domains & DNS</option>
                  <option>Billing</option>
                </select>
              </div>
              <div className="form-group" style={{display:'flex', flexDirection:'column', gap:6}}>
                <label className="form-label" style={{fontSize:13, fontWeight:500, color:'#334155'}}>Severity</label>
                <select style={{padding:10, borderRadius:8, border:'1px solid #e2e8f0', fontSize:14}} value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <button type="submit" className="cta-button" style={{marginTop:16, justifyContent:'center'}}>Submit Ticket</button>
          </form>
        </div>

        <div className="section-card">
          <div className="card-header"><h3 className="card-title">Recent Tickets</h3></div>
          <div className="border rounded-lg overflow-hidden">
            <div className="ticket-row bg-slate-50 font-semibold text-xs uppercase text-slate-500" style={{display:'grid', gridTemplateColumns:'80px 1fr 80px 80px 80px', padding:12}}>
              <span>ID</span><span>Subject</span><span>Status</span><span>Priority</span><span>Date</span>
            </div>
            {tickets.map(t => (
              <div key={t.id} className="ticket-row bg-white hover:bg-slate-50 transition" style={{display:'grid', gridTemplateColumns:'80px 1fr 80px 80px 80px', padding:12, borderBottom:'1px solid #f1f5f9', alignItems:'center'}}>
                <span className="font-mono text-xs text-slate-400">{t.id}</span>
                <span className="font-medium text-slate-700 truncate pr-2" style={{fontSize:13}}>{t.title}</span>
                <span><span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t.status}</span></span>
                <span className="text-xs font-medium text-slate-500">{t.priority}</span>
                <span className="text-xs text-slate-400">{t.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
