<template>
  <div class="mis-pedidos-container">
    <div class="section-header">
      <button class="back-btn" @click="emit('switch-view', 'cliente')">← Volver al panel</button>
      <span class="tag tag-green">✦ Monitoreo en vivo</span>
      <h2>Mis Pedidos</h2>
      <p>Seguimiento de tu entrega en tiempo real y contacto directo con el distribuidor.</p>
    </div>

    <div class="tracking-grid">
      <div class="map-card">
        <div class="map-header">
          <h3><span>🗺️</span> Rastreo de envío</h3>
          <div class="map-status online">
            <span class="status-dot"></span>
            <span class="status-text">En ruta</span>
          </div>
        </div>
        
        <div id="deliveryMap"></div>
        
        <div class="unit-info">
          <div class="unit-details">
            <div class="unit-icon">🚚</div>
            <div class="unit-data">
              <div class="unit-id">Unidad #UNI-4521</div>
              <div class="unit-driver">Conductor: Carlos Martínez</div>
            </div>
          </div>
        </div>
        
        <div class="order-status">
          <span>🚚 Pedido #UNI-4521 • Entregando a: Almacén Central</span>
          <span class="tracking-badge">En ruta - 85%</span>
        </div>
      </div>

      <div class="chat-card">
        <div class="chat-header">
          <h3><span>💬</span> Contacto directo</h3>
          <div class="chat-badge">
            <span class="badge-icon">🟢</span> Activo
          </div>
        </div>
        
        <div class="contact-distributor">
          <div class="distributor-item">
            <div class="distributor-info">
              <strong>Carlos (Distribuidor asignado)</strong>
              <div class="contact-details">
                <span>📞 +503 7012-3456</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="messaging-section">
          <div class="mensajes-chat" ref="chatMessagesRef">
            <div 
              v-for="(msg, i) in chatLog" 
              :key="i" 
              class="msj" 
              :class="msg.isClient ? 'msj-client' : 'msj-distributor'"
            >
              <div class="msj-header">
                <strong>{{ msg.sender }}:</strong>
              </div>
              <div class="msj-text">{{ msg.text }}</div>
            </div>
          </div>
          
          <div class="chat-input-wrapper">
            <input 
              type="text" 
              v-model="chatInput" 
              placeholder="Escribe un mensaje..." 
              @keypress.enter="sendMessage"
            />
            <button class="send-btn" @click="sendMessage">Enviar →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const emit = defineEmits(['switch-view'])

// --- ESTADO DEL CHAT ---
const chatInput = ref('')
const chatLog = ref([
  { sender: 'Tú', text: '¿A qué hora llega mi pedido?', isClient: true },
  { sender: 'Carlos', text: 'En 15 minutos estaré en su dirección.', isClient: false },
])
const chatMessagesRef = ref(null)

const sendMessage = () => {
  const msg = chatInput.value.trim()
  if (!msg) return

  chatLog.value.push({ sender: 'Tú', text: msg, isClient: true })
  chatInput.value = ''
  scrollToBottom()

  // Simular respuesta del distribuidor
  setTimeout(() => {
    chatLog.value.push({ sender: 'Carlos', text: 'Recibido, en breve confirmo la entrega ✅', isClient: false })
    scrollToBottom()
  }, 1000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

// --- CONFIGURACIÓN DEL MAPA ---
let map = null

const initMap = () => {
  // Asegurarnos de que el objeto L global (Leaflet) exista
  if (typeof window.L === 'undefined') {
    console.warn('Leaflet no está cargado. Añade el script CDN a tu index.html o instálalo por npm.')
    return
  }
  
  const L = window.L

  // Inicializar el mapa
  map = L.map('deliveryMap').setView([13.6929, -89.2182], 13)

  // Capa de tiles (mapa base)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Marcador del vehículo
  const marker = L.marker([13.7029, -89.2282]).addTo(map)
  marker.bindPopup('<b>Unidad #UNI-4521</b><br/>En ruta').openPopup()

  // SOLUCIÓN AL ESPACIO BLANCO: 
  // Forzar una reevaluación del tamaño del mapa tras renderizar el DOM
  setTimeout(() => {
    map.invalidateSize()
  }, 250)
}

// Montaje y desmontaje del componente
onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

onBeforeUnmount(() => {
  if (map) {
    map.remove() // Evita fugas de memoria limpiando el mapa si sales de la vista
  }
})
</script>

<style scoped>
/* 1. ESTO EVITA QUE EL MAPA PIERDA SUS ESTILOS/SE VEA BLANCO */
@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

/* 2. EL MAPA DEBE TENER UN ALTO DEFINIDO */
#deliveryMap {
  height: 350px; 
  width: 100%;
  border-radius: 12px;
  background: #e9f3f0;
  z-index: 1; /* Previene superposición con dropdowns */
}

/* --- ESTILOS GENERALES Y LAYOUT --- */
.mis-pedidos-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 3rem 5vw;
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  color: #0d1f1e;
}

