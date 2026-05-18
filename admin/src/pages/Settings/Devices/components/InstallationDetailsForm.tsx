import type React from "react";
import type { InstallationDetailsDto } from "../../../../interfaces/organization.interface";
import { CopyIcon } from "lucide-react";

interface InstallationDetailsFormProps {
    details: InstallationDetailsDto;
}

const InstallationDetailsForm: React.FC<InstallationDetailsFormProps> = ({ details }) => {
    const fields: { label: string; value: string }[] = [
        { label: "API Key", value: details.api_key },
        { label: "Organization ID", value: details.organization_id },
        { label: "Device ID", value: details.device_name },
    ];

    return (
        <div className="flex flex-col gap-3">
            {fields.map(({ label, value }) => (
                <div key={label} className="mapped-value flex flex-col gap-1 cursor-pointer relative"
                    onClick={(e) => {
                        navigator.clipboard.writeText(value);
                        if (e.currentTarget) {
                            const target = e.currentTarget as HTMLDivElement;
                            if (!target) return;
                            const childCode = target.querySelector("code span");
                            console.log("childCode", childCode);
                            if (!childCode) return;
                            childCode.classList.add("bg-blue-100");
                            setTimeout(() => {
                                childCode.classList.remove("bg-blue-100");
                            }, 1000);
                        }
                    }}>
                    <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {label}
                    </span>
                    <code
                        className="relative text-sm rounded px-3 py-2 overflow-x-auto"
                        style={{
                            backgroundColor: "var(--color-surface-secondary, rgba(0,0,0,0.06))",
                            color: "var(--color-text-primary)",
                            fontFamily: "monospace",
                        }}
                    >
                        <span className="nowrap">{value}</span>
                    </code>
                    <CopyIcon size={14} className="absolute top-0 right-0" />
                </div>
            ))}
        </div>
    );
};

export default InstallationDetailsForm;
