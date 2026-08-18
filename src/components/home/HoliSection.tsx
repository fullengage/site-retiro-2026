import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export const HoliSection: React.FC = () => {
    return (
        <section id="holi" aria-label="Festa das Cores Holi">
            <div className="holi-container">
                {/* COLUNA ESQUERDA: TEXTO E CONCEITO */}
                <div className="holi-text-col">
                    <span
                        style={{
                            color: 'var(--adonai-charcoal)',
                            background: 'var(--adonai-sand)',
                            border: '2px solid var(--adonai-charcoal)',
                            padding: '6px 16px',
                            borderRadius: '2px',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 900,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            display: 'inline-block',
                            marginBottom: '16px',
                            boxShadow: '3px 3px 0 var(--adonai-charcoal)',
                        }}
                    >
                        2º MOMENTO • AS CORES DA VIDA
                    </span>

                    <h2>HOLI A FESTA DAS CORES</h2>

                    <p>
                        Setembro marca o início da primavera, o desabrochar das flores e a renovação da vida. Venha viver essa explosão de cores, som e fraternidade.
                    </p>

                    <div className="mt-6">
                        <Link
                            to="/galeria"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#fff53c] text-black font-black uppercase text-xs tracking-wider rounded-full shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all border-2 border-black"
                        >
                            <Sparkles size={15} />
                            <span>Ver Fotos do Holi na Galeria ↗</span>
                        </Link>
                    </div>
                </div>

                {/* COLUNA DIREITA: CARD COM FOTO E DESTAQUE DOS PÓS */}
                <div className="holi-card-col">
                    <div className="holi-card">
                        <h3>
                            🎨 PÓS COLORIDOS ATÓXICOS
                        </h3>

                        <Link
                            to="/galeria"
                            className="ato-gallery-img-wrap block group relative"
                            style={{
                                height: '260px',
                                width: '100%',
                                marginBottom: '16px',
                                borderRadius: '2px',
                                border: '3px solid var(--adonai-charcoal)',
                                overflow: 'hidden',
                                boxShadow: '5px 5px 0 var(--adonai-charcoal)',
                            }}
                        >
                            <img
                                src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/495086145_1108592794641096_5489144302593018585_n-1.jpg"
                                alt="Festa das Cores Holi no Retiro Adonai"
                                className="ato-gallery-img transition-transform duration-500 group-hover:scale-105"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-[#fff53c] text-black font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                                    Explorar Galeria ↗
                                </span>
                            </div>
                        </Link>

                        <p style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--adonai-charcoal)' }}>
                            Ambiente 100% seguro para você e seus amigos registrarem os melhores momentos.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HoliSection
