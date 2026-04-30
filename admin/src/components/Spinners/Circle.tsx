import { Loader2 } from "lucide-react";

interface CircleSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

const CircleSpinner = ({
  size = 24,
  className = "",
  label = "Loading...",
}: CircleSpinnerProps) => {
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <Loader2
        size={size}
        className="animate-spin text-blue-500"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default CircleSpinner;
