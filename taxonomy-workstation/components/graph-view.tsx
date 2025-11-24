'use client';

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
    <div className="relative group">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-[var(--deco-gold)] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-sm"></div>

      <div className="relative px-6 py-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-[var(--deco-bg)] border border-[var(--deco-gold)] min-w-[160px] text-center transition-transform group-hover:scale-105 duration-300">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--deco-gold)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--deco-gold)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--deco-gold)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--deco-gold)]"></div>

        <Handle type="target" position={Position.Left} className="w-2 h-2 bg-[var(--deco-gold)] border border-black" />

        <div className="text-[10px] text-[var(--deco-gold-dim)] mb-1 uppercase tracking-[0.2em] font-cinzel border-b border-[var(--deco-gold)]/20 pb-1 inline-block">
          {data.type}
        </div>
        <div className="font-bold text-sm text-[var(--deco-text)] font-josefin tracking-wide">{data.label}</div>

        <Handle type="source" position={Position.Right} className="w-2 h-2 bg-[var(--deco-gold)] border border-black" />
      </div>
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
      style: { stroke: '#D4AF37', strokeWidth: 1 },
    });
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full bg-[var(--deco-bg)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, var(--deco-gold) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#D4AF37" gap={40} size={1} className="opacity-5" />
        <Controls className="bg-[var(--deco-bg)] border-[var(--deco-gold)] fill-[var(--deco-gold)] [&>button]:border-b-[var(--deco-gold)] hover:[&>button]:bg-[var(--deco-gold)]/20" />
        <MiniMap
          className="bg-[var(--deco-bg)] border border-[var(--deco-gold)]"
          nodeColor="#D4AF37"
          maskColor="rgba(5, 5, 5, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
