import type React from "react";
import { useMemo, useState } from "react";
import DataTable from "../../components/Table/DataTable";
import SearchInput from "../../components/Search/SearchInput";
import { type Workflow, type WorkflowStatus } from '../../interfaces/workflow.interface';
import CreateWorkflow from "./components/CreateWorkflow";
import ViewWorkflowDetails from "./components/ViewWorkflowDetails";




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
        const updatedAt = new Date().toISOString();
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
                    updatedAt: new Date().toISOString(),
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

    const onCreateWorkflow = (workflow:Workflow) => {
        setWorkflows([...workflows, workflow]);
        setSelectedWorkflowId(workflow.id);
        setShowCreateForm(false);
    }

    const onCancelCreateWorkflow = () => {
        setShowCreateForm(false);
    }

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

            {showCreateForm ? (
                <CreateWorkflow onSubmit={onCreateWorkflow} onCancel={onCancelCreateWorkflow} />
            ) : null}

            <div className="card">
                <SearchInput
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Search by workflow ID, creator, query, or agent"
                />
            </div>
            {actionFeedback ? <div className="card text-caption">{actionFeedback}</div> : null}

            <DataTable
                title="Current Workflows"
                columns={[
                    { name: "ID", key: "id" },
                    { name: "Status", key: "status" },
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
                <ViewWorkflowDetails selectedWorkflow={selectedWorkflow} />
            ) : null}
        </section>
    );
};

export default WorkflowsPage;
