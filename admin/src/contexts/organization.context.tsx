import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
    type ReactNode
} from "react";
import type { OrganizationOut, ResourceDto } from "../interfaces/organization.interface";
import organizationService from "../services/organization.service";



interface OrganizationState {
    info: OrganizationOut;
    resource: ResourceDto | null;
}

interface ProvisioningResource {
    organizationId: string;
    resource: ResourceDto;
}

interface ProvisionResourceResponse {
    message: string;
    success: boolean;
    resource?: ResourceDto;
}

export type OrganizationContextValue = {
    selectedOrg: OrganizationState | null;
    organizations: OrganizationState[];
    selectOrg: (org: string) => Promise<void>;
    clearSelectedOrg: () => void;
    updateOrganizationsList: () => Promise<void>;
    provisionResource: () => Promise<ProvisionResourceResponse>;
    deprovisionResource: () => Promise<ProvisionResourceResponse>;
};

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [selectedOrg, setSelectedOrg] = useState<OrganizationState | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationState[]>([]);

    const provisioningResourceReducerFunction = (state: ProvisioningResource[], action: {type: "add" | "remove"; organizationId: string; resource?: ResourceDto}) => {
        switch (action.type) {
            case "add":
                if (!action.resource) return state;
                return [...state, { organizationId: action.organizationId, resource: action.resource }];
            case "remove":
                return state.filter(r => r.organizationId !== action.organizationId);
            default:
                return state;
        }
    }

    const [provisioningResource, dispatchProvisioningResource] = useReducer(provisioningResourceReducerFunction, []);

    const selectOrg = useCallback(async (org: string) => {
        const selectedOrg = organizations.find(o => o.info.id === org);
        setSelectedOrg(selectedOrg || null)
    }, [organizations]);

    const updateOrg = useCallback((id:string, info?:OrganizationOut, resource?:ResourceDto) => {
        const org = organizations.find(o => o.info.id === id);
        if(!org) return;
        setSelectedOrg({...org, info: info || org.info, resource: resource || org.resource || null});
    }, [organizations]);

    const clearSelectedOrg = useCallback(() => {
        setSelectedOrg(null);
    }, []);

    const updateOrganizationsList = useCallback(async () => {
        const orgs = await organizationService.listOrganizations();
        const newOrgs: OrganizationState[] = [];
        for (const org of orgs) {
            const resource = await organizationService.getResource(org.id);
            newOrgs.push({
                info: org,
                resource: resource,
            })
            if(!!resource && !resource.indices?.length) {
                dispatchProvisioningResource({ type: "add", organizationId: org.id, resource });
            } else {
                dispatchProvisioningResource({ type: "remove", organizationId: org.id });
            }
            if(!!selectedOrg && selectedOrg.info.id == org.id && 
                selectedOrg?.resource?.indices?.length != resource?.indices?.length) {
                updateOrg(org.id, org, resource || undefined);
            }
        }
        setOrganizations(newOrgs);
    }, [selectedOrg]);

    const extractErrorMessage = (err: unknown): string => {
        if (err instanceof Error) return err.message;
        return String(err);
    };

    const provisionResource = useCallback(async ():Promise<ProvisionResourceResponse> => {
        if (!selectedOrg || 
            selectedOrg.resource?.indices?.length) return {
                message: "The resource has already been provisioned or the organization does not exist",
                success: false
            };
        let created: ResourceDto | null = null;
        try {
            if(!selectedOrg?.resource) {
                created = await organizationService.createResource(selectedOrg.info.id, {
                    organization_id: selectedOrg.info.id,
                    name: selectedOrg.info.name,
                    is_active: true
                });
            } else {
                created = selectedOrg.resource;
            }
        } catch (err) {
            return {
                message: extractErrorMessage(err),
                success: false
            }
        }

        try {
            if (!!created) {
                await organizationService.provisionResource(selectedOrg.info.id);
                setTimeout(() => {
                    updateOrganizationsList();
                }, 500);
                return {
                    message: "Organization creation initiated successfully",
                    success: true,
                    resource: created
                }
            } else {
                throw new Error("Failed to create resource for the organization");
            }
        } catch (err) {
            return {
                message: extractErrorMessage(err),
                success: false
            }
        }
    }, [selectedOrg, provisioningResource, updateOrganizationsList]);

    const deprovisionResource = useCallback(async ():Promise<ProvisionResourceResponse> => {
            if (!selectedOrg || 
                !selectedOrg?.resource?.indices?.length) return {
                    message: "The resource is not provisioned or the organization does not exist",
                    success: false
                };
            try {
                await organizationService.deprovisionResource(selectedOrg.info.id);
                setTimeout(() => {
                    updateOrganizationsList();
                }, 500);
                return {
                    message: "Organization deletion initiated successfully",
                    success: true
                }
            } catch (err) {
                return {
                    message: extractErrorMessage(err),
                    success: false
                }
            }
        }, [selectedOrg, updateOrganizationsList]);


    const value = useMemo<OrganizationContextValue>(
        () => ({
            selectedOrg,
            organizations,
            selectOrg,
            clearSelectedOrg,
            updateOrganizationsList,
            provisionResource,
            deprovisionResource
        }),
        [selectedOrg, organizations, selectOrg, clearSelectedOrg, updateOrganizationsList, provisionResource, deprovisionResource]
    );

    useEffect(() => {
        setSelectedOrg(null);
        updateOrganizationsList();
    }, [])

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization(): OrganizationContextValue {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error("useOrganization must be used within an OrganizationProvider");
    }
    return context;
}
