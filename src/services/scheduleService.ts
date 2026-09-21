import { supabase } from '@/lib/supabase'
import {
    DaySchedule,
    ScheduleItem,
    CreateScheduleItemDTO,
    UpdateScheduleItemDTO,
    UpdateDayDTO
} from '@/types/schedule'

export const FALLBACK_SCHEDULE: DaySchedule[] = [
    {
        id: 'sexta',
        day_name: 'Sexta-feira',
        date_text: '25 de Setembro de 2026',
        subtitle: 'Acolhida, Integração & Festa a Fantasia',
        tag: '25/09',
        color: 'from-fuchsia-500 to-pink-600',
        order_num: 1,
        events: [
            { id: '1', day_id: 'sexta', time: '19h00', title: 'Acolhida e abertura do retiro (Equipe)', category: 'welcome', highlight: true, order_num: 1 },
            { id: '2', day_id: 'sexta', time: '19h30', title: 'Introdução / orientações (Richard Wagner)', category: 'activity', highlight: false, order_num: 2 },
            { id: '3', day_id: 'sexta', time: '19h40', title: 'Dinâmica de integração e formação dos grupos (Equipe)', category: 'activity', highlight: false, order_num: 3 },
            { id: '4', day_id: 'sexta', time: '20h10', title: 'Testemunho — "Miojo ou macarronada?" (Fl 2,3) (Maria Fernanda)', category: 'activity', highlight: true, order_num: 4 },
            { id: '5', day_id: 'sexta', time: '20h30', title: 'Jantar (Cozinha)', category: 'meal', highlight: false, order_num: 5 },
            { id: '6', day_id: 'sexta', time: '21h15', title: 'Teatro Minecraft (Equipe de teatro)', category: 'activity', highlight: true, order_num: 6 },
            { id: '7', day_id: 'sexta', time: '22h00', title: 'Festa a Fantasia (DJ / Música)', category: 'activity', highlight: true, order_num: 7 },
            { id: '8', day_id: 'sexta', time: '23h00', title: 'Lanche (Cozinha)', category: 'meal', highlight: false, order_num: 8 },
            { id: '9', day_id: 'sexta', time: '23h30', title: 'Banho e descanso (Anjos)', category: 'rest', highlight: false, order_num: 9 }
        ]
    },
    {
        id: 'sabado',
        day_name: 'Sábado',
        date_text: '26 de Setembro de 2026',
        subtitle: 'Imersão, Cruz & Noite de Adoração',
        tag: '26/09',
        color: 'from-amber-400 to-orange-500',
        order_num: 2,
        events: [
            { id: '10', day_id: 'sabado', time: '07h30', title: 'Despertar (Anjos)', category: 'rest', highlight: false, order_num: 1 },
            { id: '11', day_id: 'sabado', time: '08h00', title: 'Café da manhã (Cozinha)', category: 'meal', highlight: false, order_num: 2 },
            { id: '12', day_id: 'sabado', time: '08h30', title: 'Dança de abertura / oração da manhã (Equipe de dança)', category: 'prayer', highlight: false, order_num: 3 },
            { id: '13', day_id: 'sabado', time: '08h50', title: '1ª Pregação — 7 características do amor de Deus (Pedro)', category: 'activity', highlight: true, order_num: 4 },
            { id: '14', day_id: 'sabado', time: '09h30', title: 'Momento de oração (Comunidade Voz de Deus)', category: 'prayer', highlight: true, order_num: 5 },
            { id: '15', day_id: 'sabado', time: '10h10', title: 'Apresentação dos Anjos — círculos (Apresentador + anjos)', category: 'activity', highlight: false, order_num: 6 },
            { id: '16', day_id: 'sabado', time: '10h35', title: 'Intervalo', category: 'break', highlight: false, order_num: 7 },
            { id: '17', day_id: 'sabado', time: '10h45', title: 'Teatro (Equipe de teatro)', category: 'activity', highlight: false, order_num: 8 },
            { id: '18', day_id: 'sabado', time: '10h50', title: '2ª Pregação — Não julgueis para não serdes julgados (Jo 8,15-16) (Felipe)', category: 'activity', highlight: true, order_num: 9 },
            { id: '19', day_id: 'sabado', time: '11h40', title: 'Momento de oração (Comunidade Voz de Deus)', category: 'prayer', highlight: true, order_num: 10 },
            { id: '20', day_id: 'sabado', time: '12h30', title: 'Almoço (Cozinha)', category: 'meal', highlight: false, order_num: 11 },
            { id: '21', day_id: 'sabado', time: '14h00', title: 'PIQUE-BANDEIRA COM ÁGUA (Equipe + monitores de grupo)', category: 'activity', highlight: true, order_num: 12 },
            { id: '22', day_id: 'sabado', time: '15h00', title: 'Banhos revezados + Conversa de meninos/meninas (Wagner / Flávia + Julia)', category: 'activity', highlight: false, order_num: 13 },
            { id: '23', day_id: 'sabado', time: '16h00', title: 'Dança (Equipe de dança)', category: 'activity', highlight: false, order_num: 14 },
            { id: '24', day_id: 'sabado', time: '16h15', title: '3ª Pregação — O teatro como meio de evangelização (Raphael Mello)', category: 'activity', highlight: true, order_num: 15 },
            { id: '25', day_id: 'sabado', time: '17h00', title: 'Teatro (Equipe de teatro)', category: 'activity', highlight: false, order_num: 16 },
            { id: '26', day_id: 'sabado', time: '17h05', title: 'Testemunho — Não julgueis (Jo 8,15-16) (Felipe)', category: 'activity', highlight: false, order_num: 17 },
            { id: '27', day_id: 'sabado', time: '17h25', title: '4ª Pregação — Jovem santo: os jovens na fornalha (Dn 3,8-30) (Julia)', category: 'activity', highlight: true, order_num: 18 },
            { id: '28', day_id: 'sabado', time: '18h05', title: 'Intervalo + lanche (Cozinha)', category: 'meal', highlight: false, order_num: 19 },
            { id: '29', day_id: 'sabado', time: '18h25', title: '5ª Pregação — Amor sem cruz nunca será amor (João)', category: 'activity', highlight: true, order_num: 20 },
            { id: '30', day_id: 'sabado', time: '19h05', title: 'MOMENTO DA CRUZ (Comunidade Voz de Deus)', category: 'prayer', highlight: true, order_num: 21 },
            { id: '31', day_id: 'sabado', time: '20h05', title: 'Jantar (Cozinha)', category: 'meal', highlight: false, order_num: 22 },
            { id: '32', day_id: 'sabado', time: '21h00', title: 'Dança (Equipe de dança)', category: 'activity', highlight: false, order_num: 23 },
            { id: '33', day_id: 'sabado', time: '21h15', title: '6ª Pregação', category: 'activity', highlight: true, order_num: 24 },
            { id: '34', day_id: 'sabado', time: '21h40', title: 'Adoração ao Santíssimo (Equipe de música)', category: 'prayer', highlight: true, order_num: 25 },
            { id: '35', day_id: 'sabado', time: '22h35', title: 'Lanche (Cozinha)', category: 'meal', highlight: false, order_num: 26 },
            { id: '36', day_id: 'sabado', time: '23h00', title: 'Descanso (Anjos)', category: 'rest', highlight: false, order_num: 27 }
        ]
    },
    {
        id: 'domingo',
        day_name: 'Domingo',
        date_text: '27 de Setembro de 2026',
        subtitle: 'Santa Missa, Maria, Adoração & Holi',
        tag: '27/09',
        color: 'from-cyan-400 to-blue-600',
        order_num: 3,
        events: [
            { id: '37', day_id: 'domingo', time: '06h15', title: 'Despertar (Anjos)', category: 'rest', highlight: false, order_num: 1 },
            { id: '38', day_id: 'domingo', time: '06h40', title: 'Saída para a Igreja Matriz (Equipe)', category: 'rest', highlight: false, order_num: 2 },
            { id: '39', day_id: 'domingo', time: '07h00', title: 'Santa Missa na Igreja Matriz São José (Pe. celebrante)', category: 'mass', highlight: true, order_num: 3 },
            { id: '40', day_id: 'domingo', time: '08h15', title: 'Retorno ao local do retiro (Equipe)', category: 'rest', highlight: false, order_num: 4 },
            { id: '41', day_id: 'domingo', time: '08h30', title: 'Café da manhã (Cozinha)', category: 'meal', highlight: false, order_num: 5 },
            { id: '42', day_id: 'domingo', time: '09h00', title: 'Dança (Equipe de dança)', category: 'activity', highlight: false, order_num: 6 },
            { id: '43', day_id: 'domingo', time: '09h15', title: 'Teatro (Equipe de teatro)', category: 'activity', highlight: false, order_num: 7 },
            { id: '44', day_id: 'domingo', time: '09h20', title: '7ª Pregação (Vitor — Jovens Sarados)', category: 'activity', highlight: true, order_num: 8 },
            { id: '45', day_id: 'domingo', time: '10h20', title: 'Intervalo', category: 'break', highlight: false, order_num: 9 },
            { id: '46', day_id: 'domingo', time: '10h40', title: 'Momento de Nossa Senhora (Vitor — Jovens Sarados)', category: 'prayer', highlight: true, order_num: 10 },
            { id: '47', day_id: 'domingo', time: '11h25', title: 'ADORAÇÃO FINAL (Equipe de música)', category: 'prayer', highlight: true, order_num: 11 },
            { id: '48', day_id: 'domingo', time: '12h30', title: 'Almoço (Cozinha)', category: 'meal', highlight: false, order_num: 12 },
            { id: '49', day_id: 'domingo', time: '14h00', title: 'HOLI — A FESTA DAS CORES (Equipe)', category: 'activity', highlight: true, order_num: 13 },
            { id: '50', day_id: 'domingo', time: '15h00', title: 'Banho e organização pessoal (Anjos)', category: 'rest', highlight: false, order_num: 14 },
            { id: '51', day_id: 'domingo', time: '15h40', title: 'Bênção e envio (Pe. / Equipe)', category: 'prayer', highlight: true, order_num: 15 },
            { id: '52', day_id: 'domingo', time: '16h00', title: 'Encerramento previsto do retiro', category: 'welcome', highlight: true, order_num: 16 }
        ]
    }
]

