import { useState, useEffect, useRef } from 'react';
import { useAgents } from '../hooks/useAgents';
import { Send, Zap, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function AgentChat() {
  const {
    loading,
    error,
    orchestrationResults,
    orchestrate,
    fetchHistory,
    fetchAuditLog,
    resetAgents
  } = useAgents();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m the AI Agent Orchestrator. You can ask me to optimize protocols, simulate workflows, or provide recommendations. Try saying "Optimize yield in CRISPR plasmid prep" or "Reduce cost in protein expression".',
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Load audit log
   */
  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        const logs = await fetchAuditLog(20);
        setAuditLog(logs);
      } catch (err) {
        console.error('Failed to load audit log:', err);
      }
    };
    loadAuditLog();
  }, [fetchAuditLog]);

  /**
   * Handle user message submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsExecuting(true);

    try {
      // Extract context from input if possible
      const context = {};

      if (input.toLowerCase().includes('plasmid') || input.toLowerCase().includes('crispr')) {
        context.protocol = 'plasmid-prep';
        context.domain = 'biologics';
      } else if (input.toLowerCase().includes('protein')) {
        context.protocol = 'protein-expr';
        context.domain = 'expression';
      } else if (input.toLowerCase().includes('lc-ms') || input.toLowerCase().includes('mass spec')) {
        context.protocol = 'lc-ms-prep';
        context.domain = 'analysis';
      }

      // Orchestrate the goal
      const result = await orchestrate(input, context);

      // Parse orchestration result
      const phases = result.phases || {};
      const statusEmoji = result.status === 'succeeded' ? '✅' : '⚠️';

      // Build assistant response
      let responseContent = `${statusEmoji} Orchestration ${result.status}\n\n`;

      if (phases.planning) {
        responseContent += `📋 **Planning**: Generated ${phases.planning.stepCount} steps\n`;
      }

      if (phases.simulation) {
        responseContent += `🧪 **Simulation**: Completed ${phases.simulation.runsCompleted} runs\n`;
      }

      if (phases.safety) {
        responseContent += `🛡️ **Safety Review**: ${phases.safety.safetyLevel}\n`;
        if (phases.safety.issueCount > 0) {
          responseContent += `   ⚠️ ${phases.safety.issueCount} issue(s) found\n`;
        }
      }

      if (phases.execution) {
        responseContent += `⚙️ **Execution**: ${phases.execution.status}\n`;
        if (phases.execution.artifactCount) {
          responseContent += `   Generated ${phases.execution.artifactCount} artifact(s)\n`;
        }
      }

      if (result.recommendations && result.recommendations.length > 0) {
        responseContent += `\n💡 **Recommendations**:\n`;
        result.recommendations.slice(0, 3).forEach((rec) => {
          responseContent += `• ${rec}\n`;
        });
      }

      const assistantMessage = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: responseContent,
        orchestrationId: result.orchestrationId,
        phases,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh audit log
      const logs = await fetchAuditLog(20);
      setAuditLog(logs);
    } catch (err) {
      const errorMessage = {
        id: `msg-${Date.now()}`,
        type: 'error',
        content: `Error: ${err.message}. Please try again.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Handle agent reset
   */
  const handleReset = async () => {
    if (window.confirm('Reset all agents and clear state?')) {
      try {
        await resetAgents();
        setMessages([
          {
            id: 'reset',
            type: 'system',
            content: 'All agents have been reset.',
            timestamp: new Date()
          }
        ]);
      } catch (err) {
        console.error('Reset failed:', err);
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="text-indigo-600" size={24} />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Agent Orchestrator</h1>
                <p className="text-sm text-slate-600">AI-driven goal orchestration with multi-agent collaboration</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Reset all agents"
            >
              <RefreshCw size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg px-4 py-3 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : msg.type === 'system'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
              >
                {msg.type === 'assistant' && msg.phases && (
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold">{msg.content}</div>
                    {msg.phases.safety && msg.phases.safety.issueCount > 0 && (
                      <div className="flex items-start gap-2 bg-yellow-50 rounded p-2 mt-2">
                        <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-yellow-800 text-xs">
                          {msg.phases.safety.issueCount} safety concern(s) flagged
                        </div>
                      </div>
                    )}
                    {msg.phases.safety && msg.phases.safety.compliant && (
                      <div className="flex items-start gap-2 bg-green-50 rounded p-2 mt-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-green-800 text-xs">Safety approved</div>
                      </div>
                    )}
                  </div>
                )}
                {msg.type !== 'assistant' && <div className="whitespace-pre-wrap text-sm">{msg.content}</div>}
              </div>
            </div>
          ))}
          {isExecuting && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <span className="text-sm text-slate-600">Orchestrating...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isExecuting}
              placeholder="What would you like to optimize? (e.g., 'Reduce cost in CRISPR plasmid prep')"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            />
            <button
              type="submit"
              disabled={isExecuting || !input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              <Send size={16} />
              Send
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-3">
            💡 Try: "Optimize yield", "Reduce cost", "Improve speed", or "Check compliance"
          </p>
        </div>
      </div>

      {/* Audit Log Sidebar */}
      <div
        className={`w-64 bg-white border-l border-slate-200 flex flex-col transition-all ${
          showAudit ? 'translate-x-0' : 'translate-x-full'
        } fixed right-0 h-screen top-0 z-40`}
      >
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Audit Log</h2>
          <button
            onClick={() => setShowAudit(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {auditLog.slice(0, 15).map((log, i) => (
            <div key={i} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
              <div className="font-medium text-slate-900">{log.agentName}</div>
              <div className="text-slate-600 mt-1">{log.message}</div>
              <div className="text-slate-500 mt-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Toggle */}
      {!showAudit && (
        <button
          onClick={() => setShowAudit(true)}
          className="fixed right-6 bottom-6 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg transition"
          title="Show audit log"
        >
          📋
        </button>
      )}
    </div>
  );
}
