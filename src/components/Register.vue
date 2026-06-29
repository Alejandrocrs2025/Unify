<script setup>
import { ref, computed } from 'vue'
import { insforge } from '../insforgeClient.js'

const emit = defineEmits(['switch-view'])

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptedTerms = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const message = ref('')
const messageType = ref('')

const passwordHint = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 6) return 'Contraseña débil'
  if (password.value.length < 10) return 'Contraseña moderada'
  return 'Contraseña fuerte'
})

const passwordHintClass = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 6) return 'weak'
  if (password.value.length < 10) return 'moderate'
  return 'strong'
})

const passwordMatchMessage = computed(() => {
  if (!confirmPassword.value) return ''
  return password.value === confirmPassword.value ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'
})

const passwordMatchClass = computed(() => {
  if (!confirmPassword.value) return ''
  return password.value === confirmPassword.value ? 'strong' : 'weak'
})

const togglePasswordVisibility = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirm.value = !showConfirm.value
  }
}

const handleSubmit = async () => {
  message.value = ''
  messageType.value = ''

  if (!acceptedTerms.value) {
    message.value = 'Debes aceptar los términos y condiciones'
    messageType.value = 'error'
    return
  }

  if (password.value !== confirmPassword.value) {
    message.value = 'Las contraseñas no coinciden'
    messageType.value = 'error'
    return
  }

  try {
    const { data, error } = await insforge.auth.signUp({
      email: email.value,
      password: password.value,
      name: `${firstName.value} ${lastName.value}`,
    })

    if (error) {
      message.value = error.message || 'Error al crear la cuenta'
      messageType.value = 'error'
      return
    }

    // Si la respuesta devuelve una URL (por ejemplo flujo OAuth), redirigir
    if (data?.url) {
      window.location.href = data.url
      return
    }

    message.value = 'Cuenta creada exitosamente. Revisa tu correo para verificarla.'
    messageType.value = 'success'

    // Redirigir al selector de tipo de usuario (Main) para que el usuario elija su rol
    // Si la respuesta incluye el usuario, guardamos su id temporalmente para persistir el rol después
    if (data?.user?.id) {
      try {
        localStorage.setItem('pendingUserId', data.user.id)
      } catch (e) {
        console.warn('No se pudo guardar pendingUserId en localStorage', e)
      }
    }

    emit('switch-view', 'main')
  } catch (err) {
    message.value = err?.message || 'Error inesperado'
    messageType.value = 'error'
  }
}

const goToLogin = () => {
  emit('switch-view', 'login')
}
</script>

<template>
  <div class="register-page">
    <header class="register-header">
      <div class="brand">
        <h1><span>U</span>nify</h1>
        <img src="/img/logo-unify.png" alt="Unify logo" class="register-logo" />
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

    <main class="register-main">
      <article class="login-card">
        <form @submit.prevent="handleSubmit" class="login-form" aria-label="Formulario de registro">
          <h2>Crear cuenta</h2>

          <p v-if="message" :class="['form-message', messageType]">{{ message }}</p>

          <div class="form-row">
            <div class="form-group">
              <label for="first-name">Nombre</label>
              <input
                type="text"
                id="first-name"
                v-model="firstName"
                name="first_name"
                class="input-field"
                placeholder="Tu nombre"
                required
                aria-required="true"
              />
            </div>
            <div class="form-group">
              <label for="last-name">Apellido</label>
              <input
                type="text"
                id="last-name"
                v-model="lastName"
                name="last_name"
                class="input-field"
                placeholder="Tu apellido"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model="email"
              name="email"
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
                v-model="password"
                name="password"
                class="input-field"
                placeholder="Crea una contraseña"
                required
                aria-required="true"
              />
              <span
                class="toggle-password"
                role="button"
                tabindex="0"
                @click="togglePasswordVisibility('password')"
                @keydown.enter.prevent="togglePasswordVisibility('password')"
                aria-label="Mostrar/ocultar contraseña"
              ></span>
            </div>
            <span class="password-hint" :class="passwordHintClass">{{ passwordHint }}</span>
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirmar contraseña</label>
            <div class="password-wrapper">
              <input
                :type="showConfirm ? 'text' : 'password'"
                id="confirm-password"
                v-model="confirmPassword"
                name="confirm_password"
                class="input-field"
                placeholder="Repite tu contraseña"
                required
                aria-required="true"
              />
              <span
                class="toggle-password"
                role="button"
                tabindex="0"
                @click="togglePasswordVisibility('confirmPassword')"
                @keydown.enter.prevent="togglePasswordVisibility('confirmPassword')"
                aria-label="Mostrar/ocultar contraseña"
              ></span>
            </div>
            <span class="password-hint" :class="passwordMatchClass">{{ passwordMatchMessage }}</span>
          </div>

          <div class="form-group terms-group">
            <label class="checkbox-label">
              <input type="checkbox" id="terms" v-model="acceptedTerms" required aria-required="true" />
              <span>Acepto los <a href="#" aria-label="Ver términos y condiciones">términos y condiciones</a></span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="login-btn" aria-label="Crear cuenta">Crear Cuenta</button>
          </div>

          <p class="redirect-link">¿Ya tienes cuenta? <button type="button" class="link-button" @click="goToLogin">Iniciar sesión</button></p>
        </form>
      </article>
    </main>

    <footer class="register-footer">
      <p>&copy; 2026 Unify. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>


