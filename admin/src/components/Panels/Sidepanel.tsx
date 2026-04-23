import type React from "react";
import { useEffect, useState } from "react";


interface SidePanelProps {
    children: React.ReactNode;
    title: string;
    isDisplayed?: boolean;
    onClose?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ children, title, isDisplayed = false, onClose }) => {

    const [show, setShow] = useState<boolean>(isDisplayed);

    useEffect(() => {
        setShow(isDisplayed);
    }, [isDisplayed]);

    const handleClose = () => {
        setShow(false);
        onClose?.();
    };

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${
                    show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                style={{ backgroundColor: "rgba(0, 0, 0, 0.35)", zIndex: 40 }}
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Side panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`fixed top-0 right-0 h-full w-4/5 flex flex-col overflow-y-auto
                    transition-transform duration-300 ease-in-out
                    ${show ? "translate-x-0" : "translate-x-full"}`}
                style={{
                    zIndex: 50,
                    backgroundColor: "var(--color-background)",
                    borderLeft: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-xl)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{
                        borderBottom: "1px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                    }}
                >
                    <h2 className="text-heading" style={{ color: "var(--color-text-primary)" }}>
                        {title}
                    </h2>

                    <button
                        onClick={handleClose}
                        aria-label="Close panel"
                        className="flex items-center justify-center rounded-lg transition-colors duration-150"
                        style={{
                            width: "var(--icon-size-2xl)",
                            height: "var(--icon-size-2xl)",
                            color: "var(--color-text-secondary)",
                            border: "1px solid var(--color-border)",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--color-gray-100)";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-primary)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
                        }}
                    >
                        {/* × icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }}
                            aria-hidden="true"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                    {children}
                </div>
            </div>
        </>
    );
};

export default SidePanel;