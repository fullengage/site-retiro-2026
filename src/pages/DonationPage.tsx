import { motion } from 'framer-motion'
import { Heart, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const DonationPage = () => {
    const [copied, setCopied] = useState(false)
    const pixKey = "financeiro@comunidadevozdedeus.com.br" // Exemplo

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="pt-32 pb-20 min-h-screen relative">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-holi-surface/80 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl text-center"
                >
                    <div className="w-20 h-20 bg-holi-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 text-holi-primary shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                        <Heart size={40} fill="currentColor" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">Ajude este Retiro!</h1>
                    <p className="text-gray-300 text-lg mb-12 max-w-2xl mx-auto font-medium">
                        Sua doação ajuda a levar mais jovens para uma experiência transformadora.
                        Cada contribuição faz a diferença na vida de alguém!
                    </p>

                    <div className="bg-black/40 p-8 rounded-3xl border border-white/5 mb-8">
                        <p className="text-holi-accent font-marker text-2xl mb-4">Doe via PIX</p>
                        <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                            {/* QR Code Placeholder */}
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=example-pix-key" alt="PIX QR Code" className="w-full h-full" />
                        </div>

                        <div className="relative flex items-center justify-center gap-3 bg-holi-dark p-4 rounded-2xl border border-white/10 select-all">
                            <span className="text-gray-300 font-mono text-sm break-all">{pixKey}</span>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-holi-primary"
                            >
                                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-white mb-2 uppercase text-sm tracking-widest text-holi-secondary">Dados Bancários</h3>
                            <p className="text-gray-400 text-sm">
                                Banco: NuBank<br />
                                Agência: 0001<br />
                                Conta: 1234567-8
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-white mb-2 uppercase text-sm tracking-widest text-holi-accent">Favorecido</h3>
                            <p className="text-gray-400 text-sm">
                                Comunidade Católica Voz de Deus<br />
                                CNPJ: 00.000.000/0001-00
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default DonationPage
