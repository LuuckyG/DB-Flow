import dagre from "dagre";
import type { AppNode, AppEdge, GraphMode } from "./types";

const nodeWidth = 180;
const nodeHeight = 60;

export function layoutGraph(
    nodes: AppNode[],
    edges: AppEdge[],
    mode: GraphMode
): AppNode[] {
    const graph = new dagre.graphlib.Graph();
    graph.setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
        rankdir: mode === "pipeline" ? "LR" : "TB",
        nodesep: 50,
        ranksep: 80,
    });

    nodes.forEach((node) => {
        graph.setNode(node.id, {
            width: nodeWidth,
            height: nodeHeight,
        });
    });

    edges.forEach((edge) => {
        graph.setEdge(edge.source, edge.target);
    });

    dagre.layout(graph);

    return nodes.map((node) => {
        const layoutedNode = graph.node(node.id);

        return {
            ...node,
            position: {
                x: layoutedNode.x - nodeWidth / 2,
                y: layoutedNode.y - nodeHeight / 2,
            },
        };
    });
}
