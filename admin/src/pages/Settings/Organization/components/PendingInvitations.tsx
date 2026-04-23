import type React from "react";
import { useCallback, useEffect, useState } from "react";
import organizationService from "../../../../services/organization.service";
import { useToast } from "../../../../contexts/toast.context";
import type { OrganizationInvitationOut } from "../../../../interfaces/organization.interface";
import DataTable from "../../../../components/Table/DataTable";


interface PendingInvitationsProps {
    onResponse?: (orgId: string, accept: boolean) => void;
}

const PendingInvitationsComponent:React.FC<PendingInvitationsProps> = ({ onResponse }) => {
    // const [currentPage, setCurrentPage] = useState<number>(1);
    // const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const [invitations, setInvitations] = useState<OrganizationInvitationOut[]>([]); // Replace 'any' with your actual invitation type

    const  { addToast } = useToast();


    const fetchInvitations = useCallback(async () => {
        if(loading) return; // Prevent multiple simultaneous fetches
        setLoading(true);
        try {
            const data = await organizationService.listInvitations();
            setInvitations(data);
        } catch {
            // Handle error
            addToast({
                message: "Failed to load pending invitations",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleResponse = async (organizationId: string, accept: boolean) => {
        try {
            await organizationService.respondToInvitation(organizationId, accept);
            addToast({
                message: accept ? "Invitation accepted" : "Invitation declined",
                type: "success",
            });
            fetchInvitations(); // Refresh the list after responding
            if(onResponse) {
                onResponse(organizationId, accept);   
            }
        } catch {
            addToast({
                message: "Failed to respond to invitation",
                type: "error",
            });
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, [])

    return (!loading && <DataTable 
        title="Pending Invitations"
        columns={[
            { name: "Organization Name", key: "organization_name" },
            { name: "Invited By", key: "invited_by" },
            { name: "Role", key: "role" },
            { name: "Invited At", key: "created_at" },
        ]}
        data={invitations}
        pagination={[{ pageNumber: 1, isActive: true }]} // Implement actual pagination logic as needed
        totalPages={1} // Set this based on actual data
        actions={[
            { name: "Accept", className: "btn btn-primary btn-sm", handler: (inv) => handleResponse((inv as OrganizationInvitationOut).organization_id, true) },
            { name: "Decline", className: "btn btn-secondary btn-sm text text-error", handler: (inv) => handleResponse((inv as OrganizationInvitationOut).organization_id, false) },
        ]}
        
    />);
}

export default PendingInvitationsComponent;