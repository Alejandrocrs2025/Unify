const STORAGE_KEY = 'unify_products'

const defaultProducts = [
  {
    id: 1,
    title: 'Auriculares Inalámbricos Pro',
    price: 129.99,
    category: 'Electrónica',
    seller: 'TechStore',
    rating: 4.8,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    description: 'Auriculares con cancelación de ruido y batería de larga duración.',
    stock: 18,
  },
  {
    id: 2,
    title: 'Silla Ergonómica Office',
    price: 249.5,
    category: 'Hogar',
    seller: 'HomeLab',
    rating: 4.6,
    reviews: 78,
    image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=900&q=80',
    description: 'Silla cómoda para trabajo prolongado con soporte lumbar.',
    stock: 9,
  },
  {
    id: 3,
    title: 'Camiseta Urbana Premium',
    price: 29.99,
    category: 'Moda',
    seller: 'UrbanStyle',
    rating: 4.4,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    description: 'Camiseta de algodón con diseño moderno y cómodo.',
    stock: 42,
  },
  {
    id: 4,
    title: 'Set de Cocina Básico',
    price: 89.0,
    category: 'Hogar',
    seller: 'Casa Feliz',
    rating: 4.7,
    reviews: 91,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    description: 'Juego de utensilios esenciales para cocina diaria.',
    stock: 15,
  },
  {
    id: 5,
    title: 'Shampoo Hidratante',
    price: 14.5,
    category: 'Salud & Belleza',
    seller: 'GlowCare',
    rating: 4.2,
    reviews: 33,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    description: 'Shampoo con ingredientes hidratantes para uso diario.',
    stock: 21,
  },
  {
    id: 6,
    title: 'Balón de Fútbol',
    price: 39.99,
    category: 'Deportes',
    seller: 'SportLine',
    rating: 4.5,
    reviews: 48,
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    description: 'Balón resistente para entrenamientos y partidos.',
    stock: 26,
  },
]

const readStoredProducts = () => {
  if (typeof window === 'undefined') return [...defaultProducts]

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...defaultProducts]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultProducts]
  } catch (err) {
    console.warn('No se pudieron leer los productos guardados:', err)
    return [...defaultProducts]
  }
}

const writeStoredProducts = (products) => {
  if (typeof window === 'undefined') return products

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (err) {
    console.warn('No se pudieron guardar los productos:', err)
  }

  return products
}

export const getProducts = () => readStoredProducts()

export const addProduct = (product) => {
  const products = readStoredProducts()
  const nextProduct = {
    ...product,
    id: product.id ?? Date.now(),
  }
  const updated = [nextProduct, ...products]
  return writeStoredProducts(updated)
}

export const updateProduct = (id, productUpdates) => {
  const products = readStoredProducts()
  const updated = products.map((product) => (product.id === id ? { ...product, ...productUpdates } : product))
  return writeStoredProducts(updated)
}

export const deleteProduct = (id) => {
  const products = readStoredProducts()
  const updated = products.filter((product) => product.id !== id)
  return writeStoredProducts(updated)
}
