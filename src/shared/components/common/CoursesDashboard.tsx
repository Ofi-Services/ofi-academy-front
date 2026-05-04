import { useMemo, useState, useEffect } from "react"
import StatsCard from "@/shared/components/common/StatsCard"
import CourseCard from "@/shared/components/common/CourseCard"
import CourseProgressDialog from "@/shared/components/common/CourseProgressDialog"
import { BookOpen, Award, TrendingUp, Monitor, Activity, LayoutGrid, List } from "lucide-react"
import { useGetEnrolledCoursesQuery } from "../../store/coursesApi"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import FilterControls, { FilterConfig } from "@/shared/components/common/FilterControls"
import { useDataFilter } from "@/shared/hooks/useDataFilter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'

export default function TrainingTracksDashboard() {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardViewMode');
    if (saved === 'cards' || saved === 'table') {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('dashboardViewMode', mode);
  };

  // RTK Query hooks
  const { 
    data: courses, 
    isLoading: coursesLoading, 
    error: coursesError 
  } = useGetEnrolledCoursesQuery()
  
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
    data: courses || [],
    searchFields: ["title", "description"],
    sortField: "title",
    itemsPerPage: 9,
    customFilters: useMemo(() => ({
      progress: (course: any, value: string) => {
        const p = course.progress_percentage || 0
        switch (value) {
          case "lt25": return p < 25
          case "lt50": return p < 50
          case "lt75": return p < 75
          case "completed": return p === 100
          default: return true
        }
      }
    }), [])
  })

  // Calculate progress locally from tracks data
  const progress = useMemo(() => {
    if (!courses) return null
    
    const activeTracks = courses.filter(track => 
      (track.progress_percentage || 0) > 0 && (track.progress_percentage || 0) < 100
    ).length
    
    const totalProgress = courses.reduce((sum, track) => sum + (track.progress_percentage || 0), 0)
    const averageTrackProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0
    
    const completedTracks = courses.filter(track => 
      (track.progress_percentage || 0) === 100
    ).length
    
    return {
      activeTracks,
      averageTrackProgress,
      completedTracks
    }
  }, [courses])

  // Extract unique categories
  const categories = useMemo(() => {
    if (!courses) return []
    const uniqueCategories = new Set(courses.map(course => course.category).filter((category): category is string => category !== undefined))
    return Array.from(uniqueCategories).sort()
  }, [courses])

  // Extract unique platforms
  const platforms = useMemo(() => {
    if (!courses) return []
    const uniquePlatforms = new Set(courses.map(course => course.platform).filter((platform): platform is string => platform !== undefined))
    return Array.from(uniquePlatforms).sort()
  }, [courses])

  // Filter configuration
  const filterConfigs: FilterConfig[] = [
    {
      key: "category",
      label: "Category",
      placeholder: "All Categories",
      options: categories.map(category => ({ value: category, label: category }))
    },
    {
      key: "platform",
      label: "Platform",
      placeholder: "All Platforms",
      icon: Monitor,
      options: platforms.map(platform => ({ value: platform, label: platform }))
    },
    {
      key: "progress",
      label: "Progress",
      placeholder: "All Progress",
      icon: Activity,
      options: [
        { value: "lt25", label: "Less than 25%" },
        { value: "lt50", label: "Less than 50%" },
        { value: "lt75", label: "Less than 75%" },
        { value: "completed", label: "Completed" }
      ]
    }
  ]

  // Loading state
  if (coursesLoading) {
    return (
      <div className="space-y-8">
        
        {/* Stats Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        
        {/* Filters Loading Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        {/* Courses Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (coursesError) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load your progress data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Active Training Tracks"
          value={progress?.activeTracks || 0}
          icon={BookOpen}
          color="success"
        />
        <StatsCard
          label="Average Track Progress"
          value={`${progress?.averageTrackProgress || 0}%`}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          label="Training Tracks"
          value={progress?.completedTracks || 0}
          icon={Award}
          color="success"
        />
      </div>

      {/* Filters */}
      <FilterControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search training tracks..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={updateFilter}
        sortOrder={sortOrder}
        onSortToggle={toggleSortOrder}
      />

      {/* Results Count & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredAndSortedData.length} training tracks
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

      {/* Course Cards */}
      {filteredAndSortedData.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No training tracks found</AlertTitle>
          <AlertDescription>
            Try adjusting your search or filter to find what you're looking for.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {paginatedData.map((course) => (
                <CourseCard
                  key={course.id}
                  courseId={course.id}
                  title={course.title}
                  description={course.description}
                  progress={course.progress_percentage || 0}
                  completedLessons={course.completed_courses || 0}
                  totalLessons={course.total_courses || 0}
                  platform={course.platform}
                  category={course.category}
                  duration={course.duration}
                  dueDate={course.due_date ? new Date(course.due_date) : null}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-md animate-in fade-in duration-300">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Author</TableHead>
                    <TableHead className="hidden sm:table-cell text-center">Category</TableHead>
                    <TableHead className="w-48 text-center">Progress</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((course) => {
                    const progressValue = course.progress_percentage || 0;
                    return (
                      <TableRow key={course.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="line-clamp-1">{course.title}</div>
                          <div className="md:hidden text-xs text-muted-foreground mt-1 flex gap-2">
                            <span>{course.platform || 'General'}</span>
                            {course.category && <span>• {course.category}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center text-muted-foreground">
                          {course.platform || 'General'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          {course.category ? (
                            <Badge variant="outline" className="text-xs font-normal">
                              {course.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1.5 mx-auto max-w-40">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {course.completed_courses || 0} / {course.total_courses || 0}
                              </span>
                              <span className="font-medium">{Math.round(progressValue)}%</span>
                            </div>
                            <Progress value={progressValue} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                            onClick={() => setSelectedCourseId(course.id)}
                          >
                            Continue
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
                variant="muted"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "muted"}
                    onClick={() => setCurrentPage(page)}
                    className="min-w-10 px-3"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="muted"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {selectedCourseId && (
        <CourseProgressDialog
          courseId={selectedCourseId}
          open={!!selectedCourseId}
          onOpenChange={(open) => !open && setSelectedCourseId(null)}
        />
      )}
    </div>
  )
}