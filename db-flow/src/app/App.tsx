import ReactFlow, {
    Background,
    Controls,
    ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { useGraphStore } from "../store/graphStore";
import TableNode from "../erd/nodes/TableNode";
import RelationEdge from "../erd/edges/RelationEdge";
import Toolbar from "../components/Toolbar";
import TableEditor from "../components/TableEditor";

// Keep these as stable module-level references so ReactFlow
// never re-mounts nodes/edges on every render.
const nodeTypes = {
    table: TableNode,
};

const edgeTypes = {
    relation: RelationEdge,
};

/**
 * Inner layout — must live *inside* a single ReactFlowProvider so that
 * both Toolbar (useReactFlow) and the canvas share the same RF context.
 */
function AppLayout() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setSelectedNode,
        selectedNodeId,
    } = useGraphStore();

    return (
        <div className="app-root">
            {/* Fixed top bar */}
            <header className="app-topbar">
                <span className="app-topbar__logo">⬡ DB Flow</span>
                <Toolbar />
            </header>

            {/* Canvas + slide-in editor */}
            <main className="app-canvas">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={(_e, node) => setSelectedNode(node.id)}
                    onNodeDoubleClick={(_e, node) => setSelectedNode(node.id)}
                    onPaneClick={() => setSelectedNode(null)}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                >
                    <Background color="#cbd5e1" gap={20} />
                    <Controls />
                </ReactFlow>

                {/* TableEditor slides in over the right side of the canvas.
                    Re-keyed on selectedNodeId so it remounts with fresh local
                    state when the user selects a different table.            */}
                <TableEditor key={selectedNodeId ?? "__none__"} />
            </main>
        </div>
    );
}

export default function App() {
    return (
        <ReactFlowProvider>
            <AppLayout />
        </ReactFlowProvider>
    );
}
