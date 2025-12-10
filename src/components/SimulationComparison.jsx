import React, { useMemo } from 'react';
import { BarChart, TrendingUp } from 'lucide-react';

export default function SimulationComparison({ simulations }) {
  const comparison = useMemo(() => {
    if (!simulations || simulations.length === 0) return null;

    return {
      avgDuration: simulations.map(s => s.aggregatedMetrics.avgDurationMinutes),
      avgCost: simulations.map(s => s.aggregatedMetrics.avgCostPerRun),
      avgSuccessRate: simulations.map(s => s.aggregatedMetrics.avgSuccessRate),
      names: simulations.map(s => s.protocolName)
    };
  }, [simulations]);

  if (!comparison || simulations.length < 2) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <BarChart size={32} className="mx-auto text-slate-400 mb-4" />
        <p className="text-slate-600">Run at least 2 simulations to compare</p>
      </div>
    );
  }

  const maxDuration = Math.max(...comparison.avgDuration);
  const maxCost = Math.max(...comparison.avgCost);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart size={20} className="text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          Comparison ({simulations.length} runs)
        </h3>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 gap-4">
        {simulations.map((sim, idx) => {
          const durationPercent = (sim.aggregatedMetrics.avgDurationMinutes / maxDuration) * 100;
          const costPercent = (sim.aggregatedMetrics.avgCostPerRun / maxCost) * 100;

          return (
            <div key={sim.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
              <div className="mb-4">
                <h4 className="font-semibold text-slate-900">
                  Run {idx + 1}: {sim.protocolName}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {sim.config.numSamples} samples × {sim.config.numRuns} runs
                </p>
              </div>

              {/* Metrics with bars */}
              <div className="space-y-4">
                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Duration</span>
                    <span className="text-sm font-bold text-slate-900">
                      {sim.aggregatedMetrics.avgDurationMinutes} min
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${durationPercent}%` }}
                    />
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Cost</span>
                    <span className="text-sm font-bold text-slate-900">
                      ${sim.aggregatedMetrics.avgCostPerRun}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${costPercent}%` }}
                    />
                  </div>
                </div>

                {/* Success Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Success Rate
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {sim.aggregatedMetrics.avgSuccessRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${sim.aggregatedMetrics.avgSuccessRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Variance
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    ±{sim.aggregatedMetrics.stdDevDuration}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Range
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    {sim.aggregatedMetrics.minDurationMinutes}–{sim.aggregatedMetrics.maxDurationMinutes} min
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Samples
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {sim.aggregatedMetrics.overallSuccessCount}/{sim.aggregatedMetrics.overallSuccessCount + sim.aggregatedMetrics.overallFailureCount}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <TrendingUp size={20} className="text-indigo-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">Insights</h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li>
                • <strong>Fastest:</strong> Run {comparison.avgDuration.indexOf(Math.min(...comparison.avgDuration)) + 1}{' '}
                ({Math.min(...comparison.avgDuration)} min avg)
              </li>
              <li>
                • <strong>Most Cost-Effective:</strong> Run{' '}
                {comparison.avgCost.indexOf(Math.min(...comparison.avgCost)) + 1} ($
                {Math.min(...comparison.avgCost)} avg)
              </li>
              <li>
                • <strong>Highest Success Rate:</strong> Run{' '}
                {comparison.avgSuccessRate.indexOf(Math.max(...comparison.avgSuccessRate)) + 1}{' '}
                ({Math.max(...comparison.avgSuccessRate)}%)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
