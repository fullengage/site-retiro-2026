import React, { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Download, Users, CheckCircle,
    Shirt, History,
    X, Trash2, ChevronRight, Package, Loader2, Upload,
    Calendar, Sparkles, Phone, Check, AlertCircle,
    UserPlus, MessageCircle, Copy, ArrowUpDown, Filter, Clock,
    Flame, HeartHandshake, RefreshCw, Send,
    CopyCheck, MessageSquareText, ArrowRightLeft, ExternalLink, HelpCircle
} from 'lucide-react'
import { fetchEvents } from '../services/eventService'
import {
    fetchAllDetailedRegistrations,
    updatePaymentAndRegistrationStatus,
    updateRegistrationAngel,
    deleteRegistrationCascade,
    adminEnrollParticipantInEvent,
    transferRegistrationEvent
} from '../services/registrationService'
import { fetchParticipantHistory } from '../services/participantService'
import { supabase } from '../lib/supabase'
import { EventItem, RegistrationDetailed, ParticipantHistoryItem, Participant } from '../types/database'

export interface RegistrationWithCRM extends RegistrationDetailed {
    isFirstTime: boolean
    totalEventsCount: number
    pastEventsNames: string[]
}

export interface LeadParticipant {
    participant: Participant
    pastEvents: {
        id: string
        name: string
        slug: string
        year: number
        kitOption: string
    }[]
    totalPastEvents: number
    lastRegistrationDate: string
}

type DatePreset = 'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'
type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'amount_desc'
type CrmSegment = 'all' | 'first_time' | 'veteran'
type InviteTemplate = 'friendly' | 'youth' | 'urgent'
type LeadContactStatus = 'pending' | 'contacted' | 'confirmed' | 'declined'

