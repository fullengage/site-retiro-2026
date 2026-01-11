import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface GalleryImage {
    id: string
    url: string
    label: string
    position_top: string
    position_left: string | null
    position_right: string | null
    rotate: number
    z_index: number
    aspect_ratio: string
    width_class: string
}

const GallerySection = () => {
    const [selectedImg, setSelectedImg] = useState<string | null>(null)
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        try {
            const { data: files, error } = await supabase
                .storage
                .from('site-assets')
                .list('gallery', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'name', order: 'asc' }
                })

            if (error) {
                console.error('Error fetching gallery:', error)
                setLoading(false)
                return
            }

            if (!files || files.length === 0) {
                console.log('No images found in gallery folder')
                setLoading(false)
                return
            }

            const imageFiles = files.filter(file => 
                file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            )

            const positions = [
                { top: '6%', left: '45%', right: null, rotate: 3, z: 30, aspect: 'aspect-square', width: 'w-48', label: 'Adoração 2023' },
                { top: '5%', left: '5%', right: null, rotate: -12, z: 10, aspect: 'aspect-square', width: 'w-48', label: 'Adoração 2025' },
                { top: '10%', left: '25%', right: null, rotate: 6, z: 20, aspect: 'aspect-[4/3]', width: 'w-56', label: 'Festa Neon 2025' },
                { top: '2%', left: null, right: '15%', rotate: 12, z: 10, aspect: 'aspect-square', width: 'w-40', label: 'Louvor' },
                { top: '12%', left: null, right: '2%', rotate: -6, z: 20, aspect: 'aspect-square', width: 'w-48', label: 'Comunhão' },
                { top: '30%', left: '10%', right: null, rotate: -3, z: 30, aspect: 'aspect-video', width: 'w-64', label: 'Adoração' },
                { top: '28%', left: '30%', right: null, rotate: 12, z: 10, aspect: 'aspect-square', width: 'w-44', label: 'Alegria' },
                { top: '25%', left: null, right: '30%', rotate: 6, z: 20, aspect: 'aspect-square', width: 'w-48', label: 'Fé' },
                { top: '35%', left: null, right: '5%', rotate: -9, z: 15, aspect: 'aspect-square', width: 'w-52', label: 'Esperança' },
                { top: '50%', left: '5%', right: null, rotate: 8, z: 25, aspect: 'aspect-[4/3]', width: 'w-56', label: 'Partilha' },
                { top: '48%', left: '35%', right: null, rotate: -5, z: 20, aspect: 'aspect-square', width: 'w-48', label: 'Oração' },
                { top: '55%', left: null, right: '15%', rotate: 7, z: 18, aspect: 'aspect-square', width: 'w-44', label: 'Celebração' },
                { top: '65%', left: '15%', right: null, rotate: -8, z: 22, aspect: 'aspect-video', width: 'w-60', label: 'Encontro' },
                { top: '70%', left: '45%', right: null, rotate: 4, z: 16, aspect: 'aspect-square', width: 'w-48', label: 'Amizade' },
                { top: '68%', left: null, right: '8%', rotate: -6, z: 19, aspect: 'aspect-square', width: 'w-52', label: 'Gratidão' },
            ]

            const galleryImages: GalleryImage[] = imageFiles.map((file, index) => {
                const { data: publicUrlData } = supabase
                    .storage
                    .from('site-assets')
                    .getPublicUrl(`gallery/${file.name}`)

                const pos = positions[index % positions.length]

                return {
                    id: file.name,
                    url: publicUrlData.publicUrl,
                    label: pos.label,
                    position_top: pos.top,
                    position_left: pos.left,
                    position_right: pos.right,
                    rotate: pos.rotate,
                    z_index: pos.z,
                    aspect_ratio: pos.aspect,
                    width_class: pos.width
                }
            })

            setImages(galleryImages)
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="py-32 bg-[#050208] relative overflow-hidden" id="galeria">
            <div className="absolute inset-0 bg-noise opacity-10"></div>
            <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-holi-primary rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
            <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-holi-secondary rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex justify-center mb-16 relative">
                    <div className="bg-white text-black px-12 py-6 shadow-[15px_15px_0px_#d946ef] transform -rotate-3 font-marker text-5xl md:text-8xl uppercase border-4 border-black relative z-20">
                        Galeria
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-holi-accent rounded-full border-4 border-black"></div>
                        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-holi-secondary rounded-full border-4 border-black"></div>
                    </div>
                </div>

                <div className="relative w-full h-[1200px] md:h-[1000px]">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="font-marker text-4xl opacity-20 animate-pulse">Carregando memórias...</div>
                        </div>
                    ) : (
                        <>
                            {images.map((img) => (
                                <motion.div
                                    key={img.id}
                                    drag
                                    dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                                    whileHover={{ scale: 1.1, zIndex: 100 }}
                                    style={{
                                        top: img.position_top || 'auto',
                                        left: img.position_left || 'auto',
                                        right: img.position_right || 'auto',
                                        zIndex: img.z_index,
                                        transform: `rotate(${img.rotate}deg)`
                                    }}
                                    className={`polaroid absolute ${img.width_class} bg-white transform cursor-pointer flex flex-col shadow-2xl`}
                                    onClick={() => setSelectedImg(img.url)}
                                >
                                    <div className={`${img.aspect_ratio} bg-gray-200 overflow-hidden`}>
                                        <img src={img.url} className="w-full h-full object-cover" alt={img.label || 'Gallery image'} />
                                    </div>
                                    {img.label && <div className="font-marker text-xl text-center mt-2 text-black">{img.label}</div>}
                                </motion.div>
                            ))}
                        </>
                    )}

                    {!loading && images.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 opacity-30">
                            <div className="font-marker text-4xl">Galeria Vazia</div>
                            <p className="text-sm uppercase tracking-widest font-bold">Faça o upload de fotos no painel admin</p>
                        </div>
                    )}

                    <div className="absolute top-[40%] right-[10%] text-[8rem] text-white opacity-5 font-marker transform -rotate-90 select-none z-0">MEMÓRIAS</div>
                    <div className="absolute bottom-[10%] left-[5%] text-6xl text-holi-primary opacity-20 font-marker transform rotate-45 select-none z-0">FÉ</div>
                    <div className="absolute top-[15%] left-[5%] w-72 h-64 bg-yellow-100 shadow-2xl p-6 flex items-center justify-center text-center -rotate-3 z-50 paper-tear transform hover:scale-110 transition-transform">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-red-500/20"></div>
                        <p className="font-marker text-3xl text-red-600 leading-tight">Deus tem algo <br />novo para você!</p>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImg(null)}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 cursor-zoom-out backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative max-w-5xl w-full flex items-center justify-center"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
                                className="absolute -top-12 right-0 text-white hover:text-holi-primary transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/20 shadow-xl"
                            >
                                <X size={32} />
                            </button>
                            <img
                                src={selectedImg}
                                alt="Imagem ampliada"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(217,70,239,0.3)] border-4 border-white/10"
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default GallerySection
