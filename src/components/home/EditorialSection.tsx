import React from 'react'
import { Link } from 'react-router-dom'

export const EditorialSection: React.FC = () => {
    return (
        <section className="adonai-editorial-section" aria-label="O que é o Festival Adonai">
            <div className="adonai-editorial-container">
                {/* CABEÇALHO DA SEÇÃO */}
                <div className="adonai-editorial-header">
                    <span className="adonai-section-badge">
                        JORNADA & PROPÓSITO
                    </span>
                    <h2 className="adonai-editorial-title">
                        O QUE É O <span className="text-adonai-orange">FESTIVAL ADONAI?</span>
                    </h2>
                    <p className="adonai-editorial-lead">
                        Mais do que um evento, o Adonai é uma experiência imersiva de 3 dias que conduz o jovem do encontro consigo mesmo ao encontro vivo com Deus através da <strong>arte que transforma vidas</strong>.
                    </p>
                </div>

                {/* 3 PILARES DA EXPERIÊNCIA (GRID DINÂMICO) */}
                <div className="adonai-pillars-grid">
                    {/* PILAR 1: A DESCONSTRUÇÃO */}
                    <div className="adonai-pillar-card">
                        <div className="adonai-pillar-num">1º MOMENTO</div>
                        <h3 className="adonai-pillar-title">A DESCONSTRUÇÃO</h3>
                        <p className="adonai-pillar-desc">
                            Antes de construir, é preciso transformar. Olhar para dentro, quebrar máscaras e barreiras, redescobrindo a dignidade e os valores que geram liberdade autêntica.
                        </p>
                        <div className="adonai-pillar-tag">🎭 ARTE & EXPRESSÃO</div>
                    </div>

                    {/* PILAR 2: VIDA E VERDADE */}
                    <div className="adonai-pillar-card active">
                        <div className="adonai-pillar-num">2º MOMENTO</div>
                        <h3 className="adonai-pillar-title">VIDA E VERDADE</h3>
                        <p className="adonai-pillar-desc">
                            Como viver no mundo sem se perder? Descubra que a fé se manifesta nos relacionamentos reais, nas escolhas diárias, nas amizades e nos grandes sonhos da juventude.
                        </p>
                        <div className="adonai-pillar-tag">⚡ COMUNIDADE & PROPÓSITO</div>
                    </div>

                    {/* PILAR 3: FÉ E ESPERANÇA */}
                    <div className="adonai-pillar-card">
                        <div className="adonai-pillar-num">3º MOMENTO</div>
                        <h3 className="adonai-pillar-title">FÉ E ESPERANÇA</h3>
                        <p className="adonai-pillar-desc">
                            A certeza de que você nunca está sozinho. Uma experiência transformadora de oração, reconciliação e força viva para viver com alegria inabalável no dia a dia.
                        </p>
                        <div className="adonai-pillar-tag">✝️ ENCONTRO & ADORAÇÃO</div>
                    </div>
                </div>

                {/* CARD INSPIRACIONAL & MINI GALERIA */}
                <div className="adonai-editorial-bottom">
                    <div className="adonai-quote-box">
                        <p className="adonai-quote-scripture">
                            &ldquo;Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.&rdquo;
                        </p>
                        <span className="adonai-quote-ref">João 14,6 • Comunidade Voz de Deus</span>
                        <div className="adonai-quote-cta">
                            <a href="#ingressos" className="btn-sziget-primary">
                                🎟️ GARANTIR MINHA VAGA
                            </a>
                            <Link to="/galeria" className="btn-sziget-secondary">
                                📸 VER FOTOS ANTERIORES
                            </Link>
                        </div>
                    </div>

                    <div className="adonai-editorial-photos">
                        <Link to="/galeria" className="adonai-photo-item" aria-label="Ver foto na galeria">
                            <img
                                src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482244875_1064251082408601_6342010604447305819_n.jpg"
                                alt="Jovens no Festival Adonai"
                                loading="lazy"
                            />
                            <span className="adonai-photo-badge">AMIZADE</span>
                        </Link>
                        <Link to="/galeria" className="adonai-photo-item" aria-label="Ver foto na galeria">
                            <img
                                src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482248896_1064251052408604_144387337051636653_n.jpg"
                                alt="Convivência no Festival Adonai"
                                loading="lazy"
                            />
                            <span className="adonai-photo-badge">ALEGRIA</span>
                        </Link>
                        <Link to="/galeria" className="adonai-photo-item" aria-label="Ver foto na galeria">
                            <img
                                src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/IMG_7873.jpg"
                                alt="Momento de fé no Adonai"
                                loading="lazy"
                            />
                            <span className="adonai-photo-badge">FÉ VIVA</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EditorialSection
