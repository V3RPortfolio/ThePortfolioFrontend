import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    type ReactNode,
} from "react";
import type { Toast } from "../interfaces/toast.interface";


type ToastState = {
    toasts: Toast[];
};

type ToastAction =
    | { type: "ADD_TOAST"; payload: Toast }
    | { type: "REMOVE_TOAST"; payload: { id: string } }
    | { type: "CLEAR_TOASTS" };

type ToastWithoutId = Omit<Toast, "id">;

const initialState: ToastState = {
    toasts: [],
};

function toastReducer(state: ToastState, action: ToastAction): ToastState {
    switch (action.type) {
        case "ADD_TOAST":
            return { ...state, toasts: [...state.toasts, action.payload] };
        case "REMOVE_TOAST":
            return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload.id) };
        case "CLEAR_TOASTS":
            return { ...state, toasts: [] };
        default:
            return state;
    }
}

export type ToastContextValue = {
    toasts: Toast[];
    addToast: (toast: ToastWithoutId) => string;
    removeToast: (id: string) => void;
    clearToasts: () => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(toastReducer, initialState);

    // Track timers so we can clear them on manual removal/unmount
    const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const removeToast = useCallback((id: string) => {
        const timer = timersRef.current[id];
        if (timer) {
            clearTimeout(timer);
            delete timersRef.current[id];
        }
        dispatch({ type: "REMOVE_TOAST", payload: { id } });
    }, []);

    const addToast = useCallback(
        (toast: ToastWithoutId) => {
            const id = `${Date.now()}-${Math.random()}`;
            dispatch({ type: "ADD_TOAST", payload: { ...toast, id } });

            // Auto-remove after 4 seconds
            const timer = setTimeout(() => {
                removeToast(id);
            }, 4000);

            timersRef.current[id] = timer;

            return id;
        },
        [removeToast]
    );

    const clearToasts = useCallback(() => {
        for (const id of Object.keys(timersRef.current)) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
        dispatch({ type: "CLEAR_TOASTS" });
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            for (const id of Object.keys(timersRef.current)) {
                clearTimeout(timersRef.current[id]);
            }
            timersRef.current = {};
        };
    }, []);

    const value = useMemo<ToastContextValue>(
        () => ({
            toasts: state.toasts,
            addToast,
            removeToast,
            clearToasts,
        }),
        [state.toasts, addToast, removeToast, clearToasts]
    );

    return <ToastContext.Provider value={ value }> { children } </ToastContext.Provider>;
}