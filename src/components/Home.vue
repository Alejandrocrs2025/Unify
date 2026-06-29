<template>
  <div>
    <div class="hero-blob"></div>
    <div class="hero-blob2"></div>

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="container">
        <img src="/img/logo-unify.png" alt="logo" class="logo_Unify" />
        <a href="#" class="nav-logo"><span>U</span>nify</a>
        <ul class="nav-links">
          <li><a href="#modulos">Módulos</a></li>
          <li><a href="#tracking">Monitoreo</a></li>
          <li><a href="#testimonios">Testimonios</a></li>
          <li><a href="#social">Redes</a></li>
        </ul>
        <div class="nav-actions">
          <button v-if="loggedIn" type="button" class="btn btn-ghost" @click="signOut">Cerrar sesión</button>
          <button v-else type="button" class="btn btn-ghost" @click="goToLogin">Iniciar sesión</button>
          <button type="button" class="btn btn-primary" @click="goToRegister">Comenzar gratis</button>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-left">
        <div class="hero-eyebrow fade-up">
          <span class="tag tag-green">✦ Solución para empresas</span>
        </div>
        <div v-if="userRole" class="welcome-message" style="margin-bottom:1rem;">
          <strong>¡Bienvenido, {{ userRole }}!</strong>
        </div>
        <h1 class="hero-title fade-up delay-1">
          Centraliza,<br />
          <span class="accent-green">optimiza</span> y<br />
          <span class="accent-sky">crece sin limites</span>
        </h1>
        <p class="hero-desc fade-up delay-2">
          Unify Empresas: logística, entregas y comunicación directa con distribuidores.
          Centraliza cada operación en una plataforma diseñada para crecer.
        </p>
        <div class="hero-actions fade-up delay-3">
          <button type="button" class="btn btn-primary" @click="goToRegister">Solicitar demo →</button>
          <a href="#tracking" class="btn btn-outline">Ver monitoreo en vivo</a>
        </div>
        <div class="hero-social-proof fade-up delay-4">
          <div class="avatars">
            <img src="https://pbs.twimg.com/profile_images/1273327825471320069/CIavLpX4.png" alt="" />
            <img src="https://scontent-mia5-1.xx.fbcdn.net/v/t39.30808-6/481260247_23884307454491664_597946207221116949_n.jpg?stp=dst-jpg_tt6&cstp=mx400x400&ctp=s400x400&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=APd5tAb17uAQ7kNvwFKYIkc&_nc_oc=AdrH2Hbz1WuhLmUW6fhNNo43z0RFOBNxvwkoCEO5Fu2mNhQlXzB_1YQIWM-1W_5n7So&_nc_zt=23&_nc_ht=scontent-mia5-1.xx&_nc_gid=9LZFfiFbDbdklpwV-JM3bA&_nc_ss=7b289&oh=00_Af-4txs4iRT63x4F-Kv1qkxNTpJ8iZPujVGwzmqwxV51TA&oe=6A3E42C9" alt="" />
            <img src="https://scontent-mia3-2.xx.fbcdn.net/v/t39.30808-6/710079301_122201271584448334_6278234518965118189_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s2048x2048&_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=XcxNwpIWMHsQ7kNvwFjRK8h&_nc_oc=AdpSqk3Ng1ZiTxxoYKEuERFriFXDkktB7d0z7XIq9nzJGoq0B9COgki3XlwUFCZKlY4&_nc_zt=23&_nc_ht=scontent-mia3-2.xx&_nc_gid=Ef_SM3_fun4TfvuaNN7MRg&_nc_ss=7b289&oh=00_Af_nbR_7bxYxUO9rEYwokGrqcDaopE2wyL_0YSeEyOSJ1Q&oe=6A3E51D5" alt="" />
          </div>
          <p class="proof-text"><strong>+180 empresas</strong><br />optimizan su distribución con Unify</p>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hero-img-wrap">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=1100&fit=crop" alt="Equipo logístico" />
        </div>
        <div class="float-card float-card-1">
          <div class="fc-icon g">📊</div>
          <div>
            <div class="fc-label">Entregas exitosas hoy</div>
            <div class="fc-val">+342</div>
          </div>
        </div>
        <div class="float-card float-card-2">
          <div class="fc-icon s">🚛</div>
          <div>
            <div class="fc-label">Flota activa</div>
            <div class="fc-val">28 unidades</div>
          </div>
        </div>
      </div>
    </section>

    <!-- LOGOS STRIP -->
    <div class="logos-strip">
      <div class="logos-inner">
        <span class="logos-label">Confían en Unify</span>
        <div class="logo-items">
          <span class="logo-item">La Constancia</span>
          <span class="logo-item">DIANA</span>
          <span class="logo-item">Pan Sinaí</span>
          <span class="logo-item">Quesos de Metapán</span>
        </div>
      </div>
    </div>

    <!-- MÓDULOS -->
    <section class="features" id="modulos">
      <div class="container">
        <div class="section-header">
          <span class="tag tag-sky">✦ Funcionalidades</span>
          <h2>Todo lo que necesita<br />tu empresa de logística</h2>
          <p>Control de flota, rutas, inventario y análisis predictivo.</p>
        </div>
        <div class="features-grid">
          <div class="feat-big">
            <div class="feat-big-content">
              <div>
                <div class="feat-icon-wrap fi-green" style="margin-bottom:1.2rem">📊</div>
                <h3>Analítica de entregas</h3>
                <p style="font-size:.9rem;color:var(--text-muted)">
                  Integración de tablas analíticas para tener un registro de tus ventas con datos en tiempo real.
                </p>
              </div>
              <a href="#" class="feat-link">Explorar dashboards →</a>
            </div>
            <div class="feat-big-img">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" alt="dashboard" />
            </div>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap fi-sky">📦</div>
            <h3>Inventario Corporativo</h3>
            <p>Control multi-almacén, alertas y reposición automática.</p>
            <a href="#" class="feat-link">Ver más →</a>
          </div>
          <div class="feat-card">
            <div class="feat-icon-wrap fi-green">🚛</div>
            <h3>Supervisión de Unidades</h3>
            <p>Asigna vehículos, monitorea rutas y rendimiento de entregas.</p>
            <a href="#" class="feat-link">Ver más →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- TRACKING: MAPA + CHAT -->
    <section class="tracking-section" id="tracking">
      <div class="container">
        <div class="section-header">
          <span class="tag tag-green">✦ Monitoreo en vivo</span>
          <h2>Seguimiento de entregas<br />y contacto directo</h2>
          <p>Mapa interactivo con ubicación del distribuidor + chat con el cliente.</p>
        </div>
        <div class="tracking-grid">
          <!-- Mapa -->
          <div class="map-card">
            <h3>🗺 Rastreo de envíos en tiempo real</h3>
            <div id="deliveryMap"></div>
            <div class="order-status">
              <span>🚚 Pedido #UNI-4521 • Entregando a: Almacén Central</span>
              <span class="tracking-badge">En ruta - 85%</span>
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">
              El cliente puede ver el trayecto del distribuidor y la ubicación aproximada.
            </p>
          </div>

          <!-- Chat -->
          <div class="chat-card">
            <h3>💬 Contacto directo: Distribuidor ↔ Cliente</h3>
            <p style="font-size:0.85rem">Comunicación inmediata para coordinar entregas, incidencias o cambios de ruta.</p>
            <div class="contact-distributor">
              <div class="distributor-item">
                <div>
                  <strong>Carlos (Distribuidor zona sur)</strong><br />
                  <span style="font-size:0.7rem;">📞 +503 7012-3456 | ✉️ carlos@unify.com</span>
                </div>
                <button class="btn btn-sky" style="padding:0.4rem 1rem;">Contactar</button>
              </div>
              <div class="distributor-item">
                <div>
                  <strong>Empresa Unify Control</strong><br />
                  <span style="font-size:0.7rem;">Soporte logístico 24/7</span>
                </div>
                <button class="btn btn-outline" style="padding:0.4rem 1rem;">Central de ayuda</button>
              </div>
            </div>
            <div style="margin-top:1rem;">
              <h4 style="font-size:0.9rem;">Mensajería rápida (cliente - repartidor)</h4>
              <div class="mensajes-chat" ref="chatMessages">
                <div v-for="(msg, i) in chatLog" :key="i" class="msj">
                  <strong>{{ msg.sender }}:</strong> {{ msg.text }}
                </div>
              </div>
              <div class="chat-mock">
                <input
                  type="text"
                  v-model="chatInput"
                  placeholder="Escribe un mensaje..."
                  @keypress.enter="sendMessage"
                />
                <button @click="sendMessage">Enviar →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REDES SOCIALES -->
    <section class="social-section" id="social">
      <div class="container">
        <span class="tag tag-sky">✦ Comunidad Unify</span>
        <h2 style="margin:0.5rem 0;">Síguenos en redes sociales</h2>
        <p>Conecta con otras empresas, clientes y mantente al día de nuevas funcionalidades.</p>
        <div class="social-grid">
          <a href="#" class="social-card"><span class="social-icon"><i class="fab fa-instagram"></i></span> Instagram @Unify</a>
          <a href="#" class="social-card"><span class="social-icon"><i class="fab fa-facebook-f"></i></span> Facebook Unify</a>
          <a href="#" class="social-card"><span class="social-icon"><i class="fab fa-linkedin-in"></i></span> LinkedIn Unify Business</a>
          <a href="#" class="social-card"><span class="social-icon"><i class="fab fa-x-twitter"></i></span> X (Unify)</a>
          <a href="#" class="social-card"><span class="social-icon"><i class="fab fa-tiktok"></i></span> TikTok Unify</a>
        </div>
      </div>
    </section>

    <!-- TESTIMONIOS -->
    <section class="testimonials" id="testimonios">
      <div class="container">
        <div class="section-header">
          <span class="tag tag-green">✦ Opiniones reales</span>
          <h2>Lo que dicen empresas<br />y sus clientes</h2>
        </div>
        <div class="testi-grid">
          <div class="testi-card">
            <span class="testi-tag">🏢 Empresa</span>
            <div class="stars">★★★★★</div>
            <p class="testi-text">"El mapa de entregas mejoró nuestra eficiencia un 40%. Nuestros clientes ahora ven en tiempo real dónde está su pedido y eso redujo llamadas de seguimiento."</p>
            <div class="testi-author">
              <div>
                <div class="testi-name">Marta López</div>
                <div class="testi-role">Logística</div>
              </div>
            </div>
          </div>
          <div class="testi-card">
            <span class="testi-tag">👤 Cliente</span>
            <div class="stars">★★★★★</div>
            <p class="testi-text">"Recibir notificaciones y ver al repartidor en el mapa me da mucha tranquilidad. Además, el chat con el distribuidor resolvió rápido un cambio de dirección."</p>
            <div class="testi-author">
              <div>
                <div class="testi-name">Andrea Herrera</div>
                <div class="testi-role">Cliente</div>
              </div>
            </div>
          </div>
          <div class="testi-card">
            <span class="testi-tag">🏭 Empresa</span>
            <div class="stars">★★★★★</div>
            <p class="testi-text">"Unify nos permitió unificar el control de 12 rutas de delivery. Ahora tenemos indicadores en tiempo real y el contacto directo distribuidor-cliente es un plus."</p>
            <div class="testi-author">
              <div>
                <div class="testi-name">Javier Molina</div>
                <div class="testi-role">CEO Distribuidora La Constancia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta-section">
      <div class="cta-inner">
        <span class="tag tag-green">✦ Impulsa tu operación</span>
        <h2>¿Listo para digitalizar la logística de tu empresa?</h2>
        <p>Únete a las empresas que ya optimizan sus entregas con Unify. Plataforma todo-en-uno.</p>
        <div class="cta-actions">
          <button type="button" class="btn btn-primary" @click="goToRegister">Crear cuenta corporativa →</button>
          <a href="#modulos" class="btn btn-sky">Explorar módulos</a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="#" class="nav-logo" style="display:inline-block;margin-bottom:.5rem">
            Uni<span style="color:var(--sky-400)">fy</span>
          </a>
          <p>Plataforma integral para empresas de logística y distribución.</p>
        </div>
        <div class="footer-col">
          <h4>Producto</h4>
          <ul>
            <li><a href="#">Flota</a></li>
            <li><a href="#">Rastreo</a></li>
            <li><a href="#">Analíticas</a></li>
            <li><a href="#">Inventario</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Empresa</h4>
          <ul>
            <li><a href="#">Acerca de</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Carreras</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Soporte</h4>
          <ul>
            <li><a href="#">Centro de ayuda</a></li>
            <li><a href="#">Tutoriales</a></li>
            <li><a href="#">Comunidad</a></li>
            <li><a href="#">API</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">© 2025 Unify · Programa Supérate DollarCity</span>
        <div class="footer-legal">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { insforge } from '../insforgeClient.js'

