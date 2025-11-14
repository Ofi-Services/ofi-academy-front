import type React from "react"
import { useState } from "react"
import { useAuth } from "@/shared/hooks/use-auth"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/Input"
import { Label } from "@/shared/components/ui/label"
import { AlertCircle, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(email, password)
    if (!success) {
      setError("Incorrect credentials. Please try again.")
      setIsLoading(false)
    }
  }

  const fillLeader = () => {
    setEmail("a.cordoba@ofiservices.com")
    setPassword("604216018")
  }

  const fillConsultant = () => {
    setEmail("m.rozo@ofiservices.com")
    setPassword("257758741")
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden bg-background">
        {/* Decorative blurs */}
        <div className="absolute top-20 right-20 h-32 w-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 h-40 w-40 bg-accent/10 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10 bg-card rounded-2xl shadow-sm p-8 border border-border">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-balance">
              Ofi <span className="text-primary">Academy</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Boost your learning to the next level
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-6 bg-muted rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Demo Credentials
              </p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={fillLeader}
                className="w-full text-left p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <p className="text-sm font-medium text-foreground">HR</p>
                <p className="text-xs text-muted-foreground">
                  a.cordoba@ofiservices.co
                </p>
              </button>
              <button
                type="button"
                onClick={fillConsultant}
                className="w-full text-left p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                <p className="text-sm font-medium text-foreground">Consultant</p>
                <p className="text-xs text-muted-foreground">
                  m.rozo@ofiservices.com
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground p-12 items-center justify-center relative overflow-hidden">
        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-bold mb-6 text-balance leading-tight">
            Transform your career through continuous learning
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Access specialized courses, track your progress, and achieve your professional goals.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-3xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/80">Courses</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-3xl font-bold text-primary-foreground">200+</p>
              <p className="text-sm text-primary-foreground/80">Consultants</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-3xl font-bold text-primary-foreground">95%</p>
              <p className="text-sm text-primary-foreground/80">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
