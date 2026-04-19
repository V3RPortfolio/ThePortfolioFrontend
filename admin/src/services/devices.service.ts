import httpService from "./http.service";
import { deviceApi } from "../constants";
import type {
    DeviceOut,
    DeviceIn,
    DeviceDetailOut,
    DeviceConfigurationOut,
    DeviceConfigurationIn,
    DeviceConnectionStatusOut,
    DeviceUpdate,
} from "../interfaces/device.interface";

class DeviceService {

    async listDevices(orgId: string): Promise<DeviceOut[]> {
        try {
            return await httpService.get<DeviceOut[]>(`${deviceApi}/${orgId}/`, {}, true);
        } catch {
            return [];
        }
    }

    async addDevice(orgId: string, data: DeviceIn): Promise<DeviceOut> {
        return httpService.post<DeviceOut>(`${deviceApi}/${orgId}/`, {
            body: JSON.stringify(data),
        }, true);
    }

    async updateDevice(orgId:string, deviceId: string, data: DeviceUpdate): Promise<DeviceOut> {
        return httpService.put<DeviceOut>(`${deviceApi}/${orgId}/${deviceId}/`, {
            body: JSON.stringify(data),
        }, true);
    }

    async getDeviceDetails(orgId: string, deviceId: string): Promise<DeviceDetailOut | null> {
        try {
            return await httpService.get<DeviceDetailOut>(`${deviceApi}/${orgId}/${deviceId}`, {}, true);
        } catch {
            return null;
        }
    }

    async removeDevice(orgId: string, deviceId: string): Promise<void> {
        return httpService.delete<void>(`${deviceApi}/${orgId}/${deviceId}`, {}, true);
    }

    async deactivateDevice(orgId: string, deviceId: string): Promise<DeviceOut> {
        return httpService.post<DeviceOut>(`${deviceApi}/${orgId}/${deviceId}/deactivate`, {}, true);
    }

    async addConfiguration(orgId: string, deviceId: string, data: DeviceConfigurationIn): Promise<DeviceConfigurationOut> {
        return httpService.post<DeviceConfigurationOut>(`${deviceApi}/${orgId}/${deviceId}/configurations`, {
            body: JSON.stringify(data),
        }, true);
    }

    async removeConfiguration(orgId: string, deviceId: string, configId: string): Promise<void> {
        return httpService.delete<void>(`${deviceApi}/${orgId}/${deviceId}/configurations/${configId}`, {}, true);
    }

    async checkConnectionStatus(orgId: string, deviceId: string): Promise<DeviceConnectionStatusOut | null> {
        try {
            return await httpService.get<DeviceConnectionStatusOut>(`${deviceApi}/${orgId}/${deviceId}/status`, {}, true);
        } catch {
            return null;
        }
    }

    async downloadInstallationFile(orgId: string, deviceId: string): Promise<object> {
        return httpService.get<object>(`${deviceApi}/${orgId}/${deviceId}/download`, {}, true);
    }

}

export default new DeviceService();