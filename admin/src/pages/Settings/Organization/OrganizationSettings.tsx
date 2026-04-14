import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import organizationService from "../../../services/organization.service";
import type {
    OrganizationOut,
    OrganizationRoleType,
    OrganizationUserOut,
} from "../../../interfaces/organization.interface";
import ViewOrganizationList from "./components/ViewOrganizationList";
import ManageOrganizationDetails from "./components/ManageOrganizationDetails";
import InviteUser from "./components/InviteUser";
import ViewOrganizationUsers from "./components/ViewOrganizationUsers";

const TOAST_DURATION = 4000;

interface Toast {
    id: number;
    message: string;
    type: "success" | "error";
}

const OrganizationSettingsPage: React.FC = () => {
    const [organizations, setOrganizations] = useState<OrganizationOut[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationOut | null>(null);
    const [orgUsers, setOrgUsers] = useState<OrganizationUserOut[]>([]);
    const [editingOrg, setEditingOrg] = useState<OrganizationOut | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toastCounterRef = useRef(0);
    const addToast = (message: string, type: "success" | "error") => {
        const id = ++toastCounterRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_DURATION);
    };

    const extractErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return String(err);
    };

    const fetchOrganizations = useCallback(async () => {
        const data = await organizationService.listOrganizations();
        setOrganizations(data);
    }, []);

    const fetchUsers = useCallback(async (orgId: string) => {
        const data = await organizationService.listOrganizationUsers(orgId);
        setOrgUsers(data);
    }, []);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    useEffect(() => {
        if (selectedOrg) {
            fetchUsers(selectedOrg.id);
        } else {
            setOrgUsers([]);
        }
    }, [selectedOrg, fetchUsers]);

    const handleSelectOrg = async (org: OrganizationOut) => {
        try {
            await organizationService.selectOrganization(org.id);
            setSelectedOrg(org);
            addToast(`Selected organization "${org.name}"`, "success");
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleDeleteOrg = async (org: OrganizationOut) => {
        try {
            await organizationService.deleteOrganization(org.id);
            if (selectedOrg?.id === org.id) {
                setSelectedOrg(null);
            }
            addToast(`Deleted organization "${org.name}"`, "success");
            fetchOrganizations();
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleEditOrg = (org: OrganizationOut) => {
        setEditingOrg(org);
        setShowForm(true);
    };

    const handleSaveOrg = async (data: { name: string; description: string }) => {
        try {
            if (editingOrg) {
                await organizationService.updateOrganization(editingOrg.id, {
                    description: data.description || null,
                });
                addToast(`Updated organization "${editingOrg.name}"`, "success");
            } else {
                await organizationService.createOrganization({
                    name: data.name,
                    description: data.description || null,
                });
                addToast(`Created organization "${data.name}"`, "success");
            }
            setShowForm(false);
            setEditingOrg(null);
            fetchOrganizations();
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingOrg(null);
    };

    const handleInviteUser = async (email: string, role: OrganizationRoleType) => {
        if (!selectedOrg) return;
        try {
            await organizationService.addOrganizationUser(selectedOrg.id, { email, role });
            addToast(`Invited "${email}" to the organization`, "success");
            fetchUsers(selectedOrg.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleUpdateUserRole = async (userEmail: string, role: OrganizationRoleType) => {
        if (!selectedOrg) return;
        try {
            await organizationService.updateOrganizationUserRole(selectedOrg.id, userEmail, { role });
            addToast(`Updated role for "${userEmail}"`, "success");
            fetchUsers(selectedOrg.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleRemoveUser = async (userEmail: string) => {
        if (!selectedOrg) return;
        try {
            await organizationService.removeOrganizationUser(selectedOrg.id, userEmail);
            addToast(`Removed "${userEmail}" from the organization`, "success");
            fetchUsers(selectedOrg.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-title">Organization Settings</h2>
                    {!showForm && (
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setEditingOrg(null);
                                setShowForm(true);
                            }}
                        >
                            New Organization
                        </button>
                    )}
                </div>

                {showForm && (
                    <ManageOrganizationDetails
                        editingOrg={editingOrg}
                        onSave={handleSaveOrg}
                        onCancel={handleCancelForm}
                    />
                )}

                <ViewOrganizationList
                    organizations={organizations}
                    selectedOrgId={selectedOrg?.id ?? null}
                    onSelect={handleSelectOrg}
                    onEdit={handleEditOrg}
                    onDelete={handleDeleteOrg}
                />

                {selectedOrg && (
                    <>
                        <hr className="divider" />
                        <h3
                            className="text-heading"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Managing: {selectedOrg.name}
                        </h3>

                        <InviteUser
                            orgId={selectedOrg.id}
                            onInvite={handleInviteUser}
                        />

                        <ViewOrganizationUsers
                            users={orgUsers}
                            onUpdateRole={handleUpdateUserRole}
                            onRemoveUser={handleRemoveUser}
                        />
                    </>
                )}
            </div>

            {/* Toast notifications */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2" style={{ zIndex: 9999 }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="card flex items-center gap-3 px-5 py-3 text-sm"
                        style={{
                            backgroundColor:
                                toast.type === "error"
                                    ? "var(--color-error-light)"
                                    : "var(--color-tertiary-100)",
                            color:
                                toast.type === "error"
                                    ? "var(--color-error)"
                                    : "var(--color-tertiary-700)",
                            minWidth: "260px",
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </>
    );
};

export default OrganizationSettingsPage;
