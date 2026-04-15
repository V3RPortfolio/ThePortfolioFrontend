import type React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import notificationService from "../../../services/notification.service";
import type { NotificationOut } from "../../../interfaces/notification.interface";
import ViewNotification from "./components/ViewNotification";
import Pagination from "../../../components/Pagination/Pagination";
import { ToastContext } from "../../../contexts/toast.context";

const PAGE_SIZE = 20;


const NotificationsPreviewPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationOut[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const toastContext = useContext(ToastContext);

    const addToast = (message: string, type: "success" | "error") => {
        toastContext?.addToast({
            message,
            type,
        })
    };

    const fetchNotifications = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const data = await notificationService.listNotifications(page, PAGE_SIZE);
            setNotifications(data.items);
            setCurrentPage(page);
            setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)));
        } catch {
            addToast("Failed to load notifications", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchNotifications(page);
    };

    const handleMarkAsRead = async (notification: NotificationOut) => {
        try {
            await notificationService.markNotificationsAsRead({
                notification_ids: [notification.id]
            });
            addToast(`Marked "${notification.title}" as read`, "success");
            fetchNotifications(currentPage);
        } catch {
            addToast("Failed to mark notification as read", "error");
        }
    };

    const pagination = Array.from({ length: totalPages }, (_, i) => ({
        pageNumber: i + 1,
        isActive: i + 1 === currentPage,
    }));

    return (
        <>
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-title">Notifications</h2>
                </div>

                <div className="card overflow-hidden p-0">
                    <h4
                        className="px-5 py-3 text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Your Notifications
                    </h4>

                    {/* Notification list */}
                    <div>
                        {loading ? (
                            <div
                                className="text-center py-12 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Loading notifications…
                            </div>
                        ) : notifications.length === 0 ? (
                            <div
                                className="text-center py-12 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                No notifications found
                            </div>
                        ) : (
                            notifications.map((notification, idx) => (
                                <div
                                    key={notification.id}
                                    style={{
                                        borderBottom:
                                            idx < notifications.length - 1
                                                ? "1px solid var(--color-border)"
                                                : "none",
                                    }}
                                >
                                    <ViewNotification
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        pagination={pagination}
                        paginationHandler={handlePageChange}
                        totalPages={totalPages}
                    />
                </div>
            </div>
        </>
    );
};

export default NotificationsPreviewPage;