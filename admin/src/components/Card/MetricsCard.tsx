import type React from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  isPercentage?: boolean;
}

// ─── Gauge Sub-component ────────────────────────────────────────────────────

interface GaugeProps {
  percentage: number;
}

const Gauge: React.FC<GaugeProps> = ({ percentage }) => {
  const radius = 48;
  const halfCircumference = Math.PI * radius; // ≈ 150.8
  const clamped = Math.min(Math.max(percentage, 0), 100);

  // Offset of 0 = full arc visible; offset = halfCircumference = nothing visible
  const strokeDashoffset = halfCircumference * (1 - clamped / 100);

  // Traffic-light coloring
  const strokeColor =
    clamped < 33
      ? "var(--color-error)"
      : clamped < 67
      ? "var(--color-warning)"
      : "var(--color-success)";

  // End-point angle labels (0 % on the left, 100 % on the right)
  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-family-primary)",
    fontSize: "var(--font-size-xs)",
    fill: "var(--color-gray-500)",
  };

  return (
    <svg
      width="130"
      height="72"
      viewBox="0 0 120 72"
      fill="none"
      aria-hidden="true"
    >
      {/* Background track */}
      <path
        d="M 12 60 A 48 48 0 0 1 108 60"
        stroke="var(--color-gray-200)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Foreground fill — animated via stroke-dashoffset */}
      <path
        d="M 12 60 A 48 48 0 0 1 108 60"
        stroke={strokeColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={halfCircumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
      />

      
    </svg>
  );
};

// ─── MetricsCard ────────────────────────────────────────────────────────────

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  unit,
  isPercentage,
}) => {
  const numericValue =
    typeof value === "string" ? parseFloat(value) : value;

  /* ── Percentage variant ── */
  if (isPercentage) {
    return (
      <div className="card flex flex-col items-center gap-1">
        {/* Title */}
        <p className="text-caption text-muted self-start w-full">{title}</p>

        {/* Gauge + value */}
        <div className="flex flex-col items-center">
          <Gauge percentage={numericValue} />

          {/* Value sits just below the arc baseline */}
          <div className="flex items-baseline gap-1 -mt-3">
            <span
              style={{
                fontFamily: "var(--font-family-primary)",
                fontSize: "var(--font-size-2xl)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              {value}
            </span>
            {unit && (
              <span className="text-caption text-muted">{unit}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Numerical variant ── */
  return (
    <div className="card flex flex-col gap-2">
      {/* Title */}
      <p className="text-caption text-muted">{title}</p>

      {/* Value + unit */}
      <div className="flex items-baseline gap-1.5 mt-auto justify-end">
        <span
          style={{
            fontFamily: "var(--font-family-primary)",
            fontSize: "var(--font-size-3xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-caption text-muted">{unit}</span>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;