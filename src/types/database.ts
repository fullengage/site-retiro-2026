export interface Participant {
    id: string
    full_name: string
    email?: string | null
    phone?: string | null
    cpf?: string | null
    birth_date?: string | null
    gender?: string | null
    address?: string | null
    city?: string | null
    parish?: string | null
    emergency_phone?: string | null
    created_at?: string
    updated_at?: string
}

export interface EventKitOption {
    id: string
    name: string
    price: number
    includesTshirt?: boolean
    tshirtCount?: number
}

export interface EventPixInfo {
    key: string
    keyType: string
    receiver: string
    bank?: string
    whatsappSupport?: string
}

export interface EventItem {
    id: string
    slug: string
    name: string
    year: number
    start_date?: string | null
    end_date?: string | null
    location?: string | null
    status: 'active' | 'upcoming' | 'completed' | 'cancelled'
    kit_options: EventKitOption[]
    pix_info: EventPixInfo
    created_at?: string
}

export interface Registration {
    id: string
    participant_id: string
    event_id: string
    kit_option: string
    tshirt_size?: string | null
    tshirt_size_2?: string | null
    staying_on_site?: boolean | null
    assigned_angel?: string | null
    status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Presente'
    notes?: string | null
    created_at?: string
    updated_at?: string
}

export interface Payment {
    id: string
    registration_id: string
    amount: number
    status: 'Pendente' | 'Pago' | 'Cancelado' | 'Reembolsado'
    payment_method: string
    payment_receipt_url?: string | null
    paid_at?: string | null
    notes?: string | null
    created_at?: string
    updated_at?: string
}

export interface RegistrationDetailed {
    id: string
    created_at: string
    kit_option: string
    tshirt_size?: string | null
    tshirt_size_2?: string | null
    staying_on_site?: boolean | null
    assigned_angel?: string | null
    status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Presente'
    notes?: string | null
    participant: Participant
    event: EventItem
    payment?: Payment | null
}

export interface ParticipantHistoryItem {
    registrationId: string
    eventId: string
    eventSlug: string
    eventName: string
    eventYear: number
    eventStatus: string
    kitOption: string
    tshirtSize?: string | null
    tshirtSize2?: string | null
    registrationStatus: string
    createdAt: string
    payment?: {
        id: string
        amount: number
        status: 'Pendente' | 'Pago' | 'Cancelado' | 'Reembolsado'
        paymentReceiptUrl?: string | null
        paidAt?: string | null
    } | null
}
