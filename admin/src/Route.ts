import NotFound from "./pages/404";
import type { RouteProps } from "react-router-dom";
import Home from "./pages/Home";
import DataEngineeringPage from "./pages/DataEngineering";
import { baseUrl } from "./constants";


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
            path: `${base}/frontend-components`,
            component: Home,
            id: 'frontend-components',
            label: 'Frontend Components'
        },

        {
            path: `${base}/backend-components`,
            component: Home,
            id: 'backend-components',
            label: 'Backend Components'
        },

        {
            path: `${base}/system-designs`,
            component: Home,
            id: 'system-designs',
            label: 'System Designs'
        },

        {
            path: `${base}/artificial-intelligence`,
            component: Home,
            id: 'artificial-intelligence',
            label: 'Artificial Intelligence'
        },

        {
            path: `${base}/data-engineering/`,
            component: DataEngineeringPage,
            id: 'data-engineering',
            label: 'Data Engineering'
        },
        {
            path: `${base}/deployment-pipelines`,
            component: Home,
            id: 'deployment-pipelines',
            label: 'Deployment Pipelines'
        },
        {
            path: `${base}/cloud-infrastructure`,
            component: Home,
            id: 'cloud-infrastructure',
            label: 'Cloud Infrastructure & Networking'
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