import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const faqs = [
        { q: "Qual o valor da inscrição?", a: "O valor para 2026 será definido em breve. Fique atento às nossas redes sociais!" },
        { q: "O que está incluso no retiro?", a: "Alimentação completa, alojamento/camping, participação em todas as atividades e kit do congressista." },
        { q: "Precisa ser da comunidade para participar?", a: "Não! O retiro é aberto a todos os jovens que buscam uma experiência com Deus." },
        { q: "Onde será realizado?", a: "No Recinto de Rodeio de Novo Horizonte/SP." }
    ]

    return (
        <section className="py-24 bg-holi-dark/50" id="faq">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-16 uppercase tracking-widest">
                    Dúvidas <span className="text-holi-accent">Frequentes</span>
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-white/10 rounded-2xl overflow-hidden bg-holi-surface/50 backdrop-blur-sm">
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="font-bold text-gray-200">{faq.q}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                >
                                    <ChevronDown className="text-gray-400" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 text-gray-400 border-t border-white/5 mt-2">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FAQSection
