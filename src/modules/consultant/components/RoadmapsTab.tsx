import { useMemo, useState, useEffect } from 'react';
import {
  useGetAllRoadmapsQuery,
  useGetAllCoursesQuery,
  useGetEnrolledCoursesQuery,
  useEnrollInCourseMutation,
  useGetCourseDetailsQuery,
} from '@/shared/store/coursesApi';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, AlertCircle, BookOpen, Monitor, LayoutGrid, List, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table';
import { TrainingTrack, Roadmap } from '@/shared/store/coursesApi';
import ExpandableText from '@/shared/components/common/ExpandableText';
import RoadmapTimeline from './RoadmapTimeline';
import FilterControls, { FilterConfig } from '@/shared/components/common/FilterControls';

const ITEMS_PER_PAGE = 5;

export default function RoadmapsTab() {
  const {
    data: rawRoadmaps,
    isLoading: isLoadingRoadmaps,
    refetch: refetchRoadmaps,
    error: roadmapsError,
  } = useGetAllRoadmapsQuery();
  const { data: enrolledTracks = [], isLoading: isLoadingEnrolled } =
    useGetEnrolledCoursesQuery();
  const { data: allTracks = [] } = useGetAllCoursesQuery();
  const [enrollInCourse] = useEnrollInCourseMutation();
  const [selectedTrack, setSelectedTrack] = useState<TrainingTrack | null>(null);
  const [enrollingRoadmapId, setEnrollingRoadmapId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const saved = localStorage.getItem('roadmapsViewMode');
    if (saved === 'cards' || saved === 'table') setViewMode(saved);
  }, []);

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('roadmapsViewMode', mode);
  };

  const roadmaps = useMemo(() => {
    if (!rawRoadmaps) return [];
    const trackById = new Map(allTracks.map((t) => [String(t.id), t]));
    return rawRoadmaps.map((r) => ({
      ...r,
      training_tracks: r.training_tracks.map((t) => {
        const full = trackById.get(String(t.id));
        if (!full) return t;
        return {
          ...full,
          ...t,
          title: t.title || full.title,
          description: t.description || full.description,
          platform: t.platform || full.platform,
          category: t.category || full.category,
          duration: t.duration || full.duration,
          total_courses: t.total_courses ?? full.total_courses,
          courses: t.courses && t.courses.length > 0 ? t.courses : full.courses,
        };
      }),
    }));
  }, [rawRoadmaps, allTracks]);

  const enrolledIds = useMemo(() => {
    const ids = new Set<string>();
    enrolledTracks.forEach((t) => ids.add(String(t.id)));
    return ids;
  }, [enrolledTracks]);

  // Extract unique categories and platforms from all tracks across all roadmaps
  const { categories, platforms } = useMemo(() => {
    const cats = new Set<string>();
    const plats = new Set<string>();
    roadmaps.forEach((r) =>
      r.training_tracks.forEach((t) => {
        if (t.category) cats.add(t.category);
        if (t.platform) plats.add(t.platform);
      })
    );
    return {
      categories: Array.from(cats).sort(),
      platforms: Array.from(plats).sort(),
    };
  }, [roadmaps]);

  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      label: 'Category',
      placeholder: 'All Categories',
      options: categories.map((c) => ({ value: c, label: c })),
    },
    {
      key: 'platform',
      label: 'Platform',
      placeholder: 'All Platforms',
      icon: Monitor,
      options: platforms.map((p) => ({ value: p, label: p })),
    },
  ];

  const { data: trackDetails, isFetching: isFetchingDetails } = useGetCourseDetailsQuery(
    selectedTrack?.id ?? '',
    { skip: !selectedTrack }
  );

  const displayTrack = useMemo(() => {
    if (!selectedTrack) return null;
    if (trackDetails && trackDetails.id === selectedTrack.id) {
      return {
        ...selectedTrack,
        ...trackDetails,
        description: trackDetails.description || selectedTrack.description,
        courses:
          trackDetails.courses?.map((detailCourse) => {
            const listCourse = selectedTrack.courses?.find((c) => c.id === detailCourse.id);
            return {
              ...listCourse,
              ...detailCourse,
              description: detailCourse.description || listCourse?.description,
            };
          }) || selectedTrack.courses,
      };
    }
    return selectedTrack;
  }, [trackDetails, selectedTrack]);

  const handleEnrollRoadmap = async (roadmap: Roadmap) => {
    const pending = roadmap.training_tracks.filter((t) => !enrolledIds.has(String(t.id)));
    if (pending.length === 0) return;

    setEnrollingRoadmapId(roadmap.id);
    const results = await Promise.allSettled(
      pending.map((t) => enrollInCourse(t.id).unwrap())
    );
    setEnrollingRoadmapId(null);

    const failed = results.filter((r) => r.status === 'rejected').length;
    const succeeded = pending.length - failed;
    if (succeeded > 0)
      toast.success(`Enrolled in ${succeeded} ${succeeded === 1 ? 'track' : 'tracks'} of "${roadmap.name}".`);
    if (failed > 0)
      toast.error(`${failed} ${failed === 1 ? 'track' : 'tracks'} could not be enrolled.`);
    refetchRoadmaps();
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const filteredRoadmaps = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const categoryFilter = filters.category && filters.category !== 'all' ? filters.category : null;
    const platformFilter = filters.platform && filters.platform !== 'all' ? filters.platform : null;

    let result = roadmaps
      .map((r) => {
        // Apply category / platform filters at track level
        const tracksAfterFilter = r.training_tracks.filter((t) => {
          const matchCat = !categoryFilter || t.category === categoryFilter;
          const matchPlat = !platformFilter || t.platform === platformFilter;
          return matchCat && matchPlat;
        });

        // If both category and platform filters are active and no tracks match, drop the roadmap
        if ((categoryFilter || platformFilter) && tracksAfterFilter.length === 0) return null;

        const baseRoadmap = (categoryFilter || platformFilter)
          ? { ...r, training_tracks: tracksAfterFilter }
          : r;

        // Apply search
        if (!q) return baseRoadmap;

        const matchesRoadmap =
          baseRoadmap.name.toLowerCase().includes(q) ||
          (baseRoadmap.description ?? '').toLowerCase().includes(q);

        const matchingTracks = baseRoadmap.training_tracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description ?? '').toLowerCase().includes(q) ||
            (t.platform ?? '').toLowerCase().includes(q) ||
            (t.category ?? '').toLowerCase().includes(q)
        );

        if (matchesRoadmap) return baseRoadmap;
        if (matchingTracks.length > 0) return { ...baseRoadmap, training_tracks: matchingTracks };
        return null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    // Sort by name
    result = [...result].sort((a, b) =>
      sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

    return result;
  }, [roadmaps, searchTerm, filters, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRoadmaps.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRoadmaps = filteredRoadmaps.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isLoadingRoadmaps || isLoadingEnrolled) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading roadmaps...</p>
      </div>
    );
  }

  if (roadmapsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Unable to load roadmaps. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Learning Roadmaps</h2>
        <p className="text-muted-foreground mt-1">
          Follow guided paths step by step to grow your skills.
        </p>
      </div>

      <FilterControls
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search roadmaps, tracks, categories..."
        filters={filterConfigs}
        filterValues={filters}
        onFilterChange={updateFilter}
        sortOrder={sortOrder}
        onSortToggle={() => {
          setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
          setCurrentPage(1);
        }}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedRoadmaps.length} of {filteredRoadmaps.length} roadmaps
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

      {filteredRoadmaps.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No roadmaps found</AlertTitle>
          <AlertDescription>
            Try adjusting your search or filters to find what you're looking for.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {paginatedRoadmaps.map((roadmap) => (
                <RoadmapTimeline
                  key={roadmap.id}
                  roadmap={roadmap}
                  enrolledIds={enrolledIds}
                  isEnrollingRoadmap={enrollingRoadmapId === roadmap.id}
                  onSelectTrack={setSelectedTrack}
                  onEnrollRoadmap={handleEnrollRoadmap}
                />
              ))}
            </div>
          ) : (
            <div className="border rounded-md animate-in fade-in duration-300">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden lg:table-cell">Description</TableHead>
                    <TableHead className="text-center">Tracks</TableHead>
                    <TableHead className="text-center">Enrolled</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoadmaps.map((roadmap) => {
                    const tracks = roadmap.training_tracks ?? [];
                    const enrolledCount = tracks.filter((t) => enrolledIds.has(String(t.id))).length;
                    const allEnrolled = tracks.length > 0 && enrolledCount === tracks.length;
                    const isEnrollingThis = enrollingRoadmapId === roadmap.id;

                    return (
                      <TableRow key={roadmap.id}>
                        <TableCell className="font-medium max-w-[200px]">
                          <div className="line-clamp-1">{roadmap.name}</div>
                          <div className="md:hidden text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                            {roadmap.description}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-[400px]">
                          <div className="line-clamp-2 leading-relaxed">
                            {roadmap.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {tracks.length}
                        </TableCell>
                        <TableCell className="text-center">
                          {allEnrolled ? (
                            <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40">
                              <CheckCircle2 className="w-3 h-3" />
                              All enrolled
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {enrolledCount}/{tracks.length}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {allEnrolled ? (
                            <Button variant="outline" size="sm" disabled>
                              Enrolled
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90"
                              onClick={() => handleEnrollRoadmap(roadmap)}
                              disabled={isEnrollingThis || tracks.length === 0}
                            >
                              {isEnrollingThis ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Enroll'
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="muted"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={safePage === page ? 'default' : 'muted'}
                    onClick={() => setCurrentPage(page)}
                    className="min-w-10 px-3"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="muted"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedTrack} onOpenChange={(open) => !open && setSelectedTrack(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {displayTrack && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {displayTrack.platform || 'General'}
                  </Badge>
                  {displayTrack.category && (
                    <Badge variant="outline" className="text-xs">
                      {displayTrack.category}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">
                  {displayTrack.title || displayTrack.name}
                </DialogTitle>
                <div className="text-sm text-muted-foreground mt-1.5">
                  <ExpandableText
                    text={
                      displayTrack.description ||
                      'Enhance your professional skills with this specialized training track.'
                    }
                  />
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <BookOpen className="w-5 h-5" />
                  <h3>Courses in this track</h3>
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {isFetchingDetails ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-gray-50/50">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground animate-pulse">Loading courses...</p>
                    </div>
                  ) : displayTrack?.courses && displayTrack.courses.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {displayTrack.courses.map((course, index) => (
                        <div key={course.id || index} className="p-4 flex items-start gap-4 bg-gray-50/80">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-bold mt-0.5">
                            {index + 1}
                          </span>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-gray-900">{course.title}</p>
                            {course.description && (
                              <ExpandableText text={course.description} className="text-sm text-gray-600 mt-0.5" />
                            )}
                            {course.duration && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <span>•</span> {course.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-muted-foreground italic bg-gray-50/30">
                      No course details available for this track.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
