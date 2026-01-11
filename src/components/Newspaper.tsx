import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Quote, Sun } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NewsItem {
    id: string
    type: 'standard' | 'photo' | 'urgent' | 'quote' | 'list' | 'weather' | 'wanted' | 'grid' | 'invitation' | 'stats'
    bg: string
    title?: string
    subtitle?: string
    tag?: string
    content?: string
    full_content?: string
    items?: string[]
    full_items?: string[]
    img?: string
    images?: string[]
    caption?: string
    marker?: string
    rotate: string
    torn: boolean
    hot: boolean
    tape: boolean
    author?: string
    temp?: string
    desc_weather?: string
    full_desc_weather?: string
    quote: boolean
    order_index: number
}

const Newspaper = () => {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedNews, setSelectedNews] = useState<string | null>(null)

    useEffect(() => {
        fetchNews()
    }, [])

    const fetchNews = async () => {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('order_index', { ascending: true })

        if (!error && data) {
            setNews(data)
        }
        setLoading(false)
    }

    const selectedItem = news.find(n => n.id === selectedNews)

    if (loading) return null

    return (
        <section className="py-32 relative overflow-hidden z-20 bg-[#0a0a0a]" id="noticias">
            <div className="absolute inset-0 bg-noise opacity-20 z-0"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 relative">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="font-marker text-holi-primary text-xl rotate-[-5deg] inline-block absolute -top-8 left-1/2 -translate-x-20"
                    >
                        Extra! Extra!
                    </motion.span>
                    <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter inline-block border-b-4 border-white pb-2">
                        Últimas Notícias
                    </h2>
                </div>

                <div className="newspaper-cols gap-10 perspective-1000">
                    {news.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ rotate: 0, scale: 1.05, zIndex: 50, transition: { duration: 0.2 } }}
                            onClick={() => setSelectedNews(item.id)}
                            className={`block break-inside-avoid shadow-[10px_10px_30px_rgba(0,0,0,0.5)] ${item.bg} p-8 ${item.torn ? 'torn-paper-edge' : 'rounded-sm'} ${item.rotate} transition-all duration-300 relative group cursor-pointer mb-12 border border-black/5`}
                        >
                            {/* Standard Newspaper Card */}
                            {item.type === 'standard' && (
                                <div className="text-gray-900">
                                    <div className="border-b-2 border-black/40 mb-6 pb-2 flex justify-between items-end">
                                        <span className="font-news font-bold italic text-xl text-black/80">{item.subtitle}</span>
                                        {item.tag && <span className="font-mono text-xs font-black text-black/60 tracking-tighter">{item.tag}</span>}
                                    </div>
                                    <h3 className="font-news font-black text-4xl leading-[0.85] mb-6 uppercase tracking-tighter text-black">{item.title}</h3>
                                    <div className="font-news text-[15px] text-justify leading-snug mb-6 text-gray-800">
                                        <span className="float-left text-6xl font-black mr-3 mt-[-8px] font-display text-black">
                                            {item.content?.charAt(0)}
                                        </span>
                                        {item.content?.substring(1)}
                                    </div>
                                    <div className="w-full h-1.5 bg-black/20 mb-1"></div>
                                    <div className="w-full h-0.5 bg-black/20"></div>
                                    {item.marker && (
                                        <div className="absolute bottom-4 right-4 text-holi-secondary font-marker text-2xl rotate-[-5deg] drop-shadow-sm">{item.marker}</div>
                                    )}
                                </div>
                            )}

                            {/* Photo / Bastidores */}
                            {item.type === 'photo' && (
                                <div className="space-y-4">
                                    {item.tape && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 tape rotate-3 z-10 opacity-90"></div>}
                                    <div className="aspect-video overflow-hidden grayscale contrast-150 border-4 border-gray-100 shadow-inner">
                                        <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="News photo" />
                                    </div>
                                    <p className="font-mono text-[11px] text-gray-400 uppercase tracking-[0.2em] text-center font-bold">{item.caption}</p>
                                    <div className="absolute bottom-4 right-4 text-red-600 font-marker text-2xl rotate-[-10deg] drop-shadow-md">{item.marker}</div>
                                </div>
                            )}

                            {/* Urgent / Camisetas */}
                            {item.type === 'urgent' && (
                                <div className="text-white relative py-2">
                                    {item.hot && (
                                        <div className="absolute -top-10 -right-6 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-red-900 font-black text-sm animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.5)] border-4 border-white rotate-12 z-20">HOT</div>
                                    )}
                                    <h4 className="font-black font-display text-3xl uppercase mb-4 leading-none tracking-tighter">{item.title}</h4>
                                    <p className="font-display text-base font-medium opacity-90 leading-tight">{item.content}</p>
                                </div>
                            )}

                            {/* Quote */}
                            {item.type === 'quote' && (
                                <div className="text-center py-6 relative">
                                    <Quote className="absolute -top-2 -left-2 opacity-5 text-holi-primary" size={80} />
                                    <p className="font-news italic text-2xl text-gray-100 leading-relaxed mb-6 relative z-10 drop-shadow-lg">"{item.content}"</p>
                                    <div className="font-mono text-sm text-holi-secondary uppercase tracking-[0.3em] font-bold">- {item.author}</div>
                                </div>
                            )}

                            {/* Checklist */}
                            {item.type === 'list' && (
                                <div className="text-gray-900">
                                    <h4 className="font-marker text-3xl mb-6 border-b-2 border-black/10 pb-2">{item.title}</h4>
                                    <ul className="font-news text-lg space-y-3 font-medium">
                                        {item.items?.map((li, i) => (
                                            <li key={i} className={`flex items-center gap-2 ${li.includes('(riscado)') ? 'line-through decoration-red-600 decoration-[3px] opacity-40' : ''}`}>
                                                <span className="w-2 h-2 rounded-full bg-black/30"></span>
                                                {li.replace(' (riscado)', '')}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Weather */}
                            {item.type === 'weather' && (
                                <div className="border-[6px] border-blue-200/50 p-6 text-center text-blue-900 bg-white/40 backdrop-blur-sm rounded-xl">
                                    <span className="block font-black uppercase text-sm tracking-[0.2em] mb-4 opacity-60">Previsão do Tempo</span>
                                    <div className="flex justify-center items-center gap-4 mb-4">
                                        <Sun className="text-yellow-500 animate-spin-slow drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" size={64} />
                                        <span className="text-6xl font-black tracking-tighter">{item.temp}</span>
                                    </div>
                                    <span className="block font-news italic text-lg font-bold text-blue-800/80">{item.desc_weather}</span>
                                </div>
                            )}

                            {/* Wanted */}
                            {item.type === 'wanted' && (
                                <div className="border-dashed border-4 border-black/80 p-6 text-center text-black">
                                    <h5 className="font-black text-4xl uppercase mb-3 tracking-widest">PROCURA-SE</h5>
                                    <div className="w-full h-0.5 bg-black/10 my-4"></div>
                                    <p className="font-mono text-xs leading-relaxed uppercase font-black tracking-widest">{item.content}</p>
                                </div>
                            )}

                            {/* Grid / Momentos */}
                            {item.type === 'grid' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {item.images?.map((img, i) => (
                                            <div key={i} className="aspect-square bg-gray-100 border-2 border-black overflow-hidden shadow-md">
                                                <img src={img} className="w-full h-full object-cover opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500" alt="Moment" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black text-white font-black text-center text-sm uppercase py-3 tracking-widest rotate-1">{item.marker}</div>
                                </div>
                            )}

                            {/* Invitation */}
                            {item.type === 'invitation' && (
                                <div className="text-gray-900">
                                    <h4 className="font-news font-black text-2xl mb-4 border-b border-black/10 pb-2">{item.title}</h4>
                                    <p className="font-news text-sm text-justify leading-relaxed text-gray-700">{item.content}</p>
                                </div>
                            )}

                            {/* Stats */}
                            {item.type === 'stats' && (
                                <div className="text-center py-10 border-[6px] border-double border-white/40 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent">
                                    <span className="block text-7xl font-black mb-2 drop-shadow-lg text-white">{item.title}</span>
                                    <span className="uppercase tracking-[0.4em] text-xs font-black text-white/70">{item.marker}</span>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-holi-primary/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none z-30">
                                <span className="bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase transform -rotate-3 shadow-2xl border-2 border-white/20">Ler a Matéria</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* News Modals */}
            <AnimatePresence>
                {selectedNews && selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNews(null)}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.8, y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`relative w-full max-w-3xl ${selectedItem.bg} ${selectedItem.bg.includes('bg-red') || selectedItem.bg.includes('bg-gray-900') || selectedItem.bg.includes('bg-holi') ? 'text-white' : 'text-gray-900'} p-10 md:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.8)] ${selectedItem.torn ? 'torn-paper-edge' : 'rounded-lg'} max-h-[90vh] overflow-y-auto cursor-default`}
                        >
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="absolute top-8 right-8 bg-black/5 hover:bg-black/10 p-3 rounded-full transition-all hover:rotate-90"
                            >
                                <X size={40} className={selectedItem.bg.includes('bg-white') || selectedItem.bg.includes('bg-[#]') ? 'text-black' : 'text-white'} />
                            </button>

                            <div className="space-y-10">
                                {selectedItem.subtitle && (
                                    <div className={`border-b-4 ${selectedItem.bg.includes('bg-white') || selectedItem.bg.includes('bg-[#]') ? 'border-black' : 'border-white/20'} mb-10 pb-4`}>
                                        <span className="font-news font-bold italic text-2xl opacity-80">{selectedItem.subtitle} - Edição 2026</span>
                                    </div>
                                )}

                                <h2 className="font-news font-black text-6xl leading-[0.8] uppercase tracking-tighter mb-8 italic">
                                    {selectedItem.title || selectedItem.marker}
                                </h2>

                                {(selectedItem.img || (selectedItem.images && selectedItem.images.length > 0)) && (
                                    <div className="w-full bg-gray-200 overflow-hidden border-4 border-black/10 shadow-2xl rounded-sm">
                                        <img
                                            src={selectedItem.img || selectedItem.images![0]}
                                            className="w-full h-auto grayscale contrast-125"
                                            alt="Feature"
                                        />
                                    </div>
                                )}

                                {selectedItem.type === 'quote' && (
                                    <div className="text-center py-12">
                                        <Quote className="mx-auto mb-8 text-holi-primary opacity-50" size={100} />
                                        <p className="font-news italic text-4xl leading-tight drop-shadow-sm">{selectedItem.content}</p>
                                        <div className="mt-10 font-mono text-2xl font-bold tracking-[0.2em]">{selectedItem.author}</div>
                                    </div>
                                )}

                                {selectedItem.type === 'list' && (
                                    <div className="space-y-8">
                                        <h3 className="font-marker text-4xl text-holi-secondary">Checklist Completo:</h3>
                                        <ul className="font-news text-3xl space-y-6 list-none">
                                            {selectedItem.full_items?.map((li, i) => (
                                                <li key={i} className="flex items-center gap-4">
                                                    <span className="w-4 h-4 rounded-full bg-holi-primary"></span>
                                                    {li}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedItem.type === 'weather' && (
                                    <div className="text-center space-y-10 py-10">
                                        <Sun className="mx-auto text-yellow-500 animate-spin-slow" size={160} />
                                        <p className="text-9xl font-black tracking-tighter">{selectedItem.temp}</p>
                                        <p className="font-news italic text-3xl leading-relaxed max-w-xl mx-auto">{selectedItem.full_desc_weather || selectedItem.desc_weather}</p>
                                    </div>
                                )}

                                {(selectedItem.full_content || selectedItem.content) && selectedItem.type !== 'quote' && (
                                    <p className="font-news text-2xl text-justify leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                                        {selectedItem.full_content || selectedItem.content}
                                    </p>
                                )}

                                <div className={`pt-12 border-t-2 ${selectedItem.bg.includes('bg-white') || selectedItem.bg.includes('bg-[#]') ? 'border-black/10' : 'border-white/10'} flex justify-between items-center opacity-40 font-bold`}>
                                    <span className="font-marker text-3xl">Comunidade Voz de Deus</span>
                                    <span className="font-mono text-lg uppercase tracking-widest">NH - Fevereiro 2026</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default Newspaper
