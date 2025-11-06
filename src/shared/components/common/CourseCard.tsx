import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Clock, User, Calendar } from "lucide-react"
import CourseProgressDialog from "./CourseProgressDialog"

interface CourseCardProps {
  courseId: string
  title: string
  description?: string
  progress: number
  completedLessons: number
  totalLessons: number
  platform?: string
  category?: string
  duration?: string
  dueDate?: Date | null // ✅ Added new prop
}

// Mapa de colores y gradientes por categoría
const categoryStyles: Record<string, { gradient: string; badgeClass: string }> = {
  "Frontend Development": {
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
  },
  "Backend Development": {
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
    badgeClass: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20"
  },
  "Programming Languages": {
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
  },
  "Databases": {
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20"
  },
  "API Development": {
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
  },
  "Cloud Computing": {
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-600",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20"
  },
  "Data Science": {
    gradient: "bg-gradient-to-br from-amber-500 to-yellow-600",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
  },
  "Security": {
    gradient: "bg-gradient-to-br from-red-600 to-rose-700",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
  },
  "default": {
    gradient: "bg-gradient-to-br from-gray-500 to-slate-600",
    badgeClass: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20"
  }
}

export default function CourseCard({
  courseId,
  title,
  description,
  progress,
  completedLessons,
  totalLessons,
  platform,
  category,
  duration,
  dueDate, // ✅ new prop
}: CourseCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  let progressColor = "bg-destructive"
  let progressLabel = "Needs attention"
  
  if (progress < 50) {
    progressColor = "bg-destructive"
    progressLabel = "Needs attention"
  } else if (progress >= 85) {
    progressColor = "bg-green-500"
    progressLabel = "Almost there!"
  } else if (progress >= 60) {
    progressColor = "bg-primary"
    progressLabel = "Good progress"
  }

  // Obtener el estilo de la categoría
  const categoryStyle = category && categoryStyles[category] 
    ? categoryStyles[category] 
    : categoryStyles.default

  // ✅ Format due date
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <>
      <Card className="bg-card border-border transition-all hover:shadow-lg overflow-hidden group">
        {/* Header con color de categoría */}
        <div className={`relative h-12 ${categoryStyle.gradient} flex items-center justify-center`}>
          {category && (
            <Badge className={`absolute top-3 right-3 ${categoryStyle.badgeClass} backdrop-blur-sm`}>
              {category}
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1 transition-colors">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Platform, Duration and Due Date */}
          {(platform || duration || dueDate) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {platform && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="line-clamp-1">{platform}</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{duration}</span>
                </div>
              )}
              {formattedDueDate && (
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Due: {formattedDueDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{progressLabel}</span>
              <span className="text-lg font-bold text-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Course Info */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{completedLessons}</span> / {totalLessons} modules completed
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setDialogOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            size="lg"
          >
            Continue Course
          </Button>
        </CardContent>
      </Card>

      {/* Course Progress Dialog */}
      <CourseProgressDialog
        courseId={courseId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
