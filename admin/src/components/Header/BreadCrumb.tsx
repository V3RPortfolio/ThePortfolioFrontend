import React from 'react';

interface NavigationLink {
  label: string;
  href?: string;
}

interface BreadCrumbProps {
  navigationLinks: NavigationLink[];
  pageTitle: string;
}

const BreadCrumb: React.FC<BreadCrumbProps> = ({ navigationLinks, pageTitle }) => {
  return (
    <div className="flex flex-col">
      {/* Navigation Links */}
      <nav className="flex items-center gap-xs">
        {navigationLinks.map((link, index) => (
          <React.Fragment key={index}>
            {link.href ? (
              <a href={link.href} className="text-caption text-muted link">
                {link.label}
              </a>
            ) : (
              <span className="text-caption text-muted">{link.label}</span>
            )}
            {index < navigationLinks.length - 1 && (
              <span className="text-caption text-muted">/</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Page Title */}
      <span className="text-heading p-[var(--padding-md)] pt-0">{pageTitle}</span>
    </div>
  );
};

export default BreadCrumb;
