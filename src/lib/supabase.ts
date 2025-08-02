import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required. Please connect to Supabase using the "Connect to Supabase" button.')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please connect to Supabase using the "Connect to Supabase" button.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for operations that need to bypass RLS
export const supabaseAdmin = supabaseServiceKey ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : supabase