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

export default function CourseProgressDialog({
  courseId,
  open,
  onOpenChange,
}: CourseProgressDialogProps) {
  const { toast } = useToast()
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set())
  const [moduleFiles, setModuleFiles] = useState<ModuleFiles>({})
  const [previewUrls, setPreviewUrls] = useState<{ [moduleId: string]: string[] }>({})

  // RTK Query hooks
  const { data: course, isLoading, error } = useGetCourseDetailsQuery(courseId, {
    skip: !open,
  })
  const [updateProgress, { isLoading: isUpdating }] = useUpdateCourseProgressMutation()

  // Initialize selected modules when data loads
  useEffect(() => {
    if (course?.modules) {
      const completedModuleIds = course.modules
        .filter((module) => module.completed)
        .map((module) => module.id)
      setSelectedModules(new Set(completedModuleIds))
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
    }
  }, [open])

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
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

    toast({
      title: "✅ Imagen(es) agregada(s)",
      description: `${imageFiles.length} imagen(es) cargada(s) para el módulo`,
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
        const { [moduleId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [moduleId]: newFiles }
    })

    // Remove preview URL
    setPreviewUrls((prev) => {
      const urls = prev[moduleId] || []
      const newUrls = urls.filter((_, i) => i !== index)
      if (newUrls.length === 0) {
        const { [moduleId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [moduleId]: newUrls }
    })
  }

  const handleSave = async () => {
    try {
      const completedModulesArray = Array.from(selectedModules)
      const totalModules = course?.modules?.length || 0
      const completedCount = completedModulesArray.length
      const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

      // Prepare FormData for file upload
      const formData = new FormData()
      formData.append("courseId", courseId)
      formData.append("completedModules", JSON.stringify(completedModulesArray))
      formData.append("progress", progress.toString())
      formData.append("completedLessons", completedCount.toString())

      // Add files to FormData
      Object.entries(moduleFiles).forEach(([moduleId, files]) => {
        files.forEach((file, index) => {
          formData.append(`module_${moduleId}_file_${index}`, file)
        })
      })

      // Add metadata about which modules have files
      const modulesWithFiles = Object.keys(moduleFiles).reduce((acc, moduleId) => {
        acc[moduleId] = moduleFiles[moduleId].length
        return acc
      }, {} as { [key: string]: number })
      formData.append("modulesWithFiles", JSON.stringify(modulesWithFiles))

      await updateProgress(formData).unwrap()

      toast({
        title: "✅ Progreso actualizado exitosamente",
        description: `Has completado ${completedCount} de ${totalModules} módulos (${progress}%)`,
        variant: "default",
      })

      // Clear files and preview URLs
      Object.values(previewUrls).forEach((urls) => {
        urls.forEach((url) => URL.revokeObjectURL(url))
      })
      setModuleFiles({})
      setPreviewUrls({})

      onOpenChange(false)
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "❌ Error al actualizar progreso",
        description: "Hubo un error al guardar tu progreso. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  // Calculate progress percentage
  const currentProgress = useMemo(() => {
    if (!course?.modules) return 0
    const totalModules = course.modules.length
    const completedCount = selectedModules.size
    return totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  }, [course, selectedModules])

  // Safely sorted modules to avoid immutability errors
  const sortedModules = useMemo(() => {
    return [...(course?.modules || [])].sort((a, b) => a.order - b.order)
  }, [course])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Progreso del Curso</DialogTitle>
          <DialogDescription>Rastrea y actualiza tu progreso de aprendizaje</DialogDescription>
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
              Error al cargar detalles del curso. Por favor intenta nuevamente.
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
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.instructor}</span>
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
                  <span className="text-muted-foreground">Progreso Actual</span>
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
                  {selectedModules.size} de {course.modules?.length || 0} módulos completados
                </div>
              </div>
            </div>

            <Separator />

            {/* Modules List */}
            <div className="space-y-2 flex-1 min-h-0">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Módulos del Curso</Label>
                <span className="text-sm text-muted-foreground">
                  {selectedModules.size}/{course.modules?.length || 0} seleccionados
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
                      />
                    ))
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No hay módulos disponibles para este curso.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isUpdating}
                className="min-w-[100px]"
              >
                {isUpdating ? "Guardando..." : "Guardar Progreso"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}