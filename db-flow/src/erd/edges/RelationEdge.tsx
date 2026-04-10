import { memo } from "react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useReactFlow,
    type EdgeProps,
} from "reactflow";
import { useGraphStore } from "../../store/graphStore";
import type { RelationEdgeData, RelationType } from "../../graph/types";

const LABEL_MAP: Record<RelationType, string> = {
    "one-to-one":   "1 : 1",
    "one-to-many":  "1 : N",
    "many-to-many": "N : M",
};

const RELATION_CYCLE: RelationType[] = [
    "one-to-many",
    "one-to-one",
    "many-to-many",
];

const STROKE: Record<RelationType, string> = {
    "one-to-one":   "#3b82f6",
    "one-to-many":  "#22c55e",
    "many-to-many": "#a855f7",
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
    selected,
}: EdgeProps<RelationEdgeData>) {
    const { updateEdgeData } = useGraphStore();
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
    });

    const relType: RelationType = data?.relationType ?? "one-to-many";
    const badgeClass = `edge-label__badge edge-label__badge--${relType}`;

    /** Click the badge to cycle through 1:N → 1:1 → N:M → 1:N */
    const cycleType = (e: React.MouseEvent) => {
        e.stopPropagation();
        const next =
            RELATION_CYCLE[(RELATION_CYCLE.indexOf(relType) + 1) % RELATION_CYCLE.length];
        updateEdgeData(id, { relationType: next });
    };

    /** Delete this edge */
    const deleteEdge = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    stroke: STROKE[relType],
                    strokeWidth: selected ? 2.5 : 1.5,
                    strokeDasharray: selected ? "5 3" : undefined,
                }}
            />

            <EdgeLabelRenderer>
                <div
                    className="edge-label"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                >
                    {/* Relation type badge — click to cycle */}
                    <span
                        className={badgeClass}
                        onClick={cycleType}
                        title="Klik om type te wijzigen"
                        style={{ pointerEvents: "all", cursor: "pointer" }}
                    >
                        {LABEL_MAP[relType]}
                    </span>

                    {/* Column name hint */}
                    {(data?.fromColumn || data?.toColumn) && (
                        <span className="edge-label__cols">
                            {[data.fromColumn, data.toColumn]
                                .filter(Boolean)
                                .join(" → ")}
                        </span>
                    )}

                    {/* Delete button — only visible when selected */}
                    {selected && (
                        <button
                            className="edge-label__delete"
                            onClick={deleteEdge}
                            title="Relatie verwijderen"
                            style={{ pointerEvents: "all" }}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export default memo(RelationEdge);
