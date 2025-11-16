interface ProCardProps {
  className?: string;
}


/**
 * ProCard Component
 * Based on Figma: 228×190px with gradient background and rounded corners
 * Position: x: -6284, y: 186
 */
const ProCard: React.FC<ProCardProps> = ({ className = '' }) => {
  return (
    <div className={`mx-7 mt-auto mb-6 ${className}`}>
      <div className="card relative overflow-hidden">
        {/* Decorative circle background */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-14 h-14 mb-4 rounded-full bg-white flex items-center justify-center">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-[#4318FF]"
            >
              <path 
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Text content */}
          <h3 className="text-title mb-2">
            Upgrade to PRO
          </h3>
          <p className="text-body mb-4">
            Improve your development process and start doing more with Horizon UI!
          </p>

          {/* Button */}
          <button className="btn-primary">
            Upgrade to PRO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProCard;