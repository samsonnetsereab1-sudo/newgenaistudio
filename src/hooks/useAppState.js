/**
 * useAppState Hook
 * Manages state for dynamic apps with action execution
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for app state management
 * @param {object} spec - AppSpec v2.0
 * @returns {object} - { state, setState, getState, handleAction }
 */
export function useAppState(spec) {
  const initialState = spec.state?.global || {};
  const [state, setState] = useState(initialState);
  const [notifications, setNotifications] = useState([]);

  const getState = useCallback(() => {
    return state;
  }, [state]);

  /**
   * Handle action execution
   * @param {object} action - Action definition from AppSpec
   * @param {object} context - Execution context
   */
  const handleAction = useCallback(async (action, context) => {
    console.log('[useAppState] Executing action:', action.id);

    try {
      for (const effect of action.effects) {
        await executeEffect(effect, context);
      }
    } catch (error) {
      console.error('[useAppState] Action execution error:', error);
      addNotification('Action failed: ' + error.message, 'error');
    }
  }, [state]);

  /**
   * Execute a single effect
   */
  const executeEffect = async (effect, context) => {
    const { state, setState, fetchData, spec } = context;

    switch (effect.type) {
      case 'validate':
        executeValidation(effect, state);
        break;

      case 'api-call':
        await executeApiCall(effect, context);
        break;

      case 'update-state':
        executeUpdateState(effect, state, setState);
        break;

      case 'notify':
        addNotification(effect.message, effect.variant || 'info');
        break;

      case 'navigate':
        console.log('[useAppState] Navigate to:', effect.route);
        // Could integrate with React Router here
        break;

      case 'conditional':
        await executeConditional(effect, context);
        break;

      default:
        console.warn('[useAppState] Unknown effect type:', effect.type);
    }
  };

  /**
   * Execute validation effect
   */
  const executeValidation = (effect, state) => {
    const { rules } = effect;
    const errors = [];

    for (const [path, rule] of Object.entries(rules)) {
      const value = getNestedValue(state, path.replace('state.', ''));

      if (rule.required && (!value || value === '')) {
        errors.push(`${path} is required`);
      }

      if (rule.pattern && value && !new RegExp(rule.pattern).test(value)) {
        errors.push(`${path} does not match required pattern`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
  };

  /**
   * Execute API call effect
   */
  const executeApiCall = async (effect, context) => {
    const { fetchData, state, setState } = context;
    const { dataSource, method, body } = effect;

    console.log('[useAppState] API call:', method, dataSource);

    // Resolve body template
    const resolvedBody = body ? interpolateObject(body, state) : null;

    const result = await fetchData(dataSource, {
      method,
      body: resolvedBody
    });

    // Store response in a temporary location for next effect
    context.response = result;
  };

  /**
   * Execute update state effect
   */
  const executeUpdateState = (effect, state, setState) => {
    const { path, operation, value } = effect;
    const resolvedValue = interpolate(value, state);

    switch (operation) {
      case 'set':
        setNestedValue(state, path, resolvedValue);
        break;

      case 'merge':
        const currentValue = getNestedValue(state, path);
        if (typeof currentValue === 'object' && typeof resolvedValue === 'object') {
          setNestedValue(state, path, { ...currentValue, ...resolvedValue });
        } else {
          setNestedValue(state, path, resolvedValue);
        }
        break;

      case 'append':
        const arrayValue = getNestedValue(state, path);
        if (Array.isArray(arrayValue)) {
          arrayValue.push(resolvedValue);
        }
        break;

      case 'reset':
        const initialValue = spec.state?.global?.[path] || (Array.isArray(getNestedValue(state, path)) ? [] : {});
        setNestedValue(state, path, initialValue);
        break;

      case 'increment':
        const currentNum = getNestedValue(state, path) || 0;
        setNestedValue(state, path, currentNum + (resolvedValue || 1));
        break;

      case 'decrement':
        const currentDec = getNestedValue(state, path) || 0;
        setNestedValue(state, path, currentDec - (resolvedValue || 1));
        break;

      default:
        console.warn('[useAppState] Unknown operation:', operation);
    }

    // Trigger re-render
    setState({ ...state });
  };

  /**
   * Execute conditional effect
   */
  const executeConditional = async (effect, context) => {
    const { condition, then: thenEffects, else: elseEffects } = effect;
    const { state } = context;

    const conditionResult = evaluateCondition(condition, state);
    const effectsToExecute = conditionResult ? thenEffects : elseEffects;

    if (effectsToExecute && effectsToExecute.length > 0) {
      for (const subEffect of effectsToExecute) {
        await executeEffect(subEffect, context);
      }
    }
  };

  /**
   * Add notification
   */
  const addNotification = (message, variant = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      variant
    };
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);

    console.log(`[useAppState] Notification (${variant}):`, message);
  };

  return {
    state,
    setState,
    getState,
    handleAction,
    notifications
  };
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

function interpolate(value, context) {
  if (typeof value === 'string') {
    return value.replace(/\{\{(.+?)\}\}/g, (match, path) => {
      const val = getNestedValue(context, path.trim());
      return val !== undefined ? val : match;
    });
  }
  return value;
}

function interpolateObject(obj, context) {
  if (typeof obj === 'string') {
    // If it's a template string like "{{state.formData}}", resolve it
    const match = obj.match(/^\{\{(.+?)\}\}$/);
    if (match) {
      return getNestedValue(context, match[1].trim());
    }
    return interpolate(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => interpolateObject(item, context));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, context);
    }
    return result;
  }

  return obj;
}

function evaluateCondition(condition, state) {
  try {
    const interpolated = interpolate(condition, state);
    // Simple evaluation - in production, use a safe expression evaluator
    // For now, just check for basic comparisons
    return eval(interpolated);
  } catch (error) {
    console.error('[useAppState] Condition evaluation error:', error);
    return false;
  }
}
