import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useAuthActions } from '@convex-dev/auth/react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '~/components/ui/input-group'
import { Label } from '~/components/ui/label'

interface SignInFormProps {
  onError: (error: string) => void
  error: string | null
  onSuccess: () => void
}

export function SignInForm({ onError, error, onSuccess }: SignInFormProps) {
  const { signIn } = useAuthActions()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData()
        formData.append('email', value.email)
        formData.append('password', value.password)
        formData.append('flow', 'signIn')

        await signIn('password', formData)
        onSuccess()
      } catch (err) {
        onError('Invalid email or password.')
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) => {
            if (!value) return 'Email is required'

            return undefined
          },
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0
          const errorId = `signin-email-error`

          return (
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                required
                autoComplete="email"
                autoFocus
                disabled={form.state.isSubmitting}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
              />
              {hasError && (
                <p id={errorId} className="text-sm text-destructive" role="alert">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )
        }}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onBlur: ({ value }) => {
            if (!value) return 'Password is required'
            return undefined
          },
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0
          const errorId = `signin-password-error`

          return (
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <InputGroup data-disabled={form.state.isSubmitting}>
                <InputGroupInput
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                  autoComplete="current-password"
                  disabled={form.state.isSubmitting}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={form.state.isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    size="icon-xs"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {hasError && (
                <p id={errorId} className="text-sm text-destructive" role="alert">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )
        }}
      </form.Field>

      {error && (
        <div
          className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
