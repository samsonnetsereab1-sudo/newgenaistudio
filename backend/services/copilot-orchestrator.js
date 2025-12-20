/**
 * Copilot Orchestration Layer
 * Analyzes user requests, applies domain knowledge, and generates enhanced prompts
 * for AI services to produce Base44-quality applications
 */

// Domain knowledge bases
const DOMAIN_PATTERNS = {
  pharma: {
    keywords: ['gmp', 'cgmp', 'validation', 'batch', 'lot', 'sample', 'qa', 'qc', 'audit', 'compliance', 'alcoa', '21 cfr', 'deviation'],
    architectureTemplate: 'pharmaceutical_quality_system',
    components: ['batch-tracker', 'sample-management', 'audit-trail', 'deviation-log', 'document-control']
  },
  biotech: {
    keywords: ['fermentor', 'bioreactor', 'bioprocess', 'cell culture', 'upstream', 'downstream', 'purification', 'chromatography', 'scada', 'opc'],
    architectureTemplate: 'bioprocess_control_system',
    components: ['fermentor-viz', 'process-parameters', 'digital-twin', 'run-simulation', 'protocol-editor']
  },
  clinical: {
    keywords: ['clinical trial', 'patient', 'adverse event', 'icf', 'consent', 'protocol', 'site', 'investigator', 'irb', 'ctms'],
    architectureTemplate: 'clinical_trial_management',
    components: ['patient-enrollment', 'adverse-event-tracker', 'protocol-deviation', 'site-management']
  },
  manufacturing: {
    keywords: ['production', 'manufacturing', 'equipment', 'maintenance', 'downtime', 'oee', 'process', 'line', 'batch record'],
    architectureTemplate: 'manufacturing_execution_system',
    components: ['production-dashboard', 'equipment-status', 'batch-record', 'oee-tracker']
  }
};

// Architectural templates based on Base44 patterns
const ARCHITECTURE_TEMPLATES = {
  bioprocess_control_system: {
    layers: [
      {
        level: 1,
        name: 'Physical Layer',
        description: 'Equipment and sensor integration',
        components: ['equipment-status', 'sensor-readings', 'actuator-controls']
      },
      {
        level: 2,
        name: 'Data Acquisition',
        description: 'Real-time data collection and processing',
        components: ['data-logger', 'signal-processor', 'time-series-db']
      },
      {
        level: 3,
        name: 'Backend Services',
        description: 'Business logic and data management',
        components: ['api-gateway', 'database', 'authentication', 'authorization']
      },
      {
        level: 4,
        name: 'AI/ML Engine',
        description: 'Intelligent analysis and optimization',
        components: ['llm-protocol', 'digital-twin', 'parameter-optimizer', 'control-strategy']
      },
      {
        level: 5,
        name: 'Application Layer',
        description: 'Core business functionality',
        components: ['protocol-editor', 'run-simulation', 'custom-config', 'multi-run-interpret', 'workflow-manager']
      },
      {
        level: 6,
        name: 'Presentation Layer',
        description: 'User interface and visualization',
        components: ['dashboard', 'charts', '3d-visualization', 'real-time-monitor']
      },
      {
        level: 7,
        name: 'User Layer',
        description: 'End user personas and access patterns',
        components: ['role-based-access', 'user-profiles', 'personalization']
      }
    ]
  },
  pharmaceutical_quality_system: {
    layers: [
      {
        level: 1,
        name: 'Production Layer',
        description: 'Manufacturing and batch processing',
        components: ['batch-management', 'production-schedule', 'material-tracking']
      },
      {
        level: 2,
        name: 'Quality Control',
        description: 'Testing and analysis',
        components: ['sample-management', 'test-results', 'lims-integration', 'stability-testing']
      },
      {
        level: 3,
        name: 'Quality Assurance',
        description: 'Audit and compliance',
        components: ['audit-trail', 'deviation-management', 'capa', 'document-control']
      },
      {
        level: 4,
        name: 'Regulatory',
        description: 'Compliance and validation',
        components: ['validation-tracking', 'regulatory-reporting', '21cfr-part11', 'alcoa-compliance']
      },
      {
        level: 5,
        name: 'Analytics',
        description: 'Trending and insights',
        components: ['quality-metrics', 'trend-analysis', 'risk-assessment', 'predictive-analytics']
      }
    ]
  }
};

