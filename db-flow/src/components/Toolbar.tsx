import { nanoid } from "nanoid";
import { useGraphStore } from "../store/graphStore";
import type { AppNode } from "../graph/types";

export default function Toolbar() {
    const { mode, addNode, nodes } = useGraphStore();

    const yOffset = nodes.length * 80;

    const addPipelineNode = (stepType: "source" | "transform" | "sink") => {
        const node: AppNode = {
            id: nanoid(),
            type: "pipeline",
            position: { x: 100, y: yOffset },
            data: {
                label: stepType.toUpperCase(),
                stepType,
                config: {},
            },
        };

        addNode(node);
    };

    const addTableNode = () => {
        const node: AppNode = {
            id: nanoid(),
            type: "table",
            position: { x: 100, y: yOffset },
            data: {
                label: "Table",
                tableName: "new_table",
                columns: [
                    { name: "id", type: "uuid", isPK: true },
                ],
            },
        };

        addNode(node);
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "#fff",
                border: "1px solid #ddd",
                padding: 8,
                borderRadius: 6,
                zIndex: 10,
                width: 160,
            }}
        >
            <strong>{mode.toUpperCase()}</strong>

            {mode === "pipeline" && (
                <>
                    <button onClick={() => addPipelineNode("source")}>
                        + Source
                    </button>
                    <button onClick={() => addPipelineNode("transform")}>
                        + Transform
                    </button>
                    <button onClick={() => addPipelineNode("sink")}>
                        + Sink
                    </button>
                </>
            )}

            {mode === "erd" && (
                <button onClick={addTableNode}>+ Table</button>
            )}
        </div>
    );
}
