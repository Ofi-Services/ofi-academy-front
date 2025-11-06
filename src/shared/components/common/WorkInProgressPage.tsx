import { Construction, Wrench, Rocket, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function WorkInProgress() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4 pb-8">
          {/* Icon Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative bg-primary/10 p-6 rounded-full">
                <Construction className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold">Work in Progress</CardTitle>
            <CardDescription className="text-lg">
              We're building something awesome!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Description */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              This section is currently under development. Our team is working hard to bring you 
              new features and improvements.
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon to see what we've been working on!
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Development Progress</span>
              <span className="font-semibold text-primary">65%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: '65%' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              Return to Home
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Have questions or suggestions? Contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}