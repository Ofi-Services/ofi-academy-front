import { useState, useMemo, useEffect } from "react"
import { AlertCircle, Users2, TrendingUp, AlertTriangle, Award, Download, Zap, LayoutGrid, List, Eye } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import StatsCard from "@/shared/components/common/StatsCard"
import FilterControls, { FilterConfig } from "@/shared/components/common/FilterControls"
import { useDataFilter } from "@/shared/hooks/useDataFilter"
import { useGetTeamMembersQuery, useLazyExportTalentsReportQuery } from "../store/leaderApi"
import TrainingTracksDialog from "../components/TrainingTracksDialog"
import TeamMemberCard from "../components/TeamMemberCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { getStatusConfig, formatDate } from "../utils"
// 1. Import useToast
import { useToast } from "@/shared/hooks/use-toast"

export default function LeaderDashboard() {
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string } | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  useEffect(() => {
    const saved = localStorage.getItem('leaderViewMode');
    if (saved === 'cards' || saved === 'table') {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('leaderViewMode', mode);
  };

  // 2. Initialize toast hook
  const { toast } = useToast()

  const [triggerExport, { isLoading: isExporting }] = useLazyExportTalentsReportQuery()

  const handleGenerateReport = async () => {
    toast({
      title: "Generating Report...",
      description: "Please wait while your team overview report is being prepared.",
      variant: "default",
    })

    try {
      const response = await triggerExport().unwrap()

      // Create a temporary link for download
      const url = window.URL.createObjectURL(response)
      const link = document.createElement("a")
      link.href = url

      // Suggested filename
      const date = new Date().toISOString().slice(0, 10)
      link.setAttribute("download", `talents_report_${date}.csv`)

      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)

      toast({
        title: "✅ Report Generated",
        description: "The talents report has been successfully downloaded.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error exporting CSV:", error)
      toast({
        title: "❌ Export Failed",
        description: "Could not generate the report. Please try again.",
        variant: "destructive",
      })
    }
  }

  // RTK Query hook
  const {
    data: teamMembers,
    isLoading: membersLoading,
    error: membersError
  } = useGetTeamMembersQuery()

  // ... (Rest of the useDataFilter, useMemo, filterConfigs, and teamStats are unchanged) ...

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
    itemsPerPage: 6,
    customFilters: useMemo(() => ({
      performance: (member: any, value: string) => {
        const p = member.completion_percentage || 0
        switch (value) {
          case "high": return p >= 75
          case "medium": return p >= 25 && p < 75
          case "low": return p > 0 && p < 25
          case "none": return p === 0
          default: return true
        }
      }
    }), [])
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

  // Extract unique regions
  const regions = useMemo(() => {
    if (!teamMembers) return []
    const uniqueRegions = new Set(
      teamMembers
        .map(member => member.region)
        .filter((region): region is string => region !== undefined)
    )
    return Array.from(uniqueRegions).sort()
  }, [teamMembers])

  // Extract unique titles
  const titles = useMemo(() => {
    if (!teamMembers) return []
    const uniqueTitles = new Set(
      teamMembers
        .map(member => member.title)
        .filter((title): title is string => title !== undefined)
    )
    return Array.from(uniqueTitles).sort()
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
      key: "region",
      label: "Region",
      placeholder: "All Regions",
      options: regions.map(region => ({ value: region, label: region }))
    },
    {
      key: "title",
      label: "Title",
      placeholder: "All Titles",
      options: titles.map(title => ({ value: title, label: title }))
    },
    {
      key: "status",
      label: "Status",
      placeholder: "All Statuses",
      options: [
        { value: "at_risk", label: "At Risk" },
        { value: "on_track", label: "On Track" }
      ]
    },
    {
      key: "performance",
      label: "Performance",
      placeholder: "Performance",
      icon: Zap,
      options: [
        { value: "high", label: "High (> 75%)" },
        { value: "medium", label: "Moderate (25-75%)" },
        { value: "low", label: "Starting (< 25%)" },
        { value: "none", label: "Not Started" }
      ]
    }
  ]

  // Calculate team statistics from filtered data
  const teamStats = useMemo(() => {
    if (!filteredAndSortedData || filteredAndSortedData.length === 0) {
      return {
        totalMembers: 0,
        averageProgress: 0,
        atRiskMembers: 0,
        topPerformers: 0
      }
    }

    const totalMembers = filteredAndSortedData.length
    const averageProgress = Math.round(
      filteredAndSortedData.reduce((sum, member) => sum + member.completion_percentage, 0) / totalMembers
    )
    const atRiskMembers = filteredAndSortedData.filter(member => member.status === "at_risk").length
    const topPerformers = filteredAndSortedData.filter(member => member.status === "excellent").length

    return {
      totalMembers,
      averageProgress,
      atRiskMembers,
      topPerformers
    }
  }, [filteredAndSortedData])

  // Loading state
  if (membersLoading) {
    return (
      <div className="space-y-8">

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
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Team Members"
          value={teamStats.totalMembers}
          icon={Users2}
          color="success"
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
          color="success"
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Team Progress</h2>
          <Button
            onClick={handleGenerateReport}
            variant="outline"
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>

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

        {/* Results Count & View Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredAndSortedData.length} members
          </div>
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md border">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              className={`px-2 py-1 h-8 ${viewMode === 'cards' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground'}`}
              onClick={() => handleViewModeChange('cards')}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className={`px-2 py-1 h-8 ${viewMode === 'table' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground'}`}
              onClick={() => handleViewModeChange('table')}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
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
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                {paginatedData.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onViewTracks={setSelectedMember}
                  />
                ))}
              </div>
            ) : (
              <div className="border rounded-md animate-in fade-in duration-300">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell text-center">Status</TableHead>
                      <TableHead className="w-48 text-center">Progress</TableHead>
                      <TableHead className="hidden lg:table-cell text-center">Courses</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">Last Activity</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((member) => {
                      const statusConfig = getStatusConfig(member.status)
                      return (
                        <TableRow key={member.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="font-semibold text-base mb-0.5">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                            <div className="md:hidden mt-1 flex gap-2 text-xs text-muted-foreground">
                              <span>{member.title}</span>
                              <span>•</span>
                              <span>{member.region}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-center">
                            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col gap-1.5 mx-auto max-w-40">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Overall</span>
                                <span className="font-medium">{member.completion_percentage}%</span>
                              </div>
                              <Progress value={member.completion_percentage} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-center text-sm">
                            <div className="text-muted-foreground">
                              <span className="font-medium text-foreground">{member.completed_courses}</span> completed
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium text-foreground">{member.active_courses}</span> active
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-center text-sm text-muted-foreground">
                            {formatDate(member.lastActivity)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMember({ id: member.id, name: member.name })}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

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
    </div>
  )
}