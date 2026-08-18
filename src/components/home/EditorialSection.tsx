import React from 'react'

export const EditorialSection: React.FC = () => {
    return (
        <section className="adonai-editorial-section" aria-label="O que é o Festival Adonai">
            {/* Grafismo 1 (Topo Direita) */}
            <svg
                width="450"
                height="220"
                viewBox="0 0 400 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    position: 'absolute',
                    top: '3%',
                    right: '-3%',
                    opacity: 0.85,
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            >
                <path
                    d="M50,150 C100,50 130,20 180,80 C230,140 270,180 320,80 C360,0 400,-20 450,50"
                    stroke="#00e5ff"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            {/* Grafismo 2 (Fundo Esquerda) */}
            <svg
                width="400"
                height="220"
                viewBox="0 0 350 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '-6%',
                    opacity: 0.85,
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            >
                <path
                    d="M-20,150 C50,150 100,20 180,80 C240,130 280,180 360,100"
                    stroke="#00e5ff"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>

            <div className="adonai-editorial-container">
                {/* CABEÇALHO EXPANSIVO */}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(35px, 6vw, 60px)' }}>
                    <h2
                        style={{
                            fontSize: 'clamp(2.6rem, 6.2vw, 4.8rem)',
                            fontWeight: 900,
                            margin: '0 0 16px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '-1.5px',
                            lineHeight: 1.02,
                            color: '#ffffff',
                        }}
                    >
                        O QUE É O <span style={{ color: '#fff53c' }}>FESTIVAL ADONAI?</span>
                    </h2>
                    <p
                        style={{
                            maxWidth: '980px',
                            margin: '0 auto',
                            fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)',
                            lineHeight: 1.65,
                            fontWeight: 600,
                            color: '#f1f5f9',
                        }}
                    >
                        Mais do que um evento, o Adonai é uma jornada que conduz o jovem do encontro consigo mesmo ao encontro com Deus através do caminho{' '}
                        <strong style={{ color: '#fff53c' }}>A ARTE QUE TRANSFORMA A VIDA</strong>. A arte tem o poder de transformar a vida ao dar forma aos sentimentos, ampliar o olhar crítico e unir pessoas.
                    </p>
                </div>

                {/* GRID PRINCIPAL EXPANSIVO EM 2 COLUNAS */}
                <div className="adonai-editorial-grid">
                    {/* COLUNA ESQUERDA: JORNADA DOS 3 ATOS */}
                    <div>
                        <p
                            style={{
                                fontSize: 'clamp(1.05rem, 1.8vw, 1.22rem)',
                                lineHeight: 1.8,
                                color: '#e2e8f0',
                                margin: '0 0 30px 0',
                            }}
                        >
                            O <strong style={{ color: '#fff53c' }}>Festival Adonai</strong> é um caminho de evangelização que ajuda cada jovem a olhar para a própria história, rever conceitos, descobrir novos valores e experimentar uma fé viva e relevante no cotidiano.
                        </p>

                        {/* TIMELINE EXPANSIVA */}
                        <div className="ato-timeline">
                            {/* 1º ATO */}
                            <div className="ato-step-item">
                                <div className="ato-step-dot" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span
                                        style={{
                                            color: '#fff53c',
                                            fontWeight: 900,
                                            fontSize: '0.95rem',
                                            letterSpacing: '1.2px',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        1º MOMENTO •
                                    </span>
                                    <h3
                                        style={{
                                            fontSize: 'clamp(1.3rem, 2.2vw, 1.65rem)',
                                            fontWeight: 800,
                                            margin: 0,
                                            color: '#ffffff',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        A DESCONSTRUÇÃO
                                    </h3>
                                </div>
                                <p
                                    style={{
                                        fontSize: 'clamp(0.98rem, 1.6vw, 1.1rem)',
                                        lineHeight: 1.75,
                                        color: '#cbd5e1',
                                        margin: 0,
                                    }}
                                >
                                    Antes de construir, é preciso transformar. O jovem é provocado a olhar para si, para seus preconceitos, crenças e barreiras, compreendendo os <strong>valores cristãos</strong> que realmente conduzem à liberdade, dignidade e propósito.
                                </p>
                            </div>

                            {/* 2º ATO */}
                            <div className="ato-step-item">
                                <div className="ato-step-dot" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span
                                        style={{
                                            color: '#fff53c',
                                            fontWeight: 900,
                                            fontSize: '0.95rem',
                                            letterSpacing: '1.2px',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        2º MOMENTO •
                                    </span>
                                    <h3
                                        style={{
                                            fontSize: 'clamp(1.3rem, 2.2vw, 1.65rem)',
                                            fontWeight: 800,
                                            margin: 0,
                                            color: '#ffffff',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        A VIDA E A VERDADE
                                    </h3>
                                </div>
                                <p
                                    style={{
                                        fontSize: 'clamp(0.98rem, 1.6vw, 1.1rem)',
                                        lineHeight: 1.75,
                                        color: '#cbd5e1',
                                        margin: 0,
                                    }}
                                >
                                    Como viver em sociedade e como nossas escolhas afetam os outros? Momento de descobrir que os valores cristãos se manifestam nos relacionamentos, nas decisões, na família, nos sonhos e nas atitudes reais da vida.
                                </p>
                            </div>

                            {/* 3º ATO */}
                            <div className="ato-step-item">
                                <div className="ato-step-dot" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span
                                        style={{
                                            color: '#fff53c',
                                            fontWeight: 900,
                                            fontSize: '0.95rem',
                                            letterSpacing: '1.2px',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        3º MOMENTO •
                                    </span>
                                    <h3
                                        style={{
                                            fontSize: 'clamp(1.3rem, 2.2vw, 1.65rem)',
                                            fontWeight: 800,
                                            margin: 0,
                                            color: '#ffffff',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        FÉ E ESPERANÇA
                                    </h3>
                                </div>
                                <p
                                    style={{
                                        fontSize: 'clamp(0.98rem, 1.6vw, 1.1rem)',
                                        lineHeight: 1.75,
                                        color: '#cbd5e1',
                                        margin: 0,
                                    }}
                                >
                                    Nem tudo está sob nosso controle. Apresentamos a experiência de um <strong>Deus que caminha conosco</strong>, gerando sabedoria, paz e a força para crer no invisível com esperança viva e inabalável.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* COLUNA DIREITA: DESTAQUE, GALERIA E CTA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                        {/* DESTAQUE BÍBLICO EXPANSIVO */}
                        <div
                            style={{
                                borderLeft: '4px solid #fff53c',
                                padding: '14px 0 14px 22px',
                                background: 'linear-gradient(90deg, rgba(255,245,60,0.12) 0%, transparent 100%)',
                                borderRadius: '0 18px 18px 0',
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                                    fontWeight: 800,
                                    lineHeight: 1.4,
                                    margin: '0 0 6px 0',
                                    color: '#ffffff',
                                }}
                            >
                                Do encontro consigo mesmo ao encontro com Deus.
                            </p>
                            <span
                                style={{
                                    color: '#fff53c',
                                    fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
                                    fontWeight: 600,
                                    lineHeight: 1.45,
                                    display: 'block',
                                }}
                            >
                                &ldquo;Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.&rdquo; (João 14,6)
                            </span>
                        </div>

                        {/* GALERIA EXPANSIVA (3 FOTOS) */}
                        <div className="ato-gallery-grid">
                            <div className="ato-gallery-img-wrap" style={{ height: '260px' }}>
                                <img
                                    src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482244875_1064251082408601_6342010604447305819_n.jpg"
                                    alt="Jovens no Festival Adonai"
                                    className="ato-gallery-img"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '260px' }}>
                                <div className="ato-gallery-img-wrap" style={{ height: 'calc(50% - 7px)' }}>
                                    <img
                                        src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/482248896_1064251052408604_144387337051636653_n.jpg"
                                        alt="Convivência no Adonai"
                                        className="ato-gallery-img"
                                    />
                                </div>
                                <div className="ato-gallery-img-wrap" style={{ height: 'calc(50% - 7px)' }}>
                                    <img
                                        src="https://www.festivaladonai.com.br/wp-content/uploads/2026/08/IMG_7873.jpg"
                                        alt="Momento de fé no Adonai"
                                        className="ato-gallery-img"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FECHAMENTO ADONAI 2026 & CTA */}
                        <div
                            style={{
                                paddingTop: '20px',
                                borderTop: '1px solid rgba(255,255,255,0.15)',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                                    lineHeight: 1.2,
                                    margin: '0 0 10px 0',
                                    color: '#ffffff',
                                    fontWeight: 900,
                                }}
                            >
                                ESSA CAMINHADA NOS LEVA AO <span style={{ color: '#fff53c' }}>ADONAI 2026</span>
                            </h3>

                            <p
                                style={{
                                    fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
                                    lineHeight: 1.65,
                                    color: '#cbd5e1',
                                    margin: '0 0 20px 0',
                                }}
                            >
                                Na <strong>4ª edição</strong>, serão 3 dias inesquecíveis de <strong>música, teatro, dança, pregações, workshops, acampamento e oração</strong> vivendo uma Igreja viva, alegre e jovem.
                            </p>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '18px',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '0.9rem',
                                        fontStyle: 'italic',
                                        lineHeight: 1.4,
                                        margin: 0,
                                        color: '#94a3b8',
                                    }}
                                >
                                    Com carinho,<br />
                                    <strong style={{ color: '#f1f5f9' }}>Comunidade Católica Voz de Deus</strong> • Novo Horizonte - SP
                                </p>

                                <a href="#ingressos" className="btn-adonai-start">
                                    GARANTIR MINHA VAGA
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default EditorialSection
