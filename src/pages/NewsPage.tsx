import Newspaper from '../components/Newspaper'
import { motion } from 'framer-motion'
import { Newspaper as NewsIcon } from 'lucide-react'

const NewsPage = () => {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-holi-dark">
            <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 bg-holi-primary/10 border border-holi-primary/20 px-6 py-3 rounded-full mb-8"
                >
                    <NewsIcon className="text-holi-primary" size={24} />
                    <span className="font-marker text-holi-primary text-xl uppercase tracking-widest">Jornal do Retiro</span>
                </motion.div>
                <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6">
                    Fique por dentro <br /> de todas as <span className="text-transparent bg-clip-text bg-gradient-to-r from-holi-accent via-holi-primary to-holi-secondary neon-glow">Novidades</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                    Acompanhe as últimas notícias, bastidores e informações oficiais do maior retiro de carnaval de 2026.
                </p>
            </div>

            <Newspaper />
        </div>
    )
}

export default NewsPage
