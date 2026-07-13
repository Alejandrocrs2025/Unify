<script setup>
import { ref, onMounted } from 'vue'
import { insforge } from '../insforgeClient.js'

const emit = defineEmits(['switch-view'])
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const message = ref('')
const messageType = ref('')
const loading = ref(false)
const oauthLoading = ref('')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
}

const getSignedUser = (data) => {
  return data?.user || data?.session?.user || data?.session || null
}

const getAuthErrorMessage = (error, fallback = 'No se pudo completar el inicio de sesión.') => {
  const raw = error?.message || error?.error || error?.statusText || ''
  const message = String(raw).toLowerCase()

  if (!raw) return fallback
  if (message.includes('invalid') || message.includes('incorrect') || message.includes('credentials')) {
    return 'Correo o contraseña incorrectos. Intenta de nuevo.'
  }
  if (message.includes('forbidden') || message.includes('verify')) {
    return 'Tu cuenta no pudo validarse. Revisa el estado de la cuenta o inténtalo nuevamente.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
  }
  return raw
}

const handleSubmit = async () => {
  showMessage('', '')

  if (!email.value || !password.value) {
    showMessage('Por favor completa todos los campos.', 'error')
    return
  }

  loading.value = true
  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) {
      showMessage(getAuthErrorMessage(error, 'Error de inicio de sesión.'), 'error')
      return
    }

    if (!data) {
      showMessage('No se recibió respuesta del servidor.', 'error')
      return
    }

    const user = getSignedUser(data)
    if (!user) {
      showMessage('Inicio de sesión exitoso, pero no se pudo validar el usuario.', 'warning')
    }

    await syncPendingRole()
    const nextView = await routeAfterLogin()
    emit('switch-view', nextView)
  } catch (err) {
    console.error('Login error:', err)
    showMessage(getAuthErrorMessage(err, 'Error inesperado durante el inicio de sesión.'), 'error')
  } finally {
    loading.value = false
  }
}

const handleOAuth = async (provider) => {
  showMessage('', '')
  oauthLoading.value = provider

  try {
    const redirectTo = window.location.origin
    const { data, error } = await insforge.auth.signInWithOAuth(provider, { redirectTo })

    if (error) {
      showMessage(getAuthErrorMessage(error, `No se pudo iniciar sesión con ${provider}.`), 'error')
      return
    }

    if (data?.url) {
      window.location.href = data.url
      return
    }

    showMessage(`No se recibió URL de redirección para ${provider}. Revisa la configuración de OAuth.`, 'error')
  } catch (err) {
    showMessage(getAuthErrorMessage(err, `Error inesperado con ${provider}.`), 'error')
  } finally {
    oauthLoading.value = ''
  }
}

const recoverPassword = () => {
  showMessage('Función de recuperación de contraseña en construcción.', 'info')
}

const goToRegister = () => {
  emit('switch-view', 'register')
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const oauthError = params.get('error')
  const oauthErrorDescription = params.get('error_description')

  if (oauthError) {
    showMessage(oauthErrorDescription || 'No se pudo completar el inicio de sesión con el proveedor.', 'error')
  }

  try {
    const { data, error } = await insforge.auth.getCurrentUser()
    if (!error && data?.user) {
      await syncPendingRole()
      const nextView = await routeAfterLogin()
      emit('switch-view', nextView)
    }
  } catch (err) {
    console.debug('No hay usuario vigente.', err)
  }
})

const normalizeUserRole = (value) => {
  const raw = String(value ?? '').trim().toLowerCase()
  if (raw === 'empresa') return 'Empresa'
  if (raw === 'cliente') return 'Cliente'
  if (raw === 'delivery') return 'Delivery'
  return value
}

