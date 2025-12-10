/**
 * Simulation Presets Service
 * Manages pre-configured simulation scenarios for different lab setups
 */

export class PresetsService {
  constructor() {
    this.presets = this._loadDefaultPresets();
    this.customPresets = new Map();
  }

  /**
   * Load default presets
   */
  _loadDefaultPresets() {
    return {
      'preset-small-lab': {
        id: 'preset-small-lab',
        name: 'Small Lab Setup',
        description: 'Baseline configuration for a small lab with limited capacity',
        icon: 'beaker',
        category: 'lab-size',
        config: {
          numSamples: 5,
          numRuns: 3,
          params: {
            initialYield: 80,
            initialVolume: 40,
            yieldLossPerStep: 0.06
          }
        },
        tags: ['baseline', 'small-lab', 'cost-effective'],
        estimatedCost: 150,
        estimatedDuration: 240,
        recommended: false,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-protein-expression-purification-v1']
      },
      'preset-medium-lab': {
        id: 'preset-medium-lab',
        name: 'Medium Lab Setup',
        description: 'Configuration for a medium-sized lab with standard capacity',
        icon: 'beaker',
        category: 'lab-size',
        config: {
          numSamples: 20,
          numRuns: 5,
          params: {
            initialYield: 100,
            initialVolume: 50,
            yieldLossPerStep: 0.05
          }
        },
        tags: ['baseline', 'medium-lab', 'standard'],
        estimatedCost: 350,
        estimatedDuration: 480,
        recommended: true,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-protein-expression-purification-v1', 'template-lc-ms-prep-v1']
      },
      'preset-large-lab': {
        id: 'preset-large-lab',
        name: 'Large Lab Setup',
        description: 'Configuration for a large lab with high throughput',
        icon: 'beaker',
        category: 'lab-size',
        config: {
          numSamples: 50,
          numRuns: 10,
          params: {
            initialYield: 120,
            initialVolume: 60,
            yieldLossPerStep: 0.04
          }
        },
        tags: ['baseline', 'large-lab', 'high-throughput'],
        estimatedCost: 800,
        estimatedDuration: 960,
        recommended: false,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-protein-expression-purification-v1', 'template-lc-ms-prep-v1']
      },
      'preset-high-yield-sensitivity': {
        id: 'preset-high-yield-sensitivity',
        name: 'High Yield Sensitivity Analysis',
        description: 'Sensitivity analysis for yield loss parameters',
        icon: 'line-chart',
        category: 'analysis-type',
        config: {
          numSamples: 10,
          numRuns: 5,
          params: {
            initialYield: 100,
            initialVolume: 50,
            yieldLossPerStep: 0.02
          }
        },
        tags: ['sensitivity-analysis', 'yield-optimization', 'optimization'],
        estimatedCost: 250,
        estimatedDuration: 300,
        recommended: false,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-protein-expression-purification-v1', 'template-lc-ms-prep-v1']
      },
      'preset-failure-scenario': {
        id: 'preset-failure-scenario',
        name: 'Failure Mode Analysis',
        description: 'Worst-case scenario with high yield loss per step',
        icon: 'alert-triangle',
        category: 'analysis-type',
        config: {
          numSamples: 10,
          numRuns: 10,
          params: {
            initialYield: 100,
            initialVolume: 50,
            yieldLossPerStep: 0.10
          }
        },
        tags: ['failure-analysis', 'worst-case', 'risk-assessment'],
        estimatedCost: 400,
        estimatedDuration: 600,
        recommended: false,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-protein-expression-purification-v1', 'template-lc-ms-prep-v1']
      },
      'preset-cost-optimization': {
        id: 'preset-cost-optimization',
        name: 'Cost Optimization',
        description: 'Minimized cost configuration with acceptable yield',
        icon: 'dollar-sign',
        category: 'optimization',
        config: {
          numSamples: 5,
          numRuns: 2,
          params: {
            initialYield: 75,
            initialVolume: 35,
            yieldLossPerStep: 0.08
          }
        },
        tags: ['cost-optimization', 'budget-conscious', 'lean'],
        estimatedCost: 100,
        estimatedDuration: 180,
        recommended: false,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-lc-ms-prep-v1']
      },
      'preset-high-precision': {
        id: 'preset-high-precision',
        name: 'High Precision / Low Variance',
        description: 'High sample count with multiple runs for statistical significance',
        icon: 'target',
        category: 'optimization',
        config: {
          numSamples: 100,
          numRuns: 20,
          params: {
            initialYield: 110,
            initialVolume: 55,
            yieldLossPerStep: 0.03
          }
        },
        tags: ['high-precision', 'statistical-rigor', 'research-grade'],
        estimatedCost: 1200,
        estimatedDuration: 1440,
        recommended: false,
        compatibility: ['template-crispr-plasmid-prep-v1', 'template-protein-expression-purification-v1', 'template-lc-ms-prep-v1']
      }
    };
  }

  /**
   * Get all presets
   */
  getAll() {
    return Object.values(this.presets);
  }

  /**
   * Get presets by category
   */
  getByCategory(category) {
    return Object.values(this.presets).filter(p => p.category === category);
  }

  /**
   * Get preset by ID
   */
  getById(presetId) {
    return this.presets[presetId] || this.customPresets.get(presetId) || null;
  }

  /**
   * Get recommended presets
   */
  getRecommended() {
    return Object.values(this.presets).filter(p => p.recommended);
  }

  /**
   * Get presets compatible with a template
   */
  getCompatible(templateId) {
    return Object.values(this.presets).filter(p => 
      p.compatibility.includes(templateId)
    );
  }

  /**
   * Create a custom preset
   */
  createCustom(preset) {
    const customId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newPreset = {
      id: customId,
      ...preset,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    this.customPresets.set(customId, newPreset);
    return newPreset;
  }

  /**
   * Update a custom preset
   */
  updateCustom(presetId, updates) {
    const preset = this.customPresets.get(presetId);
    if (!preset) return null;

    const updated = {
      ...preset,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.customPresets.set(presetId, updated);
    return updated;
  }

  /**
   * Delete a custom preset
   */
  deleteCustom(presetId) {
    return this.customPresets.delete(presetId);
  }

  /**
   * Get preset categories
   */
  getCategories() {
    const categories = new Set();
    Object.values(this.presets).forEach(p => {
      categories.add(p.category);
    });
    return Array.from(categories);
  }

  /**
   * Get all tags
   */
  getAllTags() {
    const tags = new Set();
    Object.values(this.presets).forEach(p => {
      p.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }

  /**
   * Search presets by name or description
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.presets).filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export default new PresetsService();
