// src/store/graphStore.ts
import { create } from "zustand";
import {
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
    type Connection,
} from "reactflow";
import { nanoid } from "nanoid";
import type { AppNode, AppEdge, GraphMode, ERDNodeData, RelationEdgeData } from "../graph/types";

type GraphState = {
    mode: GraphMode;
    nodes: AppNode[];
    edges: AppEdge[];
    selectedNodeId: string | null;

    setMode: (mode: GraphMode) => void;
    addNode: (node: AppNode) => void;
    removeNode: (nodeId: string) => void;
    setGraph: (nodes: AppNode[], edges: AppEdge[]) => void;
    setSelectedNode: (id: string | null) => void;
    updateNodeData: (nodeId: string, data: Partial<ERDNodeData>) => void;
    reorderColumn: (nodeId: string, fromIndex: number, toIndex: number) => void;
    updateEdgeData: (edgeId: string, data: Partial<RelationEdgeData>) => void;

    // React Flow callbacks
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
};

export const useGraphStore = create<GraphState>((set, get) => ({
    mode: "erd",
    nodes: [],
    edges: [],
    selectedNodeId: null,

    /* ---------- Mode ---------- */
    setMode: (mode) => set({ mode }),

    /* ---------- Add a single node ---------- */
    addNode: (node) => set({ nodes: [...get().nodes, node] }),

    /* ---------- Remove a node (and its connected edges) ---------- */
    removeNode: (nodeId) =>
        set({
            nodes: get().nodes.filter((n) => n.id !== nodeId),
            edges: get().edges.filter(
                (e) => e.source !== nodeId && e.target !== nodeId
            ),
            selectedNodeId:
                get().selectedNodeId === nodeId ? null : get().selectedNodeId,
        }),

    /* ---------- Replace entire graph ---------- */
    setGraph: (nodes, edges) => set({ nodes, edges }),

    /* ---------- Selection ---------- */
    setSelectedNode: (id) => set({ selectedNodeId: id }),

    /* ---------- Update node data ---------- */
    updateNodeData: (nodeId, data) =>
        set({
            nodes: get().nodes.map((n) =>
                n.id === nodeId
                    ? { ...n, data: { ...n.data, ...data } }
                    : n
            ),
        }),

    /* ---------- Reorder columns ---------- */
    reorderColumn: (nodeId, fromIndex, toIndex) =>
        set({
            nodes: get().nodes.map((n) => {
                if (n.id !== nodeId) return n;
                const columns = [...(n.data as ERDNodeData).columns];
                const [moved] = columns.splice(fromIndex, 1);
                columns.splice(toIndex, 0, moved);
                return { ...n, data: { ...n.data, columns } };
            }),
        }),

    /* ---------- Update edge data (e.g. relationType) ---------- */
    updateEdgeData: (edgeId, data) =>
        set({
            edges: get().edges.map((e) =>
                e.id === edgeId ? { ...e, data: { ...e.data, ...data } } : e
            ),
        }),

    /* ---------- React Flow callbacks ---------- */
    onNodesChange: (changes: NodeChange[]) =>
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        }),

    onEdgesChange: (changes: EdgeChange[]) =>
        set({
            edges: applyEdgeChanges(changes, get().edges),
        }),

    /* ---------- Create a relation edge when user connects two nodes ---------- */
    onConnect: (connection: Connection) => {
        if (!connection.source || !connection.target) return;

        // Extract column name from handle id "col-{columnName}"
        const fromColumn =
            connection.sourceHandle?.startsWith("col-")
                ? connection.sourceHandle.slice(4)
                : undefined;

        const newEdge: AppEdge = {
            id: nanoid(),
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle ?? undefined,
            targetHandle: connection.targetHandle ?? undefined,
            type: "relation",
            data: {
                relationType: "one-to-many",
                fromColumn,
            } satisfies RelationEdgeData,
        };

        set({ edges: [...get().edges, newEdge] });
    },
}));
