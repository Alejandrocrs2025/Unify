<template>
  <div class="app-container">
    <!-- ══════════════════════════════════════════
         HEADER MEJORADO - Estilo Marketplace
    ══════════════════════════════════════════ -->
    <header class="market-header">
      <div class="header-left">
        <img src="/img/logo-unify.png" alt="Unify Logo" class="logo" />
        <h1><span>U</span>nify <span class="header-role-tag">Empresa</span></h1>
      </div>

      <!-- Barra de búsqueda global con resultados -->
      <div class="header-search" ref="searchContainer">
        <i class="fas fa-search"></i>
        <input 
          v-model="globalSearch" 
          type="text" 
          placeholder="Buscar productos, pedidos, clientes..." 
          @focus="searchFocused = true"
          @blur="closeSearchResults"
          @input="performSearch"
        />
        <div class="search-shortcut" v-if="!searchFocused && !globalSearch">⌘K</div>
        <!-- Dropdown de resultados -->
        <div class="search-results" v-if="searchFocused && globalSearch && searchResults.length">
          <div class="search-result-group" v-if="filteredProducts.length">
            <div class="result-group-title">Productos</div>
            <div 
              v-for="p in filteredProducts.slice(0, 5)" 
              :key="'p-' + p.id" 
              class="search-result-item"
              @mousedown.prevent="navigateTo('catalog', { product: p })"
            >
              <img :src="p.image" alt="" class="result-thumb" />
              <div class="result-info">
                <div class="result-name">{{ p.title }}</div>
                <div class="result-detail">${{ p.price.toFixed(2) }} · {{ p.category }}</div>
              </div>
            </div>
          </div>
          <div class="search-result-group" v-if="filteredOrders.length">
            <div class="result-group-title">Pedidos</div>
            <div 
              v-for="o in filteredOrders.slice(0, 5)" 
              :key="'o-' + o.id" 
              class="search-result-item"
              @mousedown.prevent="navigateTo('orders', { order: o })"
            >
              <div class="result-icon"><i class="fas fa-box"></i></div>
              <div class="result-info">
                <div class="result-name">{{ o.id }} - {{ o.client }}</div>
                <div class="result-detail">{{ o.total }} · {{ o.status }}</div>
              </div>
            </div>
          </div>
          <div class="search-result-empty" v-if="!filteredProducts.length && !filteredOrders.length">
            No se encontraron resultados
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- Notificaciones -->
        <div class="notif-bell" @click="toggleNotifications">
          <i class="fas fa-bell"></i>
          <span class="notif-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </div>

        <!-- Carrito (desde perspectiva empresa) -->
        <div class="cart-icon" @click="currentView = 'orders'">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-badge">{{ cartCount }}</span>
        </div>

        <!-- Perfil empresa -->
        <div class="profile-menu" @click="toggleProfileMenu">
          <div class="avatar-circle" :class="{ 'has-photo': companyLogoUrl }">
            <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="Logo" />
            <span v-else>{{ companyInitials }}</span>
          </div>
          <span class="profile-name">{{ companyName }}</span>
          <i class="fas fa-chevron-down" :class="{ rotated: profileMenuOpen }"></i>
        </div>

        <!-- Dropdown perfil -->
        <div class="profile-dropdown" v-if="profileMenuOpen">
          <div class="dropdown-header">
            <div class="dropdown-avatar" :class="{ 'has-photo': companyLogoUrl }">
              <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="Logo" />
              <span v-else>{{ companyInitials }}</span>
            </div>
            <div>
              <div class="dropdown-name">{{ companyName }}</div>
              <div class="dropdown-email">{{ companyEmail }}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click="currentView = 'dashboard'">
            <i class="fas fa-chart-line"></i> Dashboard
          </div>
          <div class="dropdown-item" @click="currentView = 'catalog'; catalogTab='products'">
            <i class="fas fa-store"></i> Catálogo
          </div>
          <div class="dropdown-item" @click="currentView = 'orders'">
            <i class="fas fa-box"></i> Pedidos
          </div>
          <div class="dropdown-item" @click="currentView = 'inventory'">
            <i class="fas fa-warehouse"></i> Inventario
          </div>
          <div class="dropdown-item" @click="currentView = 'messages'">
            <i class="fas fa-comment-dots"></i> Mensajes
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click="currentView = 'settings'">
            <i class="fas fa-cog"></i> Configuración
          </div>
          <div class="dropdown-item logout" @click="signOut">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </div>
        </div>
      </div>
    </header>

    <!-- ══════════════════════════════════════════
         NAVEGACIÓN SECUNDARIA (Tabs)
    ══════════════════════════════════════════ -->
    <nav class="sub-nav">
      <div class="sub-nav-inner">
        <button 
          v-for="tab in mainTabs" 
          :key="tab.key"
          class="sub-nav-btn"
          :class="{ active: currentView === tab.key }"
          @click="currentView = tab.key"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
          <span class="tab-badge" v-if="tab.badge">{{ tab.badge }}</span>
        </button>
      </div>
    </nav>

    <main class="dashboard-container">
      <!-- ════════════════════════════════════════
           BANNER EMPRESA MEJORADO
      ════════════════════════════════════════ -->
      <div class="profile-header">
        <div class="profile-info">
          <p class="welcome-sub">Panel operativo</p>
          <h2>Bienvenido, {{ companyName }} 🏢</h2>
          <p class="welcome-desc">{{ todayDate }} · {{ activeOrders }} pedidos activos</p>
        </div>
        <div class="header-right-actions">
          <div class="alert-pill" v-if="lowStockCount > 0">
            <i class="fas fa-exclamation-triangle"></i>
            {{ lowStockCount }} alertas de stock
          </div>
          <button class="btn btn-primary" @click="goToNewProduct">
            <i class="fas fa-plus"></i> Publicar producto
          </button>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           VISTA: DASHBOARD
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'dashboard'">
        <!-- ... (dashboard igual que antes) ... -->
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in stats" :key="stat.label">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="stat.trendUp ? 'trend-up' : 'trend-down'">
              <i :class="stat.trendUp ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
              {{ stat.trend }}
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Pedidos recientes -->
          <div class="card-panel">
            <div class="panel-header">
              <h3><i class="fas fa-clipboard-list"></i> Pedidos recientes</h3>
              <button class="btn btn-outline btn-sm" @click="currentView = 'orders'">Ver todos →</button>
            </div>
            <div class="filter-tabs">
              <button 
                v-for="f in orderFilters" 
                :key="f" 
                class="filter-tab"
                :class="{ active: activeFilter === f }" 
                @click="activeFilter = f"
              >{{ f }}</button>
            </div>
            <table class="order-table">
              <thead>
                <tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id">
                  <td class="order-id">{{ order.id }}</td>
                  <td>{{ order.client }}</td>
                  <td class="order-total">{{ order.total }}</td>
                  <td><span class="status-badge" :class="getOrderStatusClass(order.status)">{{ order.status }}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" @click="viewOrder(order)">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Ventas semanales -->
          <div class="card-panel">
            <div class="panel-header">
              <h3><i class="fas fa-chart-bar"></i> Ventas de la semana</h3>
              <span class="panel-badge">Esta semana</span>
            </div>
            <div class="weekly-total">${{ weeklyTotal.toLocaleString() }}<span class="weekly-label"> ingresos totales</span></div>
            <div class="bar-chart">
              <div class="bar-item" v-for="day in salesData" :key="day.label">
                <div class="bar-label">
                  <span>{{ day.label }}</span>
                  <span class="bar-amount">${{ day.amount.toLocaleString() }}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: (day.amount / maxSales * 100) + '%' }"
                    :class="{ 'bar-best': day.amount === maxSales }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: CATÁLOGO (Marketplace Style)
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'catalog'">
        <!-- ... (catalog igual que antes) ... -->
        <!-- Tabs catálogo -->
        <div class="catalog-topbar">
          <div class="catalog-tabs">
            <button 
              v-for="t in catalogTabs" 
              :key="t.key" 
              class="ctab"
              :class="{ active: catalogTab === t.key }" 
              @click="catalogTab = t.key"
            >
              <i :class="t.icon"></i> {{ t.label }}
            </button>
          </div>
          <button class="btn btn-primary" @click="resetNewProduct(); catalogTab = 'new'">
            <i class="fas fa-plus"></i> Publicar nuevo producto
          </button>
        </div>

        <!-- ── Tab: Mis productos ────── -->
        <template v-if="catalogTab === 'products'">
          <!-- Filtros mejorados -->
          <div class="catalog-search-bar">
            <div class="search-wrap">
              <i class="fas fa-search"></i>
              <input v-model="catalogSearch" type="text" placeholder="Buscar en tu catálogo…" />
            </div>
            <div class="catalog-filters">
              <select v-model="catalogCategoryFilter" class="sel">
                <option value="">Todas las categorías</option>
                <option v-for="c in productCategories" :key="c" :value="c">{{ c }}</option>
              </select>
              <select v-model="catalogStatusFilter" class="sel">
                <option value="">Todos los estados</option>
                <option>Activo</option>
                <option>Pausado</option>
                <option>Borrador</option>
              </select>
              <select v-model="catalogSort" class="sel">
                <option value="recent">Más recientes</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="sales">Más vendidos</option>
                <option value="rating">Mejor calificados</option>
              </select>
            </div>
          </div>

          <!-- Grid de productos estilo marketplace -->
          <div class="published-grid">
            <div class="pub-card" v-for="p in sortedCatalog" :key="p.id" @click="viewProductDetail(p)">
              <div class="pub-img-wrap">
                <img :src="p.image" :alt="p.title" @error="$event.target.src='https://via.placeholder.com/300x200/edf7f5/005e59?text=Producto'" />
                <span class="pub-status-badge" :class="'pstatus-' + p.status.toLowerCase()">{{ p.status }}</span>
                <div class="pub-actions-overlay">
                  <button class="overlay-btn" @click.stop="editProduct(p)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="overlay-btn" @click.stop="viewProductAnalytics(p)">
                    <i class="fas fa-chart-line"></i>
                  </button>
                  <button class="overlay-btn" @click.stop="deleteProductConfirm(p)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="pub-body">
                <div class="pub-category">{{ p.category }}</div>
                <div class="pub-title">{{ p.title }}</div>
                <div class="pub-price">${{ p.price.toFixed(2) }}</div>
                <div class="pub-rating">
                  <span class="stars">{{ getStars(p.rating) }}</span>
                  <span class="rating-count">({{ p.reviews || 0 }})</span>
                </div>
                <div class="pub-meta">
                  <span><i class="fas fa-box"></i> {{ p.stock }} en stock</span>
                  <span><i class="fas fa-shopping-cart"></i> {{ p.sales || 0 }} vendidos</span>
                </div>
                <div class="pub-logistics">
                  <span class="logistics-chip" :class="'log-' + p.logistics.toLowerCase().replace(/\\s+/g, '-')">
                    🚚 {{ p.logistics }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── Tab: Publicar producto ─────── -->
        <template v-if="catalogTab === 'new'">
          <div class="publish-layout">
            <!-- Formulario mejorado -->
            <div class="publish-form-col">
              <!-- PASO 1: Información básica -->
              <div class="card-panel pub-step">
                <div class="step-header">
                  <div class="step-badge">1</div>
                  <div>
                    <h3>Información del producto</h3>
                    <p class="step-desc">Título optimizado, descripción y categoría</p>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Título del producto <span class="required">*</span></label>
                  <input v-model="newProduct.title" type="text" class="form-input"
                    placeholder="Ej: Laptop Dell XPS 13 — 16GB RAM, Intel Core i7" />
                  <div class="char-count" :class="newProduct.title.length > 150 ? 'char-over' : ''">
                    {{ newProduct.title.length }}/200 caracteres
                    <span v-if="newProduct.title.length >= 80 && newProduct.title.length <= 150" class="seo-ok">✓ Longitud óptima para SEO</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Categoría <span class="required">*</span></label>
                    <select v-model="newProduct.category" class="form-input">
                      <option value="">Seleccionar…</option>
                      <option v-for="c in productCategories" :key="c">{{ c }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Subcategoría</label>
                    <input v-model="newProduct.subcategory" type="text" class="form-input" placeholder="Ej: Laptops gaming" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Descripción <span class="required">*</span></label>
                  <textarea v-model="newProduct.description" class="form-textarea" rows="4"
                    placeholder="Describe características, materiales, uso y beneficios."></textarea>
                  <div class="char-count">{{ newProduct.description.length }}/2000 caracteres</div>
                </div>

                <div class="form-group">
                  <label class="form-label">Puntos clave (bullet points)</label>
                  <div class="bullet-list">
                    <div class="bullet-item" v-for="(b, i) in newProduct.bullets" :key="i">
                      <span class="bullet-dot">•</span>
                      <input v-model="newProduct.bullets[i]" type="text" class="form-input bullet-input"
                        :placeholder="'Característica destacada ' + (i+1)" />
                      <button class="btn-icon-remove" @click="removeBullet(i)" v-if="newProduct.bullets.length > 1">✕</button>
                    </div>
                  </div>
                  <button class="btn btn-outline btn-sm mt-sm" @click="addBullet" :disabled="newProduct.bullets.length >= 5">
                    <i class="fas fa-plus"></i> Agregar punto
                  </button>
                </div>
              </div>

              <!-- PASO 2: Imágenes -->
              <div class="card-panel pub-step">
                <div class="step-header">
                  <div class="step-badge">2</div>
                  <div>
                    <h3>Imágenes del producto</h3>
                    <p class="step-desc">Mínimo 1 imagen principal · Fondo blanco recomendado</p>
                  </div>
                </div>

                <div class="image-upload-zone" @click="triggerFileInput" :class="{ uploading: uploadingImage }">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style="display: none"
                    @change="handleFileSelected"
                  />
                  <div class="upload-inner">
                    <div class="upload-icon">📷</div>
                    <div class="upload-title">
                      {{ uploadingImage ? 'Subiendo imagen…' : 'Arrastra una imagen aquí o haz clic para subir' }}
                    </div>
                    <div class="upload-hint">PNG, JPG, WEBP · Mín. 500×500px · Máx. 5MB</div>
                  </div>
                </div>

                <p v-if="imageUploadError" class="image-upload-error">{{ imageUploadError }}</p>

                <div class="image-url-row">
                  <input
                    v-model="imageUrlInput"
                    type="text"
                    class="form-input"
                    placeholder="…o pega la URL de una imagen (https://...)"
                    @keyup.enter="addImageFromUrl"
                  />
                  <button class="btn btn-outline btn-sm" @click="addImageFromUrl" :disabled="!imageUrlInput.trim()">
                    Agregar
                  </button>
                </div>

                <div class="image-preview-row" v-if="newProduct.previewImages.length > 0">
                  <div class="img-thumb" v-for="(img, i) in newProduct.previewImages" :key="i">
                    <img :src="img" alt="preview" />
                    <div v-if="i === 0" class="img-main-badge">Principal</div>
                    <button class="img-remove" @click="removePreviewImage(i)">✕</button>
                  </div>
                </div>

                <button class="btn-link-demo" @click="addDemoImages">
                  Usar una imagen de ejemplo (solo para pruebas)
                </button>
              </div>

              <!-- PASO 3: Precio e inventario -->
              <div class="card-panel pub-step">
                <div class="step-header">
                  <div class="step-badge">3</div>
                  <div>
                    <h3>Precio e inventario</h3>
                    <p class="step-desc">Configura precio, descuentos y stock disponible</p>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Precio de venta <span class="required">*</span></label>
                    <div class="input-prefix-wrap">
                      <span class="input-prefix">$</span>
                      <input v-model.number="newProduct.price" type="number" class="form-input input-with-prefix" 
                        min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Precio anterior (tachado)</label>
                    <div class="input-prefix-wrap">
                      <span class="input-prefix">$</span>
                      <input v-model.number="newProduct.originalPrice" type="number" class="form-input input-with-prefix" 
                        min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div class="discount-preview" v-if="discountPercent > 0">
                  <span class="discount-badge">-{{ discountPercent }}% OFF</span>
                  <span class="discount-text">Tus compradores verán este descuento destacado</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Stock disponible <span class="required">*</span></label>
                    <input v-model.number="newProduct.stock" type="number" class="form-input" min="0" placeholder="0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Alerta de stock mínimo</label>
                    <input v-model.number="newProduct.minStock" type="number" class="form-input" min="0" placeholder="5" />
                  </div>
                </div>
              </div>

              <!-- PASO 4: Logística -->
              <div class="card-panel pub-step">
                <div class="step-header">
                  <div class="step-badge">4</div>
                  <div>
                    <h3>Logística y modelo de envío</h3>
                    <p class="step-desc">Elige cómo manejas el almacenamiento, envío y last-mile</p>
                  </div>
                </div>

                <div class="logistics-options">
                  <div
                    class="logistics-option"
                    v-for="opt in logisticsOptions"
                    :key="opt.key"
                    :class="{ selected: newProduct.logistics === opt.key }"
                    @click="newProduct.logistics = opt.key"
                  >
                    <div class="lo-radio">
                      <div class="lo-radio-dot" v-if="newProduct.logistics === opt.key"></div>
                    </div>
                    <div class="lo-icon">{{ opt.icon }}</div>
                    <div class="lo-body">
                      <div class="lo-title">{{ opt.title }}</div>
                      <div class="lo-desc">{{ opt.desc }}</div>
                      <div class="lo-tags">
                        <span class="lo-tag" v-for="tag in opt.tags" :key="tag">{{ tag }}</span>
                      </div>
                    </div>
                    <div class="lo-badge" v-if="opt.recommended">Recomendado</div>
                  </div>
                </div>

                <div class="shipping-zones">
                  <label class="form-label">Zonas de cobertura</label>
                  <div class="zone-chips">
                    <button
                      v-for="zone in shippingZones"
                      :key="zone"
                      class="zone-chip"
                      :class="{ active: newProduct.zones.includes(zone) }"
                      @click="toggleZone(zone)"
                    >{{ zone }}</button>
                  </div>
                </div>
              </div>

              <!-- Botones publicación -->
              <div class="publish-actions">
                <button class="btn btn-outline" @click="saveDraft">
                  <i class="fas fa-save"></i> Guardar borrador
                </button>
                <button class="btn btn-preview" @click="previewProduct">
                  <i class="fas fa-eye"></i> Vista previa
                </button>
                <button class="btn btn-publish" @click="publishProduct" :disabled="!canPublish">
                  <i class="fas fa-rocket"></i> Publicar producto
                </button>
              </div>
            </div>

            <!-- Vista previa del listing -->
            <div class="publish-preview-col">
              <div class="preview-label">
                <i class="fas fa-eye"></i> Vista previa del listing
              </div>
              <div class="listing-preview">
                <div class="lp-img-wrap">
                  <img
                    :src="newProduct.previewImages[0] || 'https://via.placeholder.com/300x240/edf7f5/005e59?text=Imagen+principal'"
                    alt="preview"
                    class="lp-main-img"
                  />
                  <div class="lp-discount-tag" v-if="discountPercent > 0">-{{ discountPercent }}%</div>
                </div>
                <div class="lp-body">
                  <div class="lp-brand">{{ newProduct.brand || 'Tu Marca' }}</div>
                  <div class="lp-title">{{ newProduct.title || 'Título de tu producto' }}</div>
                  <div class="lp-rating">
                    <span>★★★★★</span>
                    <span class="lp-rating-count">(0 reseñas)</span>
                  </div>
                  <div class="lp-price-wrap">
                    <span class="lp-price">${{ newProduct.price ? newProduct.price.toFixed(2) : '0.00' }}</span>
                    <span class="lp-original" v-if="newProduct.originalPrice > newProduct.price">
                      ${{ newProduct.originalPrice.toFixed(2) }}
                    </span>
                  </div>
                  <div class="lp-bullets" v-if="newProduct.bullets.some(b => b.trim())">
                    <div v-for="(b, i) in newProduct.bullets.filter(b => b.trim())" :key="i" class="lp-bullet">
                      <span class="lp-bullet-dot">✓</span> {{ b }}
                    </div>
                  </div>
                  <div class="lp-logistics" v-if="newProduct.logistics">
                    <span class="lp-ship-icon">🚚</span>
                    {{ logisticsOptions.find(o => o.key === newProduct.logistics)?.title || '' }}
                  </div>
                  <div class="lp-zones" v-if="newProduct.zones.length > 0">
                    <i class="fas fa-map-marker-alt" style="color:var(--green-400)"></i>
                    Disponible en: {{ newProduct.zones.join(', ') }}
                  </div>
                  <button class="btn-buy">
                    <i class="fas fa-shopping-cart"></i> Agregar al carrito
                  </button>
                </div>
              </div>

              <!-- Checklist de calidad -->
              <div class="quality-card">
                <div class="qc-title"><i class="fas fa-check-circle" style="color:var(--green-400)"></i> Calidad del listing</div>
                <div class="qc-item" v-for="qc in qualityChecks" :key="qc.label">
                  <span :class="qc.check ? 'qc-ok' : 'qc-fail'">{{ qc.check ? '✓' : '○' }}</span>
                  <span :class="qc.check ? 'qc-label-ok' : 'qc-label-fail'">{{ qc.label }}</span>
                </div>
                <div class="qc-score">
                  <div class="bar-track"><div class="bar-fill bar-ok" :style="{ width: listingScore + '%' }"></div></div>
                  <span class="qc-score-num">{{ listingScore }}% de calidad</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── Tab: Envíos activos ─────────── -->
        <template v-if="catalogTab === 'shipments'">
          <div class="card-panel">
            <div class="panel-header">
              <h3><i class="fas fa-shipping-fast"></i> Seguimiento de envíos activos</h3>
              <span class="panel-badge">{{ activeShipments }} activos ahora</span>
            </div>
            <table class="order-table">
              <thead>
                <tr><th>Envío</th><th>Producto</th><th>Cliente</th><th>Conductor</th><th>ETA</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                <tr v-for="s in activeShipmentsList" :key="s.id">
                  <td class="order-id">{{ s.id }}</td>
                  <td>{{ s.product }}</td>
                  <td>{{ s.client }}</td>
                  <td>
                    <span class="driver-mini">
                      <div class="driver-mini-avatar">{{ s.driverInitials }}</div> {{ s.driver }}
                    </span>
                  </td>
                  <td><span class="eta-pill">🕐 {{ s.eta }}</span></td>
                  <td><span class="status-badge" :class="getOrderStatusClass(s.status)">{{ s.status }}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" @click="viewTracking(s)"><i class="fas fa-map-marker-alt"></i></button>
                    <button class="btn btn-outline btn-sm ml-xs" @click="openChat(s)"><i class="fas fa-comment"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: PEDIDOS
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'orders'">
        <div class="page-header">
          <h2><i class="fas fa-box"></i> Gestión de Pedidos</h2>
          <p class="page-subtitle">Administra todos los pedidos de tus clientes</p>
        </div>

        <div class="orders-filters">
          <div class="search-wrap">
            <i class="fas fa-search"></i>
            <input v-model="orderSearch" type="text" placeholder="Buscar pedido por ID o cliente…" />
          </div>
          <select v-model="orderStatusFilter" class="sel">
            <option value="">Todos los estados</option>
            <option>Pendiente</option>
            <option>Enviado</option>
            <option>Entregado</option>
            <option>Cancelado</option>
          </select>
          <select v-model="orderDateFilter" class="sel">
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="all">Todo el historial</option>
          </select>
        </div>

        <div class="card-panel">
          <table class="order-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrdersFull" :key="order.id">
                <td class="order-id">{{ order.id }}</td>
                <td>{{ order.client }}</td>
                <td>{{ order.products || '—' }}</td>
                <td class="order-total">{{ order.total }}</td>
                <td>{{ order.date || '—' }}</td>
                <td><span class="status-badge" :class="getOrderStatusClass(order.status)">{{ order.status }}</span></td>
                <td>
                  <button class="btn btn-outline btn-sm" @click="viewOrder(order)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-primary btn-sm" v-if="order.status === 'Pendiente'" @click="updateOrderStatus(order, 'Enviado')">
                    <i class="fas fa-check"></i>
                  </button>
                  <button class="btn btn-outline btn-sm" @click="openChatForOrder(order)">
                    <i class="fas fa-comment"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: INVENTARIO
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'inventory'">
        <div class="page-header">
          <h2><i class="fas fa-warehouse"></i> Control de Inventario</h2>
          <p class="page-subtitle">Gestiona el stock de todos tus productos</p>
        </div>

        <div class="inventory-stats">
          <div class="inv-stat">
            <span class="inv-stat-value">{{ totalProducts }}</span>
            <span class="inv-stat-label">Total productos</span>
          </div>
          <div class="inv-stat">
            <span class="inv-stat-value">{{ totalStock }}</span>
            <span class="inv-stat-label">Unidades en stock</span>
          </div>
          <div class="inv-stat">
            <span class="inv-stat-value" style="color:#d97706">{{ lowStockCount }}</span>
            <span class="inv-stat-label">Productos con stock bajo</span>
          </div>
          <div class="inv-stat">
            <span class="inv-stat-value" style="color:#dc2626">{{ outOfStockCount }}</span>
            <span class="inv-stat-label">Agotados</span>
          </div>
        </div>

        <div class="card-panel">
          <div class="panel-header">
            <h3><i class="fas fa-list"></i> Lista de productos</h3>
            <button class="btn btn-primary btn-sm" @click="goToNewProduct">
              <i class="fas fa-plus"></i> Agregar producto
            </button>
          </div>
          <table class="order-table">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in publishedProducts" :key="p.id">
                <td>
                  <div class="product-cell">
                    <img :src="p.image" alt="" class="product-thumb" @error="$event.target.src='https://via.placeholder.com/40/edf7f5/005e59?text=?'" />
                    <span>{{ p.title }}</span>
                  </div>
                </td>
                <td>{{ p.category }}</td>
                <td>
                  <span :class="p.stock === 0 ? 'stock-critical' : p.stock <= 5 ? 'stock-low' : ''">
                    {{ p.stock }} uds
                  </span>
                </td>
                <td>${{ p.price.toFixed(2) }}</td>
                <td><span class="status-badge" :class="'pstatus-' + p.status.toLowerCase()">{{ p.status }}</span></td>
                <td>
                  <button class="btn btn-outline btn-sm" @click="editProduct(p)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-outline btn-sm" @click="restock(p)">
                    <i class="fas fa-plus"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: FLOTA
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'fleet'">
        <div class="page-header">
          <h2><i class="fas fa-truck"></i> Gestión de Flota</h2>
          <p class="page-subtitle">Controla a tus repartidores y rutas de entrega</p>
        </div>

        <div class="dashboard-grid">
          <div class="card-panel">
            <div class="panel-header">
              <h3><i class="fas fa-users"></i> Repartidores activos</h3>
              <button class="btn btn-primary btn-sm" @click="assignRoute">
                <i class="fas fa-route"></i> Asignar ruta
              </button>
            </div>
            <div class="product-list">
              <div class="product-item" v-for="driver in drivers" :key="driver.id">
                <div class="product-left">
                  <div class="driver-avatar">{{ driver.initials }}</div>
                  <div>
                    <div class="product-name">{{ driver.name }}</div>
                    <div class="product-stock">
                      <i class="fas fa-map-marker-alt" style="color:var(--green-400)"></i> 
                      {{ driver.zone }} · {{ driver.deliveries }} entregas
                    </div>
                  </div>
                </div>
                <div class="driver-right">
                  <span class="status-badge" :class="getDriverStatusClass(driver.status)">{{ driver.status }}</span>
                  <div class="driver-rating">⭐ {{ driver.rating }}</div>
                  <button class="btn btn-outline btn-sm" @click="openChatWithDriver(driver)">
                    <i class="fas fa-comment"></i> Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card-panel">
            <div class="panel-header">
              <h3><i class="fas fa-map"></i> Mapa de entregas</h3>
              <span class="panel-badge">En vivo</span>
            </div>
            <div class="mini-map-wrap">
              <div class="mini-map-canvas">
                <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" class="map-svg">
                  <rect width="600" height="280" fill="#e8f4f0" rx="12"/>
                  <line x1="0" y1="140" x2="600" y2="140" stroke="#c5ddd8" stroke-width="10"/>
                  <line x1="300" y1="0" x2="300" y2="280" stroke="#c5ddd8" stroke-width="10"/>
                  <polyline points="80,220 200,160 300,140 410,100 520,80"
                    fill="none" stroke="#00b0a8" stroke-width="3" stroke-dasharray="8,4" opacity="0.9"/>
                  <circle cx="520" cy="80" r="10" fill="#005e59" opacity="0.9"/>
                  <text x="520" y="84" text-anchor="middle" fill="white" font-size="10">📦</text>
                  <g transform="translate(405,95)">
                    <circle r="14" fill="#00b0a8" opacity="0.95"/>
                    <text y="4" text-anchor="middle" font-size="12">🚚</text>
                  </g>
                  <rect x="60" y="200" width="40" height="30" fill="#005e59" rx="4" opacity="0.85"/>
                  <text x="80" y="219" text-anchor="middle" fill="white" font-size="10">🏭</text>
                </svg>
                <div class="map-legend">
                  <span class="legend-item"><span class="legend-dot" style="background:#00b0a8"></span>Ruta activa</span>
                  <span class="legend-item">🏭 Almacén · 📦 Destino</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: REPORTES
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'reports'">
        <div class="page-header">
          <h2><i class="fas fa-chart-bar"></i> Reportes y Análisis</h2>
          <p class="page-subtitle">Visualiza el rendimiento de tu negocio</p>
        </div>

        <div class="reports-grid">
          <div class="card-panel report-card">
            <div class="report-header">
              <h4>Ingresos: este mes vs. anterior</h4>
              <span class="report-period">Comparativo</span>
            </div>
            <div class="revenue-compare">
              <div class="revenue-now">
                <span class="revenue-amount">${{ revenueThisMonth.toFixed(2) }}</span>
                <span class="revenue-label">Este mes</span>
              </div>
              <div class="revenue-change" :class="revenueChangePercent >= 0 ? 'positive' : 'negative'">
                <i :class="revenueChangePercent >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                {{ Math.abs(revenueChangePercent) }}%
              </div>
              <div class="revenue-prev">
                <span class="revenue-amount-sm">${{ revenueLastMonth.toFixed(2) }}</span>
                <span class="revenue-label">Mes anterior</span>
              </div>
            </div>
          </div>

          <div class="card-panel report-card">
            <div class="report-header">
              <h4>Ticket promedio</h4>
              <span class="report-period">Por pedido</span>
            </div>
            <div class="avg-ticket-display">
              <span class="avg-ticket-amount">${{ averageTicket.toFixed(2) }}</span>
              <span class="avg-ticket-hint">promedio gastado por pedido</span>
            </div>
          </div>

          <div class="card-panel report-card">
            <div class="report-header">
              <h4>Ventas mensuales</h4>
              <span class="report-period">Últimos 6 meses</span>
            </div>
            <div class="report-chart">
              <div class="chart-bars">
                <div v-for="(m, i) in monthlySales" :key="i" class="chart-bar-item">
                  <div class="chart-bar" :style="{ height: (m.amount / maxMonthly * 80) + '%' }"></div>
                  <span class="chart-label">{{ m.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-panel report-card">
            <div class="report-header">
              <h4>Productos más vendidos</h4>
              <span class="report-period">Top 5</span>
            </div>
            <div class="top-products" v-if="topProducts.length > 0">
              <div v-for="(p, i) in topProducts" :key="i" class="top-product">
                <span class="top-rank">{{ i + 1 }}</span>
                <span class="top-name">{{ p.name }}</span>
                <span class="top-sales">{{ p.sales }} ventas</span>
              </div>
            </div>
            <p v-else class="report-empty-hint">Todavía no hay ventas registradas.</p>
          </div>

          <div class="card-panel report-card">
            <div class="report-header">
              <h4>Ventas por categoría</h4>
              <span class="report-period">% de ingresos</span>
            </div>
            <div class="category-bars" v-if="salesByCategory.length > 0">
              <div v-for="(c, i) in salesByCategory" :key="i" class="category-bar-row">
                <span class="category-name">{{ c.category }}</span>
                <div class="category-bar-track">
                  <div class="category-bar-fill" :style="{ width: c.percent + '%' }"></div>
                </div>
                <span class="category-percent">{{ c.percent }}%</span>
              </div>
            </div>
            <p v-else class="report-empty-hint">Todavía no hay ventas registradas.</p>
          </div>

          <div class="card-panel report-card">
            <div class="report-header">
              <h4>⚠️ Alerta de quiebre de stock</h4>
              <span class="report-period">Proyección según ritmo de venta</span>
            </div>
            <div class="stockout-list" v-if="stockoutAlerts.length > 0">
              <div v-for="p in stockoutAlerts" :key="p.id" class="stockout-item">
                <img :src="p.image" alt="" class="stockout-thumb" @error="$event.target.src='https://via.placeholder.com/32/edf7f5/005e59?text=?'" />
                <span class="stockout-name">{{ p.title }}</span>
                <span class="stockout-days" :class="p.daysRemaining <= 3 ? 'critical' : 'warning'">
                  Se agota en ~{{ p.daysRemaining }} día{{ p.daysRemaining === 1 ? '' : 's' }}
                </span>
              </div>
            </div>
            <p v-else class="report-empty-hint">Ningún producto en riesgo de agotarse pronto 👍</p>
          </div>
        </div>
      </template>


      <!-- ════════════════════════════════════════
           VISTA: MENSAJES (Chat + Mapa)
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'messages'">
        <div class="page-header">
          <h2><i class="fas fa-comment-dots"></i> Mensajes y seguimiento</h2>
          <p class="page-subtitle">Comunícate con tus repartidores y con tus clientes</p>
        </div>

        <div class="messages-tabs" style="display:flex; gap:0.5rem; margin-bottom:1rem;">
          <button
            class="btn"
            :class="messagesTab === 'drivers' ? 'btn-primary' : 'btn-outline'"
            @click="openDriversTab"
          >
            <i class="fas fa-truck"></i> Repartidores
          </button>
          <button
            class="btn"
            :class="messagesTab === 'clients' ? 'btn-primary' : 'btn-outline'"
            @click="openClientsTab"
          >
            <i class="fas fa-user"></i> Clientes
            <span v-if="clientConversations.length" class="panel-badge" style="margin-left:0.4rem;">{{ clientConversations.length }}</span>
          </button>
        </div>

        <div class="messages-layout" v-if="messagesTab === 'drivers'">
          <!-- Columna izquierda: Lista de conversaciones -->
          <div class="conversations-list">
            <div class="conversations-header">
              <h4>Conversaciones</h4>
              <span class="online-count">{{ onlineDriversCount }} en línea</span>
            </div>
            <div class="conversation-item" 
              v-for="driver in drivers" 
              :key="driver.id"
              :class="{ active: selectedChatDriver === driver.id }"
              @click="selectDriverChat(driver)"
            >
              <div class="conv-avatar">
                <span>{{ driver.initials }}</span>
                <span class="status-dot" :class="driver.status === 'Descanso' ? 'offline' : 'online'"></span>
              </div>
              <div class="conv-info">
                <div class="conv-name">{{ driver.name }}</div>
                <div class="conv-last-msg">{{ getLastMessage(driver.id) }}</div>
              </div>
              <div class="conv-time">{{ getLastTime(driver.id) }}</div>
            </div>
          </div>

          <!-- Columna derecha: Chat + Mapa -->
          <div class="chat-panel">
            <!-- Encabezado del chat -->
            <div class="chat-header" v-if="selectedDriver">
              <div class="chat-driver-info">
                <div class="chat-driver-avatar">{{ selectedDriver.initials }}</div>
                <div>
                  <div class="chat-driver-name">{{ selectedDriver.name }}</div>
                  <div class="chat-driver-status">
                    <span class="status-dot small" :class="selectedDriver.status === 'Descanso' ? 'offline' : 'online'"></span>
                    {{ selectedDriver.status }}
                  </div>
                </div>
              </div>
              <div class="chat-header-actions">
                <button class="btn btn-outline btn-sm" @click="viewDriverOnMap(selectedDriver)">
                  <i class="fas fa-map-marker-alt"></i> Ver en mapa
                </button>
              </div>
            </div>

            <!-- Mensajes -->
            <div class="chat-messages-box" ref="chatBoxMessages">
              <div 
                v-for="(msg, i) in currentChatMessages" 
                :key="i"
                class="chat-bubble"
                :class="msg.from === 'empresa' ? 'bubble-empresa' : 'bubble-driver'"
              >
                <div class="bubble-text">{{ msg.text }}</div>
                <div class="bubble-time">{{ msg.time }}</div>
              </div>
              <div class="typing-indicator" v-if="driverTyping">
                <span></span><span></span><span></span>
              </div>
            </div>

            <!-- Input -->
            <div class="chat-input">
              <input 
                v-model="chatInputMsg" 
                type="text" 
                placeholder="Escribe un mensaje..." 
                @keyup.enter="sendChatMessage"
              />
              <button class="btn btn-primary" @click="sendChatMessage" :disabled="!chatInputMsg.trim()">
                <i class="fas fa-paper-plane"></i> Enviar
              </button>
            </div>
          </div>
        </div>

        <!-- ─── Panel de chat real con clientes ─── -->
        <div class="messages-layout" v-if="messagesTab === 'clients'">
          <div class="conversations-list">
            <div class="conversations-header">
              <h4>Clientes</h4>
              <span class="online-count">{{ clientConversations.length }} conversaciones</span>
            </div>
            <p v-if="clientConversations.length === 0" style="padding:1rem; color:#8aa5a1; text-align:center;">
              Aún no tienes mensajes de clientes.
            </p>
            <div class="conversation-item"
              v-for="conv in clientConversations"
              :key="conv.clientId"
              :class="{ active: selectedClientId === conv.clientId }"
              @click="selectClientConversation(conv)"
            >
              <div class="conv-avatar">
                <span>{{ conv.clientName.slice(0, 2).toUpperCase() }}</span>
              </div>
              <div class="conv-info">
                <div class="conv-name">{{ conv.clientName }}</div>
                <div class="conv-last-msg">{{ conv.lastMessage }}</div>
              </div>
            </div>
          </div>

          <div class="chat-panel">
            <div class="chat-header" v-if="selectedClientId">
              <div class="chat-driver-info">
                <div class="chat-driver-avatar">{{ selectedClientName.slice(0, 2).toUpperCase() }}</div>
                <div>
                  <div class="chat-driver-name">{{ selectedClientName }}</div>
                </div>
              </div>
            </div>

            <div class="chat-messages-box" ref="clientChatBox">
              <p v-if="!selectedClientId" style="text-align:center; color:#8aa5a1; padding: 2rem;">
                Selecciona una conversación de la izquierda.
              </p>
              <div
                v-for="msg in clientChatMessages"
                :key="msg.id"
                class="chat-bubble"
                :class="msg.sender_role === 'empresa' ? 'bubble-empresa' : 'bubble-driver'"
              >
                <div class="bubble-text">{{ msg.text }}</div>
                <div class="bubble-time">{{ new Date(msg.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }}</div>
              </div>
            </div>

            <div class="chat-input" v-if="selectedClientId">
              <input
                v-model="clientChatInput"
                type="text"
                placeholder="Escribe un mensaje..."
                @keyup.enter="sendClientChatMessage"
                :disabled="clientChatLoading"
              />
              <button class="btn btn-primary" @click="sendClientChatMessage" :disabled="!clientChatInput.trim() || clientChatLoading">
                <i class="fas fa-paper-plane"></i> Enviar
              </button>
            </div>
          </div>
        </div>

        <!-- Mapa grande (debajo) -->
        <div class="map-large" v-if="messagesTab === 'drivers'">
          <div class="card-panel">
            <div class="panel-header">
              <h3><i class="fas fa-map"></i> Ubicación de repartidores en tiempo real</h3>
              <span class="panel-badge">Actualizado hace {{ mapUpdateSeconds }}s</span>
            </div>
            <div class="map-container">
              <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" class="map-svg-large">
                <rect width="800" height="400" fill="#e8f4f0" rx="12"/>
                <!-- Calles -->
                <line x1="0" y1="200" x2="800" y2="200" stroke="#c5ddd8" stroke-width="12"/>
                <line x1="400" y1="0" x2="400" y2="400" stroke="#c5ddd8" stroke-width="12"/>
                <line x1="0" y1="100" x2="800" y2="100" stroke="#d3e8e4" stroke-width="6"/>
                <line x1="0" y1="300" x2="800" y2="300" stroke="#d3e8e4" stroke-width="6"/>
                <line x1="200" y1="0" x2="200" y2="400" stroke="#d3e8e4" stroke-width="6"/>
                <line x1="600" y1="0" x2="600" y2="400" stroke="#d3e8e4" stroke-width="6"/>
                <!-- Rutas activas -->
                <polyline points="100,320 250,240 400,200 550,140 700,110"
                  fill="none" stroke="#00b0a8" stroke-width="4" stroke-dasharray="8,4" opacity="0.8"/>
                <polyline points="100,320 200,260 300,240 450,220"
                  fill="none" stroke="#3A7DBF" stroke-width="4" stroke-dasharray="8,4" opacity="0.8"/>
                <!-- Marcadores de repartidores con ubicaciones simuladas -->
                <g v-for="(d, index) in activeDriversForMap" :key="d.id">
                  <circle :cx="driverPositions[index].cx" :cy="driverPositions[index].cy" r="16" fill="#00b0a8" opacity="0.9"/>
                  <text :x="driverPositions[index].cx" :y="driverPositions[index].cy+5" text-anchor="middle" fill="white" font-size="12">🚚</text>
                  <text :x="driverPositions[index].cx" :y="driverPositions[index].cy-20" text-anchor="middle" fill="#005e59" font-size="10" font-weight="bold">{{ d.name }}</text>
                </g>
                <!-- Destinos -->
                <circle cx="700" cy="110" r="12" fill="#005e59" opacity="0.9"/>
                <text x="700" y="115" text-anchor="middle" fill="white" font-size="10">📦</text>
                <circle cx="450" cy="220" r="12" fill="#0B3C6D" opacity="0.9"/>
                <text x="450" y="225" text-anchor="middle" fill="white" font-size="10">📦</text>
                <!-- Almacén -->
                <rect x="80" y="290" width="50" height="40" fill="#005e59" rx="6" opacity="0.85"/>
                <text x="105" y="314" text-anchor="middle" fill="white" font-size="12">🏭</text>
                <!-- Leyenda -->
                <text x="400" y="380" text-anchor="middle" fill="#5a8a86" font-size="11" font-family="Segoe UI">Mapa de seguimiento en tiempo real — Unify</text>
              </svg>
            </div>
          </div>
        </div>
      </template>

      <!-- ════════════════════════════════════════
           VISTA: CONFIGURACIÓN
      ════════════════════════════════════════ -->
      <template v-if="currentView === 'settings'">
        <div class="settings-card">
          <h3>Foto de la empresa</h3>
          <p class="settings-hint">Este logo se muestra a los clientes en el catálogo, para que identifiquen tu empresa fácilmente.</p>
          <div class="settings-logo-wrap">
            <div class="settings-logo" :class="{ 'has-photo': companyLogoUrl }">
              <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="Logo de la empresa" />
              <span v-else>{{ companyInitials }}</span>
            </div>
            <label class="avatar-edit-btn" :class="{ uploading: logoUploading }">
              <i class="fas" :class="logoUploading ? 'fa-spinner fa-spin' : 'fa-camera'"></i>
              <input type="file" accept="image/*" @change="uploadCompanyLogo" hidden />
            </label>
          </div>
          <h4>{{ companyName }}</h4>
          <p class="settings-email">{{ companyEmail }}</p>
        </div>
      </template>

    </main>

    <footer>
      <div class="footer-content">
        <span>© 2026 Unify · Panel Empresarial</span>
        <span class="footer-version">v2.0</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { insforge } from '../insforgeClient.js'

export default {
  name: 'EmpresaDashboard',
  emits: ['switch-view'],

  data() {
    return {
      // ─── Estado global ──────────────────────────
      companyName: 'Empresa Demo',
      companyEmail: 'empresa@unify.com',
      companyId: null,
      companyLogoUrl: null,
      logoUploading: false,
      currentView: 'dashboard',
      globalSearch: '',
      searchFocused: false,
      profileMenuOpen: false,
      
      // ─── Tabs principales ──────────────────────
      mainTabs: [
        { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
        { key: 'catalog', label: 'Catálogo', icon: 'fas fa-store' },
        { key: 'orders', label: 'Pedidos', icon: 'fas fa-box', badge: '12' },
        { key: 'inventory', label: 'Inventario', icon: 'fas fa-warehouse' },
        { key: 'fleet', label: 'Flota', icon: 'fas fa-truck' },
        { key: 'messages', label: 'Mensajes', icon: 'fas fa-comment-dots' },
        { key: 'reports', label: 'Reportes', icon: 'fas fa-chart-bar' },
      ],

      // ─── Filtros ──────────────────────────────
      activeFilter: 'Todos',
      orderFilters: ['Todos', 'Pendiente', 'Enviado', 'Entregado'],
      orderSearch: '',
      orderStatusFilter: '',
      orderDateFilter: 'all',

      // ─── Catálogo ──────────────────────────────
      catalogTab: 'products',
      catalogSearch: '',
      catalogCategoryFilter: '',
      catalogStatusFilter: '',
      catalogSort: 'recent',
      catalogTabs: [
        { key: 'products',  label: 'Mis productos',    icon: 'fas fa-th-large' },
        { key: 'new',       label: 'Publicar producto', icon: 'fas fa-plus-circle' },
        { key: 'shipments', label: 'Envíos activos',   icon: 'fas fa-shipping-fast' },
      ],

      // ─── Formulario nuevo producto ──────────────
      editingProductId: null,
      uploadingImage: false,
      imageUploadError: '',
      imageUrlInput: '',
      newProduct: {
        title: '', category: '', subcategory: '', description: '',
        bullets: ['', '', ''], brand: '', sku: '',
        price: null, originalPrice: null, stock: null, minStock: 5,
        logistics: 'unify-full', weight: null, prepTime: '2',
        zones: ['San Salvador', 'Santa Ana', 'San Miguel'],
        previewImages: [],
      },

      productCategories: ['Electrónica', 'Hogar', 'Moda', 'Alimentos', 'Salud & Belleza', 'Deportes', 'Juguetes', 'Herramientas'],

      logisticsOptions: [
        {
          key: 'unify-full',
          icon: '🏭',
          title: 'Unify Full (UF)',
          desc: 'Almacenamiento, empaque y envío gestionados por Unify.',
          tags: ['Entrega rápida', 'Prime eligible', 'Devoluciones automáticas'],
          recommended: true,
        },
        {
          key: 'unify-flex',
          icon: '🏠',
          title: 'Unify Flex (UFX)',
          desc: 'Tú almacenas y preparas, Unify gestiona la logística last-mile.',
          tags: ['Tu almacén', 'Last-mile Unify', 'Rastreo GPS'],
          recommended: false,
        },
        {
          key: 'self',
          icon: '🚗',
          title: 'Envío propio',
          desc: 'Gestionas todo tú mismo: almacén, empaque, transporte.',
          tags: ['Control total', 'Tu flota', 'Sin costos logísticos'],
          recommended: false,
        },
      ],

      shippingZones: ['San Salvador', 'Santa Ana', 'San Miguel', 'Sonsonate', 'La Libertad', 'Todo el país'],

      // ─── Catálogo publicado ───────────────────────
      publishedProducts: [],

      // ─── Envíos activos ───────────────────────────
      activeShipmentsList: [
        { id: '#SHP-001', product: 'Laptop Dell XPS 13', client: 'Ana Martínez', driver: 'Carlos Martínez', driverInitials: 'CM', eta: '12 min', status: 'Enviado' },
        { id: '#SHP-002', product: 'Monitor LG 24"', client: 'Luis Pérez', driver: 'María González', driverInitials: 'MG', eta: '28 min', status: 'Enviado' },
        { id: '#SHP-003', product: 'Teclado Mecánico', client: 'José Rodríguez', driver: 'Ana Rodríguez', driverInitials: 'AR', eta: '45 min', status: 'Pendiente' },
      ],

      // ─── Dashboard ────────────────────────────────
      orders: [
        { id: '#4521', client: 'Ana Martínez', total: '$45.00', status: 'Pendiente', products: '2 productos', date: '2024-12-15' },
        { id: '#4522', client: 'Luis Pérez', total: '$128.00', status: 'Enviado', products: '1 producto', date: '2024-12-15' },
        { id: '#4523', client: 'María López', total: '$67.50', status: 'Entregado', products: '3 productos', date: '2024-12-14' },
        { id: '#4524', client: 'José Rodríguez', total: '$234.00', status: 'Pendiente', products: '4 productos', date: '2024-12-14' },
        { id: '#4525', client: 'Carmen Flores', total: '$89.00', status: 'Enviado', products: '2 productos', date: '2024-12-13' },
        { id: '#4526', client: 'Roberto Silva', total: '$312.00', status: 'Entregado', products: '5 productos', date: '2024-12-13' },
      ],

      realSalesRecords: [], // se llena desde InsForge (tabla sales) al montar — ventas reales por producto
      realReviewsRecords: [], // se llena desde InsForge (tabla reviews) al montar — reseñas reales de mis productos

      lowStockProducts: [
        { id: 1, icon: '💻', name: 'Laptop Dell XPS', stock: 3, sku: 'DELL-XPS-001' },
        { id: 2, icon: '🖥️', name: 'Monitor 24"', stock: 5, sku: 'MON-24-002' },
        { id: 3, icon: '🖱️', name: 'Mouse Inalámbrico', stock: 8, sku: 'MOU-INL-003' },
        { id: 4, icon: '⌨️', name: 'Teclado Mecánico', stock: 4, sku: 'TEC-MEC-004' },
      ],

      drivers: [
        { id: 1, initials: 'CM', name: 'Carlos Martínez', zone: 'Zona Sur', deliveries: 3, status: 'Activo', rating: '4.9' },
        { id: 2, initials: 'AR', name: 'Ana Rodríguez', zone: 'Zona Norte', deliveries: 2, status: 'Activo', rating: '4.7' },
        { id: 3, initials: 'LP', name: 'Luis Pérez', zone: 'Zona Este', deliveries: 0, status: 'Descanso', rating: '4.5' },
        { id: 4, initials: 'MG', name: 'María González', zone: 'Zona Oeste', deliveries: 4, status: 'En ruta', rating: '5.0' },
      ],

      notifications: [
        { id: 1, text: 'Pedido #4521 listo para envío', time: 'Hace 5 min', type: 'info', read: false },
        { id: 2, text: 'Stock crítico: Laptop Dell XPS (3 uds)', time: 'Hace 20 min', type: 'warning', read: false },
        { id: 3, text: 'Carlos Martínez completó 3 entregas', time: 'Hace 1 hora', type: 'success', read: true },
      ],

      // ─── Chat ──────────────────────────────────────
      selectedChatDriver: 1,
      chatInputMsg: '',
      driverTyping: false,
      mapUpdateSeconds: 0,
      messagesTab: 'drivers', // 'drivers' | 'clients'
      clientConversations: [],
      selectedClientId: null,
      selectedClientName: '',
      clientChatMessages: [],
      clientChatInput: '',
      clientChatLoading: false,
      clientChatPollInterval: null,
      conversationsPollInterval: null,
      driverChats: {
        1: [
          { from: 'driver', name: 'Carlos M.', text: 'Salí del almacén con 3 pedidos. ETA zona sur: 15 min.', time: '10:30' },
          { from: 'empresa', name: 'Empresa',  text: 'Perfecto Carlos, el pedido #SHP-001 es prioritario.', time: '10:31' },
          { from: 'driver', name: 'Carlos M.', text: 'Entendido, lo entrego primero.', time: '10:32' },
        ],
        2: [
          { from: 'driver', name: 'Ana R.',   text: 'En camino a zona norte, sin incidencias.', time: '10:45' },
          { from: 'empresa', name: 'Empresa', text: 'Bien Ana, cualquier novedad me avisas.', time: '10:46' },
        ],
        4: [
          { from: 'driver', name: 'María G.', text: 'Entregué 4 pedidos, voy por el 5to.', time: '11:00' },
          { from: 'empresa', name: 'Empresa', text: 'Excelente María, gran trabajo hoy.', time: '11:01' },
          { from: 'driver', name: 'María G.', text: 'Gracias, el 5to lo entrego en 10 min.', time: '11:02' },
        ],
      },
    }
  },

  computed: {
    todayDate() {
      return new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    },
    companyInitials() {
      return this.companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    },
    unreadCount() {
      return this.notifications.filter(n => !n.read).length
    },
    cartCount() {
      return this.orders.filter(o => o.status === 'Pendiente').length
    },
    activeOrders() {
      return this.orders.filter(o => o.status === 'Pendiente' || o.status === 'Enviado').length
    },
    lowStockCount() {
      return this.publishedProducts.filter(p => p.stock > 0 && p.stock <= 5).length
    },
    outOfStockCount() {
      return this.publishedProducts.filter(p => p.stock === 0).length
    },
    totalProducts() {
      return this.publishedProducts.length
    },
    totalStock() {
      return this.publishedProducts.reduce((a, p) => a + p.stock, 0)
    },
    filteredOrders() {
      if (this.activeFilter === 'Todos') return this.orders
      return this.orders.filter(o => o.status === this.activeFilter)
    },
    filteredOrdersFull() {
      let result = this.orders
      if (this.orderSearch) {
        const s = this.orderSearch.toLowerCase()
        result = result.filter(o => o.id.toLowerCase().includes(s) || o.client.toLowerCase().includes(s))
      }
      if (this.orderStatusFilter) {
        result = result.filter(o => o.status === this.orderStatusFilter)
      }
      if (this.orderDateFilter === 'today') {
        const today = new Date().toISOString().slice(0, 10)
        result = result.filter(o => o.date === today)
      }
      if (this.orderDateFilter === 'week') {
        result = result.slice(0, 4)
      }
      return result
    },
    sortedCatalog() {
      let result = [...this.publishedProducts]
      if (this.catalogSort === 'recent') {
        // mantener orden
      } else if (this.catalogSort === 'price-low') {
        result.sort((a, b) => a.price - b.price)
      } else if (this.catalogSort === 'price-high') {
        result.sort((a, b) => b.price - a.price)
      } else if (this.catalogSort === 'sales') {
        result.sort((a, b) => (b.sales || 0) - (a.sales || 0))
      } else if (this.catalogSort === 'rating') {
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      }
      return result
    },
    salesData() {
      // Últimos 6 días (Lun-Sáb de la semana actual), ingresos reales desde `sales`
      const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 1) // lunes de esta semana
      startOfWeek.setHours(0, 0, 0, 0)

      const days = []
      for (let i = 0; i < 6; i++) {
        const d = new Date(startOfWeek)
        d.setDate(startOfWeek.getDate() + i)
        days.push({ key: d.toDateString(), label: dayLabels[d.getDay()], amount: 0 })
      }

      this.realSalesRecords.forEach((s) => {
        const d = new Date(s.created_at)
        const bucket = days.find((day) => day.key === d.toDateString())
        if (bucket) bucket.amount += Number(s.unit_price) || 0
      })

      return days
    },
    maxSales() {
      const max = Math.max(...this.salesData.map(d => d.amount))
      return max > 0 ? max : 1 // evita dividir por 0 si aún no hay ventas esta semana
    },
    activeClientsCount() {
      return new Set(this.realSalesRecords.map((s) => s.client_id).filter(Boolean)).size
    },
    ordersThisMonthCount() {
      const now = new Date()
      const refs = this.realSalesRecords
        .filter((s) => {
          const d = new Date(s.created_at)
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        })
        .map((s) => s.order_ref)
      return new Set(refs).size
    },
    averageProductRating() {
      if (this.realReviewsRecords.length === 0) return null
      const sum = this.realReviewsRecords.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
      return sum / this.realReviewsRecords.length
    },
    stats() {
      return [
        {
          icon: '💰',
          label: 'Ventas del mes',
          value: `$${this.revenueThisMonth.toFixed(2)}`,
          color: 'var(--green-600)',
          trend: this.revenueLastMonth > 0 ? `${this.revenueChangePercent >= 0 ? '+' : ''}${this.revenueChangePercent}% vs mes anterior` : 'Sin datos del mes anterior',
          trendUp: this.revenueChangePercent >= 0,
        },
        {
          icon: '📦',
          label: 'Pedidos este mes',
          value: String(this.ordersThisMonthCount),
          color: 'var(--sky-600)',
          trend: 'Basado en ventas reales',
          trendUp: true,
        },
        {
          icon: '👥',
          label: 'Clientes activos',
          value: String(this.activeClientsCount),
          color: 'var(--green-400)',
          trend: 'Clientes distintos que te han comprado',
          trendUp: true,
        },
        {
          icon: '⭐',
          label: 'Calificación promedio',
          value: this.averageProductRating !== null ? this.averageProductRating.toFixed(1) : 'Sin calificaciones',
          color: '#f59e0b',
          trend: this.averageProductRating !== null ? 'Basado en reseñas reales' : 'Aún no tienes reseñas',
          trendUp: true,
        },
      ]
    },
    monthlySales() {
      // Últimos 6 meses (incluyendo el actual), agrupando las ventas reales por mes
      const now = new Date()
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
          key: `${d.getFullYear()}-${d.getMonth()}`,
          label: d.toLocaleDateString('es-ES', { month: 'short' }),
          amount: 0,
        })
      }
      this.realSalesRecords.forEach((s) => {
        const d = new Date(s.created_at)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        const bucket = months.find((m) => m.key === key)
        if (bucket) bucket.amount += Number(s.unit_price) || 0
      })
      return months
    },
    maxMonthly() {
      const max = Math.max(...this.monthlySales.map(d => d.amount))
      return max > 0 ? max : 1 // evita dividir por 0 en las barras si aún no hay ventas
    },
    topProducts() {
      const grouped = {}
      this.realSalesRecords.forEach((s) => {
        const name = s.product_title || 'Producto'
        grouped[name] = (grouped[name] || 0) + 1
      })
      return Object.entries(grouped)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
    },
    salesByCategory() {
      const grouped = {}
      this.realSalesRecords.forEach((s) => {
        const cat = s.category || 'Sin categoría'
        grouped[cat] = (grouped[cat] || 0) + (Number(s.unit_price) || 0)
      })
      const total = Object.values(grouped).reduce((a, b) => a + b, 0) || 1
      return Object.entries(grouped)
        .map(([category, revenue]) => ({ category, revenue, percent: Math.round((revenue / total) * 100) }))
        .sort((a, b) => b.revenue - a.revenue)
    },
    averageTicket() {
      const uniqueOrders = new Set(this.realSalesRecords.map((s) => s.order_ref))
      const totalRevenue = this.realSalesRecords.reduce((sum, s) => sum + (Number(s.unit_price) || 0), 0)
      return uniqueOrders.size > 0 ? totalRevenue / uniqueOrders.size : 0
    },
    revenueThisMonth() {
      const now = new Date()
      return this.realSalesRecords
        .filter((s) => {
          const d = new Date(s.created_at)
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        })
        .reduce((sum, s) => sum + (Number(s.unit_price) || 0), 0)
    },
    revenueLastMonth() {
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return this.realSalesRecords
        .filter((s) => {
          const d = new Date(s.created_at)
          return d.getFullYear() === lastMonth.getFullYear() && d.getMonth() === lastMonth.getMonth()
        })
        .reduce((sum, s) => sum + (Number(s.unit_price) || 0), 0)
    },
    revenueChangePercent() {
      if (this.revenueLastMonth === 0) return this.revenueThisMonth > 0 ? 100 : 0
      return Math.round(((this.revenueThisMonth - this.revenueLastMonth) / this.revenueLastMonth) * 100)
    },
    stockoutAlerts() {
      // Velocidad de venta real en los últimos 30 días, por producto
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
      const cutoff = Date.now() - THIRTY_DAYS_MS
      const soldLast30ByProduct = {}

      this.realSalesRecords.forEach((s) => {
        const t = new Date(s.created_at).getTime()
        if (t >= cutoff) {
          soldLast30ByProduct[s.product_id] = (soldLast30ByProduct[s.product_id] || 0) + 1
        }
      })

      return this.publishedProducts
        .map((p) => {
          const soldLast30 = soldLast30ByProduct[p.id] || 0
          const dailyVelocity = soldLast30 / 30
          if (dailyVelocity <= 0 || p.stock <= 0) return null
          const daysRemaining = Math.round(p.stock / dailyVelocity)
          return { ...p, daysRemaining }
        })
        .filter((p) => p && p.daysRemaining <= 14)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
    },
    weeklyTotal() { return this.salesData.reduce((a, d) => a + d.amount, 0) },
    activeShipments() { return this.activeShipmentsList.length },
    discountPercent() {
      if (!this.newProduct.originalPrice || !this.newProduct.price) return 0
      if (this.newProduct.originalPrice <= this.newProduct.price) return 0
      return Math.round((1 - this.newProduct.price / this.newProduct.originalPrice) * 100)
    },
    canPublish() {
      return this.newProduct.title && this.newProduct.category &&
             this.newProduct.description && this.newProduct.price > 0 && this.newProduct.stock >= 0
    },
    qualityChecks() {
      const p = this.newProduct
      return [
        { label: 'Título (80–200 caracteres)', check: p.title.length >= 80 },
        { label: 'Descripción (min. 100 caracteres)', check: p.description.length >= 100 },
        { label: 'Al menos 1 imagen', check: p.previewImages.length > 0 },
        { label: 'Categoría seleccionada', check: !!p.category },
        { label: 'Precio definido', check: p.price > 0 },
        { label: 'Stock mayor a 0', check: p.stock > 0 },
        { label: 'Modelo de logística elegido', check: !!p.logistics },
        { label: 'Al menos 1 punto clave', check: p.bullets.some(b => b.trim()) },
      ]
    },
    listingScore() {
      const passed = this.qualityChecks.filter(q => q.check).length
      return Math.round((passed / this.qualityChecks.length) * 100)
    },

    // ─── Búsqueda ────────────────────────────────────
    searchResults() {
      if (!this.globalSearch.trim()) return []
      const term = this.globalSearch.toLowerCase()
      const products = this.publishedProducts.filter(p => 
        p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
      )
      const orders = this.orders.filter(o => 
        o.id.toLowerCase().includes(term) || o.client.toLowerCase().includes(term)
      )
      return [...products, ...orders]
    },
    filteredProducts() {
      return this.publishedProducts.filter(p => 
        p.title.toLowerCase().includes(this.globalSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(this.globalSearch.toLowerCase())
      )
    },
    filteredOrdersSearch() {
      return this.orders.filter(o => 
        o.id.toLowerCase().includes(this.globalSearch.toLowerCase()) ||
        o.client.toLowerCase().includes(this.globalSearch.toLowerCase())
      )
    },

    // ─── Chat ──────────────────────────────────────
    selectedDriver() {
      return this.drivers.find(d => d.id === this.selectedChatDriver)
    },
    currentChatMessages() {
      return this.driverChats[this.selectedChatDriver] || []
    },
    onlineDriversCount() {
      return this.drivers.filter(d => d.status !== 'Descanso').length
    },
    activeDriversForMap() {
      return this.drivers.filter(d => d.status === 'En ruta' || d.status === 'Activo')
    },
    driverPositions() {
      // Posiciones simuladas para el mapa grande
      const positions = [
        { cx: 350, cy: 150 },
        { cx: 500, cy: 100 },
        { cx: 200, cy: 250 },
        { cx: 600, cy: 200 },
      ]
      return this.activeDriversForMap.map((d, i) => positions[i % positions.length])
    },
  },

  mounted() { 
    this.loadCompanyProfile()
    this.loadMyProducts()
    this.loadSalesData()
    this.loadReviewsData()
    document.addEventListener('click', this.closeProfileMenuOutside)
    // Simular actualización del mapa
    setInterval(() => {
      this.mapUpdateSeconds = (this.mapUpdateSeconds % 60) + 1
    }, 1000)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeProfileMenuOutside)
    if (this.conversationsPollInterval) clearInterval(this.conversationsPollInterval)
    if (this.clientChatPollInterval) clearInterval(this.clientChatPollInterval)
  },

  methods: {
    // ─── Perfil ────────────────────────────────
    async loadCompanyProfile() {
      try {
        const { data, error } = await insforge.auth.getCurrentUser()
        if (error || !data?.user) return
        const u = data.user
        this.companyEmail = u.email || 'empresa@unify.com'
        this.companyId = u.id || null

        // El nombre comercial real se guarda en company_profiles (formulario de detalles de empresa),
        // no en los metadatos del usuario de auth.
        const companyRes = await insforge.database.from('company_profiles').select('company_name, logo_url').eq('id', u.id).single()
        if (!companyRes?.error && companyRes?.data?.company_name) {
          this.companyName = companyRes.data.company_name
        } else {
          this.companyName = u.user_metadata?.full_name || u.email || 'Empresa Demo'
        }
        if (!companyRes?.error && companyRes?.data?.logo_url) {
          this.companyLogoUrl = companyRes.data.logo_url
        }
      } catch (e) { console.warn('Error cargando perfil:', e) }
    },

    // ─── Logo de la empresa (InsForge Storage) ───
    async uploadCompanyLogo(event) {
      const file = event.target.files && event.target.files[0]
      event.target.value = ''
      if (!file) return

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen.')
        return
      }
      if (file.size > 3 * 1024 * 1024) {
        alert('La imagen debe pesar menos de 3MB.')
        return
      }
      if (!this.companyId) {
        alert('Inicia sesión de nuevo para poder actualizar el logo.')
        return
      }

      this.logoUploading = true
      try {
        const ext = file.name.split('.').pop()
        const key = `companies/${this.companyId}.${ext}`

        const { data: uploadData, error: uploadError } = await insforge.storage
          .from('avatars')
          .upload(key, file)

        if (uploadError) {
          alert('No se pudo subir el logo: ' + (uploadError.message || 'error desconocido'))
          return
        }

        const rawUrl = uploadData?.url || ''
        const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${insforge.baseUrl || ''}${rawUrl}`

        const { error: dbError } = await insforge.database
          .from('company_profiles')
          .update({ logo_url: fullUrl })
          .eq('id', this.companyId)

        if (dbError) {
          alert('El logo se subió, pero no se pudo guardar: ' + (dbError.message || ''))
          return
        }

        this.companyLogoUrl = fullUrl
      } catch (err) {
        console.error('Error subiendo el logo:', err)
        alert('Ocurrió un error inesperado subiendo el logo.')
      } finally {
        this.logoUploading = false
      }
    },

    // ─── Chat real con clientes (InsForge) ───────
    openClientsTab() {
      this.messagesTab = 'clients'
      this.loadClientConversations()
      if (this.conversationsPollInterval) clearInterval(this.conversationsPollInterval)
      this.conversationsPollInterval = setInterval(() => {
        this.loadClientConversations()
      }, 5000)
    },

    openDriversTab() {
      this.messagesTab = 'drivers'
      if (this.conversationsPollInterval) {
        clearInterval(this.conversationsPollInterval)
        this.conversationsPollInterval = null
      }
      if (this.clientChatPollInterval) {
        clearInterval(this.clientChatPollInterval)
        this.clientChatPollInterval = null
      }
    },

    async loadClientConversations() {
      if (!this.companyId) return
      try {
        const { data, error } = await insforge.database
          .from('messages')
          .select('*')
          .eq('company_id', this.companyId)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('No se pudieron cargar las conversaciones:', error)
          return
        }

        // Agrupar por cliente y quedarnos con el último mensaje de cada uno
        const byClient = {}
        for (const msg of data || []) {
          if (!byClient[msg.client_id]) {
            byClient[msg.client_id] = {
              clientId: msg.client_id,
              clientName: msg.client_name || 'Cliente',
              lastMessage: msg.text,
              lastTime: msg.created_at,
            }
          }
        }
        this.clientConversations = Object.values(byClient)
      } catch (err) {
        console.warn('Error inesperado cargando conversaciones:', err)
      }
    },

    selectClientConversation(conv) {
      this.selectedClientId = conv.clientId
      this.selectedClientName = conv.clientName
      this.loadClientChatMessages()
      if (this.clientChatPollInterval) clearInterval(this.clientChatPollInterval)
      this.clientChatPollInterval = setInterval(() => {
        this.loadClientChatMessages()
      }, 4000)
    },

    async loadClientChatMessages() {
      if (!this.selectedClientId || !this.companyId) return
      try {
        const { data, error } = await insforge.database
          .from('messages')
          .select('*')
          .eq('client_id', this.selectedClientId)
          .eq('company_id', this.companyId)
          .order('created_at', { ascending: true })

        if (error) {
          console.warn('No se pudieron cargar los mensajes:', error)
          return
        }
        this.clientChatMessages = data || []
        this.$nextTick(() => {
          const box = this.$refs.clientChatBox
          if (box) box.scrollTop = box.scrollHeight
        })
      } catch (err) {
        console.warn('Error inesperado cargando mensajes:', err)
      }
    },

    async sendClientChatMessage() {
      const text = this.clientChatInput.trim()
      if (!text || !this.selectedClientId || !this.companyId) return

      this.clientChatInput = ''
      this.clientChatLoading = true
      try {
        const { error } = await insforge.database.from('messages').insert([{
          client_id: this.selectedClientId,
          client_name: this.selectedClientName,
          company_id: this.companyId,
          company_name: this.companyName,
          sender_id: this.companyId,
          sender_role: 'empresa',
          text,
        }])
        if (error) {
          alert('No se pudo enviar el mensaje: ' + (error.message || 'error desconocido'))
          return
        }
        await this.loadClientChatMessages()
        await this.loadClientConversations()
      } catch (err) {
        console.warn('Error inesperado enviando mensaje:', err)
        alert('Error inesperado enviando el mensaje.')
      } finally {
        this.clientChatLoading = false
      }
    },
    toggleProfileMenu() {
      this.profileMenuOpen = !this.profileMenuOpen
    },
    closeProfileMenuOutside(e) {
      if (!e.target.closest('.profile-menu') && !e.target.closest('.profile-dropdown')) {
        this.profileMenuOpen = false
      }
    },
    toggleNotifications() {
      this.notifications.forEach(n => n.read = true)
      alert('📬 Notificaciones: ' + this.notifications.map(n => n.text).join('\n'))
    },
    async signOut() {
      try { await insforge.auth.signOut() } catch(e) {}
      try { localStorage.removeItem('userRole') } catch(e) {}
      try { localStorage.removeItem('userRoleFor') } catch(e) {}
      this.$emit('switch-view', 'login')
    },

    // ─── Búsqueda ──────────────────────────────
    performSearch() {
      // Solo se activa el dropdown
    },
    closeSearchResults() {
      setTimeout(() => {
        this.searchFocused = false
      }, 200)
    },
    navigateTo(view, payload) {
      this.currentView = view
      if (view === 'catalog' && payload.product) {
        // Podríamos abrir detalle del producto
        alert('Producto seleccionado: ' + payload.product.title)
      } else if (view === 'orders' && payload.order) {
        // Podríamos ir al pedido
        alert('Pedido seleccionado: ' + payload.order.id)
      }
      this.globalSearch = ''
      this.searchFocused = false
    },

    // ─── Productos ──────────────────────────────
    getStars(rating) {
      const num = parseFloat(rating) || 0
      return '⭐'.repeat(Math.round(num)) + '☆'.repeat(5 - Math.round(num))
    },
    viewProductDetail(p) {
      alert(`📦 ${p.title}\nPrecio: $${p.price.toFixed(2)}\nStock: ${p.stock} uds\n⭐ ${p.rating} (${p.reviews || 0} reseñas)\nEstado: ${p.status}`)
    },
    viewProductAnalytics(p) {
      alert(`📊 Análisis de "${p.title}"\nVentas totales: ${p.sales || 0}\nRating: ${p.rating}\nStock: ${p.stock} uds`)
    },
    editProduct(p) {
      this.catalogTab = 'new'
      this.editingProductId = p.id
      this.newProduct.title = p.title || ''
      this.newProduct.category = p.category || ''
      this.newProduct.description = p.description || ''
      this.newProduct.price = p.price
      this.newProduct.stock = p.stock
      this.newProduct.previewImages = (Array.isArray(p.images) && p.images.length > 0)
        ? [...p.images]
        : (p.image ? [p.image] : [])
    },
    async toggleProductStatus(p) {
      const newStatus = p.status === 'Activo' ? 'Pausado' : 'Activo'
      const previousStatus = p.status
      p.status = newStatus // actualización optimista
      try {
        const { error } = await insforge.database.from('products').update({ status: newStatus }).eq('id', p.id)
        if (error) {
          p.status = previousStatus
          alert('No se pudo actualizar el estado del producto.')
        }
      } catch (err) {
        p.status = previousStatus
        console.warn('Error actualizando estado:', err)
      }
    },
    async deleteProductConfirm(p) {
      if (!confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return
      try {
        const { error } = await insforge.database.from('products').delete().eq('id', p.id)
        if (error) {
          alert('No se pudo eliminar el producto.')
          return
        }
        await this.loadMyProducts()
      } catch (err) {
        console.error('Error eliminando producto:', err)
        alert('Error inesperado al eliminar el producto.')
      }
    },

    // ─── Formulario ─────────────────────────────
    addBullet() {
      if (this.newProduct.bullets.length < 5) this.newProduct.bullets.push('')
    },
    removeBullet(i) {
      this.newProduct.bullets.splice(i, 1)
    },
    toggleZone(z) {
      const idx = this.newProduct.zones.indexOf(z)
      idx === -1 ? this.newProduct.zones.push(z) : this.newProduct.zones.splice(idx, 1)
    },
    triggerFileInput() {
      if (this.uploadingImage) return
      this.$refs.fileInput?.click()
    },
    async handleFileSelected(event) {
      const file = event.target.files?.[0]
      event.target.value = '' // permite volver a elegir el mismo archivo después
      if (!file) return

      this.imageUploadError = ''

      const maxSizeMb = 5
      if (file.size > maxSizeMb * 1024 * 1024) {
        this.imageUploadError = `La imagen supera el límite de ${maxSizeMb}MB.`
        return
      }
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        this.imageUploadError = 'Formato no soportado. Usa PNG, JPG o WEBP.'
        return
      }

      this.uploadingImage = true
      try {
        const path = `products/${Date.now()}-${file.name}`
        const { data, error } = await insforge.storage.from('product-images').upload(path, file)

        if (error) {
          this.imageUploadError = error.message || 'No se pudo subir la imagen. Intenta de nuevo.'
          return
        }

        if (data?.url) {
          this.newProduct.previewImages.push(data.url)
        } else {
          this.imageUploadError = 'La imagen se subió pero no se recibió una URL. Revisa el bucket en InsForge.'
        }
      } catch (err) {
        console.error('Error subiendo imagen:', err)
        this.imageUploadError = 'Error inesperado al subir la imagen.'
      } finally {
        this.uploadingImage = false
      }
    },
    addImageFromUrl() {
      const url = this.imageUrlInput.trim()
      if (!url) return
      if (!/^https?:\/\//i.test(url)) {
        this.imageUploadError = 'La URL debe comenzar con http:// o https://'
        return
      }
      this.imageUploadError = ''
      this.newProduct.previewImages.push(url)
      this.imageUrlInput = ''
    },
    addDemoImages() {
      const demos = [
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=300&h=240&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=240&fit=crop',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=300&h=240&fit=crop',
      ]
      this.newProduct.previewImages = demos
    },
    removePreviewImage(i) {
      this.newProduct.previewImages.splice(i, 1)
    },
    resetNewProduct() {
      this.editingProductId = null
      this.imageUploadError = ''
      this.imageUrlInput = ''
      this.newProduct = {
        title: '', category: '', subcategory: '', description: '',
        bullets: ['', '', ''], brand: '', sku: '',
        price: null, originalPrice: null, stock: null, minStock: 5,
        logistics: 'unify-full', weight: null, prepTime: '2',
        zones: ['San Salvador', 'Santa Ana', 'San Miguel'],
        previewImages: [],
      }
    },
    goToNewProduct() {
      this.resetNewProduct()
      this.currentView = 'catalog'
      this.catalogTab = 'new'
    },
    async loadMyProducts() {
      try {
        const { data: userData, error: userError } = await insforge.auth.getCurrentUser()
        const userId = userData?.user?.id
        if (userError || !userId) return

        const { data, error } = await insforge.database
          .from('products')
          .select('*')
          .eq('seller_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          this.publishedProducts = data
        }
      } catch (err) {
        console.warn('Error cargando productos de la empresa:', err)
      }
    },
    async loadSalesData() {
      try {
        const { data: userData, error: userError } = await insforge.auth.getCurrentUser()
        const userId = userData?.user?.id
        if (userError || !userId) return

        const { data, error } = await insforge.database
          .from('sales')
          .select('*')
          .eq('seller_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          this.realSalesRecords = data
        }
      } catch (err) {
        console.warn('Error cargando datos de ventas:', err)
      }
    },
    async loadReviewsData() {
      try {
        const { data: userData, error: userError } = await insforge.auth.getCurrentUser()
        const userId = userData?.user?.id
        if (userError || !userId) return

        const { data, error } = await insforge.database
          .from('reviews')
          .select('*')
          .eq('seller_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          this.realReviewsRecords = data
        }
      } catch (err) {
        console.warn('Error cargando reseñas:', err)
      }
    },
    async saveProduct(status) {
      try {
        const { data: userData, error: userError } = await insforge.auth.getCurrentUser()
        const userId = userData?.user?.id
        if (userError || !userId) {
          alert('No hay sesión activa. Inicia sesión de nuevo.')
          return
        }

        const payload = {
          seller_id: userId,
          seller_name: this.companyName,
          seller_logo_url: this.companyLogoUrl || null,
          title: this.newProduct.title,
          category: this.newProduct.category,
          description: this.newProduct.description,
          price: this.newProduct.price,
          stock: this.newProduct.stock,
          status,
          logistics: this.logisticsOptions.find(o => o.key === this.newProduct.logistics)?.title || '',
          image: this.newProduct.previewImages[0] || '',
          images: this.newProduct.previewImages,
        }

        let error
        if (this.editingProductId) {
          ;({ error } = await insforge.database.from('products').update(payload).eq('id', this.editingProductId))
        } else {
          payload.rating = 0
          payload.reviews = 0
          payload.sales = 0
          ;({ error } = await insforge.database.from('products').insert(payload))
        }

        if (error) {
          alert('No se pudo guardar el producto: ' + (error.message || 'error desconocido'))
          return
        }

        alert(
          status === 'Activo'
            ? `🚀 ¡"${payload.title}" publicado con éxito!`
            : '💾 Borrador guardado correctamente.'
        )
        this.resetNewProduct()
        await this.loadMyProducts()
        this.catalogTab = 'products'
      } catch (err) {
        console.error('Error guardando producto:', err)
        alert('Error inesperado al guardar el producto.')
      }
    },
    saveDraft() {
      if (!this.newProduct.title) {
        alert('Agrega al menos un título antes de guardar el borrador.')
        return
      }
      this.saveProduct('Borrador')
    },
    previewProduct() {
      alert('👁️ Abriendo vista previa del listing…')
    },
    async publishProduct() {
      if (!this.canPublish) return
      await this.saveProduct('Activo')
    },

    // ─── Pedidos ────────────────────────────────
    viewOrder(o) {
      alert(`📋 Pedido ${o.id}\nCliente: ${o.client}\nTotal: ${o.total}\nEstado: ${o.status}`)
    },
    updateOrderStatus(order, newStatus) {
      order.status = newStatus
      alert(`✅ Pedido ${order.id} actualizado a "${newStatus}"`)
    },
    getOrderStatusClass(s) {
      return { 'Pendiente': 'status-pending', 'Enviado': 'status-shipped', 'Entregado': 'status-delivered', 'Cancelado': 'status-pending' }[s] || ''
    },
    getDriverStatusClass(s) {
      return { 'Activo': 'status-delivered', 'En ruta': 'status-shipped', 'Descanso': 'status-pending' }[s] || ''
    },
    restock(p) {
      alert(`📦 Solicitando reabastecimiento: ${p.name}`)
      p.stock += 10
    },
    viewTracking(s) {
      alert(`🗺️ Abriendo mapa en tiempo real para: ${s.product}`)
      this.currentView = 'messages'
    },
    openChat(s) {
      const driver = this.drivers.find(d => d.name === s.driver)
      if (driver) {
        this.selectedChatDriver = driver.id
        this.currentView = 'messages'
      } else {
        alert('Conductor no encontrado')
      }
    },
    openChatForOrder(order) {
      // Simular asignación de un conductor al pedido
      const driver = this.drivers.find(d => d.status !== 'Descanso')
      if (driver) {
        this.selectedChatDriver = driver.id
        this.currentView = 'messages'
        alert(`💬 Abriendo chat con ${driver.name} para el pedido ${order.id}`)
      } else {
        alert('No hay conductores disponibles')
      }
    },
    openChatWithDriver(driver) {
      this.selectedChatDriver = driver.id
      this.currentView = 'messages'
    },
    assignRoute() {
      alert('🗺️ Asignador de rutas…')
    },

    // ─── Chat ────────────────────────────────────
    selectDriverChat(driver) {
      this.selectedChatDriver = driver.id
    },
    getLastMessage(driverId) {
      const msgs = this.driverChats[driverId] || []
      return msgs.length ? msgs[msgs.length - 1].text : 'Sin mensajes'
    },
    getLastTime(driverId) {
      const msgs = this.driverChats[driverId] || []
      return msgs.length ? msgs[msgs.length - 1].time : ''
    },
    viewDriverOnMap(driver) {
      alert(`📍 Mostrando ubicación de ${driver.name} en el mapa`)
    },
    sendChatMessage() {
      const msg = this.chatInputMsg.trim()
      if (!msg || !this.selectedDriver) return
      if (!this.driverChats[this.selectedChatDriver]) {
        this.$set(this.driverChats, this.selectedChatDriver, [])
      }
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      this.driverChats[this.selectedChatDriver].push({
        from: 'empresa',
        name: this.companyName,
        text: msg,
        time: now
      })
      this.chatInputMsg = ''
      this.$nextTick(() => {
        this.scrollChatToBottom()
      })
      // Simular respuesta del driver
      this.driverTyping = true
      setTimeout(() => {
        this.driverTyping = false
        const replies = [
          'Recibido, lo reviso ahora mismo ✅',
          'Entendido, en camino con el pedido.',
          'Ok, cualquier novedad te aviso.',
          'Confirmado, entrega en 15 min.',
        ]
        const reply = replies[Math.floor(Math.random() * replies.length)]
        const driverName = this.selectedDriver.name.split(' ')[0]
        this.driverChats[this.selectedChatDriver].push({
          from: 'driver',
          name: driverName,
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        this.$nextTick(() => {
          this.scrollChatToBottom()
        })
      }, 1500)
    },
    scrollChatToBottom() {
      const box = this.$refs.chatBoxMessages
      if (box) box.scrollTop = box.scrollHeight
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
  --green-500: #009e96;
  --green-600: #005e59;
  --green-700: #003d39;
  --sky-100: #cce8f0;
  --sky-300: #6ab4d4;
  --sky-400: #3A7DBF;
  --sky-500: #2060a8;
  --sky-600: #0B3C6D;
  --text-dark: #0d1f1e;
  --text-mid: #1e4a47;
  --text-muted: #5a8a86;
  --border: rgba(0,94,89,0.12);
  --shadow-sm: 0 2px 12px rgba(0,94,89,0.08);
  --shadow-md: 0 8px 32px rgba(0,94,89,0.12);
  --radius-md: 14px;
  --radius-lg: 22px;
}

/* ── Reset / Base ──────────────────────────── */
* { box-sizing: border-box; }
.app-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--off-white);
  min-height: 100vh;
}

/* ══════════════════════════════════════════
   HEADER MARKETPLACE (sin cambios, añadir search-results)
══════════════════════════════════════════ */
.market-header {
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(10px);
  padding: 0.8rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 1rem;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
.logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  object-fit: cover;
}
.market-header h1 {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #005e59 0%, #00ab91 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-left: 40px;
}
.market-header h1 span { 
  background: linear-gradient(135deg, #0B3C6D 0%, #3A7DBF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.header-role-tag {
  font-size: 0.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400)) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  color: transparent !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-left: 2px;
  vertical-align: middle;
}

/* ── Búsqueda ──────────────────────────────── */
.header-search {
  flex: 1;
  max-width: 500px;
  display: flex;
  align-items: center;
  background: var(--bg-light);
  border-radius: 40px;
  padding: 0.4rem 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}
.header-search:focus-within {
  border-color: var(--green-400);
  background: white;
  box-shadow: 0 0 0 4px rgba(0,176,168,0.1);
}
.header-search i {
  color: var(--text-muted);
  font-size: 0.9rem;
}
.header-search input {
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  flex: 1;
  background: transparent;
  padding: 0.3rem 0.7rem;
}
.search-shortcut {
  font-size: 0.65rem;
  color: var(--text-muted);
  background: var(--off-white);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid var(--border);
}

/* ── Resultados de búsqueda ──────────────────── */
.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
  padding: 0.5rem 0;
}
.search-result-group {
  padding: 0.25rem 0;
}
.result-group-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0.25rem 1rem;
  font-weight: 700;
}
.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.search-result-item:hover {
  background: var(--green-50);
}
.result-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}
.result-icon {
  font-size: 1.2rem;
  color: var(--sky-400);
  width: 36px;
  text-align: center;
}
.result-info {
  flex: 1;
}
.result-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dark);
}
.result-detail {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.search-result-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ── Header Right ───────────────────────────── */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}
.notif-bell, .cart-icon {
  position: relative;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  transition: background 0.2s;
  font-size: 1.1rem;
  color: var(--text-mid);
}
.notif-bell:hover, .cart-icon:hover { background: var(--green-50); }
.notif-badge, .cart-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-badge { background: var(--sky-600); }

.profile-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem 0.3rem 0.3rem;
  border-radius: 40px;
  transition: background 0.2s;
  border: 1px solid transparent;
}
.profile-menu:hover {
  background: var(--green-50);
  border-color: var(--border);
}
.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
  overflow: hidden;
}
.avatar-circle.has-photo { background: var(--bg-light); }
.avatar-circle img {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  max-width: 32px;
  max-height: 32px;
  object-fit: cover;
  display: block;
}
.profile-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-dark);
}
.profile-menu i {
  font-size: 0.7rem;
  color: var(--text-muted);
  transition: transform 0.2s;
}
.profile-menu i.rotated { transform: rotate(180deg); }

.profile-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  padding: 0.5rem 0;
  min-width: 240px;
  z-index: 200;
  animation: slideDown 0.2s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
}
.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  overflow: hidden;
}
.dropdown-avatar.has-photo { background: var(--bg-light); }
.dropdown-avatar img {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  max-width: 40px;
  max-height: 40px;
  object-fit: cover;
  display: block;
}

/* ── Configuración (logo de la empresa) ───────── */
.settings-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--border);
  max-width: 420px;
  margin: 0 auto;
}
.settings-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
.settings-logo-wrap {
  position: relative;
  width: 100px;
  margin: 0 auto 1rem;
}
.settings-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  font-size: 2.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.settings-logo.has-photo { background: var(--bg-light); }
.settings-logo img {
  width: 100px;
  height: 100px;
  min-width: 100px;
  min-height: 100px;
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
  display: block;
}
.settings-email {
  color: var(--text-muted);
  font-size: 0.85rem;
}
.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--sky-600);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: var(--shadow-md);
}
.avatar-edit-btn.uploading {
  pointer-events: none;
  opacity: 0.7;
}
.dropdown-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-dark);
}
.dropdown-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 0.3rem 0;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-mid);
  transition: background 0.15s;
}
.dropdown-item:hover { background: var(--green-50); }
.dropdown-item i { width: 18px; color: var(--text-muted); }
.dropdown-item.logout { color: #ef4444; }
.dropdown-item.logout i { color: #ef4444; }

/* ══════════════════════════════════════════
   SUB NAVEGACIÓN
══════════════════════════════════════════ */
.sub-nav {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 0 2rem;
  overflow-x: auto;
}
.sub-nav-inner {
  display: flex;
  gap: 0.25rem;
  max-width: 1200px;
  margin: 0 auto;
}
.sub-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}
.sub-nav-btn:hover { color: var(--text-dark); }
.sub-nav-btn.active {
  color: var(--sky-600);
  border-bottom-color: var(--sky-600);
}
.sub-nav-btn i { font-size: 0.9rem; }
.tab-badge {
  background: var(--sky-600);
  color: white;
  font-size: 0.6rem;
  padding: 0.05rem 0.5rem;
  border-radius: 40px;
  font-weight: 700;
}

/* ══════════════════════════════════════════
   CONTENIDO PRINCIPAL (igual que antes)
══════════════════════════════════════════ */
.dashboard-container {
  padding: 1.5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
.profile-header {
  background: linear-gradient(135deg, var(--sky-600) 0%, var(--green-600) 100%);
  border-radius: var(--radius-lg);
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.welcome-sub {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
  margin-bottom: 0.3rem;
}
.profile-info h2 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
}
.welcome-desc { font-size: 0.85rem; opacity: 0.75; }
.header-right-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.alert-pill {
  background: rgba(255,193,7,0.25);
  border: 1px solid rgba(255,193,7,0.5);
  color: #fef08a;
  padding: 0.4rem 0.9rem;
  border-radius: 40px;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.stat-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: 700; margin-bottom: 0.2rem; }
.stat-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.stat-trend {
  font-size: 0.72rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.trend-up { color: var(--green-500); }
.trend-down { color: #ef4444; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.card-panel {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.panel-header h3 {
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}
.panel-badge {
  font-size: 0.72rem;
  background: var(--green-50);
  color: var(--green-600);
  padding: 0.25rem 0.75rem;
  border-radius: 40px;
  font-weight: 600;
}
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-tab {
  padding: 0.28rem 0.8rem;
  border-radius: 40px;
  border: 1px solid var(--border);
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  color: var(--text-muted);
}
.filter-tab:hover { background: var(--green-50); color: var(--green-600); }
.filter-tab.active {
  background: var(--sky-600);
  color: white;
  border-color: var(--sky-600);
}
.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.order-table th, .order-table td {
  padding: 0.7rem 0.6rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.order-table th {
  background: var(--green-50);
  color: var(--green-600);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.order-table tr:last-child td { border-bottom: none; }
.order-table tr:hover td { background: #f9fffe; }
.order-id {
  font-weight: 700;
  color: var(--sky-600);
  font-size: 0.82rem;
}
.order-total {
  font-weight: 600;
  color: var(--green-600);
}
.status-badge {
  display: inline-block;
  padding: 0.18rem 0.65rem;
  border-radius: 40px;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}
.status-pending { background: #fef3c7; color: #d97706; }
.status-delivered { background: var(--green-50); color: var(--green-600); }
.status-shipped { background: var(--sky-100); color: var(--sky-600); }

.weekly-total {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--green-600);
  margin-bottom: 1rem;
}
.weekly-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 6px;
}
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  color: var(--text-muted);
}
.bar-amount { font-weight: 600; color: var(--text-dark); }
.bar-track {
  height: 10px;
  background: var(--green-50);
  border-radius: 5px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green-400), var(--sky-400));
  border-radius: 5px;
  transition: width 0.6s ease;
}
.bar-best { background: linear-gradient(90deg, var(--sky-400), var(--sky-600)); }
.bar-ok { background: linear-gradient(90deg, var(--green-400), var(--sky-400)); }
.bar-danger { background: linear-gradient(90deg, #f59e0b, #ef4444); }

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.product-thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}
.stock-low { color: #d97706; font-weight: 600; }
.stock-critical { color: #ef4444; font-weight: 700; }

.driver-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.78rem;
  flex-shrink: 0;
}
.driver-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.driver-rating { font-size: 0.72rem; color: var(--text-muted); }
.product-list {
  display: flex;
  flex-direction: column;
}
.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border);
  gap: 1rem;
}
.product-item:last-child { border-bottom: none; }
.product-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}
.product-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-stock {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
.btn-primary {
  background: linear-gradient(135deg, var(--sky-600) 0%, var(--sky-400) 100%);
  color: white;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(11,60,109, 0.3);
}
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
}
.btn-outline:hover {
  background: var(--green-50);
  border-color: var(--green-400);
  color: var(--green-600);
}
.btn-sm { padding: 0.3rem 0.75rem; font-size: 0.78rem; }

/* ══════════════════════════════════════════
   CATÁLOGO (igual que antes)
══════════════════════════════════════════ */
.catalog-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.catalog-tabs {
  display: flex;
  gap: 0.5rem;
}
.ctab {
  padding: 0.5rem 1.1rem;
  border-radius: 40px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  font-weight: 600;
}
.ctab:hover { border-color: var(--green-400); color: var(--green-600); background: var(--green-50); }
.ctab.active {
  background: var(--sky-600);
  color: white;
  border-color: var(--sky-600);
}
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
.search-wrap i { color: var(--text-muted); }
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
.published-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}
.pub-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.25s;
  cursor: pointer;
}
.pub-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.pub-img-wrap {
  position: relative;
  height: 190px;
  background: var(--bg-light);
  overflow: hidden;
}
.pub-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pub-status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.2rem 0.65rem;
  border-radius: 40px;
  font-size: 0.68rem;
  font-weight: 700;
}
.pstatus-activo { background: #dcfce7; color: #16a34a; }
.pstatus-pausado { background: #fef3c7; color: #d97706; }
.pstatus-borrador { background: #f1f5f9; color: #64748b; }
.pub-actions-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  opacity: 0;
  transition: opacity 0.25s;
}
.pub-card:hover .pub-actions-overlay { opacity: 1; }
.overlay-btn {
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-dark);
}
.overlay-btn:hover { background: white; transform: scale(1.05); }
.pub-body { padding: 1rem; }
.pub-category {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
.pub-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-dark);
  margin-bottom: 0.35rem;
  line-height: 1.35;
}
.pub-price {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--green-600);
  margin-bottom: 0.3rem;
}
.pub-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}
.stars { color: #f59e0b; font-size: 0.85rem; }
.rating-count { font-size: 0.72rem; color: var(--text-muted); }
.pub-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}
.pub-logistics { margin-bottom: 0.5rem; }
.logistics-chip {
  font-size: 0.72rem;
  padding: 0.22rem 0.65rem;
  border-radius: 40px;
  font-weight: 600;
}
.log-unify-full { background: var(--green-50); color: var(--green-600); }
.log-unify-flex { background: var(--sky-100); color: var(--sky-600); }
.log-envío-propio { background: #fef3c7; color: #d97706; }

/* ══════════════════════════════════════════
   FORMULARIO DE PUBLICACIÓN (igual que antes)
══════════════════════════════════════════ */
.publish-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}
.publish-form-col { display: flex; flex-direction: column; gap: 1.5rem; }
.step-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.step-badge {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}
.step-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.25rem;
}
.step-desc { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-label { font-size: 0.82rem; font-weight: 600; color: var(--text-mid); }
.required { color: #ef4444; }
.form-input {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.9rem;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text-dark);
  background: white;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input:focus {
  outline: none;
  border-color: var(--green-400);
  box-shadow: 0 0 0 3px rgba(0,176,168,0.1);
}
.form-textarea {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.9rem;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text-dark);
  background: white;
  transition: border-color 0.2s;
  width: 100%;
  resize: vertical;
}
.form-textarea:focus {
  outline: none;
  border-color: var(--green-400);
  box-shadow: 0 0 0 3px rgba(0,176,168,0.1);
}
.char-count { font-size: 0.7rem; color: var(--text-muted); text-align: right; }
.char-over { color: #ef4444; }
.seo-ok { color: var(--green-500); font-weight: 600; margin-left: 6px; }
.bullet-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem; }
.bullet-item { display: flex; align-items: center; gap: 0.5rem; }
.bullet-dot { color: var(--green-400); font-weight: 700; font-size: 1.1rem; }
.bullet-input { flex: 1; }
.btn-icon-remove {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 0 4px;
}
.btn-icon-remove:hover { color: #ef4444; }
.mt-sm { margin-top: 0.5rem; }
.image-upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--off-white);
}
.image-upload-zone:hover {
  border-color: var(--green-400);
  background: var(--green-50);
}
.image-upload-zone.uploading {
  cursor: wait;
  opacity: 0.7;
}
.image-upload-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin: 0.5rem 0 0;
}
.image-url-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.image-url-row .form-input {
  flex: 1;
}
.btn-link-demo {
  display: inline-block;
  margin-top: 0.75rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.78rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}
.upload-inner { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.upload-icon { font-size: 2.5rem; }
.upload-title { font-weight: 600; color: var(--text-mid); font-size: 0.95rem; }
.upload-hint { font-size: 0.75rem; color: var(--text-muted); }
.image-preview-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.img-thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--border);
}
.img-thumb img { width: 100%; height: 100%; object-fit: cover; }
.img-main-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,94,89,0.8);
  color: white;
  font-size: 0.55rem;
  text-align: center;
  padding: 2px;
}
.img-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0,0,0,0.55);
  border: none;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.input-prefix-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-prefix {
  position: absolute;
  left: 10px;
  font-weight: 700;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.input-with-prefix { padding-left: 1.5rem; }
.discount-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: -0.5rem 0 1rem;
}
.discount-badge {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.28rem 0.75rem;
  border-radius: 40px;
}
.discount-text { font-size: 0.8rem; color: var(--text-muted); }
.logistics-options { display: flex; flex-direction: column; gap: 0.75rem; }
.logistics-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.logistics-option:hover { border-color: var(--green-400); background: var(--green-50); }
.logistics-option.selected {
  border-color: var(--sky-600);
  background: rgba(11,60,109,0.04);
}
.lo-radio {
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.logistics-option.selected .lo-radio { border-color: var(--sky-600); }
.lo-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sky-600);
}
.lo-icon { font-size: 1.6rem; }
.lo-body { flex: 1; }
.lo-title { font-weight: 700; font-size: 0.92rem; color: var(--text-dark); margin-bottom: 0.25rem; }
.lo-desc { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.5rem; }
.lo-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.lo-tag {
  font-size: 0.65rem;
  background: var(--sky-100);
  color: var(--sky-600);
  padding: 0.15rem 0.5rem;
  border-radius: 40px;
  font-weight: 600;
}
.lo-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--green-400);
  color: white;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 40px;
}
.shipping-zones { margin-top: 1rem; }
.zone-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.zone-chip {
  padding: 0.3rem 0.8rem;
  border-radius: 40px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  color: var(--text-muted);
}
.zone-chip.active {
  background: var(--sky-600);
  color: white;
  border-color: var(--sky-600);
}
.publish-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.publish-preview-col {
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.preview-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.listing-preview {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.lp-img-wrap {
  position: relative;
  background: var(--bg-light);
}
.lp-main-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
.lp-discount-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #dc2626;
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 40px;
}
.lp-body { padding: 1rem; }
.lp-brand {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.3rem;
}
.lp-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  line-height: 1.35;
}
.lp-rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  color: #f59e0b;
}
.lp-rating-count { color: var(--text-muted); font-size: 0.75rem; }
.lp-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.lp-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--green-600);
}
.lp-original {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-decoration: line-through;
}
.lp-bullets {
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.lp-bullet {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--text-mid);
}
.lp-bullet-dot { color: var(--green-400); font-weight: 700; flex-shrink: 0; }
.lp-logistics {
  font-size: 0.78rem;
  color: var(--sky-600);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.lp-zones {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.btn-buy {
  width: 100%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-buy:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(11,60,109,0.3);
}
.quality-card {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  padding: 1.2rem;
  box-shadow: var(--shadow-sm);
}
.qc-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.qc-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.78rem;
}
.qc-ok { color: var(--green-500); font-weight: 700; }
.qc-fail { color: var(--text-muted); }
.qc-label-ok { color: var(--text-dark); }
.qc-label-fail { color: var(--text-muted); }
.qc-score { margin-top: 1rem; }
.qc-score-num {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--green-600);
  margin-top: 0.3rem;
}

/* ══════════════════════════════════════════
   REPORTES (igual que antes)
══════════════════════════════════════════ */
.reports-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.report-header h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-dark);
}
.report-period {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--green-50);
  padding: 0.2rem 0.6rem;
  border-radius: 40px;
}
.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 160px;
  gap: 0.5rem;
  padding: 0.5rem 0;
}
.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
}
.chart-bar {
  width: 30px;
  max-width: 40px;
  background: linear-gradient(180deg, var(--sky-400), var(--sky-600));
  border-radius: 4px 4px 0 0;
  min-height: 8px;
  transition: height 0.5s ease;
}
.chart-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.4rem;
}
.top-products { display: flex; flex-direction: column; gap: 0.5rem; }
.top-product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  background: var(--off-white);
}
.top-rank {
  font-weight: 700;
  color: var(--sky-600);
  font-size: 0.8rem;
  width: 24px;
  text-align: center;
}
.top-name { flex: 1; font-weight: 500; font-size: 0.88rem; }
.top-sales {
  font-size: 0.78rem;
  color: var(--text-muted);
  background: white;
  padding: 0.1rem 0.5rem;
  border-radius: 40px;
}

.report-empty-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem 0;
}

/* ── Ingresos: este mes vs. anterior ── */
.revenue-compare {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0 1rem;
}
.revenue-now, .revenue-prev {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.revenue-amount {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-dark);
}
.revenue-amount-sm {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-muted);
}
.revenue-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}
.revenue-change {
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.revenue-change.positive { background: #dcfce7; color: #16a34a; }
.revenue-change.negative { background: #fee2e2; color: #dc2626; }

/* ── Ticket promedio ── */
.avg-ticket-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.2rem 0;
}
.avg-ticket-amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--green-600, #059669);
}
.avg-ticket-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
}

/* ── Ventas por categoría ── */
.category-bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.category-bar-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.category-name {
  font-size: 0.8rem;
  width: 90px;
  flex-shrink: 0;
  color: var(--text-dark);
}
.category-bar-track {
  flex: 1;
  height: 10px;
  background: var(--off-white);
  border-radius: 20px;
  overflow: hidden;
}
.category-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-400), var(--sky-600));
  border-radius: 20px;
  transition: width 0.5s ease;
}
.category-percent {
  font-size: 0.75rem;
  color: var(--text-muted);
  width: 34px;
  text-align: right;
}

/* ── Alerta de quiebre de stock ── */
.stockout-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.stockout-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.5rem;
  border-radius: 8px;
  background: var(--off-white);
}
.stockout-thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}
.stockout-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
}
.stockout-days {
  font-size: 0.72rem;
  padding: 0.2rem 0.6rem;
  border-radius: 40px;
  white-space: nowrap;
}
.stockout-days.warning { background: #fef3c7; color: #92400e; }
.stockout-days.critical { background: #fee2e2; color: #dc2626; }


/* ══════════════════════════════════════════
   ORDERS FILTERS (igual que antes)
══════════════════════════════════════════ */
.orders-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

/* ══════════════════════════════════════════
   INVENTORY STATS (igual que antes)
══════════════════════════════════════════ */
.inventory-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.inv-stat {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.2rem;
  text-align: center;
  border: 1px solid var(--border);
}
.inv-stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--sky-600);
}
.inv-stat-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

/* ══════════════════════════════════════════
   MAPA MINI (para flota)
══════════════════════════════════════════ */
.mini-map-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.mini-map-canvas {
  background: var(--bg-light);
  position: relative;
}
.map-svg { width: 100%; height: auto; display: block; }
.map-legend {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.9);
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ══════════════════════════════════════════
   MENSAJES (NUEVO)
══════════════════════════════════════════ */
.messages-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  min-height: 500px;
}
.conversations-list {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.conversations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-light);
}
.conversations-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-dark);
}
.online-count {
  font-size: 0.75rem;
  color: var(--green-600);
  background: var(--green-50);
  padding: 0.2rem 0.6rem;
  border-radius: 40px;
}
.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.2rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid var(--border);
}
.conversation-item:hover { background: var(--green-50); }
.conversation-item.active { background: var(--sky-100); }
.conv-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}
.status-dot.online { background: #4caf50; }
.status-dot.offline { background: #bdbdbd; }
.status-dot.small { width: 8px; height: 8px; border-width: 1px; position: static; display: inline-block; margin-right: 4px; }
.conv-info {
  flex: 1;
  min-width: 0;
}
.conv-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-dark);
}
.conv-last-msg {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-time {
  font-size: 0.65rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* Panel de chat */
.chat-panel {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-light);
}
.chat-driver-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.chat-driver-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sky-600), var(--sky-400));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.chat-driver-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-dark);
}
.chat-driver-status {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}
.chat-header-actions {
  display: flex;
  gap: 0.5rem;
}
.chat-messages-box {
  flex: 1;
  padding: 1rem 1.2rem;
  overflow-y: auto;
  min-height: 300px;
  max-height: 380px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #fafffe;
}
.chat-bubble {
  max-width: 80%;
  padding: 0.6rem 1rem;
  border-radius: 16px;
  font-size: 0.85rem;
  line-height: 1.4;
  position: relative;
  word-wrap: break-word;
}
.bubble-empresa {
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
.bubble-empresa .bubble-time { color: rgba(255,255,255,0.7); }
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
  padding: 1rem 1.2rem;
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
.chat-input input:focus { border-color: var(--green-400); }

/* Mapa grande */
.map-large {
  margin-top: 1.5rem;
}
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

/* ══════════════════════════════════════════
   FOOTER
══════════════════════════════════════════ */
footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 1.5rem 2rem;
  margin-top: 2rem;
}
.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.8rem;
}
.footer-version {
  font-weight: 600;
  color: var(--green-400);
}

/* ══════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════ */
.mt-sm { margin-top: 0.5rem; }
.mt-md { margin-top: 1rem; }
.ml-xs { margin-left: 0.3rem; }

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 1100px) {
  .publish-layout { grid-template-columns: 1fr; }
  .publish-preview-col { position: static; }
  .reports-grid { grid-template-columns: 1fr; }
  .messages-layout { grid-template-columns: 1fr; }
}
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .inventory-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .market-header { padding: 0.8rem 1rem; flex-wrap: wrap; }
  .header-search { max-width: 100%; order: 3; flex-basis: 100%; }
  .header-right { gap: 0.4rem; }
  .profile-name { display: none; }
  .sub-nav { padding: 0 0.5rem; }
  .sub-nav-btn { padding: 0.5rem 0.8rem; font-size: 0.75rem; }
  .sub-nav-btn span { display: none; }
  .profile-header { flex-direction: column; text-align: center; }
  .header-right-actions { justify-content: center; }
  .dashboard-container { padding: 1rem; }
  .form-row { grid-template-columns: 1fr; }
  .catalog-tabs { flex-wrap: wrap; }
  .catalog-search-bar { flex-direction: column; }
  .catalog-filters { width: 100%; }
  .catalog-filters .sel { flex: 1; }
  .published-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
  .publish-actions { flex-direction: column; align-items: stretch; }
  .messages-layout { grid-template-columns: 1fr; }
  .conversations-list { max-height: 200px; overflow-y: auto; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .published-grid { grid-template-columns: 1fr; }
  .inventory-stats { grid-template-columns: 1fr 1fr; }
}
</style>