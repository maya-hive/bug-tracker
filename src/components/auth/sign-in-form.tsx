import { useForm } from '@tanstack/react-form'
import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface SignInFormProps {
  onError: (error: string) => void
  error: string | null
  onSuccess: () => void
}

export function SignInForm({ onError, error, onSuccess }: SignInFormProps) {
  const { signIn } = useAuthActions()

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
        throw err
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => (!value ? 'Email is required' : undefined),
          onBlur: ({ value }) => (!value ? 'Email is required' : undefined),
        }}
      >
        {(field) => (
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
              disabled={form.state.isSubmitting}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            !value ? 'Password is required' : undefined,
          onBlur: ({ value }) => (!value ? 'Password is required' : undefined),
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              placeholder="Enter your password"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              disabled={form.state.isSubmitting}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
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
