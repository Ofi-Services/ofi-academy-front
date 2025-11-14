import { useState, useMemo } from "react"
import { AlertCircle, Users2, TrendingUp, AlertTriangle, Award, Search, ArrowUpDown } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Input } from "@/shared/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import StatsCard from "@/shared/components/common/StatsCard"
import { useGetTeamMembersQuery } from "../store/leaderApi"
import TrainingTracksDialog from "../components/TrainingTracksDialog"
import TeamMemberCard from "../components/TeamMemberCard"

const ITEMS_PER_PAGE = 6

export default function LeaderDashboard() {
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  
  // RTK Query hook
  const { 
    data: teamMembers, 
    isLoading: membersLoading, 
    error: membersError 
  } = useGetTeamMembersQuery()

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

  // Filter and sort team members
  const filteredAndSortedMembers = useMemo(() => {
    if (!teamMembers) return []
    
    const filtered = teamMembers.filter(member => {
      // Filter by search term (name)
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filter by role
      const matchesRole = selectedRole === "all" || member.role === selectedRole
      
      return matchesSearch && matchesRole
    })

    // Sort alphabetically by name
    filtered.sort((a, b) => {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()
      
      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB)
      } else {
        return nameB.localeCompare(nameA)
      }
    })

    return filtered
  }, [teamMembers, searchTerm, selectedRole, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMembers.length / ITEMS_PER_PAGE)
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredAndSortedMembers.slice(startIndex, endIndex)
  }, [filteredAndSortedMembers, currentPage])

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedRole, sortOrder])

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

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc")
  }

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
        
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Button */}
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="w-full sm:w-auto"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {paginatedMembers.length} of {filteredAndSortedMembers.length} members
        </div>

        {/* Team Members Cards */}
        {filteredAndSortedMembers.length === 0 ? (
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
              {paginatedMembers.map((member) => (
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