/**
 * Graph & Visualization Service
 * Builds and analyzes graphs for protocols, molecules, instruments, and sample lineage
 */

export class GraphService {
  constructor() {
    this.graphs = new Map(); // id -> graph
  }

  /**
   * Create a protocol dependency graph (DAG)
   * Each node = a step, edges = dependencies and data flow
   */
  createProtocolDAG(protocolName, steps) {
    const graphId = `dag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const nodes = steps.map((step, idx) => ({
      id: `step-${idx + 1}`,
      label: step.name,
      type: 'step',
      metadata: {
        duration: step.baseDuration,
        successRate: step.successRate,
        cost: step.costPerSample
      }
    }));

    // Create sequential edges (each step depends on previous)
    const edges = [];
    for (let i = 1; i < steps.length; i++) {
      edges.push({
        id: `edge-${i}-${i + 1}`,
        source: `step-${i}`,
        target: `step-${i + 1}`,
        label: 'sequence',
        metadata: {
          dataFlow: 'sample progression'
        }
      });
    }

    const graph = {
      id: graphId,
      type: 'protocol-dag',
      name: `${protocolName} - Dependency Graph`,
      createdAt: new Date().toISOString(),
      nodes,
      edges,
      statistics: this._calculateGraphStats(nodes, edges),
      metadata: {
        protocolName,
        totalSteps: steps.length,
        totalDuration: steps.reduce((sum, s) => sum + s.baseDuration, 0)
      }
    };

    this.graphs.set(graphId, graph);
    return graph;
  }

  /**
   * Create an instrument network graph
   * Nodes = instruments, edges = jobs/samples shared between instruments
   */
  createInstrumentNetwork(instruments) {
    const graphId = `inst-net-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const nodes = instruments.map((inst) => ({
      id: `inst-${inst.id}`,
      label: inst.name,
      type: 'instrument',
      metadata: {
        category: inst.category,
        health: inst.health || 'operational',
        queuedJobs: inst.queuedJobs || 0,
        throughputCapacity: inst.throughputCapacity || 10
      }
    }));

    // Create edges between instruments that share samples
    const edges = [];
    for (let i = 0; i < instruments.length; i++) {
      for (let j = i + 1; j < instruments.length; j++) {
        const sharedSamples = this._countSharedSamples(
          instruments[i],
          instruments[j]
        );
        if (sharedSamples > 0) {
          edges.push({
            id: `edge-${instruments[i].id}-${instruments[j].id}`,
            source: `inst-${instruments[i].id}`,
            target: `inst-${instruments[j].id}`,
            label: `${sharedSamples} samples`,
            metadata: {
              sharedSamples,
              riskScore: this._calculateEdgeRisk(instruments[i], instruments[j])
            }
          });
        }
      }
    }

    const graph = {
      id: graphId,
      type: 'instrument-network',
      name: 'Instrument Usage Network',
      createdAt: new Date().toISOString(),
      nodes,
      edges,
      statistics: this._calculateGraphStats(nodes, edges),
      metadata: {
        totalInstruments: instruments.length,
        totalConnections: edges.length,
        avgQueueLength: (instruments.reduce((sum, i) => sum + (i.queuedJobs || 0), 0) / instruments.length).toFixed(1)
      }
    };

    this.graphs.set(graphId, graph);
    return graph;
  }

