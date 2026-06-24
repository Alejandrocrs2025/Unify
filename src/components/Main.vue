<template>
  <div class="page">
    <header>
      <h1><span>U</span>nify</h1>
      <img src="/img/logo-unify.png" alt="Logo Unify" />

      <nav class="navbar" aria-label="Navegación principal">
        <ul class="list">
          <li tabindex="0">Menú</li>
          <li tabindex="0">Secciones</li>
          <li tabindex="0">Idioma</li>
          <li tabindex="0">Configuración</li>
        </ul>
      </nav>
    </header>

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

        <div class="card" @click="selectRole('Delivery')">
          <h2>Delivery</h2>
          <p>Administra entregas y ubicación en tiempo real.</p>
        </div>
      </div>
    </main>

    <footer>
      © 2026 Unify.web - Todo tu negocio en un solo lugar
    </footer>
  </div>
</template>

<script setup>
import { insforge } from '../insforgeClient.js'
const emit = defineEmits(['switch-view'])

const selectRole = async (role) => {
  console.log(`Rol seleccionado: ${role}`)

  // Intentar persistir en InsForge (tabla `profiles`).
  let userId = null

  try {
    // Preferir la sesión activa
    const userRes = await insforge.auth.getUser()
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
      await insforge.from('profiles').upsert({ id: userId, role })
      // limpiar pendingUserId si existía
      try { localStorage.removeItem('pendingUserId') } catch (e) {}
      // también guardar rol localmente para UX instantánea
      localStorage.setItem('userRole', role)
      console.log('Rol persistido en InsForge para userId:', userId)
      try { window.alert('Rol guardado correctamente.') } catch (e) {}
    } catch (err) {
      console.warn('Error guardando rol en InsForge', err)
      try { localStorage.setItem('userRole', role) } catch (e) {}
      try { window.alert('No se pudo guardar el rol en el servidor. Se guardó localmente.') } catch (e) {}
    }
  } else {
    try { localStorage.setItem('userRole', role) } catch (e) {}
    console.warn('No se encontró userId, el rol se guardó localmente y se sincronizará al iniciar sesión')
  }

  if (role === 'Cliente') {
    emit('switch-view', 'cliente')
    return
  }

  // Para otros roles, avanzar a la vista principal de la app
  emit('switch-view', 'home')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
}

/* Header */
header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border: 0;
}

header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-left: 25px;
  background: linear-gradient(135deg, #005e59 0%, #00ab91 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

header h1 span {
  background: linear-gradient(135deg, #0B3C6D 0%, #3A7DBF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Logo */
img {
  width: 40px;
  height: 40px;
  position: absolute;
  top: 2.5rem;
  left: 1rem;
  border-radius: 25px;
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

footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  header {
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
</style>