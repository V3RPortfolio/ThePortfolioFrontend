import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// ============= INTERFACES =============

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

interface SeparatorProps {
  className?: string;
}

// ============= SUB-COMPONENTS =============

/**
 * Logo Component
 * Based on Figma: x: -6261, y: -695, w: 181, h: 26
 */
const Logo: React.FC = () => {
  return (
    <div className="flex items-center px-8 py-6">
      <Link to="/" className="flex items-center gap-3">
        <div className="text-2xl font-bold">
          <span className="text-[#4318FF]">HORIZON</span>
          <span className="text-[#1B2559] ml-1">UI</span>
        </div>
      </Link>
    </div>
  );
};

/**
 * Separator Component
 * Based on Figma: Horizontal line with specific styling
 */
const Separator: React.FC<SeparatorProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-px bg-linear-to-r from-transparent via-gray-200 to-transparent ${className}`} />
  );
};

/**
 * MenuItem Component
 * Based on Figma: Each menu item has 36px height
 * Active state with background and text color changes
 */
const MenuItemComponent: React.FC<MenuItemProps> = ({ item, isActive }) => {
  return (
    <Link
      to={item.path}
      className={`
        flex items-center gap-3 px-8 py-3 h-9
        text-sm font-medium transition-all duration-200
        hover:bg-gray-50 rounded-lg
        ${isActive 
          ? 'text-[#4318FF] bg-gray-50 font-bold' 
          : 'text-[#A3AED0] hover:text-[#1B2559]'
        }
      `}
    >
      {item.icon && <span className="text-base">{item.icon}</span>}
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
  
  const menuItems: MenuItem[] = [
    { id: '1', label: 'Authentication', path: '/authentication' },
    { id: '2', label: 'Profile', path: '/profile' },
    { id: '3', label: 'Kanban', path: '/kanban' },
    { id: '4', label: 'Tables', path: '/tables' },
    { id: '5', label: 'Data Tables', path: '/data-tables' },
    { id: '6', label: 'RTL', path: '/rtl' },
  ];

  return (
    <nav className="flex flex-col gap-2 mt-6">
      {menuItems.map((item) => (
        <MenuItemComponent
          key={item.id}
          item={item}
          isActive={location.pathname === item.path}
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
const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[290px] bg-white overflow-y-auto overflow-x-hidden rounded-br-[20px] shadow-sm flex flex-col max-lg:w-64 max-md:hidden">
      {/* Logo Section */}
      <Logo />

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
