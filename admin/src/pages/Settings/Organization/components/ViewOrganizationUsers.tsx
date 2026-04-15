import type React from "react";
import type {
    OrganizationUserOut,
} from "../../../../interfaces/organization.interface";
import DataTable from "../../../../components/Table/DataTable";

interface ViewOrganizationUsersProps {
    users: OrganizationUserOut[];
    onUpdateRole: (user:OrganizationUserOut) => Promise<void>;
    onRemoveUser: (user:OrganizationUserOut) => Promise<void>;
}

const ViewOrganizationUsers: React.FC<ViewOrganizationUsersProps> = ({
    users,
    onUpdateRole,
    onRemoveUser,
}) => {

    return (<DataTable 
        title="Organization Users"
        columns={[
            { name: "Email", key: "email" }, 
            { name: "Role", key: "role" }, 
            { name: "Invitation Status", key: "invitation_status" }, 
            { name: "Joined At", key: "created_at" }
        ]}
        pagination={[{pageNumber: 1, isActive: true}]}
        totalPages={1}
        clipLongText={true}
        actions={[
            { name: "Edit Role", className: "btn btn-tertiary btn-sm", handler: (user) => onUpdateRole(user as OrganizationUserOut)},
            { name: "Remove", className: "btn btn-secondary btn-sm text text-error", handler: (user) => onRemoveUser(user as OrganizationUserOut)},
        ]}
        data={users}
    />)
};

export default ViewOrganizationUsers;
