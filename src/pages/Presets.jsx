import { useState } from 'react';
import { usePresets } from '../hooks/usePresets';
import PresetBrowser from '../components/PresetBrowser';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function Presets() {
  const {
    presets,
    categories,
    tags,
    loading,
    error,
    createPreset,
    updatePreset,
    deletePreset,
    fetchPresets
  } = usePresets();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'optimization',
    config: {
      numSamples: 10,
      numRuns: 3,
      params: {
        initialYield: 100,
        initialVolume: 50,
        yieldLossPerStep: 0.05
      }
    },
    tags: [],
    estimatedCost: 0,
    estimatedDuration: 0,
    compatibility: []
  });

  const handleCreatePreset = async (e) => {
    e.preventDefault();

    try {
      if (editingPreset) {
        await updatePreset(editingPreset.id, formData);
        setEditingPreset(null);
      } else {
        await createPreset(formData);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'optimization',
        config: {
          numSamples: 10,
          numRuns: 3,
          params: {
            initialYield: 100,
            initialVolume: 50,
            yieldLossPerStep: 0.05
          }
        },
        tags: [],
        estimatedCost: 0,
        estimatedDuration: 0,
        compatibility: []
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to save preset:', err);
    }
  };

  const handleDeletePreset = async (presetId) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      try {
        await deletePreset(presetId);
      } catch (err) {
        console.error('Failed to delete preset:', err);
      }
    }
  };

  const startEdit = (preset) => {
    if (preset.isCustom) {
      setEditingPreset(preset);
      setFormData({
        name: preset.name,
        description: preset.description,
        category: preset.category,
        config: preset.config,
        tags: preset.tags,
        estimatedCost: preset.estimatedCost,
        estimatedDuration: preset.estimatedDuration,
        compatibility: preset.compatibility || []
      });
      setShowCreateForm(true);
    }
  };

  const customPresets = presets.filter((p) => p.isCustom);
  const defaultPresets = presets.filter((p) => !p.isCustom);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Simulation Presets</h1>
          <p className="text-slate-600 mt-2">
            Pre-configured simulation scenarios for different lab setups and optimization goals
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingPreset(null);
            if (showCreateForm) {
              setFormData({
                name: '',
                description: '',
                category: 'optimization',
                config: {
                  numSamples: 10,
                  numRuns: 3,
                  params: {
                    initialYield: 100,
                    initialVolume: 50,
                    yieldLossPerStep: 0.05
                  }
                },
                tags: [],
                estimatedCost: 0,
                estimatedDuration: 0,
                compatibility: []
              });
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
        >
          <Plus size={16} />
          {showCreateForm ? 'Cancel' : 'Create Preset'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreatePreset} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingPreset ? 'Edit Preset' : 'Create New Preset'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Ultra High Precision"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="lab-size">Lab Size</option>
                <option value="analysis-type">Analysis Type</option>
                <option value="optimization">Optimization</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe this preset..."
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Num Samples
              </label>
              <input
                type="number"
                value={formData.config.numSamples}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      numSamples: parseInt(e.target.value)
                    }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Num Runs
              </label>
              <input
                type="number"
                value={formData.config.numRuns}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    config: {
                      ...formData.config,
                      numRuns: parseInt(e.target.value)
                    }
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Est. Cost ($)
              </label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedCost: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Est. Duration (min)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: parseInt(e.target.value)
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition"
            >
              {editingPreset ? 'Update' : 'Create'} Preset
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Default Presets */}
      {defaultPresets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Default Presets</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Config
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Cost / Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {defaultPresets.map((preset) => (
                  <tr key={preset.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{preset.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {preset.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded capitalize">
                        {preset.category.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {preset.config.numSamples}x{preset.config.numRuns}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      ${preset.estimatedCost} / {preset.estimatedDuration}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Presets */}
      {customPresets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Custom Presets</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Config
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Cost / Duration
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customPresets.map((preset) => (
                  <tr key={preset.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{preset.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded capitalize">
                        {preset.category.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {preset.config.numSamples}x{preset.config.numRuns}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      ${preset.estimatedCost} / {preset.estimatedDuration}m
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(preset)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
