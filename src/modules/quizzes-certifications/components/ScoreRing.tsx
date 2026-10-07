import { cn } from "@/shared/lib/utils"

interface ScoreRingProps {
  value: number
  passingScore?: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

/** Circular score indicator; green when the passing score is met, red otherwise. */
export default function ScoreRing({
  value,
  passingScore,
  size = 140,
  strokeWidth = 12,
  label,
  className,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const passed = passingScore === undefined || clamped >= passingScore
  // Passing-score tick, measured clockwise from 12 o'clock
  const marker =
    passingScore !== undefined
      ? {
          x: size / 2 + radius * Math.sin((passingScore / 100) * 2 * Math.PI),
          y: size / 2 - radius * Math.cos((passingScore / 100) * 2 * Math.PI),
        }
      : null

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-out",
            passed ? "stroke-emerald-500" : "stroke-red-500"
          )}
        />
      </svg>
      {marker && (
        <svg width={size} height={size} className="absolute inset-0" aria-hidden>
          <circle cx={marker.x} cy={marker.y} r={strokeWidth / 2.5} className="fill-background stroke-foreground/70" strokeWidth={2} />
        </svg>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-extrabold tabular-nums", size >= 120 ? "text-3xl" : "text-lg")}>
          {Math.round(clamped)}%
        </span>
        {label && <span className="text-[11px] text-muted-foreground font-medium">{label}</span>}
      </div>
    </div>
  )
}
