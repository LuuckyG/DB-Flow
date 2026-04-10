import { useState } from "react";
import { useGraphStore } from "../store/graphStore";
import type { Column, ERDNodeData } from "../graph/types";

/* ------------------------------------------------------------------ */
/*  Common SQL types for the datalist                                   */
/* ------------------------------------------------------------------ */
const SQL_TYPES = [
    "uuid", "integer", "bigint", "smallint", "serial", "bigserial",
    "boolean", "text", "varchar(255)", "varchar(100)", "varchar(50)",
    "char(1)", "decimal(10,2)", "numeric", "float", "double precision",
    "date", "timestamp", "timestamptz", "time", "interval",
    "jsonb", "json", "bytea", "inet", "cidr", "macaddr",
];

/* ------------------------------------------------------------------ */
/*  ColumnRow — one editable column entry                               */
/* ------------------------------------------------------------------ */
function ColumnRow({
    col,
    index,
    total,
    nodeId,
    onChange,
    onDelete,
    onMove,
}: {
    col: Column;
    index: number;
    total: number;
    nodeId: string;
    onChange: (updated: Column) => void;
    onDelete: () => void;
    onMove: (dir: -1 | 1) => void;
}) {
    const nameClass = col.isPK
        ? "te-col-card__name te-col-card__name--pk"
        : col.isFK
          ? "te-col-card__name te-col-card__name--fk"
          : "te-col-card__name te-col-card__name--default";

    return (
        <div className="te-col-card">
            {/* Mini header with order controls */}
            <div className="te-col-card__header">
                <span className={nameClass}>
                    {col.isPK && "🔑 "}{col.isFK && "🔗 "}
                    {col.name || "kolom"}
                </span>

                <button
                    className="te-col-card__btn"
                    onClick={() => onMove(-1)}
                    disabled={index === 0}
                    title="Omhoog"
                >
                    ▲
                </button>
                <button
                    className="te-col-card__btn"
                    onClick={() => onMove(1)}
                    disabled={index === total - 1}
                    title="Omlaag"
                >
                    ▼
                </button>
                <button
                    className="te-col-card__btn te-col-card__btn--delete"
                    onClick={onDelete}
                    title="Kolom verwijderen"
                >
                    ✕
                </button>
            </div>

            {/* Inputs */}
            <div className="te-col-card__body">
                <div className="te-col-card__inputs">
                    <input
                        className="te-input"
                        placeholder="kolomnaam"
                        value={col.name}
                        onChange={(e) => onChange({ ...col, name: e.target.value })}
                        spellCheck={false}
                    />
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            className="te-input"
                            placeholder="type"
                            value={col.type}
                            list={`types-${nodeId}-${index}`}
                            onChange={(e) => onChange({ ...col, type: e.target.value })}
                            spellCheck={false}
                        />
                        <datalist id={`types-${nodeId}-${index}`}>
                            {SQL_TYPES.map((t) => (
                                <option key={t} value={t} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div className="te-constraints">
                    {(
                        [
                            { key: "isPK", label: "PK", title: "Primary Key" },
                            { key: "isFK", label: "FK", title: "Foreign Key" },
                            { key: "isNullable", label: "Nullable", title: "Nullable" },
                            { key: "isUnique", label: "Unique", title: "Unique" },
                        ] as const
                    ).map(({ key, label, title }) => (
                        <label key={key} className="te-checkbox-label" title={title}>
                            <input
                                type="checkbox"
                                checked={!!col[key as keyof Column]}
                                onChange={(e) =>
                                    onChange({ ...col, [key]: e.target.checked })
                                }
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  TableEditor — the slide-in panel                                    */
/* ------------------------------------------------------------------ */
export default function TableEditor() {
    const {
        nodes,
        selectedNodeId,
        updateNodeData,
        reorderColumn,
        removeNode,
        setSelectedNode,
    } = useGraphStore();

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const nodeData = selectedNode?.data as ERDNodeData | undefined;
    const isOpen = !!selectedNode && !!nodeData?.columns;

    // Initialise from store. The component is re-keyed on selectedNodeId in
    // App.tsx so it remounts fresh every time a different table is selected —
    // no useEffect sync needed.
    const [tableName, setTableName] = useState(nodeData?.tableName ?? "");
    const [columns, setColumns] = useState<Column[]>(nodeData?.columns ?? []);

    // Persist changes to store on every edit
    const persist = (name: string, cols: Column[]) => {
        if (!selectedNodeId) return;
        updateNodeData(selectedNodeId, { tableName: name, label: name, columns: cols });
    };

    const handleNameChange = (value: string) => {
        setTableName(value);
        persist(value, columns);
    };

    const handleColumnChange = (index: number, updated: Column) => {
        const next = columns.map((c, i) => (i === index ? updated : c));
        setColumns(next);
        persist(tableName, next);
    };

    const handleColumnDelete = (index: number) => {
        const next = columns.filter((_, i) => i !== index);
        setColumns(next);
        persist(tableName, next);
    };

    const handleColumnMove = (index: number, dir: -1 | 1) => {
        if (!selectedNodeId) return;
        const to = index + dir;
        if (to < 0 || to >= columns.length) return;
        reorderColumn(selectedNodeId, index, to);
        const next = [...columns];
        const [moved] = next.splice(index, 1);
        next.splice(to, 0, moved);
        setColumns(next);
    };

    const handleAddColumn = () => {
        const next = [
            ...columns,
            { name: "", type: "text", isPK: false, isFK: false, isNullable: true },
        ];
        setColumns(next);
        persist(tableName, next);
    };

    const handleDeleteTable = () => {
        if (!selectedNodeId) return;
        if (!confirm(`Tabel "${tableName}" verwijderen?`)) return;
        removeNode(selectedNodeId);
    };

    return (
        <div className={`te-panel${isOpen ? "" : " te-panel--hidden"}`}>
            {/* Header */}
            <div className="te-header">
                <div className="te-header__title">
                    <span>▤</span>
                    <span>{tableName || "Tabel bewerken"}</span>
                </div>
                <div className="te-header__actions">
                    <button
                        className="te-icon-btn te-icon-btn--danger"
                        onClick={handleDeleteTable}
                        title="Tabel verwijderen"
                    >
                        🗑
                    </button>
                    <button
                        className="te-icon-btn"
                        onClick={() => setSelectedNode(null)}
                        title="Sluiten"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Body — only rendered when a table is selected */}
            {isOpen && (
                <div className="te-body">
                    {/* Table name */}
                    <div>
                        <label className="te-field-label">Tabelnaam</label>
                        <input
                            className="te-input"
                            value={tableName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="table_name"
                            spellCheck={false}
                        />
                    </div>

                    <hr className="te-divider" />

                    {/* Columns heading */}
                    <div className="te-col-list-header">
                        <label className="te-field-label" style={{ margin: 0 }}>
                            Kolommen ({columns.length})
                        </label>
                    </div>

                    {/* Column cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {columns.map((col, i) => (
                            <ColumnRow
                                key={`${selectedNodeId}-${i}`}
                                col={col}
                                index={i}
                                total={columns.length}
                                nodeId={selectedNodeId!}
                                onChange={(updated) => handleColumnChange(i, updated)}
                                onDelete={() => handleColumnDelete(i)}
                                onMove={(dir) => handleColumnMove(i, dir)}
                            />
                        ))}
                    </div>

                    {/* Add column */}
                    <button className="te-add-col-btn" onClick={handleAddColumn}>
                        ＋ Kolom toevoegen
                    </button>

                    {/* Footer stats */}
                    <div className="te-stats">
                        <span>PK: {columns.filter((c) => c.isPK).length}</span>
                        <span>FK: {columns.filter((c) => c.isFK).length}</span>
                        <span>Nullable: {columns.filter((c) => c.isNullable).length}</span>
                        <span>Unique: {columns.filter((c) => c.isUnique).length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
