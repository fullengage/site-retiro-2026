import { supabase } from '../lib/supabase'
import { Participant, ParticipantHistoryItem } from '../types/database'

export interface ParticipantSearchResult {
    participant: Participant
    pastRetreats: string[]
    isRegisteredInActiveEvent?: boolean
}

// Autocomplete por nome. Só traz nome/paróquia/histórico (sem contato) para não
// expor e-mail/telefone de terceiros a quem apenas digitou um nome parecido.
// O preenchimento completo dos dados sensíveis só acontece via findParticipantByIdentifier,
// quando a própria pessoa digita seu e-mail/telefone/CPF.
export async function searchParticipantsByName(
    nameQuery: string,
    _activeEventId?: string
): Promise<ParticipantSearchResult[]> {
    if (!nameQuery || nameQuery.trim().length < 2) return []

    try {
        const { data, error } = await supabase.rpc('search_participants_by_name', {
            p_name: nameQuery.trim()
        })

        if (error) {
            console.error('Erro ao buscar participantes por nome:', error)
            return []
        }

        return (data || []).map((item: any) => ({
            participant: {
                id: item.id,
                full_name: item.full_name,
                parish: item.parish || ''
            } as Participant,
            pastRetreats: item.pastRetreats || [],
            isRegisteredInActiveEvent: false
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
