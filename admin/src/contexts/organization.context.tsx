import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { OrganizationOut, ResourceDto } from "../interfaces/organization.interface";
import organizationService from "../services/organization.service";

export type OrganizationContextValue = {
    selectedOrg: OrganizationOut | null;
    organizations: OrganizationOut[];
    selectOrg: (org: OrganizationOut) => Promise<void>;
    clearSelectedOrg: () => void;
    updateOrganizationsList: () => Promise<void>;

    resource: ResourceDto | null;
    updateProvisionedResource: () => Promise<void>;
    isResourceProvisioned: boolean;
    
    
};

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [selectedOrg, setSelectedOrg] = useState<OrganizationOut | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationOut[]>([]);
    
    const [resource, setResource] = useState<ResourceDto | null>(null);
    const [isResourceProvisioned, setIsResourceProvisioned] = useState(false);


    const selectOrg = useCallback(async (org: OrganizationOut) => {
        await organizationService.selectOrganization(org.id);
        setSelectedOrg(org);
    }, []);

    const clearSelectedOrg = useCallback(() => {
        setSelectedOrg(null);
    }, []);

    const updateOrganizationsList = useCallback(async () => {
        const orgs = await organizationService.listOrganizations();
        setOrganizations(orgs);
    }, []);

    const updateProvisionedResource = useCallback(async () => {
        if (!selectedOrg) {
            setResource(null);
            return;
        }
        const res = await organizationService.getResource(selectedOrg.id);
        setResource(res);
        if(!!res && res.indices && res.indices.length > 0) {
            setIsResourceProvisioned(true);
        } else {
            setIsResourceProvisioned(false);
        }
        
    }, [selectedOrg]);


    const value = useMemo<OrganizationContextValue>(
        () => ({
            selectedOrg,
            organizations,
            selectOrg,
            clearSelectedOrg,
            updateOrganizationsList,
            resource: resource,
            updateProvisionedResource,
            isResourceProvisioned
        }),
        [selectedOrg, organizations, isResourceProvisioned, selectOrg, clearSelectedOrg, updateOrganizationsList]
    );

    useEffect(() => {
        updateOrganizationsList();
    }, [])

    useEffect(() => {
        if(!selectedOrg) return;
        updateProvisionedResource();
    }, [selectedOrg]);

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
