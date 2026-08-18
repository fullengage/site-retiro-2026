import React from 'react'

export const ExperienceSection: React.FC = () => {
    return (
        <section id="experiencia" aria-label="Experiências do Retiro Adonai">
            <span
                style={{
                    color: 'var(--sziget-pink)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    display: 'block',
                    maxWidth: '1280px',
                    margin: '0 auto',
                }}
            >
                1º MOMENTO • EXPLORE O FESTIVAL
            </span>
            <h2
                style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                    fontWeight: 900,
                    margin: '10px auto 50px auto',
                    maxWidth: '1280px',
                    textTransform: 'uppercase',
                }}
            >
                O RETIRO ADONAI
            </h2>

            <div>
                <div className="sziget-stage-card card-pink">
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎤</div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px' }}>
                        EVANGELIZAÇÃO
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '5px 0 12px 0' }}>
                        MÚSICA & LOUVOR
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        A música como instrumento de evangelização, conduzindo corações ao encontro com Jesus Cristo, à oração e a uma experiência viva com Deus.
                    </p>
                </div>

                <div className="sziget-stage-card card-yellow">
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px' }}>
                        ALEGRIA
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '5px 0 12px 0' }}>
                        FESTA & COMUNHÃO
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        Momentos de alegria, música e convivência para celebrar a fé, criar novos laços e viver a beleza de caminhar juntos.
                    </p>
                </div>

                <div className="sziget-stage-card card-cyan">
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎮</div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px' }}>
                        CULTURA & FÉ
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '5px 0 12px 0' }}>
                        CRISTIANIZAR CONTOS
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        Um olhar cristão sobre histórias, heróis, filmes, games e cultura pop, descobrindo valores e reflexões que nos aproximam de Deus.
                    </p>
                </div>

                <div className="sziget-stage-card card-purple">
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>✝️</div>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px' }}>
                        TESTEMUNHOS DE FÉ
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '5px 0 12px 0' }}>
                        NOSSOS SANTOS
                    </h3>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        Homens e mulheres que viveram o Evangelho com coragem e nos mostram que a santidade também é um chamado para nós.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default ExperienceSection
