import { motion } from 'framer-motion'
import { Heart, Copy, Check, QrCode, Utensils, Truck, ArrowRight, Instagram, Phone, Mail, MapPin } from 'lucide-react'
import { useState } from 'react'

const DonationPage = () => {
    const [copied, setCopied] = useState(false)
    const pixKey = "25598513854"

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-holi-dark text-gray-100 font-display selection:bg-holi-primary selection:text-white transition-colors duration-300 overflow-x-hidden min-h-screen">
            {/* Background Effects */}
            {/* Background Effects removed per user request */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-5">
                {/* Keeping logic for structure but removing visible colored elements */}
            </div>

            {/* Navbar Space */}
            <div className="h-20"></div>

            {/* Hero Section */}
            <section className="pt-20 pb-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-holi-primary via-holi-secondary to-holi-accent"></div>
                <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block mb-6 relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-holi-primary to-holi-secondary rounded-lg blur opacity-30 animate-pulse"></div>
                        <span className="relative px-4 py-1.5 bg-holi-surface rounded-lg border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-gray-300 flex items-center">
                            <Heart size={14} className="text-holi-primary mr-2" /> Ajude a Obra
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter neon-glow leading-none"
                    >
                        Faça parte dessa <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-holi-accent to-holi-orange">missão</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed font-news"
                    >
                        Cada contribuição ajuda a cobrir custos essenciais como alimentação diária, som, iluminação e transporte dos pregadores. Seja um benfeitor dessa obra!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, repeat: Infinity, duration: 2 }}
                        className="mt-12 flex justify-center"
                    >
                        <div className="w-1 h-8 bg-gradient-to-b from-white/20 to-transparent rounded-full animate-bounce"></div>
                    </motion.div>
                </div>
            </section>

            {/* Contribution Section */}
            <section className="py-12 md:py-20 relative bg-[#08040c]" id="contribuir">
                <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
                {/* Background blobs removed per user request */}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                        {/* Financial Donation Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col"
                        >
                            <div className="bg-holi-surface border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl h-full flex flex-col hover:border-holi-primary/30 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-holi-primary/20 to-transparent rounded-bl-[100%]"></div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-holi-primary/20 flex items-center justify-center text-holi-primary shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                                        <QrCode size={30} />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight text-white">Doação em <span className="text-holi-primary">Dinheiro</span></h2>
                                </div>

                                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                                    Cada contribuição ajuda a cobrir custos essenciais como alimentação diária, som, iluminação e transporte dos pregadores. Seja um benfeitor dessa obra!
                                </p>

                                <div className="bg-[#0f0816] rounded-2xl p-6 md:p-8 border-2 border-holi-primary/40 mb-2 relative group flex-1 flex flex-col items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-r from-holi-primary/10 via-holi-secondary/5 to-holi-primary/10 opacity-30 group-hover:opacity-50 transition-opacity duration-500 rounded-2xl"></div>
                                    <div className="flex flex-col items-center gap-6 relative z-10 w-full">
                                        <div className="bg-white p-5 rounded-2xl shadow-[0_0_40px_rgba(217,70,239,0.3)] transform group-hover:scale-105 transition-transform duration-300">
                                            <div className="w-56 h-56 bg-white rounded-lg flex items-center justify-center relative overflow-hidden">
                                                <img
                                                    alt="QR Code PIX"
                                                    className="w-full h-full object-contain"
                                                    src="/pix_qrcode.png"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full text-center">
                                            <span className="text-sm font-bold text-holi-secondary tracking-widest uppercase mb-3 block">Chave PIX (CPF)</span>
                                            <div className="font-mono text-2xl md:text-3xl text-white break-all mb-6 select-all bg-white/10 py-4 px-6 rounded-xl border border-holi-primary/30 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
                                                <span className="flex-1 text-center">{pixKey}</span>
                                                <button onClick={copyToClipboard} className="text-holi-primary hover:text-white transition-colors flex-shrink-0">
                                                    {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                                                </button>
                                            </div>
                                            <div className="space-y-2 text-gray-200">
                                                <span className="text-base block font-bold text-center">Favorecido: <span className="text-white underline decoration-holi-primary/50 underline-offset-4">Richard Wagner de Oliveira Portela</span></span>
                                                <span className="text-xs text-gray-400 block italic uppercase tracking-wider text-center">Fundador da Comunidade Voz de Deus</span>
                                                <div className="text-sm text-gray-400 block pt-3 text-center">Banco: <span className="text-white font-bold">NuBank</span></div>
                                                <div className="pt-6">
                                                    <a className="inline-block w-full bg-gradient-to-r from-holi-primary to-purple-600 hover:from-purple-600 hover:to-holi-primary text-white px-8 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-[0_4px_15px_rgba(217,70,239,0.3)] uppercase tracking-widest text-sm text-center" href="https://nubank.com.br/cobrar/1jjzq7/69678b38-573f-414d-bf38-ee12068f29e9" target="_blank" rel="noopener noreferrer">
                                                        Contribuir
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Food Donation Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col"
                        >
                            <div className="bg-holi-surface border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl h-full flex flex-col hover:border-holi-secondary/30 transition-colors duration-500">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-holi-secondary/20 to-transparent rounded-br-[100%]"></div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-holi-secondary/20 flex items-center justify-center text-holi-secondary shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                        <Utensils size={30} />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight text-white">Doação de <span className="text-holi-secondary">Alimentos</span></h2>
                                </div>

                                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                                    A cozinha é o coração do retiro! Recebemos doações de alimentos para preparar as refeições de todos os campistas e servos. Sua ajuda garante o sustento de todos durante o encontro.
                                </p>

                                <div className="bg-[#fffdf5] text-gray-800 p-6 md:p-10 rounded-lg shadow-lg relative transform -rotate-1 mb-10 flex-1 bg-paper-texture">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-900 shadow-md z-20 border-2 border-white"></div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#111] z-10"></div>

                                    <h3 className="font-marker text-2xl text-center text-red-700 mb-8 border-b-2 border-red-200 pb-2">Lista de Necessidades</h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 font-news text-xl leading-tight">
                                        {[
                                            "Pães", "Café", "Peito de Frango", "Linguiça", "Batata", "Cenoura"
                                        ].map((item) => (
                                            <li key={item} className="flex items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-red-600 flex-shrink-0"></div> {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 text-center">
                                        <span className="font-marker text-gray-500 rotate-2 inline-block text-lg">Obrigado! :)</span>
                                    </div>
                                </div>

                                <div className="bg-holi-dark/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                                    <h4 className="text-holi-accent font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                                        <Truck size={16} /> Como Entregar
                                    </h4>
                                    <p className="text-sm text-gray-300 mb-4 font-medium">
                                        Os alimentos podem ser entregues no endereço: Rua Carvalho Leme, número 1051 – Novo Horizonte, São Paulo.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <a className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-center font-bold text-sm transition-colors flex items-center justify-center gap-2" href="https://wa.me/5511943436970">
                                            <Phone size={18} /> Falar com Julia
                                        </a>
                                        <a className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-center font-bold text-sm transition-colors flex items-center justify-center gap-2" href="https://wa.me/5511955501090">
                                            <Phone size={18} /> Falar com Wagner
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Gratitude Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <span className="text-[20vw] font-marker text-white rotate-12 select-none uppercase">GRATIDÃO</span>
                </div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <Heart size={48} className="text-holi-primary mb-6 mx-auto opacity-50" />
                    <h3 className="text-2xl md:text-4xl font-news font-bold text-white mb-6 leading-tight italic">
                        "Deus ama a quem dá com alegria."
                    </h3>
                    <p className="text-holi-secondary font-marker text-xl md:text-2xl rotate-2">- 2 Coríntios 9:7</p>
                </div>
            </section>

            {/* Footer / Contact Section */}
            <footer className="relative bg-[#050208] text-white pt-24 pb-12 overflow-hidden border-t-4 border-holi-primary">
                <div className="absolute inset-0 z-0">
                    {/* Background footer blobs removed per user request */}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-tight">Fale conosco</h2>

                            <div className="space-y-4 text-gray-400">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-holi-surface flex items-center justify-center text-holi-primary group-hover:bg-holi-primary group-hover:text-white transition-colors border border-white/5">
                                        <Heart size={18} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-white block uppercase">WAGNER</span>
                                        <span className="text-sm">(11) 95550-1090</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-holi-surface flex items-center justify-center text-holi-secondary group-hover:bg-holi-secondary group-hover:text-black transition-colors border border-white/5">
                                        <Heart size={18} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-white block uppercase">JULIA</span>
                                        <span className="text-sm">(11) 94343-6970</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-6">
                                <span className="font-bold text-holi-accent uppercase tracking-wider text-sm">SIGA-NOS</span>
                                <div className="flex gap-4">
                                    <a href="https://www.instagram.com/juventude._adonai/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center hover:bg-holi-secondary hover:border-holi-secondary hover:scale-110 transition-all text-gray-400 hover:text-black shadow-lg">
                                        <Instagram size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full md:w-auto max-w-md bg-gradient-to-br from-[#111] to-[#222] p-1 rounded-3xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                            <div className="bg-black rounded-[1.3rem] p-8 h-full border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-600 to-pink-600 opacity-20 blur-2xl rounded-full"></div>
                                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                                    <Instagram size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">Conheça nosso Instagram</h3>
                                <p className="text-sm text-gray-400 mb-8">Fique por dentro de todos os bastidores, novidades e a cobertura completa do retiro.</p>
                                <a className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 uppercase tracking-wide flex items-center justify-center gap-2" href="https://www.instagram.com/juventude._adonai/" target="_blank" rel="noopener noreferrer">
                                    <span>Seguir Agora</span>
                                    <ArrowRight size={16} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-20 pt-8 text-center text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© 2026 Retiro de Carnaval. Todos os direitos reservados.</p>
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                            <a className="hover:text-white transition-colors" href="#">Privacidade</a>
                            <a className="hover:text-white transition-colors" href="#">Termos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default DonationPage