<style scoped>
/* Register page — scoped: los estilos solo afectan este componente */

.register-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.register-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.register-logo {
  width: 40px;
  height: 40px;
  border-radius: 25px;
  position: fixed;
  top: 2rem;
  left: 2rem;
}

.register-header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--bg-start) 0%, var(--brand-mid) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.register-header h1 span {
  background: linear-gradient(135deg, var(--brand-1) 0%, var(--brand-2) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Navigation */
.navbar {
    display: flex;
    align-items: center;
    height: 68px;
}
.navbar .list {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.navbar .list li {
  color: var(--muted);
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.navbar .list li:hover {
  color: var(--bg-start);
}

.navbar .list li::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background: linear-gradient(135deg, var(--bg-start) 0%, var(--brand-darker) 100%);
  transition: width 0.3s ease;
}

.navbar .list li:hover::after {
  width: 100%;
}

/* Main */
.register-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Register Card */
.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
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

/* Form */
.login-form h2 {
  color: var(--bg-start);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--muted);
  font-weight: 500;
  font-size: 0.9rem;
}

/* Fila doble: nombre + apellido */
.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.form-row .form-group {
  flex: 1;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.input-field:focus {
  border-color: var(--bg-start);
  box-shadow: 0 0 0 3px rgba(var(--bg-rgb), 0.1);
}

.input-field::placeholder {
  color: var(--muted-2);
}

/* Password wrapper */
.password-wrapper {
  position: relative;
}

.password-wrapper .input-field {
  padding-right: 42px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--muted-2);
  user-select: none;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.toggle-password::before {
  content: '👁';
  font-size: 16px;
}

.toggle-password:hover {
  color: var(--bg-start);
}

/* Hints de fortaleza / coincidencia */
.password-hint {
  display: block;
  font-size: 0.78rem;
  margin-top: 5px;
  min-height: 16px;
  font-weight: 500;
  transition: color 0.3s ease;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.password-hint.weak     { color: var(--red); }
.password-hint.moderate { color: var(--orange); }
.password-hint.strong   { color: var(--green); }

/* Checkbox términos */
.terms-group {
  margin-top: 4px;
  margin-bottom: 1.2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--muted);
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--bg-start);
  flex-shrink: 0;
}

.checkbox-label a {
  color: var(--bg-start);
  text-decoration: none;
  transition: color 0.3s ease;
}

.checkbox-label a:hover {
  color: var(--brand-1);
  text-decoration: underline;
}

/* Botón principal */
.form-actions {
  margin-top: 0.5rem;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--brand-1) 0%, var(--accent) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(var(--brand1-rgb), 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

/* Enlace al login */
.redirect-link {
  text-align: center;
  font-size: 0.85rem;
  margin-top: 1.25rem;
  color: var(--muted);
}

.redirect-link a {
  color: var(--bg-start);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.redirect-link a:hover {
  color: var(--brand-1);
  text-decoration: underline;
}

/* Footer */
.register-footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--muted);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .register-header {
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

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>