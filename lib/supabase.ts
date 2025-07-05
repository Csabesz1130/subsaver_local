import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Database types
export interface User {
  id: string
  email: string
  encrypted_name?: string
  plaid_access_token?: string
  plaid_item_id?: string
  plaid_accounts?: any[]
  created_at: string
  updated_at: string
  last_sync_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  plaid_transaction_id: string
  plaid_account_id: string
  amount: number
  iso_currency_code?: string
  unofficial_currency_code?: string
  date: string
  datetime?: string
  authorized_date?: string
  authorized_datetime?: string
  name: string
  merchant_name?: string
  category?: string[]
  subcategory?: string
  account_owner?: string
  location?: any
  payment_meta?: any
  pending: boolean
  transaction_type?: string
  logo_url?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  merchant_name: string
  amount: number
  frequency: string
  category?: string
  status: string
  confidence_score: number
  first_detected_at: string
  last_charge_date?: string
  next_expected_date?: string
  cancellation_difficulty: string
  merchant_website?: string
  created_at: string
  updated_at: string
}
