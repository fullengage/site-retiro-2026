import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, Trash2, Plus, Image as ImageIcon,
    Save, Loader2, X, Move, RotateCw, Layers
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface GalleryImage {
    id: string
    url: string
    label: string | null
    position_top: string | null
    position_left: string | null
    position_right: string | null
    rotate: number
    z_index: number
    aspect_ratio: string
    is_polaroid: boolean
    width_class: string
}

const GalleryAdmin = () => {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        setLoading(true)

        // Debug: Listar buckets disponíveis
        const { data: buckets, error: bError } = await supabase.storage.listBuckets()
        console.log('Buckets acessíveis pelo frontend:', buckets)
        if (bError) console.error('Erro ao listar buckets:', bError)

        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching gallery:', error)
        else setImages(data || [])
        setLoading(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `gallery/${fileName}`

            console.log('Iniciando upload para o bucket: site-assets')
            const { data, error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Erro detalhado do Supabase Storage:', uploadError)
                throw uploadError
            }
            console.log('Upload concluído com sucesso:', data)

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            console.log('URL Pública gerada:', publicUrl)

            const { error: insertError } = await supabase
                .from('gallery_images')
                .insert([{
                    url: publicUrl,
                    position_top: '10%',
                    position_left: '10%',
                    rotate: 0,
                    z_index: 10,
                    aspect_ratio: 'aspect-square',
                    width_class: 'w-48'
                }])

            if (insertError) throw insertError
            fetchImages()
        } catch (err: any) {
            console.error('Erro completo capturado:', err)
            alert('Erro no upload: ' + (err.message || JSON.stringify(err)))
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('Excluir esta foto?')) return

        try {
            // Extract path from URL if it's a Supabase URL
            const urlPath = url.split('/public/site-assets/')[1]
            if (urlPath) {
                await supabase.storage.from('site-assets').remove([urlPath])
            }

            const { error } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', id)

            if (error) throw error
            setImages(images.filter(img => img.id !== id))
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingImage) return

        const { error } = await supabase
            .from('gallery_images')
            .update({
                label: editingImage.label,
                position_top: editingImage.position_top,
                position_left: editingImage.position_left,
                position_right: editingImage.position_right,
                rotate: editingImage.rotate,
                z_index: editingImage.z_index,
                aspect_ratio: editingImage.aspect_ratio,
                width_class: editingImage.width_class,
                is_polaroid: editingImage.is_polaroid
            })
            .eq('id', editingImage.id)

        if (error) {
            alert('Erro ao atualizar: ' + error.message)
        } else {
            setImages(images.map(img => img.id === editingImage.id ? editingImage : img))
            setEditingImage(null)
        }
    }

    return (
        <div className="min-h-screen bg-[#050208] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Gestão da <span className="text-holi-primary">Galeria</span></h1>
                        <p className="text-gray-500 font-mono text-xs mt-1">POSICIONAMENTO TIPO POLAROID NO SITE</p>
                    </div>
                    <div className="flex gap-4">
                        <label className="bg-white text-black px-6 py-4 rounded-full font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-all shadow-lg">
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Upload Nova Foto
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                        <button onClick={() => window.location.href = '/admin'} className="bg-holi-surface border border-white/10 px-6 py-4 rounded-full font-bold transition-all text-xs uppercase tracking-widest text-gray-400 hover:text-white">
                            Sair
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center font-marker text-4xl opacity-20">Carregando Galeria...</div>
                    ) : images.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                            Nenhuma foto na galeria. Faça um upload para começar!
                        </div>
                    ) : (
                        images.map(img => (
                            <div key={img.id} className="bg-holi-surface border border-white/10 rounded-2xl overflow-hidden group">
                                <div className="aspect-video relative overflow-hidden bg-black/50">
                                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button onClick={() => setEditingImage(img)} className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform">
                                            <ImageIcon size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(img.id, img.url)} className="bg-red-500 text-white p-3 rounded-full hover:scale-110 transition-transform">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-white/5 space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-widest text-holi-secondary truncate">{img.label || 'Sem Legenda'}</div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                                        <span>Z-INDEX: {img.z_index}</span>
                                        <span>ROT: {img.rotate}°</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Editing Modal */}
            <AnimatePresence>
                {editingImage && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-holi-surface border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden grid grid-cols-1 md:grid-cols-2"
                        >
                            <div className="bg-black/50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                                <div className="relative">
                                    <div
                                        style={{
                                            transform: `rotate(${editingImage.rotate}deg)`,
                                            zIndex: 10
                                        }}
                                        className={`${editingImage.width_class} bg-white p-2 shadow-2xl relative transition-transform`}
                                    >
                                        <div className={`${editingImage.aspect_ratio} bg-gray-900 overflow-hidden`}>
                                            <img src={editingImage.url} className="w-full h-full object-cover" />
                                        </div>
                                        {editingImage.label && <div className="font-marker text-center text-black mt-2 text-sm">{editingImage.label}</div>}
                                    </div>
                                    <div className="absolute -top-10 left-0 text-[10px] font-mono text-gray-500 uppercase">PRÉVIA POLAROID</div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 md:p-10 space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Personalizar Foto</h3>
                                    <button type="button" onClick={() => setEditingImage(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                                </div>

                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">Legenda (Opcional)</span>
                                        <input
                                            type="text"
                                            value={editingImage.label || ''}
                                            onChange={e => setEditingImage({ ...editingImage, label: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none text-sm"
                                            placeholder="Ex: Alegria!"
                                        />
                                    </label>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block flex items-center gap-1"><RotateCw size={10} /> Rotação</span>
                                            <input
                                                type="number"
                                                value={editingImage.rotate}
                                                onChange={e => setEditingImage({ ...editingImage, rotate: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none text-sm"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block flex items-center gap-1"><Layers size={10} /> Profundidade (Z)</span>
                                            <input
                                                type="number"
                                                value={editingImage.z_index}
                                                onChange={e => setEditingImage({ ...editingImage, z_index: parseInt(e.target.value) })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none text-sm"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block flex items-center gap-1"><Move size={10} /> Top (%)</span>
                                            <input
                                                type="text"
                                                value={editingImage.position_top || ''}
                                                onChange={e => setEditingImage({ ...editingImage, position_top: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none text-sm"
                                                placeholder="Ex: 15%"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block flex items-center gap-1"><Move size={10} /> Left (%)</span>
                                            <input
                                                type="text"
                                                value={editingImage.position_left || ''}
                                                onChange={e => setEditingImage({ ...editingImage, position_left: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-holi-primary outline-none text-sm"
                                                placeholder="Ex: 20%"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">Formato (Aspect)</span>
                                            <select
                                                value={editingImage.aspect_ratio}
                                                onChange={e => setEditingImage({ ...editingImage, aspect_ratio: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-sm"
                                            >
                                                <option value="aspect-square">Quadrado</option>
                                                <option value="aspect-video">Widescreen</option>
                                                <option value="aspect-[4/3]">4:3 (Retratão)</option>
                                                <option value="aspect-[3/4]">3:4 (Vertical)</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 mb-2 block">Tamanho (Width)</span>
                                            <select
                                                value={editingImage.width_class}
                                                onChange={e => setEditingImage({ ...editingImage, width_class: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none text-sm"
                                            >
                                                <option value="w-32">Pequeno (w-32)</option>
                                                <option value="w-40">médio (w-40)</option>
                                                <option value="w-48">Padrão (w-48)</option>
                                                <option value="w-56">Grande (w-56)</option>
                                                <option value="w-64">Extra Grande (w-64)</option>
                                                <option value="w-72">Giant (w-72)</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-holi-primary text-white font-black py-4 rounded-xl hover:bg-holi-primary/80 transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest shadow-lg shadow-holi-primary/20"
                                >
                                    <Save size={18} /> Salvar Configurações
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GalleryAdmin
