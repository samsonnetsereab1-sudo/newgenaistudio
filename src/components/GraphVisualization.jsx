import React, { useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';

/**
 * Basic graph visualization component
 * Renders nodes and edges with force-directed layout approximation
 */
export default function GraphVisualization({ graph, width = 800, height = 600 }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!graph || !svgRef.current) return;

    renderGraph(graph);
  }, [graph]);

  const renderGraph = (graph) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = ''; // Clear previous

    // Create defs for markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'marker'
    );
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');

    const polygon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'polygon'
    );
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#6B7280');

    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Simple force-directed layout
    const positions = calculateLayout(graph);

    // Draw edges first (so they appear behind nodes)
    graph.edges.forEach((edge) => {
      const sourcePos = positions[edge.source];
      const targetPos = positions[edge.target];

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', sourcePos.x);
      line.setAttribute('y1', sourcePos.y);
      line.setAttribute('x2', targetPos.x);
      line.setAttribute('y2', targetPos.y);
      line.setAttribute('stroke', '#D1D5DB');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      svg.appendChild(line);

      // Edge label
      if (edge.label) {
        const labelX = (sourcePos.x + targetPos.x) / 2;
        const labelY = (sourcePos.y + targetPos.y) / 2;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY - 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', '#6B7280');
        text.setAttribute('background', 'white');
        text.textContent = edge.label;
        svg.appendChild(text);
      }
    });

    // Draw nodes
    graph.nodes.forEach((node) => {
      const pos = positions[node.id];

      // Node circle
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', '25');
      circle.setAttribute('fill', getNodeColor(node.type));
      circle.setAttribute('stroke', '#374151');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';

      // Tooltip on hover
      circle.addEventListener('mouseenter', () => {
        showNodeTooltip(node, pos);
      });

      svg.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', 'white');
      text.setAttribute('pointer-events', 'none');

      // Truncate long labels
      const label = node.label.length > 15
        ? node.label.substring(0, 12) + '...'
        : node.label;

      text.textContent = label;
      svg.appendChild(text);
    });
  };

  const calculateLayout = (graph) => {
    // Simple grid layout as a fallback
    const positions = {};
    const cols = Math.ceil(Math.sqrt(graph.nodes.length));
    const cellWidth = width / cols;
    const cellHeight = height / Math.ceil(graph.nodes.length / cols);

    graph.nodes.forEach((node, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      positions[node.id] = {
        x: col * cellWidth + cellWidth / 2,
        y: row * cellHeight + cellHeight / 2
      };
    });

    return positions;
  };

  const getNodeColor = (type) => {
    const colors = {
      'step': '#3B82F6',
      'instrument': '#10B981',
      'sample': '#F59E0B',
      'assay': '#8B5CF6',
      'default': '#6366F1'
    };
    return colors[type] || colors['default'];
  };

  const showNodeTooltip = (node, pos) => {
    console.log(`Node: ${node.label}`, node.metadata);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.2, 0.5));
  };

  const handleDownloadSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${graph?.id || 'export'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <p className="text-slate-600">No graph to display</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-900">{graph.name}</h3>
          <p className="text-xs text-slate-600 mt-1">
            {graph.statistics.nodeCount} nodes • {graph.statistics.edgeCount} edges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Zoom in"
          >
            <ZoomIn size={18} className="text-slate-600" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Zoom out"
          >
            <ZoomOut size={18} className="text-slate-600" />
          </button>
          <button
            onClick={handleDownloadSVG}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Download SVG"
          >
            <Download size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            transition: 'transform 0.2s'
          }}
          className="bg-white"
        />
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-slate-700">Steps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-slate-700">Instruments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-slate-700">Samples</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            <span className="text-slate-700">Assays</span>
          </div>
        </div>
      </div>
    </div>
  );
}
