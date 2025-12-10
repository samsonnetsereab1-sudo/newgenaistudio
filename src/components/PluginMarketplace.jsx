import React, { useState, useEffect } from 'react';
import { Search, Download, Lock, X, Check, Loader } from 'lucide-react';

export default function PluginMarketplace() {
  const [plugins, setPlugins] = useState([]);
  const [filteredPlugins, setFilteredPlugins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installingPluginId, setInstallingPluginId] = useState(null);
  const [installedPlugins, setInstalledPlugins] = useState([]);

  useEffect(() => {
    fetchPlugins();
    fetchInstalledPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [plugins, searchTerm, selectedCategory, selectedLicense]);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/plugins', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setPlugins(data.data || []);
    } catch (error) {
      console.error('Failed to fetch plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalledPlugins = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/plugins/installed/list', {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setInstalledPlugins(data.data?.map(p => p.pluginId) || []);
    } catch (error) {
      console.error('Failed to fetch installed plugins:', error);
    }
  };

  const filterPlugins = () => {
    let filtered = plugins;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedLicense) {
      filtered = filtered.filter(p => p.license.type === selectedLicense);
    }

    setFilteredPlugins(filtered);
  };

  const handleInstall = async (pluginId) => {
    try {
      setInstallingPluginId(pluginId);
      const response = await fetch(
        `http://localhost:4000/api/v1/plugins/${pluginId}/install`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.data.checkoutUrl && result.data.checkoutUrl.includes('stripe')) {
        // Redirect to Stripe checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        // Free plugin installed successfully
        setInstalledPlugins([...installedPlugins, pluginId]);
        alert(`✅ ${result.data.message}`);
      }
    } catch (error) {
      alert(`❌ Installation failed: ${error.message}`);
    } finally {
      setInstallingPluginId(null);
    }
  };

  const categories = [...new Set(plugins.map(p => p.category))];
  const licenses = [...new Set(plugins.map(p => p.license.type))];

  const isPluginInstalled = (pluginId) => installedPlugins.includes(pluginId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">🔌 Plugin Marketplace</h1>
          <p className="text-emerald-100">
            Discover scientifically-validated plugins for biologics research
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-800 py-6 px-4 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search plugins by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          {/* Category & License Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-emerald-500 outline-none text-sm transition-colors"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedLicense || ''}
              onChange={(e) => setSelectedLicense(e.target.value || null)}
              className="px-4 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-emerald-500 outline-none text-sm transition-colors"
            >
              <option value="">All Licenses</option>
              {licenses.map(lic => (
                <option key={lic} value={lic}>{lic.charAt(0).toUpperCase() + lic.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        {loading ? (
          <div className="text-center py-20">
            <Loader className="animate-spin mx-auto text-emerald-500 mb-4" size={40} />
            <p className="text-slate-400">Loading plugins...</p>
          </div>
        ) : filteredPlugins.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No plugins found. Try adjusting your filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
                setSelectedLicense(null);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-6">
              Showing {filteredPlugins.length} of {plugins.length} plugins
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map(plugin => {
                const installed = isPluginInstalled(plugin.pluginId);
                const installing = installingPluginId === plugin.pluginId;

                return (
                  <div
                    key={plugin.pluginId}
                    className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    {/* Plugin Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{plugin.icon || '🔌'}</span>
                        {plugin.license.type === 'free' && (
                          <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded font-semibold">
                            FREE
                          </span>
                        )}
                        {plugin.license.type === 'commercial' && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold flex items-center gap-1">
                            <Lock size={12} /> PAID
                          </span>
                        )}
                        {plugin.license.type === 'freemium' && (
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-semibold">
                            FREEMIUM
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white">{plugin.name}</h3>
                      <p className="text-sm text-slate-300">{plugin.vendor.name}</p>
                    </div>

                    {/* Plugin Body */}
                    <div className="p-4">
                      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{plugin.description}</p>

                      {/* Category Badge */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-slate-600 text-slate-200 text-xs rounded">
                          {plugin.category}
                        </span>
                        {plugin.gxpValidated && (
                          <span className="px-2 py-1 bg-emerald-600/20 text-emerald-300 text-xs rounded flex items-center gap-1">
                            <Check size={12} /> GXP
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="bg-slate-800 rounded p-3 mb-4">
                        {plugin.license.type === 'free' ? (
                          <p className="text-emerald-400 font-semibold text-sm">No charge</p>
                        ) : (
                          <p className="text-cyan-400 font-semibold text-sm">
                            ${plugin.baseFee || 'Custom pricing'}
                          </p>
                        )}
                      </div>

                      {/* Install Button */}
                      <button
                        onClick={() => handleInstall(plugin.pluginId)}
                        disabled={installing || installed}
                        className={`w-full font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
                          installed
                            ? 'bg-slate-600 text-slate-300 cursor-default'
                            : installing
                            ? 'bg-slate-500 text-slate-300 cursor-wait'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {installed ? (
                          <>
                            <Check size={16} /> Installed
                          </>
                        ) : installing ? (
                          <>
                            <Loader size={16} className="animate-spin" /> Installing...
                          </>
                        ) : (
                          <>
                            <Download size={16} /> Install
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
