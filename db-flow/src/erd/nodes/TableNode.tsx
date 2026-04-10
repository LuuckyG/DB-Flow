import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { ERDNodeData } from "../../graph/types";

function TableNode({ data, selected }: NodeProps<ERDNodeData>) {
    return (
        <div className={`table-node${selected ? " table-node--selected" : ""}`}>
            {/* Dark header */}
            <div className="table-node__header">
                <span className="table-node__icon">▤</span>
                <span className="table-node__title">{data.tableName}</span>
            </div>

            {/* Column rows */}
            <div className="table-node__columns">
                {data.columns.map((col) => {
                    const rowClass = col.isPK
                        ? "table-node__col table-node__col--pk"
                        : col.isFK
                          ? "table-node__col table-node__col--fk"
                          : "table-node__col";

                    return (
                        <div key={col.name} className={rowClass}>
                            {col.isPK && (
                                <span className="table-node__col-badge table-node__col-badge--pk">
                                    PK
                                </span>
                            )}
                            {col.isFK && !col.isPK && (
                                <span className="table-node__col-badge table-node__col-badge--fk">
                                    FK
                                </span>
                            )}
                            {col.isUnique && !col.isPK && !col.isFK && (
                                <span className="table-node__col-badge table-node__col-badge--uq">
                                    UQ
                                </span>
                            )}
                            <span className="table-node__col-name">{col.name}</span>
                            <span className="table-node__col-type">{col.type}</span>
                            {col.isNullable && (
                                <span className="table-node__col-nullable">?</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Handles */}
            <Handle type="source" position={Position.Right} />
            <Handle type="target" position={Position.Left} />
        </div>
    );
}

export default memo(TableNode);
