import { Languages } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { QuizLanguage } from "../types"

interface LanguageToggleProps {
  value: QuizLanguage
  onChange: (lang: QuizLanguage) => void
}

const OPTIONS: { value: QuizLanguage; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
]

export default function LanguageToggle({ value, onChange }: LanguageToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1" title="Question language">
      <Languages className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            value === opt.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
