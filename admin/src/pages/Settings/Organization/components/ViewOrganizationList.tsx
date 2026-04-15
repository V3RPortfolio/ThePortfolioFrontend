import type React from "react";
import type { OrganizationOut } from "../../../../interfaces/organization.interface";
import DataTable from "../../../../components/Table/DataTable";

interface ViewOrganizationListProps {
    organizations: OrganizationOut[];
    onSelect: (org: OrganizationOut) => void;
    onEdit: (org: OrganizationOut) => void;
    onDelete: (org: OrganizationOut) => void;
    onLeave: (org: OrganizationOut) => void;
}

const ViewOrganizationList: React.FC<ViewOrganizationListProps> = ({
    organizations,
    onSelect,
    onEdit,
    onDelete,
    onLeave
}) => {
    return (
        <DataTable 
            title="Your Organization"
            columns={[
                { name: "Name", key: "name" },
                { name: "Description", key: "description" },
                { name: "Status", key: "status" },
                { name: "Created At", key: "createdAt" }
            ]}
            pagination={[{pageNumber: 1, isActive: true}]}
            totalPages={1}
            clipLongText={true}
            actions={[
                { name: "Select", className: "btn btn-primary btn-sm", handler: (org) => onSelect(org as OrganizationOut)},
                { name: "Edit", className: "btn btn-tertiary btn-sm", handler: (org) => onEdit(org as OrganizationOut)},
                { name: "Delete", className: "btn btn-secondary btn-sm text text-error", handler: (org) => onDelete(org as OrganizationOut)},
                { name: "Leave", className: "btn btn-secondary btn-sm text text-error", handler: (org) => onLeave(org as OrganizationOut)},
            ]}
            data={organizations.map(org => ({
                name: org.name,
                description: org.description ?? "—",
                status: org.status,
                createdAt: new Date(org.created_at).toLocaleDateString(),
                id: org.id
            }))}
        />
    );
};

export default ViewOrganizationList;
