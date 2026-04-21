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
      color: "text-[#13608b]",
      icon: <CheckCircle2 className="h-5 w-5 text-[#13608b]" />
    },
    {
      label: "In Progress",
      value: activeCourses,
      color: "text-primary",
      icon: <BookOpen className="h-5 w-5 text-primary" />
    },
    {
      label: "Overdue",
      value: overdueCourses,
      color: "text-[#848484]",
      icon: <AlertTriangle className="h-5 w-5 text-[#848484]" />
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
