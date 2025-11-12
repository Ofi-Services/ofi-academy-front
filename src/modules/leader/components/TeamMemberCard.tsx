
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Eye, Calendar } from "lucide-react"
import TeamMemberStats from "../components/TeamMemberStats"
import { TeamMember } from "../types"
import { getStatusConfig, formatDate } from "../utils"

interface TeamMemberCardProps {
  member: TeamMember
  onViewTracks: (member: { id: number; name: string }) => void
}

export default function TeamMemberCard({ member, onViewTracks }: TeamMemberCardProps) {
  const statusConfig = getStatusConfig(member.status)

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with name and status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            <Badge 
              variant={statusConfig.variant}
              className={statusConfig.className}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-lg">{member.completion_percentage}%</span>
            </div>
            <Progress 
              value={member.completion_percentage} 
              className="h-2"
            />
          </div>

          {/* Stats Grid */}
          <TeamMemberStats
            completedCourses={member.completed_courses}
            activeCourses={member.active_courses}
            overdueCourses={member.overdue_courses}
          />

          {/* Footer with last activity and action */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last activity: {formatDate(member.lastActivity)}</span>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewTracks({ id: member.id, name: member.name })}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Tracks
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}