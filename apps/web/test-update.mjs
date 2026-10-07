import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Need this

// We don't have SUPABASE_SERVICE_ROLE_KEY in .env.local, only ANON_KEY
// But wait, the Edge Functions have it in their .env!
