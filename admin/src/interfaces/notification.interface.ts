export interface NotificationOut {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    link_url: string | null;
    is_read: boolean;
    notification_type: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedNotificationOut {
    items: NotificationOut[];
    total: number;
    page: number;
    page_size: number;
}

export interface NotificationReadStatusUpdateOut {
    is_read: boolean;
    total_updated: number;
}

export interface NotificationReadStatusUpdateIn {
    notification_ids: string[];
}