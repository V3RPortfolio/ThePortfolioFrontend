import type React from "react";
import { useState } from "react";
import { type Workflow } from '../../../interfaces/workflow.interface';


const nowIso = (): string => new Date().toISOString();
const createWorkflowId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return `wf-${crypto.randomUUID()}`;
    }
    return `wf-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const getNewWorkflow = (query:string):Workflow => {
    return {
        query,
        id: createWorkflowId(),
        timestamp: nowIso(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        startedAt: nowIso(),
        status: "running",
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
    }
}

interface CreateWorkflowProps {
    onSubmit: (workflow:Workflow) => void;
    onCancel: () => void;
}

const CreateWorkflow:React.FC<CreateWorkflowProps> = ({onSubmit, onCancel}) => {
    const [newQuery, setNewQuery] = useState("");
    const createWorkflow = () => {
        const query = newQuery.trim();
        if (!query) return;

        // TODO: Api call to create new workflow
        const workflow = getNewWorkflow(query);
        onSubmit(workflow);
        setNewQuery("");
    };

    return <div className="card flex flex-col gap-3">
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
                            onClick={() => onCancel()}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
}

export default CreateWorkflow;