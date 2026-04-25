import httpService from "./http.service";
import { deviceApi, jwtHeader } from "../constants";
import type {
    DeviceOut,
    DeviceIn,
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

    async getDeviceDetails(orgId: string, deviceId: string): Promise<DeviceOut | null> {
        try {
            return await httpService.get<DeviceOut>(`${deviceApi}/${orgId}/${deviceId}`, {}, true);
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

    async downloadInstallationFile(orgId: string, deviceId: string): Promise<void> {
        const tokenType = httpService.getTokenType();
        const accessToken = httpService.getAccessToken();
        if (!tokenType || !accessToken) throw new Error('No access token found for authorized request');

        const res = await fetch(`${deviceApi}/${orgId}/${deviceId}/download`, {
            method: 'GET',
            headers: {
                [jwtHeader]: `${tokenType} ${accessToken}`,
            },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = res.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '').trim() : 'installation_script';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

}

export default new DeviceService();