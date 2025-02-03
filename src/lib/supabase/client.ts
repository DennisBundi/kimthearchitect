import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create a single instance of the Supabase client
const createClient = () => {
  return createClientComponentClient()
}

// Export a singleton instance
export const supabase = createClient() 