const getUserRole = async () => {
  try {
    const res = await insforge.auth.getCurrentUser()
    const userId = res?.data?.user?.id
    if (!userId) return null

    // El cache solo es válido si pertenece a ESTE usuario.
    // Antes se leía 'userRole' sin verificar el dueño, por lo que un usuario
    // podía heredar el rol cacheado de una sesión anterior en el mismo navegador.
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

const routeAfterLogin = async () => {
  const role = (await getUserRole())?.toString()?.trim()?.toLowerCase()
  if (role === 'cliente') return 'cliente'
  if (role === 'empresa') return 'empresa'
  if (role === 'delivery') return 'home'
  return 'cliente'
}

// Sincroniza `userRole` y `pendingUserId` desde localStorage a la tabla `profiles`
const syncPendingRole = async () => {
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
    // limpiar pendingUserId y re-cachear el rol ya atado a este userId
    try { localStorage.removeItem('pendingUserId') } catch (e) {}
    try {
      localStorage.setItem('userRole', normalizedRole)
      localStorage.setItem('userRoleFor', userId)
    } catch (e) {}
    console.log('Rol sincronizado correctamente en InsForge')
    showMessage('Rol sincronizado correctamente.', 'success')
  } catch (err) {
    console.warn('Error sincronizando rol pendiente:', err)
    showMessage('No se pudo sincronizar el rol pendiente.', 'error')
  }
}
</script>

<template>
    <div class="login-page">
    <header class="login-header">
      <div class="brand"> <!-- ← NUEVO: contenedor para logo y título -->
        <img src="/img/logo-unify.png" alt="Logo de Unify" />
        <h1><span>U</span>nify</h1>
      </div>
      <nav class="navbar" aria-label="Navegación principal">
        <ul class="list">
          <li tabindex="0">Menú</li>
          <li tabindex="0">Secciones</li>
          <li tabindex="0">Idioma</li>
          <li tabindex="0">Configuración</li>
        </ul>
      </nav>
    </header>
    <!-- Resto del contenido -->

    <main>
      <article class="login-card">
        <form @submit.prevent="handleSubmit" class="login-form" aria-label="Formulario de inicio de sesión">
          <h2>Iniciar sesión</h2>

          <div class="oauth-buttons">
            <button type="button" class="oauth-btn google" @click="handleOAuth('google')" :disabled="oauthLoading === 'google'">
              <span class="icon" aria-hidden="true">
                <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.2-4.6-50.4H272.1v95.4h146.9c-6.3 33.7-25.2 62.3-53.8 81.4v67.7h86.9c50.9-46.9 80.4-115.7 80.4-193.9z" />
                  <path fill="#34A853" d="M272.1 544.3c72.9 0 134.1-24.2 178.8-65.8l-86.9-67.7c-24.1 16.1-55 25.5-91.9 25.5-70.6 0-130.4-47.6-151.8-111.8H31.6v70.4c44.5 88.1 136.3 149.4 240.5 149.4z" />
                  <path fill="#FBBC05" d="M120.3 325.8c-10.1-29.5-10.1-61.2 0-90.7V164.7H31.6c-38.9 77.6-38.9 169.6 0 247.2l88.7-70.4z" />
                  <path fill="#EA4335" d="M272.1 108.4c39.6-.6 77.8 14.4 106.7 41.4l80-80C405.8 24.2 344.6 0 272.1 0 168 0 76.2 61.3 31.6 149.4l88.7 70.4C141.7 156 201.5 108.4 272.1 108.4z" />
                </svg>
              </span>
              {{ oauthLoading === 'google' ? 'Redirigiendo...' : 'Iniciar con Google' }}
            </button>

            <button type="button" class="oauth-btn github" @click="handleOAuth('github')" :disabled="oauthLoading === 'github'">
              <span class="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.112.82-.262.82-.583 0-.288-.01-1.05-.015-2.06-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.805 1.305 3.49.998.108-.775.42-1.305.763-1.605-2.665-.305-5.466-1.335-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.125-.304-.535-1.527.115-3.18 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.655 1.653.245 2.876.12 3.18.77.84 1.235 1.91 1.235 3.22 0 4.605-2.805 5.62-5.475 5.92.43.372.81 1.102.81 2.222 0 1.605-.015 2.896-.015 3.286 0 .325.21.7.825.58C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </span>
              {{ oauthLoading === 'github' ? 'Redirigiendo...' : 'Iniciar con GitHub' }}
            </button>
          </div>

          <div class="oauth-divider">o inicia con tu correo</div>

          <p class="info-banner">Puedes entrar con tu correo o con Google y GitHub.</p>
          <p v-if="message" :class="['form-message', messageType]">{{ message }}</p>

          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              v-model="email"
              class="input-field"
              placeholder="usuario@ejemplo.com"
              required
              aria-required="true"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="password-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                v-model="password"
                class="input-field"
                placeholder="Ingresa tu contraseña"
                required
                aria-required="true"
              />
              <span
                class="toggle-password"
                role="button"
                tabindex="0"
                @click="togglePasswordVisibility"
                @keydown.enter.prevent="togglePasswordVisibility"
                aria-label="Mostrar/ocultar contraseña"
              >{{ showPassword ? 'Ocultar' : 'Mostrar' }}</span>
            </div>
          </div>

          <div class="form-actions">
            <div class="forgot-password">
              <a href="#" @click.prevent="recoverPassword" aria-label="Recuperar contraseña olvidada">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <button type="submit" class="login-btn" :disabled="loading">
              {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
            <p class="register-hint">
              ¿Aún no tienes cuenta? <button type="button" class="link-button" @click="goToRegister">Crea una cuenta</button>
            </p>
          </div>
        </form>
      </article>
    </main>

    <footer class="login-footer">
      <p>&copy; 2026 Unify. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
}

/* HEADER */
.login-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.brand img {
  width: 40px;
  height: 40px;
  border-radius: 25px;
  display: block;
  position: relative;
}

.brand h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  background: linear-gradient(135deg, #005e59 0%, #00ab91 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-left: -1rem;
}

.brand h1 span {
  background: linear-gradient(135deg, #0B3C6D 0%, #3A7DBF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.navbar {
  display: flex;
  align-items: center;
  /* SIN position */
}

.navbar .list {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar .list li {
  color: #4a5568;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.navbar .list li:hover {
  color: #005e59;
}

.navbar .list li::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background: linear-gradient(135deg, #005e59 0%, #013d4f 100%);
  transition: width 0.3s ease;
}

.navbar .list li:hover::after {
  width: 100%; /* ← AÑADE ESTO */
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  transition: transform 0.3s ease;
  animation: fadeInUp 0.5s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form h2 {
  color: #005e59;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.oauth-btn {
  color: white;
  cursor: pointer;
  border: none;
  border-radius: 10px;
  width: 100%;
  padding: 0.85rem 1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.oauth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.oauth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.oauth-btn.google {
  background: #4285f4;
}

.oauth-btn.github {
  background: #24292f;
}

.oauth-btn .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.oauth-divider {
  text-align: center;
  color: #718096;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.info-banner {
  margin: 0 0 0.75rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: rgba(0, 94, 89, 0.08);
  color: #005e59;
  font-size: 0.95rem;
  text-align: center;
}

.form-message {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
}

.form-message.success {
  background: #e6fffa;
  color: #065f46;
}

.form-message.error {
  background: #ffe8e8;
  color: #9b2c2c;
}

.form-message.info {
  background: #eff6ff;
  color: #1e3a8a;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.input-field:focus {
  border-color: #005e59;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #a0aec0;
}

.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #a0aec0;
  user-select: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #005e59;
}

.form-actions {
  margin-top: 1.5rem;
}

.forgot-password {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-password a {
  color: #005e59;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #0B3C6D 0%, #4FA9A3 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.login-btn:active {
  transform: translateY(0);
}

.register-hint {
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #4a5568;
  text-align: center;
}

.link-button {
  background: none;
  border: none;
  color: #005e59;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin: 0;
}

.link-button:hover {
  color: #0b3c6d;
}

.login-footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .login-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .navbar .list {
    gap: 1rem;
  }

  .login-card {
    margin: 1rem;
    padding: 1.5rem;
  }

  .login-form h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .navbar .list {
    flex-wrap: wrap;
    justify-content: center;
  }

  .login-card {
    padding: 1rem;
  }
}
</style>