import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Brush } from 'lucide-react'

const InfoSection = () => {
    const infos = [
        {
            title: "Datas",
            content: "Dos dias 14 a 17 de Fevereiro",
            icon: <Calendar className="text-6xl text-white drop-shadow-lg" />,
            color: "holi-primary",
            img: "/images/calendario_retiro.png"
        },
        {
            title: "Local",
            content: "Recinto de Rodeio de Novo Horizonte",
            icon: <MapPin className="text-6xl text-white drop-shadow-lg" />,
            color: "holi-secondary",
            img: "/images/local_retiro.png"
        },
        {
            title: "Organização",
            content: "Comunidade Voz de Deus",
            icon: <Users className="text-6xl text-white drop-shadow-lg" />,
            color: "holi-accent",
            img: "/images/organizacao_logo.png"
        }
    ]

    return (
        <section className="py-24 bg-holi-dark relative overflow-hidden" id="informacoes">
            <div className="absolute top-20 left-10 text-holi-green opacity-10 pointer-events-none transform -rotate-12 blur-sm">
                <Brush size={240} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20 relative inline-block left-1/2 transform -translate-x-1/2">
                    <h2 className="text-4xl font-black text-white uppercase tracking-widest">
                        Principais Informações
                    </h2>
                    <span className="absolute -bottom-4 left-0 w-full h-2 bg-gradient-to-r from-holi-primary via-holi-secondary to-holi-accent rounded-full"></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {infos.map((info, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="flex flex-col items-center group relative"
                        >
                            <div className={`w-52 h-52 rounded-full overflow-hidden mb-8 border-4 border-holi-surface shadow-[0_0_20px_rgba(var(--${info.color}),0.3)] group-hover:scale-105 transition-all relative z-10 bg-black flex items-center justify-center`}>
                                <img alt={info.title} className="w-full h-full object-cover opacity-60" src={info.img} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {info.icon}
                                </div>
                            </div>
                            <div className="bg-holi-surface border border-white/5 p-8 rounded-3xl shadow-xl w-full text-center relative mt-0 hover:bg-white/5 transition-colors">
                                <h3 className={`font-bold text-2xl mb-3 text-${info.color} uppercase`}>{info.title}</h3>
                                <p className="text-gray-400 font-bold text-lg">{info.content}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default InfoSection
