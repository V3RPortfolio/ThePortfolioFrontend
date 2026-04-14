import httpService from "./http.service";
import { organizationApi } from "../constants";
import type {
    OrganizationOut,
    OrganizationIn,
    OrganizationUpdateIn,
    OrganizationUserOut,
    OrganizationUserIn,
    OrganizationUserUpdateIn,
} from "../interfaces/organization.interface";

export class OrganizationService {

    async listOrganizations(): Promise<OrganizationOut[]> {
        try {
            return await httpService.get<OrganizationOut[]>(`${organizationApi}/`, {}, true);
        } catch {
            return [];
        }
    }

    async getOrganization(orgId: string): Promise<OrganizationOut | null> {
        try {
            return await httpService.get<OrganizationOut>(`${organizationApi}/${orgId}`, {}, true);
        } catch {
            return null;
        }
    }

    async createOrganization(data: OrganizationIn): Promise<OrganizationOut> {
        return httpService.post<OrganizationOut>(`${organizationApi}/`, {
            body: JSON.stringify(data),
        }, true);
    }

    async updateOrganization(orgId: string, data: OrganizationUpdateIn): Promise<OrganizationOut> {
        return httpService.fetch<OrganizationOut>(`${organizationApi}/${orgId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }, true);
    }

    async deleteOrganization(orgId: string): Promise<void> {
        return httpService.delete<void>(`${organizationApi}/${orgId}`, {}, true);
    }

    async selectOrganization(orgId: string): Promise<object> {
        return httpService.post<object>(`${organizationApi}/${orgId}/select`, {}, true);
    }

    async listOrganizationUsers(orgId: string): Promise<OrganizationUserOut[]> {
        try {
            return await httpService.get<OrganizationUserOut[]>(`${organizationApi}/${orgId}/users`, {}, true);
        } catch {
            return [];
        }
    }

    async addOrganizationUser(orgId: string, data: OrganizationUserIn): Promise<OrganizationUserOut> {
        return httpService.post<OrganizationUserOut>(`${organizationApi}/${orgId}/users`, {
            body: JSON.stringify(data),
        }, true);
    }

    async updateOrganizationUserRole(orgId: string, userEmail: string, data: OrganizationUserUpdateIn): Promise<OrganizationUserOut> {
        return httpService.fetch<OrganizationUserOut>(`${organizationApi}/${orgId}/users/${encodeURIComponent(userEmail)}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }, true);
    }

    async removeOrganizationUser(orgId: string, userEmail: string): Promise<void> {
        return httpService.delete<void>(`${organizationApi}/${orgId}/users/${encodeURIComponent(userEmail)}`, {}, true);
    }
}

export default new OrganizationService();
