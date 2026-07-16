<template>
  <div class="ubot-root">
    <!-- ══════════════════════════════════════════
         BURBUJA FLOTANTE
    ══════════════════════════════════════════ -->
    <button
      class="ubot-fab"
      :class="{ 'ubot-fab-open': isOpen }"
      @click="toggleChat"
      :aria-label="isOpen ? 'Cerrar asistente' : 'Abrir asistente Unify'"
    >
      <i v-if="!isOpen" class="fas fa-comment-dots"></i>
      <i v-else class="fas fa-times"></i>
      <span v-if="hasUnread && !isOpen" class="ubot-fab-dot"></span>
    </button>

    <!-- ══════════════════════════════════════════
         PANEL DE CHAT
    ══════════════════════════════════════════ -->
    <transition name="ubot-fade">
      <div v-if="isOpen" class="ubot-panel">
        <div class="ubot-header">
          <div class="ubot-header-info">
            <div class="ubot-avatar"></div>
            <div>
              <h4>{{ contextConfig.title }}</h4>
              <span class="ubot-status"><span class="ubot-dot"></span> En línea</span>
            </div>
          </div>
          <button class="ubot-close" @click="toggleChat" aria-label="Cerrar">
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>

        <div class="ubot-messages" ref="messagesBox">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="ubot-bubble-row"
            :class="msg.role === 'user' ? 'ubot-row-user' : 'ubot-row-bot'"
          >
            <div class="ubot-bubble" :class="msg.role === 'user' ? 'ubot-bubble-user' : 'ubot-bubble-bot'">
              <div class="ubot-bubble-text" v-html="formatText(msg.content)"></div>
            </div>
          </div>

          <div v-if="loading" class="ubot-bubble-row ubot-row-bot">
            <div class="ubot-bubble ubot-bubble-bot ubot-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas: solo se muestran si aún no hay mucha conversación -->
        <div v-if="messages.length <= 1 && !loading" class="ubot-quick-actions">
          <button
            v-for="(action, i) in contextConfig.quickActions"
            :key="i"
            class="ubot-quick-btn"
            @click="sendMessage(action)"
          >
            {{ action }}
          </button>
        </div>

        <div class="ubot-input-row">
          <input
            v-model="input"
            type="text"
            :placeholder="contextConfig.placeholder"
            @keyup.enter="sendMessage()"
            :disabled="loading"
          />
          <button class="ubot-send-btn" @click="sendMessage()" :disabled="loading || !input.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { insforge } from '../insforgeClient.js'

