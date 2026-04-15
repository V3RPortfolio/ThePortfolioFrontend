import type React from "react";
import type { NotificationOut } from "../../../../interfaces/notification.interface";

interface ViewNotificationProps {
    notification: NotificationOut;
    onMarkAsRead: (notification: NotificationOut) => void;
}

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23A3AED0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/%3E%3Cpath d='M13.73 21a2 2 0 0 1-3.46 0'/%3E%3C/svg%3E";

const ViewNotification: React.FC<ViewNotificationProps> = ({ notification, onMarkAsRead }) => {
    return (
        <div
            className="flex items-center gap-4 px-5 py-4 transition-colors duration-150"
            style={{
                backgroundColor: notification.is_read ? "transparent" : "var(--color-primary-50)",
            }}
        >
            {/* Image column */}
            <div className="flex-shrink-0">
                <img
                    src={notification.image_url || placeholderImage}
                    alt={notification.title}
                    className="rounded-full object-cover"
                    style={{
                        width: "var(--icon-size-2xl)",
                        height: "var(--icon-size-2xl)",
                        border: "1px solid var(--color-border)",
                    }}
                />
            </div>

            {/* Title and description column */}
            <div className="flex-1 min-w-0">
                <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                    title={notification.title}
                >
                    {notification.title}
                </p>
                {notification.description && (
                    <p
                        className="text-xs mt-1 truncate"
                        style={{ color: "var(--color-text-secondary)" }}
                        title={notification.description}
                    >
                        {notification.description}
                    </p>
                )}
                <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {new Date(notification.created_at).toLocaleString()}
                </p>
            </div>

            {/* Actions column */}
            <div className="flex-shrink-0">
                {!notification.is_read && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onMarkAsRead(notification)}
                        title="Mark as read"
                    >
                        Mark as Read
                    </button>
                )}
                {notification.is_read && (
                    <span
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{
                            backgroundColor: "var(--color-tertiary-100)",
                            color: "var(--color-tertiary-700)",
                        }}
                    >
                        Read
                    </span>
                )}
            </div>
        </div>
    );
};

export default ViewNotification;
