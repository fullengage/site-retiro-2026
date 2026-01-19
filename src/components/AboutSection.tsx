import { motion } from 'framer-motion'

const AboutSection = () => (
    <section className="relative py-24 bg-holi-dark overflow-hidden" id="sobre">
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-holi-dark to-transparent z-20 pointer-events-none"></div>

        <div className="absolute inset-0 z-0">
            <img
                alt="Multidão no retiro"
                className="w-full h-full object-cover opacity-20 grayscale hover:grayscale-0 transition-all duration-700 mix-blend-overlay"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO6bu2DI61ilE5yC90ozz7O79Sys4hQpfdpB21dTvHbR1DNFvUbGrRnCt639Z5c5ZAMbmwkcIEsNwQhpfLYNtNBVtgccJtQFtzAMxpsIcnQg2um6Htg6O2Y2LR5kzLIw5rdw3SkyQetr-pmF_PAeN24xenFdrgBmm0bBd7izRqjoDazWp6v45YkNP-yuwP95U6yqp9VJCb3y1DQfUilV2GyBhqLu4N6LFt8XRwAMnZ6c3ARq20uqwCVTbEqIJv5Okn4MO-Z6miN1k9"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-holi-dark via-holi-dark/95 to-holi-dark"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-holi-accent to-holi-orange mb-8 uppercase drop-shadow-sm">
                Sobre o retiro
            </h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl p-8 md:p-14 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-holi-primary rounded-full filter blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-holi-secondary rounded-full filter blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

                <div className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium relative z-10 space-y-6">
                    <p>
                        O <strong className="text-holi-primary">Retiro de Carnaval da Comunidade Voz de Deus</strong> nasceu em Novo Horizonte – SP, em 2023, fruto do ardor missionário do Padre Fabinho, pároco da Matriz São José, em profunda comunhão com o fundador da nossa Comunidade, da qual o sacerdote é assessor espiritual.
                    </p>

                    <p>
                        Desde sua origem, o Retiro tem se consolidado como um solo sagrado de encontro profundo com o Cristo Ressuscitado. Em nossa última edição, reunimos mais de <span className="text-holi-accent font-bold">300 jovens</span> unidos em um só propósito: viver uma experiência marcante de fé, conversão e do amor transbordante de Deus.
                    </p>

                    <p>
                        Aqui, cada detalhe é orado e planejado para proporcionar dias inesquecíveis. Em um ambiente vibrante de alegria e comunhão fraterna, vivemos uma verdadeira explosão de graça e presença divina que transforma corações e renova vidas.
                    </p>

                    <p className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-holi-accent to-holi-orange pt-4">
                        Em 2026, nossa missão é ir ainda mais longe: alcançar novas almas com um Carnaval diferente,
                        cheio de <span className="text-holi-secondary font-marker text-white">cor</span>,
                        <span className="text-holi-accent font-marker text-white"> vida</span> e
                        <span className="text-holi-primary font-marker text-white"> propósito</span>.
                    </p>
                </div>
            </motion.div>
        </div>

        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-holi-dark to-transparent z-20 pointer-events-none"></div>
    </section>
)

export default AboutSection
