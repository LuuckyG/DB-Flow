import { Handle, Position } from "reactflow";

export default function TableNode({ data }: any) {
    return (
        <div style={{ padding: 10, border: "1px solid #333", minWidth: 180 }}>
            <strong>{data.tableName}</strong>

            <ul style={{ paddingLeft: 12 }}>
                {data.columns.map((col: any) => (
                    <li key={col.name} style={{ fontSize: 12 }}>
                        {col.isPK && "🔑 "}
                        {col.name}: {col.type}
                    </li>
                ))}
            </ul>

            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Left} />
        </div>
    );
}
