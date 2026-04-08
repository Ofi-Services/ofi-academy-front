import { useMemo } from 'react';
import { useGetAllCoursesQuery, useGetEnrolledCoursesQuery, useEnrollInCourseMutation, TrainingTrack } from '@/shared/store/coursesApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, User, Monitor, AlertCircle } from 'lucide-react';
import FilterControls, { FilterConfig } from '@/shared/components/common/FilterControls';
import { useDataFilter } from '@/shared/hooks/useDataFilter';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';

export default function CatalogPage() {
  const { data: rawTracks, isLoading: isLoadingCatalog, refetch: refetchCatalog, error: catalogError } = useGetAllCoursesQuery();
  const { data: enrolledTracks = [], isLoading: isLoadingEnrolled } = useGetEnrolledCoursesQuery();
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();

  const enrolledIds = useMemo(() => {
    return new Set(enrolledTracks.map(t => t.id));
  }, [enrolledTracks]);

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
    data: rawTracks || [],
    searchFields: ["title", "description", "platform", "category"],
    sortField: "title",
    itemsPerPage: 9
  })

  const handleEnroll = async (trackId: string) => {
    try {
      await enrollInCourse(trackId).unwrap();
      toast.success('Successfully enrolled!');
      refetchCatalog();
    } catch (error: any) {
      if (error?.status === 400) {
        toast.error('You are already enrolled in this track via your job title.');
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    }
  };

  // Extract unique categories for filters
  const categories = useMemo(() => {
    if (!rawTracks) return []
    const uniqueCategories = new Set(rawTracks.map(track => track.category).filter((category): category is string => category !== undefined))
    return Array.from(uniqueCategories).sort()
  }, [rawTracks])

  // Extract unique platforms for filters
  const platforms = useMemo(() => {
    if (!rawTracks) return []
    const uniquePlatforms = new Set(rawTracks.map(track => track.platform).filter((platform): platform is string => platform !== undefined))
    return Array.from(uniquePlatforms).sort()
  }, [rawTracks])

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

  if (isLoadingCatalog || isLoadingEnrolled) {
    return (
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading catalog...</p>
        </div>
      </div>
    )
  }

  if (catalogError) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load the course catalog. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">Discover and self-enroll in new training paths.</p>
      </div>

      {/* Filters */}
      <FilterControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search courses, platforms or categories..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={updateFilter}
        sortOrder={sortOrder}
        onSortToggle={toggleSortOrder}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedData.length} of {filteredAndSortedData.length} training tracks
      </div>

      {/* Track Cards */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map((track) => {
              const isEnrolled = enrolledIds.has(track.id);

              return (
                <Card key={track.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <User className="w-4 h-4" />
                        {track.platform || 'General'}
                      </div>
                      {track.category && (
                        <Badge variant="outline" className="text-xs">
                          {track.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{track.title}</CardTitle>
                    <CardDescription className="line-clamp-2 h-10">
                      {track.description || 'Enhance your professional skills with this specialized training track.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Total Courses:</span>
                        <span className="font-medium text-foreground">{track.total_courses || track.courses?.length || 0}</span>
                      </div>
                      {track.duration && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Duration:</span>
                          <span className="font-medium text-foreground">{track.duration}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 mt-auto">
                    {isEnrolled ? (
                      <Button variant="outline" className="w-full" disabled>
                        Enrolled
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => handleEnroll(track.id)}
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
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
  );
}
