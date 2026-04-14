import type React from "react";
import { useState, useEffect } from "react";
import type { OrganizationOut } from "../../../../interfaces/organization.interface";

interface ManageOrganizationDetailsProps {
    editingOrg: OrganizationOut | null;
    onSave: (data: { name: string; description: string }) => Promise<void>;
    onCancel: () => void;
}

const ManageOrganizationDetails: React.FC<ManageOrganizationDetailsProps> = ({
    editingOrg,
    onSave,
    onCancel,
}) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingOrg) {
            setName(editingOrg.name);
            setDescription(editingOrg.description ?? "");
        } else {
            setName("");
            setDescription("");
        }
    }, [editingOrg]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ name, description });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card">
            <h4
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >
                {editingOrg ? "Update Organization" : "Create Organization"}
            </h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="input-group">
                    <label className="input-label" htmlFor="org-name">
                        Name
                    </label>
                    <input
                        id="org-name"
                        className="input"
                        type="text"
                        placeholder="Organization name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={!!editingOrg}
                    />
                    {editingOrg && (
                        <span className="input-helper-text">
                            Organization name cannot be changed after creation.
                        </span>
                    )}
                </div>
                <div className="input-group">
                    <label className="input-label" htmlFor="org-description">
                        Description
                    </label>
                    <input
                        id="org-description"
                        className="input"
                        type="text"
                        placeholder="Organization description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving || !name.trim()}
                    >
                        {isSaving
                            ? "Saving…"
                            : editingOrg
                            ? "Update"
                            : "Create"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageOrganizationDetails;
