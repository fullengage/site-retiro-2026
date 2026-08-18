import React from 'react'

export const PreachingSection: React.FC = () => {
    return (
        <section id="pregacoes" aria-label="Insights e Pregações">
            <div>
                <span
                    style={{
                        color: 'var(--sziget-pink)',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 900,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: '10px',
                    }}
                >
                    INSIGHTS & PREGAÇÕES
                </span>

                <h2>VOCÊ CONHECE AS HISTÓRIAS.</h2>

                <h3
                    style={{
                        fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                        fontWeight: 800,
                        margin: '15px 0 40px 0',
                        fontFamily: "'Space Grotesk', sans-serif",
                    }}
                >
                    MAS E SE OLHÁSSEMOS PARA ELAS COM OS OLHOS DA FÉ?
                </h3>

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        maxWidth: '900px',
                    }}
                >
                    <span className="pregacao-tag">🦇 HERÓIS & VIRTUDES</span>
                    <span className="pregacao-tag">💰 VERDADEIRO TESOURO</span>
                    <span className="pregacao-tag">🎮 JORNADA & FASES</span>
                    <span className="pregacao-tag">🛡️ CORAGEM & MISSÃO</span>
                </div>
            </div>
        </section>
    )
}

export default PreachingSection
