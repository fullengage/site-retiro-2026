import { supabase } from '../lib/supabase'
import { Participant, ParticipantHistoryItem } from '../types/database'

export interface ParticipantSearchResult {
    participant: Participant
    pastRetreats: string[] // ex: ['Retiro de Carnaval 2026']
    isRegisteredInActiveEvent?: boolean
}

export async function searchParticipantsByName(
    nameQuery: string,
    _activeEventId?: string
): Promise<ParticipantSearchResult[]> {
    if (!nameQuery || nameQuery.trim().length < 2) return []
    const cleanQuery = nameQuery.trim()

    try {
        // Busca na tabela event_registrations
        const { data, error } = await supabase
            .from('event_registrations')
            .select('*')
            .ilike('full_name', `%${cleanQuery}%`)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Erro ao buscar participantes na base:', error)
            return []
        }

        if (!data || data.length === 0) {
            return []
        }

        // Deduplica por nome limpo
        const seen = new Set<string>()
        const results: ParticipantSearchResult[] = []

        for (const leg of data) {
            const key = (leg.full_name || '').trim().toLowerCase()
            if (key && !seen.has(key)) {
                seen.add(key)
                results.push({
                    participant: {
                        id: leg.id,
                        full_name: leg.full_name?.trim() || '',
                        email: leg.email?.trim() || '',
                        phone: leg.phone?.trim() || '',
                        cpf: leg.cpf || '',
                        birth_date: leg.birth_date || '',
                        gender: leg.gender || '',
                        address: leg.address || '',
                        city: leg.city || '',
                        parish: leg.parish || '',
                        emergency_phone: leg.emergency_phone || ''
                    },
                    pastRetreats: ['Retiro de Carnaval 2026'],
                    isRegisteredInActiveEvent: false
                })
            }
        }

        return results
    } catch (err) {
        console.error('Erro ao buscar participantes por nome:', err)
        return []
    }
}

export async function findParticipantByIdentifier(params: {
    email?: string
    phone?: string
    cpf?: string
    name?: string
    activeEventId?: string
}): Promise<ParticipantSearchResult | null> {
    try {
        const cleanName = params.name?.trim()
        const cleanEmail = params.email?.trim().toLowerCase()
        const cleanPhone = params.phone?.replace(/\D/g, '')

        if (cleanName && cleanName.length >= 3) {
            const results = await searchParticipantsByName(cleanName, params.activeEventId)
            if (results.length > 0) return results[0]
        }

        if (cleanEmail) {
            const { data } = await supabase
                .from('event_registrations')
                .select('*')
                .ilike('email', cleanEmail)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                return {
                    participant: {
                        id: data.id,
                        full_name: data.full_name?.trim() || '',
                        email: data.email?.trim() || '',
                        phone: data.phone?.trim() || '',
                        birth_date: data.birth_date || '',
                        gender: data.gender || '',
                        address: data.address || '',
                        city: data.city || '',
                        parish: data.parish || '',
                        emergency_phone: data.emergency_phone || ''
                    },
                    pastRetreats: ['Retiro de Carnaval 2026'],
                    isRegisteredInActiveEvent: false
                }
            }
        }

        if (cleanPhone && cleanPhone.length >= 8) {
            const { data } = await supabase
                .from('event_registrations')
                .select('*')
                .ilike('phone', `%${cleanPhone}%`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                return {
                    participant: {
                        id: data.id,
                        full_name: data.full_name?.trim() || '',
                        email: data.email?.trim() || '',
                        phone: data.phone?.trim() || '',
                        birth_date: data.birth_date || '',
                        gender: data.gender || '',
                        address: data.address || '',
                        city: data.city || '',
                        parish: data.parish || '',
                        emergency_phone: data.emergency_phone || ''
                    },
                    pastRetreats: ['Retiro de Carnaval 2026'],
                    isRegisteredInActiveEvent: false
                }
            }
        }

        return null
    } catch (err) {
        console.error('Erro ao buscar participante por identificador:', err)
        return null
    }
}

export async function upsertParticipant(participantData: Partial<Participant>): Promise<Participant> {
    return {
        id: participantData.id || `p_${Date.now()}`,
        full_name: participantData.full_name?.trim() || '',
        email: participantData.email?.trim().toLowerCase() || '',
        phone: participantData.phone?.trim() || '',
        cpf: participantData.cpf?.trim() || '',
        birth_date: participantData.birth_date,
        gender: participantData.gender,
        address: participantData.address,
        city: participantData.city,
        parish: participantData.parish,
        emergency_phone: participantData.emergency_phone,
    }
}

export async function fetchParticipantHistory(participantId: string): Promise<ParticipantHistoryItem[]> {
    try {
        const { data, error } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('id', participantId)

        if (error || !data) {
            return []
        }

        return data.map((item: any) => ({
            registrationId: item.id,
            eventId: 'carnaval-2026',
            eventSlug: 'carnaval-2026',
            eventName: 'Retiro de Carnaval 2026',
            eventYear: 2026,
            eventStatus: 'completed',
            kitOption: item.kit_option || 'Kit Inscrição',
            tshirtSize: item.tshirt_size,
            tshirtSize2: item.tshirt_size_2,
            registrationStatus: item.payment_status === 'Pago' ? 'Confirmada' : 'Pendente',
            createdAt: item.created_at,
            payment: {
                id: item.id,
                amount: item.payment_amount || 0,
                status: item.payment_status || 'Pendente',
                paymentReceiptUrl: item.payment_receipt_url,
                paidAt: item.created_at
            }
        }))
    } catch (err) {
        console.error('Erro ao buscar histórico do participante:', err)
        return []
    }
}
