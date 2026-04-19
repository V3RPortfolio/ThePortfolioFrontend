export type DeviceType = "Desktop";

export type DeviceDataType = "user_access" | "cpu_and_memory_usage" | "io_device_usage";

export interface DeviceConfigurationOut {
    id: string;
    device_id: string;
    data_type: string;
    created_at: string;
    updated_at: string;
}

export interface DeviceConfigurationIn {
    data_type: DeviceDataType;
}

export interface DeviceOut {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    device_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_heartbeat_at: string | null;
    configurations: DeviceConfigurationOut[];
}

export interface DeviceDetailOut {
    id: string;
    organization_id: string;
    name: string;
    description: string | null;
    device_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    last_heartbeat_at: string | null;
    configurations: DeviceConfigurationOut[];
}

export interface DeviceIn {
    name: string;
    description?: string | null;
    device_type?: DeviceType;
}

export interface DeviceUpdate {
    name?: string;
    description?: string | null;
}

export interface DeviceConnectionStatusOut {
    device_id: string;
    is_active: boolean;
    last_heartbeat_at: string | null;
}
