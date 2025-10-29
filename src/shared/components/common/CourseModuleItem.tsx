import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  Clock,
  CheckCircle2,
  Circle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { useToast } from "@/shared/hooks/use-toast"
import { CourseModule } from "@/shared/store/coursesApi"

interface ModuleItemProps {
  module: CourseModule
  isCompleted: boolean
  onToggle: (moduleId: string) => void
  files: File[]
  previewUrls: string[]
  onFilesChange: (moduleId: string, files: FileList | null) => void
  onFileRemove: (moduleId: string, index: number) => void
}

export default function CourseModuleItem({
  module,
  isCompleted,
  onToggle,
  files,
  previewUrls,
  onFilesChange,
  onFileRemove,
}: ModuleItemProps) {
  const { toast } = useToast()
  const hasFiles = files.length > 0

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    
    if (!selectedFiles || selectedFiles.length === 0) return

    // Validate image files
    const imageFiles = Array.from(selectedFiles).filter((file) =>
      file.type.startsWith("image/")
    )

    if (imageFiles.length === 0) {
      toast({
        title: "⚠️ Archivo inválido",
        description: "Solo se permiten archivos de imagen (JPG, PNG, etc.)",
        variant: "destructive",
      })
      e.target.value = "" // Reset input
      return
    }

    // Check file size (max 5MB per file)
    const oversizedFiles = imageFiles.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "⚠️ Archivo muy grande",
        description: "Las imágenes deben ser menores a 5MB",
        variant: "destructive",
      })
      e.target.value = "" // Reset input
      return
    }

    onFilesChange(module.id, selectedFiles)
    e.target.value = "" // Reset input to allow re-uploading same file
  }

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-lg border transition-all ${
        isCompleted ? "bg-accent/30 border-primary/20" : "bg-background"
      }`}
    >
      {/* Module Header */}
      <div className="flex items-start gap-3">
        <Checkbox
          id={module.id}
          checked={isCompleted}
          onCheckedChange={() => onToggle(module.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start gap-2">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <Label
              htmlFor={module.id}
              className={`cursor-pointer font-medium ${
                isCompleted ? "text-primary" : ""
              }`}
            >
              Módulo {module.order}: {module.title}
            </Label>
          </div>
          {module.description && (
            <p className="text-sm text-muted-foreground pl-6">
              {module.description}
            </p>
          )}
          {module.duration && (
            <div className="flex items-center gap-1.5 pl-6 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{module.duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="pl-9 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="file"
            id={`file-${module.id}`}
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-${module.id}`)?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir Fotos
          </Button>
          {hasFiles && (
            <Badge variant="secondary" className="gap-1">
              <ImageIcon className="w-3 h-3" />
              {files.length}
            </Badge>
          )}
        </div>

        {/* Image Previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, index) => (
              <div
                key={index}
                className="relative group w-20 h-20 rounded-md overflow-hidden border border-border"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onFileRemove(module.id, index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar imagen"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {files[index]?.name.length > 15
                    ? `${files[index]?.name.substring(0, 12)}...`
                    : files[index]?.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}