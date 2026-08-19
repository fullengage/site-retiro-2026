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
                    <span>👕 Camiseta Oficial 2026</span>
                    <span>🏷️ Crachá de Acesso</span>
                    <span>🎸 Todos os Shows & Pregações</span>
                    <span>📸 Álbum de Fotos Oficial</span>
                    <span>🎁 Benefício Surpresa no Evento</span>
                </div>
            </div>

            {/* RACK DE 3 CANAIS DE PASSAPORTE */}
            <div className="adonai-tickets-grid soundboard-rack-grid">
                {/* CANAL 01: ADONAI ESSENCIAL (VETERANOS) */}
                <div className="sziget-pass-card rack-channel-card">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-01 • VETERAN GAIN</div>
                        <span className="pilot-led-amber" title="Lote exclusivo" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge">🎟️ PRÉ-CONVITE</span>
                        <span className="pass-urgency-tag">⏰ ATÉ 31/08</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI ESSENCIAL</h3>
                    <p className="pass-card-subtitle">
                        Exclusivo para quem participou do Retiro de Carnaval e quer garantir a vaga com benefício antecipado.
                    </p>

                    <div className="pass-highlight-box veteran-box">
                        ⚡ <strong>50% OFF</strong> para quem esteve no Retiro de Carnaval!
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 50</div>
                        <div className="pass-price-label">PRE-ORDER GAIN (50% OFF)</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ Vaga individual garantida</div>
                        <div className="pass-summary-item">✅ 1 Kit Holi + Camiseta Oficial</div>
                        <div className="pass-summary-item">✅ Desconto exclusivo de veterano</div>
                    </div>

                    <Link to="/inscricao?pacote=essencial" className="btn-sziget-primary stompbox-btn">
                        CONFIRMAR MINHA VAGA
                    </Link>
                </div>

                {/* CANAL 02: ADONAI EXPERIENCE (INDIVIDUAL) */}
                <div className="sziget-pass-card rack-channel-card">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-02 • SOLO EXPERIENCE</div>
                        <span className="pilot-led-green active" title="Lote Aberto" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge highlight">🔥 INDIVIDUAL</span>
                        <span className="pass-stock-tag">1º LOTE</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI EXPERIENCE</h3>
                    <p className="pass-card-subtitle">
                        Para quem vai viver a experiência pela primeira vez ou participar de forma independente.
                    </p>

                    <div className="pass-highlight-box single-box">
                        🎒 <strong>EXPERIÊNCIA COMPLETA</strong>: Tudo incluso nos 3 dias.
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 100</div>
                        <div className="pass-price-label">FULL SOLO PASS (ALL INCLUSIVE)</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ 1 Inscrição Individual Completa</div>
                        <div className="pass-summary-item">✅ Alimentação, Alojamento e Shows</div>
                        <div className="pass-summary-item">✅ 1 Kit Holi + Camiseta Oficial</div>
                    </div>

                    <Link to="/inscricao?pacote=experience" className="btn-sziget-primary stompbox-btn">
                        QUERO A EXPERIÊNCIA COMPLETA
                    </Link>
                </div>

                {/* CANAL 03: ADONAI DUO (VOCÊ + 1 AMIGO) */}
                <div className="sziget-pass-card rack-channel-card featured">
                    <div className="rack-channel-header">
                        <div className="channel-id">CH-03 • DUAL LINK MODE</div>
                        <span className="pilot-led-orange active-pulse" title="Mais Recomendado" />
                    </div>

                    <div className="pass-card-header">
                        <span className="pass-badge duo">🤝 MELHOR ESCOLHA</span>
                        <span className="pass-save-tag">SAVE R$ 80</span>
                    </div>

                    <h3 className="pass-card-title">ADONAI DUO</h3>
                    <p className="pass-card-subtitle">
                        Porque a melhor experiência é compartilhada com quem caminha ao seu lado.
                    </p>

                    <div className="pass-highlight-box duo-box">
                        👥 <strong>APENAS R$ 60 POR PESSOA</strong> no pacote para 2 amigos!
                    </div>

                    <div className="pass-price-box rack-price-box">
                        <div className="pass-price-val">R$ 120</div>
                        <div className="pass-price-label">TOTAL FOR 2 PERSONS (R$ 60/EACH)</div>
                    </div>

                    <div className="pass-features-summary">
                        <div className="pass-summary-item">✅ 2 Inscrições Completas (Você + 1)</div>
                        <div className="pass-summary-item">✅ 2 Camisetas Oficiais + 2 Kits Holi</div>
                        <div className="pass-summary-item">✅ Economia máxima garantida</div>
                    </div>

                    <Link to="/inscricao?pacote=duo" className="btn-sziget-primary stompbox-btn">
                        CHAMAR MEU DUO
                    </Link>
                </div>
            </div>

            {/* BENEFÍCIO EXTRA: TURMA ADONAI 2026 */}
            <div className="turma-adonai-box rack-accent-box">
                <span className="turma-adonai-badge">
                    🏆 MURAL DIGITAL OFICIAL • HALL OF FAME
                </span>
                <h3 className="turma-adonai-title">
                    Faça parte da Turma ADONAI 2026
                </h3>
                <p className="turma-adonai-desc">
                    Os primeiros inscritos terão seus nomes gravados no painel digital oficial desta edição comemorativa. Garanta sua inscrição antes da virada de lote!
                </p>
            </div>
        </section>
    )
}

export default TicketsSection
