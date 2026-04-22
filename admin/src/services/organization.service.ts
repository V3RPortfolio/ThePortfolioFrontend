
import httpService from "./http.service";
import { organizationApi } from "../constants";
import type {
    OrganizationOut,
    OrganizationIn,
    OrganizationUpdateIn,
    OrganizationUserOut,
    OrganizationUserIn,
    OrganizationUserUpdateIn,
    OrganizationInvitationOut,
    ResourceDto,
    ManageResourceDto,
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

    async updateOrganizationUserRole(orgId: string, userEmail: string, data: OrganizationUserUpdateIn): Promise<OrganizationUserOut> {
        return httpService.fetch<OrganizationUserOut>(`${organizationApi}/${orgId}/users/${encodeURIComponent(userEmail)}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }, true);
    }

    async removeOrganizationUser(orgId: string, userEmail: string): Promise<void> {
        return httpService.delete<void>(`${organizationApi}/${orgId}/users/${encodeURIComponent(userEmail)}`, {}, true);
    }

    async leaveOrganization(orgId: string): Promise<void> {
        return httpService.post<void>(`${organizationApi}/${orgId}/leave`, {}, true);
    }

    async inviteUser(orgId: string, data: OrganizationUserIn): Promise<OrganizationInvitationOut> {
        return httpService.post<OrganizationInvitationOut>(`${organizationApi}/invitations/${orgId}/invite`, {
            body: JSON.stringify(data),
        }, true);
    }

    async respondToInvitation(orgId: string, accept: boolean): Promise<OrganizationInvitationOut> {
        return httpService.post<OrganizationInvitationOut>(`${organizationApi}/invitations/${orgId}/respond`, {
            body: JSON.stringify({ accept }),
        }, true);
    }

    async listInvitations(): Promise<OrganizationInvitationOut[]> {
        return httpService.get<OrganizationInvitationOut[]>(`${organizationApi}/invitations/pending`, {}, true);
    }

    async getResource(orgId: string): Promise<ResourceDto | null> {
        try {
            return await httpService.get<ResourceDto>(`${organizationApi}/${orgId}/resources`, {}, true);
        } catch {
            return null;
        }
    }

    async createResource(orgId: string, data: ManageResourceDto): Promise<ResourceDto> {
        return httpService.post<ResourceDto>(`${organizationApi}/${orgId}/resources`, {
            body: JSON.stringify(data),
        }, true);
    }

    async provisionResource(orgId: string): Promise<object> {
        return httpService.post<object>(`${organizationApi}/${orgId}/resources/provision`, {}, true);
    }

    async deprovisionResource(orgId: string): Promise<{message: string}> {
        return httpService.delete<{message:string}>(`${organizationApi}/${orgId}/resources`, {}, true);
    }

}

export default new OrganizationService();
