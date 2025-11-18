import FacePile from '@convex-dev/presence/facepile'
import usePresence from '@convex-dev/presence/react'
import { api } from 'convex/_generated/api'
import { useAuthUser } from '~/contexts/use-auth-user'

export const UserPresence = () => {
  const user = useAuthUser()
  const presenceState = usePresence(api.presence, 'app', user.name)

  return <FacePile presenceState={presenceState ?? []} />
}
