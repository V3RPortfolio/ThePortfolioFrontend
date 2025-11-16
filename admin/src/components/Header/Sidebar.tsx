import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidebarLogo from '../Logo/Sidebar';
import Separator from '../Divider/Separator';
import { type SidebarRoutesDTO, SidebarRoutes } from '../../Route';

// ============= INTERFACES =============


interface MenuItemProps {
  item: SidebarRoutesDTO;
  isActive: boolean;
  className?: string;
}

// ============= SUB-COMPONENTS =============


/**
 * MenuItem Component
 * Based on Figma: Each menu item has 36px height
 * Active state with background and text color changes
 */
const MenuItemComponent: React.FC<MenuItemProps> = ({ item, isActive, className }) => {
  return (
    <Link
      to={item.path}
      className={`link${isActive ? ' active' : ''} ${className}`}
    >
      {item.icon && <span className="icon">{item.icon}</span>}
      <span>{item.label}</span>
    </Link>
  );
};

/**
 * MenuSection Component
 * Based on Figma Pages group: Contains multiple menu items
 */
const MenuSection: React.FC = () => {
  const location = useLocation(); 
  const menus = SidebarRoutes().sort((a, b) => a.ordering && b.ordering ? a.ordering - b.ordering : a.ordering ? -1 : b.ordering ? 1 : a.label.localeCompare(b.label));
  return (
    <nav className="flex flex-col gap-2 mt-6">
      {menus.map((item, idx) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          isActive={location.pathname === item.path}
          className={idx < menus.length - 1 ? 'border-b-1 border-b-[var(--color-border)]': ''}
        />
        
      ))}
    </nav>
  );
};

// ============= MAIN SIDEBAR COMPONENT =============

/**
 * Sidebar Component
 * Based on Figma Frame: 290px × 1152px
 * - White background
 * - Bottom-right corner radius: 20px
 * - Fixed position with overflow scroll
 */
interface SidebarProps {
  fixed?: boolean;
  sidebarWidth?: string;
}
const Sidebar: React.FC<SidebarProps> = ({ fixed=false, sidebarWidth = 'w-1' }) => {
  return (
    <aside className={`${fixed ? `fixed left-0 top-0` : ''} ${sidebarWidth} h-screen overflow-y-auto overflow-x-hidden shadow-sm hidden md:flex md:flex-col`}>
      {/* Logo Section */}
      <SidebarLogo />

      {/* Separator */}
      <Separator className="mt-2" />

      {/* Menu Section */}
      <MenuSection />

      {/* Spacer to push ProCard to bottom */}
      <div className="flex-1 min-h-[200px]" />

    </aside>
  );
};

export default Sidebar;
