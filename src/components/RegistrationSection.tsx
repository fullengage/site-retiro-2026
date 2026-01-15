import { Instagram, ArrowRight, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const RegistrationSection = () => {
    return (
        <footer className="relative bg-[#050208] text-white pt-24 pb-12 overflow-hidden border-t-4 border-holi-primary">
            <div className="absolute inset-0 z-0">
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-holi-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-holi-secondary/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase tracking-tight">
                            Fale conosco
                        </h2>

                        <div className="space-y-4 text-gray-400">
                            <div className="flex items-center gap-4 group">
                                <span className="w-10 h-10 rounded-full bg-holi-surface flex items-center justify-center text-holi-primary group-hover:bg-holi-primary group-hover:text-white transition-colors">
                                    <User size={20} />
                                </span>
                                <div>
                                    <span className="font-bold text-white block uppercase">Wagner</span>
                                    <span className="text-sm">(11) 95550-1090</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <span className="w-10 h-10 rounded-full bg-holi-surface flex items-center justify-center text-holi-secondary group-hover:bg-holi-secondary group-hover:text-black transition-colors">
                                    <User size={20} />
                                </span>
                                <div>
                                    <span className="font-bold text-white block uppercase">Julia</span>
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

                    <div className="flex-1 w-full md:w-auto max-w-sm bg-gradient-to-br from-[#111] to-[#222] p-1 rounded-3xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                        <div className="bg-black rounded-[1.3rem] p-8 h-full border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-holi-primary to-holi-secondary opacity-20 blur-2xl rounded-full"></div>
                            <div className="w-16 h-16 bg-gradient-to-tr from-holi-primary to-holi-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-holi-primary/20">
                                <User size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-tighter">Garanta sua Vaga</h3>
                            <p className="text-sm text-gray-400 mb-8 font-medium">Não fique de fora do maior retiro de carnaval. Inscrições abertas!</p>
                            <Link to="/inscricao" className="w-full bg-holi-primary text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(217,70,239,0.3)] hover:shadow-[0_6px_20px_rgba(217,70,239,0.5)] hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span>Inscrever Agora</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full md:w-auto max-w-sm bg-gradient-to-br from-[#111] to-[#222] p-1 rounded-3xl shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                        <div className="bg-black rounded-[1.3rem] p-8 h-full border border-white/10 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-600 to-pink-600 opacity-20 blur-2xl rounded-full"></div>
                            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <Instagram size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-tighter">Instagram</h3>
                            <p className="text-sm text-gray-400 mb-8 font-medium">Acompanhe todos os bastidores e novidades em tempo real.</p>
                            <a href="https://www.instagram.com/juventude._adonai/" target="_blank" rel="noopener noreferrer" className="w-full bg-white text-black font-black py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span>Seguir Agora</span>
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-20 pt-8 text-center text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2026 Retiro de Carnaval. Todos os direitos reservados.</p>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-white transition-colors">Termos</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default RegistrationSection
