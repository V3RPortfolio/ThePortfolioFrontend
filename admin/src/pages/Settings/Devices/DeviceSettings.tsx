import type React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import deviceService from "../../../services/devices.service";
import type {
    DeviceOut,
    DeviceDetailOut,
    DeviceConfigurationOut,
    DeviceDataType,
} from "../../../interfaces/device.interface";
import ViewDeviceList from "./components/ViewDeviceList";
import ViewConfigurationList from "./components/ViewConfigurationList";
import ManageConfiguration from "./components/ManageConfiguration";
import { ToastContext } from "../../../contexts/toast.context";
import { useOrganization } from "../../../contexts/organization.context";

const DeviceSettingsPage: React.FC = () => {
    const [devices, setDevices] = useState<DeviceOut[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<DeviceDetailOut | null>(null);
    const [showConfigForm, setShowConfigForm] = useState(false);

    const { selectedOrg } = useOrganization();
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

    const fetchDevices = useCallback(async (orgId: string) => {
        const data = await deviceService.listDevices(orgId);
        setDevices(data);
    }, []);

    const fetchDeviceDetails = useCallback(async (orgId: string, deviceId: string) => {
        const data = await deviceService.getDeviceDetails(orgId, deviceId);
        setSelectedDevice(data);
    }, []);

    useEffect(() => {
        if (selectedOrg) {
            fetchDevices(selectedOrg.id);
        } else {
            setDevices([]);
            setSelectedDevice(null);
        }
    }, [selectedOrg, fetchDevices]);

    const handleSelectDevice = async (device: DeviceOut) => {
        if (!selectedOrg) return;
        try {
            await fetchDeviceDetails(selectedOrg.id, device.id);
            addToast(`Selected device "${device.name}"`, "success");
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleDeactivateDevice = async (device: DeviceOut) => {
        if (!selectedOrg) return;
        try {
            await deviceService.deactivateDevice(selectedOrg.id, device.id);
            addToast(`Deactivated device "${device.name}"`, "success");
            fetchDevices(selectedOrg.id);
            if (selectedDevice?.id === device.id) {
                setSelectedDevice(null);
            }
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleDeleteDevice = async (device: DeviceOut) => {
        if (!selectedOrg) return;
        try {
            await deviceService.removeDevice(selectedOrg.id, device.id);
            addToast(`Deleted device "${device.name}"`, "success");
            fetchDevices(selectedOrg.id);
            if (selectedDevice?.id === device.id) {
                setSelectedDevice(null);
            }
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleAddConfiguration = async (dataType: DeviceDataType) => {
        if (!selectedOrg || !selectedDevice) return;
        try {
            await deviceService.addConfiguration(selectedOrg.id, selectedDevice.id, { data_type: dataType });
            addToast(`Added configuration "${dataType}"`, "success");
            setShowConfigForm(false);
            fetchDeviceDetails(selectedOrg.id, selectedDevice.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    const handleRemoveConfiguration = async (config: DeviceConfigurationOut) => {
        if (!selectedOrg || !selectedDevice) return;
        try {
            await deviceService.removeConfiguration(selectedOrg.id, selectedDevice.id, config.id);
            addToast(`Removed configuration "${config.data_type}"`, "success");
            fetchDeviceDetails(selectedOrg.id, selectedDevice.id);
        } catch (err) {
            addToast(extractErrorMessage(err), "error");
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-title">Device Settings</h2>
                </div>

                {!selectedOrg && (
                    <div className="card">
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Please select an organization from the Organization Settings page to manage devices.
                        </p>
                    </div>
                )}

                {selectedOrg && (
                    <>
                        <h3
                            className="text-heading"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Organization: {selectedOrg.name}
                        </h3>

                        <ViewDeviceList
                            devices={devices}
                            onSelect={handleSelectDevice}
                            onDeactivate={handleDeactivateDevice}
                            onDelete={handleDeleteDevice}
                        />

                        {selectedDevice && (
                            <>
                                <hr className="divider" />
                                <h3
                                    className="text-heading"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Managing: {selectedDevice.name}
                                </h3>

                                {!showConfigForm && (
                                    <div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowConfigForm(true)}
                                        >
                                            Add Configuration
                                        </button>
                                    </div>
                                )}

                                {showConfigForm && (
                                    <ManageConfiguration
                                        onSave={handleAddConfiguration}
                                        onCancel={() => setShowConfigForm(false)}
                                    />
                                )}

                                <ViewConfigurationList
                                    configurations={selectedDevice.configurations ?? []}
                                    onRemove={handleRemoveConfiguration}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default DeviceSettingsPage;