import React from 'react';
import {
  fetchBackendHealth,
  fetchBiologicsSummary,
  fetchProjects,
  fetchTemplates,
} from '../api/client';

function Tile({ title, status, detail }) {
  const styles = {
    base: {
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
    },
    ok: { background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' },
    warn: { background: '#fef3c7', borderColor: '#fde68a', color: '#92400e' },
    err: { background: '#fee2e2', borderColor: '#fecaca', color: '#991b1b' },
  };
  const tone = status === 'ok' ? styles.ok : status === 'warn' ? styles.warn : styles.err;
  return (
    <div style={{ ...styles.base }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#1e1b4b' }}>{title}</strong>
        <span style={{ ...tone, padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>
          {status === 'ok' ? 'OK' : status === 'warn' ? 'Warning' : 'Error'}
        </span>
      </div>
      {detail && <div style={{ marginTop: '8px', fontSize: '12px', color: '#475569' }}>{detail}</div>}
    </div>
  );
}

export default function StatusPage() {
  const [health, setHealth] = React.useState(null);
  const [projects, setProjects] = React.useState(null);
  const [templates, setTemplates] = React.useState(null);
  const [biologics, setBiologics] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const h = await fetchBackendHealth();
        if (!cancelled) setHealth(h);
      } catch { setHealth({ status: 'error' }); }

      try {
        const p = await fetchProjects();
        if (!cancelled) setProjects(p);
      } catch { setProjects({ status: 'error' }); }

      try {
        const t = await fetchTemplates();
        if (!cancelled) setTemplates(t);
      } catch { setTemplates({ status: 'error' }); }

      try {
        const b = await fetchBiologicsSummary();
        if (!cancelled) setBiologics(b);
      } catch { setBiologics({ status: 'error' }); }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>System Status</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Tile title="Backend Health" status={health?.status === 'ok' ? 'ok' : health ? 'err' : 'warn'} detail={health ? JSON.stringify(health) : 'Checking...'} />
        <Tile title="Projects API" status={projects && projects.status !== 'error' ? 'ok' : projects ? 'err' : 'warn'} detail={projects ? (projects.count ? `count: ${projects.count}` : '') : 'Checking...'} />
        <Tile title="Templates API" status={templates && templates.status !== 'error' ? 'ok' : templates ? 'err' : 'warn'} detail={templates ? (templates.count ? `count: ${templates.count}` : '') : 'Checking...'} />
        <Tile title="Biologics Summary" status={biologics && biologics.status !== 'error' ? 'ok' : biologics ? 'err' : 'warn'} detail={biologics ? (biologics.domain ? `domain: ${biologics.domain}` : '') : 'Checking...'} />
      </div>
    </div>
  );
}
