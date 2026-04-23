import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { NotificationOut } from "../interfaces/notification.interface";
import notificationService from "../services/notification.service";
import { ToastContext } from "./toast.context";

const PAGE_SIZE = 20;

export type NotificationsContextValue = {
    notifications: NotificationOut[];
    currentPage: number;
    totalPages: number;
    loading: boolean;
    hasUnreadNotifications: boolean;
    fetchNotifications: (page: number) => Promise<void>;
    markAsRead: (notification: NotificationOut) => Promise<void>;
};

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationOut[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(false);

    const toastContext = useContext(ToastContext);

    const addToast = useCallback(
        (message: string, type: "success" | "error") => {
            toastContext?.addToast({ message, type });
        },
        [toastContext]
    );

    const fetchNotifications = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const data = await notificationService.listNotifications(page, PAGE_SIZE);
            setNotifications(data.items);
            setCurrentPage(page);
            setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)));
            setHasUnreadNotifications(data.items.some((n) => !n.is_read));
        } catch {
            addToast("Failed to load notifications", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    const markAsRead = useCallback(
        async (notification: NotificationOut) => {
            try {
                await notificationService.markNotificationsAsRead({
                    notification_ids: [notification.id],
                });
                addToast(`Marked "${notification.title}" as read`, "success");
                setNotifications((prev) => {
                    const updated = prev.map((n) =>
                        n.id === notification.id ? { ...n, is_read: true } : n
                    );
                    setHasUnreadNotifications(updated.some((n) => !n.is_read));
                    return updated;
                });
            } catch {
                addToast("Failed to mark notification as read", "error");
            }
        },
        [addToast]
    );

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const value = useMemo<NotificationsContextValue>(
        () => ({
            notifications,
            currentPage,
            totalPages,
            loading,
            hasUnreadNotifications,
            fetchNotifications,
            markAsRead,
        }),
        [notifications, currentPage, totalPages, loading, hasUnreadNotifications, fetchNotifications, markAsRead]
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}