export default {
  name: 'ChatbotWidget',

  props: {
    // 'cliente' | 'empresa' — cambia el tono, el saludo y el conocimiento del bot
    context: {
      type: String,
      required: true,
      validator: (v) => ['cliente', 'empresa'].includes(v),
    },
    // Nombre del usuario/empresa actual, para personalizar el saludo
    userName: {
      type: String,
      default: '',
    },
    // Datos opcionales extra que quieras que el bot "conozca" sin tocar tu lógica
    // Ej: { currentView: 'orders', cartItemCount: 3, pendingOrders: 2 }
    contextData: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['quick-action'],

  data() {
    return {
      isOpen: false,
      hasUnread: false,
      input: '',
      loading: false,
      messages: [], // { role: 'user' | 'assistant', content: string }
    }
  },

  computed: {
    contextConfig() {
      const configs = {
        cliente: {
          title: 'Asistente Unify',
          placeholder: 'Escribe tu consulta...',
          greeting: `¡Hola${this.userName ? ' ' + this.userName : ''}! 👋 Soy el asistente de Unify. Puedo ayudarte con tus pedidos, seguimiento de envíos, puntos, pagos o cualquier duda sobre la tienda. ¿En qué te ayudo?`,
          quickActions: [
            '¿Dónde está mi pedido?',
            '¿Cómo canjeo mis puntos?',
            '¿Qué métodos de pago aceptan?',
            '¿Cómo cancelo una compra?',
          ],
          systemPrompt: `Eres el asistente virtual de Unify, una tienda en línea (marketplace) con seguimiento de pedidos en tiempo real y sistema de puntos de fidelidad.
Hablas con un CLIENTE de la tienda. Tu tono es cercano, claro y servicial, en español.
Puedes ayudar con: estado y seguimiento de pedidos, cómo funciona el carrito y el checkout, el sistema de puntos (cada 100 puntos = $5 de descuento), métodos de pago, cómo dejar reseñas de productos, y dudas generales de navegación en la app (secciones: Inicio, Productos, Carrito, Mis Pedidos, Seguimiento, Perfil).
Si no tienes el dato exacto de un pedido específico (porque no te lo han compartido), pide amablemente el número de pedido o sugiere revisar la sección "Mis Pedidos".
No inventes números de pedido, precios ni políticas que no te han sido confirmados. Responde de forma breve y concreta.`,
        },
        empresa: {
          title: 'Asistente Unify Empresas',
          placeholder: 'Escribe tu consulta...',
          greeting: `¡Hola${this.userName ? ' ' + this.userName : ''}! 👋 Soy el asistente para empresas de Unify. Puedo ayudarte con tu catálogo, inventario, pedidos, flota de repartidores o reportes. ¿En qué te ayudo?`,
          quickActions: [
            '¿Cómo publico un producto nuevo?',
            '¿Cómo asigno un repartidor a un pedido?',
            '¿Cómo veo mis reportes de ventas?',
            '¿Cómo respondo a un cliente?',
          ],
          systemPrompt: `Eres el asistente virtual de Unify para EMPRESAS (vendedores/socios comerciales) que usan el panel de gestión.
Tu tono es profesional, directo y orientado a la eficiencia, en español.
Puedes ayudar con: publicación y edición de productos, gestión de inventario y stock bajo, gestión de pedidos y sus estados (Pendiente, Enviado, Entregado), asignación y seguimiento de repartidores/flota, mensajería con clientes y repartidores, opciones de logística (Unify Full, Unify Flex, envío propio), y cómo interpretar reportes de ventas.
No inventes cifras de ventas, pedidos o clientes reales que no te hayan sido proporcionados; si preguntan por datos específicos que no tienes, indícales en qué sección del panel pueden consultarlos (ej. pestaña "Reportes" o "Pedidos").
Responde de forma breve, concreta y accionable.`,
        },
      }
      return configs[this.context]
    },
  },

  watch: {
    context() {
      // Si cambian de vista (cliente <-> empresa) reiniciamos la conversación
      this.resetConversation()
    },
  },

  mounted() {
    this.resetConversation()
  },

  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        this.hasUnread = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },

    resetConversation() {
      this.messages = [{ role: 'assistant', content: this.contextConfig.greeting }]
    },

    formatText(text) {
      // Escapado simple + saltos de línea, para no meter HTML arbitrario
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return escaped.replace(/\n/g, '<br>')
    },

    scrollToBottom() {
      const box = this.$refs.messagesBox
      if (box) box.scrollTop = box.scrollHeight
    },

    async sendMessage(quickText) {
      const text = (quickText || this.input).trim()
      if (!text || this.loading) return

      this.messages.push({ role: 'user', content: text })
      this.input = ''
      this.loading = true
      this.$nextTick(() => this.scrollToBottom())

      try {
        const reply = await this.callAI(this.messages)
        this.messages.push({ role: 'assistant', content: reply })
      } catch (err) {
        console.error('Error del chatbot:', err)
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, tuve un problema para responder. ¿Puedes intentar de nuevo en un momento?',
        })
      } finally {
        this.loading = false
        this.$nextTick(() => this.scrollToBottom())
        if (!this.isOpen) this.hasUnread = true
      }
    },

    // ═══════════════════════════════════════════════════════════
    // ÚNICO PUNTO DE CONEXIÓN CON LA IA.
    // Todo lo demás del componente ya está probado; esta función
    // es la única que depende de la versión exacta del SDK de InsForge
    // instalada en tu proyecto. Verifica la sintaxis exacta con:
    //   npx @insforge/cli docs ai typescript
    // (la CLI te muestra siempre el método vigente para tu versión).
    // ═══════════════════════════════════════════════════════════
    async callAI(conversation) {
      const contextInfo = Object.keys(this.contextData).length
        ? `\n\nDatos adicionales del usuario en este momento: ${JSON.stringify(this.contextData)}`
        : ''

      const chatMessages = [
        { role: 'system', content: this.contextConfig.systemPrompt + contextInfo },
        ...conversation.map((m) => ({ role: m.role, content: m.content })),
      ]

      // Opción recomendada: usar el módulo de IA integrado de InsForge.
      // El backend de InsForge gestiona la clave de OpenRouter por ti,
      // así que no expones ningún API key en el frontend.
      const { data, error } = await insforge.ai.chat({
        model: 'anthropic/claude-3.5-haiku', // ajusta al modelo habilitado en tu proyecto InsForge
        messages: chatMessages,
      })

      if (error) throw new Error(error.message || 'Error de IA')

      // Ajusta esta línea según la forma exacta de la respuesta que te
      // devuelva tu versión del SDK (puede venir en data.response,
      // data.choices[0].message.content, etc. — revísalo en consola una vez).
      return data?.response || data?.choices?.[0]?.message?.content || 'No obtuve respuesta, intenta de nuevo.'
    },
  },
}
</script>

