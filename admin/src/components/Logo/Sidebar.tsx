import { Link } from "react-router-dom";


/**
 * Logo Component
 * Based on Figma: x: -6261, y: -695, w: 181, h: 26
 */
const SidebarLogo: React.FC = () => {
  return (
    <div className="flex items-center py-6">
      <Link to="/" className="flex items-center">
        <div className="text-logo flex flex-col items-start">
          <span className="text-bold">Portfolio</span>
          <span>Management</span>
        </div>
      </Link>
    </div>
  );
};

export default SidebarLogo;