.section-header { text-align: center; margin-bottom: 2.5rem; }
.back-btn {
  margin-bottom: 1rem;
  background: #e6f4f2;
  color: #005e59;
  border: 1px solid #cce8f0;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  margin-left: -20rem;
}
.back-btn:hover {
  background: #dff2ee;
}
.section-header h2 { font-size: 2.2rem; font-weight: 700; margin: 0.5rem 0; }
.tag-green { background: #e6f4f2; color: #005e59; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-left: 11rem; }

.tracking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
@media (max-width: 800px) { .tracking-grid { grid-template-columns: 1fr; } }

/* --- TARJETAS --- */
.map-card, .chat-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 94, 89, 0.08);
  border: 1px solid rgba(0, 94, 89, 0.12);
  padding: 1.5rem;
}

.map-header, .chat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
h3 { font-size: 1.25rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin: 0; }

/* --- INDICADORES Y BADGES --- */
.map-status { background: #e6f4f2; color: #005e59; padding: 0.3rem 0.8rem; border-radius: 40px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 6px;}
.status-dot { width: 8px; height: 8px; background: #4caf50; border-radius: 50%; box-shadow: 0 0 5px #4caf50; }
.tracking-badge { background: #00b0a8; color: white; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;}

/* --- INFORMACIÓN --- */
.unit-info, .contact-distributor, .order-status { 
  margin-top: 1rem; background: #f4faf9; padding: 1rem; border-radius: 10px; border: 1px solid #e1efec;
}
.unit-details { display: flex; align-items: center; gap: 12px; }
.unit-icon { font-size: 2rem; }
.unit-id { font-weight: 700; font-size: 1rem; }
.unit-driver { font-size: 0.8rem; color: #5a8a86; }
.order-status { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 500;}

/* --- SISTEMA DE CHAT MEJORADO --- */
.messaging-section { margin-top: 1.5rem; }
.mensajes-chat { 
  height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; 
  padding: 1rem; background: #fdfdfd; border-radius: 10px; margin-bottom: 1rem; 
  border: 1px solid #e1efec; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
}
.msj { max-width: 80%; padding: 0.7rem 1rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.4; }
.msj-client { background: #00b0a8; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
.msj-distributor { background: #edf7f5; color: #0d1f1e; align-self: flex-start; border-bottom-left-radius: 2px; border: 1px solid #cce8f0; }

.chat-input-wrapper { display: flex; gap: 10px; }
.chat-input-wrapper input { 
  flex: 1; padding: 0.8rem 1rem; border: 1px solid #cce8f0; border-radius: 10px; 
  outline: none; font-family: inherit; transition: border-color 0.2s;
}
.chat-input-wrapper input:focus { border-color: #00b0a8; }
.send-btn { 
  background: #005e59; color: white; border: none; padding: 0 1.2rem; 
  border-radius: 10px; cursor: pointer; font-weight: 600; font-family: inherit; transition: background 0.2s;
}
.send-btn:hover { background: #00b0a8; }
</style>