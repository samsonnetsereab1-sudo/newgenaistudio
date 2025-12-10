/**
 * Safety Agent
 * Enforces policy, compliance rules, and flags risks
 */
import Agent from './agent.base.js';

class SafetyAgent extends Agent {
  constructor(config = {}) {
    super('Safety', 'safety', config);
    this.policies = config.policies || this._defaultPolicies();
    this.requiredApprovals = config.requiredApprovals || ['human'];
  }

  /**
   * Review and validate against safety policies
   */
  async execute(input) {
    this.status = 'running';
    this.lastAction = 'review';

    try {
      const { plan, protocol, context = {}, simulationResults = null } = input;

      this.log('Starting safety review', { planId: plan?.goalId, protocol });

      const issues = [];
      const warnings = [];
      const recommendations = [];

      // Check biosafety compliance
      const safetyCheck = this._checkBioSafety(protocol, plan);
      if (!safetyCheck.compliant) {
        issues.push(...safetyCheck.issues);
      }
      warnings.push(...safetyCheck.warnings);

      // Check regulatory compliance
      const complianceCheck = this._checkCompliance(protocol, plan);
      if (!complianceCheck.compliant) {
        issues.push(...complianceCheck.issues);
      }

      // Check for restricted operations
      const restrictionCheck = this._checkRestrictions(plan);
      if (!restrictionCheck.allowed) {
        issues.push(...restrictionCheck.issues);
      }

      // Check simulation results if provided
      if (simulationResults) {
        const resultCheck = this._checkSimulationResults(simulationResults);
        if (resultCheck.concerning) {
          warnings.push(...resultCheck.warnings);
          recommendations.push(...resultCheck.recommendations);
        }
      }

      this.lastOutput = {
        reviewId: `review-${Date.now()}`,
        planId: plan?.goalId,
        protocol,
        compliant: issues.length === 0,
        safetyLevel: this._calculateSafetyLevel(issues, warnings),
        issueCount: issues.length,
        warningCount: warnings.length,
        issues,
        warnings,
        recommendations,
        requiredApprovals: issues.length > 0 ? this.requiredApprovals : [],
        approvalRequired: issues.length > 0,
        timestamp: new Date().toISOString()
      };

      this.log('Safety review completed', {
        compliant: this.lastOutput.compliant,
        issueCount: issues.length,
        warningCount: warnings.length,
        safetyLevel: this.lastOutput.safetyLevel
      });

      this.status = 'succeeded';
      return this.lastOutput;
    } catch (err) {
      this.log('Safety review failed', { error: err.message });
      this.status = 'failed';
      throw err;
    }
  }

