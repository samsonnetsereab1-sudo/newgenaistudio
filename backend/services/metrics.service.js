/**
 * In-memory metrics for generation outcomes and timings
 * Dev-only counters reset on server restart
 */

const state = {
  totals: {
    requests: 0,
    generated: 0,
    templateFallbacks: 0,
    errors: 0
  },
  providers: {
    gemini: 0,
    openai: 0,
    template: 0,
    none: 0
  },
  validationFailures: 0,
  viabilityFailures: 0,
  viabilityReasons: {},
  stageTotals: {
    orchestrate: 0,
    ai: 0,
    validation: 0,
    viability: 0,
    conversion: 0
  },
  elapsedTotal: 0,
  history: [] // last N requests
};

const HISTORY_LIMIT = 50;

export function recordGeneration({ mode, provider, stageTimings, validationProblems = 0, viabilityReason = null, elapsed = 0, problems = [] }) {
  try {
    state.totals.requests += 1;
    if (mode === 'template') state.totals.templateFallbacks += 1; else if (mode === 'error') state.totals.errors += 1; else state.totals.generated += 1;

    if (provider && state.providers[provider] !== undefined) {
      state.providers[provider] += 1;
    }

    if (validationProblems > 0) state.validationFailures += 1;
    if (viabilityReason) {
      state.viabilityFailures += 1;
      state.viabilityReasons[viabilityReason] = (state.viabilityReasons[viabilityReason] || 0) + 1;
    }

    // Aggregate stage timings
    if (stageTimings) {
      state.stageTotals.orchestrate += stageTimings.orchestrate || 0;
      state.stageTotals.ai += stageTimings.aiCall || stageTimings.ai || 0;
      state.stageTotals.validation += stageTimings.validation || 0;
      state.stageTotals.viability += stageTimings.viability || 0;
      state.stageTotals.conversion += stageTimings.conversion || 0;
    }
    state.elapsedTotal += elapsed || 0;

    // Push to bounded history
    const entry = {
      ts: Date.now(),
      mode,
      provider,
      elapsed,
      stageTimings,
      validationProblems,
      viabilityReason,
      problems: (problems || []).slice(0, 3) // trim
    };
    state.history.push(entry);
    if (state.history.length > HISTORY_LIMIT) {
      state.history.splice(0, state.history.length - HISTORY_LIMIT);
    }
  } catch (e) {
    // Avoid breaking generation on metrics errors
    console.warn('[Metrics] recordGeneration error:', e.message);
  }
}

export function getSummary() {
  const reqs = state.totals.requests || 1; // avoid div by zero
  const averages = {
    orchestrateMs: Math.round(state.stageTotals.orchestrate / reqs),
    aiMs: Math.round(state.stageTotals.ai / reqs),
    validationMs: Math.round(state.stageTotals.validation / reqs),
    viabilityMs: Math.round(state.stageTotals.viability / reqs),
    conversionMs: Math.round(state.stageTotals.conversion / reqs),
    elapsedMs: Math.round(state.elapsedTotal / reqs)
  };

  const ratios = {
    generatedPct: Number(((state.totals.generated / reqs) * 100).toFixed(1)),
    templatePct: Number(((state.totals.templateFallbacks / reqs) * 100).toFixed(1)),
    errorPct: Number(((state.totals.errors / reqs) * 100).toFixed(1))
  };

  return {
    totals: state.totals,
    providers: state.providers,
    averages,
    ratios,
    validationFailures: state.validationFailures,
    viabilityFailures: state.viabilityFailures,
    viabilityReasons: state.viabilityReasons,
    recent: state.history
  };
}

export function resetMetrics() {
  // Useful for dev/test
  state.totals = { requests: 0, generated: 0, templateFallbacks: 0, errors: 0 };
  state.providers = { gemini: 0, openai: 0, template: 0, none: 0 };
  state.validationFailures = 0;
  state.viabilityFailures = 0;
  state.viabilityReasons = {};
  state.stageTotals = { orchestrate: 0, ai: 0, validation: 0, viability: 0, conversion: 0 };
  state.elapsedTotal = 0;
  state.history = [];
}

export default { recordGeneration, getSummary, resetMetrics };
