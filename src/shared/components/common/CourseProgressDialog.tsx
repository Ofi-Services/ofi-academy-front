import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { Badge } from "@/shared/components/ui/badge"
import { Clock, BookOpen, AlertCircle } from "lucide-react"
import {
  useGetCourseDetailsQuery,
  useUpdateCourseProgressMutation,
} from "@/shared/store/coursesApi"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { useToast } from "@/shared/hooks/use-toast"
import CourseModuleItem from "./CourseModuleItem"

interface CourseProgressDialogProps {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ModuleFiles {
  [moduleId: string]: File[]
}

interface ModuleNotes {
  [moduleId: string]: string
}

export default function CourseProgressDialog({
  courseId,
  open,
  onOpenChange,
}: CourseProgressDialogProps) {
  const { toast } = useToast()
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [moduleFiles, setModuleFiles] = useState<ModuleFiles>({})
  const [moduleNotes, setModuleNotes] = useState<ModuleNotes>({})
  const [previewUrls, setPreviewUrls] = useState<{ [moduleId: string]: string[] }>({})
  const [initiallyCompletedModules, setInitiallyCompletedModules] = useState<Set<string>>(new Set())

  // RTK Query hooks
  const { data: course, isLoading, error } = useGetCourseDetailsQuery(courseId, {
    skip: !open,
  })
  const [updateProgress, { isLoading: isUpdating }] = useUpdateCourseProgressMutation()

  // Initialize selected modules when data loads
  useEffect(() => {
    if (course?.courses) {
      const completedModuleIds = course.courses
        .filter((module) => module.completed)
        .map((module) => module.id)
      setSelectedModules(new Set(completedModuleIds))
      setInitiallyCompletedModules(new Set(completedModuleIds))
    }
  }, [course])

  // Cleanup preview URLs on unmount or when dialog closes
  useEffect(() => {
    if (!open) {
      // Clean up all preview URLs when dialog closes
      Object.values(previewUrls).forEach((urls) => {
        urls.forEach((url) => URL.revokeObjectURL(url))
      })
      setPreviewUrls({})
      setModuleFiles({})
      setModuleNotes({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => {
      const newSet = new Set(prev)
      
      if (newSet.has(moduleId)) {
        // Allow unchecking
        newSet.delete(moduleId)
      } else {
        // Only allow checking if:
        // 1. It was already completed in the DB, OR
        // 2. There are uploaded files for this module
        const wasInitiallyCompleted = initiallyCompletedModules.has(moduleId)
        const hasFiles = moduleFiles[moduleId] && moduleFiles[moduleId].length > 0
        
        if (wasInitiallyCompleted || hasFiles) {
          newSet.add(moduleId)
        } else {
          // Show error message if trying to check without files
          toast({
            title: "⚠️ File required",
            description: "You must upload at least one image to mark this module as completed",
            variant: "destructive",
          })
        }
      }
      return newSet
    })
  }

  const handleFilesChange = (moduleId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (imageFiles.length === 0) return

    // Update files state
    setModuleFiles((prev) => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), ...imageFiles],
    }))

    // Create preview URLs
    const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls((prev) => ({
      ...prev,
      [moduleId]: [...(prev[moduleId] || []), ...newPreviewUrls],
    }))

    // Automatically mark the module as completed when uploading files
    setSelectedModules((prev) => {
      const newSet = new Set(prev)
      newSet.add(moduleId)
      return newSet
    })

    toast({
      title: "✅ Image(s) added",
      description: `${imageFiles.length} image(s) loaded for the module`,
      variant: "default",
    })
  }

