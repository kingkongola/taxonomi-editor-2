import React, { memo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TaxonomyNode } from '@/lib/taxonomy';

// Custom Node Component
const CustomNode = memo(({ data }: { data: { label: string, type: string } }) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-slate-900 border border-slate-700 text-slate-100 min-w-[150px] text-center">
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500" />
      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{data.type}</div>
      <div className="font-bold text-sm">{data.label}</div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-blue-500" />
    </div>
  );
});
CustomNode.displayName = 'CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

interface GraphViewProps {
  centerNode: TaxonomyNode;
}

export function GraphView({ centerNode }: GraphViewProps) {
  // Generate initial nodes and edges based on centerNode relations
  const initialNodes: Node[] = [
    {
      id: centerNode.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: centerNode.prefLabel, type: centerNode.type },
    },
  ];

  const initialEdges: Edge[] = [];

  centerNode.relations.forEach((rel, index) => {
    const yPos = (index - centerNode.relations.length / 2) * 100;
    initialNodes.push({
      id: rel.target,
      type: 'custom',
      position: { x: 300, y: yPos },
      data: { label: rel.targetLabel || rel.target, type: rel.type },
    });

    initialEdges.push({
      id: `e-${centerNode.id}-${rel.target}`,
      source: centerNode.id,
      target: rel.target,
      animated: true,
      style: { stroke: '#64748b' },
    });
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={16} />
        <Controls className="bg-slate-900 border-slate-800 fill-slate-400" />
        <MiniMap className="bg-slate-900 border-slate-800" nodeColor="#3b82f6" />
      </ReactFlow>
    </div>
  );
}
