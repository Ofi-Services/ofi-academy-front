import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Button } from "@/shared/components/ui/button"
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
import { AlertCircle, GraduationCap, History, RefreshCw } from "lucide-react"
import ExamsTab from "../components/ExamsTab"
import AttemptHistoryTab from "../components/AttemptHistoryTab"
import CertificateModal, { type CertificateData } from "../components/CertificateModal"
import { getApiErrorMessage, useGetAttemptsQuery, useGetExamsQuery, useStartAttemptMutation } from "../store/certificationsApi"
import type { Exam } from "../types"

const TAB_VALUES = ["exams", "history"] as const
type TabValue = (typeof TAB_VALUES)[number]

function resolveTab(raw: string | null): TabValue {
  return TAB_VALUES.includes(raw as TabValue) ? (raw as TabValue) : "exams"
}

export default function QuizzesCertificationsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveTab(searchParams.get("tab"))

  const { data: exams = [], isLoading: examsLoading, isError: examsError, refetch } = useGetExamsQuery()
  const { data: attempts = [], isLoading: attemptsLoading } = useGetAttemptsQuery()
  const [startAttempt] = useStartAttemptMutation()

  const [startingCode, setStartingCode] = useState<string | null>(null)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [restartTarget, setRestartTarget] = useState<Exam | null>(null)

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === "exams") next.delete("tab")
    else next.set("tab", value)
    setSearchParams(next, { replace: true })
  }

  const openAttempt = (attemptId: number) => navigate(`/quizzes-certifications/attempts/${attemptId}`)

  const begin = async (exam: Exam, restart: boolean) => {
    setStartingCode(exam.code)
    try {
      const attempt = await startAttempt({ code: exam.code, restart }).unwrap()
      openAttempt(attempt.id)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't start the exam. Please try again."))
    } finally {
      setStartingCode(null)
    }
  }

  const handleViewCertificate = (exam: Exam) => {
    // Best passing attempt of this exam
    const best = attempts
      .filter((a) => a.exam_code === exam.code && a.passed)
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))[0]
    setCertificate({
      examTitle: exam.title,
      score: best?.score ?? exam.user_stats?.best_score ?? null,
      issuedAt: best?.finished_at ?? exam.user_stats?.last_attempt?.finished_at ?? null,
      attemptId: best?.id ?? null,
    })
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-6 sm:p-8">
        <GraduationCap className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-primary/10" />
        <div className="relative max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Certification Training</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Prepare for your certifications</h1>
          <p className="text-sm text-muted-foreground">
            Practice with real exam questions, get instant feedback on every answer and track your progress.
            Every attempt is saved to your history.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid h-auto w-full max-w-md grid-cols-2">
          <TabsTrigger value="exams" className="gap-2 py-2">
            <GraduationCap className="h-4 w-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2 py-2">
            <History className="h-4 w-4" />
            My results
            {attempts.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">{attempts.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="mt-0">
          {examsError ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/5 py-12 text-center">
              <AlertCircle className="h-10 w-10 text-red-500/70" />
              <p className="text-sm font-medium">We couldn't load the exams.</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            </div>
          ) : (
            <ExamsTab
              exams={exams}
              isLoading={examsLoading}
              startingCode={startingCode}
              onStart={(exam) => begin(exam, false)}
              onResume={openAttempt}
              onRestart={setRestartTarget}
              onViewCertificate={handleViewCertificate}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <AttemptHistoryTab attempts={attempts} isLoading={attemptsLoading} onReview={openAttempt} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={restartTarget !== null} onOpenChange={(open) => !open && setRestartTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current progress in "{restartTarget?.title}" will be discarded and a new attempt will start.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (restartTarget) void begin(restartTarget, true)
                setRestartTarget(null)
              }}
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CertificateModal certificate={certificate} isOpen={certificate !== null} onClose={() => setCertificate(null)} />
    </div>
  )
}
