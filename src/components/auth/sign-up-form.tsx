import { useForm } from '@tanstack/react-form'
import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface SignUpFormProps {
  onError: (error: string) => void
  error: string | null
  onSuccess: () => void
}

export function SignUpForm({ onError, error, onSuccess }: SignUpFormProps) {
  const { signIn } = useAuthActions()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        // FormData is required by Convex auth signIn function
        const formData = new FormData()
        formData.append('email', value.email)
        formData.append('password', value.password)
        formData.append('name', value.name.trim())
        formData.append('flow', 'signUp')

        await signIn('password', formData)

        onSuccess()
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'An error occurred during authentication'
        onError(errorMessage)
        throw err // Re-throw to let TanStack Form handle submission state
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
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value.trim() ? 'Name is required' : undefined,
          onBlur: ({ value }) =>
            !value.trim() ? 'Name is required' : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="signup-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Your name"
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
        name="email"
        validators={{
          onChange: ({ value }) => (!value ? 'Email is required' : undefined),
          onBlur: ({ value }) => (!value ? 'Email is required' : undefined),
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="signup-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-email"
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
          onChange: ({ value }) => {
            if (!value) return 'Password is required'
            if (value.length < 8)
              return 'Password must be at least 8 characters long'
            return undefined
          },
          onBlur: ({ value }) => {
            if (!value) return 'Password is required'
            if (value.length < 8)
              return 'Password must be at least 8 characters long'
            return undefined
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="signup-password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              required
              disabled={form.state.isSubmitting}
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
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
        {form.state.isSubmitting ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  )
}
