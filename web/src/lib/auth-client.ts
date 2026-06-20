import { createAuthClient } from 'better-auth/react'

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
}

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
})
