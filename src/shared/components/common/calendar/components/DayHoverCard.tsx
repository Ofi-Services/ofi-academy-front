import React, { useState, useRef, useEffect } from 'react';
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  BookOpen,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import {
  getCategoryIcon,
  getPlatformIcon,
  calculateCompletionRate,
  formatDueDateRelative,
  isTrackOverdue,
  getCategoryLabel,
  getPlatformLabel,
} from '../utils';
import type { DayTrainingSummary } from '../types';

interface DayHoverCardProps {
  children: React.ReactNode;
  daySummary: DayTrainingSummary | undefined;
  date: string;
}

export const DayHoverCard: React.FC<DayHoverCardProps> = ({
  children,
  daySummary,
  date,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // No early return
  const disabled = !daySummary || daySummary.totalTracks === 0;

  // -----------------------------
  //        SMART TOOLTIP
  // -----------------------------
  const handleMouseEnter = () => {
    if (disabled) return;

    // Clear any pending hide/show timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      // Posición inicial: parte superior derecha del día
      let top = rect.top + scrollY;
      let left = rect.right + scrollX + 8;

      setPosition({ top, left });
      setIsVisible(true);

      // Ajustar después de montar el tooltip
      setTimeout(() => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        const tt = tooltip.getBoundingClientRect();

        // Si se sale por la derecha → mover al lado izquierdo
        if (tt.right > window.innerWidth) {
          left = rect.left + scrollX - tt.width - 8;
        }

        // Si se sale por arriba → pegar arriba con margen
        // (Priorizamos mantener alineación superior)
        if (top < 8) {
          top = 8 + scrollY;
        }

        // Solo ajustar hacia abajo si es absolutamente necesario
        if (tt.bottom > window.innerHeight && top === (rect.top + scrollY)) {
          const spaceBelow = window.innerHeight - rect.top;
          const spaceAbove = rect.top;

          // Si hay más espacio abajo, ajustar para que quepa
          if (spaceBelow > spaceAbove) {
            top = Math.max(rect.top + scrollY, window.innerHeight - tt.height - 8 + scrollY);
          } else {
            // Si hay más espacio arriba, mover arriba del trigger
            top = Math.max(8 + scrollY, rect.top - tt.height - 8 + scrollY);
          }
        }

        setPosition({ top, left });
      }, 0);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }, 200);
  };

  // EN LUGAR de hacer hide inmediato, programamos un timeout que lo oculte.
  const handleMouseLeave = () => {
    // Clear any existing timeout (e.g., pending show)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Programar el hide con pequeño delay para permitir mover el mouse al tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      timeoutRef.current = null;
    }, 150);
  };

  const completionRate = !disabled
    ? calculateCompletionRate(daySummary!.completedTracks, daySummary!.totalTracks)
    : 0;

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const sortedTracks = !disabled
    ? [...daySummary!.tracks].sort((a, b) => {
      const aOverdue = isTrackOverdue(a);
      const bOverdue = isTrackOverdue(b);

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }

      return 0;
    })
    : [];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {!disabled && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 w-80 rounded-lg border bg-popover text-popover-foreground shadow-lg transition-opacity",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onMouseEnter={() => {
            // Si entras al tooltip cancelamos cualquier hide timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Header */}
          <div className="bg-primary/5 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm truncate">
                  {formattedDate}
                </h3>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {daySummary!.totalTracks} tracks
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-1.5" />
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-muted-foreground">
                  {daySummary!.completedTracks} completed
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="w-3 h-3 text-blue-600" />
                <span className="text-muted-foreground">
                  {daySummary!.inProgressTracks} in progress
                </span>
              </div>
            </div>
          </div>

          {/* Tracks list */}
          <div className="max-h-[400px] overflow-y-auto">
            {sortedTracks.map((track, index) => {
              const isOverdue = isTrackOverdue(track);
              const trackProgress = calculateCompletionRate(
                track.completed_courses,
                track.total_courses
              );
              const isCompleted = trackProgress === 100;

              return (
                <div key={track.id}>
                  {index > 0 && <Separator />}
                  <div className="px-4 py-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm font-medium leading-tight mb-1 line-clamp-2"
                          title={track.title}
                        >
                          {track.title}
                        </h4>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getCategoryIcon(track.category, "w-3 h-3")}
                            <span
                              className="truncate max-w-[80px]"
                              title={getCategoryLabel(track.category)}
                            >
                              {getCategoryLabel(track.category)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {getPlatformIcon(track.platform, "w-3 h-3")}
                            <span
                              className="truncate max-w-[80px]"
                              title={getPlatformLabel(track.platform)}
                            >
                              {getPlatformLabel(track.platform)}
                            </span>
                          </div>
                        </div>

                        {track.due_date && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span
                              className={cn(
                                "text-xs",
                                isOverdue
                                  ? "text-red-600 font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatDueDateRelative(track.due_date)}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <BookOpen className="w-3 h-3" />
                              <span>
                                {track.completed_courses}/{track.total_courses} courses
                              </span>
                            </div>
                            <span className="font-medium">{trackProgress}%</span>
                          </div>
                          <Progress value={trackProgress} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer categories */}
          {Object.keys(daySummary!.tracksByCategory).length > 0 && (
            <>
              <Separator />
              <div className="px-4 py-2 bg-muted/30">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    Categories:
                  </span>
                  {Object.entries(daySummary!.tracksByCategory).map(
                    ([category, count]) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {getCategoryLabel(category)} ({count})
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
