/**
 * Intelligent Router
 * Analyzes prompt complexity and routes to optimal generation workflow
 */

/**
 * Detection patterns for complexity analysis
 */
const PATTERNS = {
  customComponents: [
    'custom', 'special', 'unique', 'proprietary', 'drag and drop', 'drag-and-drop',
    'calendar', 'scheduler', 'gantt', 'kanban', 'timeline', 'rich text editor',
    'wysiwyg', 'file upload', 'image gallery', 'video player', 'audio player'
  ],
  
  complexLogic: [
    'calculate', 'algorithm', 'formula', 'if...then', 'if then', 'when...do',
    'when do', 'rule', 'condition', 'multi-step', 'wizard', 'validation',
    'state machine', 'workflow engine', 'decision tree', 'complex validation'
  ],
  
  integrations: [
    'stripe', 'paypal', 'twilio', 'sendgrid', 'slack', 'teams', 'zoom',
    'salesforce', 'integrate with', 'connect to', 'sync with', 'api call',
    'webhook', 'third-party', 'external service', 'oauth', 'authentication'
  ],
  
  technicalTerms: [
    'microservice', 'websocket', 'real-time', 'database', 'sql', 'nosql',
    'mongodb', 'postgres', 'redis', 'cache', 'queue', 'async', 'concurrent',
    'distributed', 'scalable', 'load balancer', 'cdn', 'serverless'
  ],
  
  multipleSections: [
    'section', 'page', 'tab', 'panel', 'module', 'component', 'widget',
    'dashboard', 'view', 'screen'
  ]
};

/**
 * Analyze prompt complexity
 * @param {string} prompt - User prompt
 * @returns {object} Complexity analysis
 */
export function analyzeComplexity(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return {
      score: 0,
      breakdown: {},
      detected: {}
    };
  }

  const lowerPrompt = prompt.toLowerCase();
  const breakdown = {
    length: 0,
    technicalTerms: 0,
    multipleSections: 0,
    complexWorkflows: 0,
    customComponents: 0,
    integrations: 0
  };

  const detected = {
    customComponents: [],
    complexLogic: [],
    integrations: [],
    technicalTerms: [],
    sections: []
  };

  // Length complexity (+2 if >500 chars, +2 if >1000)
  if (prompt.length > 500) {
    breakdown.length += 2;
  }
  if (prompt.length > 1000) {
    breakdown.length += 2;
  }

  // Technical terms (+0.5 each, max 3)
  PATTERNS.technicalTerms.forEach(term => {
    if (lowerPrompt.includes(term)) {
      breakdown.technicalTerms += 0.5;
      detected.technicalTerms.push(term);
    }
  });
  breakdown.technicalTerms = Math.min(breakdown.technicalTerms, 3);

  // Multiple sections (+0.3 per mention, max 2)
  PATTERNS.multipleSections.forEach(term => {
    const regex = new RegExp(term, 'gi');
    const matches = lowerPrompt.match(regex);
    if (matches) {
      breakdown.multipleSections += matches.length * 0.3;
      detected.sections.push({ term, count: matches.length });
    }
  });
  breakdown.multipleSections = Math.min(breakdown.multipleSections, 2);

  // Complex workflows (+1 each, max 2)
  PATTERNS.complexLogic.forEach(term => {
    if (lowerPrompt.includes(term)) {
      breakdown.complexWorkflows += 1;
      detected.complexLogic.push(term);
    }
  });
  breakdown.complexWorkflows = Math.min(breakdown.complexWorkflows, 2);

  // Custom components (+1 if detected)
  const hasCustomComponents = PATTERNS.customComponents.some(term => {
    if (lowerPrompt.includes(term)) {
      detected.customComponents.push(term);
      return true;
    }
    return false;
  });
  if (hasCustomComponents) {
    breakdown.customComponents = 1;
  }

  // Third-party integrations (+1 if detected)
  const hasIntegrations = PATTERNS.integrations.some(term => {
    if (lowerPrompt.includes(term)) {
      detected.integrations.push(term);
      return true;
    }
    return false;
  });
  if (hasIntegrations) {
    breakdown.integrations = 1;
  }

  // Calculate total complexity score (0-10 scale)
  const score = Math.min(10,
    breakdown.length +
    breakdown.technicalTerms +
    breakdown.multipleSections +
    breakdown.complexWorkflows +
    breakdown.customComponents +
    breakdown.integrations
  );

  return {
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    breakdown,
    detected
  };
}

/**
 * Calculate confidence for generation
 * @param {object} complexity - Complexity analysis result
 * @returns {number} Confidence score (0-100)
 */
