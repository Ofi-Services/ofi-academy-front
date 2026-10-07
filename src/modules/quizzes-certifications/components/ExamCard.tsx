import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Award, CheckCircle2, Clock3, HelpCircle, Play, RotateCcw, Target, Trophy } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { Exam } from "../types"
import { formatDate, formatScore } from "../hooks/useQuizLanguage"

interface ExamCardProps {
  exam: Exam
  isStarting: boolean
  onStart: (exam: Exam) => void
  onResume: (attemptId: number) => void
  onRestart: (exam: Exam) => void
  onViewCertificate: (exam: Exam) => void
}

export default function ExamCard({ exam, isStarting, onStart, onResume, onRestart, onViewCertificate }: ExamCardProps) {
  const stats = exam.user_stats
  const inProgressId = stats?.in_progress_attempt_id ?? null
  const hasPassed = stats?.has_passed ?? false
  const attempts = stats?.attempts_count ?? 0
  const questionsPerAttempt = exam.questions_per_attempt ?? exam.total_questions
  const lastAttempt = stats?.last_attempt

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden border-border bg-card/80 transition-all hover:shadow-lg hover:-translate-y-0.5",
        hasPassed && "border-emerald-500/40"
      )}
    >
      {/* Accent header */}
      <div
        className={cn(
          "h-1.5 w-full",
          hasPassed ? "bg-emerald-500" : inProgressId ? "bg-sky-500" : "bg-primary"
        )}
      />

      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Award className="h-5 w-5 text-primary" />
          </div>
          {hasPassed ? (
            <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3" /> Passed
            </Badge>
          ) : inProgressId ? (
            <Badge className="gap-1 bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30">
              <Clock3 className="h-3 w-3" /> In progress
            </Badge>
          ) : attempts > 0 ? (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              Not passed yet
            </Badge>
          ) : (
            <Badge variant="outline">New</Badge>
          )}
        </div>
        <div>
          <CardTitle className="text-lg font-bold leading-snug">{exam.title}</CardTitle>
          {exam.description && (
            <CardDescription className="mt-1.5 text-xs leading-relaxed line-clamp-2">
              {exam.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <HelpCircle className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-sm font-bold">{questionsPerAttempt}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Questions</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <Target className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-sm font-bold">{exam.passing_score}%</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">To pass</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <Trophy className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-sm font-bold">{formatScore(stats?.best_score)}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Best</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {attempts === 0
            ? "You haven't taken this exam yet."
            : `${attempts} attempt${attempts === 1 ? "" : "s"} · last on ${formatDate(lastAttempt?.finished_at)} (${formatScore(lastAttempt?.score)})`}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        {inProgressId ? (
          <div className="flex w-full gap-2">
            <Button className="flex-1 gap-2" onClick={() => onResume(inProgressId)}>
              <Play className="h-4 w-4 fill-current" /> Resume
            </Button>
            <Button variant="outline" className="gap-2" disabled={isStarting} onClick={() => onRestart(exam)}>
              <RotateCcw className="h-4 w-4" /> Restart
            </Button>
          </div>
        ) : (
          <Button
            className="w-full gap-2"
            variant={hasPassed ? "outline" : "default"}
            disabled={isStarting || exam.total_questions === 0}
            onClick={() => onStart(exam)}
          >
            {attempts > 0 ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            {isStarting ? "Preparing..." : attempts > 0 ? "Take again" : "Start exam"}
          </Button>
        )}
        {hasPassed && (
          <Button variant="ghost" size="sm" className="w-full gap-2 text-amber-600 dark:text-amber-400" onClick={() => onViewCertificate(exam)}>
            <Award className="h-4 w-4" /> View certificate
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