  /**
   * Check biosafety compliance
   */
  _checkBioSafety(protocol, plan) {
    const issues = [];
    const warnings = [];

    // Mock biosafety checks
    const highRiskPathogens = ['pathogenic E. coli', 'viral vector', 'toxin'];
    if (
      protocol &&
      highRiskPathogens.some((pathogen) => protocol.toLowerCase().includes(pathogen))
    ) {
      issues.push({
        type: 'biosafety-violation',
        severity: 'critical',
        message: 'High-risk pathogen detected. BSL-3 approval required.',
        protocol
      });
    }

    if (plan && plan.steps) {
      // Check for risky operations
      const riskyOps = plan.steps.filter((step) =>
        ['modify-sequence', 'infect-cells', 'create-chimera'].includes(step.action)
      );
      if (riskyOps.length > 0) {
        warnings.push({
          type: 'risky-operation',
          severity: 'medium',
          message: `Plan contains ${riskyOps.length} potentially risky operation(s)`,
          operations: riskyOps.map((s) => s.action)
        });
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Check regulatory compliance (21 CFR, GLP, etc.)
   */
  _checkCompliance(protocol, plan) {
    const issues = [];

    // Mock compliance checks
    const requiredDocumentation = [
      'protocol-description',
      'safety-assessment',
      'quality-control-plan'
    ];

    const hasDocumentation = protocol && protocol.includes('documented');

    if (!hasDocumentation) {
      issues.push({
        type: 'missing-documentation',
        severity: 'high',
        message: 'Required protocol documentation is missing',
        required: requiredDocumentation
      });
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }

  /**
   * Check for restricted operations
   */
  _checkRestrictions(plan) {
    const issues = [];
    const blacklistedOps = [
      'create-weapon',
      'synthesize-regulated-chemical',
      'export-restricted-strain'
    ];

    if (plan && plan.steps) {
      const restricted = plan.steps.filter((step) => blacklistedOps.includes(step.action));
      if (restricted.length > 0) {
        issues.push({
          type: 'restricted-operation',
          severity: 'critical',
          message: `Plan contains ${restricted.length} blacklisted operation(s)`,
          operations: restricted.map((s) => s.action)
        });
      }
    }

    return {
      allowed: issues.length === 0,
      issues
    };
  }

  /**
   * Check simulation results for concerning outcomes
   */
  _checkSimulationResults(results) {
    const warnings = [];
    const recommendations = [];
    let concerning = false;

    if (results.aggregated) {
      const agg = results.aggregated;

      // Low yield warning
      if (agg.yield && agg.yield.mean < 0.7) {
        concerning = true;
        warnings.push({
          type: 'low-yield',
          severity: 'medium',
          value: agg.yield.mean,
          message: 'Simulation shows poor yield. Consider protocol review.'
        });
        recommendations.push('Review reagent quality and concentrations');
      }

      // High cost warning
      if (agg.cost && agg.cost.mean > 500) {
        concerning = true;
        warnings.push({
          type: 'high-cost',
          severity: 'low',
          value: agg.cost.mean,
          message: 'Simulation shows high cost per run'
        });
        recommendations.push('Consider cost-reduction alternatives');
      }

      // High variability
      if (agg.yield && agg.yield.stdDev > 0.2) {
        concerning = true;
        warnings.push({
          type: 'high-variability',
          severity: 'medium',
          value: agg.yield.stdDev,
          message: 'Results show high variability. Protocol may need standardization.'
        });
        recommendations.push('Standardize critical control points');
      }
    }

    return {
      concerning,
      warnings,
      recommendations
    };
  }

  /**
   * Calculate overall safety level
   */
  _calculateSafetyLevel(issues, warnings) {
    const criticalIssues = issues.filter((i) => i.severity === 'critical').length;
    const highIssues = issues.filter((i) => i.severity === 'high').length;

    if (criticalIssues > 0) return 'blocked';
    if (highIssues >= 2) return 'requires-approval';
    if (highIssues === 1 || warnings.length > 3) return 'caution';
    return 'approved';
  }

  /**
   * Request human approval for flagged items
   */
  async requestApproval(reviewId, issues, approvalLevel = 'supervisor') {
    this.log('Requesting approval', { reviewId, issueCount: issues.length, approvalLevel });

    return {
      approvalRequestId: `approval-${Date.now()}`,
      reviewId,
      issueCount: issues.length,
      approvalLevel,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Get default safety policies
   */
  _defaultPolicies() {
    return {
      'biosafety-level': {
        allowed: [1, 2],
        blocked: [3, 4],
        requiresApproval: []
      },
      'export-control': {
        blockedCountries: [],
        blockedTechnologies: ['pathogen-synthesis', 'dual-use-research'],
        requiresApproval: []
      },
      'data-privacy': {
        piiAllowed: false,
        encryptionRequired: true,
        retentionDays: 90
      },
      'ip-protection': {
        blockedPatents: [],
        requiresDisclosure: true
      }
    };
  }

  /**
   * Get audit log for all safety decisions
   */
  getAuditLog() {
    return this.logs.map((log) => ({
      ...log,
      agentType: 'safety',
      category: 'compliance'
    }));
  }
}

export default SafetyAgent;
