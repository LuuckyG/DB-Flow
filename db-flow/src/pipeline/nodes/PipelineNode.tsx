import { Handle, Position } from "reactflow";

export default function PipelineNode({ data }: any) {
    return (
        <div style={{ padding: 10, border: "1px solid #555", borderRadius: 6 }
        }>
            <strong>{data.label} </strong>
            < div style={{ fontSize: 12 }}> {data.stepType} </div>

            < Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
}
