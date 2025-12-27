/**
 * Workflow Runner Component
 * Visualizes workflow execution with step-by-step progress
 */

import { useWorkflow } from '../hooks/useWorkflow';

/**
 * Workflow Runner Component
 */
export function WorkflowRunner({ workflow, context, onComplete, onError }) {
  const { executeWorkflow, execution, loading, error, progress } = useWorkflow();

  const handleExecute = async () => {
    try {
      const result = await executeWorkflow(workflow, context);
      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  const getStepStatus = (step) => {
    if (step.status === 'success') return '✅';
    if (step.status === 'error') return '❌';
    return '⏳';
  };

  const getStepColor = (step) => {
    if (step.status === 'success') return '#28a745';
    if (step.status === 'error') return '#dc3545';
    return '#6c757d';
  };

  return (
    <div className="workflow-runner" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
      <h2>{workflow.name}</h2>
      
      {!execution && (
        <button
          onClick={handleExecute}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Executing...' : 'Start Workflow'}
        </button>
      )}

      {loading && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Progress: {progress.percentage}%</strong>
          </div>
          <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress.percentage}%`,
                height: '20px',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#6c757d' }}>
            Step {progress.current} of {progress.total}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {execution && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Status:</strong>{' '}
            <span style={{ 
              color: execution.status === 'completed' ? '#28a745' : execution.status === 'failed' ? '#dc3545' : '#6c757d',
              fontWeight: 'bold'
            }}>
              {execution.status.toUpperCase()}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Steps:</strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {execution.steps?.map((step, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  backgroundColor: 'white',
                  border: `1px solid ${getStepColor(step)}`,
                  borderLeft: `4px solid ${getStepColor(step)}`,
                  borderRadius: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2em' }}>{getStepStatus(step)}</span>
                  <div style={{ flex: 1 }}>
                    <strong>{step.stepName}</strong>
                    <div style={{ fontSize: '0.9em', color: '#6c757d', marginTop: '5px' }}>
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {step.error && (
                  <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f8d7da', borderRadius: '4px', fontSize: '0.9em' }}>
                    <strong>Error:</strong> {step.error}
                  </div>
                )}

                {step.result && typeof step.result === 'object' && (
                  <details style={{ marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', color: '#007bff' }}>View Result</summary>
                    <pre style={{ marginTop: '5px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.85em', overflow: 'auto' }}>
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
            <div><strong>Started:</strong> {new Date(execution.startTime).toLocaleString()}</div>
            {execution.endTime && (
              <div><strong>Completed:</strong> {new Date(execution.endTime).toLocaleString()}</div>
            )}
            {execution.endTime && execution.startTime && (
              <div>
                <strong>Duration:</strong>{' '}
                {Math.round((new Date(execution.endTime) - new Date(execution.startTime)) / 1000)}s
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
