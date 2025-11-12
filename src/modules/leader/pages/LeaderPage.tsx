import { useState, useMemo } from "react"
import { AlertCircle, Users2, TrendingUp, AlertTriangle, Award } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import StatsCard from "@/shared/components/common/StatsCard"
import { useGetTeamMembersQuery } from "../store/leaderApi"
import TrainingTracksDialog from "../components/TrainingTracksDialog"
import TeamMemberCard from "../components/TeamMemberCard"

export default function LeaderDashboard() {
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string } | null>(null)
  
  // RTK Query hook
  const { 
    data: teamMembers, 
    isLoading: membersLoading, 
    error: membersError 
  } = useGetTeamMembersQuery()

  // Calculate team statistics from team members data
  const teamStats = useMemo(() => {
    if (!teamMembers || teamMembers.length === 0) {
      return {
        totalMembers: 0,
        averageProgress: 0,
        atRiskMembers: 0,
        topPerformers: 0
      }
    }

    const totalMembers = teamMembers.length
    const averageProgress = Math.round(
      teamMembers.reduce((sum, member) => sum + member.completion_percentage, 0) / totalMembers
    )
    const atRiskMembers = teamMembers.filter(member => member.status === "at_risk").length
    const topPerformers = teamMembers.filter(member => member.status === "excellent").length

    return {
      totalMembers,
      averageProgress,
      atRiskMembers,
      topPerformers
    }
  }, [teamMembers])

  // Loading state
  if (membersLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Team Overview</h1>
        
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
  if (membersError) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Team Overview</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load team information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Team Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Team Members"
          value={teamStats.totalMembers}
          icon={Users2}
          color="primary"
        />
        <StatsCard
          label="Average Progress"
          value={`${teamStats.averageProgress}%`}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          label="At Risk"
          value={teamStats.atRiskMembers}
          icon={AlertTriangle}
          color="warning"
        />
        <StatsCard
          label="Top Performers"
          value={teamStats.topPerformers}
          icon={Award}
          color="success"
        />
      </div>

      {/* Team Members Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Team Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers?.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onViewTracks={setSelectedMember}
            />
          ))}
        </div>
      </div>

      {/* Training Tracks Dialog */}
      {selectedMember && (
        <TrainingTracksDialog
          userId={selectedMember.id}
          userName={selectedMember.name}
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
        />
      )}
    </>
  )
}