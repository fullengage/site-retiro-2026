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
                    <span>⚠️ Camisetas Oficiais (Lote Encerrado)</span>
                </div>
            </div>

            {/* RACK DE 2 CANAIS DE PASSAPORTE */}
            <div className="adonai-tickets-grid soundboard-rack-grid">
                {/* CANAL 01: ADONAI INSCRIÇÃO INDIVIDUAL (R$ 50) */}
                <div className="sziget-pass-card rack-channel-card featured">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-01 • PASSAPORTE OFICIAL</div>
                        <span className="pilot-led-green active-pulse" title="Lote Disponível" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge">🎟️ INSCRIÇÃO ADONAI</span>
                        <span className="pass-urgency-tag">🔥 DISPONÍVEL</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI — INSCRIÇÃO INDIVIDUAL</h3>
                    <p className="pass-card-subtitle">
                        Acesso completo aos 3 dias de retiro, alimentação completa, alojamento, shows e louvor com o melhor custo-benefício.
                    </p>

                    <div className="pass-highlight-box single-box">
                        🎒 <strong>EXPERIÊNCIA COMPLETA</strong>: Acesso a todos os dias, alimentação, kit Holi e shows!
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 50</div>
                        <div className="pass-price-label">INSCRIÇÃO INDIVIDUAL COMPLETA</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ Vaga individual nos 3 dias de festival</div>
                        <div className="pass-summary-item">✅ Alimentação Completa e Alojamento no FAF</div>
                        <div className="pass-summary-item">✅ 1 Kit Holi (Festa das Cores) + Shows</div>
                        <div className="pass-summary-item">ℹ️ Sem camiseta oficial (lote de camisetas encerrado)</div>
                    </div>

                    <Link to="/inscricao" className="btn-sziget-primary stompbox-btn">
                        GARANTIR MINHA VAGA POR R$ 50
                    </Link>
                </div>

                {/* CANAL 02: ADONAI COM CAMISETA (ENCERRADO) */}
                <div className="sziget-pass-card rack-channel-card opacity-70">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-02 • COM CAMISETA</div>
                        <span className="pilot-led-red" title="Lote Encerrado" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                            ⛔ LOTE ENCERRADO
                        </span>
                        <span className="pass-stock-tag">PRAZO ESGOTADO</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI COM CAMISETA</h3>
                    <p className="pass-card-subtitle">
                        Pacote que incluía a Camiseta Oficial 2026. Prazo final de encomendas finalizado para confecção.
                    </p>

                    <div className="pass-highlight-box duo-box" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        ⚠️ <strong>PRAZO ENCERRADO</strong>: As camisetas já foram enviadas para confecção e estampagem.
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val" style={{ color: '#9ca3af' }}>R$ 70</div>
                        <div className="pass-price-label">LOTE DE CAMISETAS ENCERRADO</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">🔒 Pedidos enviados para a confecção</div>
                        <div className="pass-summary-item">✅ Inscrições sem camiseta continuam abertas</div>
                    </div>

                    <Link to="/inscricao" className="btn-sziget-primary stompbox-btn" style={{ opacity: 0.8 }}>
                        INSCREVER SEM CAMISETA (R$ 50)
                    </Link>
                </div>
            </div>

            {/* AVISO IMPORTANTE DE VIRADA DE LOTE */}
            <div className="turma-adonai-box rack-accent-box" style={{ marginTop: '24px' }}>
                <span className="turma-adonai-badge">
                    📢 COMUNICADO DE INSCRIÇÕES
                </span>
                <h3 className="turma-adonai-title">
                    Venda de Camisetas Encerrada
                </h3>
                <p className="turma-adonai-desc">
                    O lote promocional que incluía a camiseta oficial do retiro foi <strong>encerrado</strong> para envio à produção da fábrica. <br />
                    As <strong>inscrições individuais (R$ 50,00) continuam abertas normalmente</strong> incluindo acesso completo a todos os dias, alimentação, kit Holi e shows!
                </p>
            </div>
        </section>
    )
}

export default TicketsSection
