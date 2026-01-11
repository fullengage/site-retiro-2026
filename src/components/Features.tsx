import { motion } from 'framer-motion'
import { Music, Heart, Church, Gamepad2 } from 'lucide-react'

const Features = () => {
    const features = [
        {
            title: "Shows ao Vivo",
            desc: "Bandas católicas renomadas e muito louvor para elevar sua alma aos céus.",
            icon: <Music />,
            color: "holi-primary"
        },
        {
            title: "Adoração",
            desc: "Momentos profundos de encontro com Jesus Eucarístico e cura interior.",
            icon: <Heart />,
            color: "holi-secondary"
        },
        {
            title: "Santas Missas",
            desc: "Celebrações diárias da Eucaristia, o centro e o ápice da nossa fé cristã.",
            icon: <Church />,
            color: "holi-accent"
        },
        {
            title: "Gincanas",
            desc: "Diversão garantida com atividades que promovem a união e a alegria santa.",
            icon: <Gamepad2 />,
            color: "holi-green"
        }
    ]

    return (
        <section className="py-24 bg-holi-dark relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h2 className="text-center text-3xl md:text-5xl font-black text-white mb-16 uppercase tracking-widest">
                    O que te espera?
                    <div className="h-2 w-24 bg-holi-primary mx-auto mt-4 rounded-full shadow-[0_0_10px_#d946ef]"></div>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className={`bg-holi-surface p-8 rounded-3xl border border-white/5 hover:border-${f.color}/50 transition-colors group relative overflow-hidden shadow-2xl`}
                        >
                            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${f.color}/10 rounded-full blur-2xl group-hover:bg-${f.color}/30 transition-colors`}></div>
                            <div className={`w-16 h-16 bg-${f.color}/20 rounded-2xl flex items-center justify-center mb-6 text-${f.color} group-hover:scale-110 transition-transform`}>
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tighter">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
