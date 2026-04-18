import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { OrganizationOut } from "../interfaces/organization.interface";
import organizationService from "../services/organization.service";

export type OrganizationContextValue = {
    selectedOrg: OrganizationOut | null;
    selectOrg: (org: OrganizationOut) => Promise<void>;
    clearSelectedOrg: () => void;
};

export const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [selectedOrg, setSelectedOrg] = useState<OrganizationOut | null>(null);

    const selectOrg = useCallback(async (org: OrganizationOut) => {
        await organizationService.selectOrganization(org.id);
        setSelectedOrg(org);
    }, []);

    const clearSelectedOrg = useCallback(() => {
        setSelectedOrg(null);
    }, []);

    const value = useMemo<OrganizationContextValue>(
        () => ({
            selectedOrg,
            selectOrg,
            clearSelectedOrg,
        }),
        [selectedOrg, selectOrg, clearSelectedOrg]
    );

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
