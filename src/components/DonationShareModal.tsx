import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Copy,
    Check,
    MessageCircle,
    Send,
    Code,
    Printer,
    FileText,
    Sparkles,
    Filter,
    HeartHandshake
} from 'lucide-react'

export interface DonationItem {
    id: string
    name: string
    quantity: string
    category: string
    checked: boolean
    received: string | null
}

interface DonationShareModalProps {
    isOpen: boolean
    onClose: () => void
    items: DonationItem[]
}

export const DonationShareModal: React.FC<DonationShareModalProps> = ({
    isOpen,
    onClose,
    items
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
    const [includePix, setIncludePix] = useState<boolean>(true)
    const [includeLink, setIncludeLink] = useState<boolean>(true)
    const [includePartialDetails, setIncludePartialDetails] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState<'whatsapp' | 'html' | 'preview'>('whatsapp')
    const [copied, setCopied] = useState<boolean>(false)
    const [copiedHtml, setCopiedHtml] = useState<boolean>(false)

    const pixKey = "25598513854"
    const donationUrl = "https://acampamentodecarnaval.com.br/doacoes"

    const parseQty = (str: string) => {
        if (!str) return { val: 0, unit: '' }
        const match = str.match(/(\d+(?:[.,]\d+)?)\s*(.*)/)
        if (!match) return { val: 0, unit: '' }
        return { val: parseFloat(match[1].replace(',', '.')), unit: match[2]?.trim() || '' }
    }

    const categories = useMemo(() => {
        const cats = Array.from(new Set(items.map(i => i.category))).sort()
        return ['Todas', ...cats]
    }, [items])

    // Filter missing items
    const missingItems = useMemo(() => {
        return items.filter(item => {
            if (item.checked) return false
            if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false
            return true
        })
    }, [items, selectedCategory])

    // Group missing items by category
    const groupedMissing = useMemo(() => {
        const groups: Record<string, DonationItem[]> = {}
        missingItems.forEach(item => {
            if (!groups[item.category]) {
                groups[item.category] = []
            }
            groups[item.category].push(item)
        })
        return groups
    }, [missingItems])

    // Format item label
    const getItemStatusText = (item: DonationItem) => {
        if (!item.received || !includePartialDetails) {
            return `${item.name}: *${item.quantity}*`
        }

        const target = parseQty(item.quantity)
        const rec = parseQty(item.received)

        if (target.val > 0 && rec.val > 0 && target.val > rec.val) {
            const diff = Math.round((target.val - rec.val) * 100) / 100
            const unit = target.unit || rec.unit || ''
            return `${item.name}: *Falta ${diff} ${unit}* _(Meta: ${item.quantity} | Já temos: ${item.received})_`
        }

        return `${item.name}: *${item.quantity}* _(Já temos: ${item.received})_`
    }

    // Generate WhatsApp Text
    const whatsappText = useMemo(() => {
        const lines: string[] = []

        lines.push('🏕️ *LISTA DE DOAÇÕES NECESSÁRIAS - RETIRO 2026*')
        lines.push('Paz de Cristo, amados! 🙏')
        lines.push('Estamos nos preparando para o nosso Retiro e precisamos da sua ajuda.')
        lines.push('Confira abaixo o que ainda está *faltando* arrecadar:\n')

        const groupKeys = Object.keys(groupedMissing).sort()

        if (groupKeys.length === 0) {
            lines.push('🎉 *Glória a Deus! Todos os itens dessa categoria já foram completados!*')
        } else {
            groupKeys.forEach(category => {
                lines.push(`📦 *${category.toUpperCase()}*`)
                groupedMissing[category].forEach(item => {
                    lines.push(`• ${getItemStatusText(item)}`)
                })
                lines.push('')
            })
        }

        if (includePix) {
            lines.push('💳 *Contribuição via PIX:*')
            lines.push(`Chave PIX: *${pixKey}*`)
            lines.push('')
        }

        if (includeLink) {
            lines.push('🌐 *Acompanhe a lista em tempo real ou doe pelo site:*')
            lines.push(donationUrl)
            lines.push('')
        }

        lines.push('Deus abençoe ricamente sua generosidade! ❤️🔥')

        return lines.join('\n')
    }, [groupedMissing, includePix, includeLink, includePartialDetails])

    // Generate HTML snippet
    const htmlSnippet = useMemo(() => {
        const groupKeys = Object.keys(groupedMissing).sort()

        let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Lista de Doações Faltantes - Retiro 2026</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0a14; color: #f3f4f6; margin: 0; padding: 24px; line-height: 1.5; }
        .container { max-width: 640px; margin: 0 auto; background: #161224; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; }
        h1 { color: #f59e0b; font-size: 22px; text-transform: uppercase; margin-top: 0; margin-bottom: 8px; }
        p.subtitle { color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
        .category-title { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #10b981; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-top: 20px; margin-bottom: 10px; }
        ul { list-style: none; padding-left: 0; margin: 0; }
        li { padding: 8px 12px; margin-bottom: 6px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
        .item-name { font-weight: 600; color: #fff; }
        .item-qty { font-weight: 700; color: #f59e0b; font-family: monospace; }
        .item-sub { font-size: 11px; color: #9ca3af; display: block; }
        .pix-box { margin-top: 24px; padding: 16px; background: rgba(245,158,11,0.1); border: 1px dashed #f59e0b; border-radius: 12px; text-align: center; }
        .pix-title { font-weight: bold; color: #f59e0b; font-size: 14px; }
        .pix-key { font-size: 18px; font-family: monospace; font-weight: bold; color: #fff; margin-top: 4px; }
        .footer-link { margin-top: 16px; text-align: center; font-size: 13px; color: #9ca3af; }
        .footer-link a { color: #10b981; text-decoration: none; font-weight: 600; }
        @media print {
            body { background: #fff; color: #111; padding: 0; }
            .container { background: #fff; border: none; padding: 0; max-width: 100%; }
            h1 { color: #000; }
            .category-title { color: #000; border-bottom: 2px solid #000; }
            li { background: #f9f9f9; border: 1px solid #e5e5e5; color: #000; }
            .item-name { color: #000; }
            .item-qty { color: #000; }
            .pix-box { background: #fafafa; border: 1px solid #000; }
            .pix-title, .pix-key { color: #000; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏕️ Doações Faltantes - Retiro 2026</h1>
        <p class="subtitle">Lista atualizada do que ainda precisamos para o retiro.</p>
`

        if (groupKeys.length === 0) {
            html += `        <p>Todos os itens desta categoria já foram arrecadados! 🙌</p>\n`
        } else {
            groupKeys.forEach(category => {
                html += `        <div class="category-block">\n`
                html += `            <div class="category-title">📦 ${category}</div>\n`
                html += `            <ul>\n`
                groupedMissing[category].forEach(item => {
                    const target = parseQty(item.quantity)
                    const rec = parseQty(item.received || '')
                    let qtyStr = item.quantity
                    let subStr = ''

                    if (item.received && includePartialDetails && target.val > 0 && rec.val > 0) {
                        const diff = Math.round((target.val - rec.val) * 100) / 100
                        const unit = target.unit || rec.unit || ''
                        qtyStr = `Falta: ${diff} ${unit}`
                        subStr = `<span class="item-sub">Meta: ${item.quantity} | Recebido: ${item.received}</span>`
                    }

                    html += `                <li>
                    <div>
                        <span class="item-name">${item.name}</span>
                        ${subStr}
                    </div>
                    <span class="item-qty">${qtyStr}</span>
                </li>\n`
                })
                html += `            </ul>\n`
                html += `        </div>\n`
            })
        }

        if (includePix) {
            html += `
        <div class="pix-box">
            <div class="pix-title">💳 Chave PIX para Contribuição:</div>
            <div class="pix-key">${pixKey}</div>
        </div>\n`
        }

        if (includeLink) {
            html += `
        <div class="footer-link">
            Acompanhe a lista online: <a href="${donationUrl}" target="_blank">${donationUrl}</a>
        </div>\n`
        }

        html += `    </div>
</body>
</html>`

        return html
    }, [groupedMissing, includePix, includeLink, includePartialDetails])

    const handleCopyWhatsApp = () => {
        navigator.clipboard.writeText(whatsappText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
    }

    const handleCopyHtml = () => {
        navigator.clipboard.writeText(htmlSnippet)
        setCopiedHtml(true)
        setTimeout(() => setCopiedHtml(false), 2500)
    }

    const handleOpenWhatsApp = () => {
        const encoded = encodeURIComponent(whatsappText)
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(htmlSnippet)
            printWindow.document.close()
            printWindow.focus()
            setTimeout(() => {
                printWindow.print()
            }, 300)
        }
    }

    if (!isOpen) return null

    const totalMissingCount = missingItems.length

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-[#0e0a19] border border-white/10 w-full max-w-4xl rounded-3xl p-6 sm:p-8 relative shadow-2xl my-8 text-white flex flex-col max-h-[90vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-holi-secondary text-xs font-bold uppercase tracking-widest mb-1">
                            <Sparkles size={16} /> Exportador de Lista
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                            Disparar Lista de <span className="text-green-400">Doações</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Gere uma lista formatada pronta para enviar no WhatsApp ou exportar em HTML com os itens que ainda estão <strong className="text-white">faltando</strong>.
                        </p>
                    </div>

                    {/* Controls Bar */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {/* Category filter */}
                        <div>
                            <label className="block text-gray-400 font-bold uppercase text-[10px] mb-1.5 flex items-center gap-1">
                                <Filter size={12} /> Filtrar Categoria:
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:border-holi-secondary outline-none appearance-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Toggle PIX */}
                        <div className="flex items-center">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-black/30 p-2.5 rounded-xl border border-white/5 w-full hover:border-white/20 transition-all">
                                <input
                                    type="checkbox"
                                    checked={includePix}
                                    onChange={(e) => setIncludePix(e.target.checked)}
                                    className="rounded bg-black border-white/20 text-holi-secondary focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                                <span className="font-semibold text-gray-200">Incluir Chave PIX</span>
                            </label>
                        </div>

                        {/* Toggle Link */}
                        <div className="flex items-center">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-black/30 p-2.5 rounded-xl border border-white/5 w-full hover:border-white/20 transition-all">
                                <input
                                    type="checkbox"
                                    checked={includeLink}
                                    onChange={(e) => setIncludeLink(e.target.checked)}
                                    className="rounded bg-black border-white/20 text-holi-secondary focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                                <span className="font-semibold text-gray-200">Incluir Link do Site</span>
                            </label>
                        </div>

                        {/* Toggle Partial Details */}
                        <div className="flex items-center">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none bg-black/30 p-2.5 rounded-xl border border-white/5 w-full hover:border-white/20 transition-all">
                                <input
                                    type="checkbox"
                                    checked={includePartialDetails}
                                    onChange={(e) => setIncludePartialDetails(e.target.checked)}
                                    className="rounded bg-black border-white/20 text-holi-secondary focus:ring-0 w-4 h-4 cursor-pointer"
                                />
                                <span className="font-semibold text-gray-200">Detalhar Parciais</span>
                            </label>
                        </div>
                    </div>

                    {/* Stats Pill */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold text-xs px-3 py-1 rounded-full">
                                {totalMissingCount} {totalMissingCount === 1 ? 'item pendente' : 'itens pendentes'}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({Object.keys(groupedMissing).length} {Object.keys(groupedMissing).length === 1 ? 'categoria' : 'categorias'})
                            </span>
                        </div>

                        {/* Format Tabs */}
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1 text-xs">
                            <button
                                onClick={() => setActiveTab('whatsapp')}
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === 'whatsapp' ? 'bg-green-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <MessageCircle size={14} /> WhatsApp
                            </button>
                            <button
                                onClick={() => setActiveTab('html')}
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === 'html' ? 'bg-holi-secondary text-black shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Code size={14} /> Código HTML
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${activeTab === 'preview' ? 'bg-white text-black shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <FileText size={14} /> Lista Visual
                            </button>
                        </div>
                    </div>

                    {/* Tab Contents */}
                    <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[380px] bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-mono text-gray-300">
                        {activeTab === 'whatsapp' && (
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-200">
                                {whatsappText}
                            </pre>
                        )}

                        {activeTab === 'html' && (
                            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300 select-all">
                                {htmlSnippet}
                            </pre>
                        )}

                        {activeTab === 'preview' && (
                            <div className="space-y-6 font-sans">
                                {Object.keys(groupedMissing).length === 0 ? (
                                    <div className="text-center py-10 text-gray-400">
                                        Nenhum item pendente nesta categoria! 🎉
                                    </div>
                                ) : (
                                    Object.keys(groupedMissing).sort().map(cat => (
                                        <div key={cat} className="space-y-2">
                                            <h4 className="font-bold text-sm text-green-400 uppercase tracking-wider border-b border-white/10 pb-1 flex items-center gap-2">
                                                📦 {cat}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {groupedMissing[cat].map(item => {
                                                    const target = parseQty(item.quantity)
                                                    const rec = parseQty(item.received || '')
                                                    const hasPartial = item.received && target.val > 0 && rec.val > 0

                                                    return (
                                                        <div key={item.id} className="bg-white/5 border border-white/5 p-2.5 rounded-xl flex justify-between items-center">
                                                            <div>
                                                                <div className="font-semibold text-white text-xs">{item.name}</div>
                                                                {hasPartial && includePartialDetails && (
                                                                    <div className="text-[10px] text-gray-400">
                                                                        Meta: {item.quantity} | Já temos: {item.received}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-amber-400 font-mono font-bold text-xs text-right">
                                                                {hasPartial && includePartialDetails
                                                                    ? `Falta ${Math.round((target.val - rec.val) * 100) / 100} ${target.unit || ''}`
                                                                    : item.quantity
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}

                                {includePix && (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                                        <div className="text-amber-400 font-bold text-xs uppercase">Chave PIX</div>
                                        <div className="font-mono text-sm text-white font-bold mt-0.5">{pixKey}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3 justify-end items-center">
                        <button
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                            Fechar
                        </button>

                        <button
                            onClick={handlePrint}
                            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                            title="Imprimir / Salvar em PDF"
                        >
                            <Printer size={16} /> Imprimir / PDF
                        </button>

                        {activeTab === 'html' ? (
                            <button
                                onClick={handleCopyHtml}
                                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${copiedHtml ? 'bg-green-500 text-black' : 'bg-holi-secondary text-black hover:bg-white'}`}
                            >
                                {copiedHtml ? <Check size={16} /> : <Copy size={16} />}
                                {copiedHtml ? 'HTML Copiado!' : 'Copiar Código HTML'}
                            </button>
                        ) : (
                            <button
                                onClick={handleCopyWhatsApp}
                                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${copied ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Texto Copiado!' : 'Copiar Texto WhatsApp'}
                            </button>
                        )}

                        <button
                            onClick={handleOpenWhatsApp}
                            className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:scale-105"
                        >
                            <Send size={16} /> Abrir no WhatsApp
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default DonationShareModal
