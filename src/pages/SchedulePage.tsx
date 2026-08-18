import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Clock, Calendar, Sparkles, Utensils, Moon,
    Sun, Heart, Church, CheckCircle2, ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface ScheduleItem {
    time: string
    title: string
    category: 'welcome' | 'meal' | 'prayer' | 'activity' | 'break' | 'mass' | 'rest'
    highlight?: boolean
}

interface DaySchedule {
    id: string
    dayName: string
    date: string
    subtitle: string
    tag: string
    color: string
    events: ScheduleItem[]
}

const SCHEDULE_DATA: DaySchedule[] = [
    {
        id: 'sexta',
        dayName: 'Sexta-feira',
        date: '25 de Setembro de 2026',
        subtitle: 'Acolhida & Início da Jornada',
        tag: '25/09',
        color: 'from-fuchsia-500 to-pink-600',
        events: [
            { time: '19h00', title: 'Acolhida e abertura do retiro', category: 'welcome', highlight: true },
            { time: '20h30', title: 'Jantar', category: 'meal' },
            { time: '21h30', title: 'Momento de oração e Adoração', category: 'prayer', highlight: true },
            { time: '22h30', title: 'Lanche', category: 'meal' },
            { time: '23h00', title: 'Banho e descanso', category: 'rest' }
        ]
    },
    {
        id: 'sabado',
        dayName: 'Sábado',
        date: '26 de Setembro de 2026',
        subtitle: 'Imersão, Atividades & Celebração',
        tag: '26/09',
        color: 'from-amber-400 to-orange-500',
        events: [
            { time: '08h00', title: 'Recepção e café da manhã', category: 'meal' },
            { time: '08h30', title: 'Início das atividades', category: 'activity', highlight: true },
            { time: '10h25', title: 'Intervalo', category: 'break' },
            { time: '12h30', title: 'Almoço', category: 'meal' },
            { time: '14h30', title: 'Retorno das atividades', category: 'activity' },
            { time: '16h50', title: 'Intervalo', category: 'break' },
            { time: '20h00', title: 'Tempo livre e organização pessoal', category: 'rest' },
            { time: '20h30', title: 'Jantar', category: 'meal' },
            { time: '21h30', title: 'Adoração', category: 'prayer', highlight: true },
            { time: '22h30', title: 'Lanche', category: 'meal' },
            { time: '23h00', title: 'Banho e descanso', category: 'rest' }
        ]
    },
    {
        id: 'domingo',
        dayName: 'Domingo',
        date: '27 de Setembro de 2026',
        subtitle: 'Ápice da Fé & Missa Solene',
        tag: '27/09',
        color: 'from-cyan-400 to-blue-600',
        events: [
            { time: '07h00', title: 'Despertar', category: 'rest' },
            { time: '07h30', title: 'Café da manhã', category: 'meal' },
            { time: '09h00', title: 'Início das atividades', category: 'activity' },
            { time: '10h30', title: 'Intervalo', category: 'break' },
            { time: '12h30', title: 'Almoço', category: 'meal' },
            { time: '14h00', title: 'Retorno das atividades', category: 'activity' },
            { time: '15h00', title: 'Santa Missa com Dom José', category: 'mass', highlight: true },
            { time: '16h00', title: 'Intervalo', category: 'break' },
            { time: '16h45', title: 'Retorno das atividades', category: 'activity' },
            { time: 'Após as atividades', title: 'Encerramento previsto do retiro', category: 'welcome', highlight: true }
        ]
    }
]

const getCategoryBadge = (category: ScheduleItem['category']) => {
    switch (category) {
        case 'mass':
            return {
                icon: <Church size={16} className="text-amber-400" />,
                label: 'Missa Solene',
                bg: 'bg-amber-400/15 border-amber-400/30 text-amber-300'
            }
        case 'prayer':
            return {
                icon: <Heart size={16} className="text-pink-400" />,
                label: 'Oração / Adoração',
                bg: 'bg-pink-400/15 border-pink-400/30 text-pink-300'
            }
        case 'meal':
            return {
                icon: <Utensils size={16} className="text-emerald-400" />,
                label: 'Refeição',
                bg: 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
            }
        case 'activity':
            return {
                icon: <Sparkles size={16} className="text-cyan-400" />,
                label: 'Atividade Geral',
                bg: 'bg-cyan-400/15 border-cyan-400/30 text-cyan-300'
            }
        case 'break':
            return {
                icon: <Clock size={16} className="text-gray-400" />,
                label: 'Intervalo',
                bg: 'bg-gray-400/15 border-gray-400/30 text-gray-300'
            }
        case 'rest':
            return {
                icon: <Moon size={16} className="text-purple-400" />,
                label: 'Descanso / Pessoal',
                bg: 'bg-purple-400/15 border-purple-400/30 text-purple-300'
            }
        case 'welcome':
        default:
            return {
                icon: <Sun size={16} className="text-yellow-400" />,
                label: 'Destaque',
                bg: 'bg-yellow-400/15 border-yellow-400/30 text-yellow-300'
            }
    }
}

