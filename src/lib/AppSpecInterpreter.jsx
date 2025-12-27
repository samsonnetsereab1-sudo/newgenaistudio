/**
 * AppSpec Interpreter
 * Dynamically renders AppSpec v2.0 with state management and actions
 */

import { useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useDataSource } from '../hooks/useDataSource';

/**
 * AppSpec Interpreter Component
 * Renders dynamic apps from AppSpec v2.0
 */
export function AppSpecInterpreter({ spec }) {
  const { state, setState, handleAction } = useAppState(spec);
  const { data, loading, error, fetchData } = useDataSource(spec.dataSources);

  // Load data sources on mount
  useEffect(() => {
    if (spec.dataSources && spec.dataSources.length > 0) {
      spec.dataSources.forEach(dataSource => {
        if (dataSource.type === 'rest' && dataSource.methods?.includes('GET')) {
          fetchData(dataSource.id, { method: 'GET' });
        }
      });
    }
  }, [spec.dataSources]);

  const renderNode = (node) => {
    if (!node) return null;

    switch (node.type) {
      case 'page':
        return (
          <div key={node.id} className="page" style={{ padding: '20px' }}>
            <h1>{node.props?.title || 'Page'}</h1>
            {node.children?.map(renderNode)}
          </div>
        );

      case 'section':
        return (
          <div key={node.id} className="section" style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            {node.props?.title && <h2>{node.props.title}</h2>}
            {node.children?.map(renderNode)}
          </div>
        );

      case 'card':
        return (
          <div key={node.id} className="card" style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '10px' }}>
            {node.props?.title && <h3>{node.props.title}</h3>}
            {node.props?.dataBinding && (
              <div>{getNestedValue(state, node.props.dataBinding.replace('state.', ''))}</div>
            )}
            {node.children?.map(renderNode)}
          </div>
        );

      case 'input':
        const inputBinding = node.props?.binding?.replace('state.', '');
        const inputValue = inputBinding ? getNestedValue(state, inputBinding) || '' : '';
        return (
          <div key={node.id} className="input-group" style={{ marginBottom: '15px' }}>
            {node.props?.label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{node.props.label}</label>}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                if (inputBinding) {
                  setNestedValue(state, inputBinding, e.target.value);
                  setState({ ...state });
                }
              }}
              placeholder={node.props?.placeholder}
              required={node.props?.required}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        );

      case 'textarea':
        const textareaBinding = node.props?.binding?.replace('state.', '');
        const textareaValue = textareaBinding ? getNestedValue(state, textareaBinding) || '' : '';
        return (
          <div key={node.id} className="textarea-group" style={{ marginBottom: '15px' }}>
            {node.props?.label && <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{node.props.label}</label>}
            <textarea
              value={textareaValue}
              onChange={(e) => {
                if (textareaBinding) {
                  setNestedValue(state, textareaBinding, e.target.value);
                  setState({ ...state });
                }
              }}
              placeholder={node.props?.placeholder}
              rows={4}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        );

      case 'button':
        const action = spec.actions?.find(a => a.trigger === `${node.id}.onClick`);
        return (
          <button
            key={node.id}
            onClick={() => {
              if (action) {
                handleAction(action, { state, setState, fetchData, spec });
              }
            }}
            className={`button button-${node.props?.variant || 'primary'}`}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: node.props?.variant === 'secondary' ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {node.props?.label || 'Button'}
          </button>
        );

      case 'table':
        const tableData = node.props?.dataBinding
          ? getNestedValue(state, node.props.dataBinding.replace('state.', ''))
          : [];
        const columns = node.props?.columns || [];
        
        return (
          <div key={node.id} className="table-container" style={{ marginBottom: '15px', overflowX: 'auto' }}>
            {node.props?.title && <h3>{node.props.title}</h3>}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {columns.map((col, i) => (
                    <th key={i} style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(tableData) && tableData.length > 0 ? (
                  tableData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                      {columns.map((col, j) => (
                        <td key={j} style={{ padding: '10px', border: '1px solid #ddd' }}>
                          {row[col] || row[col.toLowerCase().replace(/\s+/g, '')] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'text':
        const textContent = node.props?.content
          ? interpolate(node.props.content, state)
          : '';
        return (
          <p
            key={node.id}
            className={`text text-${node.props?.variant || 'body'}`}
            style={{
              fontSize: node.props?.variant === 'large' ? '1.5em' : '1em',
              marginBottom: '10px'
            }}
          >
            {textContent}
          </p>
        );

      case 'chart':
        return (
          <div key={node.id} className="chart-placeholder" style={{ padding: '20px', border: '2px dashed #ccc', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
            <h3>{node.props?.title || 'Chart'}</h3>
            <p style={{ color: '#999' }}>Chart placeholder ({node.props?.chartType || 'line'})</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Data binding: {node.props?.dataBinding}</p>
          </div>
        );

      default:
        return (
          <div key={node.id} className={`unknown-node unknown-${node.type}`} style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '10px' }}>
            <strong>Unknown node type: {node.type}</strong>
            {node.children?.map(renderNode)}
          </div>
        );
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="appspec-interpreter">
      {spec.layout?.nodes?.map(renderNode)}
    </div>
  );
}

// Helper functions
function getNestedValue(obj, path) {
  if (!path) return undefined;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value === null || value === undefined) return undefined;
    value = value[key];
  }
  return value;
}

function setNestedValue(obj, path, value) {
  if (!path) return;
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function interpolate(template, context) {
  if (typeof template !== 'string') return template;
  return template.replace(/\{\{(.+?)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path.trim());
    return value !== undefined ? value : match;
  });
}
