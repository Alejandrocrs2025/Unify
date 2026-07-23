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

const showHowItWorks = ref(false)
const showHelp = ref(false)
</script>

<template>
  <div class="company-details-page">
    <header class="company-header">
      <div class="brand">
        <img src="/img/logo-unify.png" alt="Logo de Unify" />
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
          <li>Estos datos de tu empresa aparecerán en tu perfil de vendedor; puedes editarlos después cuando quieras.</li>
        </ul>
      </div>
    </div>

    <!-- Modal: Ayuda -->
    <div class="info-modal-overlay" v-if="showHelp" @click.self="showHelp = false">
      <div class="info-modal">
        <button class="info-modal-close" @click="showHelp = false" aria-label="Cerrar">&times;</button>
        <h3>¿Necesitas ayuda?</h3>
        <p>Si tienes problemas para completar los datos de tu empresa, escríbenos a <a href="mailto:soporte@unify.com">soporte@unify.com</a> y con gusto te ayudamos.</p>
      </div>
    </div>

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

.navbar {
  display: flex;
  align-items: center;
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
  width: 100%;
}

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
  animation: fadeInUp 0.3s ease;
}

.info-modal h3 {
  color: #005e59;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.info-modal p {
  color: #4a5568;
  line-height: 1.6;
}

.info-modal p a {
  color: #005e59;
  font-weight: 600;
}

.info-modal-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.info-modal-list li {
  color: #4a5568;
  line-height: 1.5;
  font-size: 0.95rem;
}

.info-modal-list li strong {
  color: #005e59;
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
  color: #a0aec0;
  transition: color 0.2s ease;
}

.info-modal-close:hover {
  color: #005e59;
}

@media (max-width: 768px) {
  .company-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
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