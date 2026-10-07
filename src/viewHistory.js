// viewHistory.js
// Hace que los botones Atrás / Adelante del navegador (y el gesto de atrás del celular) funcionen
// dentro de Unify. Unify cambia de pantalla sin recargar la página, así que el navegador no tenía
// entradas en su historial a las que volver. Aquí se registra cada cambio de pantalla.
//
// - Nivel 1: pantallas principales (home, login, register, main, cliente, empresa...). Lo usa App.vue.
// - Nivel 2: secciones internas de Cliente y Empresa (pedidos, seguimiento, reportes...).

export const VIEW_KEY = 'unifyView'

// Pantallas que exigen sesión iniciada, y pantallas de acceso que no tienen sentido con sesión iniciada
const PRIVATE_VIEWS = new Set(['main', 'cliente', 'empresa', 'empresa-details'])
const AUTH_VIEWS = new Set(['login', 'register'])

let lastN = 0 // posición de la entrada actual; sirve para saber si el usuario fue hacia atrás o adelante

const pushEntry = (state) => { lastN += 1; history.pushState({ ...state, n: lastN }, '') }
const replaceEntry = (state) => { history.replaceState({ ...state, n: lastN }, '') }

// ─────────────────────────────────────────────────────────────
// Nivel 1: pantallas principales
// ─────────────────────────────────────────────────────────────
export function createViewNavigator({ views, getView, setView, hasSession, getSessionView }) {
  const known = new Set(views)

  const switchView = (view) => {
    const next = String(view ?? '').trim().toLowerCase()
    if (!known.has(next)) return
    const from = getView()
    if (next === from) return
    // Login, registro y elegir rol son pantallas "de paso", y al cerrar sesión no se debe poder volver al
    // panel: en esos casos se REEMPLAZA la entrada actual en vez de agregar una nueva.
    const replace =
      (AUTH_VIEWS.has(from) && PRIVATE_VIEWS.has(next)) ||
      from === 'main' ||
      (PRIVATE_VIEWS.has(from) && AUTH_VIEWS.has(next))
    if (replace) replaceEntry({ [VIEW_KEY]: next })
    else pushEntry({ [VIEW_KEY]: next })
    setView(next)
  }

  const onPopState = async (event) => {
    const state = event.state
    if (!state || !state[VIEW_KEY]) return // entradas que no creó Unify (por ejemplo, anclas como #modulos)
    const prevN = lastN
    lastN = state.n ?? 0
    const goingBack = lastN < prevN
    const target = state[VIEW_KEY]
    if (!known.has(target) || target === getView()) return // si es la misma pantalla, el cambio es interno de Cliente/Empresa

    const needsSession = PRIVATE_VIEWS.has(target)
    const isAuth = AUTH_VIEWS.has(target)
    if (needsSession || isAuth) {
      const logged = await hasSession()
      if ((needsSession && !logged) || (isAuth && logged)) {
        // Entrada que ya no es válida (panel sin sesión, o login con sesión iniciada)
        if (goingBack) { history.back(); return } // se salta
        const fallback = logged ? ((await getSessionView()) || 'home') : 'login'
        replaceEntry({ [VIEW_KEY]: fallback })
        setView(fallback)
        return
      }
    }
    setView(target)
  }

  // Se llama una vez al abrir la app. Decide la pantalla inicial y la registra en el historial.
  const init = async () => {
    lastN = history.state?.n ?? 0
    let sessionView = null
    try { sessionView = await getSessionView() } catch (e) { sessionView = null }
    const saved = history.state?.[VIEW_KEY]
    const view = sessionView || (AUTH_VIEWS.has(saved) ? saved : 'home')
    if (saved !== view) replaceEntry({ [VIEW_KEY]: view }) // si ya era esta pantalla se conserva su sección interna
    setView(view)
  }

  return { switchView, onPopState, init }
}

// ─────────────────────────────────────────────────────────────
// Nivel 2: secciones internas (Cliente: pedidos, seguimiento...; Empresa: reportes, flota...)
// ─────────────────────────────────────────────────────────────

// Sección guardada en la entrada actual del historial (si es válida)
export function readSubView(view, allowed) {
  const s = history.state
  return s && s[VIEW_KEY] === view && s.sub && allowed.includes(s.sub) ? s.sub : null
}

// Anota en la entrada actual cuál es la sección que se está viendo (sin crear una entrada nueva)
export function markSubView(view, sub) {
  replaceEntry({ ...(history.state || {}), [VIEW_KEY]: view, sub })
}

// Registra una nueva entrada cuando el usuario cambia de sección
export function pushSubView(view, sub) {
  const s = history.state || {}
  if (s[VIEW_KEY] === view && s.sub === sub) return // ya está registrada (por ejemplo, vino de Atrás/Adelante)
  pushEntry({ [VIEW_KEY]: view, sub })
}

// Avisa al componente cuando Atrás/Adelante lleva a otra sección de la misma pantalla. Devuelve la función para dejar de escuchar.
export function onSubViewChange(view, allowed, handler) {
  const fn = (event) => {
    const s = event.state
    if (s && s[VIEW_KEY] === view && allowed.includes(s.sub)) handler(s.sub)
  }
  window.addEventListener('popstate', fn)
  return () => window.removeEventListener('popstate', fn)
}