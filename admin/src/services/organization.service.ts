
import httpService from "./http.service";
import { DEFAULT_ORGANIZATION_ID, elasticIndices, organizationApi, gatewayApi } from "../constants";
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
    SubscriptionDetailsDto,
} from "../interfaces/organization.interface";


export const DEFAULT_ORGANIZATION: OrganizationOut = {
    id: DEFAULT_ORGANIZATION_ID,
    name: "Demo Organization",
    description: "This is the default organization.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "active"
}

export const DEFAULT_ORGANIZATION_RESOURCE: ResourceDto = {
    organization_id: DEFAULT_ORGANIZATION_ID,
    name: "default-resource",
    is_active: true,
    indices: [
        { name: elasticIndices.deviceMetrics, major_version: 1, minor_version: 0, patch_version: 0, last_attempted_provisioned_at: new Date().toISOString(), provision_status: "complete" },
        { name: elasticIndices.ioDevices, major_version: 1, minor_version: 0, patch_version: 0, last_attempted_provisioned_at: new Date().toISOString(), provision_status: "complete" },
        { name: elasticIndices.processExecutions, major_version: 1, minor_version: 0, patch_version: 0, last_attempted_provisioned_at: new Date().toISOString(), provision_status: "complete" },
        { name: elasticIndices.processTree, major_version: 1, minor_version: 0, patch_version: 0, last_attempted_provisioned_at: new Date().toISOString(), provision_status: "complete" },
        { name: elasticIndices.runningProcesses, major_version: 1, minor_version: 0, patch_version: 0, last_attempted_provisioned_at: new Date().toISOString(), provision_status: "complete" },
    ]
}
export class OrganizationService {

    async listOrganizations(): Promise<OrganizationOut[]> {
        try {
            return [...(await httpService.get<OrganizationOut[]>(`${organizationApi}/`, {}, true)), DEFAULT_ORGANIZATION];
        } catch {
            return [{...DEFAULT_ORGANIZATION}];
        }
    }

    async getOrganization(orgId: string): Promise<OrganizationOut | null> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return {...DEFAULT_ORGANIZATION};
        }
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
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return {...DEFAULT_ORGANIZATION};
        }
        return httpService.fetch<OrganizationOut>(`${organizationApi}/${orgId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }, true);
    }

    async deleteOrganization(orgId: string): Promise<void> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return;
        }
        return httpService.delete<void>(`${organizationApi}/${orgId}`, {}, true);
    }

    async selectOrganization(orgId: string): Promise<object> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return {};
        }
        return httpService.post<object>(`${organizationApi}/${orgId}/select`, {}, true);
    }

    async listOrganizationUsers(orgId: string): Promise<OrganizationUserOut[]> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return [];
        }
        try {
            return await httpService.get<OrganizationUserOut[]>(`${organizationApi}/${orgId}/users`, {}, true);
        } catch {
            return [];
        }
    }

    async updateOrganizationUserRole(orgId: string, userEmail: string, data: OrganizationUserUpdateIn): Promise<OrganizationUserOut> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            throw new Error("Cannot update users in the default organization");
        }
        return httpService.fetch<OrganizationUserOut>(`${organizationApi}/${orgId}/users/${encodeURIComponent(userEmail)}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }, true);
    }

    async removeOrganizationUser(orgId: string, userEmail: string): Promise<void> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            throw new Error("Cannot remove users from the default organization");
        }
        return httpService.delete<void>(`${organizationApi}/${orgId}/users/${encodeURIComponent(userEmail)}`, {}, true);
    }

    async leaveOrganization(orgId: string): Promise<void> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            throw new Error("Cannot leave the default organization");
        }
        return httpService.post<void>(`${organizationApi}/${orgId}/leave`, {}, true);
    }

    async inviteUser(orgId: string, data: OrganizationUserIn): Promise<OrganizationInvitationOut> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            throw new Error("Cannot invite users to the default organization");
        }
        return httpService.post<OrganizationInvitationOut>(`${organizationApi}/invitations/${orgId}/invite`, {
            body: JSON.stringify(data),
        }, true);
    }

    async respondToInvitation(orgId: string, accept: boolean): Promise<OrganizationInvitationOut> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            throw new Error("Cannot respond to invitations for the default organization");
        }
        return httpService.post<OrganizationInvitationOut>(`${organizationApi}/invitations/${orgId}/respond`, {
            body: JSON.stringify({ accept }),
        }, true);
    }

    async listInvitations(): Promise<OrganizationInvitationOut[]> {
        return httpService.get<OrganizationInvitationOut[]>(`${organizationApi}/invitations/pending`, {}, true);
    }

    async getResource(orgId: string): Promise<ResourceDto | null> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return {...DEFAULT_ORGANIZATION_RESOURCE};
        }
        try {
            return await httpService.get<ResourceDto>(`${organizationApi}/${orgId}/resources`, {}, true);
        } catch {
            return null;
        }
    }

    async createResource(orgId: string, data: ManageResourceDto): Promise<ResourceDto> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return {...DEFAULT_ORGANIZATION_RESOURCE};
        }
        return httpService.post<ResourceDto>(`${organizationApi}/${orgId}/resources`, {
            body: JSON.stringify(data),
        }, true);
    }

    async provisionResource(orgId: string): Promise<object> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return {};
        }
        return httpService.post<object>(`${organizationApi}/${orgId}/resources/provision`, {}, true);
    }

    async deprovisionResource(orgId: string): Promise<{message: string}> {
        if(orgId === DEFAULT_ORGANIZATION.id) {
            return { message: "Default organization resource cannot be deprovisioned" };
        }
        return httpService.delete<{message:string}>(`${organizationApi}/${orgId}/resources`, {}, true);
    }

    async downloadInstallationFile(orgId: string, operatingSystem:string, osVersion:string, softwareVersion:string="latest"): Promise<void> {
        const jwtHeader = `${import.meta.env.VITE_JWT_HEADER || 'Authorization'}`;
        const tokenType = httpService.getTokenType();
        const accessToken = httpService.getAccessToken();
        if (!tokenType || !accessToken) throw new Error('No access token found for authorized request');

        const res = await fetch(`${gatewayApi}/jarvis/organization/${orgId}/download/v1?operating_system=${operatingSystem}&os_version=${osVersion}&software_version=${softwareVersion}`, {
            method: 'GET',
            headers: {
                [jwtHeader]: `${tokenType} ${accessToken}`,
                'accept': 'application/octet-stream',
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

    async fetchSubscriptionDetails(orgId: string): Promise<SubscriptionDetailsDto|null> {
        console.debug("Fetching subscription details for organization:", orgId);
        return {
            paid: false
        }
    }

}

export default new OrganizationService();