const emit = defineEmits(['switch-view'])

const loggedIn = ref(false)

// Estado del chat
const chatInput = ref('')
const chatLog = ref([
  { sender: 'Cliente Ana', text: '¿A qué hora llega mi pedido?' },
  { sender: 'Distribuidor', text: 'En 15 minutos estaré en su dirección.' },
])

// Referencias del DOM
const chatMessages = ref(null)
let map = null
let marker = null
let polyline = null

// Función para enviar mensajes
const sendMessage = () => {
  const msg = chatInput.value.trim()
  if (!msg) return

  chatLog.value.push({ sender: 'Cliente actual', text: msg })
  chatInput.value = ''

  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })

  setTimeout(() => {
    chatLog.value.push({ sender: 'Distribuidor', text: 'Recibido, en breve confirmo la entrega ✅' })
    nextTick(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  }, 800)
}

// Inicializar mapa
const initMap = () => {
  if (typeof window.L === 'undefined') {
    console.warn('Leaflet no está cargado. Asegúrate de incluir el CDN en index.html')
    return
  }
  
  const L = window.L
  
  // Crear el mapa
  map = L.map('deliveryMap').setView([13.6929, -89.2182], 12)
  
  // Capa de tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & contributors',
  }).addTo(map)
  
  // Marcador
  marker = L.marker([13.7029, -89.2282]).addTo(map)
  marker
    .bindPopup('<b>Unidad #UNI-4521</b><br/>Distribuidor: Carlos<br/>Próxima entrega: 5 min')
    .openPopup()
  
  // Ruta
  const routePoints = [
    [13.6929, -89.2182],
    [13.7029, -89.2282],
    [13.7129, -89.2382],
  ]
  polyline = L.polyline(routePoints, { color: '#00b0a8', weight: 4 }).addTo(map)
}

