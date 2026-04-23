import type React from "react";
import { useCallback, useContext } from "react";
import type { NotificationOut } from "../../../interfaces/notification.interface";
import ViewNotification from "./components/ViewNotification";
import Pagination from "../../../components/Pagination/Pagination";
import { NotificationsContext } from "../../../contexts/notifications.context";


const NotificationsPreviewPage: React.FC = () => {
    const notificationsContext = useContext(NotificationsContext);

    const handlePageChange = useCallback((page: number) => {
        notificationsContext?.fetchNotifications(page);
    }, [notificationsContext?.fetchNotifications]);

    const handleMarkAsRead = useCallback(async (notification: NotificationOut) => {
        await notificationsContext?.markAsRead(notification);
    }, [notificationsContext?.markAsRead]);

    const pagination = (Array.from({ length: notificationsContext?.totalPages || 1 }, (_, i) => ({
        pageNumber: i + 1,
        isActive: i + 1 === notificationsContext?.currentPage || true,
    })));

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
                        {notificationsContext?.loading ? (
                            <div
                                className="text-center py-12 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Loading notifications…
                            </div>
                        ) : notificationsContext?.notifications.length === 0 ? (
                            <div
                                className="text-center py-12 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                No notifications found
                            </div>
                        ) : (
                            notificationsContext?.notifications.map((notification, idx) => (
                                <div
                                    key={notification.id}
                                    style={{
                                        borderBottom:
                                            idx < notificationsContext?.notifications.length - 1
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
                        totalPages={notificationsContext?.totalPages}
                    />
                </div>
            </div>
        </>
    );
};

export default NotificationsPreviewPage;