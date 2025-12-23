// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const supabaseHelpers = {
  // User operations
  async signUp(email, password, userData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) throw authError
    
    // Create user profile
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        ...userData
      }])
      .select()
    
    if (error) throw error
    return { user: authData.user, profile: data[0] }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  // Product operations
  async getProducts(filters = {}) {
    let query = supabase.from('products').select('*, categories(*)')
    
    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), reviews(*)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Order operations
  async createOrder(orderData, items) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (orderError) throw orderError
    
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    return order
  },

  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Review operations
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getReviews(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Category operations
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  // Product Request operations
  async createProductRequest(requestData) {
    const { data, error } = await supabase
      .from('product_requests')
      .insert([requestData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getProductRequests() {
    const { data, error } = await supabase
      .from('product_requests')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
