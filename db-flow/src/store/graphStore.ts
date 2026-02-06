// src/store/graphStore.ts
import { create } from "zustand";
import {
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
} from "reactflow";
import type { AppNode, AppEdge, GraphMode } from "../graph/types";

type GraphState = {
    mode: GraphMode;
    nodes: AppNode[];
    edges: AppEdge[];

    setMode: (mode: GraphMode) => void;
    addNode: (node: AppNode) => void;
    setGraph: (nodes: AppNode[], edges: AppEdge[]) => void;

    // React Flow callbacks
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
};

export const useGraphStore = create<GraphState>((set, get) => ({
    mode: "pipeline",
    nodes: [],
    edges: [],

    /* ---------- Mode ---------- */
    setMode: (mode) => set({ mode }),

    /* ---------- Add a single node ---------- */
    addNode: (node) => set({ nodes: [...get().nodes, node] }),

    /* ---------- Replace entire graph ---------- */
    setGraph: (nodes, edges) => set({ nodes, edges }),

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