// Limpiar mapa al desmontar
const cleanupMap = () => {
  if (map) {
    map.remove()
    map = null
    marker = null
    polyline = null
  }
}

// Navegación
const goToRegister = () => emit('switch-view', 'register')
const goToLogin = () => emit('switch-view', 'login')

// Rol del usuario (guardado tras selección)
const userRole = ref(null)

// Cargar rol desde localStorage si existe
const loadUserRole = () => {
  try {
    const saved = localStorage.getItem('userRole')
    if (saved) userRole.value = saved
  } catch (e) {
    console.warn('No se pudo leer userRole en localStorage', e)
  }
}

const checkSession = async () => {
  try {
    const { data, error } = await insforge.auth.getUser()
    if (!error && data?.user) {
      loggedIn.value = true
      loadUserRole()
      return
    }
    loggedIn.value = false
  } catch (err) {
    console.warn('Error verificando sesión:', err)
    loggedIn.value = false
  }
}

const signOut = async () => {
  try {
    await insforge.auth.signOut()
    localStorage.removeItem('userRole')
    localStorage.removeItem('pendingUserId')
  } catch (err) {
    console.warn('Error cerrando sesión:', err)
  }
  loggedIn.value = false
  emit('switch-view', 'login')
}

onMounted(async () => {
  loadUserRole()
  await checkSession()
  // Esperar un tick para asegurar que el DOM esté listo
  nextTick(() => {
    initMap()
  })
})

