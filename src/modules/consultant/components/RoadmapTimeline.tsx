import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Loader2, CheckCircle2, BookOpen, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Roadmap, TrainingTrack } from '@/shared/store/coursesApi';

interface RoadmapTimelineProps {
  roadmap: Roadmap;
  enrolledIds: Set<string>;
  isEnrollingRoadmap: boolean;
  onSelectTrack: (track: TrainingTrack) => void;
  onEnrollRoadmap: (roadmap: Roadmap) => void;
}

export default function RoadmapTimeline({
  roadmap,
  enrolledIds,
  isEnrollingRoadmap,
  onSelectTrack,
  onEnrollRoadmap,
}: RoadmapTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const tracks = roadmap.training_tracks ?? [];
  const enrolledCount = tracks.filter((t) => enrolledIds.has(String(t.id))).length;
  const allEnrolled = tracks.length > 0 && enrolledCount === tracks.length;

  return (
    <Card className="overflow-hidden">
      <div
        className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 cursor-pointer select-none"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                Roadmap
              </Badge>
              <span className="text-xs text-muted-foreground">
                {enrolledCount}/{tracks.length} {tracks.length === 1 ? 'step' : 'steps'} enrolled
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{roadmap.name}</h2>
            {roadmap.description && (
              <p className="text-muted-foreground mt-1 max-w-3xl">{roadmap.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 sm:pt-1">
            {allEnrolled ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <CheckCircle2 className="w-4 h-4" />
                Enrolled
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnrollRoadmap(roadmap);
                }}
                disabled={isEnrollingRoadmap || tracks.length === 0}
              >
                {isEnrollingRoadmap ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  'Enroll in Roadmap'
                )}
              </Button>
            )}
            <button
              aria-label={isExpanded ? 'Collapse roadmap' : 'Expand roadmap'}
              aria-expanded={isExpanded}
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="p-0">
          {tracks.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground italic">
              This roadmap has no training tracks yet.
            </div>
          ) : (
            <ol className="relative px-4 sm:px-8 py-6">
              {tracks.map((track, index) => {
              const isEnrolled = enrolledIds.has(String(track.id));
              const isLast = index === tracks.length - 1;
              const stepNumber = index + 1;

              return (
                <li key={track.id} className="relative flex gap-4 sm:gap-6 pb-6 last:pb-0">
                  {/* Vertical connector */}
                  {!isLast && (
                    <span
                      aria-hidden
                      className="absolute left-[19px] sm:left-[23px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-primary/10"
                    />
                  )}

                  {/* Step indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-sm font-bold shadow-sm ring-4 ring-background ${
                        isEnrolled
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground border border-border'
                      }`}
                    >
                      {isEnrolled ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                  </div>

                  {/* Track card */}
                  <div className="flex-1 min-w-0">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectTrack(track)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTrack(track);
                        }
                      }}
                      className="group w-full text-left rounded-lg border bg-card hover:shadow-md hover:border-primary/40 transition-all p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-1">
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
                              {track.total_courses ?? track.courses?.length ?? 0} courses
                            </span>
                            {track.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {track.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {isEnrolled && (
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40">
                              <CheckCircle2 className="w-3 h-3" />
                              Enrolled
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
      )}
    </Card>
  );
}
