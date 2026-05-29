import type React from "react";
import { useState } from "react";
import { type Workflow } from '../../../interfaces/workflow.interface';
import workflowService from "../../../services/workflow.service";

interface CreateWorkflowProps {
    onSubmit: (workflow:Workflow) => void;
    onCancel: () => void;
}

const CreateWorkflow:React.FC<CreateWorkflowProps> = ({onSubmit, onCancel}) => {
    const [newQuery, setNewQuery] = useState("");
    const createWorkflow = async () => {
        const query = newQuery.trim();
        if (!query) return;

        try {
            const workflow = await workflowService.createWorkflow({ query });
            onSubmit(workflow);
            setNewQuery("");
        } catch {
            // Error handling will be improved when backend is integrated
            console.error("Failed to create workflow");
        }
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