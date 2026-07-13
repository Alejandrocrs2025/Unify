<template>
  <div class="app-container">
    <!-- ══════════════════════════════════════════
         HEADER
    ══════════════════════════════════════════ -->
    <header>
      <h1><span>U</span>nify</h1>
      <img src="/img/logo-unify.png" alt="Unify Logo" />
      <nav class="navbar">
        <ul>
          <li @click="currentView = 'home'" :class="{ active: currentView === 'home' }">
            <i class="fas fa-home"></i> Inicio
          </li>
          <li @click="currentView = 'products'" :class="{ active: currentView === 'products' }">
            <i class="fas fa-box"></i> Productos
          </li>
          <li @click="currentView = 'orders'" :class="{ active: currentView === 'orders' }">
            <i class="fas fa-shopping-bag"></i> Mis Pedidos
          </li>
          <li @click="currentView = 'tracking'" :class="{ active: currentView === 'tracking' }">
            <i class="fas fa-map-marked-alt"></i> Seguimiento
          </li>
          <li @click="currentView = 'profile'" :class="{ active: currentView === 'profile' }">
            <i class="fas fa-user"></i> Perfil
          </li>
          <li @click="signOut" class="logout-item">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </li>
        </ul>
      </nav>
    </header>

    <main class="dashboard-container">
      <!-- ════════════════════════════════════════
           BANNER DE BIENVENIDA
      ════════════════════════════════════════ -->
      <div class="profile-header">
        <div class="profile-info">
          <h2>¡Hola, {{ userName }}! 👋</h2>
          <p>Bienvenido a Unify - Tu tienda favorita</p>
        </div>
        <div class="profile-points">
          ⭐ {{ userPoints }} puntos acumulados
        </div>
      </div>

      <!-- ════════════════════════════════════════
           VISTA: INICIO (home)
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'home'">
        <!-- Categorías -->
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category"
            class="category-btn"
            :class="{ active: selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <h3 style="margin-bottom: 1rem;">🔥 Productos destacados</h3>
        <div class="products-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="showProductDetail(product)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.title" @error="handleImageError" />
            </div>
            <div class="product-info">
              <div class="product-title">{{ product.title }}</div>
              <div class="product-price">${{ product.price.toFixed(2) }}</div>
              <div class="product-seller">{{ product.seller || 'Unify' }}</div>
              <div class="product-rating">
                <span v-for="n in 5" :key="n" :class="{ 'star-filled': n <= Math.round(product.rating || 0) }">★</span>
                <span class="rating-count">({{ product.reviews || 0 }})</span>
              </div>
              <button class="btn-add" @click.stop="addToCart(product)">
                <i class="fas fa-shopping-cart"></i> Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: PRODUCTOS (con búsqueda y filtros)
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'products'">
        <div class="catalog-search-bar">
          <div class="search-wrap">
            <i class="fas fa-search"></i>
            <input v-model="searchQuery" type="text" placeholder="Buscar productos…" />
          </div>
          <div class="catalog-filters">
            <select v-model="selectedCategory" class="sel">
              <option value="Todos">Todas las categorías</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select v-model="sortOption" class="sel">
              <option value="recent">Más recientes</option>
              <option value="price-low">Precio: menor a mayor</option>
              <option value="price-high">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
            </select>
          </div>
        </div>

        <div class="products-grid">
          <div
            v-for="product in sortedAndFilteredProducts"
            :key="product.id"
            class="product-card"
            @click="showProductDetail(product)"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.title" @error="handleImageError" />
            </div>
            <div class="product-info">
              <div class="product-title">{{ product.title }}</div>
              <div class="product-price">${{ product.price.toFixed(2) }}</div>
              <div class="product-seller">{{ product.seller || 'Unify' }}</div>
              <div class="product-rating">
                <span v-for="n in 5" :key="n" :class="{ 'star-filled': n <= Math.round(product.rating || 0) }">★</span>
                <span class="rating-count">({{ product.reviews || 0 }})</span>
              </div>
              <button class="btn-add" @click.stop="addToCart(product)">
                <i class="fas fa-shopping-cart"></i> Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: MIS PEDIDOS
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'orders'">
        <h3 style="margin-bottom: 1rem;"><i class="fas fa-box-open"></i> Mis pedidos recientes</h3>
        <div class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-item">
            <div class="order-info">
              <strong>{{ order.id }}</strong>
              <span>{{ order.date }}</span>
            </div>
            <div class="order-info">
              <span>${{ order.total.toFixed(2) }}</span>
              <span class="status-delivered" :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
              <button class="btn-outline btn-sm" @click="viewOrder(order.id)">Ver detalle</button>
              <!-- Botón para rastrear si el pedido está en proceso o enviado -->
              <button
                v-if="order.status === 'En proceso' || order.status === 'Enviado'"
                class="btn-primary btn-sm"
                @click="startTracking(order.id)"
              >
                <i class="fas fa-map-marker-alt"></i> Rastrear envío
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: SEGUIMIENTO (Tracking)
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'tracking'">
        <div class="page-header">
          <h2><i class="fas fa-map-marked-alt"></i> Seguimiento en tiempo real</h2>
          <p class="page-subtitle">
            {{ trackingOrder ? `Rastreando pedido ${trackingOrder.id}` : 'Selecciona un pedido para rastrear' }}
          </p>
        </div>

        <div v-if="!trackingOrder" class="card-panel">
          <p style="text-align:center; padding: 2rem; color: var(--text-muted);">
            <i class="fas fa-box-open" style="font-size: 3rem; display:block; margin-bottom: 1rem;"></i>
            No hay pedido en seguimiento.<br />
            Ve a <strong>Mis Pedidos</strong> y haz clic en "Rastrear envío" de un pedido activo.
          </p>
        </div>

        <div v-else class="tracking-layout">
          <!-- Columna izquierda: Información y chat -->
          <div class="tracking-chat-panel">
            <div class="tracking-order-info">
              <h4>📦 {{ trackingOrder.id }}</h4>
              <p><strong>Total:</strong> ${{ trackingOrder.total.toFixed(2) }}</p>
              <p><strong>Estado:</strong> <span :class="getStatusClass(trackingOrder.status)">{{ trackingOrder.status }}</span></p>
              <p><strong>Repartidor:</strong> {{ trackingDriver ? trackingDriver.name : 'Asignando...' }}</p>
            </div>

            <!-- Chat con el repartidor -->
            <div class="mini-chat-wrap" v-if="trackingDriver">
              <div class="mini-chat-header">
                <h4><i class="fas fa-comments"></i> Chat con {{ trackingDriver.name }}</h4>
                <span class="chat-online-dot">🟢 En línea</span>
              </div>
              <div class="chat-messages-box" ref="chatBoxMessages">
                <div
                  v-for="(msg, i) in currentChatMessages"
                  :key="i"
                  class="chat-bubble"
                  :class="msg.from === 'cliente' ? 'bubble-cliente' : 'bubble-driver'"
                >
                  <div class="bubble-text">{{ msg.text }}</div>
                  <div class="bubble-time">{{ msg.time }}</div>
                </div>
                <div class="typing-indicator" v-if="driverTyping">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div class="chat-input">
                <input
                  :value="chatInputMsg"
                  @input="chatInputMsg = $event.target.value"
                  type="text"
                  placeholder="Escribe un mensaje..."
                  @keyup.enter="sendChatMessage"
                />
                <button class="btn btn-primary" @click="sendChatMessage" :disabled="!chatInputMsg.trim()">
                  <i class="fas fa-paper-plane"></i> Enviar
                </button>
              </div>
            </div>
            <div v-else class="card-panel" style="margin-top: 1rem;">
              <p style="text-align:center; color: var(--text-muted);">Esperando asignación de repartidor...</p>
            </div>
          </div>

          <!-- Columna derecha: Mapa -->
          <div class="tracking-map-panel">
            <div class="card-panel">
              <div class="panel-header">
                <h3><i class="fas fa-map"></i> Ubicación en tiempo real</h3>
                <span class="panel-badge">Actualizado hace {{ mapUpdateSeconds }}s</span>
              </div>
              <div class="map-container">
                <svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" class="map-svg-large">
                  <rect width="600" height="300" fill="#e8f4f0" rx="12"/>
                  <!-- Calles -->
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#c5ddd8" stroke-width="10"/>
                  <line x1="300" y1="0" x2="300" y2="300" stroke="#c5ddd8" stroke-width="10"/>
                  <line x1="0" y1="75" x2="600" y2="75" stroke="#d3e8e4" stroke-width="6"/>
                  <line x1="0" y1="225" x2="600" y2="225" stroke="#d3e8e4" stroke-width="6"/>
                  <!-- Ruta activa (simulada) -->
                  <polyline points="80,250 200,190 300,170 420,130 530,110"
                    fill="none" stroke="#00b0a8" stroke-width="4" stroke-dasharray="8,4" opacity="0.8"/>
                  <!-- Destino (pedido) -->
                  <circle cx="530" cy="110" r="12" fill="#005e59" opacity="0.9"/>
                  <text x="530" y="115" text-anchor="middle" fill="white" font-size="10">📦</text>
                  <!-- Repartidor (ubicación simulada) -->
                  <g :transform="`translate(${driverPosition.x}, ${driverPosition.y})`">
                    <circle r="16" fill="#00b0a8" opacity="0.95"/>
                    <text y="5" text-anchor="middle" font-size="12">🚚</text>
                  </g>
                  <!-- Almacén -->
                  <rect x="60" y="230" width="40" height="30" fill="#005e59" rx="4" opacity="0.85"/>
                  <text x="80" y="249" text-anchor="middle" fill="white" font-size="10">🏭</text>
                  <!-- Leyenda -->
                  <text x="300" y="285" text-anchor="middle" fill="#5a8a86" font-size="11" font-family="Segoe UI">Mapa de seguimiento — Unify</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: PERFIL
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'profile'">
        <div class="profile-card">
          <div class="profile-avatar">{{ userInitials }}</div>
          <h3>{{ userName }}</h3>
          <p class="profile-email">{{ userEmail }}</p>
          <p class="profile-role">Rol: {{ userRole }}</p>
          <p class="profile-points-display">⭐ {{ userPoints }} puntos acumulados</p>
          <button class="btn-primary" @click="signOut" style="margin-top: 1rem;">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           CARRITO DE COMPRAS (visible siempre)
      ════════════════════════════════════════ -->
      <div class="cart-panel">
        <h3><i class="fas fa-shopping-cart"></i> Mi carrito ({{ cart.length }} productos)</h3>
        <div class="cart-items" v-if="cart.length > 0">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <img :src="item.image" alt="" class="cart-item-image" />
              <span>{{ item.title }}</span>
            </div>
            <div class="cart-item-actions">
              <span>${{ item.price.toFixed(2) }}</span>
              <button class="btn-outline" @click="removeFromCart(index)">Eliminar</button>
            </div>
          </div>
        </div>
        <div class="cart-empty" v-else>
          <i class="fas fa-shopping-cart"></i>
          <p>Tu carrito está vacío</p>
        </div>
        <div class="cart-total" v-if="cart.length > 0">
          Total: ${{ cartTotal.toFixed(2) }}
        </div>
        <button class="btn-primary" style="margin-top: 1rem; width: 100%;" @click="openCheckoutModal" :disabled="cart.length === 0">
          Proceder al pago →
        </button>
      </div>

      <!-- ════════════════════════════════════════
           MODAL: DETALLE DE PRODUCTO
      ════════════════════════════════════════ -->
      <div class="modal-overlay" v-if="selectedProduct" @click.self="closeProductDetail">
        <div class="modal-content product-detail-modal">
          <button class="modal-close" @click="closeProductDetail">&times;</button>
          <div class="detail-layout">
            <div class="detail-image">
              <img :src="selectedProduct.image" :alt="selectedProduct.title" @error="handleImageError" />
            </div>
            <div class="detail-info">
              <h2>{{ selectedProduct.title }}</h2>
              <p class="detail-seller">{{ selectedProduct.seller || 'Unify' }}</p>
              <div class="detail-rating">
                <span v-for="n in 5" :key="n" :class="{ 'star-filled': n <= Math.round(selectedProduct.rating || 0) }">★</span>
                <span class="rating-count">({{ selectedProduct.reviews || 0 }} reseñas)</span>
              </div>
              <div class="detail-price">${{ selectedProduct.price.toFixed(2) }}</div>
              <p class="detail-description">{{ selectedProduct.description || 'Descripción no disponible.' }}</p>
              <p class="detail-stock" v-if="selectedProduct.stock !== undefined">
                <span :class="selectedProduct.stock > 0 ? 'in-stock' : 'out-of-stock'">
                  {{ selectedProduct.stock > 0 ? '✅ En stock (' + selectedProduct.stock + ' unidades)' : '❌ Agotado' }}
                </span>
              </p>
              <button class="btn-add" @click="addToCart(selectedProduct); closeProductDetail()">
                <i class="fas fa-shopping-cart"></i> Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           MODAL: PAGO
      ════════════════════════════════════════ -->
      <div class="modal-overlay" v-if="showCheckoutModal" @click.self="closeCheckoutModal">
        <div class="modal-content checkout-modal">
          <button class="modal-close" @click="closeCheckoutModal">&times;</button>
          <h2>💳 Procesar pago</h2>
          <p class="checkout-total">Total a pagar: <strong>${{ cartTotal.toFixed(2) }}</strong></p>
          <div class="payment-methods">
            <div class="payment-method" @click="selectPaymentMethod('card')" :class="{ active: selectedPayment === 'card' }">
              <i class="fas fa-credit-card"></i> Tarjeta de crédito/débito
            </div>
            <div class="payment-method" @click="selectPaymentMethod('paypal')" :class="{ active: selectedPayment === 'paypal' }">
              <i class="fab fa-paypal"></i> PayPal
            </div>
            <div class="payment-method" @click="selectPaymentMethod('transfer')" :class="{ active: selectedPayment === 'transfer' }">
              <i class="fas fa-university"></i> Transferencia bancaria
            </div>
          </div>
          <div class="payment-form" v-if="selectedPayment === 'card'">
            <input type="text" placeholder="Número de tarjeta" class="form-input" />
            <div style="display: flex; gap: 1rem;">
              <input type="text" placeholder="MM/AA" class="form-input" />
              <input type="text" placeholder="CVV" class="form-input" />
            </div>
          </div>
          <div class="payment-form" v-if="selectedPayment === 'paypal'">
            <p>Serás redirigido a PayPal para completar el pago.</p>
          </div>
          <div class="payment-form" v-if="selectedPayment === 'transfer'">
            <p>Realiza la transferencia a la cuenta: <strong>Unify Bank - ES91 2100 0418 4502 0005 1332</strong></p>
            <p>Referencia: <strong>#{{ generateOrderRef() }}</strong></p>
          </div>
          <button class="btn-primary" style="width: 100%; margin-top: 1rem;" @click="confirmPayment" :disabled="!selectedPayment">
            Confirmar pago
          </button>
        </div>
      </div>

    </main>

    <footer>
      © 2026 Unify - Tu tienda en línea | Envíos gratis en compras mayores a $50
    </footer>
  </div>
