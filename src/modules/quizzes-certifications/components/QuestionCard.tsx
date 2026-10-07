import { Badge } from "@/shared/components/ui/badge"
import { Check, CheckCircle2, X, XCircle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { AttemptAnswer, QuizLanguage } from "../types"
import { choiceTextOf, questionTypeLabel, statementOf } from "../hooks/useQuizLanguage"

type ChoiceState = "idle" | "selected" | "correct" | "missed" | "wrong" | "neutral"

interface QuestionCardProps {
  answer: AttemptAnswer
  index: number
  total: number
  language: QuizLanguage
  /** Ids currently selected by the user (only used before the question is graded) */
  selection?: number[]
  onToggleChoice?: (choiceId: number) => void
  disabled?: boolean
  compact?: boolean
}

export default function QuestionCard({
  answer,
  index,
  total,
  language,
  selection = [],
  onToggleChoice,
  disabled = false,
  compact = false,
}: QuestionCardProps) {
  const { question } = answer
  const graded = answer.correct_choice_ids !== null
  const isMultiple = question.type === "multiple"
  const selectedIds = graded ? answer.selected_choice_ids : selection
  const correctIds = answer.correct_choice_ids ?? []

  const stateOf = (choiceId: number): ChoiceState => {
    const selected = selectedIds.includes(choiceId)
    if (!graded) return selected ? "selected" : "idle"
    const correct = correctIds.includes(choiceId)
    if (correct && selected) return "correct"
    if (correct) return "missed"
    if (selected) return "wrong"
    return "neutral"
  }

  return (
    <div className={cn("space-y-5", compact && "space-y-3")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <Badge variant="outline" className="text-[11px]">
          {questionTypeLabel(question)}
        </Badge>
        {graded && answer.answered && (
          <Badge
            className={cn(
              "ml-auto gap-1 text-[11px]",
              answer.is_correct
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-red-500/15 text-red-500 border-red-500/30"
            )}
          >
            {answer.is_correct ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {answer.is_correct ? "Correct" : "Incorrect"}
          </Badge>
        )}
        {graded && !answer.answered && (
          <Badge variant="outline" className="ml-auto text-[11px] text-muted-foreground">
            Not answered
          </Badge>
        )}
      </div>

      <h2 className={cn("font-semibold leading-relaxed text-foreground", compact ? "text-sm" : "text-lg")}>
        {statementOf(question, language)}
      </h2>

      <div className={cn("space-y-2.5", compact && "space-y-1.5")} role={isMultiple ? "group" : "radiogroup"}>
        {question.choices.map((choice) => {
          const state = stateOf(choice.id)
          const interactive = !graded && !disabled && !!onToggleChoice
          return (
            <button
              key={choice.id}
              type="button"
              role={isMultiple ? "checkbox" : "radio"}
              aria-checked={selectedIds.includes(choice.id)}
              disabled={!interactive}
              onClick={() => onToggleChoice?.(choice.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border text-left transition-all",
                compact ? "p-2.5 text-xs" : "p-4 text-sm",
                interactive && "cursor-pointer hover:border-primary/60 hover:bg-muted/50",
                state === "idle" && "border-border text-muted-foreground",
                state === "selected" && "border-primary bg-primary/10 text-foreground ring-1 ring-primary",
                state === "correct" && "border-emerald-500 bg-emerald-500/10 text-foreground",
                state === "missed" && "border-dashed border-emerald-500 bg-emerald-500/5 text-foreground",
                state === "wrong" && "border-red-500 bg-red-500/10 text-foreground",
                state === "neutral" && "border-border text-muted-foreground opacity-70"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center border text-xs font-bold",
                  isMultiple ? "rounded-md" : "rounded-full",
                  state === "idle" && "border-muted-foreground/40",
                  state === "selected" && "border-primary bg-primary text-primary-foreground",
                  (state === "correct" || state === "missed") && "border-emerald-500 bg-emerald-500 text-white",
                  state === "wrong" && "border-red-500 bg-red-500 text-white",
                  state === "neutral" && "border-muted-foreground/30"
                )}
              >
                {state === "correct" || state === "missed" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : state === "wrong" ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  choice.letter
                )}
              </span>
              <span className="flex-1 leading-snug pt-0.5">{choiceTextOf(choice, language)}</span>
              {state === "missed" && (
                <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Correct answer
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
