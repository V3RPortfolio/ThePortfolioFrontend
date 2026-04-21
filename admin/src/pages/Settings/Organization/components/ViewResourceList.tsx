import type React from "react";
import type { ResourceIndexDto } from "../../../../interfaces/organization.interface";
import DataTable from "../../../../components/Table/DataTable";

interface ViewResourceListProps {
    indices: ResourceIndexDto[];
}

const ViewResourceList: React.FC<ViewResourceListProps> = ({ indices }) => {
    return (
        <DataTable
            title="Provisioned Resources"
            columns={[
                { name: "Name", key: "name" },
                { name: "Major Version", key: "major_version" },
                { name: "Minor Version", key: "minor_version" },
                { name: "Patch Version", key: "patch_version" },
                { name: "Provision Status", key: "provision_status" },
                { name: "Last Provisioned At", key: "last_attempted_provisioned_at" },
            ]}
            pagination={[{ pageNumber: 1, isActive: true }]}
            totalPages={1}
            clipLongText={true}
            data={indices.map((index) => ({
                name: index.name,
                major_version: index.major_version,
                minor_version: index.minor_version,
                patch_version: index.patch_version,
                provision_status: index.provision_status ?? "—",
                last_attempted_provisioned_at: index.last_attempted_provisioned_at
                    ? new Date(index.last_attempted_provisioned_at).toLocaleString()
                    : "—",
            }))}
        />
    );
};

export default ViewResourceList;
