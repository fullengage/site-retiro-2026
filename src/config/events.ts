import { EventItem } from '../types/database'

export const DEFAULT_EVENTS: EventItem[] = [
    {
        id: '51a7488d-740a-4237-b059-73093267c201',
        slug: 'carnaval-2026',
        name: 'Retiro de Carnaval 2026',
        year: 2026,
        start_date: '2026-02-14',
        end_date: '2026-02-17',
        location: 'Comunidade Voz de Deus - NH/SP',
        status: 'completed',
        kit_options: [
            { id: 'kit_50', name: 'Kit 01 - Inscrição (R$ 50,00)', price: 50, includesTshirt: false },
            { id: 'kit_100', name: 'Kit 02 - Inscrição + 1 Camiseta (R$ 100,00)', price: 100, includesTshirt: true, tshirtCount: 1 },
            { id: 'kit_120', name: 'Kit 03 - Inscrição + 2 Camisetas (R$ 120,00)', price: 120, includesTshirt: true, tshirtCount: 2 }
        ],
        pix_info: {
            key: '255.985.138-54',
            keyType: 'CPF',
            receiver: 'Richard Wagner de Oliveira Portela',
            bank: 'Banco',
            whatsappSupport: '5511934044167'
        }
    },
    {
        id: '4e23a8cf-d780-4a4b-9676-9bbccad74035',
        slug: 'adonai-2026',
        name: 'Retiro ADONAI 2026',
        year: 2026,
        start_date: '2026-09-25',
        end_date: '2026-09-27',
        location: 'Escola FAF - Novo Horizonte/SP',
        status: 'active',
        kit_options: [
            {
                id: 'adonai_sem_camiseta_50',
                name: 'ADONAI — SEM CAMISETA (R$ 50,00)',
                price: 50,
                includesTshirt: false,
            },
            {
                id: 'adonai_com_camiseta_70',
                name: 'ADONAI — COM CAMISETA (Promocional até 10/09) (R$ 70,00)',
                price: 70,
                includesTshirt: true,
                tshirtCount: 1,
            }
        ],
        pix_info: {
            key: '255.985.138-54',
            keyType: 'CPF',
            receiver: 'Richard Wagner de Oliveira Portela',
            bank: 'Banco',
            whatsappSupport: '5511934044167'
        }
    },
    {
        id: 'b0c365e5-8128-4725-9e49-e80c5483c5c2',
        slug: 'ato-2026',
        name: 'Retiro ATO 2026',
        year: 2026,
        start_date: '2026-10-10',
        end_date: '2026-10-12',
        location: 'Comunidade Voz de Deus - NH/SP',
        status: 'upcoming',
        kit_options: [
            { id: 'kit_50', name: 'Kit 01 - Inscrição (R$ 50,00)', price: 50, includesTshirt: false }
        ],
        pix_info: {
            key: '255.985.138-54',
            keyType: 'CPF',
            receiver: 'Richard Wagner de Oliveira Portela',
            bank: 'Banco',
            whatsappSupport: '5511934044167'
        }
    }
]

export const CURRENT_ACTIVE_SLUG = 'adonai-2026'
