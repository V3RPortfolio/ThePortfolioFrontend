import type React from "react";
import { useToast } from "../../contexts/toast.context";
import { useEffect } from "react";
import type { Toast } from "../../interfaces/toast.interface";


interface ToastDisplayComponentProps {
    toast: Toast
}
const ToastDisplayComponent: React.FC<ToastDisplayComponentProps> = ({ toast }) => {
    const { removeToast } = useToast();
    useEffect(() => {
        setTimeout(() => {
            removeToast(toast.id);
        }, 3000);
    }, [])
    return <div
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
        <span>{toast.message}</span>
    </div>
};


const ToastComponent:React.FC = () => {
    const { toasts } = useToast();


    return <div className="fixed bottom-6 right-6 flex flex-col gap-2" style={{ zIndex: 9999 }}>
        {toasts?.length ? toasts.map((toast) => (<ToastDisplayComponent toast={toast} key={toast.id} />)): <></>}
    </div>
}

export default ToastComponent;