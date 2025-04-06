import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  categoryFlowcharts,
} from "./category.js";

export default function Flow({ selectedCategory = "category1" }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowKey, setFlowKey] = useState(0);

  // Initialize with selected category
  useEffect(() => {
    if (categoryFlowcharts[selectedCategory]) {
      setNodes(categoryFlowcharts[selectedCategory].nodes);
      setEdges(categoryFlowcharts[selectedCategory].edges);
      setFlowKey(prev => prev + 1); // Force re-render with new data
    }
  }, [selectedCategory]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      key={flowKey}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      className="bg-amber-50"
      proOptions={{ hideAttribution: true }}
    >
      <Controls
        position="bottom-right"
        showInteractive={false}
        className="bg-white shadow-md border border-amber-100"
      />
      <MiniMap
        nodeStrokeWidth={3}
        zoomable
        pannable
        position="bottom-left"
        className="border border-amber-200 shadow-sm"
        style={{ background: "white" }}
        nodeBorderRadius={3}
        nodeColor={(node) => {
          return node.className?.includes('amber-200') ? '#fcd34d' : '#fef3c7';
        }}
      />
      <Background variant="dots" gap={16} size={1} color="#fbbf24" />
    </ReactFlow>
  );
}