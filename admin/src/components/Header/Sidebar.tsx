import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidebarLogo from '../Logo/Sidebar';
import Separator from '../Divider/Separator';
import { type SidebarRoutesDTO, SidebarRoutes } from '../../Route';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useOrganization } from '../../contexts/organization.context';
import Dropdown from '../Filters/Dropdown';

// ============= INTERFACES =============


interface MenuItemProps {
  item: SidebarRoutesDTO;
  isActive: boolean;
  className?: string;
  childRoutes?: SidebarRoutesDTO[];
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
      reloadDocument={!!item.isRedirect || false}
      className={`link${isActive ? ' active' : ''} ${className}`}
    >
      {item.icon && <span className="icon">{item.icon}</span>}
      <span>{item.label}</span>
    </Link>
  );
};

/** 
 * MenuItem Dropdown Component
 * Based on Figma: Dropdown menu for items with submenus
 * - Each submenu item has 32px height
 * - Active state with background and text color changes
 */
const MenuItemDropdownComponent: React.FC<MenuItemProps> = ({ item, className, childRoutes }) => {
  // Placeholder for dropdown logic (e.g., state to toggle visibility)
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`dropdown ${className}`}>
      <div className="link dropdown-label flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {item.icon && <span className="icon">{item.icon}</span>}
        <span>{item.label}</span>
        {
          isOpen ? <ChevronUp size={16} className="dropdown-icon" />
          : <ChevronDown size={16} className="dropdown-icon" />
        }
      </div>
      
      {/* Dropdown content would go here, e.g., mapping childRoutes to MenuItemComponent */}
      {!childRoutes || !isOpen ? null : (
        <div className="dropdown-content pl-4">
          {childRoutes.map((child, idx) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              isActive={window.location.pathname === child.path} // Simple active check for child items
              className={(idx < childRoutes.length - 1 ? 'block border-b-1 border-b-[var(--color-border)]' : 'block')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * MenuSection Component
 * Based on Figma Pages group: Contains multiple menu items
 */
const MenuSection: React.FC = () => {
  const location = useLocation();
  const menus = SidebarRoutes().filter(r => !!r.component || r.isRedirect || (!r.component && r.path === '')).sort((a, b) => (a.ordering || 9999) - (b.ordering || 9999) > 0 ? 1 : -1);
  return (
    <nav className="flex flex-col gap-2 mt-6">
      {menus.map((item: SidebarRoutesDTO, idx: number) => {
        if(!!item.parentRoute) {
          // This is a child menu item, we will handle it in the dropdown component
          return null;
        }
        if(!item.component && item.path === '') {
          // This is a parent menu item without a component, likely a dropdown
          return <MenuItemDropdownComponent
            key={item.id}
            item={item}
            isActive={location.pathname.startsWith(item.path)}
            className={idx < menus.length - 1 ? 'border-b-1 border-b-[var(--color-border)]' : ''}
            childRoutes={menus.filter(x => x.parentRoute === item.id)}
          />
        }
        return <MenuItemComponent
          key={item.id}
          item={item}
          isActive={location.pathname === item.path}
          className={idx < menus.length - 1 ? 'border-b-1 border-b-[var(--color-border)]' : ''}
        />

      })}
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
const Sidebar: React.FC<SidebarProps> = ({ fixed = false, sidebarWidth = 'w-1' }) => {
  const { selectedOrg, selectOrg, organizations } = useOrganization();
  return (
    <aside className={`${fixed ? `fixed left-0 top-0` : ''} ${sidebarWidth} h-screen overflow-y-auto overflow-x-hidden shadow-sm hidden md:flex md:flex-col`}>
      {/* Logo Section */}
      <SidebarLogo />

      {organizations?.length && <Dropdown
        items={organizations.map(org => ({ name: org.name, value: org.id }))}
        value={selectedOrg?.id}
        handler={(org) => selectOrg(organizations.find(o => o.id === org)!)}
        label='Selected Organization'
      />}


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
