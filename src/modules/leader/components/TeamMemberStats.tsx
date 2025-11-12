import { motion } from "framer-motion"
import { CheckCircle2, BookOpen, AlertTriangle } from "lucide-react"

interface TeamMemberStatsProps {
  completedCourses: number
  activeCourses: number
  overdueCourses: number
}

export default function TeamMemberStats({
  completedCourses,
  activeCourses,
  overdueCourses
}: TeamMemberStatsProps) {
  const stats = [
    {
      label: "Completed",
      value: completedCourses,
      color: "text-emerald-500",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    },
    {
      label: "In Progress",
      value: activeCourses,
      color: "text-blue-500",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />
    },
    {
      label: "Overdue",
      value: overdueCourses,
      color: "text-red-500",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  ]

  return (
    <div className="grid grid-cols-3 gap-4 pt-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center justify-center rounded-xl border border-border/30 bg-muted/30 backdrop-blur-sm py-3 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-1 mb-1">
            {stat.icon}
            <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
          </div>
          <p className="text-xs text-muted-foreground tracking-wide">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
