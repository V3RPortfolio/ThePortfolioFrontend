import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "../../components/Table/DataTable";
import SearchInput from "../../components/Search/SearchInput";
import type { Workflow } from '../../interfaces/workflow.interface';
import workflowService from "../../services/workflow.service";
import CreateWorkflow from "./components/CreateWorkflow";
import ViewWorkflowDetails from "./components/ViewWorkflowDetails";

const PAGE_SIZE = 10;

const WorkflowsPage: React.FC = () => {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [actionFeedback, setActionFeedback] = useState<string>("");
    const [searchValue, setSearchValue] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const fetchWorkflows = useCallback(async (page: number) => {
        try {
            const { items, count } = await workflowService.getWorkflows(page, PAGE_SIZE);
            setWorkflows(items);
            setTotalCount(count);
        } catch {
            setActionFeedback("Failed to fetch workflows.");
        }
    }, []);

    useEffect(() => {
        fetchWorkflows(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const paginationHandler = (page: number) => {
        setCurrentPage(page);
    };

    const pagination = useMemo(() => {
        return Array.from({ length: totalPages }, (_, i) => ({
            pageNumber: i + 1,
            isActive: i + 1 === currentPage,
        }));
    }, [totalPages, currentPage]);

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

    const handleViewDetails = async (workflow: Workflow) => {
        try {
            const details = await workflowService.viewWorkflowDetails(workflow.id);
            setSelectedWorkflow(details);
        } catch {
            setActionFeedback(`Failed to load details for workflow ${workflow.id}.`);
        }
    };

    const handleCancelWorkflow = async (workflow: Workflow) => {
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            setActionFeedback(`Workflow ${workflow.id} cannot be cancelled because it is already ${workflow.status}.`);
            return;
        }
        try {
            const updated = await workflowService.cancelWorkflow(workflow.id);
            if (updated) {
                setActionFeedback(`Workflow ${workflow.id} was cancelled.`);
                await fetchWorkflows(currentPage);
            }
        } catch {
            setActionFeedback(`Failed to cancel workflow ${workflow.id}.`);
        }
    };

    const handlePauseOrResumeWorkflow = async (workflow: Workflow) => {
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            setActionFeedback(`Workflow ${workflow.id} cannot be paused or resumed because it is ${workflow.status}.`);
            return;
        }
        const shouldPause = workflow.status === "running" || workflow.status === "queued";
        try {
            const updated = shouldPause
                ? await workflowService.pauseWorkflow(workflow.id)
                : await workflowService.resumeWorkflow(workflow.id);

            if (updated) {
                setActionFeedback(
                    shouldPause ? `Workflow ${workflow.id} was paused.` : `Workflow ${workflow.id} was resumed.`
                );
                await fetchWorkflows(currentPage);
            }
        } catch {
            setActionFeedback(`Failed to ${shouldPause ? "pause" : "resume"} workflow ${workflow.id}.`);
        }
    };

    const onCreateWorkflow = (workflow: Workflow) => {
        setWorkflows((current) => [workflow, ...current]);
        setTotalCount((count) => count + 1);
        setSelectedWorkflow(workflow);
        setShowCreateForm(false);
    };

    const onCancelCreateWorkflow = () => {
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
                pagination={pagination}
                paginationHandler={paginationHandler}
                totalPages={totalPages}
                clipLongText={true}
                actions={[
                    { name: "View Details", className: "btn btn-tertiary btn-sm", handler: (row) => handleViewDetails(row as Workflow) },
                    { name: "Pause or Resume Workflow", className: "btn btn-primary btn-sm", handler: (row) => handlePauseOrResumeWorkflow(row as Workflow) },
                    { name: "Cancel Workflow", className: "btn btn-danger btn-sm", handler: (row) => handleCancelWorkflow(row as Workflow) },
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
