import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from "react";
import type { OrganizationOut, ResourceDto } from "../interfaces/organization.interface";
import organizationService from "../services/organization.service";



interface OrganizationState {
    info: OrganizationOut;
    resource: ResourceDto | null;
}

export type OrganizationContextValue = {
    selectedOrg: OrganizationState | null;
    organizations: OrganizationState[];
    selectOrg: (org: string) => Promise<void>;
    clearSelectedOrg: () => void;
    updateOrganizationsList: () => Promise<void>;   
};

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [selectedOrg, setSelectedOrg] = useState<OrganizationState|null>(null);
    const [organizations, setOrganizations] = useState<OrganizationState[]>([]);

    const selectOrg = useCallback(async (org: string) => {
        const selectedOrg = organizations.find(o => o.info.id === org);
        setSelectedOrg(selectedOrg || null)
    }, [organizations]);

    const clearSelectedOrg = useCallback(() => {
        setSelectedOrg(null);
    }, []);

    const updateOrganizationsList = useCallback(async () => {
        const orgs = await organizationService.listOrganizations();
        const newOrgs:OrganizationState[] = [];
        for(const org of orgs) {
            const resource = await organizationService.getResource(org.id);
            newOrgs.push({
                info: org,
                resource: resource,
            })
        }
        setOrganizations(newOrgs);        
    }, []);


    const value = useMemo<OrganizationContextValue>(
        () => ({
            selectedOrg,
            organizations,
            selectOrg,
            clearSelectedOrg,
            updateOrganizationsList
        }),
        [selectedOrg, organizations, selectOrg, clearSelectedOrg, updateOrganizationsList]
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
