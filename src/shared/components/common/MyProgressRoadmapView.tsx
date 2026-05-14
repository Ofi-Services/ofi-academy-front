import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertCircle, CheckCircle2, BookOpen, Clock, Lock, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  useGetAllRoadmapsQuery,
  TrainingTrack,
} from '@/shared/store/coursesApi';

interface MyProgressRoadmapViewProps {
  courses: TrainingTrack[];
  onSelectCourse: (courseId: string) => void;
}

export default function MyProgressRoadmapView({
  courses,
  onSelectCourse,
}: MyProgressRoadmapViewProps) {
  const { data: rawRoadmaps, isLoading } = useGetAllRoadmapsQuery();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const roadmaps = useMemo(() => rawRoadmaps ?? [], [rawRoadmaps]);

  const enrolledById = useMemo(() => {
    const map = new Map<string, TrainingTrack>();
    courses.forEach((c) => map.set(String(c.id), c));
    return map;
  }, [courses]);

  const visibleRoadmaps = useMemo(() => {
    return roadmaps.filter((r) =>
      r.training_tracks.some((t) => enrolledById.has(String(t.id)))
    );
  }, [roadmaps, enrolledById]);

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading roadmaps...</p>
      </div>
    );
  }

  if (visibleRoadmaps.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No roadmap progress yet</AlertTitle>
        <AlertDescription>
          Your enrolled tracks aren't part of any roadmap yet. Browse the Roadmaps tab
          in the catalog to enroll in a guided learning path.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {visibleRoadmaps.map((roadmap) => {
        const isCollapsed = collapsedIds.has(roadmap.id);

        const enrolledTracks = roadmap.training_tracks.filter((t) =>
          enrolledById.has(String(t.id))
        );
        const completedCount = enrolledTracks.filter((t) => {
          const enrolled = enrolledById.get(String(t.id));
          return (enrolled?.progress_percentage ?? 0) === 100;
        }).length;
        const roadmapProgress =
          enrolledTracks.length > 0
            ? Math.round(
                enrolledTracks.reduce((sum, t) => {
                  const enrolled = enrolledById.get(String(t.id));
                  return sum + (enrolled?.progress_percentage ?? 0);
                }, 0) / enrolledTracks.length
              )
            : 0;

        return (
          <Card key={roadmap.id} className="overflow-hidden">
            {/* Header — clickable to collapse/expand */}
            <div
              className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 cursor-pointer select-none"
              onClick={() => toggleCollapsed(roadmap.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs uppercase tracking-wide">
                      Roadmap
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{enrolledTracks.length} completed
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{roadmap.name}</h2>
                  {roadmap.description && (
                    <p className="text-muted-foreground mt-1 max-w-3xl">
                      {roadmap.description}
                    </p>
                  )}
                  <div className="mt-4 max-w-md">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Overall progress</span>
                      <span className="font-medium">{roadmapProgress}%</span>
                    </div>
                    <Progress value={roadmapProgress} className="h-2" />
                  </div>
                </div>

                <button
                  aria-label={isCollapsed ? 'Expand roadmap' : 'Collapse roadmap'}
                  aria-expanded={!isCollapsed}
                  className="self-start p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground flex-shrink-0 sm:mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapsed(roadmap.id);
                  }}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <CardContent className="p-0">
                <ol className="relative px-4 sm:px-8 py-6">
                  {roadmap.training_tracks.map((track, index) => {
                    const enrolled = enrolledById.get(String(track.id));
                    const isEnrolled = !!enrolled;
                    const progressValue = enrolled?.progress_percentage ?? 0;
                    const isCompleted = progressValue === 100;
                    const isLast = index === roadmap.training_tracks.length - 1;
                    const stepNumber = index + 1;

                    // Lock if previous track is not yet completed
                    const prevTrack = index > 0 ? roadmap.training_tracks[index - 1] : null;
                    const prevEnrolled = prevTrack
                      ? enrolledById.get(String(prevTrack.id))
                      : null;
                    const isPrevCompleted =
                      index === 0 || (prevEnrolled?.progress_percentage ?? 0) === 100;
                    const isLocked = isEnrolled && !isPrevCompleted;

                    return (
                      <li
                        key={track.id}
                        className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0"
                      >
                        {!isLast && (
                          <span
                            aria-hidden
                            className="absolute left-[19px] sm:left-[23px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-primary/10"
                          />
                        )}

                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm font-bold shadow-sm ring-4 ring-background ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isLocked || !isEnrolled
                                  ? 'bg-muted text-muted-foreground border border-border'
                                  : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isLocked || !isEnrolled ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              stepNumber
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`rounded-lg border bg-card p-4 transition-all ${
                              isEnrolled && !isLocked
                                ? 'hover:shadow-md hover:border-primary/40'
                                : 'opacity-60'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                                  <span className="font-medium">Step {stepNumber}</span>
                                  {track.platform && <span>• {track.platform}</span>}
                                  {track.category && (
                                    <Badge variant="outline" className="text-[10px] py-0">
                                      {track.category}
                                    </Badge>
                                  )}
                                  {!isEnrolled && (
                                    <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                                      Not enrolled
                                    </Badge>
                                  )}
                                  {isLocked && (
                                    <Badge variant="outline" className="text-[10px] py-0 text-amber-600 border-amber-400">
                                      Complete previous step first
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                                  {track.title}
                                </h3>
                                {track.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {track.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {enrolled?.completed_courses ?? 0} /{' '}
                                    {enrolled?.total_courses ??
                                      track.total_courses ??
                                      track.courses?.length ??
                                      0}{' '}
                                    courses
                                  </span>
                                  {track.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" />
                                      {track.duration}
                                    </span>
                                  )}
                                </div>

                                {isEnrolled && (
                                  <div className="mt-3 max-w-xs">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-muted-foreground">Progress</span>
                                      <span className="font-medium">{Math.round(progressValue)}%</span>
                                    </div>
                                    <Progress value={progressValue} className="h-1.5" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-shrink-0 sm:w-32">
                                {isEnrolled ? (
                                  <Button
                                    size="sm"
                                    className="w-full bg-primary hover:bg-primary/90"
                                    disabled={isLocked}
                                    onClick={() =>
                                      !isLocked && onSelectCourse(String(track.id))
                                    }
                                  >
                                    {isLocked ? (
                                      <><Lock className="w-3.5 h-3.5 mr-1" /> Locked</>
                                    ) : isCompleted ? (
                                      'Review'
                                    ) : (
                                      'Continue'
                                    )}
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" className="w-full" disabled>
                                    Not enrolled
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
