import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react"
import { 
  useGetUserTrainingTracksQuery,
  useGetTrainingTrackDetailQuery,
  type TrainingTrack 
} from "../store/leaderApi"
import { Progress } from "@/shared/components/ui/progress"
import { Card, CardContent } from "@/shared/components/ui/card"

interface TrainingTracksDialogProps {
  userId: number
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TrainingTracksDialog({ 
  userId, 
  userName,
  open, 
  onOpenChange 
}: TrainingTracksDialogProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0)

  // Fetch training tracks
  const { 
    data: trainingTracks, 
    isLoading: tracksLoading, 
    error: tracksError 
  } = useGetUserTrainingTracksQuery(userId, { skip: !open })

  // Fetch track details when one is selected
  const { 
    data: trackDetail, 
    isLoading: detailLoading, 
    error: detailError 
  } = useGetTrainingTrackDetailQuery(
    { userId, trackId: selectedTrackId! },
    { skip: !selectedTrackId }
  )

  const handleTrackSelect = (trackId: number) => {
    setSelectedTrackId(trackId)
    setCurrentCourseIndex(0)
  }

  const handleBack = () => {
    setSelectedTrackId(null)
    setCurrentCourseIndex(0)
  }

  const handleNextCourse = () => {
    if (trackDetail && currentCourseIndex < trackDetail.courses.length - 1) {
      setCurrentCourseIndex(prev => prev + 1)
    }
  }

  const handlePrevCourse = () => {
    if (currentCourseIndex > 0) {
      setCurrentCourseIndex(prev => prev - 1)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (track: TrainingTrack) => {
    if (track.is_completed) {
      return <Badge className="bg-green-500">Completed</Badge>
    }
    if (track.is_overdue) {
      return <Badge variant="destructive">Overdue</Badge>
    }
    return <Badge variant="secondary">In Progress</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTrackId ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                Training Track - Details
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5" />
                {userName}'s Training Tracks
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* List View - Training Tracks */}
        {!selectedTrackId && (
          <div className="space-y-4">
            {tracksLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            )}

            {tracksError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error loading training tracks. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {trainingTracks && trainingTracks.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This user has no assigned training tracks.
                </AlertDescription>
              </Alert>
            )}

            {trainingTracks?.map((track) => (
              <Card 
                key={track.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTrackSelect(track.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Platform: {track.platform}
                        </p>
                      </div>
                      {getStatusBadge(track)}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{track.progress_percentage}%</span>
                      </div>
                      <Progress value={track.progress_percentage} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>
                          <span className="font-semibold">{track.completed_courses}</span>
                          <span className="text-muted-foreground">/{track.total_courses}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">
                          {formatDate(track.due_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          {track.is_overdue ? "Overdue" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Detail View - Training Track Detail with Pagination */}
        {selectedTrackId && (
          <div className="space-y-6">
            {detailLoading && (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            )}

            {detailError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error loading details. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {trackDetail && (
              <>
                {/* Track Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-xl mb-2">
                          {trackDetail.training_track.title}
                        </h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {trackDetail.training_track.platform}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {formatDate(trackDetail.training_track.due_date)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-semibold">
                            {trackDetail.assignment.progress_percentage}%
                          </span>
                        </div>
                        <Progress 
                          value={trackDetail.assignment.progress_percentage} 
                          className="h-2" 
                        />
                        <p className="text-sm text-muted-foreground">
                          {trackDetail.assignment.completed_courses} of {trackDetail.training_track.total_courses} courses completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Pagination */}
                {trackDetail.courses.length > 0 && (
                  <>
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Course Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Course {currentCourseIndex + 1} of {trackDetail.courses.length}
                                </span>
                                {trackDetail.courses[currentCourseIndex].completed && (
                                  <Badge className="bg-green-500">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-lg">
                                {trackDetail.courses[currentCourseIndex].title}
                              </h4>
                            </div>
                          </div>

                          {/* Course Status */}
                          <div className="space-y-3 pt-4">
                            {trackDetail.courses[currentCourseIndex].has_submission && (
                              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Evidence Submitted</p>
                                  {trackDetail.courses[currentCourseIndex].submission_link && (
                                    <a 
                                      href={trackDetail.courses[currentCourseIndex].submission_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 hover:underline"
                                    >
                                      View Evidence
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {!trackDetail.courses[currentCourseIndex].completed && (
                              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                  Pending Completion
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        onClick={handlePrevCourse}
                        disabled={currentCourseIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      <span className="text-sm text-muted-foreground">
                        {currentCourseIndex + 1} / {trackDetail.courses.length}
                      </span>

                      <Button
                        variant="outline"
                        onClick={handleNextCourse}
                        disabled={currentCourseIndex === trackDetail.courses.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
