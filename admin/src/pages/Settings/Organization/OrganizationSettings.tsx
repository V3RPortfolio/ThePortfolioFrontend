import type React from "react";
import { useCallback, useEffect, useState } from "react";
import organizationService from "../../../services/organization.service";
import type {
    OrganizationOut,
    OrganizationRoleType,
    OrganizationUserOut
} from "../../../interfaces/organization.interface";
import ViewOrganizationList from "./components/ViewOrganizationList";
import ManageOrganizationDetails from "./components/ManageOrganizationDetails";
import InviteUser from "./components/InviteUser";
import ViewOrganizationUsers from "./components/ViewOrganizationUsers";
import { useToast } from "../../../contexts/toast.context";
import ManageOrganizationUser from "./components/ManageOrganizationUser";
import PendingInvitationsComponent from "./components/PendingInvitations";
import { useOrganization } from "../../../contexts/organization.context";
import ViewResourceList from "./components/ViewResourceList";



const OrganizationSettingsPage: React.FC = () => {
    const [orgUsers, setOrgUsers] = useState<OrganizationUserOut[]>([]);

    const { 
        selectedOrg, 
        selectOrg, 
        clearSelectedOrg, 
        organizations, 
        updateOrganizationsList, 
        provisionResource,
        deprovisionResource
    } = useOrganization();
    const [editingOrg, setEditingOrg] = useState<OrganizationOut | null>(null);
    const [showOrgForm, setShowOrgForm] = useState(false);

    const [editingUser, setEditingUser] = useState<OrganizationUserOut | null>(null);
    const [showUserForm, setShowUserForm] = useState(false);

    const [isProvisioningResource, setIsProvisioningResource] = useState(false);

    const { addToast } = useToast();

    const extractErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return String(err);
    };

    const fetchUsers = useCallback(async (orgId: string) => {
        const data = await organizationService.listOrganizationUsers(orgId);
        setOrgUsers(data);
    }, []);

    const handleSelectOrg = async (org: OrganizationOut) => {
        try {
            await selectOrg(org.id);
            addToast({message: `Selected organization "${org.name}"`, type: "success"});
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleDeleteOrg = async (org: OrganizationOut) => {
        try {
            await organizationService.deleteOrganization(org.id);
            if (selectedOrg?.info.id === org.id) {
                clearSelectedOrg();
            }
            addToast({message: `Deleted organization "${org.name}"`, type: "success"});
            updateOrganizationsList();
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
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
                addToast({message: `Updated organization "${editingOrg.name}"`, type: "success"});
            } else {
                await organizationService.createOrganization({
                    name: data.name,
                    description: data.description || null,
                });
                addToast({message: `Created organization "${data.name}"`, type: "success"});
            }
            setShowOrgForm(false);
            setEditingOrg(null);
            
            setTimeout(() => {
                updateOrganizationsList();
            }, 500);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleCancelOrgForm = () => {
        setShowOrgForm(false);
        setEditingOrg(null);
    };

    const handleInviteUser = async (email: string, role: OrganizationRoleType) => {
        if (!selectedOrg) return;
        try {
            await organizationService.inviteUser(selectedOrg.info.id, { email, role });
            addToast({message: `Invited "${email}" to the organization`, type: "success"});
            fetchUsers(selectedOrg.info.id);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleUpdateUserRole = async (userEmail: string, role: OrganizationRoleType) => {
        if (!selectedOrg) return;
        try {
            await organizationService.updateOrganizationUserRole(selectedOrg.info.id, userEmail, { role });
            addToast({message: `Updated role for "${userEmail}"`, type: "success"});
            fetchUsers(selectedOrg.info.id);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
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
            await organizationService.removeOrganizationUser(selectedOrg.info.id, userEmail);
            addToast({message: `Removed "${userEmail}" from the organization`, type: "success"});
            fetchUsers(selectedOrg.info.id);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleLeaveOrg = async (org: OrganizationOut) => {
        try {
            await organizationService.leaveOrganization(org.id);
            if (selectedOrg?.info.id === org.id) {
                clearSelectedOrg();
            }
            addToast({message: `Left organization "${org.name}"`, type: "success"});
            updateOrganizationsList();
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    }

    const handleCreateAndProvisionResource = async () => {
        setIsProvisioningResource(true);
        const provisioned = await provisionResource();
        if(!provisioned.success) {
            addToast({message: provisioned.message, type: "error"});
        } else {
            addToast({message: provisioned.message, type: "success"});
            
        }
        setIsProvisioningResource(false);
    };

    const handleDeprovisionResource = async () => {
        setIsProvisioningResource(true);
        const deprovisioned = await deprovisionResource();
        if(!deprovisioned.success) {
            addToast({message: deprovisioned.message, type: "error"});
        } else {
            addToast({message: deprovisioned.message, type: "success"});
        }
        setIsProvisioningResource(false);
    };

    useEffect(() => {
        updateOrganizationsList();
        if (selectedOrg) {
            fetchUsers(selectedOrg.info.id);
        } else {
            setOrgUsers([]);
        }
    }, [selectedOrg, fetchUsers]);

    return (
        <>
            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between">
                    <h2 className="text-title">Organization Settings</h2>
                    <div className="flex flex-row flex-wrap button-container gap-2  mt-2 md:mt-0 w-full md:w-auto">
                        {!showOrgForm && (
                            <button
                                className="btn btn-primary w-full md:w-auto"
                                onClick={() => {
                                    setEditingOrg(null);
                                    setShowOrgForm(true);
                                }}
                            >
                                New Organization
                            </button>
                        )}
                        {selectedOrg && !selectedOrg?.resource?.indices?.length ? (
                            <button
                                className="btn btn-tertiary w-full md:w-auto"
                                onClick={handleCreateAndProvisionResource}
                                disabled={isProvisioningResource}
                            >
                                {isProvisioningResource ? "Provisioning…" : !!selectedOrg?.resource ? 'Re-provision resources' : "Provision resources"}
                            </button>
                        ):null}
                        {selectedOrg && selectedOrg?.resource?.indices?.length ? (
                            <button
                                className="btn bg-red-100 hover:bg-red-200 text-red-700 w-full md:w-auto"
                                onClick={handleDeprovisionResource}
                                disabled={isProvisioningResource}
                            >
                                {isProvisioningResource ? "Provisioning…" : "De-provision resources"}
                            </button>
                        ): null}
                    </div>

                </div>

                {showOrgForm ? (
                    <ManageOrganizationDetails
                        editingOrg={editingOrg}
                        onSave={handleSaveOrg}
                        onCancel={handleCancelOrgForm}
                    />
                ):null}

                <ViewOrganizationList
                    organizations={organizations.map(x => x.info)}
                    onSelect={handleSelectOrg}
                    onEdit={handleEditOrg}
                    onDelete={handleDeleteOrg}
                    onLeave={handleLeaveOrg}
                />

                {selectedOrg && selectedOrg?.resource?.indices?.length ? <div>
                    <hr className="divider" />
                    <ViewResourceList indices={selectedOrg.resource.indices} />
                </div>:null}

                <div>
                    <hr className="divider" />
                    <PendingInvitationsComponent
                        onResponse={(orgId, accept) => {
                            console.info("Invitation response for orgId:", orgId, "accepted:", accept);
                            if (accept) updateOrganizationsList();
                        }}
                    />
                </div>

                {selectedOrg && (
                    <>
                        <hr className="divider" />
                        <h3
                            className="text-heading"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Managing: {selectedOrg.info.name}
                        </h3>

                        <InviteUser
                            orgId={selectedOrg.info.id}
                            onInvite={handleInviteUser}
                        />

                        {showUserForm && editingUser ? (
                            <ManageOrganizationUser
                                editingUser={editingUser}
                                onSave={handleSaveOrgUser}
                                onCancel={handleCancelOrgUserForm}
                            />
                        ):null}

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
                    </>
                )}
            </div>
        </>
    );
};

export default OrganizationSettingsPage;
