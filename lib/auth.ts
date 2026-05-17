import { SupabaseClient } from '@supabase/supabase-js'

export type Profile = {
  id: string
  role: 'admin' | 'client'
  full_name: string | null
  company: string | null
  created_at: string
}

export async function getProfile(supabase: SupabaseClient): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Profile | null
}
