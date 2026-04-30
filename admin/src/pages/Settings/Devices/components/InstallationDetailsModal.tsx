import type React from "react";
import type { InstallationDetailsDto } from "../../../../interfaces/organization.interface";
import { CopyIcon } from "lucide-react";

interface InstallationDetailsModalProps {
    details: InstallationDetailsDto;
    onClose: () => void;
}

const InstallationDetailsModal: React.FC<InstallationDetailsModalProps> = ({ details, onClose }) => {
    const fields: { label: string; value: string }[] = [
        { label: "API Key", value: details.api_key },
        { label: "Organization ID", value: details.organization_id },
        { label: "Device ID", value: details.device_id },
    ];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 9999 }}
            onClick={onClose}
        >
            <div
                className="card flex flex-col gap-4 w-full max-w-lg mx-4"
                style={{ boxShadow: "var(--shadow-xl)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-title">Installation Details</h2>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-full w-7 h-7 transition-colors"
                        style={{
                            color: "var(--color-text-secondary)",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M12 4L4 12M4 4L12 12"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Divider */}
                <hr className="divider" style={{ margin: 0 }} />

                {/* Body */}
                <p className="text-body" style={{ color: "var(--color-text-secondary)" }}>
                    {details.message || "The installation script has been downloaded. Use the details below to configure your device agent.\nKeep the API key secure and do not share it."}
                </p>

                <div className="flex flex-col gap-3">
                    {fields.map(({ label, value }) => (
                        <div key={label} className="mapped-value flex flex-col gap-1 cursor-pointer relative" 
                        onClick={(e) => {
                            navigator.clipboard.writeText(value);
                            if(e.currentTarget) {
                                const target = e.currentTarget as HTMLDivElement;
                                if(!target) return;
                                const childCode = target.querySelector("code span");
                                console.log("childCode", childCode);
                                if(!childCode) return;
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

                {/* Actions */}
                <div className="flex items-center justify-end pt-1">
                    <button className="btn btn-primary btn-sm" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallationDetailsModal;
