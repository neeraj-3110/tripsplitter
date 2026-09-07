import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
console.log("SUPABASE URL:", supabaseUrl)
console.log("SUPABASE KEY EXISTS:", !!supabasePublishableKey)
if (!supabaseUrl || !supabasePublishableKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in your project values.'
  )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)