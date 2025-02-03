import { supabase } from './supabase'

export async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return !!data
} 