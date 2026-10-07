import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CheckCircle2, ChevronRight, History, XCircle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { AttemptSummary } from "../types"
import { formatDate, formatScore } from "../hooks/useQuizLanguage"

interface AttemptHistoryTabProps {
  attempts: AttemptSummary[]
  isLoading: boolean
  onReview: (attemptId: number) => void
}

export default function AttemptHistoryTab({ attempts, isLoading, onReview }: AttemptHistoryTabProps) {
  const [examFilter, setExamFilter] = useState("all")

  const exams = useMemo(() => {
    const map = new Map<string, string>()
    attempts.forEach((a) => map.set(a.exam_code, a.exam_title))
    return Array.from(map.entries())
  }, [attempts])

  const filtered = examFilter === "all" ? attempts : attempts.filter((a) => a.exam_code === examFilter)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 py-16 text-center">
        <History className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-base font-semibold">No finished attempts yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          When you submit an exam, your score and answer review will be saved here.
        </p>
      </div>
    )
  }

  return (
    <Card className="border-border bg-card/70">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Your attempts</CardTitle>
        {exams.length > 1 && (
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All exams</option>
            {exams.map(([code, title]) => (
              <option key={code} value={code}>
                {title}
              </option>
            ))}
          </select>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.map((attempt) => {
          const score = parseFloat(attempt.score)
          return (
            <button
              key={attempt.id}
              type="button"
              onClick={() => onReview(attempt.id)}
              className="group flex w-full items-center gap-4 rounded-xl border border-border bg-background/40 p-3 text-left transition-colors hover:bg-muted/60"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  attempt.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}
              >
                {attempt.passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{attempt.exam_title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(attempt.finished_at)} · {attempt.correct_count}/{attempt.total} correct
                </p>
              </div>

              <div className="hidden w-40 sm:block">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", attempt.passed ? "bg-emerald-500" : "bg-red-500")}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
              </div>

              <span className={cn("w-14 text-right text-sm font-bold tabular-nums", attempt.passed ? "text-emerald-500" : "text-red-500")}>
                {formatScore(attempt.score)}
              </span>
              <Badge variant={attempt.passed ? "default" : "outline"} className="hidden md:inline-flex">
                {attempt.passed ? "Passed" : "Failed"}
              </Badge>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
