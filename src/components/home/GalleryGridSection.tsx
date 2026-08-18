import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

interface GalleryItem {
    id?: string
    src: string
    alt: string
}

const FALLBACK_IMAGES: GalleryItem[] = [
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482249267_1064251255741917_8368824039255334219_n.jpg',
        alt: 'Jovens cantando e celebrando no Festival Adonai',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482251203_1064251442408565_8860648684017782862_n.jpg',
        alt: 'Apresentação musical e louvor no palco Adonai',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/486604107_1074649104702132_6753569390061113184_n-1.jpg',
        alt: 'Momento de oração em grupo e comunhão',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/486611519_1074648908035485_3130047290730636898_n-1.jpg',
        alt: 'Galera reunida em adoração',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/0b471165-0f96-4e0c-92ce-b54d6711c3ec.jpg',
        alt: 'Público jovem unido no retiro Adonai',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/495086145_1108592794641096_5489144302593018585_n-1.jpg',
        alt: 'Festa das Cores Holi com explosão de cores',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484816427_1064253812408328_7976388588891716218_n.jpg',
        alt: 'Show católico e animação no palco',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484791295_1064252372408472_3823837486130695994_n.jpg',
        alt: 'Ministração e pregação para juventude',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484946477_1064254209074955_1384199723278727056_n.jpg',
        alt: 'Jovens sorrindo e confraternizando no acampamento',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/495164051_1108582497975459_5461005247402044767_n-1.jpg',
        alt: 'Momento de partilha e oração comunitária',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/IMG_1100.jpg',
        alt: 'Adoração ao Santíssimo Sacramento durante a noite',
    },
    {
        src: 'https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484802785_1064254242408285_3551650081489993860_n.jpg',
        alt: 'Celebração e alegria no encerramento do retiro',
    },
]

export const GalleryGridSection: React.FC = () => {
    const [images, setImages] = useState<GalleryItem[]>(FALLBACK_IMAGES)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const { data, error } = await supabase
                    .from('gallery_images')
                    .select('id, url, label')
                    .order('created_at', { ascending: false })

                if (!error && data && data.length > 0) {
                    const mapped = data.map((item, idx) => ({
                        id: item.id,
                        src: item.url,
                        alt: item.label || `Foto ${idx + 1} do Festival Adonai`
                    }))
                    setImages(mapped)
                }
            } catch (e) {
                console.warn('Usando fotos padrão na grade:', e)
            }
        }

        fetchGallery()
    }, [])

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (selectedIndex === null) return
            if (e.key === 'Escape') setSelectedIndex(null)
            if (e.key === 'ArrowRight') setSelectedIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
            if (e.key === 'ArrowLeft') setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [selectedIndex, images.length])

    return (
        <section className="adonai-gallery" id="galeria" aria-label="Galeria de Fotos do Adonai">
            <span
                style={{
                    color: 'var(--sziget-pink)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                }}
            >
                MOMENTOS QUE GUARDAMOS NA MEMÓRIA
            </span>

            <h2
                style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                    fontWeight: 900,
                    margin: '10px auto 50px auto',
                    textTransform: 'uppercase',
                }}
            >
                REGISTROS DA NOSSA GALERA
            </h2>

            <div className="adonai-gallery-grid">
                {images.slice(0, 12).map((img, idx) => (
                    <div
                        key={img.id || idx}
                        onClick={() => setSelectedIndex(idx)}
                        className="cursor-pointer group relative overflow-hidden"
                    >
                        <img src={img.src} alt={img.alt} loading="lazy" className="transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="p-2 bg-white text-black rounded-full shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                                <Maximize2 size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Lightbox */}
            {selectedIndex !== null && images[selectedIndex] && (
                <div
                    onClick={() => setSelectedIndex(null)}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                        className="absolute top-6 right-6 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setSelectedIndex(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
                        aria-label="Próximo"
                    >
                        <ChevronRight size={28} />
                    </button>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-4xl max-h-[85vh] flex flex-col items-center p-2 bg-black border-2 border-white/20 shadow-2xl"
                    >
                        <img
                            src={images[selectedIndex].src}
                            alt={images[selectedIndex].alt}
                            className="max-h-[75vh] max-w-full object-contain"
                        />
                        {images[selectedIndex].alt && (
                            <p className="text-white text-sm mt-2 font-medium tracking-wide text-center px-4">
                                {images[selectedIndex].alt} ({selectedIndex + 1}/{images.length})
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

export default GalleryGridSection
