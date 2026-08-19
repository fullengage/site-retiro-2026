import React from 'react'
import { Link } from 'react-router-dom'

export const HeroSection: React.FC = () => {
    return (
        <section className="sziget-hero soundboard-hero" aria-label="Apresentação do Festival Adonai">
            <span className="adonai-hero-shape adonai-hero-shape-bottom" aria-hidden="true" />
            <span className="adonai-hero-shape adonai-hero-shape-accent" aria-hidden="true" />

            {/* Console Master Header Strip */}
            <div className="hero-console-status">
                <span className="live-on-air-pill">
                    <span className="live-dot" /> LIVE STAGE ON AIR
                </span>
                <span className="console-meta-tag">COMMUNITY: VOZ DE DEUS</span>
                <span className="console-meta-tag">EDITION: 4ª COMEMORATIVA</span>
            </div>

            <h1 className="sziget-hero-title">
                ADONAI <span>FESTIVAL</span> 2026
            </h1>

            <div className="sziget-tagline-box rack-accent-box">
                <span className="rack-corner-screw top-left" aria-hidden="true">+</span>
                <span className="rack-corner-screw top-right" aria-hidden="true">+</span>
                <span className="rack-corner-screw bottom-left" aria-hidden="true">+</span>
                <span className="rack-corner-screw bottom-right" aria-hidden="true">+</span>
                NO MUNDO. SEM SER DO MUNDO.
            </div>

            <p className="hero-console-lead">
                O maior festival católico jovem da região. 3 dias de música ininterrupta, cultura pop, pregações épicas, Festa
                das Cores (Holi) e amizades que duram para sempre. O melhor retiro e acampamento para transformar a sua juventude.
            </p>

            <div className="sziget-hero-tags console-tag-deck">
                <span className="console-data-pill">📍 NOVO HORIZONTE — SP</span>
                <span className="console-data-pill">📅 25, 26 E 27 DE SETEMBRO DE 2026</span>
                <span className="console-data-pill highlight">⚡ 3 DIAS DE FESTIVAL</span>
            </div>

            <div className="sziget-hero-cta">
                <a href="#ingressos" className="btn-sziget-primary stompbox-cta">
                    🎟️ GARANTA SEU INGRESSO
                </a>
                <Link to="/galeria" className="btn-sziget-secondary stompbox-secondary">
                    📸 VER GALERIA
                </Link>
            </div>
        </section>
    )
}

export default HeroSection
