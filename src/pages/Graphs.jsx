import { useState, useEffect } from 'react';
import { useGraphs } from '../hooks/useGraphs';
import GraphVisualization from '../components/GraphVisualization';
import { Plus, List } from 'lucide-react';

export default function Graphs() {
  const {
    graphs,
    loading,
    error,
    createProtocolDAG,
    createInstrumentNetwork,
    createSampleLineageGraph,
    fetchGraphs
  } = useGraphs();

  const [selectedGraph, setSelectedGraph] = useState(null);
  const [graphType, setGraphType] = useState('protocol-dag');

  useEffect(() => {
    fetchGraphs();
  }, []);

  const handleCreateProtocolDAG = async () => {
    try {
      // Example protocol steps
      const steps = [
        {
          name: 'DNA Extraction',
          baseDuration: 30,
          successRate: 0.98,
          costPerSample: 5.0
        },
        {
          name: 'PCR Amplification',
          baseDuration: 120,
          successRate: 0.95,
          costPerSample: 8.0
        },
        {
          name: 'Purification',
          baseDuration: 60,
          successRate: 0.96,
          costPerSample: 6.0
        },
        {
          name: 'Quality Check',
          baseDuration: 30,
          successRate: 0.99,
          costPerSample: 5.0
        }
      ];

      const graph = await createProtocolDAG('CRISPR Plasmid Prep', steps);
      setSelectedGraph(graph);
    } catch (err) {
      console.error('Failed to create protocol DAG:', err);
    }
  };

  const handleCreateInstrumentNetwork = async () => {
    try {
      const instruments = [
        {
          id: 'inst-1',
          name: 'Thermocycler A',
          category: 'PCR',
          health: 'operational',
          queuedJobs: 3,
          throughputCapacity: 10
        },
        {
          id: 'inst-2',
          name: 'Centrifuge B',
          category: 'Separation',
          health: 'operational',
          queuedJobs: 5,
          throughputCapacity: 8
        },
        {
          id: 'inst-3',
          name: 'Sequencer C',
          category: 'Analysis',
          health: 'operational',
          queuedJobs: 2,
          throughputCapacity: 5
        },
        {
          id: 'inst-4',
          name: 'HPLC D',
          category: 'Purification',
          health: 'operational',
          queuedJobs: 4,
          throughputCapacity: 6
        }
      ];

      const graph = await createInstrumentNetwork(instruments);
      setSelectedGraph(graph);
    } catch (err) {
      console.error('Failed to create instrument network:', err);
    }
  };

  const handleCreateSampleLineage = async () => {
    try {
      const samples = [
        {
          id: 'S001',
          name: 'Parent Sample',
          yieldMg: 100,
          qualityScore: 0.95,
          status: 'completed',
          createdAt: new Date().toISOString(),
          assayIds: ['A001']
        },
        {
          id: 'S002',
          name: 'Derived Sample 1',
          yieldMg: 85,
          qualityScore: 0.90,
          status: 'completed',
          createdAt: new Date().toISOString(),
          parentIds: ['S001'],
          assayIds: ['A002']
        },
        {
          id: 'S003',
          name: 'Derived Sample 2',
          yieldMg: 80,
          qualityScore: 0.88,
          status: 'active',
          createdAt: new Date().toISOString(),
          parentIds: ['S001'],
          assayIds: ['A003']
        },
        {
          id: 'S004',
          name: 'Final Sample',
          yieldMg: 65,
          qualityScore: 0.85,
          status: 'active',
          createdAt: new Date().toISOString(),
          parentIds: ['S002', 'S003'],
          assayIds: []
        }
      ];

      const graph = await createSampleLineageGraph(samples);
      setSelectedGraph(graph);
    } catch (err) {
      console.error('Failed to create sample lineage:', err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Graph Visualization</h1>
        <p className="text-slate-600 mt-2">
          Interactive graphs for protocols, instruments, and sample lineage
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm font-medium">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Create Graph
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleCreateProtocolDAG}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition"
              >
                <Plus size={16} />
                Protocol DAG
              </button>

              <button
                onClick={handleCreateInstrumentNetwork}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition"
              >
                <Plus size={16} />
                Instrument Network
              </button>

              <button
                onClick={handleCreateSampleLineage}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition"
              >
                <Plus size={16} />
                Sample Lineage
              </button>
            </div>
          </div>

          {/* Graph List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Graphs ({graphs.length})
            </h2>

            {graphs.length === 0 ? (
              <p className="text-slate-600 text-sm">
                Create a graph to get started.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {graphs.map((graph) => (
                  <button
                    key={graph.id}
                    onClick={() => setSelectedGraph(graph)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedGraph?.id === graph.id
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900 text-sm">
                      {graph.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {graph.statistics.nodeCount} nodes •{' '}
                      {graph.statistics.edgeCount} edges
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Visualization */}
        <div className="col-span-3">
          {selectedGraph ? (
            <div className="space-y-6">
              <GraphVisualization graph={selectedGraph} width={900} height={600} />

              {/* Statistics Panel */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nodes
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedGraph.statistics.nodeCount}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Edges
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedGraph.statistics.edgeCount}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Density
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {selectedGraph.statistics.density.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedGraph.metadata).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        {key}
                      </p>
                      <p className="text-sm text-slate-900 mt-1">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow border-2 border-dashed border-slate-300">
              <div className="text-center">
                <List size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">
                  Select or create a graph to visualize
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
