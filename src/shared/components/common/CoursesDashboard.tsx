import { useState, useMemo } from "react"
import StatsCard from "@/shared/components/common/StatsCard"
import CourseCard from "@/shared/components/common/CourseCard"
import { BookOpen, Award, TrendingUp, Search } from "lucide-react"
import { useGetEnrolledCoursesQuery } from "../../store/coursesApi"
import { useAuth } from "@/shared/hooks/use-auth"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Input } from "@/shared/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

export default function CoursesDashboard() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // RTK Query hooks
  const { 
    data: courses, 
    isLoading: coursesLoading, 
    error: coursesError 
  } = useGetEnrolledCoursesQuery()
  
  // Commented out: Remote progress query
  // const { 
  //   data: progress, 
  //   isLoading: progressLoading, 
  //   error: progressError 
  // } = useGetUserProgressQuery(user?.id || "")

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

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (!courses) return []
    
    return courses.filter(course => {
      // Filter by search term
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filter by category
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [courses, searchTerm, selectedCategory])

  // Loading state (only courses now)
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

  // Error state (only courses now)
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
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
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

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
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
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCourses.length} of {courses?.length || 0} courses
      </div>

      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No courses found</AlertTitle>
          <AlertDescription>
            Try adjusting your search or filter to find what you're looking for.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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
            />
          ))}
        </div>
      )}
    </div>
  )
}