  const handleFileRemove = (moduleId: string, index: number) => {
    // Revoke the preview URL
    const urlToRevoke = previewUrls[moduleId]?.[index]
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke)
    }

    // Remove file
    setModuleFiles((prev) => {
      const files = prev[moduleId] || []
      const newFiles = files.filter((_, i) => i !== index)
      if (newFiles.length === 0) {
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== moduleId)
        ) as ModuleFiles
      }
      return { ...prev, [moduleId]: newFiles }
    })

    // Remove preview URL
    setPreviewUrls((prev) => {
      const urls = prev[moduleId] || []
      const newUrls = urls.filter((_, i) => i !== index)
      if (newUrls.length === 0) {
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== moduleId)
        ) as { [moduleId: string]: string[] }
      }
      return { ...prev, [moduleId]: newUrls }
    })

    // If all files are removed and the module was NOT initially completed,
    // automatically uncheck the module
    const remainingFiles = (moduleFiles[moduleId] || []).filter((_, i) => i !== index)
    if (remainingFiles.length === 0 && !initiallyCompletedModules.has(moduleId)) {
      setSelectedModules((prev) => {
        const newSet = new Set(prev)
        newSet.delete(moduleId)
        return newSet
      })
    }
  }


  const handleSave = async () => {
    try {
      const formData = new FormData()
      
      // Add the training track ID
      formData.append("trackId", courseId)

      // Add files using the backend format: course_{courseId}
      Object.entries(moduleFiles).forEach(([moduleId, files]) => {
        // For each module, we'll send only the first file (or you could send all)
        // The backend expects: course_1, course_2, etc.
        if (files.length > 0) {
          formData.append(`course_${moduleId}`, files[0])
        }
      })

      // Add notes using the backend format: note_{courseId}
      Object.entries(moduleNotes).forEach(([moduleId, note]) => {
        if (note && note.trim()) {
          formData.append(`note_${moduleId}`, note)
        }
      })

      await updateProgress(formData).unwrap()

      const totalModules = course?.courses?.length || 0
      const completedCount = selectedModules.size
      const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

      toast({
        title: "✅ Progress updated successfully",
        description: `You have completed ${completedCount} of ${totalModules} modules (${progress}%)`,
        variant: "default",
      })

      // Clear files and preview URLs
      Object.values(previewUrls).forEach((urls) => {
        urls.forEach((url) => URL.revokeObjectURL(url))
      })
      setModuleFiles({})
      setPreviewUrls({})
      setModuleNotes({})

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "❌ Error updating progress",
        description: "There was an error saving your progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Calculate progress percentage
  const currentProgress = useMemo(() => {
    if (!course?.courses) return 0
    const totalModules = course.courses.length
    const completedCount = selectedModules.size
    return totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  }, [course, selectedModules])

  // Safely sorted modules to avoid immutability errors
  const sortedModules = useMemo(() => {
    return [...(course?.courses || [])].sort((a, b) => a.order - b.order)
  }, [course])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Training Track Progress</DialogTitle>
          <DialogDescription>Track and update your learning progress</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading course details. Please try again.
            </AlertDescription>
          </Alert>
        ) : course ? (
          <>
            {/* Course Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <Badge className="shrink-0">{course.category}</Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                {course.platform && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.platform}</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Progress</span>
                  <span className="font-semibold text-lg">{currentProgress}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentProgress < 50
                        ? "bg-destructive"
                        : currentProgress >= 85
                        ? "bg-green-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedModules.size} of {course.courses?.length || 0} modules completed
                </div>
              </div>
            </div>

            <Separator />

            {/* Modules List */}
            <div className="space-y-2 flex-1 min-h-0">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Course Modules</Label>
                <span className="text-sm text-muted-foreground">
                  {selectedModules.size}/{course.courses?.length || 0} selected
                </span>
              </div>

              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-3">
                  {sortedModules.length > 0 ? (
                    sortedModules.map((module) => (
                      <CourseModuleItem
                        key={module.id}
                        module={module}
                        isCompleted={selectedModules.has(module.id)}
                        onToggle={handleModuleToggle}
                        files={moduleFiles[module.id] || []}
                        previewUrls={previewUrls[module.id] || []}
                        onFilesChange={handleFilesChange}
                        onFileRemove={handleFileRemove}
                        link={module.link}
                      />
                    ))
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No modules available for this course.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                className="min-w-[100px]"
              >
                {isUpdating ? "Saving..." : "Save Progress"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}