<style scoped>
.ubot-root {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 9999;
  font-family: inherit;
}

/* ── Burbuja flotante ─────────────────────────── */
.ubot-fab {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, var(--sky-600, #0B3C6D), var(--green-600, #005e59));
  color: white;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md, 0 8px 32px rgba(0, 94, 89, 0.25));
  position: relative;
  transition: transform 0.2s ease;
}
.ubot-fab:hover {
  transform: scale(1.06);
}
.ubot-fab-open {
  background: var(--text-dark, #0d1f1e);
}
.ubot-fab-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5252;
  border: 2px solid white;
}

/* ── Panel ────────────────────────────────────── */
.ubot-panel {
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 360px;
  max-width: calc(100vw - 2rem);
  height: 520px;
  max-height: calc(100vh - 8rem);
  background: var(--white, #fff);
  border-radius: var(--radius-lg, 22px);
  box-shadow: var(--shadow-md, 0 8px 32px rgba(0, 0, 0, 0.18));
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ubot-fade-enter-active,
.ubot-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.ubot-fade-enter-from,
.ubot-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.ubot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  background: linear-gradient(135deg, var(--sky-600, #0B3C6D), var(--green-600, #005e59));
  color: white;
}
.ubot-header-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.ubot-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.ubot-header h4 {
  margin: 0;
  font-size: 0.95rem;
}
.ubot-status {
  font-size: 0.72rem;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ubot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  display: inline-block;
}
.ubot-close {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.3rem;
  opacity: 0.85;
}
.ubot-close:hover {
  opacity: 1;
}

/* ── Mensajes ─────────────────────────────────── */
.ubot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: var(--bg-light, #f7fafc);
}
.ubot-bubble-row {
  display: flex;
}
.ubot-row-user {
  justify-content: flex-end;
}
.ubot-row-bot {
  justify-content: flex-start;
}
.ubot-bubble {
  max-width: 82%;
  padding: 0.6rem 0.9rem;
  border-radius: 16px;
  font-size: 0.85rem;
  line-height: 1.45;
  word-wrap: break-word;
}
.ubot-bubble-user {
  background: linear-gradient(135deg, var(--sky-600, #0B3C6D), var(--sky-400, #3A7DBF));
  color: white;
  border-bottom-right-radius: 4px;
}
.ubot-bubble-bot {
  background: white;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  color: var(--text-dark, #0d1f1e);
  border-bottom-left-radius: 4px;
}
.ubot-typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 0.7rem 1rem;
}
.ubot-typing span {
  width: 6px;
  height: 6px;
  background: var(--green-400, #00b0a8);
  border-radius: 50%;
  animation: ubot-typing 1.4s infinite;
}
.ubot-typing span:nth-child(2) { animation-delay: 0.2s; }
.ubot-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes ubot-typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* ── Acciones rápidas ─────────────────────────── */
.ubot-quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0 1rem 0.8rem;
  background: var(--bg-light, #f7fafc);
}
.ubot-quick-btn {
  background: white;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
  color: var(--sky-600, #0B3C6D);
  border-radius: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
}
.ubot-quick-btn:hover {
  background: var(--green-50, #e6f4f2);
}

/* ── Input ────────────────────────────────────── */
.ubot-input-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.8rem;
  border-top: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  background: white;
}
.ubot-input-row input {
  flex: 1;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
  border-radius: 40px;
  padding: 0.55rem 1rem;
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}
.ubot-input-row input:focus {
  border-color: var(--green-400, #00b0a8);
}
.ubot-send-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--sky-600, #0B3C6D), var(--green-600, #005e59));
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ubot-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 480px) {
  .ubot-root { right: 1rem; bottom: 1rem; }
  .ubot-panel { width: calc(100vw - 2rem); height: 65vh; }
}
</style>