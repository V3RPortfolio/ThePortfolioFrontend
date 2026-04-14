import type React from "react";
import { useState } from "react";
import type {
    OrganizationRoleType,
    OrganizationUserOut,
} from "../../../../interfaces/organization.interface";

const ROLE_OPTIONS: OrganizationRoleType[] = ["admin", "owner", "manager", "editor", "viewer"];

interface ViewOrganizationUsersProps {
    users: OrganizationUserOut[];
    onUpdateRole: (userEmail: string, role: OrganizationRoleType) => Promise<void>;
    onRemoveUser: (userEmail: string) => Promise<void>;
}

const ViewOrganizationUsers: React.FC<ViewOrganizationUsersProps> = ({
    users,
    onUpdateRole,
    onRemoveUser,
}) => {
    const [editingEmail, setEditingEmail] = useState<string | null>(null);
    const [pendingRole, setPendingRole] = useState<OrganizationRoleType>("viewer");
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    const handleStartEdit = (user: OrganizationUserOut) => {
        setEditingEmail(user.email);
        setPendingRole(user.role as OrganizationRoleType);
    };

    const handleSaveRole = async (email: string) => {
        setActionInProgress(email);
        try {
            await onUpdateRole(email, pendingRole);
            setEditingEmail(null);
        } finally {
            setActionInProgress(null);
        }
    };

    const handleRemove = async (email: string) => {
        setActionInProgress(email);
        try {
            await onRemoveUser(email);
        } finally {
            setActionInProgress(null);
        }
    };

    return (
        <div className="card overflow-hidden p-0">
            <h4
                className="px-5 py-3 text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Organization Users
            </h4>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-gray-100)" }}>
                            {["Email", "Role", "Invitation Status", "Joined At", "Actions"].map(
                                (heading) => (
                                    <th
                                        key={heading}
                                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                            borderBottom: "1px solid var(--color-border)",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-12 text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user, idx) => {
                                const isEditing = editingEmail === user.email;
                                const isBusy = actionInProgress === user.email;
                                return (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderBottom:
                                                idx < users.length - 1
                                                    ? "1px solid var(--color-border)"
                                                    : "none",
                                            backgroundColor:
                                                idx % 2 !== 0
                                                    ? "var(--color-gray-50)"
                                                    : "transparent",
                                        }}
                                    >
                                        <td
                                            className="px-5 py-3 text-sm whitespace-nowrap"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            <span className="block max-w-xs truncate" title={user.email}>
                                                {user.email}
                                            </span>
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm whitespace-nowrap"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {isEditing ? (
                                                <select
                                                    className="input input-sm"
                                                    value={pendingRole}
                                                    onChange={(e) =>
                                                        setPendingRole(
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
                                            ) : (
                                                user.role.charAt(0).toUpperCase() + user.role.slice(1)
                                            )}
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm whitespace-nowrap"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {user.invitation_status}
                                        </td>
                                        <td
                                            className="px-5 py-3 text-sm whitespace-nowrap"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3 text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleSaveRole(user.email)}
                                                            disabled={isBusy}
                                                        >
                                                            {isBusy ? "Saving…" : "Save"}
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => setEditingEmail(null)}
                                                            disabled={isBusy}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="btn btn-tertiary btn-sm"
                                                            onClick={() => handleStartEdit(user)}
                                                            disabled={!!actionInProgress}
                                                        >
                                                            Edit Role
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleRemove(user.email)}
                                                            disabled={!!actionInProgress}
                                                            style={{ color: "var(--color-error)" }}
                                                        >
                                                            {isBusy ? "Removing…" : "Remove"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewOrganizationUsers;