</template>

<script>
import { insforge } from '../insforgeClient.js'

export default {
  name: 'ClienteDashboard',
  emits: ['switch-view'],
  data() {
    return {
      // ─── Usuario ──────────────────────────────
      userName: 'Cliente',
      userEmail: 'cliente@email.com',
      userRole: 'Cliente',
      userPoints: 1280,

      // ─── Vistas ──────────────────────────────
      currentView: 'home', // home | products | orders | tracking | profile

      // ─── Productos y filtros ────────────────
      products: [],
      selectedCategory: 'Todos',
      categories: ['Todos', 'Electrónica', 'Hogar', 'Moda', 'Ofertas', 'Alimentos', 'Salud & Belleza', 'Deportes', 'Juguetes', 'Herramientas'],
      searchQuery: '',
      sortOption: 'recent',

      // ─── Carrito ─────────────────────────────
      cart: [],

      // ─── Pedidos (con repartidores) ──────────
      orders: [
        {
          id: '#UNI-4521',
          date: '15 Dic 2025',
          total: 45.0,
          status: 'Entregado',
          driverId: null,
          driverName: null
        },
        {
          id: '#UNI-4518',
          date: '10 Dic 2025',
          total: 128.0,
          status: 'Entregado',
          driverId: null,
          driverName: null
        },
        {
          id: '#UNI-4512',
          date: '5 Dic 2025',
          total: 67.5,
          status: 'Entregado',
          driverId: null,
          driverName: null
        }
      ],

      // ─── Datos de repartidores (simulados) ──
      drivers: [
        { id: 1, name: 'Carlos Martínez', initials: 'CM', zone: 'Zona Sur' },
        { id: 2, name: 'Ana Rodríguez', initials: 'AR', zone: 'Zona Norte' },
        { id: 3, name: 'Luis Pérez', initials: 'LP', zone: 'Zona Este' },
        { id: 4, name: 'María González', initials: 'MG', zone: 'Zona Oeste' }
      ],

      // ─── Modal detalle producto ──────────────
      selectedProduct: null,

      // ─── Modal pago ──────────────────────────
      showCheckoutModal: false,
      selectedPayment: null,

      // ─── Seguimiento (tracking) ──────────────
      trackingOrderId: null,
      chatInputMsg: '',
      driverTyping: false,
      chatMessages: {}, // key: orderId, value: array de mensajes
      mapUpdateSeconds: 0,
      driverPosition: { x: 200, y: 170 },
      moveInterval: null,
    }
  },

  computed: {
    userInitials() {
      return this.userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    },
    filteredProducts() {
      if (this.selectedCategory === 'Todos') return this.products
      return this.products.filter(p => p.category === this.selectedCategory)
    },
    sortedAndFilteredProducts() {
      let result = [...this.products]
      if (this.selectedCategory !== 'Todos') {
        result = result.filter(p => p.category === this.selectedCategory)
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase()
        result = result.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.seller && p.seller.toLowerCase().includes(q))
        )
      }
      if (this.sortOption === 'price-low') {
        result.sort((a, b) => a.price - b.price)
      } else if (this.sortOption === 'price-high') {
        result.sort((a, b) => b.price - a.price)
      } else if (this.sortOption === 'rating') {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      }
      return result
    },
    cartTotal() {
      return this.cart.reduce((total, item) => total + item.price, 0)
    },
    trackingOrder() {
      if (!this.trackingOrderId) return null
      return this.orders.find(o => o.id === this.trackingOrderId) || null
    },
    trackingDriver() {
      if (!this.trackingOrder) return null
      if (this.trackingOrder.driverId) {
        return this.drivers.find(d => d.id === this.trackingOrder.driverId) || null
      }
      if (this.trackingOrder.driverName) {
        return this.drivers.find(d => d.name === this.trackingOrder.driverName) || null
      }
      return null
    },
    currentChatMessages() {
      if (!this.trackingOrderId) return []
      return this.chatMessages[this.trackingOrderId] || []
    }
  },

  mounted() {
    this.loadUserProfile()
    this.loadProducts()
    // Movimiento del repartidor cada 2 segundos
    this.moveInterval = setInterval(() => {
      this.simulateDriverMovement()
    }, 2000)
    // Actualizar contador del mapa cada segundo
    setInterval(() => {
      this.mapUpdateSeconds = (this.mapUpdateSeconds % 60) + 1
    }, 1000)
    // Inicializar chats para pedidos con conductor
    this.initChatsForOrders()
  },

  beforeUnmount() {
    if (this.moveInterval) clearInterval(this.moveInterval)
  },

  methods: {
    // ─── Perfil ────────────────────────────────
    async loadUserProfile() {
      try {
        const { data, error } = await insforge.auth.getUser()
        if (error) {
          console.warn('No se pudo obtener el usuario actual', error)
          return
        }
        const user = data?.user
        if (!user) return

        this.userName = user.user_metadata?.full_name || user.name || user.email || 'Cliente'
        this.userEmail = user.email || 'cliente@email.com'

        const profileRes = await insforge.from('profiles').select('role,user_type').eq('id', user.id).single()
        const profileRole = profileRes?.data?.role || profileRes?.data?.user_type
        if (!profileRes?.error && profileRole) {
          this.userRole = profileRole
        }
      } catch (err) {
        console.warn('Error cargando perfil de cliente:', err)
      }
    },

    // ─── Productos (InsForge) ──────────────────
    async loadProducts() {
      try {
        const { data, error } = await insforge
          .from('products')
          .select('*')
          .eq('status', 'Activo')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('No se pudieron cargar los productos:', error)
          return
        }

        this.products = (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          category: p.category,
          seller: p.seller_name || 'Unify',
          rating: p.rating,
          reviews: p.reviews,
          image: p.image,
          description: p.description,
          stock: p.stock,
        }))
      } catch (err) {
        console.warn('Error inesperado cargando productos:', err)
      }
    },

    // ─── Carrito ────────────────────────────────
    addToCart(product) {
      this.cart.push({ ...product })
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },

    // ─── Modal detalle producto ────────────────
    showProductDetail(product) {
      this.selectedProduct = product
    },
    closeProductDetail() {
      this.selectedProduct = null
    },

    // ─── Modal pago ─────────────────────────────
    openCheckoutModal() {
      if (this.cart.length === 0) return
      this.showCheckoutModal = true
      this.selectedPayment = null
    },
    closeCheckoutModal() {
      this.showCheckoutModal = false
      this.selectedPayment = null
    },
    selectPaymentMethod(method) {
      this.selectedPayment = method
    },
    generateOrderRef() {
      return 'UNI-' + Date.now().toString().slice(-6)
    },
    confirmPayment() {
      if (!this.selectedPayment) return
      alert(`🎉 ¡Pago exitoso! Has pagado $${this.cartTotal.toFixed(2)} con ${this.selectedPayment}.`)
      // Crear nuevo pedido
      const newOrder = {
        id: this.generateOrderRef(),
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        total: this.cartTotal,
        status: 'En proceso',
        driverId: null,
        driverName: null
      }
      const randomDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)]
      newOrder.driverId = randomDriver.id
      newOrder.driverName = randomDriver.name

      this.orders.unshift(newOrder)
      this.initChatForOrder(newOrder.id, randomDriver.name)

      this.cart = []
      this.closeCheckoutModal()
    },

    // ─── Pedidos ─────────────────────────────────
    viewOrder(orderId) {
      alert(`📦 Mostrando detalles del pedido ${orderId}`)
    },
    getStatusClass(status) {
      const map = {
        'Entregado': 'status-delivered',
        'En proceso': 'status-processing',
        'Enviado': 'status-shipped',
        'Cancelado': 'status-canceled'
      }
      return map[status] || ''
    },

    // ─── Seguimiento (Tracking) ──────────────────
    startTracking(orderId) {
      console.log('Iniciando tracking para', orderId)
      this.trackingOrderId = orderId
      this.currentView = 'tracking'

      const order = this.orders.find(o => o.id === orderId)
      if (!order) {
        console.warn('Pedido no encontrado')
        return
      }

      // Si no tiene conductor, asignar uno aleatorio
      if (!order.driverName) {
        const randomDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)]
        order.driverId = randomDriver.id
        order.driverName = randomDriver.name
      }

      // Inicializar chat si no existe
      if (!this.chatMessages[orderId]) {
        this.initChatForOrder(orderId, order.driverName)
      }

      // Resetear posición del driver
      this.driverPosition = { x: 200, y: 170 }
    },

    initChatsForOrders() {
      this.orders.forEach(order => {
        if (order.driverName && !this.chatMessages[order.id]) {
          this.initChatForOrder(order.id, order.driverName)
        }
      })
    },

    initChatForOrder(orderId, driverName) {
      if (!this.chatMessages[orderId]) {
        this.chatMessages = {
          ...this.chatMessages,
          [orderId]: [
            { from: 'driver', text: `Hola, soy ${driverName}, tu repartidor. Pronto entregaré tu pedido.`, time: '10:00' },
            { from: 'cliente', text: '¡Gracias! Estaré atento.', time: '10:02' }
          ]
        }
      }
    },

    sendChatMessage() {
      console.log('sendChatMessage llamado', {
        msg: this.chatInputMsg,
        trackingOrderId: this.trackingOrderId,
        chatMessages: this.chatMessages
      })

      const msg = this.chatInputMsg.trim()
      if (!msg) {
        console.warn('Mensaje vacío')
        return
      }
      if (!this.trackingOrderId) {
        console.warn('trackingOrderId es nulo')
        alert('No hay pedido en seguimiento. Por favor, selecciona un pedido.')
        return
      }

      const orderId = this.trackingOrderId
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      // Asegurar que el array de mensajes existe
      if (!this.chatMessages[orderId]) {
        this.chatMessages = { ...this.chatMessages, [orderId]: [] }
      }

      // Agregar mensaje del cliente
      const newMessage = { from: 'cliente', text: msg, time: now }
      const currentMessages = this.chatMessages[orderId]
      this.chatMessages = { ...this.chatMessages, [orderId]: [...currentMessages, newMessage] }

      // Limpiar input
      this.chatInputMsg = ''
      this.scrollChatToBottom()

      // Simular respuesta del driver
      this.driverTyping = true
      setTimeout(() => {
        this.driverTyping = false
        const replies = [
          'Recibido, estoy en camino 🚚',
          'Llego en aproximadamente 15 minutos.',
          'Ok, cualquier novedad te aviso.',
          'Confirmado, tu pedido está en ruta.'
        ]
        const reply = replies[Math.floor(Math.random() * replies.length)]
        const driverName = this.trackingDriver ? this.trackingDriver.name : 'Repartidor'
        const driverReply = { from: 'driver', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        const updatedMessages = [...this.chatMessages[orderId], driverReply]
        this.chatMessages = { ...this.chatMessages, [orderId]: updatedMessages }
        this.scrollChatToBottom()
      }, 1500)
    },

    scrollChatToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.chatBoxMessages
        if (box) box.scrollTop = box.scrollHeight
      })
    },

    simulateDriverMovement() {
      const currentX = this.driverPosition.x
      const currentY = this.driverPosition.y
      const deltaX = (Math.random() - 0.5) * 40
      const deltaY = (Math.random() - 0.5) * 40
      let newX = Math.min(560, Math.max(40, currentX + deltaX))
      let newY = Math.min(260, Math.max(40, currentY + deltaY))
      this.driverPosition = { x: newX, y: newY }
    },

    // ─── Imágenes ──────────────────────────────
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/400x300/005e59/ffffff?text=Producto'
    },

    // ─── Cerrar sesión ─────────────────────────
    async signOut() {
      try {
        await insforge.auth.signOut()
      } catch (err) {
        console.warn('Error cerrando sesión:', err)
      }
      try { localStorage.removeItem('userRole') } catch (e) {}
      try { localStorage.removeItem('userRoleFor') } catch (e) {}
      try { localStorage.removeItem('pendingUserId') } catch (e) {}
      window.location.reload()
    },
  },
}
</script>

