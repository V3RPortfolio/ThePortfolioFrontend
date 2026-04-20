import type React from "react";

interface InformationModalProps {
    title: string;
    description: string;
    onAccept: () => void;
    onCancel: () => void;
    acceptLabel?: string;
    cancelLabel?: string;
}

const InformationModal: React.FC<InformationModalProps> = ({
    title,
    description,
    onAccept,
    onCancel,
    acceptLabel = "Confirm",
    cancelLabel = "Cancel",
}) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 9999 }}
            onClick={onCancel}
        >
            <div
                className="card flex flex-col gap-4 w-full max-w-md mx-4"
                style={{ boxShadow: "var(--shadow-xl)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <h2 className="text-title">{title}</h2>
                    <button
                        onClick={onCancel}
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
                    {description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                    <button className="btn btn-tertiary btn-sm" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={onAccept}>
                        {acceptLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InformationModal;
