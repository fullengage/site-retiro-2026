import { supabase } from '../lib/supabase'
import { Participant, ParticipantHistoryItem } from '../types/database'

export interface ParticipantSearchResult {
    participant: Participant
    pastRetreats: string[]
    isRegisteredInActiveEvent?: boolean
}

// Autocomplete e busca inteligente de participantes para inscrição expressa (1 clique).
// Preenche todos os dados cadastrais previamente existentes de outros retiros (Carnaval, etc.)
// e verifica se já possui inscrição no evento ativo atual.
export async function searchParticipantsByName(
    nameQuery: string,
    activeEventId?: string
): Promise<ParticipantSearchResult[]> {
    if (!nameQuery || nameQuery.trim().length < 2) return []

    try {
        const { data, error } = await supabase.rpc('search_participants_by_name', {
            p_name: nameQuery.trim(),
            p_event_id: activeEventId || null
        })

        if (error) {
            console.error('Erro ao buscar participantes por nome:', error)
            return []
        }

        return (data || []).map((item: any) => ({
            participant: {
                id: item.id,
                full_name: item.full_name,
                email: item.email || '',
                phone: item.phone || '',
                cpf: item.cpf || '',
                birth_date: item.birth_date || null,
                gender: item.gender || null,
                address: item.address || '',
                city: item.city || '',
                parish: item.parish || '',
                emergency_phone: item.emergency_phone || ''
            } as Participant,
            pastRetreats: item.pastRetreats || [],
            isRegisteredInActiveEvent: !!item.alreadyRegisteredInEvent
        }))
    } catch (err) {
        console.error('Erro ao buscar participantes por nome:', err)
        return []
    }
}

// Reconhece o participante pelo e-mail, telefone ou CPF que ele mesmo digitou.
// Retorna histórico real de retiros e se já está inscrito no evento ativo.
export async function findParticipantByIdentifier(params: {
    email?: string
    phone?: string
    cpf?: string
    activeEventId?: string
}): Promise<ParticipantSearchResult | null> {
    const identifier = params.email?.trim() || params.phone?.trim() || params.cpf?.trim()
    if (!identifier) return null

    try {
        const { data, error } = await supabase.rpc('find_my_registration_status', {
            p_identifier: identifier,
            p_event_id: params.activeEventId || null
        })

        if (error) {
            console.error('Erro ao buscar participante por identificador:', error)
            return null
        }

        if (!data || !data.found) return null

        return {
            participant: data.participant as Participant,
            pastRetreats: data.pastRetreats || [],
            isRegisteredInActiveEvent: !!data.alreadyRegisteredInEvent
        }
    } catch (err) {
        console.error('Erro ao buscar participante por identificador:', err)
        return null
    }
}

export async function fetchParticipantHistory(participantId: string): Promise<ParticipantHistoryItem[]> {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*, event:events(*), payment:payments(*)')
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false })

        if (error || !data) {
            console.error('Erro ao buscar histórico do participante:', error)
            return []
        }

        return data.map((item: any) => ({
            registrationId: item.id,
            eventId: item.event?.id || '',
            eventSlug: item.event?.slug || '',
            eventName: item.event?.name || 'Retiro',
            eventYear: item.event?.year || 0,
            eventStatus: item.event?.status || 'completed',
            kitOption: item.kit_option || 'Kit Inscrição',
            tshirtSize: item.tshirt_size,
            tshirtSize2: item.tshirt_size_2,
            registrationStatus: item.status,
            createdAt: item.created_at,
            payment: item.payment ? {
                id: item.payment.id,
                amount: item.payment.amount || 0,
                status: item.payment.status || 'Pendente',
                paymentReceiptUrl: item.payment.payment_receipt_url,
                paidAt: item.payment.paid_at
            } : null
        }))
    } catch (err) {
        console.error('Erro ao buscar histórico do participante:', err)
        return []
    }
}
