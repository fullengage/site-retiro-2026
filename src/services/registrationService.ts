import { supabase } from '../lib/supabase'
import { Participant, RegistrationDetailed } from '../types/database'

export interface SubmitRegistrationParams {
    participantData: Partial<Participant>
    eventId: string
    kitOption: string
    tshirtSize?: string
    tshirtSize2?: string
    stayingOnSite?: boolean
    paymentAmount: number
    notes?: string
}

export async function createEventRegistration(params: SubmitRegistrationParams) {
    const { data, error } = await supabase.rpc('submit_event_registration', {
        p_participant: {
            full_name: params.participantData.full_name?.trim(),
            email: params.participantData.email?.trim().toLowerCase() || null,
            phone: params.participantData.phone?.trim() || null,
            cpf: params.participantData.cpf?.trim() || null,
            birth_date: params.participantData.birth_date || null,
            gender: params.participantData.gender || null,
            address: params.participantData.address || null,
            city: params.participantData.city || null,
            parish: params.participantData.parish || null,
            emergency_phone: params.participantData.emergency_phone || null
        },
        p_event_id: params.eventId,
        p_kit_option: params.kitOption,
        p_tshirt_size: params.tshirtSize || null,
        p_tshirt_size_2: params.tshirtSize2 || null,
        p_staying_on_site: params.stayingOnSite || false,
        p_payment_amount: params.paymentAmount
    })

    if (error) {
        console.error('Erro ao criar inscrição:', error)
        throw error
    }

    return {
        participant: {
            id: data.participant_id,
            full_name: params.participantData.full_name,
            email: params.participantData.email,
            phone: params.participantData.phone
        },
        registration: { id: data.registration_id },
        payment: { id: data.payment_id, amount: params.paymentAmount, status: 'Pendente' }
    }
}

export async function uploadReceiptAndLinkPayment(params: {
    registrationId: string
    paymentId?: string
    file: File
    emailOrPhone: string
    eventSlug?: string
}): Promise<string> {
    const fileExt = params.file.name.split('.').pop()
    const cleanId = params.emailOrPhone.replace(/[^a-zA-Z0-9]/g, '_')
    const folder = params.eventSlug || 'adonai-2026'
    const fileName = `${folder}/${Date.now()}_${cleanId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('pagamentos')
        .upload(fileName, params.file, {
            cacheControl: '3600',
            upsert: false
        })

    if (uploadError) {
        console.error('Erro no upload do comprovante:', uploadError)
        throw new Error('Falha no upload do arquivo. Tente novamente ou envie via WhatsApp.')
    }

    const { data: { publicUrl } } = supabase.storage
        .from('pagamentos')
        .getPublicUrl(fileName)

    const { error: linkError } = await supabase.rpc('link_payment_receipt', {
        p_registration_id: params.registrationId,
        p_receipt_url: publicUrl
    })

    if (linkError) {
        console.error('Erro ao vincular comprovante à inscrição:', linkError)
    }

    return publicUrl
}

export async function fetchAllDetailedRegistrations(eventSlug?: string): Promise<RegistrationDetailed[]> {
    try {
        let query = supabase
            .from('registrations')
            .select('*, participant:participants(*), event:events(*), payment:payments(*)')
            .order('created_at', { ascending: false })

        if (eventSlug) {
            const { data: evt } = await supabase.from('events').select('id').eq('slug', eventSlug).maybeSingle()
            if (!evt) return []
            query = query.eq('event_id', evt.id)
        }

        const { data, error } = await query

        if (error || !data) {
            console.error('Erro ao carregar inscrições:', error)
            return []
        }

        return data.map((reg: any) => ({
            id: reg.id,
            created_at: reg.created_at,
            kit_option: reg.kit_option || 'Kit Inscrição',
            tshirt_size: reg.tshirt_size,
            tshirt_size_2: reg.tshirt_size_2,
            staying_on_site: reg.staying_on_site || false,
            assigned_angel: reg.assigned_angel,
            status: reg.status,
            notes: reg.notes,
            participant: reg.participant,
            event: {
                ...reg.event,
                kit_options: Array.isArray(reg.event?.kit_options) ? reg.event.kit_options : [],
                pix_info: reg.event?.pix_info || {}
            },
            payment: reg.payment ? {
                id: reg.payment.id,
                registration_id: reg.id,
                amount: reg.payment.amount || 0,
                status: reg.payment.status || 'Pendente',
                payment_method: reg.payment.payment_method || 'PIX',
                payment_receipt_url: reg.payment.payment_receipt_url,
                paid_at: reg.payment.paid_at
            } : null
        }))
    } catch (err) {
        console.error('Erro ao buscar inscrições:', err)
        return []
    }
}

export async function updatePaymentAndRegistrationStatus(params: {
    registrationId: string
    paymentStatus: 'Pendente' | 'Pago' | 'Cancelado'
}) {
    const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: params.paymentStatus, paid_at: params.paymentStatus === 'Pago' ? new Date().toISOString() : null })
        .eq('registration_id', params.registrationId)

    if (paymentError) {
        console.error('Erro ao atualizar pagamento:', paymentError)
        throw paymentError
    }

    const { data, error } = await supabase
        .from('registrations')
        .update({ status: params.paymentStatus === 'Pago' ? 'Confirmada' : 'Pendente' })
        .eq('id', params.registrationId)
        .select()
        .single()

    if (error) {
        console.error('Erro ao atualizar status da inscrição:', error)
        throw error
    }

    return data
}

export async function updateRegistrationAngel(registrationId: string, angelName: string | null) {
    const { data, error } = await supabase
        .from('registrations')
        .update({ assigned_angel: angelName })
        .eq('id', registrationId)
        .select()
        .single()

    if (error) {
        console.error('Erro ao atribuir anjo:', error)
        throw error
    }

    return data
}

export async function deleteRegistrationCascade(registrationId: string) {
    const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId)

    if (error) {
        console.error('Erro ao excluir inscrição:', error)
        throw error
    }
}
