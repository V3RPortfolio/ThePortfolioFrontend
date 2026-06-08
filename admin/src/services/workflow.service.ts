import type { Workflow, CreateWorkflow } from "../interfaces/workflow.interface";

// TODO: Replace with actual API constant when backend is ready
// import httpService from "./http.service";
// import { workflowApi } from "../constants";

export interface PaginatedWorkflowOut {
    items: Workflow[];
    count: number;
}

const dummyWorkflows: Workflow[] = [
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

class WorkflowService {

    private workflows: Workflow[] = [...dummyWorkflows];

    private generateId(): string {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return `wf-${crypto.randomUUID()}`;
        }
        return `wf-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    }

    async getWorkflows(page: number = 1, pageSize: number = 10): Promise<PaginatedWorkflowOut> {
        // TODO: Replace with API call when backend is ready
        // return httpService.get<PaginatedWorkflowOut>(
        //     `${workflowApi}/?offset=${(page - 1) * pageSize}&limit=${pageSize}`,
        //     {},
        //     true
        // );
        try {
            const start = (page - 1) * pageSize;
            const items = this.workflows.slice(start, start + pageSize);
            return { items, count: this.workflows.length };
        } catch {
            return { items: [], count: 0 };
        }
    }

    async createWorkflow(data: CreateWorkflow): Promise<Workflow> {
        // TODO: Replace with API call when backend is ready
        // return httpService.post<Workflow>(`${workflowApi}/`, {
        //     body: JSON.stringify(data),
        // }, true);
        const workflow: Workflow = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            startedAt: new Date().toISOString(),
            status: "running",
            query: data.query,
            stages: [
                { name: "query-validation", status: "completed" },
                { name: "data-extraction", status: "running" },
                { name: "score-normalization", status: "pending" },
            ],
            logs: [
                "Workflow accepted by scheduler",
                "Validation passed",
                "Extraction started",
            ],
            agents: ["analytics-agent", "ranking-agent"],
            createdBy: "zuhair@portfolio.dev",
            priority: "high",
        };
        this.workflows.unshift(workflow);
        return workflow;
    }

    async pauseWorkflow(workflowId: string): Promise<Workflow | null> {
        // TODO: Replace with API call when backend is ready
        // return httpService.post<Workflow>(`${workflowApi}/${workflowId}/pause`, {}, true);
        const index = this.workflows.findIndex((w) => w.id === workflowId);
        if (index === -1) return null;

        const workflow = this.workflows[index];
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            return null;
        }

        const updatedAt = new Date().toISOString();
        const updated: Workflow = {
            ...workflow,
            status: "paused",
            updatedAt,
            stages: workflow.stages.map((stage) =>
                stage.status === "running" ? { ...stage, status: "paused" } : stage
            ),
            logs: [...workflow.logs, "Workflow paused by user request"],
        };
        this.workflows[index] = updated;
        return updated;
    }

    async resumeWorkflow(workflowId: string): Promise<Workflow | null> {
        // TODO: Replace with API call when backend is ready
        // return httpService.post<Workflow>(`${workflowApi}/${workflowId}/resume`, {}, true);
        const index = this.workflows.findIndex((w) => w.id === workflowId);
        if (index === -1) return null;

        const workflow = this.workflows[index];
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            return null;
        }

        const updatedAt = new Date().toISOString();
        const updated: Workflow = {
            ...workflow,
            status: "running",
            updatedAt,
            stages: workflow.stages.map((stage) =>
                stage.status === "paused" ? { ...stage, status: "running" } : stage
            ),
            logs: [...workflow.logs, "Workflow resumed by user request"],
        };
        this.workflows[index] = updated;
        return updated;
    }

    async cancelWorkflow(workflowId: string): Promise<Workflow | null> {
        // TODO: Replace with API call when backend is ready
        // return httpService.post<Workflow>(`${workflowApi}/${workflowId}/cancel`, {}, true);
        const index = this.workflows.findIndex((w) => w.id === workflowId);
        if (index === -1) return null;

        const workflow = this.workflows[index];
        if (workflow.status === "completed" || workflow.status === "failed" || workflow.status === "cancelled") {
            return null;
        }

        const updatedAt = new Date().toISOString();
        const updated: Workflow = {
            ...workflow,
            status: "cancelled",
            updatedAt,
            completedAt: updatedAt,
            stages: workflow.stages.map((stage) =>
                stage.status === "running" || stage.status === "pending" || stage.status === "paused"
                    ? { ...stage, status: "cancelled" }
                    : stage
            ),
            logs: [...workflow.logs, "Workflow cancelled by user request"],
        };
        this.workflows[index] = updated;
        return updated;
    }

    async viewWorkflowDetails(workflowId: string): Promise<Workflow | null> {
        // TODO: Replace with API call when backend is ready
        // return httpService.get<Workflow>(`${workflowApi}/${workflowId}`, {}, true);
        try {
            const workflow = this.workflows.find((w) => w.id === workflowId);
            return workflow ?? null;
        } catch {
            return null;
        }
    }
}

export default new WorkflowService();
