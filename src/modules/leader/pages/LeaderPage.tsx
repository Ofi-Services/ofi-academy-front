import { useState, useMemo } from "react"
import { AlertCircle, Users2, TrendingUp, AlertTriangle, Award } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import StatsCard from "@/shared/components/common/StatsCard"
import FilterControls, { FilterConfig } from "@/shared/components/common/FilterControls"
import { useDataFilter } from "@/shared/hooks/useDataFilter"
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

  // Data filtering hook
  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    sortOrder,
    toggleSortOrder,
    currentPage,
    setCurrentPage,
    filteredAndSortedData,
    paginatedData,
    totalPages
  } = useDataFilter({
    data: teamMembers || [],
    searchFields: ["name"],
    sortField: "name",
    itemsPerPage: 6
  })

  // Extract unique roles
  const roles = useMemo(() => {
    if (!teamMembers) return []
    const uniqueRoles = new Set(
      teamMembers
        .map(member => member.role)
        .filter((role): role is string => role !== undefined)
    )
    return Array.from(uniqueRoles).sort()
  }, [teamMembers])

  // Filter configuration
  const filterConfigs: FilterConfig[] = [
    {
      key: "role",
      label: "Role",
      placeholder: "All Roles",
      options: roles.map(role => ({ value: role, label: role }))
    },
    {
      key: "status",
      label: "Status",
      placeholder: "All Statuses",
      options: [
        { value: "at_risk", label: "At Risk" },
        { value: "on_track", label: "On Track" }
      ]
    }
  ]

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

      {/* Team Members Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Team Progress</h2>
        
        {/* Filters */}
        <FilterControls
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name..."
          filters={filterConfigs}
          filterValues={filters}
          onFilterChange={updateFilter}
          sortOrder={sortOrder}
          onSortToggle={toggleSortOrder}
        />

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredAndSortedData.length} members
        </div>

        {/* Team Members Cards */}
        {filteredAndSortedData.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No team members found</AlertTitle>
            <AlertDescription>
              Try adjusting your search or filter to find what you're looking for.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedData.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onViewTracks={setSelectedMember}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="min-w-10 px-3"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
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