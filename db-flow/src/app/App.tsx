import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

import { useGraphStore } from "../store/graphStore";
import PipelineNode from "../pipeline/nodes/PipelineNode";
import Toolbar from "../components/Toolbar";
import TableNode from "../erd/nodes/TableNode";
import RelationEdge from "../erd/edges/RelationEdge";

const nodeTypes = {
  pipeline: PipelineNode,
  table: TableNode,
};

const edgeTypes = {
  relation: RelationEdge,
};

export default function App() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    mode,
    setMode,
  } = useGraphStore();

  return (
    <div style={{ height: "100vh" }}>
      <Toolbar />

      <button onClick={() => setMode(mode === "pipeline" ? "erd" : "pipeline")}>
        Switch mode
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
