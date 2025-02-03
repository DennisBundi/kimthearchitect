import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Project = {
  id: number
  name: string
  category: string
  year: string
  description: string
  cover_image: string
}

export async function getProjects(category: string = 'All'): Promise<Project[]> {
  const query = supabase
    .from('projects')
    .select('*')
    
  if (category !== 'All') {
    query.eq('category', category)
  }
    
  const { data, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }
  
  return data || []
}

export async function getRecentProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching recent projects:', error)
    return []
  }
  
  return data
} 