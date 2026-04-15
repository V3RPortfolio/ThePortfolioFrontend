import type React from "react";
import { useContext } from "react";
import { ToastContext } from "../../contexts/toast.context";


const ToastComponent:React.FC = () => {
    const toastContext = useContext(ToastContext);


    return <div className="fixed bottom-6 right-6 flex flex-col gap-2" style={{ zIndex: 9999 }}>
        {toastContext?.toasts?.length && toastContext.toasts.map((toast) => (
            <div
                key={toast.id}
                className="card flex items-center gap-3 px-5 py-3 text-sm"
                style={{
                    backgroundColor:
                        toast.type === "error"
                            ? "var(--color-error-light)"
                            : "var(--color-tertiary-100)",
                    color:
                        toast.type === "error"
                            ? "var(--color-error)"
                            : "var(--color-tertiary-700)",
                    minWidth: "260px",
                }}
            >
                {toast.message}
            </div>
        ))}
    </div>
}

export default ToastComponent;