onBeforeUnmount(() => {
  cleanupMap()
})
</script>

<style scoped>
/* ─── VARIABLES (ahora en style.css global — aquí solo se consumen) ─── */

/* ─── UTILIDADES ─────────────────────────────────────────── */
.container { max-width: 1180px; margin: 0 auto; padding: 0 5vw; }

.tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .72rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; padding: .3rem .85rem;
  border-radius: 100px;
}
.tag-green { background: var(--green-50);  color: var(--green-600); }
.tag-sky   { background: var(--sky-100);   color: var(--sky-600);   }

/* ─── TIPOGRAFÍA ─────────────────────────────────────────── */
h1, h2, h3, h4 {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  line-height: 1.15; letter-spacing: -0.02em;
}
h1 { font-size: clamp(2.6rem, 5.5vw, 4.4rem); font-weight: 700; }
h2 { font-size: clamp(1.8rem, 3.5vw, 2.9rem); font-weight: 700; }
h3 { font-size: 1.25rem; font-weight: 600; }

/* ─── BOTONES ─────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 600; font-size: .93rem;
  border: none; border-radius: var(--radius-md);
  padding: .78rem 1.8rem; cursor: pointer; transition: all .22s;
}
.btn-primary {
  background: linear-gradient(135deg, #0B3C6D 0%, #4FA9A3 100%);
  color: #fff;
  box-shadow: 0 4px 18px rgba(0, 94, 89, .35);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0, 94, 89, .4); }
.btn-sky {
  background: linear-gradient(135deg, #3A7DBF 0%, #00b0a8 100%);
  color: #fff;
  box-shadow: 0 4px 18px rgba(58, 125, 191, .35);
}
.btn-sky:hover { 
  transform: translateY(-2px); }
.btn-outline {
  background: transparent; 
  color: var(--green-600);
  border: 1.5px solid var(--green-400);
}
.btn-outline:hover { 
  background: var(--green-50); }
.btn-ghost {
  background: transparent; 
  color: var(--text-mid);
  border: 1.5px solid var(--border);
}
.btn-ghost:hover { 
  border-color: var(--green-400); 
  color: var(--green-600); }

/* ─── NAVBAR ──────────────────────────────────────────────── */
.navbar {
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  z-index: 200;
  height: 68px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  display: flex; align-items: center;
  margin-left: 0;
  gap: 5rem;
}
.navbar .container {
  width: 100%; 
  display: flex; 
  align-items: center; 
  justify-content: flex-start;
  gap: 0;
}
.logo_Unify {
  margin-bottom: 30px;
  margin-right: 20px;
  position: relative;
  width: 32px; 
  height: 32px; 
  object-fit: contain;
  border-radius: 12px;
  flex-shrink: 0;
  margin-top: 2rem;
}
.nav-logo {
  display: inline-flex; 
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.55rem; 
  font-weight: 700;
  background: linear-gradient(135deg, #005e59 0%, #00ab91 100%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  letter-spacing: -0.03em;
  cursor: pointer;
  margin-left: 0;
}
.nav-logo span {
  background: linear-gradient(135deg, #0B3C6D 0%, #3A7DBF 100%);
  -webkit-background-clip: text; 
  background-clip: text;
  color: transparent;
}
.nav-links { 
  display: flex; 
  gap: 2rem; 
  list-style: none; 
  margin-right: 45px; 
}
.nav-links a {
  font-size: .88rem; 
  font-weight: 500;
  color: #4a5568;
  transition: color 0.3s ease;
  position: relative;
}
.nav-links a::after {
  content: ''; position: absolute;
  width: 0; height: 2px;
  bottom: -5px; left: 0;
  background: linear-gradient(135deg, #005e59 0%, #013d4f 100%);
  transition: width 0.3s ease;
}
.nav-links a:hover { 
  color: #005e59; 
}
.nav-links a:hover::after { 
  width: 100%; 
}
.nav-actions { 
  display: flex; 
  gap: .75rem; 
  align-items: center; 
}

/* ─── HERO ────────────────────────────────────────────────── */
.hero {
  min-height: 100vh;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; gap: 4rem;
  padding: 100px 5vw 60px;
  max-width: 1180px; margin: 0 auto;
  background: var(--bg-light);
}
.hero-eyebrow { margin-bottom: 1.4rem; }
.hero-title .accent-green { color: var(--green-600); }
.hero-title .accent-sky   { color: var(--sky-600); }
.hero-desc {
  font-size: 1.08rem; color: var(--text-muted);
  max-width: 480px; margin-bottom: 2.2rem;
}
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3rem; }
.hero-social-proof { display: flex; align-items: center; gap: 2rem; margin-top: 1rem; }
.avatars { display: flex;}
.avatars img {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid #ffffff; margin-left: -10px; object-fit: cover; position: relative; margin-bottom: 25px;
}
.avatars img:first-child { margin-left: 0; }
.proof-text { font-size: .82rem; color: var(--text-muted); line-height: 1.4; }
.proof-text strong { color: var(--green-600); font-weight: 700; }

.hero-visual { position: relative; }
.hero-img-wrap {
  border-radius: var(--radius-xl);
  overflow: hidden; aspect-ratio: 4/5;
  box-shadow: var(--shadow-lg);
}
.hero-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.float-card {
  position: absolute; z-index: 10;
  background: white; border-radius: var(--radius-md);
  padding: .85rem 1.1rem;
  box-shadow: var(--shadow-md);
  display: flex; align-items: center; gap: .75rem;
  animation: floatY 4s ease-in-out infinite;
}
.float-card-1 { top: 12%; left: -60px; }
.float-card-2 { bottom: 18%; right: -50px; animation-delay: 1.5s; }
.fc-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}
.fc-icon.g { background: var(--green-50); }
.fc-icon.s { background: var(--sky-100); }
.fc-label { font-size: .7rem; color: var(--text-muted); font-weight: 500; }
.fc-val   { font-size: 1rem; font-weight: 700; color: var(--text-dark); }

/* Blobs de fondo */
.hero-blob {
  position: fixed; top: -200px; right: -200px; z-index: -1;
  width: 700px; height: 700px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,176,168,.07) 0%, transparent 65%);
  pointer-events: none;
}
.hero-blob2 {
  position: fixed; bottom: 0; left: -200px; z-index: -1;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,94,89,.06) 0%, transparent 65%);
  pointer-events: none;
}

