import express from 'express';

const router = express.Router();

// Mock database - replace with actual DB calls
const plugins = [
  {
    pluginId: 'alphafold2',
    name: 'AlphaFold 2 Structure Prediction',
    version: '2.3.0',
    category: 'Structure Prediction',
    vendor: { name: 'DeepMind (Google)', website: 'https://github.com/deepmind/alphafold' },
    license: { type: 'free', model: 'no-charge' },
    baseFee: 0,
    description: 'DeepMind\'s groundbreaking AI model for accurate protein structure prediction.',
    icon: '🔬',
    gxpValidated: false,
    fda21CFRPart11: false
  },
  {
    pluginId: 'maxquant',
    name: 'MaxQuant Proteomics Suite',
    version: '2.4.14',
    category: 'Proteomics & MS',
    vendor: { name: 'Max Planck Institute', website: 'https://www.maxquant.org' },
    license: { type: 'free', model: 'no-charge' },
    baseFee: 0,
    description: 'Industry-standard computational proteomics platform.',
    icon: '🧬',
    gxpValidated: false,
    fda21CFRPart11: false
  },
  {
    pluginId: 'galaxy',
    name: 'Galaxy Bioinformatics Platform',
    version: '23.09',
    category: 'Sequencing & Bioinformatics',
    vendor: { name: 'Galaxy Community', website: 'https://usegalaxy.org' },
    license: { type: 'free', model: 'no-charge' },
    baseFee: 0,
    description: 'Web-based platform for accessible, reproducible bioinformatics.',
    icon: '🌐',
    gxpValidated: false,
    fda21CFRPart11: false
  },
  {
    pluginId: 'openms',
    name: 'OpenMS Computational MS Framework',
    version: '3.1.0',
    category: 'Proteomics & MS',
    vendor: { name: 'University of Tübingen', website: 'https://openms.de' },
    license: { type: 'free', model: 'no-charge' },
    baseFee: 0,
    description: 'Open-source framework for mass spectrometry with 400+ tools.',
    icon: '⚙️',
    gxpValidated: false,
    fda21CFRPart11: false
  },
  {
    pluginId: 'nextflow',
    name: 'Nextflow Workflow Engine',
    version: '23.11.0-edge',
    category: 'Workflow Orchestration',
    vendor: { name: 'Seqera Labs', website: 'https://nextflow.io' },
    license: { type: 'free', model: 'no-charge' },
    baseFee: 0,
    description: 'Powerful workflow engine for complex data processing pipelines.',
    icon: '🔄',
    gxpValidated: false,
    fda21CFRPart11: false
  }
];

// Mock entitlements (in real implementation, query from DB)
const entitlements = {};

/**
 * GET /api/v1/plugins
 * List all available plugins with filtering & pagination
 */
router.get('/', async (req, res) => {
  try {
    const { category, license, searchTerm, page = 1, limit = 20 } = req.query;
    
    let filtered = plugins;

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (license) {
      filtered = filtered.filter(p => p.license.type === license);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    // Pagination
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const offset = (pageNum - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    res.json({
      status: 'ok',
      data: paginated,
      pagination: { page: pageNum, limit: pageSize, total: filtered.length },
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      messages: [error.message]
    });
  }
});

/**
 * GET /api/v1/plugins/:pluginId
 * Get detailed plugin information
 */
router.get('/:pluginId', async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    const plugin = plugins.find(p => p.pluginId === pluginId);

    if (!plugin) {
      return res.status(404).json({
        status: 'error',
        data: null,
        messages: ['Plugin not found']
      });
    }

    // Get entitlement status if user is authenticated
    const entitlementKey = `${req.user?.tenantId || 'demo'}_${pluginId}`;
    const entitlement = entitlements[entitlementKey];

    res.json({
      status: 'ok',
      data: {
        ...plugin,
        userEntitlement: entitlement ? {
          status: entitlement.status,
          expiresAt: entitlement.expiresAt
        } : null
      },
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      messages: [error.message]
    });
  }
});

