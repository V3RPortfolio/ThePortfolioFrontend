import type React from "react";
import type { DeviceConfigurationOut } from "../../../../interfaces/device.interface";
import DataTable from "../../../../components/Table/DataTable";

interface ViewConfigurationListProps {
    configurations: DeviceConfigurationOut[];
    onRemove: (config: DeviceConfigurationOut) => void;
}

const ViewConfigurationList: React.FC<ViewConfigurationListProps> = ({
    configurations,
    onRemove,
}) => {
    return (
        <DataTable
            title="Device Configurations"
            columns={[
                { name: "Data Type", key: "data_type" },
                { name: "Created At", key: "createdAt" },
                { name: "Updated At", key: "updatedAt" },
            ]}
            pagination={[{ pageNumber: 1, isActive: true }]}
            totalPages={1}
            clipLongText={true}
            actions={[
                { name: "Remove", className: "btn btn-secondary btn-sm text text-error", handler: (row) => onRemove(row as DeviceConfigurationOut) },
            ]}
            data={configurations.map((config) => ({
                ...config,
                createdAt: new Date(config.created_at).toLocaleDateString(),
                updatedAt: new Date(config.updated_at).toLocaleDateString(),
            }))}
        />
    );
};

export default ViewConfigurationList;