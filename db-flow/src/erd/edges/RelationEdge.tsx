import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";
import type { RelationEdgeData } from "../../graph/types";

type Props = {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    data?: RelationEdgeData;
};

export default function RelationEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
}: Props) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} />

            {data?.relationType && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            background: "#fff",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                            border: "1px solid #ccc",
                            pointerEvents: "none",
                        }}
                    >
                        {data.relationType.replace("-", " → ")}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
