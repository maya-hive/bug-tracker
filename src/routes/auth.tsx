import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { SignInForm } from '~/components/auth/sign-in-form'
import { SignUpForm } from '~/components/auth/sign-up-form'

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
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="signIn"
            className="w-full"
            onValueChange={() => setError(null)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signIn">Sign In</TabsTrigger>
              <TabsTrigger value="signUp">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signIn" className="space-y-4 mt-6">
              <SignInForm
                onError={setError}
                error={error}
                onSuccess={handleSuccess}
              />
            </TabsContent>

            <TabsContent value="signUp" className="space-y-4 mt-6">
              <SignUpForm
                onError={setError}
                error={error}
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
