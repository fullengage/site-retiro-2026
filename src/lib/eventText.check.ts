// Self-check: npx esbuild src/lib/eventText.check.ts --bundle --platform=node | node
import { parseKits, kitsToText, parseSchedule, scheduleToText } from './eventText'
import assert from 'node:assert'

const kits = parseKits('DNA — Inscrição adulto (R$ 30,00) | 30\n\n Outro | 0 ')
assert.deepEqual(kits.map(k => [k.name, k.price]), [['DNA — Inscrição adulto (R$ 30,00)', 30], ['Outro', 0]])
assert.equal(kitsToText(kits), 'DNA — Inscrição adulto (R$ 30,00) | 30\nOutro | 0')

const text = '# Sábado – 12/12 | das 14h às 20h\n* Preparação da cozinha\nHot-dog\n\n# Domingo – 13/12\n- Missa na Matriz'
const days = parseSchedule(text)
assert.deepEqual(days, [
    { title: 'Sábado – 12/12', hours: 'das 14h às 20h', items: ['Preparação da cozinha', 'Hot-dog'] },
    { title: 'Domingo – 13/12', hours: undefined, items: ['Missa na Matriz'] }
])
assert.deepEqual(parseSchedule(scheduleToText(days)), days)
console.log('ok')
