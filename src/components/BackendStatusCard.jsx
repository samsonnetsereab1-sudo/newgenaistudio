/**
 * Backend Status Card
 * Displays backend connection status and biologics pipeline summary
 */
import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchBackendHealth, fetchBiologicsSummary } from '../api/client';

export default function BackendStatusCard() {
  const [health, setHealth] = useState(null);
  const [bio, setBio] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [h, b] = await Promise.all([
          fetchBackendHealth(),
          fetchBiologicsSummary(),
        ]);
        
        if (mounted) {
          setHealth(h);
          setBio(b);
          setError('');
        }
      } catch (e) {
        console.error('Backend connection error:', e);
        if (mounted) {
          setError(e.message || 'Backend not reachable');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Backend Status
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking backend connection…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Backend Status
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Make sure backend is running on port 5000
        </p>
      </div>
    );
  }

  return (
    <div className="section-card">
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Backend Status
        </h3>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">
          Connected to {health?.service || 'backend'}
        </span>
      </div>

      {/* Biologics Summary */}
      {bio && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Active Pipelines
          </h4>
          
          {bio.pipelines && bio.pipelines.length > 0 ? (
            <div className="space-y-1.5">
              {bio.pipelines.map((pipeline, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-slate-50 rounded px-2 py-1.5"
                >
                  <span className="font-medium text-slate-700">{pipeline.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{pipeline.stage}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        pipeline.risk === 'low'
                          ? 'bg-emerald-100 text-emerald-700'
                          : pipeline.risk === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pipeline.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active pipelines</p>
          )}
        </div>
      )}

      {/* Raw Response (Collapsible) */}
      <details className="mt-3">
        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
          View raw response
        </summary>
        <pre className="text-[10px] bg-slate-900 text-slate-100 rounded p-2 mt-2 overflow-x-auto">
          {JSON.stringify(bio, null, 2)}
        </pre>
      </details>
    </div>
  );
}
