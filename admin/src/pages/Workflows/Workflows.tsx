import type React from "react";
import { useMemo, useState } from "react";
import DataTable from "../../components/Table/DataTable";
import SearchInput from "../../components/Search/SearchInput";

type WorkflowStatus = "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
type StageStatus = "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";

interface WorkflowStage {
    name: string;
    status: StageStatus;
}

interface Workflow {
    id: string;
    timestamp: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
    status: WorkflowStatus;
    query: string;
    stages: WorkflowStage[];
    logs: string[];
    agents: string[];
    createdBy: string;
    priority: "low" | "medium" | "high";
}

const nowIso = (): string => new Date().toISOString();
const createWorkflowId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `wf-${crypto.randomUUID()}`;
    }
    return `wf-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const createDummyWorkflows = (): Workflow[] => [
    {
        id: "wf-1001",
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        startedAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
        status: "running",
        query: "Collect portfolio analytics for all projects and refresh ranking scores",
        stages: [
            { name: "query-validation", status: "completed" },
            { name: "data-extraction", status: "running" },
            { name: "score-normalization", status: "pending" },
        ],
        logs: [
            "Workflow accepted by scheduler",
            "Validation passed",
            "Extraction started",
            "Waiting for next data chunk",
        ],
        agents: ["analytics-agent", "ranking-agent"],
        createdBy: "zuhair@portfolio.dev",
        priority: "high",
    },
    {
        id: "wf-1002",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        startedAt: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
        completedAt: new Date(Date.now() - 1000 * 60 * 121).toISOString(),
        status: "completed",
        query: "Generate daily quality metrics for CI workflow runs",
        stages: [
            { name: "query-validation", status: "completed" },
            { name: "data-collection", status: "completed" },
            { name: "report-generation", status: "completed" },
        ],
        logs: [
            "Workflow accepted by scheduler",
            "Data collection finished",
            "Report pushed to storage",
        ],
        agents: ["metrics-agent"],
        createdBy: "ops@portfolio.dev",
        priority: "medium",
    },
    {
        id: "wf-1003",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        status: "queued",
        query: "Find stale portfolio entries and prepare cleanup candidates",
        stages: [
            { name: "query-validation", status: "pending" },
            { name: "candidate-generation", status: "pending" },
        ],
        logs: ["Workflow queued and waiting for worker allocation"],
        agents: ["cleanup-agent"],
        createdBy: "admin@portfolio.dev",
        priority: "low",
    },
];

const WorkflowsPage: React.FC = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>(() => createDummyWorkflows());
    const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = useState<string>("");
    const [searchValue, setSearchValue] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newQuery, setNewQuery] = useState("");
    const [newCreatedBy, setNewCreatedBy] = useState("admin@portfolio.dev");
    const [newAgents, setNewAgents] = useState("workflow-agent, validation-agent");
    const [newStages, setNewStages] = useState("query-validation, execution, report");

    const selectedWorkflow = useMemo(
        () => workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? null,
        [selectedWorkflowId, workflows],
    );

    const filteredWorkflows = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();
        if (!normalizedSearch) return workflows;
        return workflows.filter((workflow) => {
            const haystack = [
                workflow.id,
                workflow.status,
                workflow.createdBy,
                workflow.query,
                workflow.agents.join(", "),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(normalizedSearch);
        });
    }, [searchValue, workflows]);

    const setSelectedWorkflow = (workflow: Workflow) => {
        setSelectedWorkflowId(workflow.id);
    };

    const cancelWorkflow = (workflow: Workflow) => {
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            setActionFeedback(`Workflow ${workflow.id} cannot be cancelled because it is already ${workflow.status}.`);
            return;
        }
        const updatedAt = nowIso();
        setActionFeedback(`Workflow ${workflow.id} was cancelled.`);
        setWorkflows((current) =>
            current.map((item) => {
                if (item.id !== workflow.id) return item;
                return {
                    ...item,
                    status: "cancelled",
                    updatedAt,
                    completedAt: updatedAt,
                    stages: item.stages.map((stage) =>
                        stage.status === "running" || stage.status === "pending" || stage.status === "paused"
                            ? { ...stage, status: "cancelled" }
                            : stage
                    ),
                    logs: [...item.logs, "Workflow cancelled by user request"],
                };
            }),
        );
    };

    const pauseOrResumeWorkflow = (workflow: Workflow) => {
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            setActionFeedback(`Workflow ${workflow.id} cannot be paused or resumed because it is ${workflow.status}.`);
            return;
        }
        const nextStatus: WorkflowStatus =
            workflow.status === "running" || workflow.status === "queued" ? "paused" : "running";
        const shouldPause = nextStatus === "paused";
        setActionFeedback(
            shouldPause ? `Workflow ${workflow.id} was paused.` : `Workflow ${workflow.id} was resumed.`
        );
        setWorkflows((current) =>
            current.map((item) => {
                if (item.id !== workflow.id) return item;
                return {
                    ...item,
                    status: nextStatus,
                    updatedAt: nowIso(),
                    stages: item.stages.map((stage) => {
                        if (shouldPause && stage.status === "running") {
                            return { ...stage, status: "paused" };
                        }
                        if (!shouldPause && stage.status === "paused") return { ...stage, status: "running" };
                        return stage;
                    }),
                    logs: [
                        ...item.logs,
                        shouldPause ? "Workflow paused by user request" : "Workflow resumed by user request",
                    ],
                };
            }),
        );
    };

    const createWorkflow = () => {
        const query = newQuery.trim();
        if (!query) return;
        const createdAt = nowIso();
        const workflowId = createWorkflowId();
        const stageNames = newStages
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        const normalizedStages = stageNames.length > 0 ? stageNames : ["query-validation", "execution", "report"];
        const normalizedAgents = newAgents
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

        const newWorkflow: Workflow = {
            id: workflowId,
            timestamp: createdAt,
            updatedAt: createdAt,
            status: "queued",
            query,
            stages: normalizedStages.map((stage) => ({
                name: stage,
                status: "pending",
            })),
            logs: ["Workflow created", "Workflow queued for execution"],
            agents: normalizedAgents,
            createdBy: newCreatedBy.trim() || "unknown@portfolio.dev",
            priority: "medium",
        };

        setWorkflows((current) => [newWorkflow, ...current]);
        setSelectedWorkflowId(newWorkflow.id);
        setNewQuery("");
        setShowCreateForm(false);
    };

    return (
        <section className="p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-title">Workflow Management</h2>
                <button
                    className="btn btn-primary w-full md:w-auto"
                    onClick={() => setShowCreateForm((current) => !current)}
                >
                    {showCreateForm ? "Close Creator" : "Create Workflow"}
                </button>
            </div>

            <div className="card">
                <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search by workflow ID, creator, query, or agent"
                />
            </div>
            {actionFeedback ? <div className="card text-caption">{actionFeedback}</div> : null}

            {showCreateForm ? (
                <div className="card flex flex-col gap-3">
                    <h3 className="text-heading">Create New Workflow</h3>
                    <div className="input-group">
                        <label className="input-label">Query</label>
                        <textarea
                            className="input"
                            rows={4}
                            value={newQuery}
                            onChange={(event) => setNewQuery(event.target.value)}
                            placeholder="Write a workflow query..."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="input-group">
                            <label className="input-label">Created By</label>
                            <input
                                className="input"
                                value={newCreatedBy}
                                onChange={(event) => setNewCreatedBy(event.target.value)}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Assigned Agents (comma separated)</label>
                            <input
                                className="input"
                                value={newAgents}
                                onChange={(event) => setNewAgents(event.target.value)}
                                placeholder="agent-a, agent-b"
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Stages (comma separated)</label>
                        <input
                            className="input"
                            value={newStages}
                            onChange={(event) => setNewStages(event.target.value)}
                            placeholder="validate, execute, finalize"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={createWorkflow}
                            disabled={newQuery.trim().length === 0}
                        >
                            Submit Workflow
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowCreateForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : null}

            <DataTable
                title="Current Workflows"
                columns={[
                    { name: "ID", key: "id" },
                    { name: "Status", key: "status" },
                    { name: "Created By", key: "createdBy" },
                    { name: "Agents", key: "agents" },
                    { name: "Stages", key: "stages" },
                    { name: "Created At", key: "timestamp" },
                ]}
                pagination={[{ pageNumber: 1, isActive: true }]}
                totalPages={1}
                clipLongText={true}
                actions={[
                    { name: "View Details", className: "btn btn-tertiary btn-sm", handler: (row) => setSelectedWorkflow(row as Workflow) },
                    { name: "Pause or Resume Workflow", className: "btn btn-primary btn-sm", handler: (row) => pauseOrResumeWorkflow(row as Workflow) },
                    { name: "Cancel Workflow", className: "btn btn-danger btn-sm", handler: (row) => cancelWorkflow(row as Workflow) },
                ]}
                data={filteredWorkflows.map((workflow) => ({
                    ...workflow,
                    agents: workflow.agents.join(", "),
                    stages: `${workflow.stages.filter((stage) => stage.status === "completed").length}/${workflow.stages.length}`,
                    timestamp: new Date(workflow.timestamp).toLocaleString(),
                }))}
            />

            {selectedWorkflow ? (
                <div className="card flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-heading">Workflow Details · {selectedWorkflow.id}</h3>
                        <span className="text-caption">Status: {selectedWorkflow.status}</span>
                    </div>
                    <p className="text-body">{selectedWorkflow.query}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-subheading">Metadata</h4>
                            <ul className="text-caption mt-2 flex flex-col gap-1">
                                <li>Created by: {selectedWorkflow.createdBy}</li>
                                <li>Priority: {selectedWorkflow.priority}</li>
                                <li>Assigned agents: {selectedWorkflow.agents.join(", ") || "—"}</li>
                                <li>Created at: {new Date(selectedWorkflow.timestamp).toLocaleString()}</li>
                                <li>Updated at: {new Date(selectedWorkflow.updatedAt).toLocaleString()}</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-subheading">Stage Status</h4>
                            <ul className="mt-2 flex flex-col gap-2">
                                {selectedWorkflow.stages.map((stage) => (
                                    <li
                                        key={`${selectedWorkflow.id}-${stage.name}`}
                                        className="flex items-center justify-between px-3 py-2 rounded-md"
                                        style={{ background: "var(--color-background-secondary)" }}
                                    >
                                        <span className="text-caption">{stage.name}</span>
                                        <span className="text-caption">{stage.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-subheading">Logs</h4>
                        <ul className="mt-2 flex flex-col gap-2">
                            {selectedWorkflow.logs.map((logMessage, index) => (
                                <li
                                    key={`${selectedWorkflow.id}-log-${index}`}
                                    className="text-caption px-3 py-2 rounded-md"
                                    style={{ background: "var(--color-background-secondary)" }}
                                >
                                    {logMessage}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default WorkflowsPage;
