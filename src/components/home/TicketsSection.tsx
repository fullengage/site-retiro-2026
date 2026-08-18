import React from 'react'
import { Link } from 'react-router-dom'

export const TicketsSection: React.FC = () => {
    return (
        <section id="ingressos" aria-label="Ingressos e Passaportes Adonai">
            <span
                style={{
                    color: 'var(--sziget-brown)',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                }}
            >
                ESCOLHA SUA EXPERIÊNCIA
            </span>

            <h2>GARANTA SEU PASSAPORTE ADONAI</h2>

            <p style={{ fontSize: '1.15rem', lineHeight: 1.6, margin: '15px auto 40px auto' }}>
                Três formas de viver o ADONAI. Escolha a sua e venha fazer parte dessa experiência transformadora.
            </p>

            <div>
                {/* CARD 1: ADONAI ESSENCIAL - PRÉ-CONVITE */}
                <div className="sziget-pass-card">
                    <span className="pass-badge">
                        🎟️ PRÉ-CONVITE
                    </span>

                    <h3>ADONAI ESSENCIAL</h3>

                    <p style={{ fontSize: '1rem', marginBottom: '12px', minHeight: '44px' }}>
                        Para quem não quer apenas participar. Quer viver tudo.
                    </p>

                    <div
                        style={{
                            background: 'rgba(201, 76, 34, 0.12)',
                            border: '1.5px solid var(--adonai-terracotta)',
                            borderRadius: '2px',
                            padding: '8px 10px',
                            marginBottom: '16px',
                            color: 'var(--adonai-terracotta)',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            lineHeight: 1.35,
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        ⚡ Participou do Retiro de Carnaval? Sua inscrição está perfeita: confirme seus dados e pague metade!
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div
                            style={{
                                color: 'var(--adonai-terracotta)',
                                fontSize: '2.8rem',
                                fontWeight: 900,
                                fontFamily: "'Space Grotesk', sans-serif",
                                lineHeight: 1,
                            }}
                        >
                            R$ 50
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--adonai-charcoal)' }}>
                            CONVITE ESPECIAL (50% OFF)
                        </span>
                    </div>

                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 30px 0',
                            fontSize: '0.98rem',
                            lineHeight: 1.9,
                        }}
                    >
                        <li>✅ Acesso aos 3 dias do ADONAI</li>
                        <li>✅ Alimentação durante os 3 dias</li>
                        <li>✅ 1 Kit Holi</li>
                        <li>✅ Todas as pregações</li>
                        <li>✅ Todos os eventos</li>
                        <li>✅ Praça de alimentação e estandes</li>
                        <li>✅ Camiseta Oficial ADONAI</li>
                        <li>✅ Crachá Especial ADONAI</li>
                        <li>✅ Acesso ao Álbum de fotos</li>
                        <li>✅ Foto Experience especial</li>
                        <li>
                            🎁 <strong>Benefício surpresa durante o ADONAI</strong>
                        </li>
                    </ul>

                    <Link to="/inscricao?pacote=essencial" className="btn-sziget-primary">
                        CONFIRMAR MINHA VAGA
                    </Link>
                </div>

                {/* CARD 2: ADONAI EXPERIENCE */}
                <div className="sziget-pass-card">
                    <span className="pass-badge" style={{ background: 'var(--adonai-charcoal)', color: '#fff' }}>
                        🔥 PRIMEIRA VEZ SOZINHO
                    </span>

                    <h3>ADONAI EXPERIENCE</h3>

                    <p style={{ fontSize: '1rem', marginBottom: '12px', minHeight: '44px' }}>
                        Para quem não quer apenas participar. Quer viver tudo.
                    </p>

                    <div
                        style={{
                            background: 'rgba(32, 32, 32, 0.08)',
                            border: '1.5px solid var(--adonai-charcoal)',
                            borderRadius: '2px',
                            padding: '8px 10px',
                            marginBottom: '16px',
                            color: 'var(--adonai-charcoal)',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            lineHeight: 1.35,
                            fontFamily: "'Space Grotesk', sans-serif",
                            textAlign: 'center',
                        }}
                    >
                        EXPERIÊNCIA COMPLETA INDIVIDUAL
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div
                            style={{
                                color: 'var(--adonai-charcoal)',
                                fontSize: '2.8rem',
                                fontWeight: 900,
                                fontFamily: "'Space Grotesk', sans-serif",
                                lineHeight: 1,
                            }}
                        >
                            R$ 100
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--adonai-charcoal)' }}>
                            PRIMEIRA VEZ SOZINHO
                        </span>
                    </div>

                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 30px 0',
                            fontSize: '0.98rem',
                            lineHeight: 1.9,
                        }}
                    >
                        <li>✅ Acesso aos 3 dias do ADONAI</li>
                        <li>✅ Alimentação durante os 3 dias</li>
                        <li>✅ 1 Kit Holi</li>
                        <li>✅ Todas as pregações</li>
                        <li>✅ Todos os eventos</li>
                        <li>✅ Praça de alimentação e estandes</li>
                        <li>✅ Camiseta Oficial ADONAI</li>
                        <li>✅ Crachá Especial ADONAI</li>
                        <li>✅ Acesso ao Álbum de fotos</li>
                        <li>✅ Foto Experience especial</li>
                        <li>
                            🎁 <strong>Benefício surpresa durante o ADONAI</strong>
                        </li>
                    </ul>

                    <Link to="/inscricao?pacote=experience" className="btn-sziget-primary">
                        QUERO A EXPERIÊNCIA COMPLETA
                    </Link>
                </div>

                {/* CARD 3: ADONAI DUO */}
                <div className="sziget-pass-card">
                    <span className="pass-badge">
                        🤝 PRIMEIRA VEZ COM AMIGO
                    </span>

                    <h3>ADONAI DUO</h3>

                    <p style={{ fontSize: '1rem', marginBottom: '12px', minHeight: '44px' }}>
                        Porque experiência boa é experiência compartilhada.
                    </p>

                    <div
                        style={{
                            background: 'rgba(32, 32, 32, 0.08)',
                            border: '1.5px solid var(--adonai-charcoal)',
                            borderRadius: '2px',
                            padding: '8px 10px',
                            marginBottom: '16px',
                            color: 'var(--adonai-charcoal)',
                            fontSize: '0.82rem',
                            fontWeight: 900,
                            lineHeight: 1.35,
                            fontFamily: "'Space Grotesk', sans-serif",
                            textAlign: 'center',
                        }}
                    >
                        APENAS R$ 60 POR PESSOA
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div
                            style={{
                                color: 'var(--adonai-terracotta)',
                                fontSize: '2.8rem',
                                fontWeight: 900,
                                fontFamily: "'Space Grotesk', sans-serif",
                                lineHeight: 1,
                            }}
                        >
                            R$ 120
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--adonai-charcoal)' }}>
                            PARA 2 PESSOAS (VOCÊ + 1)
                        </span>
                    </div>

                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 30px 0',
                            fontSize: '0.98rem',
                            lineHeight: 1.9,
                        }}
                    >
                        <li>✅ Acesso aos 3 dias do ADONAI</li>
                        <li>✅ Alimentação durante os 3 dias</li>
                        <li>✅ 2 Kits Holi</li>
                        <li>✅ Todas as pregações</li>
                        <li>✅ Todos os eventos</li>
                        <li>✅ Praça de alimentação e estandes</li>
                        <li>✅ 2 Camisetas Oficiais ADONAI</li>
                        <li>✅ 2 Crachás Especiais ADONAI</li>
                        <li>✅ Acesso ao Álbum de fotos</li>
                        <li>✅ Foto Experience especial</li>
                        <li>
                            🎁 <strong>Benefício surpresa durante o ADONAI</strong>
                        </li>
                    </ul>

                    <Link to="/inscricao?pacote=duo" className="btn-sziget-primary">
                        CHAMAR MEU DUO
                    </Link>
                </div>
            </div>

            {/* BENEFÍCIO EXTRA: TURMA ADONAI 2026 */}
            <div className="turma-adonai-box">
                <span
                    style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        color: 'var(--adonai-orange)',
                        display: 'block',
                        marginBottom: '8px',
                    }}
                >
                    🏆 TURMA ADONAI 2026
                </span>

                <h3 style={{ fontSize: '1.6rem', margin: '0 0 10px 0', fontWeight: 900 }}>
                    Faça parte da história.
                </h3>

                <p style={{ fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
                    Os primeiros inscritos farão parte da Turma ADONAI 2026 e terão seus nomes registrados no mural digital oficial desta edição.
                </p>
            </div>
        </section>
    )
}

export default TicketsSection
