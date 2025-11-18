import { createContext, useContext } from 'react'
import type { User } from '~/types/user'

export const AuthUserContext = createContext<User>({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  image: 'https://api.dicebear.com/9.x/glass/svg?seed=1',
})

export function useAuthUser() {
  return useContext(AuthUserContext)
}
