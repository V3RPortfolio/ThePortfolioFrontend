import type React from "react";
import { type Workflow } from '../../../interfaces/workflow.interface';


interface ViewWorkflowDetailsProps {
    selectedWorkflow:Workflow
}

const ViewWorkflowDetails: React.FC<ViewWorkflowDetailsProps> = ({selectedWorkflow}) => {
    return <div className="card flex flex-col gap-4">
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
                            <span className="text-caption" style={{color: "var(--color-text-secondary-light)"}}>{stage.name}</span>
                            <span className="text-caption" style={{color: "var(--color-text-secondary-light)"}}>{stage.status}</span>
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
                        style={{ background: "var(--color-background-secondary)", color: "var(--color-text-secondary-light)" }}
                    >
                        {logMessage}
                    </li>
                ))}
            </ul>
        </div>
    </div>;
}

export default ViewWorkflowDetails;