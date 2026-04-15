import { useEffect, useState } from "react";
import { type OrganizationRoleType, type OrganizationUserOut } from "../../../../interfaces/organization.interface";

interface ManageOrganizationUserProps {
    editingUser: OrganizationUserOut;
    onSave: (data: OrganizationUserOut) => Promise<void>;
    onCancel: () => void;
}

const ROLE_OPTIONS: OrganizationRoleType[] = ["admin", "owner", "manager", "editor", "viewer"];

const ManageOrganizationUser: React.FC<ManageOrganizationUserProps> = ({
    editingUser,
    onSave,
    onCancel,
}) => {
    const [role, setRole] = useState<OrganizationRoleType>("viewer");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setRole(editingUser.role as OrganizationRoleType);
    }, [editingUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ ...editingUser, role: role.toString() });
        } finally {
            setIsSaving(false);
        }
    };

    return (<div className="card">
            <h4
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >Update User Configuration</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="input-group">
                    <label className="input-label" htmlFor="org-name">
                        Email
                    </label>
                    <span className="input input-sm bg-gray-100 cursor-not-allowed" style={{ width: "100%" }}>
                        {editingUser.email}
                    </span>
                </div>
                <div className="input-group">
                    <label className="input-label" htmlFor="org-name">
                        Role
                    </label>
                    <select
                        className="input input-sm"
                        value={editingUser.role}
                        onChange={(e) =>
                            setRole(
                                e.target.value as OrganizationRoleType
                            )
                        }
                        style={{ width: "auto" }}
                    >
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving || !role.trim()}
                    >Update</button>
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
        </div>);
};

export default ManageOrganizationUser;