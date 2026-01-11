import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Brush } from 'lucide-react'

const InfoSection = () => {
    const infos = [
        {
            title: "Datas",
            content: "Dos dias 14 a 17 de Fevereiro",
            icon: <Calendar className="text-6xl text-white drop-shadow-lg" />,
            color: "holi-primary",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh4saYWyhn9PcLb7f6qzVGuQdwv3JzjAYVMKRvCUhW_YmRikCF_s9qdQYWDAspahDdX6t9KiZq_aaASahnQbDAcBlgKxJBNnO7BMH_G6946GfpANGKagdoF71C0JrjrXecv335xbH7Xz_oWoksvJ73SCWIdJ6r3vlyTc8uGpQslfn8oIe5m_ig1AA-B8Fm6Q97HbUcM62GteivxZRb5AA8LM014ogHNg-_-WW0Yq_ZX2wr_k-gl_-TDlUMrr109eAfFAq1OcNVWjo4"
        },
        {
            title: "Local",
            content: "Recinto de Rodeio de Novo Horizonte",
            icon: <MapPin className="text-6xl text-white drop-shadow-lg" />,
            color: "holi-secondary",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAKfUU_ND3d9J4dNkL5WAB4kcl06b2fXBVfHpmk1I0dwcyXOuFr4-0titXHUtikMp98UcPjGxWogWvSCSoM_UayoQqMQ3tzstCeFbKagNeISfsVYsbfvIISGNDOqhScNHTFK7F62awEmbQeJyRDOnphLnp88tB0IYzvWaUrEyEKX2QhVeh6fVwfw0tj5oXYH9yMCsdjCyb0AIx0CGbJqZd9imhPlYr3yTqxxc6Wxszc6LRrXFgBM8lsev5keGn6pcK2h2kQn01tP0-"
        },
        {
            title: "Organização",
            content: "Comunidade Voz de Deus",
            icon: <Users className="text-6xl text-white drop-shadow-lg" />,
            color: "holi-accent",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk1-oSjrF0xQvlChsBcsXLdU8bdXFJ8RSsazWEYACC6NmhoZoYSI2TbrGOB26yAIfNiA2zmlFQRreVMjfFxHNHUz7bNydk7shMUrDV0mvKm0AUWJrtrS6vD7__QSezFSkUk6MRNMbDCKhaZksX6NoXaLrTqgmmX2wqBx74dqspG1B0CIGSw6rL2Al2fh5sNPLB4mZfugTNemXFvnDh7To-RttGa-fhsSU517rXLgtKxjYchgRkifpgmAI3q0rQqU3Ja6GTdoBW6wYG"
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