<style>
/* ══════════════════════════════════════════
   VARIABLES (Manteniendo paleta original)
══════════════════════════════════════════ */
:root {
  --white: #ffffff;
  --off-white: #f4faf9;
  --bg-light: #edf7f5;
  --green-50: #e6f4f2;
  --green-400: #00b0a8;
  --green-600: #005e59;
  --sky-100: #cce8f0;
  --sky-400: #3A7DBF;
  --sky-600: #0B3C6D;
  --text-dark: #0d1f1e;
  --text-muted: #5a8a86;
  --border: rgba(0, 94, 89, 0.12);
  --shadow-sm: 0 2px 12px rgba(0, 94, 89, 0.08);
  --shadow-md: 0 8px 32px rgba(0, 94, 89, 0.12);
  --radius-md: 14px;
  --radius-lg: 22px;
}

/* ── Base ────────────────────────────────────── */
* { box-sizing: border-box; }
.app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--off-white);
  min-height: 100vh;
}

/* ── Header ──────────────────────────────────── */
header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  padding: 1rem 5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
header h1 {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #005e59 0%, #00ab91 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-left: 40px;
}
header h1 span {
  background: linear-gradient(135deg, #0B3C6D 0%, #3A7DBF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
header img {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  position: absolute;
}
.navbar ul {
  display: flex;
  gap: 0.5rem;
  list-style: none;
}
.navbar li {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}
.navbar li:hover {
  background: var(--green-50);
  color: var(--green-600);
}
.navbar li.active {
  background: var(--green-600);
  color: white;
}
.navbar li.logout-item:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ── Contenedor principal ────────────────────── */
.dashboard-container {
  padding: 2rem 5vw;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Page header ────────────────────────────── */
.page-header {
  margin-bottom: 2rem;
}
.page-header h2 {
  font-size: 1.6rem;
  color: var(--text-dark);
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
}

/* ── Perfil cabecera ─────────────────────────── */
.profile-header {
  background: linear-gradient(135deg, var(--green-600), var(--sky-600));
  border-radius: var(--radius-lg);
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}
.profile-info h2 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}
.profile-points {
  background: rgba(255,255,255,0.2);
  padding: 0.5rem 1rem;
  border-radius: 40px;
}

/* ── Categorías ──────────────────────────────── */
.categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.category-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 40px;
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.category-btn:hover {
  background: var(--green-50);
}
.category-btn.active {
  background: var(--green-400);
  color: white;
  border-color: var(--green-400);
}

/* ── Búsqueda (similar a Empresa) ────────────── */
.catalog-search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  flex: 1;
  min-width: 200px;
}
.search-wrap i {
  color: var(--text-muted);
}
.search-wrap input {
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  flex: 1;
  background: transparent;
}
.catalog-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.sel {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.8rem;
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--text-mid);
  background: white;
  cursor: pointer;
}

