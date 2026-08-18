import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, ChevronLeft, ChevronRight, Maximize2,
    Grid3X3, Layers, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export interface GalleryImage {
    id: string
    url: string
    label?: string | null
    position_top?: string | null
    position_left?: string | null
    position_right?: string | null
    rotate?: number | null
    z_index?: number | null
    aspect_ratio?: string | null
    width_class?: string | null
    is_polaroid?: boolean | null
    created_at?: string
}

const DEFAULT_ROTATIONS = [-3, 2, -1.5, 3, -2, 1, -2.5, 2.5]
const DEFAULT_LABELS = [
    'Adoração Profunda',
    'Festa das Cores Holi',
    'Louvor & Juventude',
    'Família Voz de Deus',
    'Amor que Transforma',
    'Momento Eucarístico',
    'Alegria Verdadeira',
    'Vida Nova em Cristo',
    'Testemunhos',
    'Unidade & Fé'
]

export const GallerySection = () => {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'polaroid'>('grid')
    const [visibleCount, setVisibleCount] = useState(12)

    const fetchImages = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            // 1. Tenta buscar da tabela oficial do admin: gallery_images
            const { data: dbImages, error: dbError } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false })

            if (!dbError && dbImages && dbImages.length > 0) {
                setImages(dbImages)
                setLoading(false)
                return
            }

            if (dbError) {
                console.warn('Aviso ao consultar tabela gallery_images:', dbError.message)
            }

            // 2. Fallback: Buscar direto do bucket de Storage site-assets/gallery
            const { data: storageFiles, error: storageError } = await supabase
                .storage
                .from('site-assets')
                .list('gallery', {
                    limit: 100,
                    sortBy: { column: 'name', order: 'asc' }
                })

            if (storageError) {
                throw new Error(`Erro no Storage: ${storageError.message}`)
            }

            if (storageFiles && storageFiles.length > 0) {
                const validFiles = storageFiles.filter(f =>
                    f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                )

                const mapped: GalleryImage[] = validFiles.map((file, idx) => {
                    const { data: publicUrlData } = supabase
                        .storage
                        .from('site-assets')
                        .getPublicUrl(`gallery/${file.name}`)

                    return {
                        id: file.id || file.name,
                        url: publicUrlData.publicUrl,
                        label: DEFAULT_LABELS[idx % DEFAULT_LABELS.length],
                        rotate: DEFAULT_ROTATIONS[idx % DEFAULT_ROTATIONS.length],
                        z_index: 10 + (idx % 20),
                        aspect_ratio: idx % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square',
                        width_class: 'w-full',
                        is_polaroid: true
                    }
                })

                setImages(mapped)
            } else {
                setImages([])
            }
        } catch (err: any) {
            console.error('Erro ao carregar galeria:', err)
            setError(err.message || 'Não foi possível carregar as fotos da galeria.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchImages()
    }, [fetchImages])

    // Navegação por teclado no Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return

            if (e.key === 'Escape') {
                setSelectedIndex(null)
            } else if (e.key === 'ArrowRight') {
                setSelectedIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
            } else if (e.key === 'ArrowLeft') {
                setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIndex, images.length])

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
    }

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
    }

    const currentImage = selectedIndex !== null ? images[selectedIndex] : null

    return (
        <section className="py-24 md:py-32 bg-[#08040d] text-white relative overflow-hidden" id="galeria">
            {/* Elementos visuais de fundo */}
            <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none" />
            <div className="absolute top-1/4 -left-48 w-96 h-96 bg-holi-primary/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-holi-secondary/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[180px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Cabeçalho da Seção */}
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest uppercase text-holi-secondary mb-4 shadow-sm"
                    >
                        <Sparkles size={14} className="text-holi-primary animate-pulse" />
                        <span>Momentos Que Marcam Vidas</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative inline-block"
                    >
                        <div className="bg-white text-black px-10 md:px-14 py-4 md:py-6 shadow-[12px_12px_0px_#d946ef] transform -rotate-2 font-marker text-4xl md:text-7xl uppercase border-4 border-black relative z-10">
                            Galeria de Fotos
                            <div className="absolute -top-3 -right-3 w-6 h-6 bg-holi-accent rounded-full border-3 border-black" />
                            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-holi-secondary rounded-full border-3 border-black" />
                        </div>
                    </motion.div>

                    <p className="mt-8 text-gray-300 text-base md:text-lg max-w-2xl font-sans leading-relaxed">
                        Reviva a energia do louvor, a profundidade da adoração e a explosão de cores dos nossos retiros.
                    </p>

                    {/* Barra de Controles e Alternador de Modo */}
                    {!loading && images.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                    viewMode === 'grid'
                                        ? 'bg-holi-primary text-white border-holi-primary shadow-lg shadow-holi-primary/30'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Grid3X3 size={15} />
                                <span>Mosaico ({images.length})</span>
                            </button>

                            <button
                                onClick={() => setViewMode('polaroid')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                                    viewMode === 'polaroid'
                                        ? 'bg-holi-secondary text-black border-holi-secondary shadow-lg shadow-holi-secondary/30 font-black'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Layers size={15} />
                                <span>Mural Polaroid</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Estado: Carregando */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-12">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-2xl p-3 pb-8 animate-pulse shadow-xl"
                            >
                                <div className="aspect-square bg-white/10 rounded-xl mb-4" />
                                <div className="h-4 bg-white/10 rounded w-2/3 mx-auto" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Estado: Erro */}
                {!loading && error && (
                    <div className="max-w-md mx-auto my-12 p-8 bg-red-950/40 border border-red-500/30 rounded-3xl text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                        <h3 className="text-xl font-bold text-white">Ops, ocorreu um erro</h3>
                        <p className="text-sm text-gray-300">{error}</p>
                        <button
                            onClick={() => fetchImages()}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors text-xs uppercase tracking-wider"
                        >
                            <RefreshCw size={14} /> Tentar Novamente
                        </button>
                    </div>
                )}

                {/* Estado: Galeria Vazia */}
                {!loading && !error && images.length === 0 && (
                    <div className="py-20 text-center space-y-4 border-2 border-dashed border-white/10 rounded-3xl max-w-xl mx-auto">
                        <div className="font-marker text-3xl md:text-4xl text-gray-400">Galeria Vazia</div>
                        <p className="text-sm text-gray-400 max-w-md mx-auto px-4">
                            Nenhuma foto publicada ainda. Acesse o painel administrativo para fazer o upload das imagens do evento.
                        </p>
                    </div>
                )}

                {/* CONTEÚDO DA GALERIA */}
                {!loading && !error && images.length > 0 && (
                    <>
                        {/* MODO 1: Mosaico / Grid Responsivo */}
                        {viewMode === 'grid' && (
                            <div className="space-y-12">
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                >
                                    {images.slice(0, visibleCount).map((img, idx) => {
                                        const rotation = img.rotate || DEFAULT_ROTATIONS[idx % DEFAULT_ROTATIONS.length]
                                        const labelText = img.label || DEFAULT_LABELS[idx % DEFAULT_LABELS.length]

                                        return (
                                            <motion.div
                                                key={img.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.35, delay: (idx % 4) * 0.08 }}
                                                whileHover={{
                                                    scale: 1.03,
                                                    rotate: 0,
                                                    zIndex: 20
                                                }}
                                                style={{ rotate: `${rotation}deg` }}
                                                onClick={() => setSelectedIndex(idx)}
                                                className="group cursor-pointer bg-white text-gray-900 rounded-xl p-3 pb-8 shadow-2xl transition-shadow hover:shadow-[0_20px_40px_rgba(217,70,239,0.3)] relative transform-gpu"
                                            >
                                                {/* Fita Adesiva decorativa no topo */}
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/80 backdrop-blur-sm border border-yellow-400/40 rounded-sm transform rotate-1 shadow-sm pointer-events-none" />

                                                {/* Foto */}
                                                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 relative">
                                                    <img
                                                        src={img.url}
                                                        alt={labelText || 'Foto do Retiro'}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white/90 text-black p-2.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                            <Maximize2 size={18} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Legenda Estilo Polaroid */}
                                                <div className="mt-4 text-center px-1">
                                                    <p className="font-marker text-lg text-gray-900 leading-tight truncate">
                                                        {labelText}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </motion.div>

                                {/* Botão Carregar Mais */}
                                {visibleCount < images.length && (
                                    <div className="flex justify-center pt-8">
                                        <button
                                            onClick={() => setVisibleCount(prev => Math.min(prev + 12, images.length))}
                                            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-black uppercase text-sm tracking-wider rounded-full shadow-[6px_6px_0px_#06b6d4] hover:shadow-[2px_2px_0px_#06b6d4] hover:translate-x-1 hover:translate-y-1 transition-all border-2 border-black"
                                        >
                                            <span>Carregar Mais Fotos ({images.length - visibleCount} restantes)</span>
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MODO 2: Mural Polaroid Artístico */}
                        {viewMode === 'polaroid' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 pt-4">
                                    {images.slice(0, visibleCount).map((img, idx) => {
                                        const rotation = (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 5))
                                        const labelText = img.label || DEFAULT_LABELS[idx % DEFAULT_LABELS.length]

                                        return (
                                            <motion.div
                                                key={img.id}
                                                drag
                                                dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
                                                whileHover={{ scale: 1.08, zIndex: 50, rotate: 0 }}
                                                initial={{ rotate: rotation, opacity: 0, y: 20 }}
                                                animate={{ rotate: rotation, opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                onClick={() => setSelectedIndex(idx)}
                                                className="bg-white p-3 pb-8 rounded-sm shadow-2xl cursor-grab active:cursor-grabbing border border-gray-200 select-none relative"
                                            >
                                                {/* Marcador de alfinete/fita */}
                                                <div className={`absolute -top-2 ${idx % 2 === 0 ? 'left-6' : 'right-6'} w-4 h-4 rounded-full ${idx % 3 === 0 ? 'bg-red-500' : idx % 3 === 1 ? 'bg-yellow-400' : 'bg-cyan-400'} border-2 border-white shadow-md z-10`} />

                                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={img.url}
                                                        alt={labelText}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover pointer-events-none"
                                                    />
                                                </div>

                                                <div className="font-marker text-gray-900 text-base md:text-lg text-center mt-3 truncate px-1">
                                                    {labelText}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                {visibleCount < images.length && (
                                    <div className="flex justify-center pt-8">
                                        <button
                                            onClick={() => setVisibleCount(prev => Math.min(prev + 12, images.length))}
                                            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-colors text-xs uppercase tracking-widest border border-white/20"
                                        >
                                            Exibir Mais Fotos ({images.length - visibleCount} restantes)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedIndex !== null && currentImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedIndex(null)}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                    >
                        {/* Botão Fechar */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedIndex(null)
                            }}
                            aria-label="Fechar visualização"
                            className="absolute top-5 right-5 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-110 shadow-xl"
                        >
                            <X size={24} />
                        </button>

                        {/* Botão Anterior */}
                        <button
                            onClick={handlePrev}
                            aria-label="Foto anterior"
                            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-110 shadow-xl"
                        >
                            <ChevronLeft size={28} />
                        </button>

                        {/* Botão Próximo */}
                        <button
                            onClick={handleNext}
                            aria-label="Próxima foto"
                            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 transition-all hover:scale-110 shadow-xl"
                        >
                            <ChevronRight size={28} />
                        </button>

                        {/* Conteúdo Central do Lightbox */}
                        <motion.div
                            key={currentImage.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
                        >
                            <div className="bg-white p-3 pb-12 sm:pb-14 rounded-2xl shadow-[0_0_60px_rgba(217,70,239,0.3)] max-w-full max-h-[75vh] flex flex-col items-center">
                                <img
                                    src={currentImage.url}
                                    alt={currentImage.label || 'Foto ampliada'}
                                    className="max-h-[60vh] max-w-full object-contain rounded-lg"
                                />

                                <div className="mt-4 flex items-center justify-between w-full px-4 text-gray-900">
                                    <span className="font-marker text-xl sm:text-2xl truncate">
                                        {currentImage.label || DEFAULT_LABELS[selectedIndex % DEFAULT_LABELS.length]}
                                    </span>
                                    <span className="font-mono text-xs text-gray-500 uppercase tracking-widest shrink-0 ml-4">
                                        {selectedIndex + 1} de {images.length}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default GallerySection
