import { useState, useEffect } from 'react';
import { useSimulations } from '../hooks/useSimulations';
import { usePresets } from '../hooks/usePresets';
import PresetBrowser from '../components/PresetBrowser';
import SimulationComparison from '../components/SimulationComparison';
import { Play, Download, Eye, Trash2, Zap, BarChart3 } from 'lucide-react';

export default function Simulations() {
  const {
    simulations,
    loading,
    error,
    runSimulation,
    fetchSimulations,
    getSimulation
  } = useSimulations();

  const {
    presets,
    categories,
    tags,
    fetchPresets
  } = usePresets();

  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [view, setView] = useState('builder'); // 'builder' | 'presets' | 'compare'
  const [formData, setFormData] = useState({
    templateId: 'template-crispr-plasmid-prep-v1',
    protocolName: 'CRISPR Plasmid Prep',
    numSamples: 10,
    numRuns: 3,
    params: {
      initialYield: 100,
      initialVolume: 50,
      yieldLossPerStep: 0.05
    }
  });

  useEffect(() => {
    fetchSimulations();
    fetchPresets();
  }, []);

  // Apply preset to form
  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    setFormData((prev) => ({
      ...prev,
      ...preset.config,
      protocolName: preset.name
    }));
    setView('builder');
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();

    try {
      const result = await runSimulation(formData);
      setSelectedSimulation(result);
    } catch (err) {
      console.error('Simulation failed:', err);
    }
  };

  const toggleComparisonSelection = (simId) => {
    setSelectedForComparison((prev) =>
      prev.includes(simId)
        ? prev.filter((id) => id !== simId)
        : [...prev, simId]
    );
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('param_')) {
      const paramName = name.replace('param_', '');
      setFormData((prev) => ({
        ...prev,
        params: {
          ...prev.params,
          [paramName]: parseFloat(value) || value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'numSamples' || name === 'numRuns'
          ? parseInt(value)
          : value
      }));
    }
  };

  const downloadResults = (sim) => {
    const json = JSON.stringify(sim, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${sim.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('param_')) {
      const paramName = name.replace('param_', '');
      setFormData((prev) => ({
        ...prev,
        params: {
          ...prev.params,
          [paramName]: parseFloat(value) || value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'numSamples' || name === 'numRuns'
          ? parseInt(value)
          : value
      }));
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Protocol Simulations</h1>
          <p className="text-slate-600 mt-2">
            Run stochastic simulations of lab protocols to estimate throughput, yield, and costs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('builder')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'builder'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Zap size={16} className="inline mr-2" />
            Builder
          </button>
          <button
            onClick={() => setView('presets')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'presets'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Quick Start
          </button>
          {simulations.length >= 2 && (
            <button
              onClick={() => setView('compare')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'compare'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Compare
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {/* BUILDER VIEW */}
      {view === 'builder' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Form */}
        <div className="col-span-1">
          <form onSubmit={handleRunSimulation} className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">New Simulation</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Template
              </label>
              <select
                name="templateId"
                value={formData.templateId}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="template-crispr-plasmid-prep-v1">
                  CRISPR Plasmid Prep
                </option>
                <option value="template-protein-expression-purification-v1">
                  Protein Expression & Purification
                </option>
                <option value="template-lc-ms-prep-v1">
                  LC-MS Sample Prep
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Protocol Name
              </label>
              <input
                type="text"
                name="protocolName"
                value={formData.protocolName}
                onChange={handleParamChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Samples
              </label>
              <input
                type="number"
                name="numSamples"
                value={formData.numSamples}
                onChange={handleParamChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Runs
              </label>
              <input
                type="number"
                name="numRuns"
                value={formData.numRuns}
                onChange={handleParamChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <hr className="my-4" />

            <h3 className="text-sm font-semibold text-slate-700">Parameters</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Initial Yield (mg)
              </label>
              <input
                type="number"
                name="param_initialYield"
                value={formData.params.initialYield}
                onChange={handleParamChange}
                step="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Initial Volume (ml)
              </label>
              <input
                type="number"
                name="param_initialVolume"
                value={formData.params.initialVolume}
                onChange={handleParamChange}
                step="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Yield Loss per Step (%)
              </label>
              <input
                type="number"
                name="param_yieldLossPerStep"
                value={formData.params.yieldLossPerStep * 100}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    params: {
                      ...prev.params,
                      yieldLossPerStep: parseFloat(e.target.value) / 100
                    }
                  }));
                }}
                step="0.1"
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Play size={16} />
              {loading ? 'Running...' : 'Run Simulation'}
            </button>
          </form>
        </div>

        {/* Results Display */}
        <div className="col-span-2 space-y-6">
          {/* Current Selected Simulation */}
          {selectedSimulation && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selectedSimulation.protocolName}
                  </h2>
                  <p className="text-sm text-slate-600">
                    Run {selectedSimulation.id}
                  </p>
                </div>
                <button
                  onClick={() => downloadResults(selectedSimulation)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>

              {/* Aggregated Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Duration
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedSimulation.aggregatedMetrics.avgDurationMinutes || 0}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    avg minutes (±
                    {selectedSimulation.aggregatedMetrics.stdDevDuration})
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Cost
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    ${selectedSimulation.aggregatedMetrics.avgCostPerRun || 0}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    avg per run
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedSimulation.aggregatedMetrics.avgSuccessRate || 0}%
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    successful samples
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Runs
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedSimulation.aggregatedMetrics.totalRunsCompleted || 0}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    completed
                  </p>
                </div>
              </div>

              {/* Bottlenecks */}
              {selectedSimulation.runs[0]?.bottlenecks.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Identified Bottlenecks
                  </h3>
                  <ul className="space-y-2">
                    {selectedSimulation.runs[0].bottlenecks.map((bn) => (
                      <li
                        key={bn.step}
                        className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                      >
                        <span className="text-sm font-medium text-slate-900">
                          {bn.step}
                        </span>
                        <span className="text-xs font-semibold text-yellow-700">
                          +{bn.deviation}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Previous Simulations List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Recent Simulations
            </h2>

            {simulations.length === 0 ? (
              <p className="text-slate-600 text-sm">
                No simulations yet. Run one to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {simulations.slice(0, 5).map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => setSelectedSimulation(sim)}
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selectedSimulation?.id === sim.id
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {sim.protocolName}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {new Date(sim.timestamp).toLocaleDateString()} •{' '}
                          {sim.aggregatedMetrics.avgDurationMinutes} min avg •
                          ${sim.aggregatedMetrics.avgCostPerRun}
                        </p>
                      </div>
                      <Eye size={16} className="text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* PRESETS VIEW */}
      {view === 'presets' && (
        <div className="bg-white rounded-lg shadow p-6">
          <PresetBrowser
            presets={presets}
            categories={categories}
            tags={tags}
            onSelectPreset={applyPreset}
            selectedPresetId={selectedPreset?.id}
            loading={loading}
          />
        </div>
      )}

      {/* COMPARISON VIEW */}
      {view === 'compare' && (
        <div className="space-y-6">
          {/* Selection Bar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Select Simulations to Compare
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {simulations.map((sim) => (
                <label
                  key={sim.id}
                  className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(sim.id)}
                    onChange={() => toggleComparisonSelection(sim.id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="ml-3 flex-1">
                    <span className="font-medium text-slate-900">
                      {sim.protocolName}
                    </span>
                    <span className="text-xs text-slate-600 ml-2">
                      ({sim.config.numSamples}x{sim.config.numRuns})
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          {selectedForComparison.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <SimulationComparison
                simulations={simulations.filter((s) =>
                  selectedForComparison.includes(s.id)
                )}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
