<template>
  <button
    type="button"
    class="lang-btn"
    translate="no"
    :title="lang === 'es' ? 'Switch to English' : 'Cambiar a español'"
    @click="toggleLang"
  >
    <i class="fa-solid fa-globe"></i> {{ lang === 'es' ? 'EN' : 'ES' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

// Google guarda el idioma elegido en una cookie, así se mantiene al recargar
const lang = ref(document.cookie.includes('googtrans=/es/en') ? 'en' : 'es')

function toggleLang() {
  if (lang.value === 'es') {
    // Pasar a inglés: mover el selector oculto del widget de Google
    const select = document.querySelector('.goog-te-combo')
    if (!select) return // el widget aún no terminó de cargar
    select.value = 'en'
    select.dispatchEvent(new Event('change'))
    lang.value = 'en'
  } else {
    // Volver a español: borrar la cookie y recargar (es lo más confiable)
    const expired = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
    document.cookie = expired
    document.cookie = `${expired}; domain=${location.hostname}`
    location.reload()
  }
}
</script>

<style scoped>
.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 40px;
  border: 1.5px solid var(--green-600);
  background: transparent;
  color: var(--green-600);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.lang-btn:hover {
  background: var(--green-600);
  color: var(--white);
}
</style>