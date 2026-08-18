import { supabase } from '../lib/supabase'
import { EventItem } from '../types/database'
import { DEFAULT_EVENTS, CURRENT_ACTIVE_SLUG } from '../config/events'

export async function fetchEvents(): Promise<EventItem[]> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('year', { ascending: false })

        if (error || !data || data.length === 0) {
            console.warn('Usando eventos padrão locais:', error?.message)
            return DEFAULT_EVENTS
        }

        return data.map(item => ({
            ...item,
            kit_options: Array.isArray(item.kit_options) ? item.kit_options : [],
            pix_info: item.pix_info || {}
        }))
    } catch (err) {
        console.error('Erro ao buscar eventos:', err)
        return DEFAULT_EVENTS
    }
}

export async function fetchActiveEvent(): Promise<EventItem> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('status', 'active')
            .single()

        if (error || !data) {
            const fallback = DEFAULT_EVENTS.find(e => e.slug === CURRENT_ACTIVE_SLUG) || DEFAULT_EVENTS[1]
            return fallback
        }

        return {
            ...data,
            kit_options: Array.isArray(data.kit_options) ? data.kit_options : [],
            pix_info: data.pix_info || {}
        }
    } catch (err) {
        console.error('Erro ao buscar evento ativo:', err)
        return DEFAULT_EVENTS.find(e => e.slug === CURRENT_ACTIVE_SLUG) || DEFAULT_EVENTS[1]
    }
}