const RegistrationAdmin = () => {
    const { userRole } = useOutletContext<{ userRole: 'admin' | 'redator' }>()

    const [events, setEvents] = useState<EventItem[]>([])
    const [selectedEventSlug, setSelectedEventSlug] = useState<string>('adonai-2026')
    const [allRegistrations, setAllRegistrations] = useState<RegistrationDetailed[]>([])
    const [loading, setLoading] = useState(true)

    // Abas Principais
    const [activeTab, setActiveTab] = useState<'list' | 'leads' | 'dashboard'>('list')

    // Filtros de Busca e Segmentação CRM
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('Todos')
    const [filterAngel, setFilterAngel] = useState('Todos')
    const [filterCrmSegment, setFilterCrmSegment] = useState<CrmSegment>('all')
    const [filterKit, setFilterKit] = useState('Todos')
    const [filterTshirtSize, setFilterTshirtSize] = useState('Todos')
    const [filterCity, setFilterCity] = useState('Todos')

    // Filtros de Data e Ordenação
    const [datePreset, setDatePreset] = useState<DatePreset>('all')
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')
    const [sortBy, setSortBy] = useState<SortOption>('created_desc')

    // Filtros e Configurações da Aba de Leads (A Convidar)
    const [leadsSearchTerm, setLeadsSearchTerm] = useState('')
    const [leadsPastEventFilter, setLeadsPastEventFilter] = useState('Todos')
    const [leadsStatusFilter, setLeadsStatusFilter] = useState<string>('Todos')
    const [inviteTemplate, setInviteTemplate] = useState<InviteTemplate>('friendly')
    const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null)
    const [copiedBroadcast, setCopiedBroadcast] = useState(false)

    // Menu rápido de mensagens do WhatsApp
    const [activeWaMenuRegId, setActiveWaMenuRegId] = useState<string | null>(null)

    // Pipeline de Contato dos Leads (armazenamento local por retiro)
    const [leadsContactStatuses, setLeadsContactStatuses] = useState<Record<string, LeadContactStatus>>({})

    // Modal de Transferência de Retiro
    const [transferModalReg, setTransferModalReg] = useState<RegistrationDetailed | null>(null)
    const [targetTransferEventId, setTargetTransferEventId] = useState<string>('')
    const [isTransferring, setIsTransferring] = useState(false)

    // Carrega status de contato salvos
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`crm_lead_statuses_${selectedEventSlug}`)
            if (saved) {
                setLeadsContactStatuses(JSON.parse(saved))
            } else {
                setLeadsContactStatuses({})
            }
        } catch {
            setLeadsContactStatuses({})
        }
    }, [selectedEventSlug])

    const setLeadStatus = (participantId: string, status: LeadContactStatus) => {
        setLeadsContactStatuses(prev => {
            const next = { ...prev, [participantId]: status }
            try {
                localStorage.setItem(`crm_lead_statuses_${selectedEventSlug}`, JSON.stringify(next))
            } catch (err) {
                console.error('Erro ao salvar status do lead:', err)
            }
            return next
        })
    }

    // Modal de Edição / Detalhes
    const [editingReg, setEditingReg] = useState<RegistrationWithCRM | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [uploadingReceipt, setUploadingReceipt] = useState(false)

    // Modal de Histórico 360° do Participante
    const [historyModalParticipant, setHistoryModalParticipant] = useState<{ id: string; name: string; email?: string | null; phone?: string | null } | null>(null)
    const [participantHistory, setParticipantHistory] = useState<ParticipantHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Modal de Inscrição Rápida em Outro Retiro (1 Clique)
    const [enrollModalParticipant, setEnrollModalParticipant] = useState<{ id: string; name: string; email?: string | null; phone?: string | null } | null>(null)
    const [enrollParticipantHistory, setEnrollParticipantHistory] = useState<ParticipantHistoryItem[]>([])
    const [loadingEnrollHistory, setLoadingEnrollHistory] = useState(false)
    const [enrollingEventId, setEnrollingEventId] = useState<string | null>(null)
    const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null)
    const [enrollErrorMessage, setEnrollErrorMessage] = useState<string | null>(null)
    const [enrollConfigs, setEnrollConfigs] = useState<Record<string, {
        kitOption: string
        paymentAmount: number
        paymentStatus: 'Pago' | 'Pendente'
        tshirtSize: string
        stayingOnSite: boolean
    }>>({})

    // Carregar eventos e inscrições ao inicializar
    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        setLoading(true)
        try {
            const evts = await fetchEvents()
            setEvents(evts)
            const active = evts.find(e => e.status === 'active')
            if (active) {
                setSelectedEventSlug(active.slug)
            } else if (evts.length > 0) {
                setSelectedEventSlug(evts[0].slug)
            }

            const data = await fetchAllDetailedRegistrations('all')
            setAllRegistrations(data)
        } catch (err) {
            console.error('Erro ao carregar dados iniciais:', err)
        } finally {
            setLoading(false)
        }
    }

    const refreshRegistrations = async () => {
        setLoading(true)
        try {
            const data = await fetchAllDetailedRegistrations('all')
            setAllRegistrations(data)
        } catch (err) {
            console.error('Erro ao recarregar inscrições:', err)
        } finally {
            setLoading(false)
        }
    }

    // Normalizador de texto para buscas
    const normalizeText = (str: string) =>
        (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

    const normalizeDigits = (str: string) =>
        (str || '').replace(/\D/g, '')

    // Mapeamento de histórico completo de cada participante por ID
    const participantHistoryMap = useMemo(() => {
        const map = new Map<string, RegistrationDetailed[]>()
        allRegistrations.forEach(reg => {
            const pId = reg.participant?.id
            if (pId) {
                const list = map.get(pId) || []
                list.push(reg)
                map.set(pId, list)
            }
        })
        return map
    }, [allRegistrations])

    // Evento selecionado atual
    const currentSelectedEvent = useMemo(() => {
        if (selectedEventSlug === 'all') return null
        return events.find(e => e.slug === selectedEventSlug) || null
    }, [events, selectedEventSlug])

    // Inscrições do evento selecionado enriquecidas com CRM
    const registrationsWithCRM = useMemo<RegistrationWithCRM[]>(() => {
        const base = selectedEventSlug === 'all'
            ? allRegistrations
            : allRegistrations.filter(r => r.event.slug === selectedEventSlug)

        return base.map(reg => {
            const pId = reg.participant?.id
            const allUserRegs = pId ? (participantHistoryMap.get(pId) || []) : [reg]
            
            // É primeira vez se em toda a base ele tem apenas 1 participação
            const isFirstTime = allUserRegs.length <= 1
            const otherRegs = allUserRegs.filter(r => r.id !== reg.id)
            const pastEventsNames = Array.from(new Set(otherRegs.map(r => r.event.name || r.event.slug).filter(Boolean)))

            return {
                ...reg,
                isFirstTime,
                totalEventsCount: allUserRegs.length,
                pastEventsNames
            }
        })
    }, [allRegistrations, selectedEventSlug, participantHistoryMap])

    // Lista de Leads para Reengajamento ("A Convidar"):
    // Participantes que estiveram em eventos anteriores mas NÃO estão inscritos no evento selecionado
    const leadsToInvite = useMemo<LeadParticipant[]>(() => {
        if (selectedEventSlug === 'all') return []

        // Conjunto de IDs e telefones já inscritos no evento selecionado
        const enrolledParticipantIds = new Set<string>()
        const enrolledPhones = new Set<string>()

        allRegistrations.forEach(r => {
            if (r.event.slug === selectedEventSlug) {
                if (r.participant?.id) enrolledParticipantIds.add(r.participant.id)
                const phone = normalizeDigits(r.participant?.phone || '')
                if (phone) enrolledPhones.add(phone)
            }
        })

        // Agrupa participantes de outros eventos que não estão no atual
        const candidatesMap = new Map<string, { participant: Participant; regs: RegistrationDetailed[] }>()

        allRegistrations.forEach(r => {
            if (r.event.slug !== selectedEventSlug) {
                const p = r.participant
                if (!p) return
                const pId = p.id || normalizeDigits(p.phone || '') || p.email || ''
                if (!pId) return

                const phoneDigits = normalizeDigits(p.phone || '')
                // Se já estiver inscrito no atual, pula
                if (enrolledParticipantIds.has(p.id) || (phoneDigits && enrolledPhones.has(phoneDigits))) {
                    return
                }

                const existing = candidatesMap.get(pId)
                if (existing) {
                    existing.regs.push(r)
                } else {
                    candidatesMap.set(pId, { participant: p, regs: [r] })
                }
            }
        })

        const leads: LeadParticipant[] = []
        candidatesMap.forEach(({ participant, regs }) => {
            const sortedRegs = [...regs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            const pastEvents = sortedRegs.map(r => ({
                id: r.event.id,
                name: r.event.name || r.event.slug,
                slug: r.event.slug,
                year: r.event.year,
                kitOption: r.kit_option
            }))

            leads.push({
                participant,
                pastEvents,
                totalPastEvents: pastEvents.length,
                lastRegistrationDate: sortedRegs[0]?.created_at || ''
            })
        })

        return leads
    }, [allRegistrations, selectedEventSlug])

    // Filtros de Data: Preset handler
    const applyDatePreset = (preset: DatePreset) => {
        setDatePreset(preset)
        const now = new Date()

        if (preset === 'all') {
            setStartDate('')
            setEndDate('')
            return
        }

        if (preset === 'today') {
            const todayStr = now.toISOString().split('T')[0]
            setStartDate(todayStr)
            setEndDate(todayStr)
            return
        }

        if (preset === '7days') {
            const past = new Date()
            past.setDate(past.getDate() - 7)
            setStartDate(past.toISOString().split('T')[0])
            setEndDate(now.toISOString().split('T')[0])
            return
        }

        if (preset === '30days') {
            const past = new Date()
            past.setDate(past.getDate() - 30)
            setStartDate(past.toISOString().split('T')[0])
            setEndDate(now.toISOString().split('T')[0])
            return
        }

        if (preset === 'this_month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            setStartDate(firstDay.toISOString().split('T')[0])
            setEndDate(now.toISOString().split('T')[0])
            return
        }
    }

    // Lista de Cidades Únicas
    const uniqueCities = useMemo(() => {
        return Array.from(new Set(allRegistrations.map(r => r.participant?.city?.trim()).filter(Boolean))).sort() as string[]
    }, [allRegistrations])

    // Aplicação de Todos os Filtros na Lista de Inscritos (com busca ultra precisa por telefone)
    const filteredRegistrations = useMemo(() => {
        const lowerSearch = normalizeText(searchTerm)
        const searchDigits = normalizeDigits(searchTerm)

        return registrationsWithCRM.filter(reg => {
            const participantName = normalizeText(reg.participant?.full_name || '')
            const participantEmail = normalizeText(reg.participant?.email || '')
            const participantPhone = normalizeText(reg.participant?.phone || '')
            const participantPhoneDigits = normalizeDigits(reg.participant?.phone || '')
            const participantCity = normalizeText(reg.participant?.city || '')
            const participantParish = normalizeText(reg.participant?.parish || '')
            const assignedAngel = normalizeText(reg.assigned_angel || '')

            // Match por telefone considerando diferentes formatos (DDD, 55, sem formatação)
            const matchesPhone = searchDigits.length >= 3 && (
                participantPhoneDigits.includes(searchDigits) ||
                searchDigits.includes(participantPhoneDigits) ||
                participantPhoneDigits.replace(/^55/, '').includes(searchDigits.replace(/^55/, '')) ||
                searchDigits.replace(/^55/, '').includes(participantPhoneDigits.replace(/^55/, ''))
            )

            const matchesSearch =
                !lowerSearch ||
                participantName.includes(lowerSearch) ||
                participantEmail.includes(lowerSearch) ||
                participantPhone.includes(lowerSearch) ||
                matchesPhone ||
                participantCity.includes(lowerSearch) ||
                participantParish.includes(lowerSearch) ||
                assignedAngel.includes(lowerSearch)

            // Filtro de Status de Pagamento
            const matchesStatus = filterStatus === 'Todos' || (reg.payment?.status || 'Pendente') === filterStatus

            // Filtro de Anjo
            const normalizedAssignedAngel = assignedAngel.trim()
            const normalizedFilterAngel = (filterAngel || '').trim()
            const matchesAngel = normalizedFilterAngel === 'Todos'
                ? true
                : normalizedFilterAngel === 'Sem Anjo'
                    ? normalizedAssignedAngel === ''
                    : normalizedAssignedAngel === normalizeText(normalizedFilterAngel)

            // Filtro CRM de Segmento (1ª Vez / Veterano)
            let matchesCrm = true
            if (filterCrmSegment === 'first_time') {
                matchesCrm = reg.isFirstTime
            } else if (filterCrmSegment === 'veteran') {
                matchesCrm = !reg.isFirstTime
            }

            // Filtro de Kit
            const matchesKit = filterKit === 'Todos' || reg.kit_option.includes(filterKit)

            // Filtro de Camiseta
            const matchesTshirt = filterTshirtSize === 'Todos' ||
                reg.tshirt_size === filterTshirtSize ||
                reg.tshirt_size_2 === filterTshirtSize

            // Filtro de Cidade
            const matchesCity = filterCity === 'Todos' || reg.participant?.city?.trim() === filterCity

            // Filtro de Data de Inscrição
            let matchesDate = true
            if (startDate || endDate) {
                const regDate = new Date(reg.created_at)
                if (startDate) {
                    const start = new Date(startDate + 'T00:00:00')
                    if (regDate < start) matchesDate = false
                }
                if (endDate) {
                    const end = new Date(endDate + 'T23:59:59')
                    if (regDate > end) matchesDate = false
                }
            }

            return matchesSearch && matchesStatus && matchesAngel && matchesCrm && matchesKit && matchesTshirt && matchesCity && matchesDate
        }).sort((a, b) => {
            if (sortBy === 'created_desc') {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            }
            if (sortBy === 'created_asc') {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            }
            if (sortBy === 'name_asc') {
                return (a.participant?.full_name || '').localeCompare(b.participant?.full_name || '')
            }
            if (sortBy === 'amount_desc') {
                return (b.payment?.amount || 0) - (a.payment?.amount || 0)
            }
            return 0
        })
    }, [
        registrationsWithCRM,
        searchTerm,
        filterStatus,
        filterAngel,
        filterCrmSegment,
        filterKit,
        filterTshirtSize,
        filterCity,
        startDate,
        endDate,
        sortBy
    ])

    // =========================================================================
    // BUSCA GLOBAL CROSS-RETIRO (Insight Inteligente)
    // Se o usuário buscou por nome ou telefone (ex: 17982193027 / Izabella)
    // e ela está em OUTRO retiro (ex: Carnaval), nós detectamos instantaneamente!
    // =========================================================================
    const crossEventMatches = useMemo(() => {
        if (!searchTerm || searchTerm.trim().length < 2 || selectedEventSlug === 'all') return []

        const lower = normalizeText(searchTerm)
        const digits = normalizeDigits(searchTerm)

        // IDs que já estão nos resultados filtrados do evento atual
        const currentFoundIds = new Set(filteredRegistrations.map(r => r.participant?.id))

        const matches: RegistrationDetailed[] = []
        allRegistrations.forEach(reg => {
            if (reg.event.slug === selectedEventSlug) return
            if (currentFoundIds.has(reg.participant?.id)) return

            const name = normalizeText(reg.participant?.full_name || '')
            const phone = normalizeText(reg.participant?.phone || '')
            const phoneDigits = normalizeDigits(reg.participant?.phone || '')
            const email = normalizeText(reg.participant?.email || '')

            const phoneMatch = digits.length >= 3 && (
                phoneDigits.includes(digits) ||
                digits.includes(phoneDigits) ||
                phoneDigits.replace(/^55/, '').includes(digits.replace(/^55/, '')) ||
                digits.replace(/^55/, '').includes(phoneDigits.replace(/^55/, ''))
            )

            if (name.includes(lower) || phone.includes(lower) || email.includes(lower) || phoneMatch) {
                matches.push(reg)
            }
        })

        return matches
    }, [searchTerm, selectedEventSlug, allRegistrations, filteredRegistrations])

    // Filtros na Lista de Leads de Reengajamento
    const filteredLeads = useMemo(() => {
        const lowerSearch = normalizeText(leadsSearchTerm)
        const searchDigits = normalizeDigits(leadsSearchTerm)

        return leadsToInvite.filter(lead => {
            const name = normalizeText(lead.participant.full_name || '')
            const phone = normalizeText(lead.participant.phone || '')
            const phoneDigits = normalizeDigits(lead.participant.phone || '')
            const email = normalizeText(lead.participant.email || '')
            const city = normalizeText(lead.participant.city || '')
            const parish = normalizeText(lead.participant.parish || '')

            const matchesPhone = searchDigits.length >= 3 && (
                phoneDigits.includes(searchDigits) ||
                searchDigits.includes(phoneDigits) ||
                phoneDigits.replace(/^55/, '').includes(searchDigits.replace(/^55/, ''))
            )

            const matchesSearch =
                !lowerSearch ||
                name.includes(lowerSearch) ||
                phone.includes(lowerSearch) ||
                matchesPhone ||
                email.includes(lowerSearch) ||
                city.includes(lowerSearch) ||
                parish.includes(lowerSearch)

            const matchesPastEvent =
                leadsPastEventFilter === 'Todos' ||
                lead.pastEvents.some(e => e.slug === leadsPastEventFilter || e.name.includes(leadsPastEventFilter))

            const leadStatus = leadsContactStatuses[lead.participant.id] || 'pending'
            const matchesStatus = leadsStatusFilter === 'Todos' || leadStatus === leadsStatusFilter

            return matchesSearch && matchesPastEvent && matchesStatus
        })
    }, [leadsToInvite, leadsSearchTerm, leadsPastEventFilter, leadsStatusFilter, leadsContactStatuses])

    // Lista de Anjos únicos
    const uniqueAngels = useMemo(() => {
        return Array.from(new Set(registrationsWithCRM.map(r => r.assigned_angel?.trim()).filter(Boolean))).sort() as string[]
    }, [registrationsWithCRM])

    // Estatísticas e Métricas do CRM
    const stats = useMemo(() => {
        const kits: Record<string, number> = {}
        const tshirts: Record<string, number> = {}
        let totalTshirts = 0
        let totalRevenue = 0
        let paidCount = 0
        let pendingCount = 0
        let maleCount = 0
        let femaleCount = 0
        let stayingOnSiteCount = 0
        let firstTimeCount = 0
        let veteranCount = 0

        filteredRegistrations.forEach(reg => {
            if (reg.payment?.status === 'Cancelado') return

            if (reg.isFirstTime) firstTimeCount++
            else veteranCount++

            const kitName = reg.kit_option ? reg.kit_option.split(' - ')[0] : 'Sem Kit'
            kits[kitName] = (kits[kitName] || 0) + 1

            if (reg.payment?.status === 'Pago') {
                totalRevenue += Number(reg.payment?.amount || 0)
                paidCount++
            } else {
                pendingCount++
            }

            if (reg.tshirt_size) {
                tshirts[reg.tshirt_size] = (tshirts[reg.tshirt_size] || 0) + 1
                totalTshirts++
            }
            if (reg.tshirt_size_2) {
                tshirts[reg.tshirt_size_2] = (tshirts[reg.tshirt_size_2] || 0) + 1
                totalTshirts++
            }

            if (reg.participant.gender === 'Masculino') maleCount++
            else if (reg.participant.gender === 'Feminino') femaleCount++

            if (reg.staying_on_site) stayingOnSiteCount++
        })

        const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3']
        const sortedTshirts = Object.entries(tshirts).sort((a: [string, number], b: [string, number]) => {
            const idxA = sizeOrder.indexOf(a[0])
            const idxB = sizeOrder.indexOf(b[0])
            if (idxA !== -1 && idxB !== -1) return idxA - idxB
            return a[0].localeCompare(b[0])
        })

        const totalFiltered = filteredRegistrations.length
        const firstTimePercent = totalFiltered > 0 ? Math.round((firstTimeCount / totalFiltered) * 100) : 0
        const veteranPercent = totalFiltered > 0 ? Math.round((veteranCount / totalFiltered) * 100) : 0

        // Estatísticas do Funil de Leads
        let leadsPendingCount = 0
        let leadsContactedCount = 0
        let leadsConfirmedCount = 0

        leadsToInvite.forEach(lead => {
            const st = leadsContactStatuses[lead.participant.id] || 'pending'
            if (st === 'pending') leadsPendingCount++
            if (st === 'contacted') leadsContactedCount++
            if (st === 'confirmed') leadsConfirmedCount++
        })

        return {
            totalRegistrations: totalFiltered,
            paidCount,
            pendingCount,
            totalRevenue,
            totalTshirts,
            maleCount,
            femaleCount,
            stayingOnSiteCount,
            firstTimeCount,
            veteranCount,
            firstTimePercent,
            veteranPercent,
            leadsCount: leadsToInvite.length,
            leadsPendingCount,
            leadsContactedCount,
            leadsConfirmedCount,
            kits,
            sortedTshirts
        }
    }, [filteredRegistrations, leadsToInvite, leadsContactStatuses])

    const calculateAge = (birthDate?: string | null) => {
        if (!birthDate) return 'N/A'
        const birth = new Date(birthDate)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return isNaN(age) ? 'N/A' : age
    }

    const formatDateShort = (isoString?: string) => {
        if (!isoString) return '-'
        const date = new Date(isoString)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const formatDateTime = (isoString?: string) => {
        if (!isoString) return '-'
        const date = new Date(isoString)
        if (isNaN(date.getTime())) return '-'
        return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }

    // Gerador de Mensagens de WhatsApp com 1 Clique (Vários tipos)
    const generateMessage = (type: 'invite' | 'confirmation' | 'pix_reminder', participant: Participant, reg?: RegistrationDetailed) => {
        const firstName = (participant.full_name || 'Amigo(a)').split(' ')[0]
        const eventName = reg?.event?.name || currentSelectedEvent?.name || 'nosso próximo Retiro'
        const currentUrl = window.location.origin + '/inscricao'

        if (type === 'confirmation') {
            return `Paz e bem, ${firstName}! ✨\n\nSua inscrição no *${eventName}* foi *CONFIRMADA com sucesso*! 🎉\n\nEstamos preparando tudo com muito amor e oração para te acolher. Qualquer dúvida, conte conosco!\n\nComunidade Voz de Deus 🙏`
        }

        if (type === 'pix_reminder') {
            const amount = reg?.payment?.amount ? `R$ ${reg.payment.amount},00` : 'o valor da sua inscrição'
            return `Olá, ${firstName}! Tudo bem? 🙏\n\nVimos que sua inscrição para o *${eventName}* está pendente do comprovante de pagamento no valor de *${amount}*.\n\nPara garantir sua vaga e a confecção da sua camiseta, você pode nos enviar o comprovante por aqui mesmo!\n\nFicamos no aguardo! Deus abençoe! ✨`
        }

        // Convite (invite)
        if (inviteTemplate === 'youth') {
            return `E aí, ${firstName}! Tudo bem? 🔥\n\nBora viver algo sobrenatural? As inscrições para o *${eventName}* da Comunidade Voz de Deus já tão rolando a todo vapor! 🚀\n\nComo você já esteve com a gente antes, a sua presença faz toda a diferença nessa energia e unção! ✨\n\n👉 Clica aqui e garante sua vaga:\n${currentUrl}\n\nChama lá se tiver qualquer dúvida!`
        }

        if (inviteTemplate === 'urgent') {
            return `Olá, ${firstName}! Passando com um aviso super importante! ⏳\n\nAs vagas e lotes promocionais para o *${eventName}* já estão chegando ao final! 🏃‍♂️💨\n\nLembramos com muito carinho da sua participação anterior e não queremos que você fique de fora desta edição abençoada.\n\n👉 Garanta sua vaga agora mesmo no site:\n${currentUrl}\n\nDeus abençoe!`
        }

        return `Olá, ${firstName}! Tudo bem com você? 🙏\n\nSentimos sua falta na comunidade! As inscrições para o *${eventName}* já estão abertas.\n\nComo você já participou com a gente em edições anteriores, gostaríamos muito de ter você conosco novamente vivendo esse momento inesquecível de graça e fé! ✨\n\n👉 Acesse o link para conferir os detalhes e garantir sua vaga:\n${currentUrl}\n\nFicamos à disposição caso precise de ajuda!`
    }

    const getWhatsAppLink = (participant: Participant, type: 'invite' | 'confirmation' | 'pix_reminder' = 'invite', reg?: RegistrationDetailed) => {
        const phone = normalizeDigits(participant.phone || '')
        if (!phone) return null
        const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`
        const msg = generateMessage(type, participant, reg)
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
    }

    const handleCopyInviteMessage = (lead: LeadParticipant) => {
        const msg = generateMessage('invite', lead.participant)
        navigator.clipboard.writeText(msg)
        setCopiedLeadId(lead.participant.id)
        if (!leadsContactStatuses[lead.participant.id]) {
            setLeadStatus(lead.participant.id, 'contacted')
        }
        setTimeout(() => {
            setCopiedLeadId(null)
        }, 3000)
    }

    const handleCopyBroadcastList = () => {
        const validPhones = filteredLeads
            .map(l => normalizeDigits(l.participant.phone || ''))
            .filter(Boolean)
            .map(p => p.startsWith('55') ? p : `55${p}`)

        if (validPhones.length === 0) {
            alert('Nenhum número de telefone válido encontrado nesta lista.')
            return
        }

        const phoneText = validPhones.join('\n')
        navigator.clipboard.writeText(phoneText)
        setCopiedBroadcast(true)
        setTimeout(() => setCopiedBroadcast(false), 3000)
    }

    const openParticipantHistory = async (participant: { id: string; name: string; email?: string | null; phone?: string | null }) => {
        setHistoryModalParticipant(participant)
        setLoadingHistory(true)
        try {
            const history = await fetchParticipantHistory(participant.id)
            setParticipantHistory(history)
        } catch (err) {
            console.error('Erro ao buscar histórico do participante:', err)
        } finally {
            setLoadingHistory(false)
        }
    }

    const openTransferModal = (reg: RegistrationDetailed) => {
        setTransferModalReg(reg)
        // Pré-seleciona o evento ativo atual
        const defaultTarget = events.find(e => e.id !== reg.event.id && e.status === 'active') || events.find(e => e.id !== reg.event.id)
        if (defaultTarget) {
            setTargetTransferEventId(defaultTarget.id)
        }
    }

    const handleExecuteTransfer = async () => {
        if (!transferModalReg || !targetTransferEventId) return
        setIsTransferring(true)
        try {
            const targetEvent = events.find(e => e.id === targetTransferEventId)
            await transferRegistrationEvent({
                registrationId: transferModalReg.id,
                targetEventId: targetTransferEventId
            })
            alert(`Inscrição transferida com sucesso para o ${targetEvent?.name || 'novo retiro'}!`)
            setTransferModalReg(null)
            refreshRegistrations()
        } catch (err: any) {
            alert('Erro ao transferir inscrição: ' + err.message)
        } finally {
            setIsTransferring(false)
        }
    }

    const openEnrollModal = async (participant: { id: string; name: string; email?: string | null; phone?: string | null }) => {
        setEnrollModalParticipant(participant)
        setLoadingEnrollHistory(true)
        setEnrollSuccessMessage(null)
        setEnrollErrorMessage(null)

        const initialConfigs: Record<string, {
            kitOption: string
            paymentAmount: number
            paymentStatus: 'Pago' | 'Pendente'
            tshirtSize: string
            stayingOnSite: boolean
        }> = {}

        events.forEach(evt => {
            const defaultKit = evt.kit_options?.[0]
            initialConfigs[evt.id] = {
                kitOption: defaultKit?.name || 'Inscrição Completa (Com Camiseta)',
                paymentAmount: defaultKit?.price || 70,
                paymentStatus: 'Pago',
                tshirtSize: 'M',
                stayingOnSite: false
            }
        })
        setEnrollConfigs(initialConfigs)

        try {
            const history = await fetchParticipantHistory(participant.id)
            setEnrollParticipantHistory(history)
        } catch (err) {
            console.error('Erro ao buscar histórico para inscrição:', err)
        } finally {
            setLoadingEnrollHistory(false)
        }
    }

    const updateEnrollConfig = (eventId: string, partial: Partial<{
        kitOption: string
        paymentAmount: number
        paymentStatus: 'Pago' | 'Pendente'
        tshirtSize: string
        stayingOnSite: boolean
    }>) => {
        setEnrollConfigs(prev => ({
            ...prev,
            [eventId]: {
                ...(prev[eventId] || {
                    kitOption: 'Inscrição Completa (Com Camiseta)',
                    paymentAmount: 70,
                    paymentStatus: 'Pago',
                    tshirtSize: 'M',
                    stayingOnSite: false
                }),
                ...partial
            }
        }))
    }

    const handleExecuteEnroll = async (eventId: string) => {
        if (!enrollModalParticipant) return
        setEnrollingEventId(eventId)
        setEnrollErrorMessage(null)
        setEnrollSuccessMessage(null)

        const config = enrollConfigs[eventId] || {
            kitOption: 'Inscrição Completa (Com Camiseta)',
            paymentAmount: 70,
            paymentStatus: 'Pago',
            tshirtSize: 'M',
            stayingOnSite: false
        }

        try {
            await adminEnrollParticipantInEvent({
                participantId: enrollModalParticipant.id,
                eventId: eventId,
                kitOption: config.kitOption,
                paymentAmount: config.paymentAmount,
                paymentStatus: config.paymentStatus,
                tshirtSize: config.tshirtSize,
                stayingOnSite: config.stayingOnSite
            })

            const targetEvent = events.find(e => e.id === eventId)
            setEnrollSuccessMessage(`Participante inscrito com sucesso no ${targetEvent?.name || 'Retiro'}!`)

            setLeadStatus(enrollModalParticipant.id, 'confirmed')

            const updatedHistory = await fetchParticipantHistory(enrollModalParticipant.id)
            setEnrollParticipantHistory(updatedHistory)

            refreshRegistrations()
        } catch (err: any) {
            console.error('Erro ao realizar inscrição:', err)
            setEnrollErrorMessage(err?.message || 'Falha ao realizar inscrição no retiro.')
        } finally {
            setEnrollingEventId(null)
        }
    }

    const handleTogglePaymentStatus = async (reg: RegistrationWithCRM) => {
        const nextStatus = reg.payment?.status === 'Pago' ? 'Pendente' : 'Pago'
        try {
            await updatePaymentAndRegistrationStatus({
                registrationId: reg.id,
                paymentStatus: nextStatus
            })

            setAllRegistrations(prev => prev.map(r => {
                if (r.id === reg.id) {
                    return {
                        ...r,
                        status: nextStatus === 'Pago' ? 'Confirmada' : 'Pendente',
                        payment: r.payment ? { ...r.payment, status: nextStatus } : null
                    }
                }
                return r
            }))
        } catch (err: any) {
            alert('Erro ao atualizar status: ' + err.message)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Esta ação removerá permanentemente a inscrição e seu pagamento. Deseja continuar?')) return

        setDeletingId(id)
        try {
            await deleteRegistrationCascade(id)
            setAllRegistrations(prev => prev.filter(r => r.id !== id))
        } catch (err: any) {
            alert('Erro ao excluir inscrição: ' + err.message)
        } finally {
            setDeletingId(null)
        }
    }

    const handleAdminReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !editingReg) return

        const file = e.target.files[0]
        if (file.size > 10 * 1024 * 1024) {
            alert('O arquivo deve ter no máximo 10MB')
            return
        }

        setUploadingReceipt(true)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${editingReg.event.slug || 'comprovantes'}/${Date.now()}_admin.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('pagamentos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('pagamentos')
                .getPublicUrl(fileName)

            if (editingReg.payment?.id) {
                await supabase
                    .from('payments')
                    .update({ payment_receipt_url: publicUrl })
                    .eq('id', editingReg.payment.id)
            }

            setEditingReg({
                ...editingReg,
                payment: editingReg.payment ? { ...editingReg.payment, payment_receipt_url: publicUrl } : null
            })

            refreshRegistrations()
        } catch (err: any) {
            console.error('Upload error:', err)
            alert(err.message || 'Erro ao enviar comprovante')
        } finally {
            setUploadingReceipt(false)
        }
    }

    const exportToCSV = () => {
        const headers = [
            'ID Inscrição',
            'Perfil CRM',
            'Total Participações',
            'Retiro Atual',
            'Nome Completo',
            'Email',
            'Telefone',
            'Idade',
            'Gênero',
            'Cidade',
            'Paróquia',
            'Contato Emergência',
            'Endereço',
            'Kit',
            'Camiseta 1',
            'Camiseta 2',
            'Pernoite',
            'Status Pagamento',
            'Valor (R$)',
            'Anjo Responsável',
            'Data Inscrição',
            'Comprovante URL'
        ]

        const rows = filteredRegistrations.map(r => [
            `"${r.id}"`,
            `"${r.isFirstTime ? 'Primeira Vez (Calouro)' : 'Veterano'}"`,
            `"${r.totalEventsCount}"`,
            `"${r.event.name || selectedEventSlug}"`,
            `"${r.participant.full_name}"`,
            `"${r.participant.email || ''}"`,
            `"${r.participant.phone || ''}"`,
            `"${calculateAge(r.participant.birth_date)}"`,
            `"${r.participant.gender || ''}"`,
            `"${r.participant.city || ''}"`,
            `"${r.participant.parish || ''}"`,
            `"${r.participant.emergency_phone || ''}"`,
            `"${r.participant.address || ''}"`,
            `"${r.kit_option}"`,
            `"${r.tshirt_size || ''}"`,
            `"${r.tshirt_size_2 || ''}"`,
            `"${r.staying_on_site ? 'Sim' : 'Não'}"`,
            `"${r.payment?.status || 'Pendente'}"`,
            `"${r.payment?.amount || 0}"`,
            `"${r.assigned_angel || 'Não atribuído'}"`,
            `"${new Date(r.created_at).toLocaleDateString('pt-BR')} ${new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}"`,
            `"${r.payment?.payment_receipt_url || ''}"`
        ])

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `crm_inscricoes_${selectedEventSlug}_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const exportLeadsToCSV = () => {
        const headers = [
            'Nome Completo',
            'Telefone / WhatsApp',
            'Status Abordagem CRM',
            'Email',
            'Cidade',
            'Paróquia',
            'Total Retiros Anteriores',
            'Retiros Participados',
            'Última Inscrição'
        ]

        const rows = filteredLeads.map(lead => {
            const st = leadsContactStatuses[lead.participant.id] || 'pending'
            const stLabel = st === 'confirmed' ? 'Confirmou Presença' : st === 'contacted' ? 'Convite Enviado' : st === 'declined' ? 'Recusou' : 'Não Contatado'
            return [
                `"${lead.participant.full_name}"`,
                `"${lead.participant.phone || ''}"`,
                `"${stLabel}"`,
                `"${lead.participant.email || ''}"`,
                `"${lead.participant.city || ''}"`,
                `"${lead.participant.parish || ''}"`,
                `"${lead.totalPastEvents}"`,
                `"${lead.pastEvents.map(e => e.name).join(' | ')}"`,
                `"${formatDateShort(lead.lastRegistrationDate)}"`
            ]
        })

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `crm_leads_reengajamento_${selectedEventSlug}_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* ========================================================================= */}
            {/* CABEÇALHO & SELETOR DE EVENTO                                            */}
            {/* ========================================================================= */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-holi-surface/90 via-purple-950/20 to-holi-surface/90 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
                            CRM & Gestão de Inscrições
                        </h1>
                        <span className="px-3 py-1 bg-gradient-to-r from-holi-primary/30 to-purple-600/30 text-holi-accent border border-holi-primary/40 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                            <Sparkles size={12} /> Inteligência de Público
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Busca por telefone/nome em todos os retiros, troca rápida de evento e mensagens com 1 clique no WhatsApp.
                    </p>
                </div>

                {/* SELETOR DE RETIRO MULTI-EVENTO */}
                <div className="flex flex-wrap items-center gap-2 bg-black/50 p-2 rounded-2xl border border-white/10 shadow-inner">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">Retiro Alvo:</span>
                    {events.map(evt => (
                        <button
                            key={evt.slug}
                            onClick={() => setSelectedEventSlug(evt.slug)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                selectedEventSlug === evt.slug
                                    ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white shadow-lg shadow-holi-primary/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {evt.status === 'active' && <Sparkles size={12} className="text-amber-300" />}
                            {evt.name.replace('Retiro de ', '').replace('Retiro ', '')}
                        </button>
                    ))}
                    <button
                        onClick={() => setSelectedEventSlug('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                            selectedEventSlug === 'all'
                                ? 'bg-white text-black font-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Base Geral (Todos)
                    </button>
                    <button
                        onClick={refreshRegistrations}
                        title="Atualizar dados"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* CARDS DE KPIS & MÉTRICAS DE CRM                                           */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* 1. TOTAL DE INSCRITOS */}
                <div
                    onClick={() => { setActiveTab('list'); setFilterCrmSegment('all'); }}
                    className="bg-holi-surface/80 border border-white/10 hover:border-holi-primary/50 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs uppercase font-bold">Inscritos</span>
                        <Users size={16} className="text-holi-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-white">{stats.totalRegistrations}</div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">no filtro atual</span>
                </div>

                {/* 2. PRIMEIRA VEZ (NOVATOS) */}
                <div
                    onClick={() => { setActiveTab('list'); setFilterCrmSegment('first_time'); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group ${
                        filterCrmSegment === 'first_time' && activeTab === 'list'
                            ? 'bg-amber-500/15 border-amber-400/60 shadow-lg shadow-amber-500/10'
                            : 'bg-holi-surface/80 border-white/10 hover:border-amber-400/40'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-amber-300 text-xs uppercase font-bold flex items-center gap-1">
                            <Sparkles size={13} /> 1ª Vez
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                            {stats.firstTimePercent}%
                        </span>
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-amber-400">{stats.firstTimeCount}</div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Calouros / Novos</span>
                </div>

                {/* 3. VETERANOS (RETENÇÃO) */}
                <div
                    onClick={() => { setActiveTab('list'); setFilterCrmSegment('veteran'); }}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group ${
                        filterCrmSegment === 'veteran' && activeTab === 'list'
                            ? 'bg-purple-500/15 border-purple-400/60 shadow-lg shadow-purple-500/10'
                            : 'bg-holi-surface/80 border-white/10 hover:border-purple-400/40'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-purple-300 text-xs uppercase font-bold flex items-center gap-1">
                            <HeartHandshake size={13} /> Veteranos
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-400/20 text-purple-300">
                            {stats.veteranPercent}%
                        </span>
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-purple-400">{stats.veteranCount}</div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Já participaram antes</span>
                </div>

                {/* 4. A CONVIDAR / REENGAJAMENTO */}
                <div
                    onClick={() => setActiveTab('leads')}
                    className={`border p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group ${
                        activeTab === 'leads'
                            ? 'bg-rose-500/20 border-rose-400/60 shadow-lg shadow-rose-500/20'
                            : 'bg-gradient-to-br from-rose-950/30 to-holi-surface border-rose-500/30 hover:border-rose-400/50'
                    }`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-rose-400 text-xs uppercase font-bold flex items-center gap-1">
                            <Flame size={13} /> A Convidar
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 animate-pulse">
                            Quentes
                        </span>
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-rose-400">{stats.leadsCount}</div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                        {stats.leadsConfirmedCount > 0 ? `${stats.leadsConfirmedCount} confirmados` : 'Faltam neste retiro'}
                    </span>
                </div>

                {/* 5. CONFIRMADOS (PAGOS) */}
                <div
                    onClick={() => { setActiveTab('list'); setFilterStatus('Pago'); }}
                    className="bg-holi-surface/80 border border-white/10 hover:border-green-500/40 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-green-400 text-xs uppercase font-bold">Pagos</span>
                        <CheckCircle size={15} className="text-green-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-green-400">{stats.paidCount}</div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">R$ {stats.totalRevenue},00</span>
                </div>

                {/* 6. PENDENTES */}
                <div
                    onClick={() => { setActiveTab('list'); setFilterStatus('Pendente'); }}
                    className="bg-holi-surface/80 border border-white/10 hover:border-amber-500/40 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-amber-400 text-xs uppercase font-bold">Pendentes</span>
                        <Clock size={15} className="text-amber-400" />
                    </div>
                    <div className="text-2xl lg:text-3xl font-black text-amber-400">{stats.pendingCount}</div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{stats.totalTshirts} camisetas</span>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* NAVEGAÇÃO DE ABAS                                                         */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'list'
                                ? 'bg-holi-primary text-white shadow-lg shadow-holi-primary/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Users size={15} />
                        Inscritos no Retiro
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-white font-mono">
                            {filteredRegistrations.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'leads'
                                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30'
                                : 'text-rose-400 hover:text-white hover:bg-rose-500/10'
                        }`}
                    >
                        <Flame size={15} />
                        A Convidar / Reengajamento
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/30 text-rose-200 font-mono">
                            {stats.leadsCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            activeTab === 'dashboard'
                                ? 'bg-holi-secondary text-white shadow-lg shadow-holi-secondary/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Shirt size={15} />
                        Métricas & Camisetas
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {activeTab === 'list' && (
                        <button
                            onClick={exportToCSV}
                            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 border border-white/10"
                        >
                            <Download size={14} /> Exportar CSV ({filteredRegistrations.length})
                        </button>
                    )}
                    {activeTab === 'leads' && (
                        <>
                            <button
                                onClick={handleCopyBroadcastList}
                                title="Copiar lista de telefones para criar lista de transmissão no WhatsApp"
                                className={`px-3.5 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 border ${
                                    copiedBroadcast
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30'
                                }`}
                            >
                                {copiedBroadcast ? <CopyCheck size={14} /> : <Send size={14} />}
                                {copiedBroadcast ? 'Telefones Copiados!' : 'Copiar Lista Telefones'}
                            </button>
                            <button
                                onClick={exportLeadsToCSV}
                                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 border border-rose-500/30"
                            >
                                <Download size={14} /> Exportar Leads CSV ({filteredLeads.length})
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* ABA 1: LISTAGEM DE INSCRIÇÕES COM FILTROS AVANÇADOS DE CRM & DATAS        */}
            {/* ========================================================================= */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    {/* BARRA DE FILTROS SUPERIOR */}
                    <div className="bg-holi-surface/60 border border-white/10 p-4 rounded-3xl space-y-3.5 backdrop-blur-md">
                        {/* LINHA 1: Busca e Segmentos de Fidelidade */}
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                            {/* Busca Geral com suporte ultra-inteligente a Telefone */}
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por telefone (ex: 17982193027), nome (ex: Izabella), email ou cidade..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-holi-primary transition-colors font-medium"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Segmentação CRM Rápida (Pílulas) */}
                            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 overflow-x-auto">
                                <button
                                    onClick={() => setFilterCrmSegment('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                        filterCrmSegment === 'all'
                                            ? 'bg-white text-black'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Todos ({registrationsWithCRM.length})
                                </button>
                                <button
                                    onClick={() => setFilterCrmSegment('first_time')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                        filterCrmSegment === 'first_time'
                                            ? 'bg-amber-400 text-black font-black shadow-lg shadow-amber-400/20'
                                            : 'text-amber-300 hover:bg-amber-400/10'
                                    }`}
                                >
                                    <Sparkles size={13} />
                                    🌟 1ª Vez ({registrationsWithCRM.filter(r => r.isFirstTime).length})
                                </button>
                                <button
                                    onClick={() => setFilterCrmSegment('veteran')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                        filterCrmSegment === 'veteran'
                                            ? 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/20'
                                            : 'text-purple-300 hover:bg-purple-500/10'
                                    }`}
                                >
                                    <HeartHandshake size={13} />
                                    🔄 Veteranos ({registrationsWithCRM.filter(r => !r.isFirstTime).length})
                                </button>
                            </div>
                        </div>

                        {/* LINHA 2: Filtros por Datas de Inscrição */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider mr-1">
                                <Calendar size={14} className="text-holi-primary" />
                                Data Inscrição:
                            </div>

                            {/* Presets Rápidos de Data */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {[
                                    { id: 'all', label: 'Todo Período' },
                                    { id: 'today', label: 'Hoje' },
                                    { id: '7days', label: 'Últimos 7 dias' },
                                    { id: '30days', label: 'Últimos 30 dias' },
                                    { id: 'this_month', label: 'Este Mês' }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => applyDatePreset(p.id as DatePreset)}
                                        className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                                            datePreset === p.id && !startDate && !endDate && p.id === 'all'
                                                ? 'bg-holi-primary/30 text-holi-accent border border-holi-primary/50'
                                                : datePreset === p.id && (startDate || p.id === 'all')
                                                    ? 'bg-holi-primary/30 text-holi-accent border border-holi-primary/50'
                                                    : 'bg-black/30 text-gray-400 hover:text-white border border-white/5'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            {/* Seleção Personalizada de Período (De / Até) */}
                            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
                                <span className="text-gray-500 text-[11px]">De:</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value)
                                        setDatePreset('custom')
                                    }}
                                    className="bg-transparent text-white focus:outline-none text-xs"
                                />
                                <span className="text-gray-500 text-[11px]">Até:</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value)
                                        setDatePreset('custom')
                                    }}
                                    className="bg-transparent text-white focus:outline-none text-xs"
                                />
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => applyDatePreset('all')}
                                        title="Limpar filtro de data"
                                        className="text-gray-400 hover:text-red-400 ml-1"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Ordenação */}
                            <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                    <ArrowUpDown size={12} /> Ordenar:
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="bg-black/40 border border-white/10 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-holi-primary"
                                >
                                    <option value="created_desc">Mais recentes primeiro</option>
                                    <option value="created_asc">Mais antigos primeiro</option>
                                    <option value="name_asc">Nome (A-Z)</option>
                                    <option value="amount_desc">Maior Valor</option>
                                </select>
                            </div>
                        </div>

                        {/* LINHA 3: Dropdowns de Status, Anjo, Cidade, Kit e Camiseta */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
                            <span className="text-gray-500 font-bold uppercase text-[11px] mr-1 flex items-center gap-1">
                                <Filter size={12} /> Filtros:
                            </span>

                            {/* Status Pagamento */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-holi-primary"
                            >
                                <option value="Todos">Status: Todos</option>
                                <option value="Pago">Apenas Pagos</option>
                                <option value="Pendente">Apenas Pendentes</option>
                            </select>

                            {/* Anjo */}
                            <select
                                value={filterAngel}
                                onChange={(e) => setFilterAngel(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-holi-primary"
                            >
                                <option value="Todos">Anjos: Todos</option>
                                <option value="Sem Anjo">Sem Anjo Definido</option>
                                {uniqueAngels.map(angel => (
                                    <option key={angel} value={angel}>{angel}</option>
                                ))}
                            </select>

                            {/* Cidade */}
                            <select
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-holi-primary"
                            >
                                <option value="Todos">Cidade: Todas</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            {/* Camiseta */}
                            <select
                                value={filterTshirtSize}
                                onChange={(e) => setFilterTshirtSize(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-holi-primary"
                            >
                                <option value="Todos">Camiseta: Todas</option>
                                {['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3'].map(size => (
                                    <option key={size} value={size}>Tam {size}</option>
                                ))}
                            </select>

                            {/* Botão Limpar Filtros se algum estiver ativo */}
                            {(searchTerm || filterStatus !== 'Todos' || filterAngel !== 'Todos' || filterCrmSegment !== 'all' || filterCity !== 'Todos' || filterTshirtSize !== 'Todos' || startDate || endDate) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('')
                                        setFilterStatus('Todos')
                                        setFilterAngel('Todos')
                                        setFilterCrmSegment('all')
                                        setFilterCity('Todos')
                                        setFilterTshirtSize('Todos')
                                        applyDatePreset('all')
                                    }}
                                    className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl transition-colors flex items-center gap-1 font-bold ml-auto"
                                >
                                    <X size={12} /> Limpar Todos os Filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* BANNER DE INSIGHT CROSS-RETIRO (Busca Global por Telefone/Nome)           */}
                    {/* Exemplo: Izabella Lourenço inscrita no Carnaval encontrada na busca!      */}
                    {/* ========================================================================= */}
                    {crossEventMatches.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-purple-950/80 via-holi-primary/20 to-indigo-950/80 border-2 border-holi-primary/50 p-5 rounded-3xl backdrop-blur-md shadow-2xl space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-holi-primary/30 text-holi-accent border border-holi-primary/40">
                                        <Sparkles size={18} />
                                    </span>
                                    <div>
                                        <h4 className="text-white font-black text-sm md:text-base uppercase tracking-tight">
                                            Encontrado em outro Retiro na Base Geral ({crossEventMatches.length})
                                        </h4>
                                        <p className="text-xs text-purple-200">
                                            Este participante foi localizado em outra edição. Você pode inscrevê-lo com 1 clique ou transferir a inscrição para o retiro atual!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                                {crossEventMatches.map(cm => (
                                    <div
                                        key={cm.id}
                                        className="bg-black/50 border border-white/10 p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-holi-primary to-purple-600 flex items-center justify-center text-white font-black text-xs">
                                                {(cm.participant.full_name || 'P').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                                    {cm.participant.full_name}
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        Inscrito no {cm.event.name}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                    <span className="text-green-400 font-mono flex items-center gap-1 font-bold">
                                                        <Phone size={11} /> {cm.participant.phone || 'Sem tel'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{cm.participant.city || 'Cidade n/i'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Inscrever neste retiro 1 clique */}
                                            {currentSelectedEvent && (
                                                <button
                                                    type="button"
                                                    onClick={() => openEnrollModal({
                                                        id: cm.participant.id,
                                                        name: cm.participant.full_name,
                                                        email: cm.participant.email,
                                                        phone: cm.participant.phone
                                                    })}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-holi-primary to-holi-secondary hover:opacity-90 text-white font-bold text-xs uppercase rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                                >
                                                    <UserPlus size={13} /> Inscrever no {currentSelectedEvent.name.replace('Retiro ', '')}
                                                </button>
                                            )}

                                            {/* Transferir / Mover Inscrição */}
                                            <button
                                                type="button"
                                                onClick={() => openTransferModal(cm)}
                                                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                            >
                                                <ArrowRightLeft size={13} /> Mover / Transferir
                                            </button>

                                            {/* WhatsApp Direto */}
                                            {cm.participant.phone && (
                                                <a
                                                    href={getWhatsAppLink(cm.participant, 'invite', cm) || '#'}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                                >
                                                    <MessageCircle size={13} /> WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* TABELA DE INSCRIÇÕES ENRIQUECIDA */}
                    <div className="bg-holi-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        {loading ? (
                            <div className="py-24 text-center">
                                <Loader2 className="w-10 h-10 animate-spin text-holi-primary mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Carregando inscrições e histórico CRM...</p>
                            </div>
                        ) : filteredRegistrations.length === 0 ? (
                            <div className="py-20 text-center text-gray-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-bold text-white mb-1">Nenhuma inscrição encontrada neste filtro</p>
                                <p className="text-sm">
                                    {crossEventMatches.length > 0
                                        ? 'O participante foi localizado no banner de Busca Global acima!'
                                        : 'Tente ajustar os filtros de busca, datas ou segmento de público.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-gray-400">
                                            <th className="py-4 px-6">Participante & Perfil CRM</th>
                                            <th className="py-4 px-3">Data Inscrição</th>
                                            <th className="py-4 px-3">Retiro</th>
                                            <th className="py-4 px-3">WhatsApp / Telefone</th>
                                            <th className="py-4 px-3">Kit / Camiseta</th>
                                            <th className="py-4 px-3">Pagamento</th>
                                            <th className="py-4 px-3">Anjo</th>
                                            <th className="py-4 px-6 text-right">Ações Rápidas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {filteredRegistrations.map(reg => (
                                            <tr
                                                key={reg.id}
                                                className="hover:bg-white/[0.025] transition-colors group cursor-pointer"
                                                onClick={() => setEditingReg(reg)}
                                            >
                                                {/* PARTICIPANTE & BADGE CRM */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border shadow-md ${
                                                            reg.isFirstTime
                                                                ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30'
                                                                : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30'
                                                        }`}>
                                                            {(reg.participant?.full_name || 'P').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white flex flex-wrap items-center gap-1.5">
                                                                <span>{reg.participant?.full_name || 'Participante'}</span>
                                                                
                                                                {/* BADGE CRM DE FIDELIDADE */}
                                                                {reg.isFirstTime ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                                                        <Sparkles size={10} /> 1ª Vez
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        title={`Participou de: ${reg.pastEventsNames.join(', ') || 'Retiros anteriores'}`}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                                    >
                                                                        <HeartHandshake size={10} /> Veterano ({reg.totalEventsCount} retiros)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500 block mt-0.5">
                                                                {calculateAge(reg.participant?.birth_date)} anos • {reg.participant?.gender || 'Gênero n/i'} • {reg.participant?.city || 'Cidade n/i'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* DATA DA INSCRIÇÃO */}
                                                <td className="py-4 px-3 whitespace-nowrap">
                                                    <div className="text-xs text-gray-300 flex items-center gap-1.5 font-medium">
                                                        <Clock size={12} className="text-holi-primary" />
                                                        {formatDateTime(reg.created_at)}
                                                    </div>
                                                </td>

                                                {/* RETIRO */}
                                                <td className="py-4 px-3">
                                                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-gray-300 whitespace-nowrap">
                                                        {reg.event.name ? reg.event.name.replace('Retiro ', '') : selectedEventSlug}
                                                    </span>
                                                </td>

                                                {/* CONTATO & BOTÃO WHATSAPP 1 CLIQUE */}
                                                <td className="py-4 px-3">
                                                    {reg.participant.phone ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <a
                                                                href={getWhatsAppLink(reg.participant, reg.payment?.status === 'Pago' ? 'confirmation' : 'pix_reminder', reg) || '#'}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                title="Enviar Mensagem com 1 Clique no WhatsApp"
                                                                className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-sm"
                                                            >
                                                                <MessageCircle size={13} className="text-green-400" />
                                                                {reg.participant.phone}
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 italic">Sem telefone</span>
                                                    )}
                                                </td>

                                                {/* KIT & CAMISETA */}
                                                <td className="py-4 px-3">
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-white block truncate max-w-[170px]">
                                                            {reg.kit_option.split(' - ')[0]}
                                                        </span>
                                                        {(reg.tshirt_size || reg.tshirt_size_2) && (
                                                            <span className="text-holi-secondary font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                                                <Shirt size={12} />
                                                                {reg.tshirt_size} {reg.tshirt_size_2 ? `+ ${reg.tshirt_size_2}` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* PAGAMENTO */}
                                                <td className="py-4 px-3 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleTogglePaymentStatus(reg)
                                                        }}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                            reg.payment?.status === 'Pago'
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                                                        }`}
                                                    >
                                                        {reg.payment?.status === 'Pago' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                        {reg.payment?.status || 'Pendente'}
                                                    </button>
                                                    {reg.payment?.payment_receipt_url && (
                                                        <a
                                                            href={reg.payment.payment_receipt_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block text-[11px] text-holi-secondary hover:underline mt-1 font-medium"
                                                        >
                                                            Comprovante
                                                        </a>
                                                    )}
                                                </td>

                                                {/* ANJO */}
                                                <td className="py-4 px-3">
                                                    <span className={`text-xs font-medium ${reg.assigned_angel ? 'text-purple-300' : 'text-gray-600 italic'}`}>
                                                        {reg.assigned_angel || 'Sem anjo'}
                                                    </span>
                                                </td>

                                                {/* AÇÕES CRM */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Mover / Transferir Retiro */}
                                                        <button
                                                            type="button"
                                                            title="Transferir para outro Retiro"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openTransferModal(reg)
                                                            }}
                                                            className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                                                        >
                                                            <ArrowRightLeft size={15} />
                                                        </button>

                                                        {/* Botão Histórico 360 */}
                                                        <button
                                                            type="button"
                                                            title="Ver Histórico 360°"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openParticipantHistory({
                                                                    id: reg.participant?.id || '',
                                                                    name: reg.participant?.full_name || 'Participante',
                                                                    email: reg.participant?.email || '',
                                                                    phone: reg.participant?.phone || ''
                                                                })
                                                            }}
                                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-holi-primary/20 text-gray-400 hover:text-holi-accent transition-colors"
                                                        >
                                                            <History size={15} />
                                                        </button>

                                                        {/* Botão Inscrever em outro retiro 1-clique */}
                                                        <button
                                                            type="button"
                                                            title="Inscrever em outro Retiro (1 Clique)"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openEnrollModal({
                                                                    id: reg.participant?.id || '',
                                                                    name: reg.participant?.full_name || 'Participante',
                                                                    email: reg.participant?.email || '',
                                                                    phone: reg.participant?.phone || ''
                                                                })
                                                            }}
                                                            className="p-1.5 rounded-lg text-holi-secondary hover:text-white hover:bg-holi-secondary/20 transition-colors"
                                                        >
                                                            <UserPlus size={15} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDelete(reg.id, e)}
                                                            disabled={deletingId === reg.id}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            title="Excluir Inscrição"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>

                                                        <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* ABA 2: LEADS DE REENGAJAMENTO ("A CONVIDAR")                              */}
            {/* ========================================================================= */}
            {activeTab === 'leads' && (
                <div className="space-y-4">
                    {/* BANNER DE ORIENTAÇÃO DO CRM COM TEMPLATES DE MENSAGEM */}
                    <div className="bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-holi-surface border border-rose-500/30 p-6 rounded-3xl backdrop-blur-md shadow-xl space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                        <Flame size={20} />
                                    </span>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                        Pipeline de Reengajamento — {currentSelectedEvent?.name || 'Retiro Atual'}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-300 max-w-3xl">
                                    Estas pessoas participaram de retiros anteriores da Comunidade Voz de Deus, mas <strong className="text-rose-300">ainda não se inscreveram nesta edição</strong>. Envie convites personalizados, acompanhe os status da abordagem e inscreva em 1 clique!
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <div className="text-center bg-black/40 px-3.5 py-3 rounded-2xl border border-white/10 min-w-[120px]">
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">A Convidar</span>
                                    <div className="text-2xl font-black text-rose-400">{stats.leadsCount}</div>
                                </div>
                                <div className="text-center bg-black/40 px-3.5 py-3 rounded-2xl border border-white/10 min-w-[120px]">
                                    <span className="text-[10px] uppercase text-green-400 font-bold block">Confirmados</span>
                                    <div className="text-2xl font-black text-green-400">{stats.leadsConfirmedCount}</div>
                                </div>
                            </div>
                        </div>

                        {/* SELETOR DE TEMPLATES DE CONVITE WHATSAPP */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                            <span className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                                <MessageSquareText size={14} /> Modelo da Mensagem de Convite:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setInviteTemplate('friendly')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        inviteTemplate === 'friendly'
                                            ? 'bg-rose-500 text-white shadow-md'
                                            : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                                    }`}
                                >
                                    🕊️ Acolhedor & Espiritual (Padrão)
                                </button>
                                <button
                                    onClick={() => setInviteTemplate('youth')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        inviteTemplate === 'youth'
                                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                                            : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                                    }`}
                                >
                                    🔥 Jovens & Dinâmico
                                </button>
                                <button
                                    onClick={() => setInviteTemplate('urgent')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        inviteTemplate === 'urgent'
                                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                                            : 'bg-black/40 text-gray-300 hover:text-white border border-white/10'
                                    }`}
                                >
                                    ⏳ Últimas Vagas / Reta Final
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FILTROS E BUSCA DE LEADS */}
                    <div className="bg-holi-surface/60 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por telefone (ex: 17982193027), nome (ex: Izabella), cidade ou paróquia..."
                                value={leadsSearchTerm}
                                onChange={(e) => setLeadsSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-400"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filtro por Status da Abordagem */}
                            <select
                                value={leadsStatusFilter}
                                onChange={(e) => setLeadsStatusFilter(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                            >
                                <option value="Todos">Status Abordagem: Todos</option>
                                <option value="pending">⚪ Não Contatado</option>
                                <option value="contacted">🟡 Convite Enviado</option>
                                <option value="confirmed">🟢 Confirmou Presença</option>
                                <option value="declined">🔴 Não pode desta vez</option>
                            </select>

                            {/* Filtro por Retiro Anterior que participou */}
                            <select
                                value={leadsPastEventFilter}
                                onChange={(e) => setLeadsPastEventFilter(e.target.value)}
                                className="bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-400"
                            >
                                <option value="Todos">Todos os Retiros Anteriores</option>
                                {events.filter(e => e.slug !== selectedEventSlug).map(evt => (
                                    <option key={evt.slug} value={evt.slug}>{evt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* LISTA DE LEADS A CONVIDAR */}
                    <div className="bg-holi-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        {filteredLeads.length === 0 ? (
                            <div className="py-20 text-center text-gray-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400 opacity-60" />
                                <p className="text-lg font-bold text-white mb-1">Nenhum participante ausente encontrado!</p>
                                <p className="text-sm">Todos os participantes anteriores já estão inscritos nesta edição ou o filtro não encontrou resultados.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-black/40 text-[11px] uppercase tracking-wider text-gray-400">
                                            <th className="py-4 px-6">Participante</th>
                                            <th className="py-4 px-4">Status Abordagem</th>
                                            <th className="py-4 px-4">WhatsApp / Telefone</th>
                                            <th className="py-4 px-4">Cidade / Paróquia</th>
                                            <th className="py-4 px-4">Histórico de Retiros</th>
                                            <th className="py-4 px-6 text-right">Ações de Convite</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {filteredLeads.map((lead, idx) => {
                                            const waLink = getWhatsAppLink(lead.participant, 'invite')
                                            const isCopied = copiedLeadId === lead.participant.id
                                            const contactStatus = leadsContactStatuses[lead.participant.id] || 'pending'

                                            return (
                                                <tr key={lead.participant.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                                    {/* NOME & DADOS */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex items-center justify-center text-rose-300 font-black text-sm">
                                                                {(lead.participant.full_name || 'P').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white flex items-center gap-2">
                                                                    {lead.participant.full_name}
                                                                </div>
                                                                <span className="text-xs text-gray-400">
                                                                    {calculateAge(lead.participant.birth_date)} anos • {lead.participant.gender || 'Não informado'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* STATUS DA ABORDAGEM DO LEAD */}
                                                    <td className="py-4 px-4">
                                                        <select
                                                            value={contactStatus}
                                                            onChange={(e) => setLeadStatus(lead.participant.id, e.target.value as LeadContactStatus)}
                                                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none transition-all ${
                                                                contactStatus === 'confirmed'
                                                                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                                                                    : contactStatus === 'contacted'
                                                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                                        : contactStatus === 'declined'
                                                                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                                                            : 'bg-black/40 text-gray-400 border-white/10'
                                                            }`}
                                                        >
                                                            <option value="pending">⚪ Não Contatado</option>
                                                            <option value="contacted">🟡 Convite Enviado</option>
                                                            <option value="confirmed">🟢 Confirmou Presença</option>
                                                            <option value="declined">🔴 Não pode desta vez</option>
                                                        </select>
                                                    </td>

                                                    {/* WHATSAPP */}
                                                    <td className="py-4 px-4">
                                                        {lead.participant.phone ? (
                                                            <div className="text-xs space-y-0.5">
                                                                <span className="text-gray-200 font-mono font-medium block">
                                                                    {lead.participant.phone}
                                                                </span>
                                                                <span className="text-[10px] text-green-400 flex items-center gap-1 font-semibold">
                                                                    <MessageCircle size={10} /> WhatsApp Disponível
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 italic">Sem telefone</span>
                                                        )}
                                                    </td>

                                                    {/* CIDADE / PARÓQUIA */}
                                                    <td className="py-4 px-4">
                                                        <div className="text-xs space-y-0.5">
                                                            <span className="text-gray-300 block font-medium">
                                                                {lead.participant.city || 'Cidade n/i'}
                                                            </span>
                                                            <span className="text-gray-500 text-[11px] block truncate max-w-[150px]">
                                                                {lead.participant.parish || 'Paróquia n/i'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* RETIROS ANTERIORES */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                            {lead.pastEvents.map((pe, pIdx) => (
                                                                <span
                                                                    key={pIdx}
                                                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-purple-300"
                                                                >
                                                                    {pe.name.replace('Retiro ', '')} ({pe.year})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* AÇÕES DE CONVITE */}
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Botão WhatsApp com mensagem pré-montada */}
                                                            {waLink ? (
                                                                <a
                                                                    href={waLink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={() => {
                                                                        if (contactStatus === 'pending') {
                                                                            setLeadStatus(lead.participant.id, 'contacted')
                                                                        }
                                                                    }}
                                                                    title="Enviar Convite no WhatsApp"
                                                                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                                                >
                                                                    <MessageCircle size={14} /> Convidar WhatsApp
                                                                </a>
                                                            ) : null}

                                                            {/* Copiar mensagem */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyInviteMessage(lead)}
                                                                title="Copiar mensagem personalizada de convite"
                                                                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                                                                    isCopied
                                                                        ? 'bg-green-500 text-white border-green-500'
                                                                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                                                                }`}
                                                            >
                                                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                                            </button>

                                                            {/* Inscrever em 1 clique direto no retiro selecionado */}
                                                            {currentSelectedEvent && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEnrollModal({
                                                                        id: lead.participant.id,
                                                                        name: lead.participant.full_name,
                                                                        email: lead.participant.email,
                                                                        phone: lead.participant.phone
                                                                    })}
                                                                    title="Inscrever no Retiro Atual com 1 Clique"
                                                                    className="px-3 py-1.5 bg-holi-primary/20 hover:bg-holi-primary/30 text-holi-accent border border-holi-primary/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                                                >
                                                                    <UserPlus size={14} /> Inscrever
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* ABA 3: DASHBOARD & MÉTRICAS DETALHADAS                                    */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grade de Fidelidade CRM */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="text-amber-400" size={20} /> Renovação vs Fidelização da Base
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-center">
                                <span className="text-xs uppercase font-bold text-amber-300 block mb-1">1ª Vez (Calouros)</span>
                                <div className="text-3xl font-black text-amber-400">{stats.firstTimeCount}</div>
                                <span className="text-xs text-gray-400 mt-1 block">{stats.firstTimePercent}% do público</span>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-center">
                                <span className="text-xs uppercase font-bold text-purple-300 block mb-1">Veteranos (Fidelizados)</span>
                                <div className="text-3xl font-black text-purple-400">{stats.veteranCount}</div>
                                <span className="text-xs text-gray-400 mt-1 block">{stats.veteranPercent}% do público</span>
                            </div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-xs text-gray-300 space-y-2">
                            <div className="flex justify-between items-center">
                                <span>Total de vidas alcançadas neste retiro:</span>
                                <span className="font-bold text-white">{stats.totalRegistrations}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Potencial de reengajamento disponível:</span>
                                <span className="font-bold text-rose-400">{stats.leadsCount} participantes</span>
                            </div>
                        </div>
                    </div>

                    {/* Grade de Camisetas */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shirt className="text-holi-secondary" size={20} /> Distribuição de Camisetas
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {stats.sortedTshirts.map(([size, count]) => (
                                <div key={size} className="bg-black/40 border border-white/10 p-3 rounded-2xl text-center">
                                    <span className="text-gray-400 text-xs font-mono block">Tam {size}</span>
                                    <span className="text-xl font-black text-white">{count}</span>
                                </div>
                            ))}
                        </div>
                        {stats.sortedTshirts.length === 0 && (
                            <p className="text-gray-500 text-sm italic">Nenhum tamanho registrado ainda.</p>
                        )}
                    </div>

                    {/* Grade de Kits */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Package className="text-holi-primary" size={20} /> Inscrições por Kit
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(stats.kits).map(([kit, count]) => (
                                <div key={kit} className="flex justify-between items-center bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                                    <span className="text-sm font-bold text-white">{kit}</span>
                                    <span className="text-sm font-black text-holi-secondary px-3 py-1 bg-holi-secondary/10 rounded-xl border border-holi-secondary/20">
                                        {count} participantes
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acomodação e Gênero */}
                    <div className="bg-holi-surface border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-white mb-4">Alojamento & Gênero</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Pernoitam no Retiro (Alojados)</span>
                                <span className="font-bold text-white">{stats.stayingOnSiteCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Masculino</span>
                                <span className="font-bold text-white">{stats.maleCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">Feminino</span>
                                <span className="font-bold text-white">{stats.femaleCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 360° HISTÓRICO DO PARTICIPANTE                                      */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {historyModalParticipant && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setHistoryModalParticipant(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-holi-primary/20 border border-holi-primary/30 flex items-center justify-center text-holi-primary font-black text-xl">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">
                                        Histórico 360° do Participante
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {historyModalParticipant.name}
                                    </p>
                                </div>
                            </div>

                            {loadingHistory ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-holi-primary mx-auto mb-2" />
                                    <p className="text-xs text-gray-400">Carregando participações...</p>
                                </div>
                            ) : participantHistory.length === 0 ? (
                                <div className="py-10 text-center text-gray-500">
                                    <p className="text-sm font-bold text-gray-300">Nenhum histórico anterior registrado.</p>
                                    <p className="text-xs mt-1">Este participante está inscrito apenas na edição atual.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                    {participantHistory.map((item, idx) => (
                                        <div
                                            key={item.registrationId || idx}
                                            className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm">{item.eventName}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                                                        {item.eventYear}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400 block mt-1">
                                                    {item.kitOption} {item.tshirtSize ? `• Tam ${item.tshirtSize}` : ''}
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        item.payment?.status === 'Pago'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    }`}
                                                >
                                                    {item.payment?.status || 'Pendente'}
                                                </span>
                                                {item.payment?.amount && (
                                                    <span className="text-xs text-gray-400 block mt-1">
                                                        R$ {item.payment.amount},00
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        if (historyModalParticipant) {
                                            const p = { ...historyModalParticipant }
                                            setHistoryModalParticipant(null)
                                            openEnrollModal(p)
                                        }
                                    }}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-holi-primary to-holi-secondary hover:opacity-90 text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg shadow-holi-primary/20 transition-all"
                                >
                                    <UserPlus size={14} />
                                    Inscrever em outro Retiro
                                </button>
                                <button
                                    onClick={() => setHistoryModalParticipant(null)}
                                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* MODAL DE TRANSFERÊNCIA / TROCA DE RETIRO                                 */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {transferModalReg && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setTransferModalReg(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xl">
                                    <ArrowRightLeft size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase">
                                        Mover / Transferir Retiro
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        {transferModalReg.participant.full_name}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mb-4">
                                Esta ação mudará o retiro desta inscrição existente ({transferModalReg.event.name}) para o novo retiro selecionado, mantendo todos os dados e histórico de pagamento.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Retiro de Destino:
                                    </label>
                                    <select
                                        value={targetTransferEventId}
                                        onChange={(e) => setTargetTransferEventId(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500 font-bold"
                                    >
                                        {events.map(evt => (
                                            <option key={evt.id} value={evt.id}>
                                                {evt.name} ({evt.year}) {evt.status === 'active' ? '— ATIVO' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setTransferModalReg(null)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleExecuteTransfer}
                                        disabled={isTransferring || !targetTransferEventId}
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {isTransferring ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                                        Confirmar Transferência
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* MODAL DE DETALHES / EDIÇÃO DA INSCRIÇÃO                                   */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {editingReg && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <button
                                onClick={() => setEditingReg(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-2xl font-black uppercase text-white">
                                    Detalhes da Inscrição
                                </h3>
                                {editingReg.isFirstTime ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                        🌟 1ª Vez
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                        🔄 Veterano ({editingReg.totalEventsCount} retiros)
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-holi-secondary mb-6">
                                {editingReg.event.name || selectedEventSlug}
                            </p>

                            <div className="space-y-6">
                                {/* DADOS DO PARTICIPANTE */}
                                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">Participante</h4>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const regToTransfer = editingReg
                                                    setEditingReg(null)
                                                    openTransferModal(regToTransfer)
                                                }}
                                                className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-500/30"
                                            >
                                                <ArrowRightLeft size={13} />
                                                Mover Retiro
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = {
                                                        id: editingReg.participant.id,
                                                        name: editingReg.participant.full_name,
                                                        email: editingReg.participant.email,
                                                        phone: editingReg.participant.phone
                                                    }
                                                    setEditingReg(null)
                                                    openEnrollModal(p)
                                                }}
                                                className="px-3 py-1 rounded-lg bg-holi-secondary/20 hover:bg-holi-secondary/30 text-holi-secondary text-xs font-bold flex items-center gap-1.5 transition-colors"
                                            >
                                                <UserPlus size={13} />
                                                Inscrever em outro Retiro
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Nome</span>
                                            <span className="text-white font-bold">{editingReg.participant.full_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">E-mail</span>
                                            <span className="text-white">{editingReg.participant.email || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Telefone</span>
                                            <span className="text-white font-mono">{editingReg.participant.phone || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs block">Paróquia / Cidade</span>
                                            <span className="text-white">{editingReg.participant.parish || editingReg.participant.city || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ATRIBUIÇÃO DE ANJO */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Anjo / Responsável
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingReg.assigned_angel || ''}
                                            onChange={(e) => setEditingReg({ ...editingReg, assigned_angel: e.target.value })}
                                            placeholder="Nome do Anjo"
                                            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-holi-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await updateRegistrationAngel(editingReg.id, editingReg.assigned_angel || null)
                                                    alert('Anjo atualizado com sucesso!')
                                                    refreshRegistrations()
                                                } catch (err: any) {
                                                    alert('Erro ao salvar anjo: ' + err.message)
                                                }
                                            }}
                                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl"
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                </div>

                                {/* COMPROVANTE DE PAGAMENTO */}
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Comprovante de Pagamento
                                    </label>
                                    {editingReg.payment?.payment_receipt_url ? (
                                        <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between mb-3">
                                            <span className="text-xs text-green-400 flex items-center gap-1.5">
                                                <CheckCircle size={14} /> Comprovante Anexado
                                            </span>
                                            <a
                                                href={editingReg.payment.payment_receipt_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-holi-secondary underline font-bold"
                                            >
                                                Visualizar / Baixar
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 mb-3">Nenhum comprovante anexado pelo participante.</p>
                                    )}

                                    <label className="border border-dashed border-white/20 hover:border-holi-primary p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-white/5 text-xs text-gray-300">
                                        <Upload size={14} />
                                        {uploadingReceipt ? 'Enviando...' : 'Fazer Upload / Substituir Comprovante'}
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleAdminReceiptUpload}
                                            disabled={uploadingReceipt}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* AÇÕES FINAIS */}
                                <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => handleTogglePaymentStatus(editingReg)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                                            editingReg.payment?.status === 'Pago'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        }`}
                                    >
                                        Marcar como {editingReg.payment?.status === 'Pago' ? 'Pendente' : 'Pago'}
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingReg(null)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* MODAL DE INSCRIÇÃO RÁPIDA EM OUTRO RETIRO (1 CLIQUE)                      */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {enrollModalParticipant && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-holi-surface border border-white/10 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative"
                        >
                            <button
                                onClick={() => setEnrollModalParticipant(null)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-holi-primary to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase">
                                        Inscrição Rápida em Retiro
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        {enrollModalParticipant.name}
                                    </p>
                                </div>
                            </div>

                            {enrollSuccessMessage && (
                                <div className="p-4 bg-green-500/20 border border-green-500/40 text-green-300 text-sm rounded-2xl mb-4 flex items-center gap-2">
                                    <CheckCircle size={18} />
                                    {enrollSuccessMessage}
                                </div>
                            )}

                            {enrollErrorMessage && (
                                <div className="p-4 bg-red-500/20 border border-red-500/40 text-red-300 text-sm rounded-2xl mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    {enrollErrorMessage}
                                </div>
                            )}

                            <div className="space-y-4">
                                {events.map(evt => {
                                    const isAlreadyEnrolled = enrollParticipantHistory.some(h => h.eventId === evt.id || h.eventSlug === evt.slug)
                                    const isEnrollingThis = enrollingEventId === evt.id
                                    const config = enrollConfigs[evt.id] || {
                                        kitOption: evt.kit_options?.[0]?.name || 'Kit Padrão',
                                        paymentAmount: evt.kit_options?.[0]?.price || 70,
                                        paymentStatus: 'Pago',
                                        tshirtSize: 'M',
                                        stayingOnSite: false
                                    }

                                    return (
                                        <div
                                            key={evt.id}
                                            className={`p-5 rounded-2xl border transition-all ${
                                                isAlreadyEnrolled
                                                    ? 'bg-white/[0.02] border-white/5 opacity-70'
                                                    : 'bg-black/40 border-white/10 hover:border-holi-primary/40'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white text-base">{evt.name}</h4>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                                                            {evt.year}
                                                        </span>
                                                        {evt.status === 'active' && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold uppercase">
                                                                Ativo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {evt.location || 'Local a definir'}
                                                    </span>
                                                </div>

                                                {isAlreadyEnrolled ? (
                                                    <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold flex items-center gap-1.5 self-start">
                                                        <CheckCircle size={14} /> Já Inscrito
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleExecuteEnroll(evt.id)}
                                                        disabled={isEnrollingThis}
                                                        className="px-4 py-2 bg-gradient-to-r from-holi-primary to-holi-secondary hover:opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-holi-primary/20 transition-all flex items-center gap-1.5 self-start disabled:opacity-50"
                                                    >
                                                        {isEnrollingThis ? (
                                                            <>
                                                                <Loader2 size={14} className="animate-spin" /> Inscrevendo...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus size={14} /> Inscrever Agora
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Configurações da Inscrição (se ainda não inscrito) */}
                                            {!isAlreadyEnrolled && (
                                                <div className="pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                    <div>
                                                        <label className="text-gray-400 block mb-1">Kit:</label>
                                                        <select
                                                            value={config.kitOption}
                                                            onChange={(e) => {
                                                                const chosenKit = evt.kit_options?.find(k => k.name === e.target.value)
                                                                updateEnrollConfig(evt.id, {
                                                                    kitOption: e.target.value,
                                                                    paymentAmount: chosenKit?.price || config.paymentAmount
                                                                })
                                                            }}
                                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-1.5 text-white focus:outline-none"
                                                        >
                                                            {evt.kit_options?.map(k => (
                                                                <option key={k.id} value={k.name}>{k.name} (R$ {k.price})</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-gray-400 block mb-1">Camiseta:</label>
                                                        <select
                                                            value={config.tshirtSize}
                                                            onChange={(e) => updateEnrollConfig(evt.id, { tshirtSize: e.target.value })}
                                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-1.5 text-white focus:outline-none"
                                                        >
                                                            {['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3'].map(sz => (
                                                                <option key={sz} value={sz}>Tam {sz}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-gray-400 block mb-1">Status Pagamento:</label>
                                                        <select
                                                            value={config.paymentStatus}
                                                            onChange={(e) => updateEnrollConfig(evt.id, { paymentStatus: e.target.value as 'Pago' | 'Pendente' })}
                                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-1.5 text-white focus:outline-none"
                                                        >
                                                            <option value="Pago">Pago (Confirmado)</option>
                                                            <option value="Pendente">Pendente</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEnrollModalParticipant(null)}
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default RegistrationAdmin
