// authHelpers.js
// Lógica compartida de sesión/rol para evitar duplicarla en Login.vue, App.vue, etc.
// (esto ya causó bugs antes: una función se corregía en un archivo y no en el otro).
import { insforge } from './insforgeClient.js'

export const normalizeUserRole = (value) => {
  const raw = String(value ?? '').trim().toLowerCase()
  if (raw === 'empresa') return 'Empresa'
  if (raw === 'cliente') return 'Cliente'
  if (raw === 'delivery') return 'Delivery'
  return value
}

// Devuelve el rol del usuario actualmente autenticado ('Cliente' | 'Empresa' | 'Delivery' | null).
// Revisa primero el caché local (atado al userId) y si no existe, consulta la tabla `profiles`.
export const getUserRole = async () => {
  try {
    const res = await insforge.auth.getCurrentUser()
    const userId = res?.data?.user?.id
    if (!userId) return null

    try {
      const cachedUserId = localStorage.getItem('userRoleFor')
      const cachedRole = localStorage.getItem('userRole')
      if (cachedUserId === userId && cachedRole) return cachedRole
    } catch (e) {
      console.warn('No se pudo leer el cache de rol', e)
    }

    const profileRes = await insforge.database.from('profiles').select('role,user_type').eq('id', userId).single()
    const profileRole = profileRes.data?.role || profileRes.data?.user_type
    if (!profileRes.error && profileRole) {
      const normalizedRole = normalizeUserRole(profileRole)
      try {
        localStorage.setItem('userRole', normalizedRole)
        localStorage.setItem('userRoleFor', userId)
      } catch (e) {}
      return normalizedRole
    }
  } catch (err) {
    console.warn('No se pudo obtener el rol desde Insforge', err)
  }

  return null
}

// Sincroniza `userRole`/`pendingUserId` guardados en localStorage hacia la tabla `profiles`.
// Se usa justo después de iniciar sesión (con contraseña u OAuth).
export const syncPendingRole = async () => {
  let role = null
  try {
    role = localStorage.getItem('userRole')
  } catch (e) {
    console.warn('No se pudo leer userRole desde localStorage', e)
  }

  if (!role) return

  try {
    const res = await insforge.auth.getCurrentUser()
    const userId = res?.data?.user?.id
    if (!userId) {
      console.warn('No hay sesión activa para sincronizar rol')
      return
    }

    const normalizedRole = normalizeUserRole(role)
    await insforge.database.from('profiles').upsert({ id: userId, role: normalizedRole, user_type: normalizedRole })
    try { localStorage.removeItem('pendingUserId') } catch (e) {}
    try {
      localStorage.setItem('userRole', normalizedRole)
      localStorage.setItem('userRoleFor', userId)
    } catch (e) {}
  } catch (err) {
    console.warn('Error sincronizando rol pendiente:', err)
  }
}

// Determina a qué vista mandar a alguien que ya tiene sesión activa
// ('cliente' | 'empresa' | 'home' | 'main' si no hay rol elegido todavía).
export const routeForRole = (role) => {
  const normalized = role?.toString()?.trim()?.toLowerCase()
  if (normalized === 'cliente') return 'cliente'
  if (normalized === 'empresa') return 'empresa'
  if (normalized === 'delivery') return 'home'
  // Sin rol conocido (ej. primer login con Google/GitHub): que elija Cliente o Empresa.
  return 'main'
}

// Revisa si hay una sesión activa ahora mismo y, si la hay, sincroniza el rol pendiente
// y devuelve la vista a la que se debería navegar. Si no hay sesión, devuelve null.
export const checkSessionAndGetView = async () => {
  try {
    const { data, error } = await insforge.auth.getCurrentUser()
    if (error || !data?.user) return null
    await syncPendingRole()
    const role = await getUserRole()
    return routeForRole(role)
  } catch (err) {
    console.warn('No se pudo verificar la sesión activa:', err)
    return null
  }
}