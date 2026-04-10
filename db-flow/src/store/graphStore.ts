// src/store/graphStore.ts
import { create } from "zustand";
import {
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
} from "reactflow";
import type { AppNode, AppEdge, GraphMode, ERDNodeData } from "../graph/types";

type GraphState = {
    mode: GraphMode;
    nodes: AppNode[];
    edges: AppEdge[];
    selectedNodeId: string | null;

    setMode: (mode: GraphMode) => void;
    addNode: (node: AppNode) => void;
    setGraph: (nodes: AppNode[], edges: AppEdge[]) => void;
    setSelectedNode: (id: string | null) => void;
    updateNodeData: (nodeId: string, data: Partial<ERDNodeData>) => void;
    reorderColumn: (nodeId: string, fromIndex: number, toIndex: number) => void;

    // React Flow callbacks
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
};

export const useGraphStore = create<GraphState>((set, get) => ({
    mode: "pipeline",
    nodes: [],
    edges: [],
    selectedNodeId: null,

    /* ---------- Mode ---------- */
    setMode: (mode) => set({ mode }),

    /* ---------- Add a single node ---------- */
    addNode: (node) => set({ nodes: [...get().nodes, node] }),

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

    /* ---------- React Flow callbacks ---------- */
    onNodesChange: (changes: NodeChange[]) =>
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        }),

    onEdgesChange: (changes: EdgeChange[]) =>
        set({
            edges: applyEdgeChanges(changes, get().edges),
        }),
}));