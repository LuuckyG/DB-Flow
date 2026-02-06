import type { Node, Edge } from "reactflow";

/* ---------- Graph mode ---------- */
export type GraphMode = "pipeline" | "erd";

/* ---------- Base ---------- */
export type BaseNodeData = {
    label: string;
    description?: string;
};

/* ---------- Pipeline ---------- */
export type PipelineStepType = "source" | "transform" | "sink";

export type PipelineNodeData = BaseNodeData & {
    stepType: PipelineStepType;
    config: Record<string, unknown>;
};

/* ---------- ERD ---------- */
export type Column = {
    name: string;
    type: string;
    isPK?: boolean;
    isFK?: boolean;
};

export type ERDNodeData = BaseNodeData & {
    tableName: string;
    columns: Column[];
};

/* ---------- Union ---------- */
export type AppNodeData = PipelineNodeData | ERDNodeData;

export type AppNode = Node<AppNodeData>;
export type AppEdge = Edge;

/* ---------- Edge metadata ---------- */
export type RelationType = "one-to-one" | "one-to-many" | "many-to-many";

export type RelationEdgeData = {
    relationType: RelationType;
    fromColumn?: string;
    toColumn?: string;
};
