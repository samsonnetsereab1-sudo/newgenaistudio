import React, { useState } from 'react';
import { Star, Tag, Clock, DollarSign, Check } from 'lucide-react';

export default function PresetBrowser({ 
  presets, 
  categories, 
  tags,
  onSelectPreset,
  selectedPresetId,
  loading 
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter presets
  const filteredPresets = presets.filter((preset) => {
    const matchesCategory = !selectedCategory || preset.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => preset.tags.includes(tag));
    const matchesSearch = !searchQuery || 
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesTags && matchesSearch;
  });

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search presets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                selectedCategory === null
                  ? 'bg-indigo-100 text-indigo-900 font-medium'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-lg transition text-sm capitalize ${
                  selectedCategory === category
                    ? 'bg-indigo-100 text-indigo-900 font-medium'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Available Presets ({filteredPresets.length})
        </h3>

        {filteredPresets.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-600">No presets match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-4 rounded-lg border-2 transition ${
                  selectedPresetId === preset.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {preset.name}
                      </h4>
                      {preset.recommended && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          <Star size={12} />
                          Recommended
                        </span>
                      )}
                      {preset.isCustom && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {preset.description}
                    </p>
                  </div>
                  {selectedPresetId === preset.id && (
                    <div className="ml-4">
                      <Check size={20} className="text-indigo-600" />
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {preset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                  {preset.tags.length > 3 && (
                    <span className="text-xs text-slate-600">
                      +{preset.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-slate-600">
                      {preset.estimatedDuration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign size={14} className="text-slate-400" />
                    <span className="text-slate-600">
                      ~${preset.estimatedCost}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded">
                      {preset.config.numSamples}x{preset.config.numRuns}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
