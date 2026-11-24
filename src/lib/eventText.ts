import type { EventKitOption, EventScheduleDay } from '../types/database'

// ponytail: kits e programação editados como texto (1 linha por item) em vez de formulários aninhados

// "Nome | 30" por linha
export const parseKits = (text: string): EventKitOption[] =>
    text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
        const [name, price] = line.split('|').map(s => s.trim())
        return { id: `kit_${i + 1}_${Number(price) || 0}`, name, price: Number(price) || 0, includesTshirt: false }
    })

export const kitsToText = (kits: EventKitOption[]) => kits.map(k => `${k.name} | ${k.price}`).join('\n')

// "# Sábado – 12/12 | das 14h às 20h" abre um dia; as linhas seguintes são as atividades
export const parseSchedule = (text: string): EventScheduleDay[] => {
    const days: EventScheduleDay[] = []
    text.split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
        if (line.startsWith('#')) {
            const [title, hours] = line.slice(1).split('|').map(s => s.trim())
            days.push({ title, hours: hours || undefined, items: [] })
        } else if (days.length) {
            days[days.length - 1].items.push(line.replace(/^[*\-•]\s*/, ''))
        }
    })
    return days
}

export const scheduleToText = (days: EventScheduleDay[] = []) =>
    days.map(d => [`# ${d.title}${d.hours ? ` | ${d.hours}` : ''}`, ...d.items].join('\n')).join('\n\n')
