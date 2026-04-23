import type React from "react";
import { useCallback, useEffect } from "react";
import type { NotificationOut } from "../../../interfaces/notification.interface";
import ViewNotification from "./components/ViewNotification";
import Pagination from "../../../components/Pagination/Pagination";
import { useNotifications } from "../../../contexts/notifications.context";


const NotificationsPreviewPage: React.FC = () => {
    const {
        fetchNotifications,
        markAsRead,
        notifications,
        loading,
        currentPage,
        totalPages
    } = useNotifications();

    const handlePageChange = useCallback((page: number) => {
        fetchNotifications(page);
    }, [fetchNotifications]);

    const handleMarkAsRead = useCallback(async (notification: NotificationOut) => {
        await markAsRead(notification);
    }, [markAsRead]);

    const pagination = (Array.from({ length: totalPages || 1 }, (_, i) => ({
        pageNumber: i + 1,
        isActive: i + 1 === currentPage || true,
    })));


    useEffect(() => {
        fetchNotifications(currentPage || 1);
    }, [])

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