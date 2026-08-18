import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Mail, Calendar, Phone, MapPin,
    Home, CheckCircle, Package, Shirt,
    ArrowRight, Loader2, Sparkles, CreditCard, Upload, FileCheck,
    Copy, Check, AlertCircle, RefreshCw, HeartHandshake, Search, History
} from 'lucide-react'
import { fetchActiveEvent } from '../services/eventService'
import { searchParticipantsByName, findParticipantByIdentifier, ParticipantSearchResult } from '../services/participantService'
import { createEventRegistration, uploadReceiptAndLinkPayment } from '../services/registrationService'
import { EventItem, Participant } from '../types/database'

const TSHIRT_SIZES = ['P', 'M', 'G', 'GG', 'XG']
const PARISHES = [
    'Paróquia São José da Santíssima Trindade',
    'Paróquia Santa Clara de Assis',
    'Paróquia São Sebastião',
    'Outros'
]

const RegistrationPage = () => {
    const location = useLocation()
    const [event, setEvent] = useState<EventItem | null>(null)
    const [loadingEvent, setLoadingEvent] = useState(true)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Lookup e Autocomplete de participante
    const [nameSuggestions, setNameSuggestions] = useState<ParticipantSearchResult[]>([])
    const [isSearchingName, setIsSearchingName] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [foundParticipant, setFoundParticipant] = useState<ParticipantSearchResult | null>(null)
    const [copiedPix, setCopiedPix] = useState(false)

    // Dados da inscrição concluída
    const [createdRegistrationId, setCreatedRegistrationId] = useState<string | null>(null)
    const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null)
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [uploadingReceipt, setUploadingReceipt] = useState(false)
    const [receiptUploaded, setReceiptUploaded] = useState(false)

    const suggestionsRef = useRef<HTMLDivElement>(null)

    const [formData, setFormData] = useState({
        participantId: '',
        full_name: '',
        email: '',
        phone: '',
        cpf: '',
        birth_date: '',
        gender: '',
        address: '',
        city: '',
        emergency_phone: '',
        parish: '',
        staying_on_site: false,
        kit_option: '',
        tshirt_size: '',
        tshirt_size_2: '',
        notes: ''
    })

    // Fechar autocomplete ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Carregar dados do evento ativo (ADONAI 2026) e pré-selecionar kit pelo parâmetro URL ?pacote=
    useEffect(() => {
        const loadEvent = async () => {
            setLoadingEvent(true)
            const activeEvent = await fetchActiveEvent()
            setEvent(activeEvent)
            if (activeEvent?.kit_options?.length > 0) {
                const searchParams = new URLSearchParams(location.search)
                const pacoteParam = searchParams.get('pacote')?.toLowerCase()

                let matchedKit = activeEvent.kit_options[0]
                if (pacoteParam) {
                    if (pacoteParam.includes('essencial') || pacoteParam.includes('50') || pacoteParam.includes('carnaval')) {
                        matchedKit = activeEvent.kit_options.find(k => k.price === 50) || activeEvent.kit_options[0]
                    } else if (pacoteParam.includes('experience') || pacoteParam.includes('100') || pacoteParam.includes('sozinho')) {
                        matchedKit = activeEvent.kit_options.find(k => k.price === 100) || activeEvent.kit_options[1]
                    } else if (pacoteParam.includes('duo') || pacoteParam.includes('120') || pacoteParam.includes('amigo')) {
                        matchedKit = activeEvent.kit_options.find(k => k.price === 120) || activeEvent.kit_options[2]
                    }
                }

                setFormData(prev => ({
                    ...prev,
                    kit_option: matchedKit.name
                }))
            }
            setLoadingEvent(false)
        }
        loadEvent()
    }, [location.search])

    // Busca com debounce ao digitar o Nome Completo
    useEffect(() => {
        if (!formData.full_name || formData.full_name.trim().length < 2) {
            setNameSuggestions([])
            setShowSuggestions(false)
            return
        }

        // Se já foi selecionado, não reabre busca
        if (foundParticipant && foundParticipant.participant.full_name.toLowerCase() === formData.full_name.toLowerCase().trim()) {
            return
        }

        const timer = setTimeout(async () => {
            setIsSearchingName(true)
            try {
                const results = await searchParticipantsByName(formData.full_name, event?.id)
                setNameSuggestions(results)
                setShowSuggestions(results.length > 0)
            } catch (err) {
                console.error('Erro na busca por nome:', err)
            } finally {
                setIsSearchingName(false)
            }
        }, 250)

        return () => clearTimeout(timer)
    }, [formData.full_name, event?.id])

    // Seleciona participante da lista de sugestões
    const handleSelectParticipant = (result: ParticipantSearchResult) => {
        const p = result.participant
        setFoundParticipant(result)
        setShowSuggestions(false)

        setFormData(prev => ({
            ...prev,
            participantId: p.id,
            full_name: p.full_name,
            email: p.email || prev.email,
            phone: p.phone || prev.phone,
            cpf: p.cpf || prev.cpf,
            birth_date: p.birth_date || prev.birth_date,
            gender: p.gender || prev.gender,
            address: p.address || prev.address,
            city: p.city || prev.city,
            parish: p.parish || prev.parish,
            emergency_phone: p.emergency_phone || prev.emergency_phone
        }))
    }

    // Busca inteligente onBlur para email, telefone ou cpf
    const handleCheckIdentifier = async (field: 'email' | 'phone' | 'cpf', val: string) => {
        if (!val || val.length < 5) return
        if (foundParticipant) return

        try {
            const found = await findParticipantByIdentifier({
                [field]: val,
                activeEventId: event?.id
            })
            if (found) {
                handleSelectParticipant(found)
            }
        } catch (err) {
            console.error('Erro no auto-preenchimento:', err)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    // Calcula valor do pagamento com base no kit selecionado
    const selectedKit = event?.kit_options.find(k => k.name === formData.kit_option) || event?.kit_options[0]
    const paymentAmount = selectedKit?.price || 50
    const needsTshirt1 = selectedKit?.includesTshirt || (selectedKit?.tshirtCount && selectedKit.tshirtCount >= 1) || formData.kit_option.includes('Camiseta')
    const needsTshirt2 = (selectedKit?.tshirtCount && selectedKit.tshirtCount >= 2) || formData.kit_option.includes('2 Camisetas')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!event) return

        if (!formData.full_name || !formData.email || !formData.phone) {
            setError('Por favor, preencha todos os campos obrigatórios (Nome, E-mail e Telefone).')
            return
        }

        if (needsTshirt1 && !formData.tshirt_size) {
            setError('Por favor, selecione o tamanho da camiseta.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const result = await createEventRegistration({
                participantData: {
                    id: formData.participantId || undefined,
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    cpf: formData.cpf,
                    birth_date: formData.birth_date,
                    gender: formData.gender,
                    address: formData.address,
                    city: formData.city,
                    parish: formData.parish,
                    emergency_phone: formData.emergency_phone
                },
                eventId: event.id,
                kitOption: formData.kit_option || selectedKit?.name || 'Inscrição',
                tshirtSize: formData.tshirt_size,
                tshirtSize2: formData.tshirt_size_2,
                stayingOnSite: formData.staying_on_site,
                paymentAmount,
                notes: formData.notes
            })

            setCreatedRegistrationId(result.registration.id)
            setCreatedPaymentId(result.payment.id)
            setSubmitted(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err: any) {
            console.error('Erro na inscrição:', err)
            setError(err.message || 'Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleReceiptUpload = async () => {
        if (!receiptFile || !createdRegistrationId) return

        setUploadingReceipt(true)
        setError(null)

        try {
            await uploadReceiptAndLinkPayment({
                registrationId: createdRegistrationId,
                paymentId: createdPaymentId || undefined,
                file: receiptFile,
                emailOrPhone: formData.email || formData.phone,
                eventSlug: event?.slug
            })
            setReceiptUploaded(true)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Erro ao enviar comprovante. Você também pode enviar pelo WhatsApp.')
        } finally {
            setUploadingReceipt(false)
        }
    }

    const copyPixToClipboard = () => {
        if (event?.pix_info?.key) {
            navigator.clipboard.writeText(event.pix_info.key)
            setCopiedPix(true)
            setTimeout(() => setCopiedPix(false), 3000)
        }
    }

    if (loadingEvent) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-holi-primary mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Carregando informações do retiro...</p>
                </div>
            </div>
        )
    }

    // TELA DE SUCESSO / CONFIRMAÇÃO E PAGAMENTO
    if (submitted && event) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 relative">
                <div className="max-w-2xl mx-auto bg-holi-surface border border-white/10 rounded-3xl p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                        <CheckCircle size={40} className="text-white" />
                    </div>
                    
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-holi-primary/20 text-holi-primary border border-holi-primary/30 mb-4">
                        {event.name}
                    </span>

                    <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight text-white">
                        Inscrição Realizada com Sucesso!
                    </h2>
                    
                    <p className="text-gray-300 text-lg mb-8">
                        Que bênção ter você conosco no <strong className="text-white">{event.name}</strong>, {formData.full_name.split(' ')[0]}! <br />
                        <span className="text-sm text-gray-400 mt-2 block">
                            Realize o pagamento via PIX para garantir sua vaga e envie o comprovante abaixo.
                        </span>
                    </p>

                    {/* DADOS PIX */}
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                            <h3 className="text-holi-primary font-bold uppercase text-sm tracking-widest flex items-center gap-2">
                                <CreditCard size={18} /> Dados do PIX
                            </h3>
                            <button
                                onClick={copyPixToClipboard}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-holi-primary/20 hover:bg-holi-primary/30 text-white transition-colors"
                            >
                                {copiedPix ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                {copiedPix ? 'Chave Copiada!' : 'Copiar Chave'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-gray-500 text-xs block uppercase">Chave PIX ({event.pix_info.keyType || 'CPF'})</span>
                                <span className="text-xl font-mono text-white font-bold select-all">{event.pix_info.key}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-xs block uppercase">Favorecido</span>
                                <span className="text-white font-medium">{event.pix_info.receiver}</span>
                            </div>
                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                <div>
                                    <span className="text-gray-500 text-xs block uppercase">Kit Escolhido</span>
                                    <span className="text-sm font-semibold text-gray-300">{formData.kit_option}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 text-xs block uppercase">Valor Total</span>
                                    <span className="text-2xl font-black text-holi-secondary">R$ {paymentAmount},00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* UPLOAD DE COMPROVANTE */}
                    {!receiptUploaded ? (
                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                            <h4 className="text-white font-bold uppercase text-sm mb-2 flex items-center gap-2">
                                <Upload size={16} className="text-holi-secondary" /> Enviar Comprovante de Pagamento
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">
                                Anexe a foto ou PDF do comprovante para validação imediata pela organização.
                            </p>

                            <div className="space-y-4">
                                <label className="border-2 border-dashed border-white/20 hover:border-holi-primary/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-300 font-medium">
                                        {receiptFile ? receiptFile.name : 'Clique para selecionar o comprovante (imagem ou PDF)'}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG ou PDF (máx. 10MB)</span>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </label>

                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                {receiptFile && (
                                    <button
                                        type="button"
                                        onClick={handleReceiptUpload}
                                        disabled={uploadingReceipt}
                                        className="w-full py-3 bg-gradient-to-r from-holi-primary to-holi-secondary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-holi-primary/20"
                                    >
                                        {uploadingReceipt ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Enviando comprovante...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} /> Confirmar Envio do Comprovante
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-8 text-center animate-in fade-in">
                            <FileCheck className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <h4 className="text-white font-bold text-lg mb-1">Comprovante Enviado com Sucesso!</h4>
                            <p className="text-gray-300 text-sm">
                                Nossa equipe irá validar o pagamento e você receberá a confirmação.
                            </p>
                        </div>
                    )}

                    {/* SUPORTE WHATSAPP */}
                    {event.pix_info.whatsappSupport && (
                        <div className="text-center text-sm text-gray-400">
                            Dúvidas ou prefere enviar por WhatsApp?{' '}
                            <a
                                href={`https://wa.me/${event.pix_info.whatsappSupport}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-holi-secondary font-bold underline hover:text-white transition-colors"
                            >
                                Clique aqui para falar com o suporte
                            </a>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // FORMULÁRIO DE INSCRIÇÃO
    return (
        <div className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Background glow elements */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-holi-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-96 h-96 bg-holi-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header do Retiro */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 text-holi-secondary mb-4 backdrop-blur-md"
                    >
                        <Sparkles size={14} className="text-holi-accent" /> Inscrições Abertas
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4"
                    >
                        {event?.name || 'Retiro ADONAI 2026'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-xl mx-auto"
                    >
                        Garanta sua vaga neste encontro especial de louvor, transformação e comunhão.
                    </motion.p>
                </div>

                {/* Card do Formulário */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-holi-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
                >
                    {/* Alerta de Participante e Histórico de Retiro Encontrado */}
                    <AnimatePresence>
                        {foundParticipant && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 p-5 bg-gradient-to-r from-holi-primary/20 via-purple-900/30 to-holi-secondary/20 border border-holi-primary/40 rounded-2xl flex items-start gap-4 shadow-lg shadow-holi-primary/10"
                            >
                                <div className="w-10 h-10 rounded-xl bg-holi-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <HeartHandshake className="w-6 h-6 text-holi-accent" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="text-white font-black text-base">
                                            Olá, {foundParticipant.participant.full_name}! ✨
                                        </h4>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-holi-accent border border-holi-accent/30 flex items-center gap-1">
                                            <History size={12} />
                                            Já participou: {foundParticipant.pastRetreats.join(', ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        Encontramos seu cadastro anterior! Seus dados foram preenchidos automaticamente abaixo para você se inscrever no <strong>{event?.name}</strong>. Por favor, confira e atualize o que mudou.
                                    </p>

                                    {foundParticipant.isRegisteredInActiveEvent && (
                                        <div className="mt-2.5 p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>Você já possui uma inscrição cadastrada para o <strong>{event?.name}</strong>!</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
                            <AlertCircle size={20} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* SEÇÃO 1: DADOS PESSOAIS (com busca inteligente por Nome) */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#d946ef] mb-5 flex items-center gap-2">
                                <User size={16} /> Dados Pessoais
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Nome Completo (com autocomplete / sugestões em tempo real) */}
                                <div className="relative" ref={suggestionsRef}>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Nome Completo *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            onFocus={() => {
                                                if (nameSuggestions.length > 0) setShowSuggestions(true)
                                            }}
                                            placeholder="Digite seu nome..."
                                            className="w-full pl-10 pr-10 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-primary focus:ring-1 focus:ring-holi-primary text-sm transition-all"
                                        />
                                        {isSearchingName && (
                                            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-holi-primary animate-spin" />
                                        )}
                                    </div>

                                    {/* MENU DROPDOWN DE SUGESTÕES POR NOME */}
                                    <AnimatePresence>
                                        {showSuggestions && nameSuggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute left-0 right-0 top-full mt-2 bg-[#12071a] border border-holi-primary/40 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5 backdrop-blur-xl"
                                            >
                                                <div className="px-3 py-1.5 bg-black/40 text-[10px] uppercase font-bold text-gray-400 flex items-center justify-between">
                                                    <span>Participantes encontrados</span>
                                                    <span className="text-holi-primary font-normal">Clique para preencher</span>
                                                </div>
                                                {nameSuggestions.map((item, idx) => (
                                                    <button
                                                        key={item.participant.id || idx}
                                                        type="button"
                                                        onClick={() => handleSelectParticipant(item)}
                                                        className="w-full p-3 text-left hover:bg-holi-primary/20 transition-colors flex items-center justify-between gap-3 group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-holi-primary/20 border border-holi-primary/30 flex items-center justify-center text-white text-xs font-bold">
                                                                {item.participant.full_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-white text-sm block group-hover:text-holi-secondary transition-colors">
                                                                    {item.participant.full_name}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {item.participant.email || item.participant.phone || item.participant.parish || 'Participante anterior'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-holi-accent border border-holi-accent/20">
                                                                🎟️ {item.pastRetreats[0]}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={(e) => handleCheckIdentifier('email', e.target.value)}
                                            placeholder="joao@exemplo.com"
                                            className="w-full pl-10 pr-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-primary focus:ring-1 focus:ring-holi-primary text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Data de Nascimento */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Data de Nascimento
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={formData.birth_date}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-primary focus:ring-1 focus:ring-holi-primary text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Sexo / Gênero (Pill buttons interativos como na imagem) */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Sexo
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gender: 'Feminino' }))}
                                            className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all ${
                                                formData.gender === 'Feminino'
                                                    ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white border-holi-primary shadow-lg shadow-holi-primary/20'
                                                    : 'bg-[#0d0714] text-white border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            Feminino
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gender: 'Masculino' }))}
                                            className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all ${
                                                formData.gender === 'Masculino'
                                                    ? 'bg-gradient-to-r from-holi-secondary to-blue-600 text-white border-holi-secondary shadow-lg shadow-holi-secondary/20'
                                                    : 'bg-[#0d0714] text-white border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            Masculino
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 2: CONTATO E ENDEREÇO */}
                        <div className="pt-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#06b6d4] mb-5 flex items-center gap-2">
                                <Phone size={16} /> Contato e Endereço
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Telefone / WhatsApp */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        WhatsApp / Telefone *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={(e) => handleCheckIdentifier('phone', e.target.value)}
                                            placeholder="(11) 99999-9999"
                                            className="w-full pl-10 pr-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-secondary focus:ring-1 focus:ring-holi-secondary text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Contato de Emergência */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Telefone de Emergência
                                    </label>
                                    <input
                                        type="tel"
                                        name="emergency_phone"
                                        value={formData.emergency_phone}
                                        onChange={handleChange}
                                        placeholder="(11) 99999-9999"
                                        className="w-full px-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-secondary text-sm"
                                    />
                                </div>

                                {/* CPF */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        CPF (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        onBlur={(e) => handleCheckIdentifier('cpf', e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="w-full px-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-secondary text-sm"
                                    />
                                </div>

                                {/* Cidade */}
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Sua cidade"
                                        className="w-full px-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-secondary text-sm"
                                    />
                                </div>

                                {/* Endereço */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Endereço Completo
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Rua, número, complemento, bairro"
                                        className="w-full px-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-holi-secondary text-sm"
                                    />
                                </div>

                                {/* Paróquia */}
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                        Paróquia / Comunidade
                                    </label>
                                    <select
                                        name="parish"
                                        value={formData.parish}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-[#0d0714] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-holi-secondary text-sm"
                                    >
                                        <option value="">Selecione sua paróquia...</option>
                                        {PARISHES.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 3: ESCOLHA DO KIT / INGRESSO */}
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-holi-accent mb-4 flex items-center gap-2">
                                <Package size={16} /> Opções de Inscrição & Kit ({event?.name})
                            </h3>

                            <div className="space-y-3">
                                {event?.kit_options.map(kit => (
                                    <label
                                        key={kit.id}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                            formData.kit_option === kit.name
                                                ? 'bg-holi-primary/10 border-holi-primary shadow-lg shadow-holi-primary/10'
                                                : 'bg-black/30 border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="kit_option"
                                                value={kit.name}
                                                checked={formData.kit_option === kit.name}
                                                onChange={handleChange}
                                                className="text-holi-primary focus:ring-holi-primary"
                                            />
                                            <div>
                                                <span className="text-white font-bold block text-sm">{kit.name}</span>
                                                {kit.includesTshirt && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Shirt size={12} className="text-holi-secondary" />
                                                        Inclui {kit.tshirtCount || 1} camiseta oficial do retiro
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-lg font-black text-holi-secondary">
                                            R$ {kit.price},00
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Tamanhos de Camiseta */}
                            {needsTshirt1 && (
                                <div className="mt-4 p-4 bg-black/40 border border-white/10 rounded-2xl">
                                    <label className="block text-xs uppercase tracking-wider text-gray-300 font-bold mb-2 flex items-center gap-2">
                                        <Shirt size={14} className="text-holi-primary" />
                                        Tamanho da Camiseta {needsTshirt2 ? '01' : ''} *
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TSHIRT_SIZES.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, tshirt_size: size }))}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                                    formData.tshirt_size === size
                                                        ? 'bg-holi-primary text-white border-holi-primary shadow-md shadow-holi-primary/30'
                                                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {needsTshirt2 && (
                                <div className="mt-4 p-4 bg-black/40 border border-white/10 rounded-2xl">
                                    <label className="block text-xs uppercase tracking-wider text-gray-300 font-bold mb-2 flex items-center gap-2">
                                        <Shirt size={14} className="text-holi-secondary" />
                                        Tamanho da Camiseta 02 *
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {TSHIRT_SIZES.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, tshirt_size_2: size }))}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                                    formData.tshirt_size_2 === size
                                                        ? 'bg-holi-secondary text-white border-holi-secondary shadow-md shadow-holi-secondary/30'
                                                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/30'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pernoite / Acomodação */}
                            <div className="mt-4">
                                <label className="flex items-start gap-3 p-4 bg-black/30 border border-white/10 rounded-2xl cursor-pointer hover:border-white/20 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="staying_on_site"
                                        checked={formData.staying_on_site}
                                        onChange={handleChange}
                                        className="mt-1 rounded bg-black border-white/20 text-holi-primary focus:ring-holi-primary"
                                    />
                                    <div>
                                        <span className="text-white text-sm font-bold block">
                                            Desejo pernoitar / ficar alojado no retiro
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Marque se você for dormir no local do evento durante os dias do retiro.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-6 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-holi-primary via-purple-600 to-holi-secondary text-white font-black text-lg uppercase tracking-wider rounded-2xl shadow-xl shadow-holi-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" /> Processando Inscrição...
                                    </>
                                ) : (
                                    <>
                                        <span>Garantir Vaga no {event?.name} — R$ {paymentAmount},00</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-3">
                                Ao se inscrever, você será direcionado para a tela de pagamento seguro via PIX.
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default RegistrationPage
