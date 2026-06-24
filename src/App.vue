<script setup>
import { ref } from 'vue'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import Main from './components/Main.vue'
import Cliente from './components/Cliente.vue'

const currentView = ref('home')
const components = { home: Home, login: Login, register: Register, main: Main, cliente: Cliente }
const switchView = (view) => {
  const normalized = view?.toLowerCase?.() ?? view
  if (components[normalized]) currentView.value = normalized
}
</script>

<template>
  <component :is="components[currentView]" @switch-view="switchView" />
</template>