export function calculateConfidence(complexity) {
  let confidence = 100;

  // Reduce confidence based on complexity
  if (complexity.score > 7) {
    confidence -= 30;
  }

  if (complexity.detected.customComponents.length > 0) {
    confidence -= 25;
  }

  if (complexity.detected.complexLogic.length > 0) {
    confidence -= 20;
  }

  if (complexity.detected.integrations.length > 0) {
    confidence -= 25;
  }

  return Math.max(0, confidence);
}

/**
 * Determine routing decision
 * @param {string} prompt - User prompt
 * @param {object} options - Routing options
 * @returns {object} Routing decision
 */
export function determineRoute(prompt, options = {}) {
  const { forceRoute = null } = options;

  if (forceRoute) {
    return {
      route: forceRoute,
      confidence: 100,
      requiresConfirmation: false,
      complexity: { score: 0, breakdown: {}, detected: {} }
    };
  }

  // Analyze complexity
  const complexity = analyzeComplexity(prompt);
  const confidence = calculateConfidence(complexity);

  let route;
  let requiresConfirmation = false;

  if (confidence >= 70) {
    route = 'DIRECT';
    requiresConfirmation = false;
  } else if (confidence >= 50) {
    route = 'ASK_USER';
    requiresConfirmation = true;
  } else {
    route = 'TRIPLE_POWER_COMBO';
    requiresConfirmation = false;
  }

  return {
    route,
    confidence,
    requiresConfirmation,
    complexity,
    reasoning: buildReasoning(complexity, confidence, route)
  };
}

/**
 * Build human-readable reasoning
 * @param {object} complexity - Complexity analysis
 * @param {number} confidence - Confidence score
 * @param {string} route - Selected route
 * @returns {string} Reasoning text
 */
function buildReasoning(complexity, confidence, route) {
  const reasons = [];

  if (complexity.score > 7) {
    reasons.push('High complexity detected');
  }

  if (complexity.detected.customComponents.length > 0) {
    reasons.push(`Custom components: ${complexity.detected.customComponents.slice(0, 2).join(', ')}`);
  }

  if (complexity.detected.complexLogic.length > 0) {
    reasons.push(`Complex logic: ${complexity.detected.complexLogic.slice(0, 2).join(', ')}`);
  }

  if (complexity.detected.integrations.length > 0) {
    reasons.push(`Integrations: ${complexity.detected.integrations.slice(0, 2).join(', ')}`);
  }

  if (complexity.breakdown.length > 0) {
    reasons.push('Long detailed prompt');
  }

  if (reasons.length === 0) {
    return 'Standard generation suitable';
  }

  let reasoning = reasons.join('; ');
  reasoning += `. Complexity: ${complexity.score}/10. Confidence: ${confidence}%.`;
  
  if (route === 'TRIPLE_POWER_COMBO') {
    reasoning += ' Routing to advanced AI pipeline.';
  } else if (route === 'ASK_USER') {
    reasoning += ' User confirmation recommended.';
  }

  return reasoning;
}

/**
 * Get route recommendation details
 * @param {string} route - Route name
 * @param {number} confidence - Confidence score
 * @returns {object} Route details
 */
export function getRouteDetails(route, confidence) {
  const details = {
    'DIRECT': {
      name: 'Generate with NewGen',
      description: 'Faster, simpler generation using NewGen AI',
      speed: 'Fast (2-5 seconds)',
      quality: 'Good',
      confidence: confidence,
      icon: '📝'
    },
    'TRIPLE_POWER_COMBO': {
      name: 'Triple Power Combo',
      description: 'Advanced AI pipeline: Gemini + NewGen + Domain Enhancement',
      speed: 'Slower (10-15 seconds)',
      quality: 'Excellent',
      confidence: 95,
      icon: '🔄'
    },
    'ASK_USER': {
      name: 'User Choice Required',
      description: 'Medium complexity - choose your preferred method',
      speed: 'Variable',
      quality: 'Variable',
      confidence: confidence,
      icon: '🤔'
    }
  };

  return details[route] || details['DIRECT'];
}

/**
 * Detect if technical input (code/markup) vs natural language
 * @param {string} input - User input
 * @returns {boolean} True if technical format detected
 */
export function isTechnicalInput(input) {
  if (!input || typeof input !== 'string') return false;

  const technicalIndicators = [
    input.trim().startsWith('{') || input.trim().startsWith('['),  // JSON
    /<\w+[^>]*>/.test(input),  // HTML/JSX tags
    /import\s+.*from/.test(input),  // ES6 imports
    /function\s+\w+\(/.test(input),  // Function declarations
    /const\s+\w+\s*=/.test(input),  // Variable declarations
    /export\s+(default\s+)?/.test(input),  // Exports
    /return\s*\(/.test(input)  // Return statements
  ];

  return technicalIndicators.filter(Boolean).length >= 2;
}

export default {
  analyzeComplexity,
  calculateConfidence,
  determineRoute,
  getRouteDetails,
  isTechnicalInput
};
