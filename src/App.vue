<script setup>
import { ref, computed, onMounted } from 'vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Main from './components/Main.vue'
import Cliente from './components/Cliente.vue'
import Empresa from './components/Empresa.vue'
import Pedidos from './components/Pedidos.vue'
import CompanyDetails from './components/CompanyDetails.vue'
import Repartidor from './components/Repartidor.vue'
import { checkSessionAndGetView } from './authHelpers.js'

// Ruta pública sin login: /repartidor/:orderId
const repartidorMatch = window.location.pathname.match(/^\/repartidor\/(.+)$/)
const isRepartidorRoute = computed(() => !!repartidorMatch)
const repartidorOrderId = repartidorMatch ? decodeURIComponent(repartidorMatch[1]) : null

const currentView = ref('home')
const checkingSession = ref(true)
const components = {
  home: Home,
  login: Login,
  register: Register,
  main: Main,
  cliente: Cliente,
  empresa: Empresa,
  pedidos: Pedidos,
  'empresa-details': CompanyDetails,
}
const switchView = (view) => {
  const normalized = view?.toLowerCase?.() ?? view
  console.log('Cambiando vista a:', normalized)
  if (components[normalized]) currentView.value = normalized
}

// Se ejecuta una sola vez al cargar la app (por ejemplo, justo después de
// volver de Google/GitHub tras el login con OAuth). Si hay sesión activa,
// manda directo a la vista que le corresponde en vez de mostrar Home.vue.
onMounted(async () => {
  if (isRepartidorRoute.value) {
    checkingSession.value = false
    return
  }
  try {
    const nextView = await checkSessionAndGetView()
    if (nextView) currentView.value = nextView
  } finally {
    checkingSession.value = false
  }
})
</script>

<template>
  <Repartidor v-if="isRepartidorRoute" :order-id="repartidorOrderId" />
  <div v-else-if="checkingSession" class="app-boot-loading">
    <div class="spinner"></div>
  </div>
  <component v-else :is="components[currentView]" @switch-view="switchView" />
</template>

<style scoped>
.app-boot-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: app-boot-spin 0.8s linear infinite;
}

@keyframes app-boot-spin {
  to { transform: rotate(360deg); }
}
</style>