  /**
   * Create a sample lineage graph
   * Shows ancestry of samples and data derivation
   */
  createSampleLineageGraph(samples) {
    const graphId = `lineage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const nodes = [];
    const edges = [];

    samples.forEach((sample) => {
      // Sample node
      nodes.push({
        id: `sample-${sample.id}`,
        label: sample.name || `Sample ${sample.id}`,
        type: 'sample',
        metadata: {
          yieldMg: sample.yieldMg,
          qualityScore: sample.qualityScore,
          status: sample.status,
          createdAt: sample.createdAt
        }
      });

      // Parent relationships
      if (sample.parentIds && sample.parentIds.length > 0) {
        sample.parentIds.forEach((parentId) => {
          edges.push({
            id: `lineage-${parentId}-${sample.id}`,
            source: `sample-${parentId}`,
            target: `sample-${sample.id}`,
            label: 'derived from',
            metadata: {
              transferEfficiency: sample.transferEfficiency || 0.95
            }
          });
        });
      }

      // Assay relationships
      if (sample.assayIds && sample.assayIds.length > 0) {
        sample.assayIds.forEach((assayId) => {
          if (!nodes.find((n) => n.id === `assay-${assayId}`)) {
            nodes.push({
              id: `assay-${assayId}`,
              label: `Assay ${assayId}`,
              type: 'assay',
              metadata: { status: 'pending' }
            });
          }

          edges.push({
            id: `assay-${assayId}-${sample.id}`,
            source: `sample-${sample.id}`,
            target: `assay-${assayId}`,
            label: 'input to',
            metadata: {}
          });
        });
      }
    });

    const graph = {
      id: graphId,
      type: 'sample-lineage',
      name: 'Sample Lineage Graph',
      createdAt: new Date().toISOString(),
      nodes,
      edges,
      statistics: this._calculateGraphStats(nodes, edges),
      metadata: {
        totalSamples: samples.length,
        totalAssays: nodes.filter((n) => n.type === 'assay').length
      }
    };

    this.graphs.set(graphId, graph);
    return graph;
  }

  /**
   * Calculate centrality measures for a graph (degree, betweenness approximation)
   */
  calculateCentrality(graphId) {
    const graph = this.graphs.get(graphId);
    if (!graph) return null;

    const centrality = {};

    // Degree centrality
    const nodeDegrees = {};
    graph.nodes.forEach((node) => {
      const inDegree = graph.edges.filter((e) => e.target === node.id).length;
      const outDegree = graph.edges.filter((e) => e.source === node.id).length;
      nodeDegrees[node.id] = {
        inDegree,
        outDegree,
        totalDegree: inDegree + outDegree,
        degreeCentrality: (inDegree + outDegree) / (graph.nodes.length - 1)
      };
    });

    // Betweenness approximation (simplified)
    const betweenness = {};
    graph.nodes.forEach((node) => {
      const pathsThrough = graph.edges.filter(
        (e) => e.source === node.id || e.target === node.id
      ).length;
      betweenness[node.id] =
        pathsThrough / (graph.edges.length || 1);
    });

    return {
      graphId,
      degreeCentrality: nodeDegrees,
      betweennessCentrality: betweenness,
      criticalNodes: Object.entries(nodeDegrees)
        .filter(([, v]) => v.totalDegree > 2)
        .sort((a, b) => b[1].totalDegree - a[1].totalDegree)
        .slice(0, 5)
        .map(([nodeId, stats]) => ({
          nodeId,
          ...stats
        }))
    };
  }

  /**
   * Find paths between two nodes (simple BFS)
   */
  findPaths(graphId, sourceId, targetId, maxDepth = 5) {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    const paths = [];
    const queue = [{ node: sourceId, path: [sourceId], depth: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
      const { node, path, depth } = queue.shift();

      if (depth > maxDepth) continue;
      if (visited.has(node)) continue;

      visited.add(node);

      if (node === targetId) {
        paths.push(path);
        continue;
      }

      // Find adjacent nodes
      const adjacent = [
        ...graph.edges
          .filter((e) => e.source === node)
          .map((e) => e.target),
        ...graph.edges
          .filter((e) => e.target === node)
          .map((e) => e.source)
      ];

      adjacent.forEach((nextNode) => {
        if (!visited.has(nextNode)) {
          queue.push({
            node: nextNode,
            path: [...path, nextNode],
            depth: depth + 1
          });
        }
      });
    }

    return paths.slice(0, 10); // Return top 10 paths
  }

  /**
   * Get graph by ID
   */
  getGraph(graphId) {
    return this.graphs.get(graphId) || null;
  }

  /**
   * List all graphs
   */
  listGraphs() {
    return Array.from(this.graphs.values());
  }

  /**
   * Calculate basic graph statistics
   */
  _calculateGraphStats(nodes, edges) {
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      density: edges.length / (nodes.length * (nodes.length - 1) / 2) || 0,
      avgDegree: (edges.length * 2) / nodes.length || 0
    };
  }

  /**
   * Count shared samples between instruments (mock)
   */
  _countSharedSamples(inst1, inst2) {
    return Math.floor(Math.random() * 10);
  }

  /**
   * Calculate edge risk score
   */
  _calculateEdgeRisk(inst1, inst2) {
    const inst1Risk = (inst1.queuedJobs || 0) / (inst1.throughputCapacity || 1);
    const inst2Risk = (inst2.queuedJobs || 0) / (inst2.throughputCapacity || 1);
    return Math.max(inst1Risk, inst2Risk);
  }
}

export default new GraphService();
