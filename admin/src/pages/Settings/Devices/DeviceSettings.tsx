import type React from "react";
import { useCallback, useEffect, useState } from "react";
import deviceService from "../../../services/devices.service";
import type {
    DeviceOut,
    DeviceConfigurationOut,
    DeviceDataType,
    DeviceIn,
} from "../../../interfaces/device.interface";
import ViewDeviceList from "./components/ViewDeviceList";
import ViewConfigurationList from "./components/ViewConfigurationList";
import ManageConfiguration from "./components/ManageConfiguration";
import ManageDevice from "./components/ManageDevice";
import { useToast } from "../../../contexts/toast.context";
import { useOrganization } from "../../../contexts/organization.context";

const DeviceSettingsPage: React.FC = () => {
    const [devices, setDevices] = useState<DeviceOut[]>([]);
    const [showDeviceForm, setShowDeviceForm] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<DeviceOut | null>(null);
    const [showConfigForm, setShowConfigForm] = useState(false);

    const { selectedOrg } = useOrganization();
    const { addToast, } = useToast();

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
    }, [selectedOrg]);
    console.log("Rendering devices");

    const handleSelectDevice = async (device: DeviceOut) => {
        if (!selectedOrg) return;
        try {
            await fetchDeviceDetails(selectedOrg.id, device.id);
            setShowDeviceForm(false);
            setShowConfigForm(false);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleManageDevice = async (data: DeviceIn) => {
        if (!selectedOrg) return;
        try {
            if (selectedDevice) {
                await deviceService.updateDevice(selectedOrg.id, selectedDevice.id, {
                    name: data.name,
                    description: data.description ?? null,
                });
                addToast({message: `Device "${selectedDevice.name}" updated`, type: "success"});
                await fetchDeviceDetails(selectedOrg.id, selectedDevice.id);
            } else {
                await deviceService.addDevice(selectedOrg.id, data);
                addToast({message: `Device "${data.name}" added`, type: "success"});
            }
            await fetchDevices(selectedOrg.id);
            setShowDeviceForm(false);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleDeactivateDevice = async (device: DeviceOut) => {
        if (!selectedOrg) return;
        try {
            await deviceService.deactivateDevice(selectedOrg.id, device.id);
            addToast({message: `Deactivated device "${device.name}"`, type: "success"});
            fetchDevices(selectedOrg.id);
            if (selectedDevice?.id === device.id) {
                setSelectedDevice(null);
            }
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleDeleteDevice = async (device: DeviceOut) => {
        if (!selectedOrg) return;
        try {
            await deviceService.removeDevice(selectedOrg.id, device.id);
            addToast({message: `Deleted device "${device.name}"`, type: "success"});
            fetchDevices(selectedOrg.id);
            if (selectedDevice?.id === device.id) {
                setSelectedDevice(null);
            }
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleAddConfiguration = async (dataType: DeviceDataType) => {
        if (!selectedOrg || !selectedDevice) return;
        try {
            await deviceService.addConfiguration(selectedOrg.id, selectedDevice.id, { data_type: dataType });
            addToast({message: `Added configuration "${dataType}"`, type: "success"});
            setShowConfigForm(false);
            fetchDeviceDetails(selectedOrg.id, selectedDevice.id);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    const handleRemoveConfiguration = async (config: DeviceConfigurationOut) => {
        if (!selectedOrg || !selectedDevice) return;
        try {
            await deviceService.removeConfiguration(selectedOrg.id, selectedDevice.id, config.id);
            addToast({message: `Removed configuration "${config.data_type}"`, type: "success"});
            fetchDeviceDetails(selectedOrg.id, selectedDevice.id);
        } catch (err) {
            addToast({message: extractErrorMessage(err), type: "error"});
        }
    };

    return (
        <>
            <div className="p-6 flex flex-col gap-6">

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
                        <div className="flex flex-wrap justify-between">
                            <h3
                                className="text-heading"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Device Settings | Organization: {selectedOrg.name}
                            </h3>

                            {!showDeviceForm && (
                                <button
                                    className="btn btn-primary mt-2 md:mt-0 w-full md:w-auto"
                                    onClick={() => {
                                        setSelectedDevice(null);
                                        setShowDeviceForm(true);
                                    }}
                                >
                                    Add New Device
                                </button>
                            )}
                        </div>

                        {showDeviceForm && (
                            <ManageDevice
                                device={selectedDevice}
                                onSave={handleManageDevice}
                                onCancel={() => setShowDeviceForm(false)}
                            />
                        )}

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

                                {!showConfigForm && !showDeviceForm && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setShowConfigForm(true)}
                                        >
                                            Add Configuration
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowDeviceForm(true)}
                                        >
                                            Edit Device
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