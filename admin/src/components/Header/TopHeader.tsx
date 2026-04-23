import BreadCrumb, { type NavigationLink } from "./BreadCrumb";
import { AllRoutes, type SidebarRoutesDTO } from "../../Route";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { baseUrl, loginPath } from "../../constants";
import { Bell, CirclePowerIcon, Menu } from "lucide-react";
import httpService from "../../services/http.service";
import notificationService from "../../services/notification.service";



const TopHeader: React.FC<{className?: string; isSidebarOpen?: boolean; onToggleSidebar?: () => void}> = ({className, isSidebarOpen, onToggleSidebar}) => {
    const location = useLocation();
    const allRoutes = AllRoutes().reduce((acc, route) => {
        acc[route.path] = route;
        return acc;
    }, {} as Record<string, SidebarRoutesDTO>);

    const navigate = useNavigate();
    const [currentPaths, setCurrentPaths] = useState<NavigationLink[]>([]);

    const [notificationPath, setNotificationPath] = useState<SidebarRoutesDTO | null>(null);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);


    const handleLogout = async () => {
        // Clear tokens and redirect to login page
        httpService.clearTokens();
        navigate(loginPath);
    };

    

    useEffect(() => {
        let i=0;
        let currentPath = '';
        const paths: NavigationLink[] = [];
        while(i < location.pathname.length) {
            const path = currentPath + "/";
            if(allRoutes[path] && !allRoutes[path].isRedirect) {
                paths.push({
                    label: allRoutes[path].label,
                    href: allRoutes[path].path
                })
            }
            currentPath += location.pathname[i];
            i += 1
        }
        setCurrentPaths(paths);

        const notification = Object.values(allRoutes).find(route => route.id === "notification-settings");
        if(notification) {
            setNotificationPath(notification);
        }
    }, [location.pathname, baseUrl])

    useEffect(() => {
        notificationService.listUnreadNotifications(1, 1).then(result => {
            setHasUnreadNotifications(result.count > 0);
        }).catch(() => {
            setHasUnreadNotifications(false);
        });
    }, []);

    const notificationsUrl = `${baseUrl.replace(/\/$/, '')}/settings/notifications/`;

    return <header className={`bg-[var(--color-background)] w-[100%] flex flex-row justify-between align-center flex-wrap ${className || ''}`}>
        <div className="flex items-center flex-1">
            {!isSidebarOpen && (
                <button
                    onClick={() => onToggleSidebar?.()}
                    aria-label="Open sidebar"
                    className="p-[var(--padding-sm)] ml-[var(--padding-sm)] rounded-[var(--border-radius-base)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] transition-colors duration-[var(--transition-fast)] cursor-pointer"
                >
                    <Menu size={20} />
                </button>
            )}
            {currentPaths.length > 0 && 
                <BreadCrumb 
                navigationLinks={currentPaths}
                pageTitle={currentPaths[currentPaths.length - 1].label}
                className="flex-1"
            />}
        </div>
        <div className="toolbar-container mt-auto mb-auto p-[var(--padding-md)] flex flex-wrap gap-1 flex-start align-center">
            {notificationPath && (
                <a href={notificationsUrl} className="small-link relative">
                    <Bell
                        size={20}
                        className={`cursor-pointer ${hasUnreadNotifications ? 'text-[var(--color-primary-600)]' : ''}`}
                    />
                    {hasUnreadNotifications && (
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--color-error)]" />
                    )}
                </a>
            )}

            <button className="small-link" onClick={handleLogout}>
                <CirclePowerIcon size={20} className="cursor-pointer" />
            </button>
        </div>
    </header>
}

export default TopHeader;