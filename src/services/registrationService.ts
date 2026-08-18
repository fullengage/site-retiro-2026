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
    const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .insert([{
            full_name: params.participantData.full_name?.trim(),
            email: params.participantData.email?.trim().toLowerCase() || null,
            phone: params.participantData.phone?.trim() || null,
            birth_date: params.participantData.birth_date || null,
            gender: params.participantData.gender || null,
            address: params.participantData.address || null,
            city: params.participantData.city || null,
            parish: params.participantData.parish || null,
            emergency_phone: params.participantData.emergency_phone || null,
            kit_option: params.kitOption,
            tshirt_size: params.tshirtSize || null,
            tshirt_size_2: params.tshirtSize2 || null,
            staying_on_site: params.stayingOnSite || false,
            payment_amount: params.paymentAmount,
            payment_status: 'Pendente',
            created_at: new Date().toISOString()
        }])
        .select()
        .single()

    if (regError) {
        console.error('Erro ao criar inscrição:', regError)
        throw regError
    }

    return {
        participant: {
            id: registration.id,
            full_name: registration.full_name,
            email: registration.email,
            phone: registration.phone
        },
        registration,
        payment: {
            id: registration.id,
            amount: registration.payment_amount,
            status: registration.payment_status
        }
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

    const { error: updateError } = await supabase
        .from('event_registrations')
        .update({
            payment_receipt_url: publicUrl,
        })
        .eq('id', params.registrationId)

    if (updateError) {
        console.error('Erro ao vincular comprovante à inscrição:', updateError)
    }

    return publicUrl
}

export async function fetchAllDetailedRegistrations(_eventSlug?: string): Promise<RegistrationDetailed[]> {
    try {
        const { data: legacyData, error: legacyError } = await supabase
            .from('event_registrations')
            .select('*')
            .order('created_at', { ascending: false })

        if (legacyError || !legacyData) {
            console.error('Erro ao carregar inscrições:', legacyError)
            return []
        }

        return legacyData.map(leg => ({
            id: leg.id,
            created_at: leg.created_at,
            kit_option: leg.kit_option || 'Kit Inscrição',
            tshirt_size: leg.tshirt_size,
            tshirt_size_2: leg.tshirt_size_2,
            staying_on_site: leg.staying_on_site || false,
            assigned_angel: leg.assigned_angel,
            status: leg.payment_status === 'Pago' ? 'Confirmada' : 'Pendente',
            notes: null,
            participant: {
                id: leg.id,
                full_name: leg.full_name || 'Participante',
                email: leg.email,
                phone: leg.phone,
                birth_date: leg.birth_date,
                gender: leg.gender,
                address: leg.address,
                city: leg.city,
                parish: leg.parish,
                emergency_phone: leg.emergency_phone
            },
            event: {
                id: 'adonai-2026',
                slug: 'adonai-2026',
                name: 'Retiro ADONAI 2026',
                year: 2026,
                status: 'active'
            },
            payment: {
                id: leg.id,
                amount: leg.payment_amount || 0,
                status: leg.payment_status || 'Pendente',
                payment_receipt_url: leg.payment_receipt_url,
                paid_at: leg.payment_status === 'Pago' ? leg.created_at : null
            }
        }))
    } catch (err) {
        console.error('Erro ao buscar inscrições:', err)
        return []
    }
}

export async function updatePaymentAndRegistrationStatus(params: {
    registrationId: string
    paymentId?: string
    paymentStatus: 'Pendente' | 'Pago' | 'Cancelado'
    registrationStatus?: 'Pendente' | 'Confirmada' | 'Cancelada'
}) {
    const statusMap = {
        'Pago': 'Pago',
        'Pendente': 'Pendente',
        'Cancelado': 'Cancelado'
    }

    const { data, error } = await supabase
        .from('event_registrations')
        .update({
            payment_status: statusMap[params.paymentStatus] || params.paymentStatus
        })
        .eq('id', params.registrationId)
        .select()
        .single()

    if (error) {
        console.error('Erro ao atualizar status:', error)
        throw error
    }

    return data
}

export async function updateRegistrationAngel(registrationId: string, angelName: string | null) {
    const { data, error } = await supabase
        .from('event_registrations')
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
        .from('event_registrations')
        .delete()
        .eq('id', registrationId)

    if (error) {
        console.error('Erro ao excluir inscrição:', error)
        throw error
    }
}
