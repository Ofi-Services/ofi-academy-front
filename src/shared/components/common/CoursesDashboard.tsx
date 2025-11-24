import { useMemo } from "react"
import StatsCard from "@/shared/components/common/StatsCard"
import CourseCard from "@/shared/components/common/CourseCard"
import { BookOpen, Award, TrendingUp, Monitor } from "lucide-react"
import { useGetEnrolledCoursesQuery } from "../../store/coursesApi"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import FilterControls, { FilterConfig } from "@/shared/components/common/FilterControls"
import { useDataFilter } from "@/shared/hooks/useDataFilter"

export default function CoursesDashboard() {
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
    itemsPerPage: 9
  })

  // Calculate progress locally from courses data
  const progress = useMemo(() => {
    if (!courses) return null
    
    const activeCourses = courses.filter(course => 
      (course.progress_percentage || 0) > 0 && (course.progress_percentage || 0) < 100
    ).length
    
    const totalProgress = courses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0)
    const averageProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0
    
    const completedModules = courses.reduce((sum, course) => 
      sum + (course.completed_courses || 0), 0
    )
    
    return {
      activeCourses,
      averageProgress,
      completedModules
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
    }
  ]

  // Loading state
  if (coursesLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">My Learning Progress</h1>
        
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
        <h1 className="text-3xl font-bold">My Learning Progress</h1>
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
      <h1 className="text-3xl font-bold">My Learning Progress</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Active Courses"
          value={progress?.activeCourses || 0}
          icon={BookOpen}
          color="success"
        />
        <StatsCard
          label="Average Progress"
          value={`${progress?.averageProgress || 0}%`}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          label="Completed Modules"
          value={progress?.completedModules || 0}
          icon={Award}
          color="success"
        />
      </div>

      {/* Filters */}
      <FilterControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search courses..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={updateFilter}
        sortOrder={sortOrder}
        onSortToggle={toggleSortOrder}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedData.length} of {filteredAndSortedData.length} courses
      </div>

      {/* Course Cards */}
      {filteredAndSortedData.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No courses found</AlertTitle>
          <AlertDescription>
            Try adjusting your search or filter to find what you're looking for.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  )
}