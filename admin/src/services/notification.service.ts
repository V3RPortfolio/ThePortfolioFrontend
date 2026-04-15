import httpService from "./http.service";
import { notificationApi } from "../constants";
import type {
    PaginatedNotificationOut,
    NotificationReadStatusUpdateOut,
    NotificationReadStatusUpdateIn,
} from "../interfaces/notification.interface";

export class NotificationService {

    async listNotifications(page: number = 1, pageSize: number = 10): Promise<PaginatedNotificationOut> {
        try {
            return await httpService.get<PaginatedNotificationOut>(
                `${notificationApi}/?page=${page}&page_size=${pageSize}`,
                {},
                true
            );
        } catch {
            return { items: [], total: 0, page, page_size: pageSize };
        }
    }

    async listUnreadNotifications(page: number = 1, pageSize: number = 10): Promise<PaginatedNotificationOut> {
        try {
            return await httpService.get<PaginatedNotificationOut>(
                `${notificationApi}/unread?page=${page}&page_size=${pageSize}`,
                {},
                true
            );
        } catch {
            return { items: [], total: 0, page, page_size: pageSize };
        }
    }

    async markNotificationsAsRead(data:NotificationReadStatusUpdateIn): Promise<NotificationReadStatusUpdateOut> {
        return httpService.post<NotificationReadStatusUpdateOut>(
            `${notificationApi}/mark-read`,
            {
                body: JSON.stringify(data),
            },
            true
        );
    }
}

export default new NotificationService();