// Component specifications with detailed implementation guidance
const COMPONENT_LIBRARY = {
  'fermentor-viz': {
    type: '3d-visualization',
    description: 'Interactive 3D fermentor/bioreactor visualization',
    uiElements: ['canvas-3d', 'parameter-overlays', 'zoom-controls', 'rotation-controls'],
    dataRequirements: ['temperature', 'pressure', 'ph', 'do', 'volume', 'agitation']
  },
  'batch-tracker': {
    type: 'data-management',
    description: 'Comprehensive batch/lot tracking system',
    uiElements: ['batch-table', 'status-indicators', 'timeline-view', 'search-filters', 'batch-details-modal'],
    dataRequirements: ['batchNumber', 'status', 'startDate', 'endDate', 'product', 'quantity', 'qcResults']
  },
  'audit-trail': {
    type: 'compliance',
    description: 'ALCOA+ compliant audit trail with electronic signatures',
    uiElements: ['audit-log-table', 'signature-modal', 'filter-controls', 'export-pdf'],
    dataRequirements: ['timestamp', 'user', 'action', 'recordType', 'recordId', 'oldValue', 'newValue', 'reason', 'signature']
  },
  'digital-twin': {
    type: 'simulation',
    description: 'Digital twin simulation engine with parameter optimization',
    uiElements: ['simulation-canvas', 'parameter-inputs', 'run-controls', 'results-chart', 'comparison-view'],
    dataRequirements: ['initialConditions', 'processParameters', 'controlStrategy', 'predictedOutcomes']
  },
  'protocol-editor': {
    type: 'workflow',
    description: 'Visual protocol editor with step-by-step workflow',
    uiElements: ['workflow-canvas', 'step-palette', 'property-panel', 'validation-panel', 'preview-mode'],
    dataRequirements: ['steps', 'conditions', 'parameters', 'timing', 'dependencies']
  },
  'sample-management': {
    type: 'data-management',
    description: 'Sample lifecycle management with chain of custody',
    uiElements: ['sample-table', 'barcode-scanner', 'location-tracker', 'chain-of-custody', 'disposal-log'],
    dataRequirements: ['sampleId', 'type', 'location', 'status', 'collectionDate', 'analyst', 'testingSchedule']
  },
  'production-dashboard': {
    type: 'analytics',
    description: 'Real-time production KPI dashboard',
    uiElements: ['kpi-cards', 'trend-charts', 'status-indicators', 'alert-panel', 'oee-gauge'],
    dataRequirements: ['productionRate', 'downtime', 'quality', 'availability', 'performance', 'oee']
  }
};

class CopilotOrchestrator {
  /**
   * Main orchestration method - analyzes request and generates enhanced prompt
   */
  async orchestrate(userPrompt, context = {}) {
    console.log('🤖 Copilot Orchestrator: Analyzing request...');
    
    // Step 1: Analyze domain
    const domain = this.detectDomain(userPrompt);
    console.log(`📊 Detected domain: ${domain || 'general'}`);
    
    // Step 2: Extract intent and entities
    const intent = this.extractIntent(userPrompt);
    console.log(`🎯 Intent: ${intent.type}`);
    
    // Step 3: Select architecture template
    const architecture = this.selectArchitecture(domain, intent);
    console.log(`🏗️ Architecture: ${architecture?.name || 'custom'}`);
    
    // Step 4: Identify required components
    const components = this.identifyComponents(userPrompt, domain, intent);
    console.log(`🧩 Components: ${components.join(', ')}`);
    
    // Step 5: Generate enhanced prompt for AI
    const enhancedPrompt = this.buildEnhancedPrompt({
      userPrompt,
      domain,
      intent,
      architecture,
      components,
      context
    });
    
    // Step 6: Generate routing strategy
    const routing = this.determineRouting(domain, intent);
    
    return {
      domain,
      intent,
      architecture,
      components,
      enhancedPrompt,
      routing,
      metadata: {
        complexity: this.assessComplexity(intent, components),
        estimatedModules: components.length,
        suggestedProvider: routing.primary
      }
    };
  }
  
