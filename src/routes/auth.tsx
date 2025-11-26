import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { SignInForm } from '~/components/auth/sign-in-form'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-6">
            <SignInForm
              onError={setError}
              error={error}
              onSuccess={handleSuccess}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
