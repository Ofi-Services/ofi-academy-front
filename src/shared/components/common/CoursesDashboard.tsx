import { useState, useMemo } from "react"
import StatsCard from "@/shared/components/common/StatsCard"
import CourseCard from "@/shared/components/common/CourseCard"
import { BookOpen, Award, TrendingUp, Search, ArrowUpDown, Monitor } from "lucide-react"
import { useGetEnrolledCoursesQuery } from "../../store/coursesApi"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Input } from "@/shared/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"

const ITEMS_PER_PAGE = 9

export default function CoursesDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  
  // RTK Query hooks
  const { 
    data: courses, 
    isLoading: coursesLoading, 
    error: coursesError 
  } = useGetEnrolledCoursesQuery()
  
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

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return []
    
    const filtered = courses.filter(course => {
      // Filter by search term
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filter by category
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
      
      // Filter by platform
      const matchesPlatform = selectedPlatform === "all" || course.platform === selectedPlatform
      
      return matchesSearch && matchesCategory && matchesPlatform
    })

    // Sort alphabetically by title
    filtered.sort((a, b) => {
      const titleA = a.title.toLowerCase()
      const titleB = b.title.toLowerCase()
      
      if (sortOrder === "asc") {
        return titleA.localeCompare(titleB)
      } else {
        return titleB.localeCompare(titleA)
      }
    })

    return filtered
  }, [courses, searchTerm, selectedCategory, selectedPlatform, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / ITEMS_PER_PAGE)
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredAndSortedCourses.slice(startIndex, endIndex)
  }, [filteredAndSortedCourses, currentPage])

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedPlatform, sortOrder])

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc")
  }

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

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4">
        {/* First Row: Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Second Row: Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Platform Filter */}
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-full sm:w-52">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <SelectValue placeholder="All Platforms" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
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
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedCourses.length} of {filteredAndSortedCourses.length} courses
      </div>

      {/* Course Cards */}
      {filteredAndSortedCourses.length === 0 ? (
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
            {paginatedCourses.map((course) => (
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
  )
}