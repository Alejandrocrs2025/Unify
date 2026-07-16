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
          <li @click="currentView = 'products'" :class="{ active: currentView === 'products' }" class="cart-nav-item">
            <i class="fas fa-shopping-cart"></i> Carrito
            <span v-if="cartItemCount > 0" class="cart-nav-badge">{{ cartItemCount }}</span>
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

              <div class="driver-share-link">
                <p class="share-link-label">Link para que el repartidor comparta su ubicación:</p>
                <div class="share-link-row">
                  <input type="text" readonly :value="trackingLink" @click="$event.target.select()" />
                  <button class="btn btn-outline btn-sm" @click="copyTrackingLink">
                    <i class="fas fa-copy"></i> Copiar
                  </button>
                </div>
              </div>
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
                <div ref="mapEl" class="leaflet-map-real"></div>
                <p v-if="!driverHasRealLocation" class="map-waiting-hint">
                  Esperando a que el repartidor comparta su ubicación en vivo…
                </p>
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
        <div class="cart-panel-header">
          <h3><i class="fas fa-shopping-cart"></i> Mi carrito ({{ cartItemCount }} productos)</h3>
          <button v-if="cart.length > 0" class="btn-outline btn-sm" @click="clearCart">
            <i class="fas fa-trash"></i> Vaciar carrito
          </button>
        </div>
        <div class="cart-items" v-if="cart.length > 0">
          <div v-for="item in cart" :key="item.id" class="cart-item">
            <div class="cart-item-info">
              <img :src="item.image" alt="" class="cart-item-image" />
              <div>
                <span>{{ item.title }}</span>
                <div class="cart-item-seller">{{ item.seller }}</div>
              </div>
            </div>
            <div class="cart-item-actions">
              <div class="cart-qty-control">
                <button class="qty-btn" @click="decrementQty(item)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="incrementQty(item)" :disabled="item.quantity >= item.stock">+</button>
              </div>
              <span class="cart-item-subtotal">${{ (item.price * item.quantity).toFixed(2) }}</span>
              <button class="btn-outline btn-sm" @click="removeFromCart(item)">Eliminar</button>
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
              <button class="btn-outline" style="margin-top: 0.5rem; width: 100%;" @click="openCompanyChat(selectedProduct)">
                <i class="fas fa-comment-dots"></i> Chatear con {{ selectedProduct.seller || 'la empresa' }}
              </button>

              <div class="rate-product-box">
                <p class="rate-product-title">{{ hasExistingRating ? 'Tu calificación' : 'Califica este producto' }}</p>
                <div class="rate-stars-input">
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="rate-star"
                    :class="{ 'rate-star-filled': n <= (myRatingHover || myRatingStars) }"
                    @mouseenter="myRatingHover = n"
                    @mouseleave="myRatingHover = 0"
                    @click="myRatingStars = n"
                  >★</span>
                </div>
                <textarea
                  v-model="myRatingComment"
                  class="rate-comment-input"
                  placeholder="Comentario (opcional)"
                  rows="2"
                ></textarea>
                <button class="btn btn-primary" style="width:100%;" @click="submitRating" :disabled="submittingRating">
                  {{ submittingRating ? 'Guardando...' : (hasExistingRating ? 'Actualizar calificación' : 'Enviar calificación') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           MODAL: CHAT CON LA EMPRESA
      ════════════════════════════════════════ -->
      <div class="modal-overlay" v-if="companyChat.open" @click.self="closeCompanyChat">
        <div class="modal-content company-chat-modal">
          <button class="modal-close" @click="closeCompanyChat">&times;</button>
          <div class="mini-chat-header">
            <h4><i class="fas fa-comments"></i> Chat con {{ companyChat.companyName }}</h4>
          </div>
          <div class="chat-messages-box" ref="companyChatBox">
            <p v-if="companyChat.messages.length === 0" style="text-align:center; color:#8aa5a1; padding: 1rem;">
              Aún no hay mensajes. ¡Escribe el primero!
            </p>
            <div
              v-for="msg in companyChat.messages"
              :key="msg.id"
              class="chat-bubble"
              :class="msg.sender_role === 'cliente' ? 'bubble-empresa' : 'bubble-driver'"
            >
              <div class="bubble-text">{{ msg.text }}</div>
              <div class="bubble-time">{{ new Date(msg.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }}</div>
            </div>
          </div>
          <div class="chat-input">
            <input
              v-model="companyChat.input"
              type="text"
              placeholder="Escribe un mensaje..."
              @keyup.enter="sendCompanyChatMessage"
              :disabled="companyChat.loading"
            />
            <button class="btn btn-primary" @click="sendCompanyChatMessage" :disabled="!companyChat.input.trim() || companyChat.loading">
              <i class="fas fa-paper-plane"></i> Enviar
            </button>
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

          <div class="points-redeem-box" v-if="userPoints >= 100">
            <p class="points-redeem-label">⭐ Tienes {{ userPoints }} puntos acumulados</p>
            <div class="points-redeem-row">
              <button class="pts-btn" @click="pointsToRedeem = Math.max(0, pointsToRedeem - 1)" :disabled="pointsToRedeem === 0">−</button>
              <span>{{ pointsToRedeem * 100 }} pts → ${{ pointsDiscount.toFixed(2) }} de descuento</span>
              <button class="pts-btn" @click="pointsToRedeem = Math.min(maxRedeemableBlocks, pointsToRedeem + 1)" :disabled="pointsToRedeem >= maxRedeemableBlocks">+</button>
            </div>
            <p class="checkout-total-final">Total con descuento: <strong>${{ finalCheckoutTotal.toFixed(2) }}</strong></p>
          </div>

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
    <ChatbotWidget context="cliente" :user-name="userName" :context-data="{ currentView, cartItemCount }" />
  </div>
</template>

<script>
import { insforge } from '../insforgeClient.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Chatbot 
import ChatbotWidget from './ChatbotWidget.vue'


export default {
  name: 'ClienteDashboard',
  emits: ['switch-view'],
  components: { ChatbotWidget },
  data() {
    return {
      // ─── Usuario ──────────────────────────────
      userName: 'Cliente',
      userEmail: 'cliente@email.com',
      userRole: 'Cliente',
      userPoints: 0,
      pointsToRedeem: 0, // en bloques de 100
      currentUserId: null,

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
      driverRealPosition: null, // { lat, lng } — viene de InsForge Realtime
      leafletMap: null,
      driverMarker: null,
      realtimeChannel: null,

      // ─── Chat real con la empresa (InsForge) ─
      companyChat: {
        open: false,
        companyId: null,
        companyName: '',
        messages: [],
        input: '',
        loading: false,
      },
      companyChatPollInterval: null,

      // ─── Calificación de productos (reviews reales) ─
      myRatingStars: 0,
      myRatingHover: 0,
      myRatingComment: '',
      submittingRating: false,
      hasExistingRating: false,
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
      return this.cart.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    cartItemCount() {
      return this.cart.reduce((total, item) => total + item.quantity, 0)
    },
    maxRedeemableBlocks() {
      // Cada bloque = 100 puntos = $5 de descuento. No se puede descontar más que el total del carrito.
      const byPoints = Math.floor(this.userPoints / 100)
      const byCartValue = Math.floor(this.cartTotal / 5)
      return Math.max(0, Math.min(byPoints, byCartValue))
    },
    pointsDiscount() {
      return this.pointsToRedeem * 5
    },
    finalCheckoutTotal() {
      return Math.max(0, this.cartTotal - this.pointsDiscount)
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
    },
    trackingToken() {
      // El id del pedido puede traer '#', que rompe una URL (se interpreta como fragmento)
      return this.trackingOrderId ? this.trackingOrderId.replace('#', '') : ''
    },
    trackingLink() {
      if (!this.trackingToken) return ''
      return `${window.location.origin}/repartidor/${encodeURIComponent(this.trackingToken)}`
    },
    driverHasRealLocation() {
      return !!this.driverRealPosition
    }
  },

  mounted() {
    this.loadUserProfile()
    this.loadProducts().then(() => this.loadCart())
    // Actualizar contador del mapa cada segundo (segundos desde la última ubicación real)
    setInterval(() => {
      this.mapUpdateSeconds = (this.mapUpdateSeconds % 999) + 1
    }, 1000)
    // Inicializar chats para pedidos con conductor
    this.initChatsForOrders()
    // Conectar a InsForge Realtime para recibir la ubicación del repartidor
    this.connectRealtime()
  },

  beforeUnmount() {
    this.disconnectRealtime()
    if (this.companyChatPollInterval) clearInterval(this.companyChatPollInterval)
  },

  methods: {
    // ─── Perfil ────────────────────────────────
    async loadUserProfile() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser()
        if (error) {
          console.warn('No se pudo obtener el usuario actual', error)
          return
        }
        const user = data?.user
        if (!user) return

        this.userName = user.user_metadata?.full_name || user.name || user.email || 'Cliente'
        this.userEmail = user.email || 'cliente@email.com'
        this.currentUserId = user.id || null

        if (this.currentUserId) {
          const profileRes = await insforge.database.from('profiles').select('points').eq('id', this.currentUserId).single()
          if (!profileRes?.error && typeof profileRes?.data?.points === 'number') {
            this.userPoints = profileRes.data.points
          }
        }
      } catch (err) {
        console.warn('Error cargando perfil de cliente:', err)
      }
    },

    // ─── Chat real con la empresa (InsForge) ─────
    openCompanyChat(product) {
      if (!product?.sellerId) {
        alert('No se pudo identificar a la empresa vendedora de este producto.')
        return
      }
      if (!this.currentUserId) {
        alert('Inicia sesión de nuevo para poder chatear con la empresa.')
        return
      }
      this.companyChat.companyId = product.sellerId
      this.companyChat.companyName = product.seller || 'Empresa'
      this.companyChat.messages = []
      this.companyChat.input = ''
      this.companyChat.open = true

      this.loadCompanyChatMessages()
      if (this.companyChatPollInterval) clearInterval(this.companyChatPollInterval)
      this.companyChatPollInterval = setInterval(() => {
        this.loadCompanyChatMessages()
      }, 4000)
    },

    closeCompanyChat() {
      this.companyChat.open = false
      if (this.companyChatPollInterval) {
        clearInterval(this.companyChatPollInterval)
        this.companyChatPollInterval = null
      }
    },

    async loadCompanyChatMessages() {
      if (!this.companyChat.companyId || !this.currentUserId) return
      try {
        const { data, error } = await insforge.database
          .from('messages')
          .select('*')
          .eq('client_id', this.currentUserId)
          .eq('company_id', this.companyChat.companyId)
          .order('created_at', { ascending: true })

        if (error) {
          console.warn('No se pudieron cargar los mensajes:', error)
          return
        }
        this.companyChat.messages = data || []
        this.$nextTick(() => {
          const box = this.$refs.companyChatBox
          if (box) box.scrollTop = box.scrollHeight
        })
      } catch (err) {
        console.warn('Error inesperado cargando mensajes:', err)
      }
    },

    async sendCompanyChatMessage() {
      const text = this.companyChat.input.trim()
      if (!text || !this.companyChat.companyId || !this.currentUserId) return

      this.companyChat.input = ''
      this.companyChat.loading = true
      try {
        const { error } = await insforge.database.from('messages').insert([{
          client_id: this.currentUserId,
          client_name: this.userName,
          company_id: this.companyChat.companyId,
          company_name: this.companyChat.companyName,
          sender_id: this.currentUserId,
          sender_role: 'cliente',
          text,
        }])
        if (error) {
          alert('No se pudo enviar el mensaje: ' + (error.message || 'error desconocido'))
          return
        }
        await this.loadCompanyChatMessages()
      } catch (err) {
        console.warn('Error inesperado enviando mensaje:', err)
        alert('Error inesperado enviando el mensaje.')
      } finally {
        this.companyChat.loading = false
      }
    },

    // ─── Productos (InsForge) ──────────────────
    async loadProducts() {
      try {
        const { data, error } = await insforge.database
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
          sellerId: p.seller_id || null,
          rating: 0,
          reviews: 0,
          image: p.image,
          description: p.description,
          stock: p.stock,
        }))

        this.loadRealRatingsForProducts()
      } catch (err) {
        console.warn('Error inesperado cargando productos:', err)
      }
    },

    // Calcula rating/cantidad de reseñas reales desde la tabla `reviews`
    // (no hay trigger en la base de datos que mantenga products.rating actualizado).
    async loadRealRatingsForProducts() {
      if (this.products.length === 0) return

      try {
        const { data, error } = await insforge.database
          .from('reviews')
          .select('product_id,rating')

        if (error || !data) return

        const byProduct = {}
        data.forEach((r) => {
          if (!byProduct[r.product_id]) byProduct[r.product_id] = []
          byProduct[r.product_id].push(r.rating)
        })

        this.products.forEach((p) => {
          const ratings = byProduct[p.id]
          if (ratings && ratings.length > 0) {
            p.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length
            p.reviews = ratings.length
          }
        })
      } catch (err) {
        console.warn('Error inesperado cargando calificaciones:', err)
      }
    },

    // ─── Carrito ────────────────────────────────
    async loadCart() {
      if (!this.currentUserId) return
      try {
        const { data, error } = await insforge.database
          .from('cart_items')
          .select('*')
          .eq('client_id', this.currentUserId)

        if (error || !data) return

        this.cart = data
          .map((row) => {
            const product = this.products.find((p) => p.id === row.product_id)
            if (!product) return null // producto pausado/eliminado desde que se agregó
            return { ...product, quantity: row.quantity }
          })
          .filter(Boolean)
      } catch (err) {
        console.warn('Error cargando el carrito:', err)
      }
    },

    async addToCart(product) {
      if (!this.currentUserId) {
        alert('Inicia sesión de nuevo para agregar productos al carrito.')
        return
      }

      const existing = this.cart.find((item) => item.id === product.id)

      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('No hay más stock disponible de este producto.')
          return
        }
        existing.quantity++
        try {
          const { error } = await insforge.database
            .from('cart_items')
            .update({ quantity: existing.quantity })
            .eq('client_id', this.currentUserId)
            .eq('product_id', product.id)
          if (error) console.warn('No se pudo actualizar la cantidad en el carrito:', error)
        } catch (err) {
          console.warn('Error inesperado actualizando el carrito:', err)
        }
        return
      }

      if (product.stock <= 0) {
        alert('Este producto está agotado.')
        return
      }

      this.cart.push({ ...product, quantity: 1 })
      try {
        const { error } = await insforge.database.from('cart_items').insert([{
          client_id: this.currentUserId,
          product_id: product.id,
          quantity: 1,
        }])
        if (error) console.warn('No se pudo guardar el producto en el carrito:', error)
      } catch (err) {
        console.warn('Error inesperado guardando el carrito:', err)
      }
    },

    async incrementQty(item) {
      if (item.quantity >= item.stock) return
      item.quantity++
      try {
        const { error } = await insforge.database
          .from('cart_items')
          .update({ quantity: item.quantity })
          .eq('client_id', this.currentUserId)
          .eq('product_id', item.id)
        if (error) console.warn('No se pudo actualizar la cantidad:', error)
      } catch (err) {
        console.warn('Error inesperado actualizando cantidad:', err)
      }
    },

    async decrementQty(item) {
      if (item.quantity <= 1) {
        await this.removeFromCart(item)
        return
      }
      item.quantity--
      try {
        const { error } = await insforge.database
          .from('cart_items')
          .update({ quantity: item.quantity })
          .eq('client_id', this.currentUserId)
          .eq('product_id', item.id)
        if (error) console.warn('No se pudo actualizar la cantidad:', error)
      } catch (err) {
        console.warn('Error inesperado actualizando cantidad:', err)
      }
    },

    async removeFromCart(item) {
      this.cart = this.cart.filter((i) => i.id !== item.id)
      try {
        const { error } = await insforge.database
          .from('cart_items')
          .delete()
          .eq('client_id', this.currentUserId)
          .eq('product_id', item.id)
        if (error) console.warn('No se pudo quitar el producto del carrito:', error)
      } catch (err) {
        console.warn('Error inesperado quitando del carrito:', err)
      }
    },

    async clearCart() {
      if (this.cart.length === 0) return
      this.cart = []
      try {
        const { error } = await insforge.database
          .from('cart_items')
          .delete()
          .eq('client_id', this.currentUserId)
        if (error) console.warn('No se pudo vaciar el carrito:', error)
      } catch (err) {
        console.warn('Error inesperado vaciando el carrito:', err)
      }
    },

    // ─── Modal detalle producto ────────────────
    showProductDetail(product) {
      this.selectedProduct = product
      this.loadMyReviewForProduct(product.id)
    },
    closeProductDetail() {
      this.selectedProduct = null
      this.myRatingStars = 0
      this.myRatingHover = 0
      this.myRatingComment = ''
      this.hasExistingRating = false
    },

    // ─── Calificación de productos (reviews reales) ─
    async loadMyReviewForProduct(productId) {
      this.myRatingStars = 0
      this.myRatingHover = 0
      this.myRatingComment = ''
      this.hasExistingRating = false
      if (!this.currentUserId || !productId) return

      try {
        const { data, error } = await insforge.database
          .from('reviews')
          .select('rating,comment')
          .eq('product_id', productId)
          .eq('client_id', this.currentUserId)
          .single()

        if (!error && data) {
          this.myRatingStars = data.rating || 0
          this.myRatingComment = data.comment || ''
          this.hasExistingRating = true
        }
      } catch (err) {
        // Sin reseña previa todavía: no es un error, es el caso normal.
      }
    },

    async submitRating() {
      if (!this.myRatingStars) {
        alert('Selecciona al menos 1 estrella antes de enviar tu calificación.')
        return
      }
      if (!this.currentUserId) {
        alert('Inicia sesión de nuevo para poder calificar este producto.')
        return
      }
      if (!this.selectedProduct?.id) return

      this.submittingRating = true
      try {
        const payload = {
          product_id: this.selectedProduct.id,
          seller_id: this.selectedProduct.sellerId,
          client_id: this.currentUserId,
          client_name: this.userName,
          rating: this.myRatingStars,
          comment: this.myRatingComment.trim() || null,
        }

        let error
        if (this.hasExistingRating) {
          ;({ error } = await insforge.database
            .from('reviews')
            .update(payload)
            .eq('product_id', this.selectedProduct.id)
            .eq('client_id', this.currentUserId))
        } else {
          ;({ error } = await insforge.database.from('reviews').insert([payload]))
        }

        if (error) {
          alert('No se pudo guardar tu calificación: ' + (error.message || 'error desconocido'))
          return
        }

        this.hasExistingRating = true
        await this.loadRealRatingsForProducts()
        alert('¡Gracias por tu calificación!')
      } catch (err) {
        console.warn('Error inesperado guardando calificación:', err)
        alert('Error inesperado guardando tu calificación.')
      } finally {
        this.submittingRating = false
      }
    },

    // ─── Modal pago ─────────────────────────────
    openCheckoutModal() {
      if (this.cart.length === 0) return
      this.showCheckoutModal = true
      this.selectedPayment = null
      this.pointsToRedeem = 0
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
    async confirmPayment() {
      if (!this.selectedPayment) return

      const totalPaid = this.finalCheckoutTotal
      const pointsUsed = this.pointsToRedeem * 100
      const pointsEarned = Math.floor(totalPaid)

      alert(`🎉 ¡Pago exitoso! Has pagado $${totalPaid.toFixed(2)} con ${this.selectedPayment}.`)
      // Crear nuevo pedido
      const newOrder = {
        id: this.generateOrderRef(),
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        total: totalPaid,
        status: 'En proceso',
        driverId: null,
        driverName: null
      }
      const randomDriver = this.drivers[Math.floor(Math.random() * this.drivers.length)]
      newOrder.driverId = randomDriver.id
      newOrder.driverName = randomDriver.name

      this.orders.unshift(newOrder)
      this.initChatForOrder(newOrder.id, randomDriver.name)

      // ─ Actualizar puntos reales en InsForge (ganar - canjeados) ─
      if (this.currentUserId) {
        const newPointsBalance = this.userPoints - pointsUsed + pointsEarned
        try {
          const { error } = await insforge.database.from('profiles').update({ points: newPointsBalance }).eq('id', this.currentUserId)
          if (!error) {
            this.userPoints = newPointsBalance
          } else {
            console.warn('No se pudieron actualizar los puntos:', error)
          }
        } catch (err) {
          console.warn('Error actualizando puntos:', err)
        }
      }

      // ─ Registrar la venta real (para reportes de la empresa) y descontar stock ─
      await this.registerSaleAndUpdateStock(newOrder.id)

      this.pointsToRedeem = 0
      await this.clearCart()
      this.closeCheckoutModal()
    },

    async registerSaleAndUpdateStock(orderRef) {
      if (this.cart.length === 0) return

      // 1) Una fila por UNIDAD vendida (respetando cantidad), para reportes reales
      const saleRows = []
      this.cart.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          saleRows.push({
            order_ref: orderRef,
            product_id: item.id,
            seller_id: item.sellerId,
            product_title: item.title,
            category: item.category,
            unit_price: item.price,
            client_id: this.currentUserId,
            client_name: this.userName,
          })
        }
      })

      try {
        const { error } = await insforge.database.from('sales').insert(saleRows)
        if (error) console.warn('No se pudo registrar la venta:', error)
      } catch (err) {
        console.warn('Error inesperado registrando la venta:', err)
      }

      // 2) Descontar stock real según la cantidad comprada de cada producto
      const qtyByProduct = {}
      this.cart.forEach((item) => {
        qtyByProduct[item.id] = (qtyByProduct[item.id] || 0) + item.quantity
      })

      for (const [productId, qty] of Object.entries(qtyByProduct)) {
        const cachedProduct = this.products.find((p) => p.id === productId)
        if (!cachedProduct || typeof cachedProduct.stock !== 'number') continue
        const newStock = Math.max(0, cachedProduct.stock - qty)
        try {
          const { error } = await insforge.database.from('products').update({ stock: newStock }).eq('id', productId)
          if (!error) cachedProduct.stock = newStock
        } catch (err) {
          console.warn('No se pudo actualizar el stock del producto', productId, err)
        }
      }
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
      this.driverRealPosition = null
      this.mapUpdateSeconds = 0

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

      // Suscribirse al canal de este pedido para recibir su ubicación en vivo
      this.subscribeToOrderChannel(this.trackingToken)

      this.$nextTick(() => {
        this.initLeafletMap()
      })
    },

    // ─── Realtime (InsForge) — ubicación del repartidor ──
    async connectRealtime() {
      try {
        await insforge.realtime.connect()
        insforge.realtime.on('location_update', (data) => {
          if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
            this.driverRealPosition = { lat: data.lat, lng: data.lng }
            this.mapUpdateSeconds = 0
            this.updateDriverMarker()
          }
        })
      } catch (err) {
        console.warn('No se pudo conectar a InsForge Realtime:', err)
      }
    },
    async subscribeToOrderChannel(token) {
      if (!token) return
      try {
        await insforge.realtime.subscribe(`order:${token}`)
      } catch (err) {
        console.warn('No se pudo suscribir al canal de seguimiento:', err)
      }
    },
    disconnectRealtime() {
      try {
        if (this.trackingToken) {
          insforge.realtime.unsubscribe(`order:${this.trackingToken}`)
        }
      } catch (e) {
        // no-op: puede que el SDK no tenga unsubscribe o ya esté desconectado
      }
    },
    copyTrackingLink() {
      if (!this.trackingLink) return
      navigator.clipboard
        .writeText(this.trackingLink)
        .then(() => alert('✅ Link copiado. Ábrelo en el celular del repartidor.'))
        .catch(() => alert('No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.'))
    },

    // ─── Mapa real (Leaflet) ──────────────────────
    initLeafletMap() {
      if (this.leafletMap) {
        this.leafletMap.remove()
        this.leafletMap = null
        this.driverMarker = null
      }

      const mapEl = this.$refs.mapEl
      if (!mapEl) return

      const defaultCenter = [13.6929, -89.2182] // San Salvador, El Salvador
      this.leafletMap = L.map(mapEl).setView(defaultCenter, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.leafletMap)

      if (this.driverRealPosition) {
        this.updateDriverMarker()
      }

      this.$nextTick(() => {
        if (this.leafletMap) this.leafletMap.invalidateSize()
      })
    },
    updateDriverMarker() {
      if (!this.leafletMap || !this.driverRealPosition) return
      const { lat, lng } = this.driverRealPosition

      if (!this.driverMarker) {
        const truckIcon = L.divIcon({
          html: '<div style="font-size: 26px; line-height: 1;">🚚</div>',
          className: 'driver-marker-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
        this.driverMarker = L.marker([lat, lng], { icon: truckIcon }).addTo(this.leafletMap)
      } else {
        this.driverMarker.setLatLng([lat, lng])
      }

      this.leafletMap.panTo([lat, lng])
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
// chatbot
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
.cart-nav-item {
  position: relative;
}
.cart-nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.2rem 0.4rem;
  border-radius: 999px;
  min-width: 16px;
  text-align: center;
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
.cart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
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
.cart-item-seller {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.cart-qty-control {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  line-height: 1;
  font-size: 1rem;
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qty-value {
  min-width: 18px;
  text-align: center;
  font-weight: 600;
}
.cart-item-subtotal {
  font-weight: 600;
  min-width: 60px;
  text-align: right;
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
.company-chat-modal {
  max-width: 480px;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}
.company-chat-modal .chat-messages-box {
  flex: 1;
  min-height: 300px;
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
.rate-product-box {
  margin-top: 1rem;
  padding: 0.9rem;
  border-radius: 12px;
  background: var(--off-white, #f8faf9);
  border: 1px solid #e2e8f0;
}
.rate-product-title {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dark, #1a202c);
}
.rate-stars-input {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.6rem;
}
.rate-star {
  font-size: 1.6rem;
  cursor: pointer;
  color: #d1d5db;
  user-select: none;
  transition: color 0.15s ease;
}
.rate-star-filled {
  color: #f59e0b;
}
.rate-comment-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.6rem;
  font-family: inherit;
  font-size: 0.85rem;
  resize: vertical;
  margin-bottom: 0.6rem;
  box-sizing: border-box;
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
.points-redeem-box {
  background: #fffbea;
  border: 1px solid #fbbf24;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}
.points-redeem-label {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #92400e;
  font-weight: 600;
}
.points-redeem-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #4a5568;
}
.pts-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #fbbf24;
  background: white;
  color: #92400e;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
}
.pts-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.checkout-total-final {
  text-align: center;
  margin: 0.6rem 0 0;
  font-size: 0.95rem;
  color: #005e59;
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
.driver-share-link {
  margin-top: 0.9rem;
  padding-top: 0.9rem;
  border-top: 1px dashed var(--border);
}
.share-link-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}
.share-link-row {
  display: flex;
  gap: 0.4rem;
}
.share-link-row input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--text-muted);
  background: #f7fafc;
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
  position: relative;
}
.leaflet-map-real {
  width: 100%;
  height: 400px;
}
.map-waiting-hint {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-muted);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 400;
  pointer-events: none;
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