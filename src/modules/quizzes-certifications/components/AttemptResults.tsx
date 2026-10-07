import { useMemo, useState } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { ArrowLeft, Award, CheckCircle2, CircleDashed, RotateCcw, XCircle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { AttemptDetail, QuizLanguage } from "../types"
import ScoreRing from "./ScoreRing"
import QuestionCard from "./QuestionCard"
import { formatDate } from "../hooks/useQuizLanguage"

type ReviewFilter = "all" | "incorrect" | "correct"

interface AttemptResultsProps {
  attempt: AttemptDetail
  language: QuizLanguage
  isRetaking: boolean
  onRetake: () => void
  onBack: () => void
  onViewCertificate: () => void
}

export default function AttemptResults({ attempt, language, isRetaking, onRetake, onBack, onViewCertificate }: AttemptResultsProps) {
  const [filter, setFilter] = useState<ReviewFilter>("incorrect")

  const counts = useMemo(() => {
    const unanswered = attempt.answers.filter((a) => !a.answered).length
    return {
      correct: attempt.correct_count,
      incorrect: attempt.total - attempt.correct_count - unanswered,
      unanswered,
    }
  }, [attempt])

  const reviewItems = attempt.answers
    .map((answer, index) => ({ answer, index }))
    .filter(({ answer }) =>
      filter === "all" ? true : filter === "correct" ? answer.is_correct : !answer.is_correct
    )

  const score = parseFloat(attempt.score)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card
        className={cn(
          "overflow-hidden border-2",
          attempt.passed ? "border-emerald-500/40" : "border-red-500/30"
        )}
      >
        <div
          className={cn(
            "bg-gradient-to-br p-6 sm:p-8",
            attempt.passed ? "from-emerald-500/10 via-transparent to-transparent" : "from-red-500/10 via-transparent to-transparent"
          )}
        >
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
            <ScoreRing value={score} passingScore={attempt.passing_score} size={160} strokeWidth={14} label={`Pass: ${attempt.passing_score}%`} />

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                {attempt.passed ? (
                  <Award className="h-6 w-6 text-emerald-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <h1 className="text-2xl font-bold">
                  {attempt.passed ? "Congratulations, you passed!" : "Not quite there yet"}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {attempt.exam_title} · finished on {formatDate(attempt.finished_at)}.{" "}
                {attempt.passed
                  ? "Your result has been saved to your history."
                  : `You need ${attempt.passing_score}% to pass. Review your mistakes below and try again.`}
              </p>

              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold">{counts.correct}</span>
                  <span className="text-muted-foreground">correct</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-bold">{counts.incorrect}</span>
                  <span className="text-muted-foreground">incorrect</span>
                </div>
                {counts.unanswered > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                    <CircleDashed className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{counts.unanswered}</span>
                    <span className="text-muted-foreground">unanswered</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 md:w-auto">
              <Button className="gap-2" onClick={onRetake} disabled={isRetaking}>
                <RotateCcw className="h-4 w-4" />
                {isRetaking ? "Preparing..." : "Take again"}
              </Button>
              {attempt.passed && (
                <Button variant="outline" className="gap-2" onClick={onViewCertificate}>
                  <Award className="h-4 w-4" /> Certificate
                </Button>
              )}
              <Button variant="ghost" className="gap-2" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" /> Back to exams
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Review */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Answer review</h2>
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {(
            [
              { value: "incorrect", label: `Incorrect (${counts.incorrect + counts.unanswered})` },
              { value: "correct", label: `Correct (${counts.correct})` },
              { value: "all", label: `All (${attempt.total})` },
            ] as { value: ReviewFilter; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === opt.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {reviewItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          {filter === "incorrect" ? "No mistakes. Perfect score!" : "Nothing to show here."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {reviewItems.map(({ answer, index }) => (
            <Card key={answer.question.id} className="border-border bg-card/70">
              <CardContent className="p-5">
                <QuestionCard answer={answer} index={index} total={attempt.total} language={language} compact />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
