import type React from "react";
import type { OrganizationOut } from "../../../../interfaces/organization.interface";

interface ViewOrganizationListProps {
    organizations: OrganizationOut[];
    selectedOrgId: string | null;
    onSelect: (org: OrganizationOut) => void;
    onEdit: (org: OrganizationOut) => void;
    onDelete: (org: OrganizationOut) => void;
}

const ViewOrganizationList: React.FC<ViewOrganizationListProps> = ({
    organizations,
    selectedOrgId,
    onSelect,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="card overflow-hidden p-0">
            <h4
                className="px-5 py-3 text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                Your Organizations
            </h4>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-gray-100)" }}>
                            {["Name", "Description", "Status", "Created At", "Actions"].map(
                                (heading) => (
                                    <th
                                        key={heading}
                                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                            borderBottom: "1px solid var(--color-border)",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {organizations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-12 text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    No organizations found
                                </td>
                            </tr>
                        ) : (
                            organizations.map((org, idx) => (
                                <tr
                                    key={org.id}
                                    style={{
                                        borderBottom:
                                            idx < organizations.length - 1
                                                ? "1px solid var(--color-border)"
                                                : "none",
                                        backgroundColor:
                                            selectedOrgId === org.id
                                                ? "var(--color-primary-50)"
                                                : idx % 2 !== 0
                                                ? "var(--color-gray-50)"
                                                : "transparent",
                                    }}
                                >
                                    <td
                                        className="px-5 py-3 text-sm whitespace-nowrap"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        <span className="block max-w-xs truncate" title={org.name}>
                                            {org.name}
                                        </span>
                                    </td>
                                    <td
                                        className="px-5 py-3 text-sm whitespace-nowrap"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        <span
                                            className="block max-w-xs truncate"
                                            title={org.description ?? ""}
                                        >
                                            {org.description ?? "—"}
                                        </span>
                                    </td>
                                    <td
                                        className="px-5 py-3 text-sm whitespace-nowrap"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {org.status}
                                    </td>
                                    <td
                                        className="px-5 py-3 text-sm whitespace-nowrap"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {new Date(org.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-3 text-sm whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => onSelect(org)}
                                                title="Select organization"
                                            >
                                                Select
                                            </button>
                                            <button
                                                className="btn btn-tertiary btn-sm"
                                                onClick={() => onEdit(org)}
                                                title="Edit organization"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => onDelete(org)}
                                                title="Delete organization"
                                                style={{ color: "var(--color-error)" }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewOrganizationList;