/**
 * POST /api/v1/plugins/:pluginId/install
 * Initiate plugin installation (free plugins auto-activate, commercial plugins start Stripe checkout)
 */
router.post('/:pluginId/install', async (req, res) => {
  try {
    const { pluginId } = req.params;
    const tenantId = req.user?.tenantId || 'demo-tenant';

    const plugin = plugins.find(p => p.pluginId === pluginId);

    if (!plugin) {
      return res.status(404).json({
        status: 'error',
        data: null,
        messages: ['Plugin not found']
      });
    }

    // Check if already installed
    const entitlementKey = `${tenantId}_${pluginId}`;
    if (entitlements[entitlementKey]) {
      return res.status(409).json({
        status: 'error',
        data: null,
        messages: ['Plugin already installed for this tenant']
      });
    }

    // Handle free plugins (auto-activate)
    if (plugin.license.type === 'free') {
      const licenseKey = generateLicenseKey(tenantId, pluginId);
      
      entitlements[entitlementKey] = {
        status: 'active',
        licenseKey,
        expiresAt: null,
        quotaApiCalls: 10000,
        quotaDevices: 10,
        createdAt: new Date()
      };

      return res.json({
        status: 'ok',
        data: {
          entitlementId: entitlementKey,
          status: 'active',
          licenseKey,
          message: 'Free plugin activated immediately',
          quotas: { apiCalls: 10000, devices: 10 }
        },
        messages: []
      });
    }

    // Handle commercial/freemium plugins (would create Stripe checkout session)
    return res.json({
      status: 'ok',
      data: {
        checkoutUrl: `http://localhost:5175/checkout/${pluginId}?tenantId=${tenantId}`,
        sessionId: `session_${pluginId}_${Date.now()}`,
        message: 'Checkout session created. This is a demo - real implementation uses Stripe.'
      },
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      messages: [error.message]
    });
  }
});

/**
 * GET /api/v1/plugins/:pluginId/usage
 * Get usage metrics for a plugin (demo data)
 */
router.get('/:pluginId/usage', async (req, res) => {
  try {
    const { pluginId } = req.params;
    const tenantId = req.user?.tenantId || 'demo-tenant';

    const plugin = plugins.find(p => p.pluginId === pluginId);
    if (!plugin) {
      return res.status(404).json({
        status: 'error',
        data: null,
        messages: ['Plugin not found']
      });
    }

    // Mock usage data
    const usage = {
      pluginId,
      period: { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date() },
      metrics: [
        { metricType: 'api_call', count: 245, total_value: 245, avg_value: 1 },
        { metricType: 'gpu_hour', count: 12, total_value: 42.5, avg_value: 3.54 }
      ],
      quota: { apiCalls: 10000, used: 245, remaining: 9755, percentUsed: 2.45 }
    };

    res.json({
      status: 'ok',
      data: usage,
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      messages: [error.message]
    });
  }
});

/**
 * GET /api/v1/plugins/installed/list
 * List user's installed plugins
 */
router.get('/installed/list', async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    
    const userEntitlements = Object.entries(entitlements)
      .filter(([key]) => key.startsWith(tenantId))
      .map(([key, value]) => {
        const pluginId = key.split('_').pop();
        const plugin = plugins.find(p => p.pluginId === pluginId);
        return {
          ...plugin,
          entitlementId: key,
          status: value.status,
          installedAt: value.createdAt,
          expiresAt: value.expiresAt
        };
      });

    res.json({
      status: 'ok',
      data: userEntitlements,
      messages: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      messages: [error.message]
    });
  }
});

/**
 * Generate HMAC-based license key
 */
function generateLicenseKey(tenantId, pluginId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `newgen_${tenantId}_${pluginId}_${timestamp}_${random}`;
}

export default router;
