import type React from "react";
import { useState } from "react";
import type { ProcessTreeInfo } from "../../queries/fetchProcessTree";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProcessTreeProps {
    deviceId: string;
    processId?: string;
    processes: ProcessTreeInfo[];
}

interface ProcessTreeInfoExtended extends ProcessTreeInfo {
    executed_command?: string;
}

interface TreeNode {
    info: ProcessTreeInfoExtended;
    children: TreeNode[];
}

// ─── Tree Builder ─────────────────────────────────────────────────────────────

const buildTree = (processes: ProcessTreeInfo[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>();

    for (const p of processes) {
        nodeMap.set(p.pid, { info: p as ProcessTreeInfoExtended, children: [] });
    }

    const roots: TreeNode[] = [];

    for (const p of processes) {
        const node = nodeMap.get(p.pid)!;
        if (p.parent_pid && nodeMap.has(p.parent_pid)) {
            nodeMap.get(p.parent_pid)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    const sortByPid = (nodes: TreeNode[]): void => {
        nodes.sort((a, b) => parseInt(a.info.pid) - parseInt(b.info.pid));
        nodes.forEach(n => sortByPid(n.children));
    };
    sortByPid(roots);

    return roots;
};

// ─── Path Helpers ────────────────────────────────────────────────────────────

/**
 * Returns the set of PIDs that should be visible when focusing on targetPid:
 *   - all ancestors from root → targetPid (inclusive)
 *   - all descendants of targetPid (its subtree)
 */
const getVisiblePids = (
    targetPid: string,
    processes: ProcessTreeInfo[],
    roots: TreeNode[],
): Set<string> => {
    // Build pid → parent_pid lookup
    const pidToParent = new Map<string, string | undefined>();
    for (const p of processes) {
        pidToParent.set(p.pid, p.parent_pid ?? undefined);
    }

    // Walk up from targetPid to collect all ancestor PIDs
    const visiblePids = new Set<string>();
    let current: string | undefined = targetPid;
    while (current) {
        visiblePids.add(current);
        current = pidToParent.get(current);
    }

    // Build a flat pid → TreeNode map so we can walk descendants
    const nodeMap = new Map<string, TreeNode>();
    const collectNodes = (nodes: TreeNode[]) => {
        for (const n of nodes) {
            nodeMap.set(n.info.pid, n);
            collectNodes(n.children);
        }
    };
    collectNodes(roots);

    // BFS from targetPid to collect all descendant PIDs
    const queue: string[] = [targetPid];
    while (queue.length > 0) {
        const pid = queue.shift()!;
        visiblePids.add(pid);
        nodeMap.get(pid)?.children.forEach(c => queue.push(c.info.pid));
    }

    return visiblePids;
};

/** Recursively removes any node whose PID is not in visiblePids. */
const filterTreeToPath = (roots: TreeNode[], visiblePids: Set<string>): TreeNode[] => {
    const filterNode = (node: TreeNode): TreeNode | null => {
        if (!visiblePids.has(node.info.pid)) return null;
        return {
            ...node,
            children: node.children
                .map(filterNode)
                .filter((n): n is TreeNode => n !== null),
        };
    };
    return roots
        .map(filterNode)
        .filter((n): n is TreeNode => n !== null);
};

// ─── TreeNodeRow ──────────────────────────────────────────────────────────────

interface TreeNodeRowProps {
    node: TreeNode;
    prefix: string;
    isLast: boolean;
    isRoot: boolean;
    highlightPid?: string;
}

const TreeNodeRow: React.FC<TreeNodeRowProps> = ({ node, prefix, isLast, isRoot, highlightPid }) => {
    const [collapsed, setCollapsed] = useState(false);

    const hasChildren  = node.children.length > 0;
    const isHighlighted = node.info.pid === highlightPid;
    const connector   = isRoot ? '' : (isLast ? '└─' : '├─');
    const continuation = isRoot ? '' : (isLast ? '    ' : '│   ');
    const childPrefix  = prefix + continuation;

    return (
        <>
            {/* ── Row ── */}
            <div
                onClick={hasChildren ? () => setCollapsed(c => !c) : undefined}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    cursor: hasChildren ? 'pointer' : 'default',
                    backgroundColor: isHighlighted
                        ? 'var(--color-primary-50)'
                        : 'transparent',
                    transition: 'background-color var(--transition-fast)',
                }}
            >
                {/* Tree prefix + connector */}
                {!isRoot && (
                    <span
                        style={{
                            fontFamily: '"Courier New", Courier, monospace',
                            fontSize: '13px',
                            color: 'var(--color-gray-400)',
                            whiteSpace: 'pre',
                            userSelect: 'none',
                            lineHeight: '1.6',
                            flexShrink: 0,
                        }}
                    >
                        {prefix}{connector}
                    </span>
                )}

                {/* Collapse chevron */}
                {hasChildren && (
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            flexShrink: 0,
                            fontSize: '9px',
                            backgroundColor: isHighlighted
                                ? 'var(--color-primary-100)'
                                : 'var(--color-gray-200)',
                            color: isHighlighted
                                ? 'var(--color-primary-600)'
                                : 'var(--color-text-secondary)',
                            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                            transition: 'transform var(--transition-fast)',
                        }}
                    >
                        ▾
                    </span>
                )}

                {/* Process name */}
                <span
                    style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: isHighlighted ? 600 : 500,
                        fontFamily: 'var(--font-family-primary)',
                        color: isHighlighted
                            ? 'var(--color-primary-600)'
                            : 'var(--color-text-primary)',
                    }}
                >
                    {node.info.process_name}
                </span>

                {/* PID badge */}
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        lineHeight: '1.6',
                        padding: '0px 7px',
                        borderRadius: '9999px',
                        flexShrink: 0,
                        backgroundColor: isHighlighted
                            ? 'var(--color-primary-100)'
                            : 'var(--color-gray-100)',
                        color: isHighlighted
                            ? 'var(--color-primary-600)'
                            : 'var(--color-text-secondary)',
                    }}
                >
                    {node.info.pid}
                </span>

                {/* Executed command */}
                {node.info.executed_command && (
                    <span
                        style={{
                            fontSize: '11px',
                            fontFamily: '"Courier New", Courier, monospace',
                            color: 'var(--color-text-secondary)',
                            marginLeft: '2px',
                        }}
                    >
                        {node.info.executed_command}
                    </span>
                )}

                {/* Collapsed child count */}
                {hasChildren && collapsed && (
                    <span
                        style={{
                            fontSize: '11px',
                            fontStyle: 'italic',
                            color: 'var(--color-text-secondary)',
                            marginLeft: '4px',
                        }}
                    >
                        {node.children.length} hidden
                    </span>
                )}
            </div>

            {/* ── Children ── */}
            {!collapsed && node.children.map((child, index) => (
                <TreeNodeRow
                    key={child.info.pid}
                    node={child}
                    prefix={childPrefix}
                    isLast={index === node.children.length - 1}
                    isRoot={false}
                    highlightPid={highlightPid}
                />
            ))}
        </>
    );
};

