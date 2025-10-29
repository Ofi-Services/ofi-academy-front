
import StatsCard from "@/shared/components/common/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Users2, TrendingUp, AlertTriangle, Award } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { useGetTeamMembersQuery, useGetTeamProgressQuery } from "../store/leaderApi"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LeaderDashboard() {
  // RTK Query hooks
  const { 
    data: teamMembers, 
    isLoading: membersLoading, 
    error: membersError 
  } = useGetTeamMembersQuery()
  
  const { 
    data: teamProgress, 
    isLoading: progressLoading, 
    error: progressError 
  } = useGetTeamProgressQuery()

  // Loading state
  if (membersLoading || progressLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Team Performance Overview</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error state
  if (membersError || progressError) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Team Performance Overview</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load team data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Team Performance Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Team Members"
          value={teamProgress?.totalMembers || 0}
          icon={Users2}
          color="primary"
        />
        <StatsCard
          label="Average Progress"
          value={`${teamProgress?.averageProgress || 0}%`}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          label="At Risk"
          value={teamProgress?.atRiskMembers || 0}
          icon={AlertTriangle}
          color="warning"
        />
        <StatsCard
          label="Top Performers"
          value={teamProgress?.topPerformers || 0}
          icon={Award}
          color="success"
        />
      </div>

      {/* Team Members Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Team Members Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers?.slice(0, 8).map((member) => {
              let statusColor: "default" | "secondary" | "destructive" = "destructive"
              let statusLabel = "At Risk"
              
              if (member.status === "excellent") {
                statusColor = "default"
                statusLabel = "Excellent"
              } else if (member.status === "on_track") {
                statusColor = "secondary"
                statusLabel = "On Track"
              }

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{member.progress}%</div>
                      <div className="text-sm text-muted-foreground">
                        {member.completedCourses} courses completed
                      </div>
                    </div>
                    
                    <Badge variant={statusColor}>
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}