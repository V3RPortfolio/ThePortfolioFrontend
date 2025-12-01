import NotFound from "./pages/404";
import type { RouteProps } from "react-router-dom";
import Home from "./pages/Home";


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
    return [
        {
            path: '/',
            component: Home,
            id: 'dashboard',
            label: 'Dashboard',
            ordering: 1
        },

        {
            path: '/frontend-components',
            component: Home,
            id: 'frontend-components',
            label: 'Frontend Components'
        },

        {
            path: '/backend-components',
            component: Home,
            id: 'backend-components',
            label: 'Backend Components'
        },

        {
            path: '/system-designs',
            component: Home,
            id: 'system-designs',
            label: 'System Designs'
        },

        {
            path: '/artificial-intelligence',
            component: Home,
            id: 'artificial-intelligence',
            label: 'Artificial Intelligence'
        },

        {
            path: '/data-engineering',
            component: Home,
            id: 'data-engineering',
            label: 'Data Engineering'
        },
        {
            path: '/deployment-pipelines',
            component: Home,
            id: 'deployment-pipelines',
            label: 'Deployment Pipelines'
        },
        {
            path: '/cloud-infrastructure',
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
    const baseUrl = import.meta.env.VITE_APP_BASE_URL || '';
    return [...SidebarRoutes(), ...AdditionalRoutes()].map(route => ({
        ...route,
        path: `${baseUrl}${route.path.replace(/^\//, '')}`
    }));
}