// ─── ProcessTreeDiagram ───────────────────────────────────────────────────────

const ProcessTreeDiagram: React.FC<ProcessTreeProps> = ({ deviceId, processId, processes }) => {
    const allRoots = buildTree(processes);
    const roots = processId
        ? filterTreeToPath(allRoots, getVisiblePids(processId, processes, allRoots))
        : allRoots;

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* ── Header ── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                {/* Icon */}
                <div
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        flexShrink: 0,
                        backgroundColor: 'var(--color-primary-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="18" rx="2"
                            stroke="var(--color-primary-600)" strokeWidth="1.8"/>
                        <path d="M6 9l4 3-4 3M12 15h6"
                            stroke="var(--color-primary-600)" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                {/* Title + device */}
                <div>
                    <h4
                        style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 600,
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--color-text-primary)',
                            margin: 0,
                            lineHeight: 1.3,
                        }}
                    >
                        Process Tree
                    </h4>
                    <p
                        style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-family-primary)',
                            margin: 0,
                            lineHeight: 1.4,
                        }}
                    >
                        {deviceId}
                    </p>
                </div>

                {/* Process count badge */}
                <span
                    style={{
                        marginLeft: 'auto',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--color-gray-100)',
                        color: 'var(--color-text-secondary)',
                        flexShrink: 0,
                    }}
                >
                    {processes.length} processes
                </span>
            </div>

            {/* ── Legend ── */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '8px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-gray-50)',
                }}
            >
                {[
                    { label: 'Process name', style: { fontWeight: 500, fontSize: '12px', color: 'var(--color-text-primary)' } },
                    {
                        label: 'PID',
                        badge: true,
                        badgeStyle: {
                            fontSize: '11px', fontWeight: 500, padding: '0 7px',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--color-gray-100)',
                            color: 'var(--color-text-secondary)',
                        }
                    },
                    { label: 'command args', mono: true },
                ].map((item, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {item.badge ? (
                            <span style={item.badgeStyle as React.CSSProperties}>123</span>
                        ) : (
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontFamily: item.mono ? '"Courier New", Courier, monospace' : 'var(--font-family-primary)',
                                    color: item.mono ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                                    fontWeight: item.mono ? 400 : 500,
                                    ...(item.style || {}),
                                }}
                            >
                                {item.label}
                            </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                            {item.badge ? '← pid' : `← ${item.label}`}
                        </span>
                    </span>
                ))}
            </div>

            {/* ── Tree content ── */}
            <div
                style={{
                    padding: '10px 16px',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: '560px',
                }}
            >
                {processes.length === 0 ? (
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            fontSize: 'var(--font-size-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            textAlign: 'center',
                            padding: '32px 0',
                            margin: 0,
                        }}
                    >
                        No processes found.
                    </p>
                ) : (
                    <div style={{ minWidth: 'max-content' }}>
                        {roots.map((root, index) => (
                            <TreeNodeRow
                                key={root.info.pid}
                                node={root}
                                prefix=""
                                isLast={index === roots.length - 1}
                                isRoot={true}
                                highlightPid={processId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessTreeDiagram;