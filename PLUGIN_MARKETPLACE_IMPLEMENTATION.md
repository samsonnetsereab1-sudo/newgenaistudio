# 🛒 Plugin Marketplace Implementation Guide — NewGen Studio

**Version**: 1.0  
**Date**: December 10, 2025  
**Status**: Implementation Roadmap & Code Scaffolding

---

## Overview

This document provides **step-by-step implementation instructions** for NewGen Studio's plugin marketplace, including code scaffolding, API endpoints, and integration patterns.

**Key Objectives:**
- ✅ Create plugin catalog & entitlement management
- ✅ Implement Stripe billing integration  
- ✅ Build developer-facing marketplace UI
- ✅ Seed with 10 high-value plugins (5 free, 5 commercial)
- ✅ Deploy within 90 days with $130K projected ARR

---

## Part 1: Backend Marketplace Microservice

### 1.1 Plugin Routes & Catalog API

**File**: `backend/routes/marketplace.routes.js`

```javascript
// backend/routes/marketplace.routes.js
const express = require('express');
const router = express.Router();

/**
 * GET /api/v1/plugins
 * List all available plugins with filtering & pagination
 */
router.get('/plugins', async (req, res) => {
  try {
    const { category, license, searchTerm, page = 1, limit = 20 } = req.query;
    
    let query = 'SELECT * FROM plugins WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (license) {
      query += ' AND license_type = $' + (params.length + 1);
      params.push(license);
    }

    if (searchTerm) {
      query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${searchTerm}%`);
      params.push(`%${searchTerm}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}`;

    const result = await db.query(query, params);

    res.json({
      status: 'ok',
      data: result.rows,
      pagination: { page, limit, total: result.rowCount },
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
router.get('/plugins/:pluginId', async (req, res) => {
  try {
    const { pluginId } = req.params;
    
    const query = `
      SELECT p.*, 
             COUNT(DISTINCT ent.tenant_id) as active_users,
             AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ent.purchased_at))/3600) as avg_usage_hours
      FROM plugins p
      LEFT JOIN plugin_entitlements ent ON p.plugin_id = ent.plugin_id AND ent.status = 'active'
      WHERE p.plugin_id = $1
      GROUP BY p.plugin_id
    `;

    const result = await db.query(query, [pluginId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        data: null,
        messages: ['Plugin not found']
      });
    }

    res.json({
      status: 'ok',
      data: result.rows[0],
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
router.post('/plugins/:pluginId/install', authenticateTenant, async (req, res) => {
  try {
    const { pluginId } = req.params;
    const { tenantId } = req.user;

    // Fetch plugin details
    const pluginResult = await db.query(
      'SELECT * FROM plugins WHERE plugin_id = $1',
      [pluginId]
    );

    if (pluginResult.rowCount === 0) {
      return res.status(404).json({
        status: 'error',
        data: null,
        messages: ['Plugin not found']
      });
    }

    const plugin = pluginResult.rows[0];

    // Check if already installed
    const existingResult = await db.query(
      'SELECT * FROM plugin_entitlements WHERE tenant_id = $1 AND plugin_id = $2',
      [tenantId, pluginId]
    );

    if (existingResult.rowCount > 0) {
      return res.status(409).json({
        status: 'error',
        data: null,
        messages: ['Plugin already installed for this tenant']
      });
    }

    // Handle free plugins (auto-activate)
    if (plugin.license_type === 'free') {
      const licenseKey = generateLicenseKey(tenantId, pluginId);
      
      await db.query(
        `INSERT INTO plugin_entitlements 
         (tenant_id, plugin_id, license_key, status, expires_at, quota_api_calls, quota_devices)
         VALUES ($1, $2, $3, $4, NULL, $5, $6)`,
        [tenantId, pluginId, licenseKey, 'active', plugin.quota_api_calls || 10000, plugin.quota_devices || 10]
      );

      return res.json({
        status: 'ok',
        data: {
          entitlementId: `ent_${tenantId}_${pluginId}`,
          status: 'active',
          licenseKey,
          message: 'Free plugin activated immediately'
        },
        messages: []
      });
    }

    // Handle commercial/freemium plugins (create Stripe checkout session)
    if (['commercial', 'freemium', 'enterprise'].includes(plugin.license_type)) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const session = await stripe.checkout.sessions.create({
        mode: plugin.pricing_model === 'subscription' ? 'subscription' : 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: plugin.name,
              description: plugin.description,
              images: [plugin.icon_url]
            },
            unit_amount: Math.round((plugin.base_fee || 299) * 100),
            recurring: plugin.pricing_model === 'subscription' 
              ? { interval: 'month', interval_count: 1 }
              : undefined
          },
          quantity: 1
        }],
        success_url: `${process.env.FRONTEND_URL}/plugins/${pluginId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/plugins/${pluginId}`,
        client_reference_id: `${tenantId}:${pluginId}`,
        metadata: {
          tenantId,
          pluginId,
          vendor: plugin.vendor_name
        }
      });

      res.json({
        status: 'ok',
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
          message: 'Checkout session created. Redirect to Stripe.'
        },
        messages: []
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      data: null,
      messages: [error.message]
    });
  }
});

/**
 * GET /api/v1/plugins/usage/summary
 * Get usage metrics for a plugin
 */
router.get('/plugins/:pluginId/usage', authenticateTenant, async (req, res) => {
  try {
    const { pluginId } = req.params;
    const { tenantId } = req.user;
    const { startDate, endDate } = req.query;

    const query = `
      SELECT 
        metric_type,
        COUNT(*) as count,
        SUM(value) as total_value,
        AVG(value) as avg_value,
        MAX(value) as max_value
      FROM plugin_usage
      WHERE tenant_id = $1 AND plugin_id = $2
        AND timestamp >= $3 AND timestamp <= $4
      GROUP BY metric_type
    `;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await db.query(query, [tenantId, pluginId, start, end]);

    res.json({
      status: 'ok',
      data: {
        pluginId,
        period: { startDate: start, endDate: end },
        metrics: result.rows
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

module.exports = router;
```

### 1.2 License Validation Middleware

**File**: `backend/middleware/licenseValidator.js`

```javascript
// backend/middleware/licenseValidator.js

const crypto = require('crypto');

/**
 * Validate plugin license key before allowing API access
 */
async function validatePluginLicense(pluginId, licenseKey, tenantId) {
  // Query entitlements table
  const result = await db.query(
    `SELECT * FROM plugin_entitlements 
     WHERE tenant_id = $1 AND plugin_id = $2 AND license_key = $3`,
    [tenantId, pluginId, licenseKey]
  );

  if (result.rowCount === 0) {
    throw new Error('Invalid license key');
  }

  const entitlement = result.rows[0];

  // Check status
  if (entitlement.status === 'expired') {
    throw new Error('License expired');
  }

  if (entitlement.status === 'suspended') {
    throw new Error('License suspended');
  }

  // Check expiration date
  if (entitlement.expires_at && new Date() > new Date(entitlement.expires_at)) {
    await db.query(
      'UPDATE plugin_entitlements SET status = $1 WHERE entitlement_id = $2',
      ['expired', entitlement.entitlement_id]
    );
    throw new Error('License expired');
  }

  return entitlement;
}

/**
 * Middleware: Require valid plugin license
 * Usage: router.get('/endpoint', requirePluginLicense('plugin-id'), handler)
 */
function requirePluginLicense(pluginId) {
  return async (req, res, next) => {
    try {
      const licenseKey = req.headers['x-plugin-license'] || req.query.licenseKey;
      const tenantId = req.user?.tenantId;

      if (!licenseKey || !tenantId) {
        return res.status(401).json({
          status: 'error',
          data: null,
          messages: ['Missing license key or tenant ID']
        });
      }

      const entitlement = await validatePluginLicense(pluginId, licenseKey, tenantId);
      
      // Attach to request
      req.plugin = {
        id: pluginId,
        entitlementId: entitlement.entitlement_id,
        status: entitlement.status,
        quotas: {
          apiCalls: entitlement.quota_api_calls,
          devices: entitlement.quota_devices
        }
      };

      next();
    } catch (error) {
      res.status(403).json({
        status: 'error',
        data: null,
        messages: [error.message]
      });
    }
  };
}

/**
 * Generate license key (HMAC-based)
 * Format: newgen_<tenantId>_<pluginId>_<timestamp>_<signature>
 */
function generateLicenseKey(tenantId, pluginId) {
  const timestamp = Date.now();
  const secret = process.env.LICENSE_SIGNING_SECRET;
  
  const payload = `${tenantId}:${pluginId}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
    .substring(0, 16);

  return `newgen_${tenantId}_${pluginId}_${timestamp}_${signature}`;
}

module.exports = {
  validatePluginLicense,
  requirePluginLicense,
  generateLicenseKey
};
```

### 1.3 Usage Metering Service

**File**: `backend/services/metering.service.js`

```javascript
// backend/services/metering.service.js

const prometheus = require('prom-client');

/**
 * Track plugin usage for metering & billing
 */
class MeteringService {
  constructor() {
    // Prometheus metrics
    this.pluginApiCalls = new prometheus.Counter({
      name: 'plugin_api_calls_total',
      help: 'Total API calls to plugins',
      labelNames: ['plugin_id', 'tenant_id', 'status']
    });

    this.pluginErrors = new prometheus.Counter({
      name: 'plugin_errors_total',
      help: 'Total errors from plugins',
      labelNames: ['plugin_id', 'error_type']
    });

    this.pluginDuration = new prometheus.Histogram({
      name: 'plugin_request_duration_seconds',
      help: 'Plugin request duration',
      labelNames: ['plugin_id'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });
  }

  /**
   * Record API call to database for billing
   */
  async recordUsage(tenantId, pluginId, metricType, value = 1, metadata = {}) {
    try {
      await db.query(
        `INSERT INTO plugin_usage (tenant_id, plugin_id, metric_type, value, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, pluginId, metricType, value, JSON.stringify(metadata)]
      );

      // Increment Prometheus counter
      this.pluginApiCalls.inc({
        plugin_id: pluginId,
        tenant_id: tenantId,
        status: 'success'
      });
    } catch (error) {
      console.error('Metering error:', error);
    }
  }

  /**
   * Check quota for API calls
   */
  async checkQuota(tenantId, pluginId) {
    const result = await db.query(
      `SELECT ent.quota_api_calls, COUNT(u.usage_id) as usage_count
       FROM plugin_entitlements ent
       LEFT JOIN plugin_usage u ON ent.entitlement_id = u.entitlement_id
         AND u.timestamp >= CURRENT_DATE
       WHERE ent.tenant_id = $1 AND ent.plugin_id = $2
       GROUP BY ent.quota_api_calls`,
      [tenantId, pluginId]
    );

    if (result.rowCount === 0) {
      throw new Error('No entitlement found');
    }

    const { quota_api_calls, usage_count } = result.rows[0];
    const remaining = quota_api_calls - usage_count;

    return {
      quota: quota_api_calls,
      used: usage_count,
      remaining,
      percentUsed: (usage_count / quota_api_calls) * 100,
      exceeded: remaining < 0
    };
  }

  /**
   * Middleware: Track request duration & record usage
   */
  middleware(pluginId) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const tenantId = req.user?.tenantId;

      // Check quota first
      try {
        const quota = await this.checkQuota(tenantId, pluginId);
        if (quota.exceeded) {
          return res.status(429).json({
            status: 'error',
            data: quota,
            messages: ['API quota exceeded. Upgrade your plan.']
          });
        }
        req.quota = quota;
      } catch (error) {
        return res.status(403).json({
          status: 'error',
          data: null,
          messages: [error.message]
        });
      }

      // Hook response to track metrics
      const originalSend = res.send;
      res.send = function(data) {
        const duration = (Date.now() - startTime) / 1000;
        
        // Record usage
        metering.recordUsage(tenantId, pluginId, 'api_call', 1, {
          endpoint: req.path,
          statusCode: res.statusCode,
          duration
        });

        // Track Prometheus metrics
        metering.pluginDuration.observe({ plugin_id: pluginId }, duration);

        res.send = originalSend;
        return res.send(data);
      };

      next();
    };
  }
}

const metering = new MeteringService();
module.exports = metering;
```

---

## Part 2: Frontend Marketplace UI

### 2.1 Plugin Browser Component

**File**: `src/components/PluginMarketplace.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { ChevronRight, Download, Star, Lock } from 'lucide-react';
import apiClient from '../api/client';

export default function PluginMarketplace() {
  const [plugins, setPlugins] = useState([]);
  const [filteredPlugins, setFilteredPlugins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [plugins, searchTerm, selectedCategory, selectedLicense]);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/plugins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
      filtered = filtered.filter(p => p.license_type === selectedLicense);
    }

    setFilteredPlugins(filtered);
  };

  const handleInstall = async (pluginId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/plugins/${pluginId}/install`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      const result = await response.json();

      if (result.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        // Free plugin installed
        alert(`✅ ${result.data.message}`);
      }
    } catch (error) {
      alert(`❌ Installation failed: ${error.message}`);
    }
  };

  const categories = [...new Set(plugins.map(p => p.category))];
  const licenses = [...new Set(plugins.map(p => p.license_type))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">🔌 Plugin Marketplace</h1>
          <p className="text-emerald-100">
            Discover 100+ scientifically-validated plugins for biologics research
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-800 py-6 px-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-emerald-500 outline-none mb-4"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-emerald-500 outline-none text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedLicense || ''}
              onChange={(e) => setSelectedLicense(e.target.value || null)}
              className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:border-emerald-500 outline-none text-sm"
            >
              <option value="">All Licenses</option>
              {licenses.map(lic => (
                <option key={lic} value={lic}>{lic.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        {loading ? (
          <p className="text-center text-slate-400">Loading plugins...</p>
        ) : filteredPlugins.length === 0 ? (
          <p className="text-center text-slate-400">No plugins found. Try adjusting filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlugins.map(plugin => (
              <div
                key={plugin.plugin_id}
                className="bg-slate-700 rounded-lg overflow-hidden border border-slate-600 hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
              >
                {/* Plugin Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <img
                      src={plugin.icon_url || '🔌'}
                      alt={plugin.name}
                      className="w-10 h-10 rounded"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                    {plugin.license_type === 'free' && (
                      <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded font-semibold">
                        FREE
                      </span>
                    )}
                    {plugin.license_type === 'commercial' && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold flex items-center gap-1">
                        <Lock size={12} /> PAID
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-3">{plugin.name}</h3>
                  <p className="text-sm text-slate-300 mt-1">{plugin.vendor_name || 'Unknown'}</p>
                </div>

                {/* Plugin Body */}
                <div className="p-4">
                  <p className="text-sm text-slate-300 mb-3">{plugin.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-slate-600 text-slate-200 text-xs rounded">
                      {plugin.category}
                    </span>
                    {plugin.gxp_validated && (
                      <span className="px-2 py-1 bg-emerald-600/20 text-emerald-300 text-xs rounded flex items-center gap-1">
                        ✓ GXP Validated
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="bg-slate-800 rounded p-3 mb-4">
                    {plugin.license_type === 'free' ? (
                      <p className="text-emerald-400 font-semibold">No charge</p>
                    ) : (
                      <p className="text-cyan-400 font-semibold">
                        ${plugin.base_fee || '299'}/{plugin.pricing_model === 'subscription' ? 'month' : 'one-time'}
                      </p>
                    )}
                  </div>

                  {/* Install Button */}
                  <button
                    onClick={() => handleInstall(plugin.plugin_id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Install Plugin
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Part 3: Integration Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Create PostgreSQL tables (plugins, plugin_entitlements, plugin_usage)
- [ ] Implement plugin catalog routes (`/api/v1/plugins`, `/api/v1/plugins/:id`)
- [ ] Create license validation middleware
- [ ] Seed marketplace with 10 plugins (5 free, 5 commercial)
- [ ] Build PluginMarketplace UI component
- [ ] Integrate into Dashboard navigation

### Phase 2: Billing (Week 3-4)

- [ ] Set up Stripe account and API keys
- [ ] Implement Stripe checkout flow in `/api/v1/plugins/:pluginId/install`
- [ ] Create webhook handler for `checkout.session.completed`
- [ ] Build entitlement auto-provisioning on payment success
- [ ] Implement trial period enforcement (30-day auto-expiry)

### Phase 3: Metering & Quotas (Week 5)

- [ ] Implement usage tracking (APIcalls, device connections, GPU hours)
- [ ] Create quota check middleware
- [ ] Build usage dashboard for developers
- [ ] Set up Prometheus metrics export

### Phase 4: Vendor Onboarding (Week 6-8)

- [ ] Contact 5 vendors (Ganymede, Benchling, Scispot, OmniSeq, LabKey)
- [ ] Negotiate reseller agreements
- [ ] Implement vendor-specific webhooks
- [ ] Create vendor dashboard (analytics, payouts)

### Phase 5: Pilot & Launch (Week 9-12)

- [ ] Beta test with 3 pharma companies
- [ ] Gather feedback and iterate
- [ ] Launch publicly to NewGen community
- [ ] Monitor churn, revenue, and user satisfaction

---

## Part 4: Testing & Validation

### Test Cases for Plugin Installation

```javascript
// tests/marketplace.test.js

describe('Plugin Marketplace', () => {
  describe('POST /api/v1/plugins/:pluginId/install', () => {
    test('should install free plugin immediately', async () => {
      const response = await request(app)
        .post('/api/v1/plugins/alphafold/install')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.status).toBe('active');
      expect(response.body.data.licenseKey).toBeDefined();
    });

    test('should redirect to Stripe for paid plugins', async () => {
      const response = await request(app)
        .post('/api/v1/plugins/ganymede-connector/install')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.checkoutUrl).toContain('stripe.com');
    });

    test('should prevent duplicate installations', async () => {
      // Install first time
      await request(app)
        .post('/api/v1/plugins/alphafold/install')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to install again
      const response = await request(app)
        .post('/api/v1/plugins/alphafold/install')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.messages[0]).toContain('already installed');
    });
  });

  describe('GET /api/v1/plugins', () => {
    test('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/plugins?category=Proteomics')
        .expect(200);

      response.body.data.forEach(plugin => {
        expect(plugin.category).toBe('Proteomics');
      });
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/plugins?page=1&limit=10')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body.pagination.page).toBe(1);
    });
  });
});
```

---

## Next Steps

1. **This Week**: Create database tables + seed 10 plugins
2. **Next Week**: Implement Stripe checkout flow
3. **Week 3**: Launch beta to 3 early customers
4. **Month 2**: Reach $5K MRR from marketplace fees

Ready to scaffold this? Let me know if you want:
- 📊 Detailed plugin.json for each of the 10 seed plugins
- 💳 Complete Stripe webhook handler code
- 🗄️ PostgreSQL migration scripts
- 📈 Billing dashboard backend API
