import { useMemo, useState } from 'react';
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
import { Loader2, AlertCircle, BookOpen, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/Input';
import { TrainingTrack, Roadmap } from '@/shared/store/coursesApi';
import ExpandableText from '@/shared/components/common/ExpandableText';
import RoadmapTimeline from './RoadmapTimeline';
import { MOCK_ROADMAPS } from './mockRoadmaps';

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
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation();
  const [selectedTrack, setSelectedTrack] = useState<TrainingTrack | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingRoadmapId, setEnrollingRoadmapId] = useState<string | null>(null);

  // Fall back to mock roadmaps if the backend hasn't returned anything yet,
  // so the UI is verifiable while the new endpoint is being wired up.
  // Also hydrate tracks from the catalog list when the roadmaps endpoint
  // returns tracks with only ids (or partial data).
  const roadmaps = useMemo(() => {
    if (!rawRoadmaps || rawRoadmaps.length === 0) return MOCK_ROADMAPS;

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

  // Normalize ids to strings so they match the roadmap transform output,
  // and include any track flagged as enrolled in the catalog list (covers
  // assignments inherited via the user's job title).
  const enrolledIds = useMemo(() => {
    const ids = new Set<string>();
    enrolledTracks.forEach((t) => ids.add(String(t.id)));
    allTracks.forEach((t) => {
      if (t.enrolled) ids.add(String(t.id));
    });
    return ids;
  }, [enrolledTracks, allTracks]);

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

  const handleEnroll = async (trackId: string) => {
    try {
      await enrollInCourse(trackId).unwrap();
      toast.success('Successfully enrolled!');
      refetchRoadmaps();
    } catch (error: any) {
      if (error?.status === 400) {
        toast.error('You are already enrolled in this track via your job title.');
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    }
  };

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

    if (succeeded > 0) {
      toast.success(
        `Enrolled in ${succeeded} ${succeeded === 1 ? 'track' : 'tracks'} of "${roadmap.name}".`
      );
    }
    if (failed > 0) {
      toast.error(
        `${failed} ${failed === 1 ? 'track' : 'tracks'} could not be enrolled.`
      );
    }
    refetchRoadmaps();
  };

  const filteredRoadmaps = useMemo(() => {
    if (!searchTerm.trim()) return roadmaps;
    const q = searchTerm.toLowerCase();
    return roadmaps
      .map((r) => {
        const matchesRoadmap =
          r.name.toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q);
        const matchingTracks = r.training_tracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description ?? '').toLowerCase().includes(q) ||
            (t.platform ?? '').toLowerCase().includes(q) ||
            (t.category ?? '').toLowerCase().includes(q)
        );
        if (matchesRoadmap) return r;
        if (matchingTracks.length > 0) return { ...r, training_tracks: matchingTracks };
        return null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [roadmaps, searchTerm]);

  if (isLoadingRoadmaps || isLoadingEnrolled) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading roadmaps...</p>
      </div>
    );
  }

  const usingMockData =
    !!roadmapsError || !rawRoadmaps || rawRoadmaps.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Learning Roadmaps</h2>
        <p className="text-muted-foreground mt-1">
          Follow guided paths step by step to grow your skills.
        </p>
      </div>

      {usingMockData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Showing mock roadmaps while the backend endpoint is being wired up.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roadmaps, tracks, categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredRoadmaps.length} of {roadmaps.length} roadmaps
      </div>

      {filteredRoadmaps.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No roadmaps found</AlertTitle>
          <AlertDescription>
            Try adjusting your search to find what you're looking for.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {filteredRoadmaps.map((roadmap) => (
            <RoadmapTimeline
              key={roadmap.id}
              roadmap={roadmap}
              enrolledIds={enrolledIds}
              isEnrolling={isEnrolling}
              isEnrollingRoadmap={enrollingRoadmapId === roadmap.id}
              onSelectTrack={setSelectedTrack}
              onEnroll={handleEnroll}
              onEnrollRoadmap={handleEnrollRoadmap}
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedTrack}
        onOpenChange={(open) => !open && setSelectedTrack(null)}
      >
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
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Loading courses...
                      </p>
                    </div>
                  ) : displayTrack?.courses && displayTrack.courses.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {displayTrack.courses.map((course, index) => (
                        <div
                          key={course.id || index}
                          className="p-4 flex items-start gap-4 bg-gray-50/80"
                        >
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-bold mt-0.5">
                            {index + 1}
                          </span>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-gray-900">{course.title}</p>
                            {course.description && (
                              <ExpandableText
                                text={course.description}
                                className="text-sm text-gray-600 mt-0.5"
                              />
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

                {!enrolledIds.has(String(displayTrack.id)) && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => {
                        handleEnroll(displayTrack.id);
                        setSelectedTrack(null);
                      }}
                      disabled={isEnrolling}
                      className="w-full sm:w-auto"
                    >
                      Enroll Now
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
