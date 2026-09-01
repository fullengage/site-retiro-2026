import { EventItem } from '../types/database'

export const DEFAULT_EVENTS: EventItem[] = [
    {
        id: 'carnaval-2026-default-id',
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
            whatsappSupport: '5511955501090'
        }
    },
    {
        id: 'adonai-2026-default-id',
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
            whatsappSupport: '5511955501090'
        }
    },
    {
        id: 'ato-2026-default-id',
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
            whatsappSupport: '5511955501090'
        }
    }
]

export const CURRENT_ACTIVE_SLUG = 'adonai-2026'