/* ── Productos ────────────────────────────────── */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.product-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}
.product-image {
  height: 180px;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-info {
  padding: 1rem;
}
.product-title {
  font-weight: 600;
  margin-bottom: 0.3rem;
  font-size: 1rem;
}
.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--green-600);
  margin: 0.3rem 0;
}
.product-seller {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
}
.product-rating {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.8rem;
}
.product-rating .star-filled {
  color: #f59e0b;
}
.product-rating .rating-count {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-left: 0.3rem;
}
.btn-add {
  width: 100%;
  background: var(--green-400);
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-add:hover {
  background: var(--green-600);
  transform: scale(1.02);
}

/* ── Carrito ──────────────────────────────────── */
.cart-panel {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border);
  margin-bottom: 2rem;
}
.cart-items {
  max-height: 250px;
  overflow-y: auto;
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  gap: 1rem;
}
.cart-item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.cart-item-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
}
.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.cart-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
.cart-empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.cart-total {
  text-align: right;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid var(--border);
  font-size: 1.2rem;
  font-weight: 700;
}
.btn-primary {
  background: var(--green-600);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) {
  background: var(--green-400);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}
.btn-outline:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}
.btn-sm {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
}

/* ── Historial de pedidos ────────────────────── */
.orders-list {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}
.order-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.order-item:last-child {
  border-bottom: none;
}
.order-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.status-delivered {
  background: var(--green-50);
  color: var(--green-600);
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 600;
}
.status-processing {
  background: #fef3c7;
  color: #d97706;
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 600;
}
.status-shipped {
  background: var(--sky-100);
  color: var(--sky-600);
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 600;
}
.status-canceled {
  background: #fee2e2;
  color: #ef4444;
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* ── Perfil (vista) ───────────────────────────── */
.profile-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--border);
  max-width: 400px;
  margin: 0 auto;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green-600), var(--sky-600));
  color: white;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}
