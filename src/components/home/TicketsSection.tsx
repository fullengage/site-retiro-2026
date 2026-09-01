import React from 'react'
import { Link } from 'react-router-dom'

export const TicketsSection: React.FC = () => {
    return (
        <section id="ingressos" aria-label="Ingressos e Passaportes Adonai" className="adonai-tickets-section soundboard-tickets-section">
            <div className="adonai-tickets-header">
                <span className="adonai-section-badge">
                    🎛️ SELETOR DE CANAIS & PASSAPORTES
                </span>
                <h2 className="adonai-tickets-title">
                    GARANTA SEU PASSAPORTE ADONAI
                </h2>
                <p className="adonai-tickets-lead">
                    Selecione o seu canal de acesso ao festival. Três experiências configuradas para você viver o maior retiro da sua vida.
                </p>
            </div>

            {/* BARRA UNIFICADA: MASTER BUS INCLUSIONS */}
            <div className="adonai-inclusions-bar rack-master-bus">
                <div className="adonai-inclusions-header">
                    <div className="master-bus-title">
                        <span className="pilot-led-green" />
                        <span>MASTER INCLUSIONS • INCLUSO EM TODOS OS PASSAPORTES</span>
                    </div>
                    <span className="master-bus-code">SIGNAL: 100% COVERED</span>
                </div>
                <div className="adonai-inclusions-grid">
                    <span>⛺ 3 Dias de Festival</span>
                    <span>🍽️ Alimentação Completa</span>
                    <span>🎨 1 Kit Holi (Festa das Cores)</span>
                    <span>🏷️ Crachá de Acesso</span>
                    <span>🎸 Todos os Shows & Pregações</span>
                    <span>📸 Álbum de Fotos Oficial</span>
                    <span>🎁 Benefício Surpresa no Evento</span>
                    <span>👕 Camiseta Oficial (no pacote de R$ 70 até 10/09)</span>
                </div>
            </div>

            {/* RACK DE 2 CANAIS DE PASSAPORTE */}
            <div className="adonai-tickets-grid soundboard-rack-grid">
                {/* CANAL 01: ADONAI SEM CAMISETA (R$ 50) */}
                <div className="sziget-pass-card rack-channel-card">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-01 • BASIC PASS</div>
                        <span className="pilot-led-green active" title="Lote Disponível" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge">🎟️ SEM CAMISETA</span>
                        <span className="pass-stock-tag">VALOR ACESSÍVEL</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI SEM CAMISETA</h3>
                    <p className="pass-card-subtitle">
                        Para quem deseja viver toda a intensidade dos 3 dias de retiro, louvor e comunhão com o melhor custo-benefício.
                    </p>

                    <div className="pass-highlight-box single-box">
                        🎒 <strong>INSCRIÇÃO COMPLETA</strong>: Acesso a todos os dias, alimentação, kit Holi e shows!
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 50</div>
                        <div className="pass-price-label">INSCRIÇÃO INDIVIDUAL (SEM CAMISETA)</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ Vaga individual nos 3 dias de festival</div>
                        <div className="pass-summary-item">✅ Alimentação Completa e Alojamento no FAF</div>
                        <div className="pass-summary-item">✅ 1 Kit Holi (Festa das Cores) + Shows</div>
                        <div className="pass-summary-item">❌ Não inclui camiseta oficial</div>
                    </div>

                    <Link to="/inscricao?pacote=sem-camiseta" className="btn-sziget-primary stompbox-btn">
                        GARANTIR POR R$ 50
                    </Link>
                </div>

                {/* CANAL 02: ADONAI COM CAMISETA (R$ 70 - ATÉ 10/09) */}
                <div className="sziget-pass-card rack-channel-card featured">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-02 • FULL EXPERIENCE</div>
                        <span className="pilot-led-orange active-pulse" title="Promocional até 10/09" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge duo">🔥 COM CAMISETA</span>
                        <span className="pass-urgency-tag">⏰ ATÉ 10/09</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI COM CAMISETA</h3>
                    <p className="pass-card-subtitle">
                        A experiência completa do festival com a Camiseta Oficial 2026 inclusa por preço promocional.
                    </p>

                    <div className="pass-highlight-box duo-box">
                        ⏰ <strong>PROMOÇÃO ATÉ 10/09</strong>: Camiseta oficial inclusa por apenas R$ 70! Após 10/09, o valor de R$ 70 passa a ser sem camiseta.
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 70</div>
                        <div className="pass-price-label">LOTE PROMOCIONAL (COM CAMISETA ATÉ 10/09)</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ 1 Inscrição Individual Completa (3 dias)</div>
                        <div className="pass-summary-item">✅ 1 Camiseta Oficial do Retiro 2026</div>
                        <div className="pass-summary-item">✅ Alimentação Completa e Alojamento no FAF</div>
                        <div className="pass-summary-item">✅ 1 Kit Holi (Festa das Cores) + Shows</div>
                    </div>

                    <Link to="/inscricao?pacote=com-camiseta" className="btn-sziget-primary stompbox-btn">
                        QUERO COM CAMISETA (R$ 70)
                    </Link>
                </div>
            </div>

            {/* AVISO IMPORTANTE DE VIRADA DE LOTE */}
            <div className="turma-adonai-box rack-accent-box" style={{ marginTop: '24px' }}>
                <span className="turma-adonai-badge">
                    ⏰ CRONOGRAMA DE LOTES & VALORES
                </span>
                <h3 className="turma-adonai-title">
                    Fique atento às datas da inscrição
                </h3>
                <p className="turma-adonai-desc">
                    • <strong>Até dia 10/09:</strong> R$ 50,00 (Sem camiseta) e R$ 70,00 (Com camiseta oficial inclusa).<br />
                    • <strong>Após dia 10/09:</strong> O valor de R$ 70,00 passa a ser <strong>SEM camiseta</strong>.<br />
                    Garanta a sua inscrição antes da virada do lote para garantir sua camiseta oficial com o melhor preço!
                </p>
            </div>
        </section>
    )
}

export default TicketsSection
