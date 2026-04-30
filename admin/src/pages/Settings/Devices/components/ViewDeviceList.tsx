import type React from "react";
import type { DeviceOut } from "../../../../interfaces/device.interface";
import DataTable from "../../../../components/Table/DataTable";

interface ViewDeviceListProps {
    devices: DeviceOut[];
    onSelect: (device: DeviceOut) => void;
    onDeactivate: (device: DeviceOut) => void;
    onDelete: (device: DeviceOut) => void;
    onDownload: (device: DeviceOut) => void;
}

const ViewDeviceList: React.FC<ViewDeviceListProps> = ({
    devices,
    onSelect,
    onDeactivate,
    onDelete,
    onDownload,
}) => {
    return (
        <DataTable
            title="Organization Devices"
            columns={[
                { name: "Name", key: "name" },
                // { name: "Description", key: "description" },
                { name: "Device Type", key: "device_type" },
                { name: "OS Type", key: "os_type" },
                { name: "OS Version", key: "os_version" },
                // { name: "Status", key: "status" },
                // { name: "Script Downloaded At", key: "scriptDownloadedAt" },
                // { name: "Script Downloaded By", key: "script_downloaded_by" },
                // { name: "Created At", key: "createdAt" },
            ]}
            pagination={[{ pageNumber: 1, isActive: true }]}
            totalPages={1}
            clipLongText={true}
            actions={[
                { name: "Select", className: "btn btn-primary btn-sm", handler: (row) => onSelect(row as DeviceOut) },
                { name: "Download", className: "btn btn-primary btn-sm", handler: (row) => onDownload(row as DeviceOut) },
                { name: "Deactivate", className: "btn btn-primary btn-sm", handler: (row) => onDeactivate(row as DeviceOut) },
                { name: "Delete", className: "btn btn-danger btn-sm", handler: (row) => onDelete(row as DeviceOut) },
            ]}
            data={devices.map((device) => ({
                ...device,
                description: device.description ?? "—",
                os_type: device.os_type ?? "—",
                os_version: device.os_version ?? "—",
                status: device.is_active ? "Active" : "Inactive",
                scriptDownloadedAt: device.script_downloaded_at
                    ? new Date(device.script_downloaded_at).toLocaleDateString()
                    : "—",
                script_downloaded_by: device.script_downloaded_by ?? "—",
                createdAt: new Date(device.created_at).toLocaleDateString(),
            }))}
        />
    );
};

export default ViewDeviceList;