/* ─── LOGOS STRIP ─────────────────────────────────────────── */
.logos-strip {
  background: var(--off-white);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 2rem 5vw;
}
.logos-inner {
  max-width: 1180px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 1.5rem;
}
.logos-label { font-size: .78rem; font-weight: 600; color: var(--text-muted); letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.logo-items  { display: flex; align-items: center; gap: 2.5rem; flex-wrap: wrap; }
.logo-item {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: 1rem; font-weight: 700;
  color: var(--text-muted); opacity: .55;
}
.logo-item:hover { opacity: .85; }

/* ─── FEATURES ────────────────────────────────────────────── */
.features { padding: 100px 5vw; background: var(--white); }
.section-header { margin-bottom: 4rem; }
.section-header h2 { margin-top: .6rem; margin-bottom: .8rem; }
.section-header p  { font-size: 1rem; color: var(--text-muted); max-width: 520px; }

.features-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.feat-big {
  grid-column: span 2;
  display: grid; grid-template-columns: 1fr 1fr;
  background: var(--off-white); border-radius: var(--radius-lg);
  overflow: hidden; border: 1px solid var(--border);
}
.feat-big:hover { box-shadow: var(--shadow-md); }
.feat-big-content { padding: 2.5rem; display: flex; flex-direction: column; justify-content: space-between; }
.feat-big-img { overflow: hidden; min-height: 280px; position: relative; }
.feat-big-img img { width: 100%; height: 100%; object-fit: cover; }
.feat-card {
  background: var(--off-white); border-radius: var(--radius-lg);
  border: 1px solid var(--border); padding: 2rem;
  transition: all .25s;
}
.feat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.feat-icon-wrap {
  width: 48px; height: 48px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
}
.fi-green { background: var(--green-50); }
.fi-sky   { background: var(--sky-100); }
.feat-card h3  { font-size: 1.05rem; margin: 0 0 0.5rem 0; }
.feat-card p   { font-size: .88rem; color: var(--text-muted); line-height: 1.65; }
.feat-link     { font-size: .82rem; font-weight: 600; color: var(--green-600); display: inline-flex; align-items: center; gap: 4px; margin-top: 1rem; }

/* ─── STATS ───────────────────────────────────────────────── */
.stats-section {
  background: linear-gradient(135deg, #005e59 0%, #00b0a8 100%);
  padding: 80px 5vw;
}
.stats-inner {
  max-width: 1180px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;
}
.stat-box { text-align: center; }
.stat-num {
  font-family: 'Montserrat', 'Segoe UI', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 700;
  color: #fff; line-height: 1;
}
.stat-num sup { font-size: 1.2rem; vertical-align: super; }
.stat-desc { font-size: .85rem; color: rgba(255,255,255,.8); margin-top: .4rem; }

/* ─── HOW IT WORKS ────────────────────────────────────────── */
.how { padding: 100px 5vw; background: var(--bg-light); }
.how .container { max-width: 1180px; margin: 0 auto; }

.steps-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 2rem; margin-top: 3.5rem; position: relative;
}
.steps-row::before {
  content: '';
  position: absolute; top: 28px; left: 10%; right: 10%;
  height: 1.5px;
  background: linear-gradient(90deg, #005e59, #00b0a8);
  z-index: 0;
}
.step-box { text-align: center; position: relative; z-index: 1; }
.step-dot {
  width: 56px; height: 56px; border-radius: 50%;
  background: white; border: 2px solid var(--green-400);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; margin: 0 auto 1.2rem;
  box-shadow: var(--shadow-sm);
}
.step-box h3 { font-size: .98rem; margin-bottom: .4rem; }
.step-box p  { font-size: .82rem; color: var(--text-muted); line-height: 1.6; }

/* ─── MODULES ─────────────────────────────────────────────── */
.modules { padding: 100px 5vw; background: var(--white); }
.modules .container { max-width: 1180px; margin: 0 auto; }

.modules-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem; margin-top: 3.5rem;
}
.mod-card {
  background: var(--white); border: 1.5px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.6rem;
  transition: all .25s; cursor: pointer;
  position: relative; overflow: hidden;
}
.mod-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--green-50) 0%, var(--sky-100) 100%);
  opacity: 0; transition: opacity .3s;
}
.mod-card:hover { border-color: var(--green-400); box-shadow: var(--shadow-md); transform: translateY(-3px); }
.mod-card:hover::before { opacity: 1; }
.mod-card > * { position: relative; z-index: 1; }
.mod-emoji { font-size: 1.8rem; margin-bottom: .9rem; }
.mod-card h3 { font-size: .97rem; font-weight: 700; margin-bottom: .4rem; }
.mod-card p  { font-size: .8rem; color: var(--text-muted); line-height: 1.55; }

