<template>
  <div class="page">
    <header class="main-header">
      <div class="brand">
        <img src="/img/logo-unify.png" alt="Logo Unify" class="main-logo" />
        <h1><span>U</span>nify</h1>
      </div>

      <nav class="navbar" aria-label="Navegación principal">
        <ul class="list">
          <li tabindex="0" @click="showHowItWorks = true" @keydown.enter.prevent="showHowItWorks = true">¿Cómo funciona?</li>
          <li tabindex="0" @click="showHelp = true" @keydown.enter.prevent="showHelp = true">Ayuda</li>
        </ul>
      </nav>
    </header>

    <!-- Modal: ¿Cómo funciona? -->
    <div class="info-modal-overlay" v-if="showHowItWorks" @click.self="showHowItWorks = false">
      <div class="info-modal">
        <button class="info-modal-close" @click="showHowItWorks = false" aria-label="Cerrar">&times;</button>
        <h3>¿Cómo funciona Unify?</h3>
        <ul class="info-modal-list">
          <li><strong>Como Cliente:</strong> explora catálogos por empresa, compra productos y rastrea tu pedido en tiempo real en el mapa.</li>
          <li><strong>Como Empresa:</strong> publica tu catálogo, gestiona inventario y pedidos, y chatea directo con tus clientes.</li>
          <li>Elige el tipo de cuenta que corresponda a continuación para empezar.</li>
        </ul>
      </div>
    </div>

    <!-- Modal: Ayuda -->
    <div class="info-modal-overlay" v-if="showHelp" @click.self="showHelp = false">
      <div class="info-modal">
        <button class="info-modal-close" @click="showHelp = false" aria-label="Cerrar">&times;</button>
        <h3>¿Necesitas ayuda?</h3>
        <p>Si tienes problemas para elegir o acceder a tu cuenta, escríbenos a <a href="mailto:soporte@unify.com">soporte@unify.com</a> y con gusto te ayudamos.</p>
      </div>
    </div>

    <main>
      <div class="container">
        <div class="card" @click="selectRole('Empresa')">
          <h2>Empresa</h2>
          <p>Gestiona tu empresa, inventario, pedidos y análisis.</p>
        </div>

        <div class="card" @click="selectRole('Cliente')">
          <h2>Cliente</h2>
          <p>Compra productos, revisa tus pedidos y recibe entregas rápidas.</p>
        </div>
      </div>
    </main>

    <footer class="main-footer">
      © 2026 Unify.web - Todo tu negocio en un solo lugar
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { insforge } from '../insforgeClient.js'
const emit = defineEmits(['switch-view'])

const showHowItWorks = ref(false)
const showHelp = ref(false)

const normalizeRole = (value) => {
  const raw = String(value ?? '').trim().toLowerCase()
  if (raw === 'empresa') return 'Empresa'
  if (raw === 'cliente') return 'Cliente'
  return 'Cliente'
}

const selectRole = async (role) => {
  console.log(`Rol seleccionado: ${role}`)
  const normalizedRole = normalizeRole(role)

  // Intentar persistir en InsForge (tabla `profiles`).
  let userId = null

  try {
    // Preferir la sesión activa
    const userRes = await insforge.auth.getCurrentUser()
    userId = userRes?.data?.user?.id
  } catch (e) {
    console.warn('Error obteniendo sesión:', e)
  }

  // Si no hay sesión, usar el id temporal guardado tras signUp
  if (!userId) {
    try {
      userId = localStorage.getItem('pendingUserId')
    } catch (e) {
      console.warn('No se pudo leer pendingUserId', e)
    }
  }

  if (userId) {
    try {
      await insforge.database.from('profiles').upsert({
        id: userId,
        role: normalizedRole,
        user_type: normalizedRole,
      })
      // limpiar pendingUserId si existía
      try { localStorage.removeItem('pendingUserId') } catch (e) {}
      // también guardar rol localmente para UX instantánea, atado al userId
      localStorage.setItem('userRole', normalizedRole)
      localStorage.setItem('userRoleFor', userId)
      console.log('Rol persistido en InsForge para userId:', userId)
    } catch (err) {
      console.warn('Error guardando rol en InsForge', err)
      try {
        localStorage.setItem('userRole', normalizedRole)
        localStorage.setItem('userRoleFor', userId)
      } catch (e) {}
      try { window.alert('No se pudo guardar el rol en el servidor. Se guardó localmente.') } catch (e) {}
    }
  } else {
    try { localStorage.setItem('userRole', normalizedRole) } catch (e) {}
    console.warn('No se encontró userId, el rol se guardó localmente y se sincronizará al iniciar sesión')
  }

  if (normalizedRole === 'Cliente') {
    emit('switch-view', 'cliente')
    return
  }

  if (normalizedRole === 'Empresa') {
    // En vez de ir directo a la vista de empresa, primero pedimos los datos
    // del negocio (RUT, rubro, teléfono, etc.)
    emit('switch-view', 'empresa-details')
    return
  }

  // Para otros roles, avanzar a la vista principal de la app
  emit('switch-view', 'home')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
}

/* Header */
.main-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border: 0;
}

.main-header h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #005e59 0%, #00ab91 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.main-header h1 span {
  background: linear-gradient(135deg, #0B3C6D 0%, #3A7DBF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Logo */
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.main-logo {
  width: 40px;
  height: 40px;
  border-radius: 25px;
  flex-shrink: 0;
}

/* Navbar */
.navbar .list {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin-right: 20px;
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
  width: 100%;
}

/* Main */
main {
  flex: 1;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  gap: 40px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 250px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
  animation: fadeInUp 0.5s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card h2 {
  color: #005e59;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card p {
  color: #4a5568;
  font-size: 14px;
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

.main-footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .navbar .list {
    gap: 1rem;
  }

  .container {
    flex-direction: column;
    height: auto;
    padding: 2rem 1rem;
    gap: 20px;
  }

  .card {
    width: 100%;
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .navbar .list {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* Modal: ¿Cómo funciona? / Ayuda */
.info-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 60, 109, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.info-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 460px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.info-modal h3 {
  color: var(--bg-start);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.info-modal p {
  color: var(--muted);
  line-height: 1.6;
}

.info-modal p a {
  color: var(--bg-start);
  font-weight: 600;
}

.info-modal-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.info-modal-list li {
  color: var(--muted);
  line-height: 1.5;
  font-size: 0.95rem;
}

.info-modal-list li strong {
  color: var(--bg-start);
}

.info-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--muted-2);
  transition: color 0.2s ease;
}

.info-modal-close:hover {
  color: var(--bg-start);
}
</style>