import { useState, useEffect } from 'react';
import { useAgents } from '../hooks/useAgents';
import AgentChat from '../components/AgentChat';
import { BarChart3, Activity, Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function AgentWorkbench() {
  const {
    agents,
    history,
    fetchStatus,
    fetchHistory,
    fetchAuditLog
  } = useAgents();

  const [view, setView] = useState('chat'); // 'chat', 'status', 'history', 'audit'
  const [status, setStatus] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load status on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const statusData = await fetchStatus();
        setStatus(statusData);

        const historyData = await fetchHistory(null, 5);
        const logsData = await fetchAuditLog(30);
        setAuditLog(logsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStatus, fetchHistory, fetchAuditLog]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center gap-6 px-6 py-4">
          {[
            { id: 'chat', label: 'Chat', icon: '💬' },
            { id: 'status', label: 'Agent Status', icon: '🤖' },
            { id: 'history', label: 'History', icon: '📊' },
            { id: 'audit', label: 'Audit Log', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-4 py-2 font-medium rounded-lg transition ${
                view === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === 'chat' && <AgentChat />}

        {view === 'status' && (
          <div className="overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-slate-600 text-sm font-medium">Total Agents</div>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {status?.orchestrator?.agentCount || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-slate-600 text-sm font-medium">Tools Available</div>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {status?.orchestrator?.toolCount || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-slate-600 text-sm font-medium">Executions</div>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {status?.orchestrator?.executionCount || 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-slate-600 text-sm font-medium">Success Rate</div>
                <div className="text-3xl font-bold text-green-600 mt-2">
                  {status?.orchestrator?.executionCount > 0
                    ? Math.round(
                        (status.orchestrator.successCount / status.orchestrator.executionCount) * 100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Agent Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Agent Status</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
                {status?.agents &&
                  Object.entries(status.agents).map(([type, agent]) => (
                    <div
                      key={type}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-lg transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 capitalize">{type}</h3>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            agent.status === 'running'
                              ? 'bg-amber-500'
                              : agent.status === 'succeeded'
                              ? 'bg-green-500'
                              : 'bg-slate-300'
                          }`}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>Status: <span className="font-medium capitalize">{agent.status}</span></div>
                        <div>Tools: <span className="font-medium">{agent.toolsCount}</span></div>
                        <div>Logs: <span className="font-medium">{agent.logsCount}</span></div>
                        <div className="text-xs text-slate-500 mt-2">
                          Created: {new Date(agent.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="overflow-y-auto p-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Execution History</h2>
              </div>
              <div className="divide-y divide-slate-200">
                {history && history.length > 0 ? (
                  history.map((exec) => (
                    <div key={exec.orchestrationId} className="p-6 hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{exec.goal}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            ID: {exec.orchestrationId.substring(0, 12)}...
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            exec.status === 'succeeded'
                              ? 'bg-green-100 text-green-800'
                              : exec.status === 'requires-approval'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {exec.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-slate-400" />
                          <div>
                            <div className="text-slate-600">Duration</div>
                            <div className="font-medium text-slate-900">
                              {(exec.durationMs / 1000).toFixed(2)}s
                            </div>
                          </div>
                        </div>
                        {exec.phases?.planning && (
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-slate-400" />
                            <div>
                              <div className="text-slate-600">Steps</div>
                              <div className="font-medium text-slate-900">
                                {exec.phases.planning.stepCount}
                              </div>
                            </div>
                          </div>
                        )}
                        {exec.phases?.simulation && (
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-slate-400" />
                            <div>
                              <div className="text-slate-600">Runs</div>
                              <div className="font-medium text-slate-900">
                                {exec.phases.simulation.runsCompleted}
                              </div>
                            </div>
                          </div>
                        )}
                        {exec.phases?.execution && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-slate-400" />
                            <div>
                              <div className="text-slate-600">Artifacts</div>
                              <div className="font-medium text-slate-900">
                                {exec.phases.execution.artifactCount || 0}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">No executions yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'audit' && (
          <div className="overflow-y-auto p-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Audit Log</h2>
                <p className="text-sm text-slate-600 mt-1">Complete record of all agent actions</p>
              </div>
              <div className="divide-y divide-slate-200">
                {auditLog && auditLog.length > 0 ? (
                  auditLog.map((log, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{log.agentName}</span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {log.message}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {Object.keys(log.data).length > 0 && (
                            <div className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                              {JSON.stringify(log.data, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">No audit logs yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