export const SchedulePage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<string>('todos')

    const displayedDays = selectedTab === 'todos'
        ? SCHEDULE_DATA
        : SCHEDULE_DATA.filter(day => day.id === selectedTab)

    return (
        <div className="pt-28 pb-24 min-h-screen bg-[#060309] text-white relative overflow-hidden">
            {/* Efeitos visuais de fundo */}
            <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-holi-primary/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-holi-secondary/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-900/10 rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* CABEÇALHO */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase text-holi-secondary mb-5 shadow-sm"
                    >
                        <Calendar size={14} className="text-holi-primary" />
                        <span>25, 26 E 27 DE SETEMBRO DE 2026 • NOVO HORIZONTE / SP</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="relative inline-block mb-4"
                    >
                        <h1 className="bg-white text-black px-8 sm:px-12 py-4 sm:py-6 shadow-[10px_10px_0px_#d946ef] transform -rotate-1 font-marker text-3xl sm:text-5xl md:text-6xl uppercase border-4 border-black inline-block">
                            Cronograma dos Participantes
                        </h1>
                    </motion.div>

                    <p className="max-w-2xl mx-auto text-gray-300 text-base md:text-lg font-sans leading-relaxed mt-4">
                        Confira a programação completa do <strong className="text-white">Retiro Adonai 2026</strong>.
                        Organize seus horários e prepare o coração para viver momentos inesquecíveis.
                    </p>

                    {/* ABAS DE SELEÇÃO DE DIA */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
                        <button
                            onClick={() => setSelectedTab('todos')}
                            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                                selectedTab === 'todos'
                                    ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            Todos os Dias
                        </button>
                        {SCHEDULE_DATA.map(day => (
                            <button
                                key={day.id}
                                onClick={() => setSelectedTab(day.id)}
                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                                    selectedTab === day.id
                                        ? 'bg-gradient-to-r from-holi-primary to-purple-600 text-white border-holi-primary shadow-lg shadow-holi-primary/30'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {day.dayName} ({day.tag})
                            </button>
                        ))}
                    </div>
                </div>

                {/* TIMELINE DE DIAS */}
                <div className="space-y-16">
                    <AnimatePresence mode="wait">
                        {displayedDays.map((day, dayIdx) => (
                            <motion.div
                                key={day.id}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, delay: dayIdx * 0.1 }}
                                className="bg-[#11071c]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
                            >
                                {/* Header do Card do Dia */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-white/10 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-r from-holi-primary to-purple-600 text-white font-marker text-2xl sm:text-3xl px-6 py-2.5 rounded-2xl shadow-lg border-2 border-black">
                                            {day.tag}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                                                {day.dayName}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-gray-400 font-medium">
                                                {day.date} • <span className="text-holi-secondary">{day.subtitle}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono uppercase text-gray-500 tracking-wider">
                                        {day.events.length} HORÁRIOS PROGRAMADOS
                                    </div>
                                </div>

                                {/* Lista de Horários */}
                                <div className="space-y-3.5">
                                    {day.events.map((event, eventIdx) => {
                                        const badge = getCategoryBadge(event.category)

                                        return (
                                            <motion.div
                                                key={eventIdx}
                                                whileHover={{ scale: 1.01, x: 4 }}
                                                className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 border transition-all duration-300 ${
                                                    event.highlight
                                                        ? 'bg-white/10 border-holi-primary/40 shadow-lg shadow-holi-primary/10'
                                                        : 'bg-black/40 border-white/5 hover:border-white/20'
                                                }`}
                                            >
                                                {/* Horário + Ícone */}
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-holi-secondary">
                                                        <Clock size={18} />
                                                    </div>
                                                    <span className="font-mono font-black text-lg sm:text-xl text-white tracking-tight min-w-[90px]">
                                                        {event.time}
                                                    </span>
                                                </div>

                                                {/* Título da Programação */}
                                                <div className="flex-1">
                                                    <h3 className={`text-base sm:text-lg font-bold uppercase tracking-wide ${
                                                        event.highlight ? 'text-[#fff53c]' : 'text-gray-100'
                                                    }`}>
                                                        {event.title}
                                                    </h3>
                                                </div>

                                                {/* Badge da Categoria */}
                                                <div className="shrink-0">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                                                        {badge.icon}
                                                        <span>{badge.label}</span>
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* INFORMAÇÕES IMPORTANTES & ORIENTAÇÕES */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-2xl bg-holi-primary/20 flex items-center justify-center text-holi-primary mb-4">
                            <Clock size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-white uppercase mb-2">Pontualidade</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Respeite os horários de início das atividades e refeições para não perder nenhum momento da programação.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-2xl bg-holi-secondary/20 flex items-center justify-center text-holi-secondary mb-4">
                            <Church size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-white uppercase mb-2">Missa com Dom José</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            No domingo às 15h00 teremos a Santa Missa solene com nosso Bispo Dom José. Momento de profunda graça!
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-2xl bg-holi-accent/20 flex items-center justify-center text-holi-accent mb-4">
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-white uppercase mb-2">O que levar?</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Bíblia, terço, itens de higiene pessoal, roupas confortáveis, colchão/barraca (se optar por camping) e muita fé!
                        </p>
                    </div>
                </div>

                {/* BANNER CTA */}
                <div className="mt-16 bg-gradient-to-r from-holi-primary/30 via-purple-900/40 to-holi-secondary/30 border border-white/20 rounded-[2.5rem] p-8 sm:p-12 text-center relative overflow-hidden">
                    <h3 className="text-2xl sm:text-4xl font-black uppercase text-white mb-4">
                        Ainda não garantiu a sua vaga?
                    </h3>
                    <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
                        As vagas para o Retiro Adonai 2026 são limitadas. Inscreva-se agora mesmo e viva essa experiência extraordinária!
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/inscricao"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#fff53c] text-black font-black uppercase text-sm tracking-wider rounded-full shadow-[5px_5px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all border-2 border-black"
                        >
                            <span>Fazer Inscrição Agora</span>
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/galeria"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white hover:bg-white/20 font-bold uppercase text-sm tracking-wider rounded-full border border-white/20 transition-all"
                        >
                            <span>Ver Fotos de Edições Anteriores</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SchedulePage
