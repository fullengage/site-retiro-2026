import React from 'react'

export const HeroSection: React.FC = () => {
    return (
        <section className="sziget-hero" aria-label="Apresentação do Festival Adonai">
            <span className="adonai-hero-shape adonai-hero-shape-bottom" aria-hidden="true" />
            <span className="adonai-hero-shape adonai-hero-shape-accent" aria-hidden="true" />

            <span className="sziget-hero-badge">
                COMUNIDADE VOZ DE DEUS PRESENTS
            </span>

            <h1 className="sziget-hero-title">
                ADONAI <span>FESTIVAL</span> 2026
            </h1>

            <div className="sziget-tagline-box">
                NO MUNDO. SEM SER DO MUNDO.
            </div>

            <p>
                O maior festival católico jovem da região. 3 dias de música ininterrupta, cultura pop, pregações épicas, Festa
                das Cores (Holi) e amizades que duram para sempre. O melhor retiro de jovem e acampamento de jovens para você
                viver experiências inesquecíveis.
            </p>

            <div className="sziget-hero-tags">
                <span>📍 NOVO HORIZONTE — SP</span>
                <span>📅 25, 26 E 27 DE SETEMBRO DE 2026</span>
            </div>

            <div className="sziget-hero-cta">
                <a href="#ingressos" className="btn-sziget-primary">
                    🎟️ GARANTA SEU INGRESSO
                </a>
                <a href="#experiencia" className="btn-sziget-secondary">
                    DESCUBRA
                </a>
            </div>
        </section>
    )
}

export default HeroSection
