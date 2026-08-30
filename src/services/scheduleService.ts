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
        subtitle: 'Acolhida & Início da Jornada',
        tag: '25/09',
        color: 'from-fuchsia-500 to-pink-600',
        order_num: 1,
        events: [
            { id: '1', day_id: 'sexta', time: '19h00', title: 'Acolhida e abertura do retiro', category: 'welcome', highlight: true, order_num: 1 },
            { id: '2', day_id: 'sexta', time: '20h30', title: 'Jantar', category: 'meal', highlight: false, order_num: 2 },
            { id: '3', day_id: 'sexta', time: '21h30', Momento: 'Momento de oração e Adoração', title: 'Momento de oração e Adoração', category: 'prayer', highlight: true, order_num: 3 } as any,
            { id: '4', day_id: 'sexta', time: '22h30', title: 'Lanche', category: 'meal', highlight: false, order_num: 4 },
            { id: '5', day_id: 'sexta', time: '23h00', title: 'Banho e descanso', category: 'rest', highlight: false, order_num: 5 }
        ]
    },
    {
        id: 'sabado',
        day_name: 'Sábado',
        date_text: '26 de Setembro de 2026',
        subtitle: 'Imersão, Atividades & Celebração',
        tag: '26/09',
        color: 'from-amber-400 to-orange-500',
        order_num: 2,
        events: [
            { id: '6', day_id: 'sabado', time: '08h00', title: 'Recepção e café da manhã', category: 'meal', highlight: false, order_num: 1 },
            { id: '7', day_id: 'sabado', time: '08h30', title: 'Início das atividades', category: 'activity', highlight: true, order_num: 2 },
            { id: '8', day_id: 'sabado', time: '10h25', title: 'Intervalo', category: 'break', highlight: false, order_num: 3 },
            { id: '9', day_id: 'sabado', time: '12h30', title: 'Almoço', category: 'meal', highlight: false, order_num: 4 },
            { id: '10', day_id: 'sabado', time: '14h30', title: 'Retorno das atividades', category: 'activity', highlight: false, order_num: 5 },
            { id: '11', day_id: 'sabado', time: '16h50', title: 'Intervalo', category: 'break', highlight: false, order_num: 6 },
            { id: '12', day_id: 'sabado', time: '20h00', title: 'Tempo livre e organização pessoal', category: 'rest', highlight: false, order_num: 7 },
            { id: '13', day_id: 'sabado', time: '20h30', title: 'Jantar', category: 'meal', highlight: false, order_num: 8 },
            { id: '14', day_id: 'sabado', time: '21h30', title: 'Adoração', category: 'prayer', highlight: true, order_num: 9 },
            { id: '15', day_id: 'sabado', time: '22h30', title: 'Lanche', category: 'meal', highlight: false, order_num: 10 },
            { id: '16', day_id: 'sabado', time: '23h00', title: 'Banho e descanso', category: 'rest', highlight: false, order_num: 11 }
        ]
    },
    {
        id: 'domingo',
        day_name: 'Domingo',
        date_text: '27 de Setembro de 2026',
        subtitle: 'Ápice da Fé & Missa Solene',
        tag: '27/09',
        color: 'from-cyan-400 to-blue-600',
        order_num: 3,
        events: [
            { id: '17', day_id: 'domingo', time: '07h00', title: 'Despertar', category: 'rest', highlight: false, order_num: 1 },
            { id: '18', day_id: 'domingo', time: '07h30', title: 'Café da manhã', category: 'meal', highlight: false, order_num: 2 },
            { id: '19', day_id: 'domingo', time: '09h00', title: 'Início das atividades', category: 'activity', highlight: false, order_num: 3 },
            { id: '20', day_id: 'domingo', time: '10h30', title: 'Intervalo', category: 'break', highlight: false, order_num: 4 },
            { id: '21', day_id: 'domingo', time: '12h30', title: 'Almoço', category: 'meal', highlight: false, order_num: 5 },
            { id: '22', day_id: 'domingo', time: '14h00', title: 'Retorno das atividades', category: 'activity', highlight: false, order_num: 6 },
            { id: '23', day_id: 'domingo', time: '15h00', title: 'Santa Missa com Dom José', category: 'mass', highlight: true, order_num: 7 },
            { id: '24', day_id: 'domingo', time: '16h00', title: 'Intervalo', category: 'break', highlight: false, order_num: 8 },
            { id: '25', day_id: 'domingo', time: '16h45', title: 'Retorno das atividades', category: 'activity', highlight: false, order_num: 9 },
            { id: '26', day_id: 'domingo', time: 'Após as atividades', title: 'Encerramento previsto do retiro', category: 'welcome', highlight: true, order_num: 10 }
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
