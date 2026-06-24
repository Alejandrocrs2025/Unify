<template>
  <div class="app-container">
    <header>
      <h1><span>U</span>nify</h1>
      <img src="/img/logo-unify.png" alt="Unify Logo">
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
      <div class="profile-header">
        <div class="profile-info">
          <h2>¡Hola, {{ userName }}! 👋</h2>
          <p>Bienvenida a Unify - Tu tienda favorita</p>
        </div>
        <div class="profile-points">
          ⭐ {{ userPoints }} puntos acumulados
        </div>
      </div>

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

      <!-- Productos -->
      <h3 style="margin-bottom: 1rem;">🔥 Productos destacados</h3>
      <div class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.title" @error="handleImageError">
          </div>
          <div class="product-info">
            <div class="product-title">{{ product.title }}</div>
            <div class="product-price">${{ product.price.toFixed(2) }}</div>
            <div class="product-seller">{{ product.seller }}</div>
            <div class="product-rating">
              <span v-for="n in 5" :key="n" :class="{ 'star-filled': n <= Math.round(product.rating) }">★</span>
              <span class="rating-count">({{ product.reviews }})</span>
            </div>
            <button class="btn-add" @click="addToCart(product)">
              <i class="fas fa-shopping-cart"></i> Agregar al carrito
            </button>
          </div>
        </div>
      </div>

      <!-- Carrito de compras -->
      <div class="cart-panel">
        <h3><i class="fas fa-shopping-cart"></i> Mi carrito ({{ cart.length }} productos)</h3>
        <div class="cart-items" v-if="cart.length > 0">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <img :src="item.image" alt="" class="cart-item-image">
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
        <button class="btn-primary" style="margin-top: 1rem; width: 100%;" @click="checkout" :disabled="cart.length === 0">
          Proceder al pago →
        </button>
      </div>

      <!-- Historial de pedidos -->
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
          </div>
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
  data() {
    return {
      userName: 'Cliente',
      userRole: 'Cliente',
      userPoints: 1280,
      currentView: 'home',
      selectedCategory: 'Todos',
      categories: ['Todos', 'Electrónica', 'Hogar', 'Moda', 'Ofertas'],
      cart: [],
      orders: [
        { id: '#UNI-4521', date: '15 Dic 2025', total: 45.0, status: 'Entregado' },
        { id: '#UNI-4518', date: '10 Dic 2025', total: 128.0, status: 'Entregado' },
        { id: '#UNI-4512', date: '5 Dic 2025', total: 67.5, status: 'Entregado' },
      ],
      products: [
        {
          id: 1,
          title: 'Laptop Dell XPS 13',
          price: 899.0,
          seller: 'Dell Store',
          rating: 4.8,
          reviews: 156,
          category: 'Electrónica',
          image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 2,
          title: 'Monitor LG 24" 4K',
          price: 249.0,
          seller: 'LG Electronics',
          rating: 4.6,
          reviews: 89,
          category: 'Electrónica',
          image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 3,
          title: 'Audífonos Sony WH-1000XM5',
          price: 59.0,
          seller: 'Sony Audio',
          rating: 4.9,
          reviews: 234,
          category: 'Electrónica',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 4,
          title: 'Teclado Mecánico Redragon',
          price: 89.0,
          seller: 'Redragon',
          rating: 4.5,
          reviews: 78,
          category: 'Electrónica',
          image: 'https://images.unsplash.com/photo-1618384887929-16ec33c8cf3b?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 5,
          title: 'Mesa de Oficina Moderna',
          price: 450.0,
          seller: 'Muebles Modernos',
          rating: 4.3,
          reviews: 45,
          category: 'Hogar',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 6,
          title: 'Sofá 3 Plazas Premium',
          price: 1200.0,
          seller: 'Hogar & Estilo',
          rating: 4.7,
          reviews: 123,
          category: 'Hogar',
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 7,
          title: 'Chaqueta de Cuero para Hombre',
          price: 299.0,
          seller: 'Moda Premium',
          rating: 4.2,
          reviews: 67,
          category: 'Moda',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 8,
          title: 'Zapatos Deportivos Nike Air',
          price: 159.0,
          seller: 'Nike Store',
          rating: 4.4,
          reviews: 234,
          category: 'Moda',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 9,
          title: 'Smart TV Samsung 55"',
          price: 899.0,
          seller: 'Samsung Electronics',
          rating: 4.7,
          reviews: 189,
          category: 'Electrónica',
          image: 'https://images.unsplash.com/photo-1593305841991-05b297ba1ae5?w=400&h=300&fit=crop&crop=center'
        },
        {
          id: 10,
          title: 'Set de Ollas de Acero Inoxidable',
          price: 89.0,
          seller: 'Cocina Pro',
          rating: 4.1,
          reviews: 56,
          category: 'Hogar',
          image: 'https://images.unsplash.com/photo-1585664811087-47a1e2b450b7?w=400&h=300&fit=crop&crop=center'
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === 'Todos') {
        return this.products
      }
      return this.products.filter(p => p.category === this.selectedCategory)
    },
    cartTotal() {
      return this.cart.reduce((total, item) => total + item.price, 0)
    }
  },
  mounted() {
    this.loadUserProfile()
  },
  methods: {
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

        const profileRes = await insforge.from('profiles').select('role').eq('id', user.id).single()
        if (!profileRes.error && profileRes.data?.role) {
          this.userRole = profileRes.data.role
        }
      } catch (err) {
        console.warn('Error cargando perfil de cliente:', err)
      }
    },
    addToCart(product) {
      this.cart.push({ ...product })
      this.$forceUpdate()
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    checkout() {
      if (this.cart.length === 0) return
      alert('🎉 ¡Gracias por tu compra! Redirigiendo al proceso de pago...')
      this.cart = []
    },
    viewOrder(orderId) {
      alert(`📦 Mostrando detalles del pedido ${orderId}`)
    },
    async signOut() {
      try {
        await insforge.auth.signOut()
      } catch (err) {
        console.warn('Error cerrando sesión:', err)
      }
      try { localStorage.removeItem('userRole') } catch (e) {}
      try { localStorage.removeItem('pendingUserId') } catch (e) {}
      window.location.reload()
    },
    getStatusClass(status) {
      const statusMap = {
        'Entregado': 'status-delivered',
        'En proceso': 'status-processing',
        'Cancelado': 'status-canceled'
      }
      return statusMap[status] || ''
    },
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/400x300/005e59/ffffff?text=Product'
    }
  }
}
</script>

<style scoped>
/* cliente-dashboard.css */
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

* { margin: 0; padding: 0; box-sizing: border-box; }

.app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--off-white);
  min-height: 100vh;
}

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

.dashboard-container {
  padding: 2rem 5vw;
  max-width: 1400px;
  margin: 0 auto;
}

/* Perfil del cliente */
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
  position: absolute;
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

/* Productos */
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

/* Categorías */
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

/* Carrito */
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

/* Historial de pedidos */
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

.status-canceled {
  background: #fee2e2;
  color: #ef4444;
  padding: 0.2rem 0.8rem;
  border-radius: 40px;
  font-size: 0.7rem;
  font-weight: 600;
}

footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 2rem 5vw;
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .products-grid { grid-template-columns: 1fr; }
  .profile-header { flex-direction: column; text-align: center; gap: 1rem; }
  header { flex-wrap: wrap; gap: 0.5rem; }
  .navbar ul { gap: 0.25rem; }
  .navbar li { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
  .order-item { flex-direction: column; align-items: stretch; gap: 0.5rem; }
  .order-info { justify-content: center; }
}
</style>