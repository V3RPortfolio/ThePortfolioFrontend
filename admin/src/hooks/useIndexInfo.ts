import { useCallback } from "react";
import { useOrganization } from "../contexts/organization.context";

export type IndexInfo = { orgId: string; version: number };

export function useIndexInfo() {
    const { selectedOrg, resource, isResourceProvisioned } = useOrganization();

    const getIndexInfo = useCallback(
        (indexName: string): IndexInfo | null => {
            if (!selectedOrg || !isResourceProvisioned || !resource?.indices) return null;
            const idx = resource.indices.find(i => i.name === indexName);
            if (!idx) return null;
            return { orgId: selectedOrg.id, version: idx.major_version };
        },
        [selectedOrg, isResourceProvisioned, resource?.indices]
    );

    return { selectedOrg, isResourceProvisioned, getIndexInfo };
}
