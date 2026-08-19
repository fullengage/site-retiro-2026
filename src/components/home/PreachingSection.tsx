import React from 'react'

export const PreachingSection: React.FC = () => {
    return (
        <section id="pregacoes" aria-label="Insights e Pregações" className="adonai-preaching-section soundboard-preaching-section">
            <div className="adonai-preaching-container">
                <div className="adonai-preaching-header">
                    <span className="adonai-section-badge">
                        🎙️ SOUNDBOARD PRESETS • FORMAÇÃO & FÉ
                    </span>
                    <h2 className="adonai-preaching-title">
                        VOCÊ CONHECE AS HISTÓRIAS.
                    </h2>
                    <h3 className="adonai-preaching-subtitle">
                        MAS E SE OLHÁSSEMOS PARA ELAS COM OS OLHOS DA FÉ?
                    </h3>
                    <p className="adonai-preaching-lead">
                        Pregações em alta voltagem que conectam cultura pop, batalhas reais da juventude e a verdade transformadora do Evangelho.
                    </p>
                </div>

                <div className="adonai-preaching-grid">
                    {/* PRESET 01 */}
                    <div className="adonai-preaching-card rack-fx-card">
                        <div className="rack-card-top">
                            <span className="rack-preset-id">PRESET // 01</span>
                            <span className="pilot-led-orange" />
                        </div>
                        <div className="preaching-card-icon">⚔️</div>
                        <div className="preaching-card-badge">CULTURA & CORAGEM</div>
                        <h4 className="preaching-card-title">HERÓIS & VIRTUDES</h4>
                        <p className="preaching-card-text">
                            O chamado para a santidade exige a coragem dos heróis: superar as sombras, resistir às pressões e lutar pela verdade no dia a dia.
                        </p>
                        <div className="fx-vu-mini">
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot" />
                        </div>
                    </div>

                    {/* PRESET 02 */}
                    <div className="adonai-preaching-card rack-fx-card">
                        <div className="rack-card-top">
                            <span className="rack-preset-id">PRESET // 02</span>
                            <span className="pilot-led-green active" />
                        </div>
                        <div className="preaching-card-icon">💰</div>
                        <div className="preaching-card-badge">SENTIDO & VALOR</div>
                        <h4 className="preaching-card-title">O VERDADEIRO TESOURO</h4>
                        <p className="preaching-card-text">
                            Onde está o seu coração? Uma reflexão profunda sobre o que realmente preenche o vazio interior quando as ilusões passageiras acabam.
                        </p>
                        <div className="fx-vu-mini">
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                        </div>
                    </div>

                    {/* PRESET 03 */}
                    <div className="adonai-preaching-card rack-fx-card">
                        <div className="rack-card-top">
                            <span className="rack-preset-id">PRESET // 03</span>
                            <span className="pilot-led-amber" />
                        </div>
                        <div className="preaching-card-icon">🎮</div>
                        <div className="preaching-card-badge">VOCATIVO & FASES</div>
                        <h4 className="preaching-card-title">A JORNADA & AS FASES</h4>
                        <p className="preaching-card-text">
                            A vida de fé como uma grande jornada com fases desafiadoras, onde cada queda é um ponto de partida para avançar com maturidade.
                        </p>
                        <div className="fx-vu-mini">
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot" />
                        </div>
                    </div>

                    {/* PRESET 04 */}
                    <div className="adonai-preaching-card rack-fx-card">
                        <div className="rack-card-top">
                            <span className="rack-preset-id">PRESET // 04</span>
                            <span className="pilot-led-green active" />
                        </div>
                        <div className="preaching-card-icon">🛡️</div>
                        <div className="preaching-card-badge">MISSÃO & IMPACTO</div>
                        <h4 className="preaching-card-title">CORAGEM & MISSÃO</h4>
                        <p className="preaching-card-text">
                            Não fomos chamados para nos esconder. Seja luz para transformar sua escola, faculdade, amizades, família e toda a sociedade.
                        </p>
                        <div className="fx-vu-mini">
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                            <span className="vu-dot on" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PreachingSection
