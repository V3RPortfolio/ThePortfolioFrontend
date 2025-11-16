



interface SeparatorProps {
  className?: string;
}

/**
 * Separator Component
 * Based on Figma: Horizontal line with specific styling
 */
const Separator: React.FC<SeparatorProps> = ({ className = '' }) => {
  return (
    <div className={`divider w-full ${className}`} />
  );
};


export default Separator;