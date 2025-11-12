import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { 
  Loader2, 
  TrendingUp, 
  BookOpen,
  CheckCircle2,
  CircleDot,
  Circle,
  Target,
  Award,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MonthSummaryProps } from './types';
import { 
  getCategoryIcon,
  getPlatformIcon,
  calculateCompletionRate,
  getCategoryLabel,
  getPlatformLabel,
  formatDueDateRelative,
  isTrackOverdue,
} from './utils';

export const MonthSummary: React.FC<MonthSummaryProps> = ({ 
  summary, 
  isLoading,
  onCategoryClick,
  onPlatformClick,
}) => {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [platformsOpen, setPlatformsOpen] = useState(true);
  const [deadlinesOpen, setDeadlinesOpen] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const completionRate = calculateCompletionRate(
    summary.completedTracks,
    summary.totalTracks
  );

  const coursesCompletionRate = calculateCompletionRate(
    summary.completedCourses,
    summary.totalCourses
  );

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        
        {/* Overall Progress Stats - IMPROVED COLORS */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Total Tracks - Blue gradient */}
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">Total Tracks</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.totalTracks}</p>
              </div>
              
              {/* Completed - Green gradient */}
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.completedTracks}</p>
              </div>
              
              {/* In Progress - Amber gradient */}
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300 mb-1 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{summary.inProgressTracks}</p>
              </div>
              
              {/* Total Courses - Purple gradient */}
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-1 font-medium">Total Courses</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{summary.totalCourses}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Track Completion Rate</span>
                <span className="font-bold text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2.5" />
            </div>

            <Separator />

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Total Courses
                </span>
                <span className="font-medium">{summary.totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Courses Completed
                </span>
                <span className="font-medium text-green-600">{summary.completedCourses}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Course Completion Rate</span>
                <span className="font-medium">{coursesCompletionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Breakdown - COLLAPSIBLE */}
        {summary.categoriesBreakdown.length > 0 && (
          <Card className="border-2">
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Training Categories
                </div>
                <div className="flex items-center gap-2">
                  {!categoriesOpen && (
                    <span className="text-xs text-muted-foreground font-normal">
                      {summary.categoriesBreakdown.length} categories
                    </span>
                  )}
                  {categoriesOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            {/* Collapsed Summary */}
            {!categoriesOpen && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Top:</span>
                  {[...summary.categoriesBreakdown]
                    .sort((a, b) => b.totalTracks - a.totalTracks)
                    .slice(0, 3)
                    .map((cat) => (
                      <Badge key={cat.category} variant="outline" className="text-xs">
                        {getCategoryLabel(cat.category)} ({cat.totalTracks})
                      </Badge>
                    ))}
                </div>
              </CardContent>
            )}
            
            {/* Expanded Content */}
            {categoriesOpen && (
              <CardContent className="space-y-3">
                {[...summary.categoriesBreakdown]
                  .sort((a, b) => b.totalTracks - a.totalTracks)
                  .map((catStats) => {
                    const categoryCompletionRate = calculateCompletionRate(
                      catStats.completedTracks,
                      catStats.totalTracks
                    );

                    return (
                      <div 
                        key={catStats.category} 
                        className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                        onClick={() => onCategoryClick?.(catStats.category)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getCategoryIcon(catStats.category, 'w-4 h-4')}
                            <span className="text-sm truncate">
                              {getCategoryLabel(catStats.category)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {catStats.completedTracks}/{catStats.totalTracks}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {catStats.completedCourses}/{catStats.totalCourses}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={categoryCompletionRate} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {categoryCompletionRate}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            )}
          </Card>
        )}

        {/* Platforms Breakdown - COLLAPSIBLE */}
        {summary.platformsBreakdown.length > 0 && (
          <Card className="border-2">
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setPlatformsOpen(!platformsOpen)}
            >
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Platforms
                </div>
                <div className="flex items-center gap-2">
                  {!platformsOpen && (
                    <span className="text-xs text-muted-foreground font-normal">
                      {summary.platformsBreakdown.length} platforms
                    </span>
                  )}
                  {platformsOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            {/* Collapsed Summary */}
            {!platformsOpen && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Top:</span>
                  {[...summary.platformsBreakdown]
                    .sort((a, b) => b.totalTracks - a.totalTracks)
                    .slice(0, 3)
                    .map((plat) => (
                      <Badge key={plat.platform} variant="outline" className="text-xs">
                        {getPlatformLabel(plat.platform)} ({plat.totalTracks})
                      </Badge>
                    ))}
                </div>
              </CardContent>
            )}
            
            {/* Expanded Content */}
            {platformsOpen && (
              <CardContent className="space-y-3">
                {[...summary.platformsBreakdown]
                  .sort((a, b) => b.totalTracks - a.totalTracks)
                  .map((platformStats) => {
                    const platformCompletionRate = calculateCompletionRate(
                      platformStats.completedTracks,
                      platformStats.totalTracks
                    );

                    return (
                      <div 
                        key={platformStats.platform} 
                        className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                        onClick={() => onPlatformClick?.(platformStats.platform)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getPlatformIcon(platformStats.platform, 'w-4 h-4')}
                            <span className="text-sm truncate">
                              {getPlatformLabel(platformStats.platform)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {platformStats.completedTracks}/{platformStats.totalTracks}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {platformStats.completedCourses}/{platformStats.totalCourses}
                            </span>
                          </div>
                        </div>
                        <Progress value={platformCompletionRate} className="h-1.5" />
                      </div>
                    );
                  })}
              </CardContent>
            )}
          </Card>
        )}

        {/* Upcoming Deadlines - COLLAPSIBLE */}
        {summary.upcomingDeadlines && summary.upcomingDeadlines.length > 0 && (
          <Card className="border-2">
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setDeadlinesOpen(!deadlinesOpen)}
            >
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-primary" />
                  Upcoming Deadlines
                </div>
                <div className="flex items-center gap-2">
                  {!deadlinesOpen && (
                    <Badge variant="destructive" className="text-xs">
                      {summary.upcomingDeadlines.filter(isTrackOverdue).length} overdue
                    </Badge>
                  )}
                  {deadlinesOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            {/* Collapsed Summary */}
            {!deadlinesOpen && (
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground">
                  {summary.upcomingDeadlines.length} pending tracks
                  {summary.upcomingDeadlines.filter(isTrackOverdue).length > 0 && (
                    <span className="text-red-600 font-medium ml-2">
                      · {summary.upcomingDeadlines.filter(isTrackOverdue).length} need attention
                    </span>
                  )}
                </div>
              </CardContent>
            )}
            
            {/* Expanded Content */}
            {deadlinesOpen && (
              <CardContent className="space-y-2">
                {summary.upcomingDeadlines.slice(0, 5).map((track) => {
                  const isOverdue = isTrackOverdue(track);
                  const progress = calculateCompletionRate(
                    track.completed_courses,
                    track.total_courses
                  );

                  return (
                    <div 
                      key={track.id} 
                      className="flex items-start gap-2 p-2 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
                    >
                      {getCategoryIcon(track.category, 'w-4 h-4 mt-0.5')}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{track.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                            {formatDueDateRelative(track.due_date)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {track.platform}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-xs">
                        {progress}%
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        )}

        {/* Activity Summary - COLLAPSIBLE */}
        <Card className="border-2">
          <CardHeader 
            className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setActivityOpen(!activityOpen)}
          >
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-primary" />
                Activity Summary
              </div>
              <div className="flex items-center gap-2">
                {!activityOpen && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {Object.keys(summary.dailySummaries).length} days active
                  </span>
                )}
                {activityOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          {/* Expanded Content */}
          {activityOpen && (
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">Active Days</span>
                <span className="font-medium">
                  {Object.keys(summary.dailySummaries).length} days
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <span className="text-muted-foreground">Avg. Tracks/Day</span>
                <span className="font-medium">
                  {Object.keys(summary.dailySummaries).length > 0
                    ? (summary.totalTracks / Object.keys(summary.dailySummaries).length).toFixed(1)
                    : '0'}
                </span>
              </div>
              {summary.categoriesBreakdown.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="text-muted-foreground">Top Category</span>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(
                      summary.categoriesBreakdown
                        .reduce((prev, curr) => 
                          prev.totalTracks > curr.totalTracks ? prev : curr
                        ).category
                    )}
                  </Badge>
                </div>
              )}
              {summary.platformsBreakdown.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <span className="text-muted-foreground">Top Platform</span>
                  <Badge variant="outline" className="text-xs">
                    {getPlatformLabel(
                      summary.platformsBreakdown
                        .reduce((prev, curr) => 
                          prev.totalTracks > curr.totalTracks ? prev : curr
                        ).platform
                    )}
                  </Badge>
                </div>
              )}
            </CardContent>
          )}
        </Card>

      </div>
    </ScrollArea>
  );
};