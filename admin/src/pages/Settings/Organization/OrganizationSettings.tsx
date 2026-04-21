import type React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import organizationService from "../../../services/organization.service";
import type {
    OrganizationOut,
    OrganizationRoleType,
    OrganizationUserOut,
    ResourceDto,
} from "../../../interfaces/organization.interface";
import ViewOrganizationList from "./components/ViewOrganizationList";
import ManageOrganizationDetails from "./components/ManageOrganizationDetails";
import InviteUser from "./components/InviteUser";
import ViewOrganizationUsers from "./components/ViewOrganizationUsers";
import { ToastContext } from "../../../contexts/toast.context";
import ManageOrganizationUser from "./components/ManageOrganizationUser";
import PendingInvitationsComponent from "./components/PendingInvitations";
import { useOrganization } from "../../../contexts/organization.context";
import ViewResourceList from "./components/ViewResourceList";



const OrganizationSettingsPage: React.FC = () => {
    const [orgUsers, setOrgUsers] = useState<OrganizationUserOut[]>([]);

    const { selectedOrg, selectOrg, clearSelectedOrg, organizations, updateOrganizationsList } = useOrganization();
    const [editingOrg, setEditingOrg] = useState<OrganizationOut | null>(null);
    const [showOrgForm, setShowOrgForm] = useState(false);

    const [editingUser, setEditingUser] = useState<OrganizationUserOut | null>(null);
    const [showUserForm, setShowUserForm] = useState(false);

    const [resource, setResource] = useState<ResourceDto | null>(null);
    const [isProvisioningResource, setIsProvisioningResource] = useState(false);

    const toastContext = useContext(ToastContext);

    const addToast = useCallback((message: string, type: "success" | "error") => {
        if (toastContext?.addToast) {
            toastContext.addToast({ message, type });
        }
    }, [toastContext]);

    const extractErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return String(err);
    };

    const fetchUsers = useCallback(async (orgId: string) => {
        const data = await organizationService.listOrganizationUsers(orgId);
        setOrgUsers(data);
    }, []);

    const fetchResource = useCallback(async (orgId: string) => {
        const data = await organizationService.getResource(orgId);
        setResource(data);
    }, []);

    useEffect(() => {
        if (selectedOrg) {
            fetchUsers(selectedOrg.id);
            fetchResource(selectedOrg.id);
        } else {
            setOrgUsers([]);
            setResource(null);
        }
    }, [selectedOrg, fetchUsers, fetchResource]);

    const handleSelectOrg = async (org: OrganizationOut) => {
        try {
            await selectOrg(org);
            addToast(`Selected organization "${org.name}"`, "success");
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleDeleteOrg = async (org: OrganizationOut) => {
        try {
            await organizationService.deleteOrganization(org.id);
            if (selectedOrg?.id === org.id) {
                clearSelectedOrg();
            }
            addToast(`Deleted organization "${org.name}"`, "success");
            updateOrganizationsList();
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleEditOrg = (org: OrganizationOut) => {
        setEditingOrg(org);
        setShowOrgForm(true);
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
            setShowOrgForm(false);
            setEditingOrg(null);
            updateOrganizationsList();
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleCancelOrgForm = () => {
        setShowOrgForm(false);
        setEditingOrg(null);
    };

    const handleInviteUser = async (email: string, role: OrganizationRoleType) => {
        if (!selectedOrg) return;
        try {
            await organizationService.inviteUser(selectedOrg.id, { email, role });
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

    const handleSaveOrgUser = async (data: OrganizationUserOut) => {
        if (!selectedOrg) return;
        handleUpdateUserRole(data.email, data.role as OrganizationRoleType);
    };

    const handleCancelOrgUserForm = () => {
        setShowUserForm(false);
        setEditingUser(null);
    }

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

    const handleLeaveOrg = async (org: OrganizationOut) => {
        try {
            await organizationService.leaveOrganization(org.id);
            if (selectedOrg?.id === org.id) {
                clearSelectedOrg();
            }
            addToast(`Left organization "${org.name}"`, "success");
            updateOrganizationsList();
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    }

    const handleCreateAndProvisionResource = async () => {
        if (!selectedOrg) return;
        setIsProvisioningResource(true);
        try {
            const created = await organizationService.createResource(selectedOrg.id, {
                organization_id: selectedOrg.id,
                name: selectedOrg.name,
                is_active: true
            });
            setResource(created);
            addToast(`Created resource for "${selectedOrg.name}"`, "success");
            await organizationService.provisionResource(selectedOrg.id);
            addToast(`Provisioning started for "${selectedOrg.name}"`, "success");
            fetchResource(selectedOrg.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        } finally {
            setIsProvisioningResource(false);
        }
    };

    const handleProvisionResource = async () => {
        if (!selectedOrg) return;
        setIsProvisioningResource(true);
        try {
            await organizationService.provisionResource(selectedOrg.id);
            addToast(`Provisioning started for "${selectedOrg.name}"`, "success");
            fetchResource(selectedOrg.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        } finally {
            setIsProvisioningResource(false);
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between">
                    <h2 className="text-title">Organization Settings</h2>
                    <div className="flex flex-row flex-wrap button-container gap-2">
                        {!showOrgForm && (
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setEditingOrg(null);
                                    setShowOrgForm(true);
                                }}
                            >
                                New Organization
                            </button>
                        )}
                        {selectedOrg && !resource && (
                            <button
                                className="btn btn-tertiary"
                                onClick={handleCreateAndProvisionResource}
                                disabled={isProvisioningResource}
                            >
                                {isProvisioningResource ? "Provisioning…" : "Provision resources"}
                            </button>
                        )}
                        {selectedOrg && resource && (
                            <button
                                className="btn btn-tertiary"
                                onClick={handleProvisionResource}
                                disabled={isProvisioningResource}
                            >
                                {isProvisioningResource ? "Provisioning…" : "Re-provision resources"}
                            </button>
                        )}
                    </div>

                </div>

                {showOrgForm && (
                    <ManageOrganizationDetails
                        editingOrg={editingOrg}
                        onSave={handleSaveOrg}
                        onCancel={handleCancelOrgForm}
                    />
                )}

                <ViewOrganizationList
                    organizations={organizations}
                    onSelect={handleSelectOrg}
                    onEdit={handleEditOrg}
                    onDelete={handleDeleteOrg}
                    onLeave={handleLeaveOrg}
                />

                <PendingInvitationsComponent
                    onResponse={(orgId, accept) => {
                        console.info("Invitation response for orgId:", orgId, "accepted:", accept);
                        if (accept) updateOrganizationsList();
                    }}
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

                        {showUserForm && editingUser && (
                            <ManageOrganizationUser
                                editingUser={editingUser}
                                onSave={handleSaveOrgUser}
                                onCancel={handleCancelOrgUserForm}
                            />
                        )}

                        <ViewOrganizationUsers
                            users={orgUsers}
                            onUpdateRole={async (user) => {
                                setEditingUser(user);
                                setShowUserForm(true);
                            }}
                            onRemoveUser={async (user) => {
                                await handleRemoveUser(user.email);
                            }}
                        />

                        {resource && resource.indices && resource.indices.length > 0 && (
                            <>
                                <hr className="divider" />
                                <ViewResourceList indices={resource.indices} />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default OrganizationSettingsPage;
