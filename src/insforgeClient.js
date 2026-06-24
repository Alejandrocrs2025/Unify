import { createClient } from '@insforge/sdk'

const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || undefined
if (!anonKey) {
  console.warn('VITE_INSFORGE_ANON_KEY no está definido. Las operaciones de autenticación en el navegador pueden fallar.')
}

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL || 'https://2nn8p3kk.us-east.insforge.app',
  anonKey,
})
