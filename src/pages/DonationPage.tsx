import { motion } from 'framer-motion'
import { Heart, Copy, Check, QrCode, Utensils, Truck, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const DonationPage = () => {
    const [copied, setCopied] = useState(false)
    const pixKey = "255.985.138-54"

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-holi-dark text-gray-100 font-display selection:bg-holi-primary selection:text-white transition-colors duration-300 overflow-x-hidden min-h-screen">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 ink-splash-1 transform -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
                <div className="absolute top-1/2 right-0 w-[500px] h-[500px] ink-splash-2 transform translate-x-1/3 opacity-10"></div>
                <div className="absolute bottom-0 left-20 w-80 h-80 ink-splash-1 transform rotate-45 opacity-5"></div>
                <div className="absolute top-[20%] left-[30%] w-64 h-64 bg-holi-primary rounded-full mix-blend-overlay filter blur-[90px] opacity-20 animate-blob"></div>
                <div className="absolute bottom-[40%] right-[20%] w-72 h-72 bg-holi-secondary rounded-full mix-blend-overlay filter blur-[80px] opacity-15 animate-blob"></div>
            </div>

            {/* Navbar Placeholder space since Navbar is absolute/fixed */}
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
                        <span className="relative px-4 py-1.5 bg-holi-surface rounded-lg border border-white/10 text-xs font-bold uppercase tracking-[0.2em] text-gray-300">
                            <Heart size={14} className="inline-block text-holi-primary mr-2" /> Ajude a Obra
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
                        O Retiro de Carnaval não é apenas um evento, é um <span className="text-white italic">resgate de almas</span>. Sua generosidade viabiliza a estrutura, a alimentação e o acolhimento de centenas de jovens que terão um encontro pessoal com Deus. Nada aqui tem fins lucrativos; tudo é providência e partilha.
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
                <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-holi-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-holi-secondary/10 rounded-full blur-[100px] animate-pulse-slow"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                        {/* Financial Donation Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col h-full"
                        >
                            <div className="bg-holi-surface border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl h-full flex flex-col hover:border-holi-primary/30 transition-colors duration-500">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-holi-primary/20 to-transparent rounded-bl-[100%]"></div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-holi-primary/20 flex items-center justify-center text-holi-primary shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                                        <Heart size={30} />
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight text-white">Doação em <span className="text-holi-primary">Dinheiro</span></h2>
                                </div>

                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    Cada contribuição ajuda a cobrir custos essenciais como aluguel do espaço, alimentação diária, som, iluminação e transporte dos pregadores. Seja um benfeitor dessa obra!
                                </p>

                                <div className="bg-[#0f0816] rounded-2xl p-6 border border-white/5 mb-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-holi-primary/5 via-holi-secondary/5 to-holi-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                    <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                        <div className="bg-white p-2 rounded-xl">
                                            <div className="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                <QrCode size={64} className="text-gray-700" />
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <span className="text-xs font-bold text-holi-secondary tracking-widest uppercase mb-1 block">Chave PIX (CNPJ)</span>
                                            <div className="font-mono text-lg md:text-xl text-white break-all mb-3 select-all bg-white/5 p-2 rounded border border-white/10 flex items-center justify-between gap-2 overflow-hidden">
                                                <span className="truncate">{pixKey}</span>
                                                <button onClick={copyToClipboard} className="text-holi-primary hover:text-white transition-colors flex-shrink-0">
                                                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                                </button>
                                            </div>
                                            <span className="text-xs text-gray-500 block mb-1">Conta: Richard Wagner</span>
                                            <span className="text-xs text-gray-500 block">Banco: Nubank</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto bg-paper text-gray-900 p-6 shadow-lg transform rotate-1 relative paper-tear">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 tape opacity-50"></div>
                                    <h3 className="font-marker text-xl mb-4 text-gray-800">Transferência Bancária</h3>
                                    <ul className="space-y-2 font-mono text-sm">
                                        <li className="flex justify-between border-b border-gray-300 pb-1">
                                            <span className="font-bold">Banco:</span> <span>Bradesco (237)</span>
                                        </li>
                                        <li className="flex justify-between border-b border-gray-300 pb-1">
                                            <span className="font-bold">Agência:</span> <span>1234-5</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="font-bold">Conta Corrente:</span> <span>99888-0</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button className="flex-1 py-4 rounded-xl bg-holi-primary text-white font-bold uppercase tracking-wide hover:bg-fuchsia-600 transition-all shadow-[0_5px_15px_rgba(217,70,239,0.3)] hover:-translate-y-1">
                                        Contribuir
                                    </button>
                                    <button className="flex-1 py-4 rounded-xl border border-white/20 text-white font-bold uppercase tracking-wide hover:bg-white/5 transition-all">
                                        Apoiar o Retiro
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Food Donation Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col h-full mt-12 lg:mt-0"
                        >
                            <div className="relative h-full">
                                {/* Polaroid decoration */}
                                <div className="absolute -top-16 -right-4 md:-right-10 z-20 hidden md:block w-48 animate-blob">
                                    <div className="polaroid transform rotate-6 scale-90">
                                        <img src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400" alt="Alimentos" className="w-full h-32 object-cover filter grayscale contrast-125 mb-2" />
                                        <div className="font-marker text-center text-gray-800 text-sm">Providência!</div>
                                    </div>
                                </div>

                                <div className="bg-holi-surface border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl h-full flex flex-col hover:border-holi-secondary/30 transition-colors duration-500">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-holi-secondary/20 to-transparent rounded-br-[100%]"></div>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-holi-secondary/20 flex items-center justify-center text-holi-secondary shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                            <Utensils size={30} />
                                        </div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight text-white">Doação de <span className="text-holi-secondary">Alimentos</span></h2>
                                    </div>

                                    <p className="text-gray-400 mb-8 leading-relaxed">
                                        A cozinha é o coração do retiro! Recebemos doações de alimentos não perecíveis para preparar as refeições de todos os campistas e servos.
                                    </p>

                                    <div className="bg-[#fffdf5] text-gray-800 p-8 rounded-lg shadow-lg relative transform -rotate-1 mb-8 bg-paper-texture">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-900 shadow-md z-20 border-2 border-white"></div>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#111] z-10"></div>

                                        <h3 className="font-marker text-2xl text-center text-red-700 mb-6 border-b-2 border-red-200 pb-2">Lista de Necessidades</h3>
                                        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 font-news text-lg leading-none">
                                            {[
                                                "Arroz", "Feijão", "Macarrão", "Óleo",
                                                "Café", "Açúcar", "Molho Tomate", "Bolachas"
                                            ].map((item) => (
                                                <li key={item} className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-red-600 flex-shrink-0"></div> {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-6 text-center">
                                            <span className="font-marker text-gray-500 rotate-2 inline-block text-sm">Obrigado! :)</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto bg-holi-dark/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                                        <h4 className="text-holi-accent font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                                            <Truck size={16} /> Como Entregar
                                        </h4>
                                        <p className="text-sm text-gray-300 mb-4">
                                            Os alimentos podem ser entregues na secretaria da paróquia ou diretamente no local do evento durante a semana anterior ao retiro.
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <a className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-center font-bold text-sm transition-colors flex items-center justify-center gap-2" href="https://wa.me/">
                                                <span className="fab fa-whatsapp"></span> Falar com Julia
                                            </a>
                                            <a className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-center font-bold text-sm transition-colors flex items-center justify-center gap-2" href="https://wa.me/">
                                                <span className="fab fa-whatsapp"></span> Falar com Wagner
                                            </a>
                                        </div>
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
                    <span className="text-[20vw] font-marker text-white rotate-12 select-none">GRATIDÃO</span>
                </div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <span className="text-4xl text-holi-primary mb-6 block">"</span>
                    <h3 className="text-2xl md:text-4xl font-news font-bold text-white mb-6 leading-tight italic">
                        "Deus ama a quem dá com alegria."
                    </h3>
                    <p className="text-holi-secondary font-marker text-xl md:text-2xl rotate-2">- 2 Coríntios 9:7</p>
                </div>
            </section>

            {/* CTA to Instagram (Footer style) */}
            <section className="py-20 bg-[#050208] border-t-4 border-holi-primary relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-holi-primary rounded-full blur-[100px]"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-holi-secondary rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-8">Fale conosco</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 justify-center md:justify-start">
                                    <div className="w-12 h-12 rounded-full bg-holi-surface flex items-center justify-center text-holi-primary border border-white/10">
                                        <Heart size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white uppercase">Wagner</p>
                                        <p className="text-gray-400 text-sm">(11) 95550-1090</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 justify-center md:justify-start">
                                    <div className="w-12 h-12 rounded-full bg-holi-surface flex items-center justify-center text-holi-secondary border border-white/10">
                                        <Heart size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white uppercase">Julia</p>
                                        <p className="text-gray-400 text-sm">(11) 94343-6970</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-md bg-gradient-to-br from-[#111] to-[#222] p-1 rounded-3xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                            <div className="bg-black rounded-[1.3rem] p-8 h-full border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-600 to-pink-600 opacity-20 blur-2xl rounded-full"></div>
                                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white">
                                    <span className="fab fa-instagram text-3xl"></span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">Nosso Instagram</h3>
                                <p className="text-sm text-gray-400 mb-8">Fique por dentro de todos os bastidores e novidades do retiro.</p>
                                <a className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 uppercase tracking-wide flex items-center justify-center gap-2" href="#">
                                    <span>Seguir Agora</span>
                                    <ArrowRight size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default DonationPage
