// src/components/TableEditor.tsx
import { useState, useEffect } from "react";
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
/*  Styles                                                              */
/* ------------------------------------------------------------------ */
const s: Record<string, React.CSSProperties> = {
    overlay: {
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: 320,
        background: "#ffffff",
        borderLeft: "1px solid #e2e8f0",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "inherit",
    },
    overlayHidden: {
        transform: "translateX(100%)",
    },
    header: {
        background: "#1e293b",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        color: "#f1f5f9",
        fontWeight: 700,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    closeBtn: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: 18,
        lineHeight: 1,
        padding: "2px 6px",
        borderRadius: 4,
    },
    body: {
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    label: {
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        marginBottom: 4,
    },
    input: {
        width: "100%",
        padding: "7px 10px",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        fontSize: 13,
        color: "#1e293b",
        outline: "none",
        background: "#f8fafc",
        boxSizing: "border-box" as const,
        transition: "border-color 0.15s",
    },
    divider: {
        borderTop: "1px solid #e2e8f0",
        margin: "4px 0",
    },
    colRow: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#f8fafc",
        overflow: "hidden",
    },
    colHeader: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        background: "#f1f5f9",
        borderBottom: "1px solid #e2e8f0",
        fontSize: 12,
    },
    colBody: {
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
    },
    colInputRow: {
        display: "flex",
        gap: 8,
    },
    checkboxGroup: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap" as const,
    },
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        color: "#374151",
        cursor: "pointer",
        userSelect: "none" as const,
    },
    iconBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#94a3b8",
        fontSize: 14,
        padding: "2px 5px",
        borderRadius: 4,
        lineHeight: 1,
    },
    addBtn: {
        width: "100%",
        padding: "8px",
        border: "1.5px dashed #cbd5e1",
        borderRadius: 6,
        background: "none",
        color: "#64748b",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: 500,
        transition: "border-color 0.15s, color 0.15s",
    },
};

/* ------------------------------------------------------------------ */
/*  ColumnRow — one editable column entry                               */
/* ------------------------------------------------------------------ */
function ColumnRow({
    col,
    index,
    total,
    onChange,
    onDelete,
    onMove,
}: {
    col: Column;
    index: number;
    total: number;
    onChange: (updated: Column) => void;
    onDelete: () => void;
    onMove: (dir: -1 | 1) => void;
}) {
    const pkColor = col.isPK ? "#f59e0b" : undefined;
    const fkColor = col.isFK ? "#6366f1" : undefined;

    return (
        <div style={s.colRow}>
            {/* Mini header with drag order controls */}
            <div style={s.colHeader}>
                <span
                    style={{
                        flex: 1,
                        fontWeight: 600,
                        color: pkColor ?? fkColor ?? "#374151",
                        fontSize: 12,
                    }}
                >
                    {col.isPK && "🔑 "}{col.isFK && "🔗 "}{col.name || "kolom"}
                </span>

                {/* Order controls */}
                <button
                    style={{ ...s.iconBtn, opacity: index === 0 ? 0.3 : 1 }}
                    onClick={() => onMove(-1)}
                    disabled={index === 0}
                    title="Omhoog"
                >
                    ▲
                </button>
                <button
                    style={{ ...s.iconBtn, opacity: index === total - 1 ? 0.3 : 1 }}
                    onClick={() => onMove(1)}
                    disabled={index === total - 1}
                    title="Omlaag"
                >
                    ▼
                </button>
                <button
                    style={{ ...s.iconBtn, color: "#ef4444" }}
                    onClick={onDelete}
                    title="Kolom verwijderen"
                >
                    ✕
                </button>
            </div>

            {/* Inputs */}
            <div style={s.colBody}>
                <div style={s.colInputRow}>
                    {/* Name */}
                    <input
                        style={{ ...s.input, flex: 1 }}
                        placeholder="kolomnaam"
                        value={col.name}
                        onChange={(e) => onChange({ ...col, name: e.target.value })}
                        spellCheck={false}
                    />

                    {/* Type with datalist */}
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            style={s.input}
                            placeholder="type"
                            value={col.type}
                            list={`types-${index}`}
                            onChange={(e) => onChange({ ...col, type: e.target.value })}
                            spellCheck={false}
                        />
                        <datalist id={`types-${index}`}>
                            {SQL_TYPES.map((t) => (
                                <option key={t} value={t} />
                            ))}
                        </datalist>
                    </div>
                </div>

                {/* Constraints */}
                <div style={s.checkboxGroup}>
                    {(
                        [
                            { key: "isPK", label: "PK", title: "Primary Key" },
                            { key: "isFK", label: "FK", title: "Foreign Key" },
                            { key: "isNullable", label: "Nullable", title: "Nullable" },
                            { key: "isUnique", label: "Unique", title: "Unique" },
                        ] as const
                    ).map(({ key, label, title }) => (
                        <label key={key} style={s.checkboxLabel} title={title}>
                            <input
                                type="checkbox"
                                checked={!!col[key as keyof Column]}
                                onChange={(e) =>
                                    onChange({ ...col, [key]: e.target.checked })
                                }
                                style={{ accentColor: "#6366f1" }}
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
    const { nodes, selectedNodeId, updateNodeData, reorderColumn, setSelectedNode } =
        useGraphStore();

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const nodeData = selectedNode?.data as ERDNodeData | undefined;
    const isOpen = !!selectedNode && !!nodeData?.columns;

    // Local state: tableName + columns (uncommitted while editing)
    const [tableName, setTableName] = useState("");
    const [columns, setColumns] = useState<Column[]>([]);

    // Sync from store when selected node changes
    useEffect(() => {
        if (nodeData) {
            setTableName(nodeData.tableName);
            setColumns(nodeData.columns);
        }
    }, [selectedNodeId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist changes to the store on every edit
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
        // also update local state so UI stays in sync immediately
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

    return (
        <div
            style={{
                ...s.overlay,
                ...(isOpen ? {} : s.overlayHidden),
            }}
        >
            {/* Header */}
            <div style={s.header}>
                <div style={s.headerTitle}>
                    <span>🗄️</span>
                    <span>{tableName || "Tabel bewerken"}</span>
                </div>
                <button style={s.closeBtn} onClick={() => setSelectedNode(null)} title="Sluiten">
                    ✕
                </button>
            </div>

            {/* Body */}
            {isOpen && (
                <div style={s.body}>
                    {/* Table name */}
                    <div>
                        <label style={s.label}>Tabelnaam</label>
                        <input
                            style={s.input}
                            value={tableName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="table_name"
                            spellCheck={false}
                        />
                    </div>

                    <div style={s.divider} />

                    {/* Column header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <label style={{ ...s.label, margin: 0 }}>
                            Kolommen ({columns.length})
                        </label>
                    </div>

                    {/* Columns */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {columns.map((col, i) => (
                            <ColumnRow
                                key={`${selectedNodeId}-${i}`}
                                col={col}
                                index={i}
                                total={columns.length}
                                onChange={(updated) => handleColumnChange(i, updated)}
                                onDelete={() => handleColumnDelete(i)}
                                onMove={(dir) => handleColumnMove(i, dir)}
                            />
                        ))}
                    </div>

                    {/* Add column */}
                    <button style={s.addBtn} onClick={handleAddColumn}>
                        ＋ Kolom toevoegen
                    </button>

                    {/* Footer stats */}
                    <div
                        style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            borderTop: "1px solid #f1f5f9",
                            paddingTop: 8,
                            display: "flex",
                            gap: 12,
                        }}
                    >
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