.profile-email {
  color: var(--text-muted);
  margin: 0.5rem 0;
}
.profile-points-display {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--green-600);
}

/* ── Modales ──────────────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;
}
.modal-close:hover {
  color: var(--text-dark);
}
.product-detail-modal .detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 0.5rem;
}
.detail-image img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  object-fit: cover;
}
.detail-info h2 {
  margin-top: 0;
}
.detail-seller {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.detail-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0.5rem 0;
}
.detail-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--green-600);
  margin: 0.5rem 0;
}
.detail-description {
  color: var(--text-mid);
  line-height: 1.6;
}
.detail-stock {
  margin: 0.5rem 0;
}
.in-stock { color: var(--green-600); }
.out-of-stock { color: #ef4444; }

/* ── Modal de pago ───────────────────────────── */
.checkout-modal h2 {
  margin-top: 0;
}
.checkout-total {
  font-size: 1.2rem;
  margin: 1rem 0;
}
.payment-methods {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}
.payment-method {
  flex: 1;
  min-width: 120px;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.payment-method:hover {
  border-color: var(--green-400);
}
.payment-method.active {
  border-color: var(--green-600);
  background: var(--green-50);
}
.payment-method i {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.3rem;
}
.payment-form {
  margin: 1rem 0;
}
.payment-form .form-input {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.9rem;
  font-family: inherit;
  font-size: 0.9rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

/* ── Seguimiento (Tracking) ───────────────────── */
.tracking-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
.tracking-chat-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.tracking-order-info {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.2rem;
  border: 1px solid var(--border);
}
.tracking-order-info h4 {
  margin-top: 0;
  color: var(--text-dark);
}
.tracking-map-panel .card-panel {
  height: 100%;
}

/* ── Mini chat (estilo similar al de Empresa) ── */
.mini-chat-wrap {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.mini-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background: linear-gradient(135deg, var(--sky-600), var(--green-600));
  color: white;
}
.mini-chat-header h4 {
  margin: 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.chat-online-dot {
  font-size: 0.75rem;
  opacity: 0.85;
}
.chat-messages-box {
  flex: 1;
  padding: 1rem;
  max-height: 250px;
  overflow-y: auto;
  background: #fafffe;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.chat-bubble {
  max-width: 80%;
  padding: 0.6rem 1rem;
  border-radius: 16px;
  font-size: 0.85rem;
  line-height: 1.4;
  word-wrap: break-word;
}
.bubble-cliente {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  border-bottom-right-radius: 4px;
}
.bubble-driver {
  align-self: flex-start;
  background: white;
  border: 1px solid var(--border);
  color: var(--text-dark);
  border-bottom-left-radius: 4px;
}
.bubble-time {
  font-size: 0.6rem;
  color: var(--text-muted);
  margin-top: 4px;
  text-align: right;
}
.bubble-cliente .bubble-time {
  color: rgba(255,255,255,0.7);
}
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.5rem 0.8rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 16px;
  align-self: flex-start;
}
.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--green-400);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}
.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-top: 1px solid var(--border);
  background: white;
}
.chat-input input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 40px;
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input input:focus {
  border-color: var(--green-400);
}
.chat-input .btn {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}

/* ── Mapa ────────────────────────────────────── */
.map-container {
  background: var(--bg-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.map-svg-large {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Footer ──────────────────────────────────── */
footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 2rem 5vw;
  text-align: center;
  color: var(--text-muted);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 1024px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
  .product-detail-modal .detail-layout { grid-template-columns: 1fr; }
  .tracking-layout { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .products-grid { grid-template-columns: 1fr; }
  .profile-header { flex-direction: column; text-align: center; gap: 1rem; }
  header { flex-wrap: wrap; gap: 0.5rem; }
  .navbar ul { gap: 0.25rem; }
  .navbar li { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
  .order-item { flex-direction: column; align-items: stretch; gap: 0.5rem; }
  .order-info { justify-content: center; }
  .catalog-search-bar { flex-direction: column; }
  .catalog-filters { width: 100%; }
  .catalog-filters .sel { flex: 1; }
  .tracking-layout { grid-template-columns: 1fr; }
}
</style>