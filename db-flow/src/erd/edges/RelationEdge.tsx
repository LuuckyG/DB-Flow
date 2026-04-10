import { memo } from "react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    type EdgeProps,
} from "reactflow";
import type { RelationEdgeData } from "../../graph/types";

const LABEL_MAP: Record<string, string> = {
    "one-to-one": "1 : 1",
    "one-to-many": "1 : N",
    "many-to-many": "N : M",
};

function RelationEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps<RelationEdgeData>) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
    });

    const relType = data?.relationType ?? "one-to-many";

    const strokeColour =
        relType === "one-to-one"
            ? "#3b82f6"
            : relType === "many-to-many"
              ? "#a855f7"
              : "#22c55e";

    const badgeClass = `edge-label__badge edge-label__badge--${relType}`;

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{ stroke: strokeColour, strokeWidth: 1.5 }}
            />

            {data?.relationType && (
                <EdgeLabelRenderer>
                    <div
                        className="edge-label"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    >
                        <span className={badgeClass}>
                            {LABEL_MAP[relType] ?? relType}
                        </span>

                        {(data.fromColumn || data.toColumn) && (
                            <span className="edge-label__cols">
                                {[data.fromColumn, data.toColumn]
                                    .filter(Boolean)
                                    .join(" → ")}
                            </span>
                        )}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default memo(RelationEdge);
