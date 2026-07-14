<script setup>
import { ref, computed } from 'vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Main from './components/Main.vue'
import Cliente from './components/Cliente.vue'
import Empresa from './components/Empresa.vue'
import Pedidos from './components/Pedidos.vue'
import CompanyDetails from './components/CompanyDetails.vue'
import Repartidor from './components/Repartidor.vue'

// Ruta pública sin login: /repartidor/:orderId
const repartidorMatch = window.location.pathname.match(/^\/repartidor\/(.+)$/)
const isRepartidorRoute = computed(() => !!repartidorMatch)
const repartidorOrderId = repartidorMatch ? decodeURIComponent(repartidorMatch[1]) : null

const currentView = ref('home')
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
</script>

<template>
  <Repartidor v-if="isRepartidorRoute" :order-id="repartidorOrderId" />
  <component v-else :is="components[currentView]" @switch-view="switchView" />
</template>