export const scheduleService = {
    /**
     * Busca os dias e todos os eventos ordenados
     */
    async getSchedule(): Promise<{ data: DaySchedule[]; error: Error | null }> {
        try {
            // 1. Busca os dias
            const { data: days, error: daysError } = await supabase
                .from('schedule_days')
                .select('*')
                .order('order_num', { ascending: true })

            if (daysError) throw daysError

            // 2. Busca os itens
            const { data: items, error: itemsError } = await supabase
                .from('schedule_items')
                .select('*')
                .order('order_num', { ascending: true })
                .order('created_at', { ascending: true })

            if (itemsError) throw itemsError

            if (!days || days.length === 0) {
                return { data: FALLBACK_SCHEDULE, error: null }
            }

            // Agrupa itens por dia
            const daysWithEvents: DaySchedule[] = days.map((day) => ({
                id: day.id,
                day_name: day.day_name,
                date_text: day.date_text,
                subtitle: day.subtitle,
                tag: day.tag,
                color: day.color || 'from-fuchsia-500 to-pink-600',
                order_num: day.order_num || 0,
                created_at: day.created_at,
                events: (items || [])
                    .filter((item) => item.day_id === day.id)
                    .map((item) => ({
                        id: item.id,
                        day_id: item.day_id,
                        time: item.time,
                        title: item.title,
                        category: item.category,
                        highlight: item.highlight,
                        order_num: item.order_num,
                        created_at: item.created_at
                    }))
            }))

            return { data: daysWithEvents, error: null }
        } catch (err: any) {
            console.error('Erro ao buscar cronograma do Supabase:', err)
            return { data: FALLBACK_SCHEDULE, error: err instanceof Error ? err : new Error(String(err)) }
        }
    },

    /**
     * Cria um novo item de horário no cronograma
     */
    async createItem(payload: CreateScheduleItemDTO): Promise<{ data: ScheduleItem | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('schedule_items')
                .insert([
                    {
                        day_id: payload.day_id,
                        time: payload.time,
                        title: payload.title,
                        category: payload.category,
                        highlight: payload.highlight,
                        order_num: payload.order_num ?? 0
                    }
                ])
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (err: any) {
            return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
        }
    },

    /**
     * Atualiza um item existente
     */
    async updateItem(id: string, payload: UpdateScheduleItemDTO): Promise<{ data: ScheduleItem | null; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('schedule_items')
                .update(payload)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (err: any) {
            return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
        }
    },

    /**
     * Exclui um item
     */
    async deleteItem(id: string): Promise<{ success: boolean; error: Error | null }> {
        try {
            const { error } = await supabase
                .from('schedule_items')
                .delete()
                .eq('id', id)

            if (error) throw error
            return { success: true, error: null }
        } catch (err: any) {
            return { success: false, error: err instanceof Error ? err : new Error(String(err)) }
        }
    },

    /**
     * Atualiza metadados do dia (ex: data, subtítulo, cor)
     */
    async updateDay(id: string, payload: UpdateDayDTO): Promise<{ data: any; error: Error | null }> {
        try {
            const { data, error } = await supabase
                .from('schedule_days')
                .update(payload)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return { data, error: null }
        } catch (err: any) {
            return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
        }
    }
}
