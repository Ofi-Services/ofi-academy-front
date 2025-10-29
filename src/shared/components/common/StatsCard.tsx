
import { Card, CardHeader } from "@/shared/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: "primary" | "success" | "warning" | "danger"
}

export default function StatsCard({ label, value, icon: Icon, color = "primary" }: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-destructive",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              {label}
            </div>
            <div className={`text-4xl font-bold ${colorClasses[color]}`}>
              {value}
            </div>
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg bg-muted ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}