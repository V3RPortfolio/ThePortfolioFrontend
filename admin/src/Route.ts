import NotFound from "./pages/404";
import type { RouteProps } from "react-router-dom";
import Home from "./pages/Home";
import ProcessInformationPage from "./pages/MetricsOverview/ProcessInformation";
import { baseUrl } from "./constants";
import DeviceInformationPage from "./pages/MetricsOverview/DeviceInformation";
import OrganizationSettingsPage from "./pages/Settings/Organization/OrganizationSettings";
import NotificationsPreviewPage from "./pages/Settings/Notifications/NotificationPreview";
import DeviceSettingsPage from "./pages/Settings/Devices/DeviceSettings";


export interface SidebarRoutesDTO {
    id: string;
    label: string;
    icon?: React.ReactNode;

    path: string;
    parentRoute?: string;
    component?: React.JSX.ElementType|undefined;
    isRedirect?: boolean;

    props?: RouteProps;

    ordering?: number;
}

export function SidebarRoutes(): SidebarRoutesDTO[] {
    const base = `${baseUrl.replace(/\/$/, '')}`;
    return [
        {
            path: `${base}/`,
            component: Home,
            id: 'dashboard',
            label: 'Dashboard',
            ordering: 1
        },

        {
            path: `${base}/process-information/`,
            component: ProcessInformationPage,
            id: 'process-information',
            label: 'Process Information'
        },
        {
            path: `${base}/device-information/`,
            component: DeviceInformationPage,
            id: 'device-information',
            label: 'Device Information'
        },
        {
            path: `${import.meta.env.VITE_APP_WEBSITE_URL || '/'}`,
            isRedirect: true,
            id: 'website',
            label: 'Website',
            ordering: 99999
        },
        {
            path: '',
            id: 'settings',
            label: 'Settings',
        },
        {
            path: `${base}/settings/organization/`,
            component: OrganizationSettingsPage,
            id: 'organization-settings',
            label: 'Organization',
            parentRoute: 'settings',
        },
        {
            path: `${base}/settings/devices/`,
            component: DeviceSettingsPage,
            id: 'device-settings',
            label: 'Devices',
            parentRoute: 'settings',
        },
        {
            path: `${base}/settings/notifications/`,
            component: NotificationsPreviewPage,
            id: 'notification-settings',
            label: 'Notifications',
            parentRoute: 'settings',
        }
    ];
}


export function AdditionalRoutes(): SidebarRoutesDTO[] {
    return [
        {
            path: '*',
            component: NotFound,
            id: 'not-found',
            label: 'Not Found'
        }
    ];
}

export const AllRoutes = (): SidebarRoutesDTO[] => {
    return [...SidebarRoutes(), ...AdditionalRoutes()].map(route => ({
        ...route,
        path: route.path
    }));
}