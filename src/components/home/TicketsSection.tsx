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

            {/* RACK DE PASSAPORTE ATIVO */}
            <div className="max-w-xl mx-auto soundboard-rack-grid">
                {/* CANAL ÚNICO: ADONAI INSCRIÇÃO INDIVIDUAL (R$ 50) */}
                <div className="sziget-pass-card rack-channel-card featured w-full">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-01 • PASSAPORTE OFICIAL RETIRO ADONAI</div>
                        <span className="pilot-led-green active-pulse" title="Lote Disponível" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge">🎟️ INSCRIÇÃO (SEM CAMISETA)</span>
                        <span className="pass-urgency-tag">🔥 VAGAS ABERTAS</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI — INSCRIÇÃO INDIVIDUAL</h3>
                    <p className="pass-card-subtitle">
                        Acesso completo aos 3 dias de festival, louvor, transformação, shows, alimentação completa e alojamento.
                    </p>

                    <div className="pass-highlight-box single-box">
                        🎒 <strong>EXPERIÊNCIA COMPLETA</strong>: Acesso total aos 3 dias, alimentação completa, kit Holi e todos os shows!
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 50</div>
                        <div className="pass-price-label">INSCRIÇÃO INDIVIDUAL (SEM CAMISETA)</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ Vaga individual nos 3 dias de festival</div>
                        <div className="pass-summary-item">✅ Alimentação Completa e Alojamento no FAF</div>
                        <div className="pass-summary-item">✅ 1 Kit Holi (Festa das Cores) + Shows</div>
                        <div className="pass-summary-item">⚠️ Sem camiseta oficial (lote de encomendas à fábrica encerrado)</div>
                    </div>

                    <Link to="/inscricao" className="btn-sziget-primary stompbox-btn">
                        GARANTIR INSCRIÇÃO POR R$ 50
                    </Link>
                </div>
            </div>

            {/* AVISO IMPORTANTE */}
            <div className="max-w-xl mx-auto turma-adonai-box rack-accent-box" style={{ marginTop: '24px' }}>
                <span className="turma-adonai-badge">
                    📢 COMUNICADO OFICIAL
                </span>
                <h3 className="turma-adonai-title">
                    Inscrições Abertas (Sem Camiseta)
                </h3>
                <p className="turma-adonai-desc">
                    O lote promocional com encomenda de camisetas oficiais foi <strong>encerrado</strong> para envio à confecção. <br />
                    As <strong>inscrições individuais (Sem Camiseta) por R$ 50,00</strong> continuam disponíveis com todas as refeições e programação inclusas!
                </p>
            </div>
        </section>
    )
}

export default TicketsSection