  /**
   * Detect domain from user prompt
   */
  detectDomain(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [domain, config] of Object.entries(DOMAIN_PATTERNS)) {
      const matchCount = config.keywords.filter(keyword => 
        lowerPrompt.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount >= 2) {
        return domain;
      }
    }
    
    return null; // general purpose
  }
  
  /**
   * Extract user intent from prompt
   */
  extractIntent(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for tracking/management systems
    if (lowerPrompt.match(/track|manage|monitor|log|record/)) {
      return {
        type: 'data-management',
        entities: this.extractEntities(prompt),
        features: ['crud', 'search', 'filter', 'export']
      };
    }
    
    // Check for analytics/dashboard
    if (lowerPrompt.match(/dashboard|analytics|report|kpi|metrics|trend/)) {
      return {
        type: 'analytics',
        visualizations: ['charts', 'kpi-cards', 'tables'],
        features: ['real-time', 'filters', 'export']
      };
    }
    
    // Check for simulation/modeling
    if (lowerPrompt.match(/simulat|model|predict|optimize|twin/)) {
      return {
        type: 'simulation',
        features: ['parameter-input', 'run-simulation', 'results-viz', 'comparison']
      };
    }
    
    // Check for workflow/process
    if (lowerPrompt.match(/workflow|process|protocol|procedure|sop/)) {
      return {
        type: 'workflow',
        features: ['step-editor', 'approval', 'execution', 'audit']
      };
    }
    
    // Default to form/application
    return {
      type: 'form-application',
      features: ['input', 'validation', 'submit']
    };
  }
  
  /**
   * Extract entities from prompt (nouns that represent data objects)
   */
  extractEntities(prompt) {
    const entities = [];
    const commonEntities = [
      'batch', 'sample', 'patient', 'device', 'equipment', 'protocol',
      'fermentor', 'bioreactor', 'test', 'result', 'deviation', 'audit'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    commonEntities.forEach(entity => {
      if (lowerPrompt.includes(entity)) {
        entities.push(entity);
      }
    });
    
    return entities;
  }
  
  /**
   * Select appropriate architecture template
   */
  selectArchitecture(domain, intent) {
    if (!domain) return null;
    
    const templateName = DOMAIN_PATTERNS[domain]?.architectureTemplate;
    if (!templateName) return null;
    
    const template = ARCHITECTURE_TEMPLATES[templateName];
    if (!template) return null;
    
    return {
      name: templateName,
      ...template
    };
  }
  
  /**
   * Identify required components based on domain and intent
   */
  identifyComponents(prompt, domain, intent) {
    const components = new Set();
    
    // Add domain-specific components
    if (domain && DOMAIN_PATTERNS[domain]) {
      DOMAIN_PATTERNS[domain].components.forEach(comp => components.add(comp));
    }
    
    // Add intent-specific components
    const lowerPrompt = prompt.toLowerCase();
    Object.entries(COMPONENT_LIBRARY).forEach(([compName, spec]) => {
      // Check if component keywords appear in prompt
      if (spec.description.toLowerCase().split(' ').some(word => 
        lowerPrompt.includes(word) && word.length > 4
      )) {
        components.add(compName);
      }
    });
    
    return Array.from(components);
  }
  
  /**
   * Build enhanced prompt for AI provider
   */
  buildEnhancedPrompt({ userPrompt, domain, intent, architecture, components, context }) {
    let prompt = `# Application Generation Request\n\n`;
    prompt += `## User Request\n${userPrompt}\n\n`;
    
    if (domain) {
      prompt += `## Domain Context\n`;
      prompt += `Industry: ${domain.toUpperCase()}\n`;
      prompt += `Standards: ${this.getDomainStandards(domain)}\n`;
      prompt += `Compliance Requirements: ${this.getComplianceRequirements(domain)}\n\n`;
    }
    
    if (intent) {
      prompt += `## Intent Analysis\n`;
      prompt += `Type: ${intent.type}\n`;
      prompt += `Features Required: ${intent.features?.join(', ')}\n`;
      if (intent.entities?.length > 0) {
        prompt += `Data Entities: ${intent.entities.join(', ')}\n`;
      }
      prompt += `\n`;
    }
    
    if (architecture) {
      prompt += `## Architecture Pattern\n`;
      prompt += `Template: ${architecture.name}\n`;
      prompt += `Layers:\n`;
      architecture.layers.forEach(layer => {
        prompt += `  ${layer.level}. ${layer.name}: ${layer.description}\n`;
        prompt += `     Components: ${layer.components.join(', ')}\n`;
      });
      prompt += `\n`;
    }
    
    if (components.length > 0) {
      prompt += `## Required Components\n`;
      components.forEach(compName => {
        const spec = COMPONENT_LIBRARY[compName];
        if (spec) {
          prompt += `\n### ${compName}\n`;
          prompt += `Type: ${spec.type}\n`;
          prompt += `Description: ${spec.description}\n`;
          prompt += `UI Elements: ${spec.uiElements.join(', ')}\n`;
          prompt += `Data: ${spec.dataRequirements.join(', ')}\n`;
        }
      });
      prompt += `\n`;
    }
    
    prompt += `## Output Requirements\n`;
    prompt += `Generate a complete application specification in the following format:\n`;
    prompt += `{\n`;
    prompt += `  "status": "ok",\n`;
    prompt += `  "layout": {\n`;
    prompt += `    "nodes": [\n`;
    prompt += `      {\n`;
    prompt += `        "id": "page",\n`;
    prompt += `        "type": "page",\n`;
    prompt += `        "props": { "title": "..." },\n`;
    prompt += `        "children": [\n`;
    prompt += `          {\n`;
    prompt += `            "id": "section-1",\n`;
    prompt += `            "type": "section",\n`;
    prompt += `            "props": { "title": "..." },\n`;
    prompt += `            "children": [...]\n`;
    prompt += `          }\n`;
    prompt += `        ]\n`;
    prompt += `      }\n`;
    prompt += `    ]\n`;
    prompt += `  }\n`;
    prompt += `}\n\n`;
    
    prompt += `### Node Types Available:\n`;
    prompt += `- section: Groups related components\n`;
    prompt += `- input: Text input field\n`;
    prompt += `- select: Dropdown selection\n`;
    prompt += `- table: Data table with columns/rows\n`;
    prompt += `- button: Action button\n`;
    prompt += `- card: Content card with title/description\n`;
    prompt += `- chart: Data visualization (line, bar, pie)\n`;
    prompt += `- kpi: Key performance indicator display\n\n`;
    
    prompt += `### Quality Standards:\n`;
    prompt += `- Generate production-quality code\n`;
    prompt += `- Include all CRUD operations where applicable\n`;
    prompt += `- Implement proper validation\n`;
    prompt += `- Add comprehensive audit trails for regulated industries\n`;
    prompt += `- Use professional UI/UX patterns\n`;
    prompt += `- Include search, filter, sort capabilities for tables\n`;
    prompt += `- Implement real-time updates where relevant\n`;
    prompt += `- Add role-based access control\n`;
    prompt += `- Generate realistic sample data\n\n`;
    
    return prompt;
  }
  
  /**
   * Get domain-specific standards
   */
  getDomainStandards(domain) {
    const standards = {
      pharma: '21 CFR Part 11, EU Annex 11, ICH Guidelines, ALCOA+ principles',
      biotech: 'FDA Process Validation, ICH Q8-Q12, cGMP',
      clinical: 'ICH-GCP, 21 CFR Part 11, HIPAA, GDPR',
      manufacturing: 'ISO 9001, ISA-95, ANSI/ISA-88'
    };
    return standards[domain] || 'General software engineering best practices';
  }
  
  /**
   * Get compliance requirements
   */
  getComplianceRequirements(domain) {
    const requirements = {
      pharma: 'Electronic signatures, audit trails, data integrity (ALCOA+), validation documentation',
      biotech: 'Process validation, batch records, equipment qualification, change control',
      clinical: 'Patient consent tracking, adverse event reporting, protocol compliance, data privacy',
      manufacturing: 'Batch traceability, quality records, equipment maintenance, OEE tracking'
    };
    return requirements[domain] || 'Standard audit logging and data validation';
  }
  
  /**
   * Determine AI provider routing
   */
  determineRouting(domain, intent) {
    // Route to Gemini for complex UI generation
    if (intent.type === 'analytics' || intent.type === 'simulation') {
      return {
        primary: 'gemini',
        fallback: 'openai',
        reason: 'Complex visualization and analytics requirements'
      };
    }
    
    // Route to OpenAI for workflow and logic-heavy applications
    if (intent.type === 'workflow' || domain === 'clinical') {
      return {
        primary: 'openai',
        fallback: 'gemini',
        reason: 'Complex business logic and workflow orchestration'
      };
    }
    
    // Default to configured provider
    return {
      primary: process.env.UI_PROVIDER || 'gemini',
      fallback: process.env.UI_PROVIDER === 'gemini' ? 'openai' : 'gemini',
      reason: 'General purpose application'
    };
  }
  
  /**
   * Assess complexity of request
   */
  assessComplexity(intent, components) {
    let score = 0;
    
    // Intent complexity
    if (intent.type === 'simulation') score += 3;
    if (intent.type === 'workflow') score += 2;
    if (intent.type === 'analytics') score += 2;
    
    // Component count
    score += Math.min(components.length, 5);
    
    // Complexity classification
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
  
  /**
   * Validate AI-generated output
   */
  async validateOutput(output, orchestrationResult) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    // Check structure
    if (!output.layout || !output.layout.nodes) {
      validation.valid = false;
      validation.errors.push('Missing layout.nodes structure');
      return validation;
    }
    
    // Check for required components
    const generatedNodeTypes = new Set();
    this.traverseNodes(output.layout.nodes, (node) => {
      generatedNodeTypes.add(node.type);
    });
    
    // Warn if expected components are missing
    const { components } = orchestrationResult;
    components.forEach(compName => {
      const spec = COMPONENT_LIBRARY[compName];
      if (spec) {
        const hasRequiredElements = spec.uiElements.some(element => {
          const elementType = element.split('-')[0]; // 'batch-table' -> 'batch'
          return Array.from(generatedNodeTypes).some(nodeType => 
            nodeType.includes(elementType) || element.includes(nodeType)
          );
        });
        
        if (!hasRequiredElements) {
          validation.warnings.push(`Expected component "${compName}" may be missing or incomplete`);
        }
      }
    });
    
    return validation;
  }
  
  /**
   * Helper to traverse node tree
   */
  traverseNodes(nodes, callback) {
    if (!Array.isArray(nodes)) return;
    
    nodes.forEach(node => {
      callback(node);
      if (node.children) {
        this.traverseNodes(node.children, callback);
      }
    });
  }
}

const orchestratorInstance = new CopilotOrchestrator();
export default orchestratorInstance;

