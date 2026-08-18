import React from 'react'

export const FloatingTicketBar: React.FC = () => {
    return (
        <div className="sziget-floating-bar" role="navigation" aria-label="Menu Flutuante Rápido">
            <a href="#ingressos" className="sziget-float-item">
                <div className="sziget-icon-circle highlight">🎟️</div>
                <span>TICKETS</span>
            </a>
            <a href="#holi" className="sziget-float-item">
                <div className="sziget-icon-circle">🎨</div>
                <span>HOLI</span>
            </a>
            <a href="#experiencia" className="sziget-float-item">
                <div className="sziget-icon-circle">⚡</div>
                <span>VIBE</span>
            </a>
            <a href="#pregacoes" className="sziget-float-item">
                <div className="sziget-icon-circle">✝️</div>
                <span>HERÓIS</span>
            </a>
            <a
                href="https://wa.me/5511955501090"
                target="_blank"
                rel="noopener noreferrer"
                className="sziget-float-item"
            >
                <div className="sziget-icon-circle" style={{ background: '#22c55e', border: 'none', color: '#fff' }}>
                    💬
                </div>
                <span>CHAT</span>
            </a>
        </div>
    )
}

export default FloatingTicketBar
