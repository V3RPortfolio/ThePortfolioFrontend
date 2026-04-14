import type React from "react";
import { useState } from "react";
import type { OrganizationRoleType } from "../../../../interfaces/organization.interface";

const ROLE_OPTIONS: OrganizationRoleType[] = ["admin", "owner", "manager", "editor", "viewer"];

interface InviteUserProps {
    orgId: string;
    onInvite: (email: string, role: OrganizationRoleType) => Promise<void>;
}

const InviteUser: React.FC<InviteUserProps> = ({ orgId, onInvite }) => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<OrganizationRoleType>("viewer");
    const [isInviting, setIsInviting] = useState(false);

    if (!orgId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            await onInvite(email, role);
            setEmail("");
            setRole("viewer");
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="card">
            <h4
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >
                Invite User
            </h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="input-group">
                    <label className="input-label" htmlFor="invite-email">
                        Email Address
                    </label>
                    <input
                        id="invite-email"
                        className="input"
                        type="email"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="input-label" htmlFor="invite-role">
                        Role
                    </label>
                    <select
                        id="invite-role"
                        className="input"
                        value={role}
                        onChange={(e) => setRole(e.target.value as OrganizationRoleType)}
                    >
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isInviting || !email.trim()}
                    >
                        {isInviting ? "Inviting…" : "Invite User"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InviteUser;
