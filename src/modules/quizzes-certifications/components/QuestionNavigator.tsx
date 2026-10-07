import { cn } from "@/shared/lib/utils"
import type { AttemptAnswer } from "../types"

interface QuestionNavigatorProps {
  answers: AttemptAnswer[]
  currentIndex: number
  onSelect: (index: number) => void
}

/** Grid of question numbers colored by status: correct, incorrect, pending, current. */
export default function QuestionNavigator({ answers, currentIndex, onSelect }: QuestionNavigatorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
        {answers.map((a, idx) => (
          <button
            key={a.question.id}
            type="button"
            onClick={() => onSelect(idx)}
            aria-label={`Go to question ${idx + 1}`}
            aria-current={idx === currentIndex ? "step" : undefined}
            className={cn(
              "flex h-8 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-all",
              !a.answered && "bg-muted text-muted-foreground hover:bg-muted/70",
              a.answered && a.is_correct && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              a.answered && a.is_correct === false && "bg-red-500/15 text-red-500",
              idx === currentIndex && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/60" /> Correct</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/60" /> Incorrect</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30" /> Pending</span>
      </div>
    </div>
  )
}
