import { motion } from 'framer-motion'
import { Heart, Info, MapPin, Calendar, Newspaper, Image as ImageIcon, MessageCircle } from 'lucide-react'

import { useNavigate } from 'react-router-dom'

const MobileNavigationGuide = () => {
    const navigate = useNavigate()
    const navItems = [
        { label: "SOBRE", icon: <Info size={20} className="text-yellow-400" />, href: "#sobre" },
        { label: "O QUE TE ESPERA", icon: <Heart size={20} className="text-cyan-400" />, href: "#features" },
        { label: "INFORMAÇÕES", icon: <MapPin size={20} className="text-purple-400" />, href: "#informacoes" },
        { label: "CALENDÁRIO", icon: <Calendar size={20} className="text-pink-400" />, href: "#calendario" },
        { label: "NOTÍCIAS", icon: <Newspaper size={20} className="text-orange-400" />, href: "/noticias", isExternal: true },
        { label: "GALERIA", icon: <ImageIcon size={20} className="text-green-400" />, href: "#galeria" },
        { label: "ENTRE EM CONTATO", icon: <MessageCircle size={20} className="text-blue-400" />, href: "#contato" },
    ]

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, item: any) => {
        if (item.href.startsWith('/')) {
            // Internal route navigation
            e.preventDefault()
            navigate(item.href)
            return
        }

        if (item.href.startsWith('#')) {
            // Anchor scroll navigation
            e.preventDefault()
            const element = document.querySelector(item.href)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    return (
        <section className="block md:hidden py-8 px-4 bg-holi-dark">
            <div className="space-y-3">
                {navItems.map((item, idx) => (
                    <motion.a
                        key={idx}
                        href={item.href}
                        onClick={(e) => scrollToSection(e, item)}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                        <span className="text-sm font-bold tracking-wider text-gray-200 uppercase">
                            {item.label}
                        </span>
                    </motion.a>
                ))}
            </div>
        </section>
    )
}

export default MobileNavigationGuide
