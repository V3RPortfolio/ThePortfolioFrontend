
export type WorkflowStatus = "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
export type StageStatus = "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";

export interface WorkflowStage {
    name: string;
    status: StageStatus;
}

export interface Workflow {
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

export interface CreateWorkflow {
    query: string;
}