/* ─── TRACKING (MAPA + CHAT) ─────────────────────────────── */
.tracking-section { padding: 100px 5vw; background: var(--off-white); }
.tracking-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
.map-card, .chat-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); overflow: hidden; border: 1px solid var(--border); padding: 1.5rem; }
.map-card h3, .chat-card h3 { margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px; }
#deliveryMap { height: 320px; width: 100%; border-radius: var(--radius-md); margin-top: 1rem; z-index: 1; background: #e9f3f0; }
.order-status { background: var(--green-50); padding: 1rem; border-radius: var(--radius-md); margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.tracking-badge { background: var(--green-600); color: white; padding: 0.2rem 0.8rem; border-radius: 40px; font-size: 0.7rem; font-weight: bold; }
.contact-distributor { display: flex; flex-direction: column; gap: 1.2rem; margin-top: 1.2rem; }
.distributor-item { background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem; }
.chat-mock { display: flex; gap: 8px; margin-top: 0.8rem; }
.chat-mock input { flex: 1; padding: 0.6rem; border: 1px solid var(--border); border-radius: 40px; font-family: inherit; }
.chat-mock button { background: var(--sky-400); border: none; color: white; border-radius: 40px; padding: 0.6rem 1rem; cursor: pointer; transition: background 0.2s; }
.chat-mock button:hover { background: var(--sky-500); }
.mensajes-chat { background: #f9f9f9; border-radius: var(--radius-md); padding: 0.8rem; max-height: 150px; overflow-y: auto; font-size: 0.85rem; }
.msj { margin-bottom: 8px; border-bottom: 1px solid #eee; padding: 4px 0; }

/* ─── SOCIAL SECTION (REDES) ─────────────────────────────── */
.social-section { padding: 80px 5vw; background: linear-gradient(145deg, #ffffff 0%, #edf7f5 100%); text-align: center; }
.social-grid { display: flex; justify-content: center; gap: 2.5rem; flex-wrap: wrap; margin: 2rem 0; }
.social-card { background: white; border-radius: 40px; padding: 0.8rem 1.8rem; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-sm); transition: transform 0.2s; border: 1px solid var(--border); }
.social-card:hover { transform: translateY(-5px); background: var(--green-50); }
.social-icon { font-size: 1.8rem; }

/* ─── TESTIMONIOS MIXTOS ─────────────────────────────────── */
.testimonials { padding: 100px 5vw; background: var(--white); }
.testi-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem; margin-top: 3.5rem;
}
.testi-card {
  background: var(--off-white); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 2rem;
  transition: all .25s;
}
.testi-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.testi-tag { font-size: 0.7rem; background: var(--sky-100); display: inline-block; padding: 0.2rem 0.8rem; border-radius: 20px; margin-bottom: 0.8rem; font-weight: bold; color: var(--sky-600); }
.stars { color: var(--green-400); font-size: .9rem; margin-bottom: 1rem; letter-spacing: 2px; }
.testi-text { font-size: .92rem; color: var(--text-mid); line-height: 1.7; margin-bottom: 1.4rem; font-style: italic; }
/* .testi-author { display: flex; align-items: center; gap: .75rem; }
.testi-author img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; } */
.testi-name { font-size: .85rem; font-weight: 700; color: var(--text-dark); }
.testi-role { font-size: .75rem; color: var(--text-muted); }

/* ─── CTA FINAL ───────────────────────────────────────────── */
.cta-section {
  padding: 100px 5vw;
  background: linear-gradient(135deg, #005e59 0%, #0B3C6D 100%);
  position: relative; overflow: hidden;
}
.cta-section::before {
  content: ''; position: absolute;
  top: -150px; right: -150px;
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,176,168,.15) 0%, transparent 65%);
  pointer-events: none;
}
.cta-section::after {
  content: ''; position: absolute;
  bottom: -100px; left: -100px;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(58,125,191,.12) 0%, transparent 65%);
  pointer-events: none;
}
.cta-inner {
  max-width: 720px; margin: 0 auto; text-align: center;
  position: relative; z-index: 1;
}
.cta-inner h2 { color: #fff; margin: .6rem 0 1rem; }
.cta-inner p  { color: rgba(255,255,255,.7); font-size: 1rem; margin-bottom: 2.4rem; }
.cta-actions  { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }

/* ─── FOOTER ──────────────────────────────────────────────── */
.footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 60px 5vw 32px;
}
.footer-top {
  max-width: 1180px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem; padding-bottom: 3rem;
  border-bottom: 1px solid var(--border);
}
.footer-brand p { font-size: .88rem; color: var(--text-muted); margin-top: .75rem; max-width: 280px; line-height: 1.6; }
.footer-col h4  { font-size: .8rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem; }
.footer-col ul  { list-style: none; display: flex; flex-direction: column; gap: .6rem; }
.footer-col a   { font-size: .87rem; color: var(--text-mid); transition: color .2s; }
.footer-col a:hover { color: var(--green-600); }
.footer-bottom {
  max-width: 1180px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 1.8rem; flex-wrap: wrap; gap: 1rem;
}
.footer-copy  { font-size: .8rem; color: var(--text-muted); }
.footer-legal { display: flex; gap: 1.5rem; }
.footer-legal a { font-size: .8rem; color: var(--text-muted); transition: color .2s; }
.footer-legal a:hover { color: var(--green-600); }

/* ─── ANIMACIONES ─────────────────────────────────────────── */
@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up  { animation: fadeUp .65s ease both; }
.delay-1  { animation-delay: .1s; }
.delay-2  { animation-delay: .2s; }
.delay-3  { animation-delay: .3s; }
.delay-4  { animation-delay: .4s; }

/* ─── RESPONSIVE ──────────────────────────────────────────── */
@media (max-width: 1024px) {
  .features-grid  { grid-template-columns: 1fr 1fr; }
  .feat-big       { grid-column: span 2; grid-template-columns: 1fr; }
  .feat-big-img   { min-height: 200px; }
  .modules-grid   { grid-template-columns: repeat(2, 1fr); }
  .stats-inner    { grid-template-columns: repeat(2, 1fr); }
  .testi-grid     { grid-template-columns: repeat(2, 1fr); }
  .footer-top     { grid-template-columns: 1fr 1fr; }
  .steps-row      { grid-template-columns: repeat(2, 1fr); }
  .steps-row::before { display: none; }
  .tracking-grid  { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .hero          { grid-template-columns: 1fr; padding-top: 90px; }
  .hero-visual   { display: none; }
  .nav-links     { display: none; }
  .features-grid { grid-template-columns: 1fr; }
  .feat-big      { grid-column: span 1; }
  .modules-grid  { grid-template-columns: repeat(2, 1fr); }
  .testi-grid    { grid-template-columns: 1fr; }
  .footer-top    { grid-template-columns: 1fr; }
  .float-card-1, .float-card-2 { display: none; }
  .social-grid   { gap: 1rem; }
}
@media (max-width: 480px) {
  .modules-grid  { grid-template-columns: 1fr; }
  .stats-inner   { grid-template-columns: 1fr 1fr; }
  .cta-actions   { flex-direction: column; align-items: center; }
  .nav-actions .btn-ghost { display: none; }
}
</style>