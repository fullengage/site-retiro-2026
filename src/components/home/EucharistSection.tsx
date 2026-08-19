import React from 'react'
import { Link } from 'react-router-dom'

export const EucharistSection: React.FC = () => {
    return (
        <section id="eucaristia" aria-label="A Eucaristia no Retiro Adonai">
            <div className="eucaristia-wrapper">
                <span className="eucaristia-badge">
                    O 3º MOMENTO • ÁPICE DO RETIRO - CORAÇÃO DO ADONAI
                </span>

                <h2 className="eucaristia-title">
                    A EUCARISTIA É O CENTRO.
                </h2>

                <div className="eucaristia-content-grid">
                    {/* CARD DA CITAÇÃO */}
                    <div className="eucaristia-quote-card">
                        <p className="eucaristia-quote-text">
                            &ldquo;Infundir no coração das pessoas o amor pela Santa Missa e pela Eucaristia por meio da Palavra de Deus.&rdquo;
                        </p>
                        <p className="eucaristia-author">
                            — Comunidade Católica Voz de Deus
                        </p>
                    </div>

                    {/* FOTO DESTACADA COM LINK PARA GALERIA */}
                    <Link
                        to="/galeria"
                        className="eucaristia-img-wrap block group relative"
                        aria-label="Ver fotos na galeria"
                    >
                        <img
                            src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/484791295_1064252372408472_3823837486130695994_n.jpg"
                            alt="Momento de fé e adoração no Retiro Adonai"
                            loading="lazy"
                            className="transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-adonai-orange text-adonai-charcoal font-black text-xs px-4 py-2 rounded-sm uppercase tracking-wider shadow-md">
                                Ver Mais na Galeria ↗
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default EucharistSection
