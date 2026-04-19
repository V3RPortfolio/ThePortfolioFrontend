import type React from "react";
import type { DeviceOut } from "../../../../interfaces/device.interface";
import DataTable from "../../../../components/Table/DataTable";

interface ViewDeviceListProps {
    devices: DeviceOut[];
    onSelect: (device: DeviceOut) => void;
    onDeactivate: (device: DeviceOut) => void;
    onDelete: (device: DeviceOut) => void;
}

const ViewDeviceList: React.FC<ViewDeviceListProps> = ({
    devices,
    onSelect,
    onDeactivate,
    onDelete,
}) => {
    return (
        <DataTable
            title="Organization Devices"
            columns={[
                { name: "Name", key: "name" },
                { name: "Description", key: "description" },
                { name: "Device Type", key: "device_type" },
                { name: "Status", key: "status" },
                { name: "Created At", key: "createdAt" },
            ]}
            pagination={[{ pageNumber: 1, isActive: true }]}
            totalPages={1}
            clipLongText={true}
            actions={[
                { name: "Select", className: "btn btn-primary btn-sm", handler: (row) => onSelect(row as DeviceOut) },
                { name: "Deactivate", className: "btn btn-tertiary btn-sm", handler: (row) => onDeactivate(row as DeviceOut) },
                { name: "Delete", className: "btn btn-secondary btn-sm text text-error", handler: (row) => onDelete(row as DeviceOut) },
            ]}
            data={devices.map((device) => ({
                ...device,
                description: device.description ?? "—",
                status: device.is_active ? "Active" : "Inactive",
                createdAt: new Date(device.created_at).toLocaleDateString(),
            }))}
        />
    );
};

export default ViewDeviceList;