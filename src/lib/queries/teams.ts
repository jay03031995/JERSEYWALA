import { createClient } from '@/lib/supabase/server'

export async function getSports() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data
}

export async function getLeaguesBySport(sportSlug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leagues')
    .select('*, sport:sports(*)')
    .eq('is_active', true)
    .eq('sports.slug', sportSlug)
    .order('display_order')
  if (error) throw error
  return data
}

export async function getTeamsByLeague(leagueSlug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*, league:leagues(*)')
    .eq('is_active', true)
    .eq('leagues.slug', leagueSlug)
    .order('name')
  if (error) throw error
  return data
}

export async function getTeamBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*, league:leagues(*, sport:sports(*))')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}
