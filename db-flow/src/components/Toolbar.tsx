import { nanoid } from "nanoid";
import { useReactFlow } from "reactflow";
import { useGraphStore } from "../store/graphStore";
import { layoutGraph } from "../graph/layout";
import type { AppNode } from "../graph/types";

export default function Toolbar() {
    const { addNode, nodes, edges, setGraph } = useGraphStore();
    const { fitView } = useReactFlow();

    /** Add a new empty table at a sensible position */
    const handleAddTable = () => {
        const offset = nodes.length * 40;
        const node: AppNode = {
            id: nanoid(),
            type: "table",
            position: { x: 120 + offset, y: 80 + offset },
            data: {
                label: "new_table",
                tableName: "new_table",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                ],
            },
        };
        addNode(node);
    };

    /** Run dagre auto-layout and fit the view */
    const handleAutoLayout = () => {
        const laid = layoutGraph(nodes, edges, "erd");
        setGraph(laid, edges);
        // Give React Flow one tick to reposition nodes before fitting
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 30);
    };

    return (
        <>
            <button className="tb-btn tb-btn--primary" onClick={handleAddTable}>
                + Add Table
            </button>

            <div className="tb-divider" />

            <button className="tb-btn" onClick={handleAutoLayout}>
                ⊞ Auto-layout
            </button>
        </>
    );
}
