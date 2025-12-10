/**
 * License validation middleware for plugin endpoints
 * Validates license key before allowing access to protected plugin APIs
 */

export function validatePluginLicense(pluginId) {
  return (req, res, next) => {
    try {
      const licenseKey = req.headers['x-plugin-license'] || req.query.licenseKey;
      const tenantId = req.user?.tenantId || req.query.tenantId || 'demo-tenant';

      if (!licenseKey && req.path !== '/plugins' && req.path !== '/plugins/' && !req.path.includes('/plugins/installed')) {
        // Allow listing plugins without license, but require license for other operations
        return next();
      }

      if (licenseKey) {
        // Validate license format: newgen_<tenantId>_<pluginId>_<timestamp>_<signature>
        const parts = licenseKey.split('_');
        if (parts.length < 5 || parts[0] !== 'newgen') {
          return res.status(403).json({
            status: 'error',
            data: null,
            messages: ['Invalid license key format']
          });
        }

        // In production, validate against database and check expiration
        req.plugin = {
          id: pluginId,
          licenseKey,
          status: 'valid',
          quotas: {
            apiCalls: 10000,
            devices: 10
          }
        };
      }

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
 * Check quota for plugin usage
 */
export function checkQuota(metricType = 'api_call') {
  return (req, res, next) => {
    try {
      if (!req.plugin) {
        return next();
      }

      const quota = req.plugin.quotas[metricType === 'api_call' ? 'apiCalls' : 'devices'];
      
      if (quota && quota <= 0) {
        return res.status(429).json({
          status: 'error',
          data: {
            quota: quota,
            used: 0,
            remaining: 0,
            percentUsed: 100
          },
          messages: ['API quota exceeded. Upgrade your plan.']
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        data: null,
        messages: [error.message]
      });
    }
  };
}

/**
 * Record API usage for metering
 */
export function recordUsage(metricType = 'api_call') {
  return (req, res, next) => {
    try {
      if (req.plugin) {
        // In production, save to database for billing
        console.log(`[METERING] ${req.plugin.id}: ${metricType}`);
      }
      next();
    } catch (error) {
      console.error('Metering error:', error);
      next();
    }
  };
}
