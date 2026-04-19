import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { OrganizationOut } from "../interfaces/organization.interface";
import organizationService from "../services/organization.service";

export type OrganizationContextValue = {
    selectedOrg: OrganizationOut | null;
    organizations: OrganizationOut[];
    selectOrg: (org: OrganizationOut) => Promise<void>;
    clearSelectedOrg: () => void;
    updateOrganizationsList: () => Promise<void>;
};

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [selectedOrg, setSelectedOrg] = useState<OrganizationOut | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationOut[]>([]);

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
