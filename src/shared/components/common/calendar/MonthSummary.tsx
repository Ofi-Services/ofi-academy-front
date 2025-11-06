import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { 
  Loader2, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle2,
  CircleDot,
  Circle,
  Target,
} from "lucide-react";
import { MonthSummaryProps } from './types';
import { 
  getCategoryIcon, 
  getEventTypeIcon,
  calculateCompletionRate,
  minutesToHours,
  getCategoryLabel,
  getEventTypeLabel,
} from './utils';

export const MonthSummary: React.FC<MonthSummaryProps> = ({ 
  summary, 
  isLoading,
  onCategoryClick,
  onTypeClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const completionRate = calculateCompletionRate(
    summary.completedEvents,
    summary.totalEvents
  );

  const completedHoursDisplay = minutesToHours(summary.completedHours);
  const totalHoursDisplay = minutesToHours(summary.totalHours);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        
        {/* Overall Progress Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Total Events</p>
                <p className="text-2xl font-bold">{summary.totalEvents}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{summary.completedEvents}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{summary.inProgressEvents}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <p className="text-xs text-muted-foreground mb-1">Not Started</p>
                <p className="text-2xl font-bold text-orange-600">{summary.notStartedEvents}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Total Hours
                </span>
                <span className="font-medium">{totalHoursDisplay}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Hours Completed
                </span>
                <span className="font-medium text-green-600">{completedHoursDisplay}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Types Breakdown */}
        {summary.typesBreakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Event Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.typesBreakdown
                .sort((a, b) => b.count - a.count)
                .map((typeStats) => {
                  const typeCompletionRate = calculateCompletionRate(
                    typeStats.completedCount,
                    typeStats.count
                  );

                  return (
                    <div 
                      key={typeStats.type} 
                      className="space-y-2 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                      onClick={() => onTypeClick?.(typeStats.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getEventTypeIcon(typeStats.type, 'w-4 h-4')}
                          <span className="text-sm truncate">
                            {getEventTypeLabel(typeStats.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {typeStats.completedCount}/{typeStats.count}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {minutesToHours(typeStats.totalHours)}h
                          </span>
                        </div>
                      </div>
                      <Progress value={typeCompletionRate} className="h-1.5" />
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Categories Breakdown */}
        {summary.categoriesBreakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Training Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.categoriesBreakdown
                .sort((a, b) => b.totalEvents - a.totalEvents)
                .map((catStats) => {
                  const categoryCompletionRate = calculateCompletionRate(
                    catStats.completedEvents,
                    catStats.totalEvents
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
                            {catStats.completedEvents}/{catStats.totalEvents}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {minutesToHours(catStats.totalHours)}h
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
          </Card>
        )}

        {/* Upcoming Deadlines */}
        {summary.upcomingDeadlines && summary.upcomingDeadlines.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {summary.upcomingDeadlines.slice(0, 5).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-2 p-2 hover:bg-accent/50 rounded-md cursor-pointer transition-colors"
                >
                  {getEventTypeIcon(event.type, 'w-4 h-4 mt-0.5')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  {event.progress !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {event.progress}%
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Activity Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CircleDot className="w-4 h-4" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">Active Days</span>
              <span className="font-medium">
                {Object.keys(summary.dailySummaries).length} days
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
              <span className="text-muted-foreground">Avg. Events/Day</span>
              <span className="font-medium">
                {Object.keys(summary.dailySummaries).length > 0
                  ? (summary.totalEvents / Object.keys(summary.dailySummaries).length).toFixed(1)
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
                        prev.totalEvents > curr.totalEvents ? prev : curr
                      ).category
                  )}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </ScrollArea>
  );
};