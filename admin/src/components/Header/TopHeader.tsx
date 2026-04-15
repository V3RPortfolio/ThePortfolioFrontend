import BreadCrumb, { type NavigationLink } from "./BreadCrumb";
import { AllRoutes, type SidebarRoutesDTO } from "../../Route";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { baseUrl } from "../../constants";
import { Bell } from "lucide-react";



const TopHeader: React.FC<{className?: string}> = ({className}) => {
    const location = useLocation();
    const allRoutes = AllRoutes().reduce((acc, route) => {
        acc[route.path] = route;
        return acc;
    }, {} as Record<string, SidebarRoutesDTO>);

    const [currentPaths, setCurrentPaths] = useState<NavigationLink[]>([]);

    const [notificationPath, setNotificationPath] = useState<SidebarRoutesDTO | null>(null);

    

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


    return <header className={`bg-[var(--color-background)] w-[100%] flex flex-row justify-between align-center flex-wrap ${className || ''}`}>
        {currentPaths.length > 0 && 
            <BreadCrumb 
            navigationLinks={currentPaths}
            pageTitle={currentPaths[currentPaths.length - 1].label}
            className="flex-1"
        />}
        <div className="toolbar-container mt-auto mb-auto p-[var(--padding-md)]">
            {notificationPath && <Link to={notificationPath.path} className="link">
                <Bell size={20} className="cursor-pointer" />
            </Link>}
        </div>
    </header>
}

export default TopHeader;