// src/pages/Templates.jsx
import React, { useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { Grid, Tag, Zap, Search, Filter } from 'lucide-react';

export default function Templates() {
  const { templates, loading, error } = useTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  const complexities = [...new Set(templates.map(t => t.complexity))];
  
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchTerm || 
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.domain_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesComplexity = !selectedComplexity || t.complexity === selectedComplexity;
    return matchesSearch && matchesComplexity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Grid className="text-white" size={36} />
            <h1 className="text-4xl font-bold text-white">Template Gallery</h1>
          </div>
          <p className="text-purple-100 text-lg">Pre-built templates for biologics workflows</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800 border-b border-slate-700 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search templates by name or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>
            <select
              value={selectedComplexity || ''}
              onChange={(e) => setSelectedComplexity(e.target.value || null)}
              className="px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="">All Complexities</option>
              {complexities.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20">
            <Grid size={64} className="mx-auto mb-6 text-slate-600" />
            <p className="text-slate-400 text-lg mb-4">
              {searchTerm || selectedComplexity ? 'No templates match your filters.' : 'No templates available yet.'}
            </p>
            {(searchTerm || selectedComplexity) && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedComplexity(null); }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-400">
                Showing {filteredTemplates.length} of {templates.length} templates
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 border-b border-slate-700">
                    <h3 className="font-bold text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {template.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-purple-400" />
                      <span className="text-sm font-medium capitalize text-purple-300">
                        {template.complexity}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.domain_tags?.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30"
                        >
                          <Tag size={12} /> {tag}
                        </span>
                      ))}
                      {template.domain_tags?.length > 3 && (
                        <span className="text-xs text-slate-500 px-2 py-1">+{template.domain_tags.length - 3}</span>
                      )}
                    </div>
                    
                    <button className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50 active:scale-95">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
