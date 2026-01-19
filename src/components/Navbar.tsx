import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="fixed w-full z-50 bg-holi-dark/40 backdrop-blur-2xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex-shrink-0 flex items-center group cursor-pointer">
                        <span className="font-marker text-lg md:text-xl lg:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-holi-primary via-holi-accent to-holi-secondary group-hover:animate-pulse">
                            RETIRO DE <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">CARNAVAL</span> 2026
                        </span>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
                        <div className="flex items-center space-x-1 mr-4">
                            <a href="/#sobre" className="px-3 py-2 text-gray-300 hover:text-holi-primary transition-colors font-semibold uppercase tracking-wider text-[11px] xl:text-[13px]">Sobre</a>
                            <a href="/#informacoes" className="px-3 py-2 text-gray-300 hover:text-holi-secondary transition-colors font-semibold uppercase tracking-wider text-[11px] xl:text-[13px]">Informações</a>
                            <Link to="/em-breve" className="px-3 py-2 text-gray-300 hover:text-holi-accent transition-colors font-semibold uppercase tracking-wider text-[11px] xl:text-[13px]">Cronograma</Link>
                            <a href="/#galeria" className="px-3 py-2 text-gray-300 hover:text-white transition-colors font-semibold uppercase tracking-wider text-[11px] xl:text-[13px]">Galeria</a>
                            <Link to="/doacoes" className="px-3 py-2 text-gray-300 hover:text-holi-primary transition-colors font-semibold uppercase tracking-wider text-[11px] xl:text-[13px]">Doações</Link>
                            <Link to="/noticias" className="px-3 py-2 text-gray-300 hover:text-holi-secondary transition-colors font-semibold uppercase tracking-wider text-[11px] xl:text-[13px]">Notícias</Link>
                        </div>
                        <Link to="/inscricao" className="bg-gradient-to-r from-holi-primary to-purple-600 hover:from-purple-600 hover:to-holi-primary text-white px-5 py-1.5 rounded-full font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(217,70,239,0.3)] uppercase tracking-wide text-[11px] xl:text-xs border border-white/20">
                            INSCREVA-SE
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-holi-primary focus:outline-none">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-holi-dark border-b border-white/10 p-4 space-y-4">
                    <a href="/#sobre" className="block text-gray-300" onClick={() => setIsMenuOpen(false)}>Sobre</a>
                    <Link to="/em-breve" className="block text-gray-300" onClick={() => setIsMenuOpen(false)}>Cronograma</Link>
                    <Link to="/doacoes" className="block text-gray-300" onClick={() => setIsMenuOpen(false)}>Doações</Link>
                    <Link to="/noticias" className="block text-gray-300" onClick={() => setIsMenuOpen(false)}>Notícias</Link>
                    <Link to="/inscricao" className="block text-center bg-holi-primary text-white py-3 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>INSCREVA-SE</Link>
                </div>
            )}
        </nav>
    )
}

export default Navbar
