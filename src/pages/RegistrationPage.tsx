import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import {
    User, Mail, Calendar, Phone, MapPin,
    Home, CheckCircle, Package, Shirt,
    ArrowRight, Loader2, Sparkles, CreditCard
} from 'lucide-react'

const TSHIRT_SIZES = ['P', 'M', 'G', 'GG', 'XG', 'BABYLOOK P', 'BABYLOOK M', 'BABYLOOK G']
const PARISHES = [
    'Paróquia São José da Santíssima Trindade',
    'Paróquia Santa Clara de Assis',
    'Paróquia São Sebastião',
    'Outros'
]

const RegistrationPage = () => {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        birth_date: '',
        gender: '',
        address: '',
        city: '',
        phone: '',
        emergency_phone: '',
        parish: '',
        staying_on_site: false,
        kit_option: 'Kit 01 - Inscrição (R$ 30,00)',
        tshirt_size: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked
            setFormData(prev => ({ ...prev, [name]: checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const payment_amount = formData.kit_option.includes('70') ? 70 : 30

            const { error: insertError } = await supabase
                .from('event_registrations')
                .insert([{
                    ...formData,
                    payment_amount,
                    payment_status: 'Pendente'
                }])

            if (insertError) throw insertError

            setSubmitted(true)
            window.scrollTo(0, 0)
        } catch (err: any) {
            console.error('Error submitting registration:', err)
            setError('Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 relative">
                <div className="max-w-2xl mx-auto bg-holi-surface border border-white/10 rounded-3xl p-8 md:p-12 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                        <CheckCircle size={40} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">Inscrição Realizada!</h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Sua pré-inscrição foi recebida com sucesso. Para confirmar sua participação, realize o pagamento via PIX.
                    </p>

                    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-10 text-left">
                        <h3 className="text-holi-primary font-bold uppercase text-sm mb-4 tracking-widest flex items-center gap-2">
                            <CreditCard size={16} /> Dados para Pagamento
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-gray-500 text-xs block uppercase">Chave PIX (CPF)</span>
                                <span className="text-xl font-mono text-white">255.985.138-54</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-xs block uppercase">Favorecido</span>
                                <span className="text-white font-bold">Richard Wagner de Oliveira Portela</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-xs block uppercase">Valor</span>
                                <span className="text-2xl font-black text-holi-secondary">
                                    {formData.kit_option.includes('70') ? 'R$ 70,00' : 'R$ 30,00'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-8 italic">
                        * Após realizar o pagamento, envie o comprovante para o Wagner: (11) 95550-1090
                    </p>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-white text-black font-black py-4 px-8 rounded-xl hover:bg-holi-primary hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 mx-auto"
                    >
                        Voltar para o Início <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto relative">
                {/* Background Sparkles */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-holi-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-holi-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-holi-primary/10 to-holi-secondary/10 border border-white/10 px-4 py-2 rounded-full mb-6"
                    >
                        <Sparkles size={16} className="text-holi-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">Inscrições Abertas - Carnaval 2025</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                        Faça sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-holi-primary via-holi-secondary to-holi-accent">Inscrição</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Participe do Retiro de Carnaval "Prova e vê como o Senhor é bom!".
                        Garanta sua vaga agora mesmo.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-holi-surface border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

                        {/* Personal Info Section */}
                        <div className="md:col-span-2">
                            <h3 className="text-holi-primary font-bold uppercase text-xs tracking-[0.3em] mb-6 flex items-center gap-2">
                                <User size={14} /> Dados Pessoais
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    required
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white"
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white"
                                    placeholder="joao@exemplo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Data de Nascimento</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    required
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Sexo</label>
                            <div className="flex gap-4">
                                {['Feminino', 'Masculino'].map(option => (
                                    <label key={option} className="flex-1">
                                        <input
                                            required
                                            type="radio"
                                            name="gender"
                                            value={option}
                                            checked={formData.gender === option}
                                            onChange={handleChange}
                                            className="hidden peer"
                                        />
                                        <div className="bg-black/50 border border-white/10 rounded-2xl py-4 text-center cursor-pointer hover:border-holi-primary/50 peer-checked:border-holi-primary peer-checked:bg-holi-primary/10 transition-all text-sm font-bold">
                                            {option}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="md:col-span-2 pt-4">
                            <h3 className="text-holi-secondary font-bold uppercase text-xs tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Phone size={14} /> Contato e Endereço
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Celular (WhatsApp)</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white"
                                    placeholder="(11) 98888-8888"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Celular Responsável</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    required
                                    name="emergency_phone"
                                    value={formData.emergency_phone}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white"
                                    placeholder="(11) 98888-8888"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Endereço (Rua, Nº, Bairro)</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-gray-500" size={18} />
                                <textarea
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white min-h-[100px]"
                                    placeholder="Ex: Rua das Flores, 123, Centro"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Cidade</label>
                            <div className="relative">
                                <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    required
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-holi-primary transition-all outline-none text-white"
                                    placeholder="Ex: São Paulo"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Paróquia</label>
                            <div className="relative">
                                <select
                                    required
                                    name="parish"
                                    value={formData.parish}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-4 focus:border-holi-primary transition-all outline-none text-white appearance-none"
                                >
                                    <option value="" disabled>Selecione sua paróquia</option>
                                    {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Event Details Section */}
                        <div className="md:col-span-2 pt-4">
                            <h3 className="text-holi-accent font-bold uppercase text-xs tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Package size={14} /> Opções do Evento
                            </h3>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <label className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-all">
                                <input
                                    type="checkbox"
                                    name="staying_on_site"
                                    checked={formData.staying_on_site}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-holi-primary"
                                />
                                <div className="flex-1">
                                    <span className="font-bold text-white block">Vai dormir no local?</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Selecione se for se alojar conosco</span>
                                </div>
                            </label>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400 ml-1">Escolha seu Kit</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Kit 01 - Inscrição (R$ 30,00)', icon: <CheckCircle /> },
                                    { label: 'Kit 02 - Inscrição + Camiseta (R$ 70,00)', icon: <Shirt /> }
                                ].map(option => (
                                    <label key={option.label} className="flex-1">
                                        <input
                                            required
                                            type="radio"
                                            name="kit_option"
                                            value={option.label}
                                            checked={formData.kit_option === option.label}
                                            onChange={handleChange}
                                            className="hidden peer"
                                        />
                                        <div className="h-full bg-black/50 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-holi-accent/50 peer-checked:border-holi-accent peer-checked:bg-holi-accent/10 transition-all text-center">
                                            <div className="mb-3 text-holi-accent flex justify-center">
                                                {option.icon}
                                            </div>
                                            <div className="text-sm font-black uppercase tracking-wide">{option.label}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {formData.kit_option.includes('70') && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="md:col-span-2 space-y-2 overflow-hidden"
                            >
                                <label className="text-xs font-bold uppercase text-gray-400 ml-1">Tamanho da Camiseta</label>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                    {TSHIRT_SIZES.map(size => (
                                        <label key={size}>
                                            <input
                                                required
                                                type="radio"
                                                name="tshirt_size"
                                                value={size}
                                                checked={formData.tshirt_size === size}
                                                onChange={handleChange}
                                                className="hidden peer"
                                            />
                                            <div className="bg-black/50 border border-white/10 rounded-lg py-3 text-center cursor-pointer hover:border-holi-primary/50 peer-checked:border-holi-primary peer-checked:bg-holi-primary text-[10px] font-black transition-all">
                                                {size}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="md:col-span-2 pt-8">
                            <button
                                disabled={loading}
                                className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-holi-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-holi-primary/20 hover:-translate-y-1 group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Finalizar Inscrição</span>
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegistrationPage
