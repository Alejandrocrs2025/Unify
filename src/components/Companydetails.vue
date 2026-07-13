<script setup>
import { ref, onMounted } from 'vue'
import { insforge } from '../insforgeClient.js'

const emit = defineEmits(['switch-view'])

const companyName = ref('')
const taxId = ref('')
const category = ref('')
const phone = ref('')
const address = ref('')
const description = ref('')

const loading = ref(false)
const message = ref('')
const messageType = ref('')
const userId = ref(null)

const categories = [
  'Tecnología',
  'Alimentos y bebidas',
  'Moda y accesorios',
  'Hogar y decoración',
  'Salud y belleza',
  'Deportes',
  'Servicios',
  'Otro',
]

onMounted(async () => {
  try {
    const res = await insforge.auth.getCurrentUser()
    userId.value = res?.data?.user?.id || null
  } catch (e) {
    console.warn('No se pudo obtener el usuario actual', e)
  }

  if (!userId.value) {
    message.value = 'No se encontró una sesión activa. Inicia sesión de nuevo.'
    messageType.value = 'error'
  }
})

const handleSubmit = async () => {
  message.value = ''
  messageType.value = ''

  if (!companyName.value || !taxId.value || !category.value) {
    message.value = 'Completa al menos el nombre de la empresa, el RUT/NIT y el rubro.'
    messageType.value = 'error'
    return
  }

  if (!userId.value) {
    message.value = 'No hay sesión activa. Inicia sesión de nuevo antes de continuar.'
    messageType.value = 'error'
    return
  }

  loading.value = true
  try {
    const { error } = await insforge.database.from('company_profiles').upsert({
      id: userId.value,
      company_name: companyName.value.trim(),
      tax_id: taxId.value.trim(),
      category: category.value,
      phone: phone.value.trim(),
      address: address.value.trim(),
      description: description.value.trim(),
    })

    if (error) {
      message.value = error.message || 'No se pudieron guardar los datos de la empresa.'
      messageType.value = 'error'
      return
    }

    emit('switch-view', 'empresa')
  } catch (err) {
    console.error('Error guardando datos de empresa:', err)
    message.value = 'Error inesperado al guardar los datos de la empresa.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

const skipForNow = () => {
  // Permite avanzar y completar los datos después, sin bloquear al usuario.
  emit('switch-view', 'empresa')
}
</script>

<template>
  <div class="company-details-page">
    <header class="company-header">
      <div class="brand">
        <img src="/img/logo-unify.png" alt="Logo de Unify" />
        <h1><span>U</span>nify</h1>
      </div>
    </header>

    <main>
      <article class="details-card">
        <h2>Cuéntanos sobre tu empresa</h2>
        <p class="subtitle">Estos datos aparecerán en tu perfil de vendedor.</p>

        <p v-if="message" :class="['form-message', messageType]">{{ message }}</p>

        <form @submit.prevent="handleSubmit" class="details-form">
          <div class="form-group">
            <label for="company-name">Nombre de la empresa *</label>
            <input
              id="company-name"
              v-model="companyName"
              type="text"
              class="input-field"
              placeholder="Ej. TechStore SpA"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="tax-id">RUT / NIT *</label>
              <input
                id="tax-id"
                v-model="taxId"
                type="text"
                class="input-field"
                placeholder="Ej. 76.123.456-7"
                required
              />
            </div>

            <div class="form-group">
              <label for="category">Rubro *</label>
              <select id="category" v-model="category" class="input-field" required>
                <option value="" disabled>Selecciona una opción</option>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Teléfono de contacto</label>
            <input
              id="phone"
              v-model="phone"
              type="tel"
              class="input-field"
              placeholder="Ej. +56 9 1234 5678"
            />
          </div>

          <div class="form-group">
            <label for="address">Dirección</label>
            <input
              id="address"
              v-model="address"
              type="text"
              class="input-field"
              placeholder="Calle, número, ciudad"
            />
          </div>

          <div class="form-group">
            <label for="description">Descripción breve</label>
            <textarea
              id="description"
              v-model="description"
              class="input-field"
              rows="3"
              placeholder="¿A qué se dedica tu negocio?"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar y continuar' }}
            </button>
            <button type="button" class="skip-btn" @click="skipForNow">
              Completar más tarde
            </button>
          </div>
        </form>
      </article>
    </main>
  </div>
</template>

<style scoped>
.company-details-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
}

.company-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand img {
  width: 40px;
  height: 40px;
  border-radius: 25px;
}

.brand h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #005e59;
}

.brand h1 span {
  color: #0b3c6d;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.details-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 2.5rem;
  width: 100%;
  max-width: 560px;
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.details-card h2 {
  color: #005e59;
  font-size: 1.6rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.4rem;
}

.subtitle {
  text-align: center;
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.form-message {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
}

.form-message.error {
  background: #ffe8e8;
  color: #9b2c2c;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
}

.input-field {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: #005e59;
}

.form-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background: linear-gradient(135deg, #0b3c6d 0%, #4fa9a3 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.skip-btn {
  width: 100%;
  padding: 0.6rem;
  background: none;
  border: none;
  color: #718096;
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
}
</style>