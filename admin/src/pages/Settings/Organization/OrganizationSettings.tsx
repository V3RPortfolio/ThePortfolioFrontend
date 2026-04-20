import type React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
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
import { ToastContext } from "../../../contexts/toast.context";
import ManageOrganizationUser from "./components/ManageOrganizationUser";
import PendingInvitationsComponent from "./components/PendingInvitations";
import { useOrganization } from "../../../contexts/organization.context";
import InformationModal from "../../../components/Modals/Information";



const OrganizationSettingsPage: React.FC = () => {
    const [orgUsers, setOrgUsers] = useState<OrganizationUserOut[]>([]);

    const { selectedOrg, selectOrg, clearSelectedOrg, organizations, updateOrganizationsList } = useOrganization();
    const [editingOrg, setEditingOrg] = useState<OrganizationOut | null>(null);
    const [showOrgForm, setShowOrgForm] = useState(false);

    const [editingUser, setEditingUser] = useState<OrganizationUserOut | null>(null);
    const [showUserForm, setShowUserForm] = useState(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);

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

    useEffect(() => {
        if (selectedOrg) {
            fetchUsers(selectedOrg.id);
        } else {
            setOrgUsers([]);
        }
    }, [selectedOrg, fetchUsers]);

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
                        {selectedOrg && <button className="btn btn-tertiary" onClick={() => setShowPaymentModal(true)}>
                            Provision resources
                        </button>}
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
                    </>
                )}

                {showPaymentModal && <InformationModal
                title="Online payment currently unavailable"
                description="We're excited to have you use our platform to provision resources and manage your documents. At the moment, our online payment processing feature is still under development and is not yet available. This means that while you can explore the application and set up resources, payment-related actions cannot be completed at this time. We're actively working to enable this feature and will notify you as soon as it becomes available. Thank you for your patience and understanding."
                onAccept={() => setShowPaymentModal(false)}
                onCancel={() => setShowPaymentModal(false)}
                />}
            </div>
        </>
    );
};

export default OrganizationSettingsPage;
