import NotFound from "./pages/404";
import type { RouteProps } from "react-router-dom";
import Home from "./pages/Home";
import ProcessInformationPage from "./pages/ProcessInformation";
import { baseUrl } from "./constants";
import DeviceInformationPage from "./pages/DeviceInformation";


export interface SidebarRoutesDTO {
    id: string;
    label: string;
    icon?: React.ReactNode;

    path: string;
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