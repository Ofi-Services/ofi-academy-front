import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { ArrowLeft, ArrowRight, CheckCircle2, Flag, XCircle } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import QuestionCard from "../components/QuestionCard"
import QuestionNavigator from "../components/QuestionNavigator"
import AttemptResults from "../components/AttemptResults"
import LanguageToggle from "../components/LanguageToggle"
import CertificateModal from "../components/CertificateModal"
import { useQuizLanguage } from "../hooks/useQuizLanguage"
import {
  getApiErrorMessage,
  useAnswerQuestionMutation,
  useGetAttemptQuery,
  useStartAttemptMutation,
  useSubmitAttemptMutation,
} from "../store/certificationsApi"

const EXAMS_PATH = "/quizzes-certifications"

export default function ExamAttemptPage() {
  const { attemptId: rawId } = useParams()
  const attemptId = Number(rawId)
  const navigate = useNavigate()
  const { language, setLanguage } = useQuizLanguage()

  const { data: attempt, isLoading, isError } = useGetAttemptQuery(attemptId, { skip: !attemptId })
  const [answerQuestion, { isLoading: isAnswering }] = useAnswerQuestionMutation()
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitAttemptMutation()
  const [startAttempt, { isLoading: isRetaking }] = useStartAttemptMutation()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selections, setSelections] = useState<Record<number, number[]>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [certificateOpen, setCertificateOpen] = useState(false)
  const positionedFor = useRef<number | null>(null)

  // Jump to the first unanswered question when an attempt is opened (resume support)
  useEffect(() => {
    if (!attempt || positionedFor.current === attempt.id) return
    positionedFor.current = attempt.id
    const firstPending = attempt.answers.findIndex((a) => !a.answered)
    setCurrentIndex(firstPending === -1 ? 0 : firstPending)
    setSelections({})
  }, [attempt])

  const current = attempt?.answers[currentIndex]
  const total = attempt?.total ?? 0
  const answeredCount = attempt?.answered_count ?? 0
  const correctSoFar = useMemo(() => attempt?.answers.filter((a) => a.is_correct).length ?? 0, [attempt])
  const pendingCount = total - answeredCount
  const currentSelection = current ? selections[current.question.id] ?? [] : []

  const toggleChoice = useCallback(
    (choiceId: number) => {
      if (!current) return
      const qid = current.question.id
      setSelections((prev) => {
        const existing = prev[qid] ?? []
        if (current.question.type !== "multiple") return { ...prev, [qid]: [choiceId] }
        return {
          ...prev,
          [qid]: existing.includes(choiceId) ? existing.filter((id) => id !== choiceId) : [...existing, choiceId],
        }
      })
    },
    [current]
  )

  const goTo = (index: number) => {
    if (!attempt) return
    setCurrentIndex(Math.max(0, Math.min(attempt.answers.length - 1, index)))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToNextPending = () => {
    if (!attempt) return
    const after = attempt.answers.findIndex((a, i) => i > currentIndex && !a.answered)
    const before = attempt.answers.findIndex((a) => !a.answered)
    const next = after !== -1 ? after : before
    if (next === -1 || next === currentIndex) {
      setConfirmOpen(true)
    } else {
      goTo(next)
    }
  }

  const handleCheck = async () => {
    if (!current || currentSelection.length === 0) return
    try {
      // Feedback is shown inline by the question card and banner
      await answerQuestion({
        attemptId,
        question_id: current.question.id,
        choice_ids: currentSelection,
      }).unwrap()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleSubmit = async () => {
    try {
      const result = await submitAttempt(attemptId).unwrap()
      setConfirmOpen(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
      if (result.passed) toast.success(`You passed with ${Math.round(parseFloat(result.score))}%!`)
      else toast.info(`You scored ${Math.round(parseFloat(result.score))}%. Keep practicing!`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRetake = async () => {
    if (!attempt) return
    try {
      const next = await startAttempt({ code: attempt.exam_code }).unwrap()
      navigate(`${EXAMS_PATH}/attempts/${next.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  // Keyboard shortcuts: Enter checks the answer / moves on, arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!attempt || attempt.status === "finished" || confirmOpen) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "Enter") {
        e.preventDefault()
        if (current?.answered) goToNextPending()
        else if (currentSelection.length > 0 && !isAnswering) void handleCheck()
      } else if (e.key === "ArrowRight") {
        goTo(currentIndex + 1)
      } else if (e.key === "ArrowLeft") {
        goTo(currentIndex - 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Skeleton className="h-[480px] rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !attempt) {
    return (
      <div className="container mx-auto max-w-xl p-6">
        <Card className="text-center">
          <CardContent className="space-y-4 py-12">
            <XCircle className="mx-auto h-12 w-12 text-red-500/60" />
            <h2 className="text-lg font-semibold">We couldn't load this attempt</h2>
            <p className="text-sm text-muted-foreground">It may not exist or it may belong to another user.</p>
            <Button onClick={() => navigate(EXAMS_PATH)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to exams
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (attempt.status === "finished") {
    return (
      <div className="container mx-auto max-w-7xl space-y-4 p-6">
        <div className="flex justify-end">
          <LanguageToggle value={language} onChange={setLanguage} />
        </div>
        <AttemptResults
          attempt={attempt}
          language={language}
          isRetaking={isRetaking}
          onRetake={handleRetake}
          onBack={() => navigate(EXAMS_PATH)}
          onViewCertificate={() => setCertificateOpen(true)}
        />
        <CertificateModal
          isOpen={certificateOpen}
          onClose={() => setCertificateOpen(false)}
          certificate={{
            examTitle: attempt.exam_title,
            score: attempt.score,
            issuedAt: attempt.finished_at,
            attemptId: attempt.id,
          }}
        />
      </div>
    )
  }

  const progress = total ? (answeredCount / total) * 100 : 0
  const isLast = currentIndex === attempt.answers.length - 1

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/80 p-4 shadow-sm md:flex-row md:items-center">
        <Button variant="ghost" size="sm" className="gap-1.5 self-start md:self-center" onClick={() => navigate(EXAMS_PATH)}>
          <ArrowLeft className="h-4 w-4" /> Exit
        </Button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="truncate text-base font-bold">{attempt.exam_title}</h1>
            <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
              {answeredCount}/{total} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle value={language} onChange={setLanguage} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setConfirmOpen(true)}
            disabled={isSubmitting}
          >
            <Flag className="h-4 w-4" /> Finish
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* Question */}
        <Card className="border-border bg-card/80 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            {current && (
              <QuestionCard
                key={current.question.id}
                answer={current}
                index={currentIndex}
                total={total}
                language={language}
                selection={currentSelection}
                onToggleChoice={toggleChoice}
                disabled={isAnswering}
              />
            )}

            {current?.answered && (
              <div
                className={cn(
                  "mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm",
                  current.is_correct
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                )}
              >
                {current.is_correct ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                <span className="font-medium">
                  {current.is_correct
                    ? "Well done! That's the correct answer."
                    : "That's not right. The correct answer is marked in green."}
                </span>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              {current && !current.answered ? (
                <div className="flex items-center gap-2">
                  {!isLast && (
                    <Button variant="ghost" size="sm" onClick={() => goTo(currentIndex + 1)}>
                      Skip
                    </Button>
                  )}
                  <Button size="sm" className="gap-1.5" onClick={handleCheck} disabled={currentSelection.length === 0 || isAnswering}>
                    {isAnswering ? "Checking..." : "Check answer"}
                  </Button>
                </div>
              ) : pendingCount === 0 ? (
                <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setConfirmOpen(true)}>
                  <Flag className="h-4 w-4" /> See results
                </Button>
              ) : (
                <Button size="sm" className="gap-1.5" onClick={goToNextPending}>
                  Next question <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <Card className="border-border bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Live score</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <p className="text-lg font-bold text-emerald-500">{correctSoFar}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Correct</p>
              </div>
              <div className="rounded-lg bg-red-500/10 p-2">
                <p className="text-lg font-bold text-red-500">{answeredCount - correctSoFar}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Wrong</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-lg font-bold">{pendingCount}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Pending</p>
              </div>
              <p className="col-span-3 pt-1 text-xs text-muted-foreground">
                You need {attempt.passing_score}% ({Math.ceil((attempt.passing_score / 100) * total)} of {total}) to pass
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionNavigator answers={attempt.answers} currentIndex={currentIndex} onSelect={goTo} />
            </CardContent>
          </Card>

          <p className="px-1 text-[11px] text-muted-foreground">
            Your progress is saved automatically. Shortcuts: <kbd className="rounded border px-1">Enter</kbd> check / next,{" "}
            <kbd className="rounded border px-1">←</kbd> <kbd className="rounded border px-1">→</kbd> navigate.
          </p>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingCount > 0
                ? `You still have ${pendingCount} unanswered question${pendingCount === 1 ? "" : "s"}. They will count as incorrect.`
                : "You answered every question. Submit to see your final score."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Keep going</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault()
                void handleSubmit()
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
