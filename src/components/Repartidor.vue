<script>
import { insforge } from '../insforgeClient.js'

export default {
  name: 'Repartidor',
  props: {
    orderId: { type: String, required: true },
  },
  data() {
    return {
      sharing: false,
      watchId: null,
      recordId: null,
      lastLat: null,
      lastLng: null,
      updatesCount: 0,
      errorMsg: '',
      accuracy: null,
    }
  },
  computed: {
    supportsGeolocation() {
      return 'geolocation' in navigator
    },
    isSecureContext() {
      // La API de Geolocalización solo funciona en HTTPS o en localhost
      return window.isSecureContext
    },
  },
  beforeUnmount() {
    this.stopSharing()
  },
  methods: {
    toggleSharing() {
      if (this.sharing) {
        this.stopSharing()
      } else {
        this.startSharing()
      }
    },
    startSharing() {
      this.errorMsg = ''

      if (!this.supportsGeolocation) {
        this.errorMsg = 'Este navegador no soporta geolocalización.'
        return
      }
      if (!this.isSecureContext) {
        this.errorMsg = 'Esta página necesita HTTPS (o localhost) para acceder al GPS. Abre el link por una URL https:// o usa un túnel como ngrok.'
        return
      }

      this.sharing = true
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.onPosition(position),
        (err) => this.onGeoError(err),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      )
    },
    stopSharing() {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId)
        this.watchId = null
      }
      this.sharing = false
    },
    onGeoError(err) {
      const messages = {
        1: 'Permiso de ubicación denegado. Actívalo en la configuración del navegador.',
        2: 'No se pudo determinar la ubicación (sin señal GPS).',
        3: 'Se agotó el tiempo esperando la ubicación. Intenta de nuevo.',
      }
      this.errorMsg = messages[err.code] || 'Error desconocido obteniendo la ubicación.'
    },
    async onPosition(position) {
      const { latitude, longitude, accuracy } = position.coords
      this.lastLat = latitude
      this.lastLng = longitude
      this.accuracy = accuracy

      try {
        if (!this.recordId) {
          // Primera actualización: crear el registro
          const { data, error } = await insforge
            .from('driver_locations')
            .insert({ order_id: this.orderId, lat: latitude, lng: longitude })
            .select()
            .single()

          if (error) {
            this.errorMsg = 'No se pudo guardar la ubicación: ' + (error.message || '')
            return
          }
          this.recordId = data?.id || null
        } else {
          // Actualizaciones siguientes: actualizar el mismo registro
          const { error } = await insforge
            .from('driver_locations')
            .update({ lat: latitude, lng: longitude })
            .eq('id', this.recordId)

          if (error) {
            this.errorMsg = 'No se pudo actualizar la ubicación: ' + (error.message || '')
            return
          }
        }
        this.updatesCount += 1
      } catch (err) {
        console.error('Error guardando ubicación:', err)
        this.errorMsg = 'Error inesperado guardando la ubicación.'
      }
    },
  },
}
</script>

<template>
  <div class="repartidor-page">
    <div class="repartidor-card">
      <div class="repartidor-icon">🚚</div>
      <h1>Compartir ubicación</h1>
      <p class="order-label">Pedido <strong>{{ orderId }}</strong></p>

      <p v-if="errorMsg" class="repartidor-error">{{ errorMsg }}</p>

      <button
        class="share-btn"
        :class="{ active: sharing }"
        @click="toggleSharing"
      >
        {{ sharing ? '⏹ Detener' : '📍 Compartir mi ubicación' }}
      </button>

      <div v-if="sharing" class="repartidor-status">
        <div class="status-dot"></div>
        <span>Transmitiendo ubicación en vivo…</span>
      </div>

      <div v-if="lastLat !== null" class="repartidor-coords">
        <p><strong>Lat:</strong> {{ lastLat.toFixed(6) }}</p>
        <p><strong>Lng:</strong> {{ lastLng.toFixed(6) }}</p>
        <p v-if="accuracy"><strong>Precisión:</strong> ±{{ Math.round(accuracy) }}m</p>
        <p><strong>Actualizaciones enviadas:</strong> {{ updatesCount }}</p>
      </div>

      <p class="repartidor-hint">
        Deja esta página abierta mientras haces la entrega. No cierres el navegador.
      </p>
    </div>
  </div>
</template>

<style scoped>
.repartidor-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 1.5rem;
}

.repartidor-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.repartidor-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

h1 {
  color: #005e59;
  font-size: 1.4rem;
  margin-bottom: 0.3rem;
}

.order-label {
  color: #718096;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.repartidor-error {
  background: #ffe8e8;
  color: #9b2c2c;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.share-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #0b3c6d 0%, #4fa9a3 100%);
  color: white;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.share-btn:active {
  transform: scale(0.97);
}

.share-btn.active {
  background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%);
}

.repartidor-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #005e59;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.4s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.repartidor-coords {
  margin-top: 1.2rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  text-align: left;
  font-size: 0.85rem;
  color: #4a5568;
}

.repartidor-coords p {
  margin: 0.2rem 0;
}

.repartidor-hint {
  margin-top: 1.2rem;
  font-size: 0.78rem;
  color: #a0aec0;
}
</style>