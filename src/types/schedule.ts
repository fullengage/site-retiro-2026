export type ScheduleCategory =
    | 'welcome'
    | 'meal'
    | 'prayer'
    | 'activity'
    | 'break'
    | 'mass'
    | 'rest'

export interface ScheduleItem {
    id: string
    day_id: string
    time: string
    title: string
    category: ScheduleCategory
    highlight: boolean
    order_num: number
    created_at?: string
}

export interface DaySchedule {
    id: string
    day_name: string
    date_text: string
    subtitle: string
    tag: string
    color: string
    order_num: number
    created_at?: string
    events: ScheduleItem[]
}

export interface CreateScheduleItemDTO {
    day_id: string
    time: string
    title: string
    category: ScheduleCategory
    highlight: boolean
    order_num?: number
}

export interface UpdateScheduleItemDTO {
    time?: string
    title?: string
    category?: ScheduleCategory
    highlight?: boolean
    order_num?: number
}

export interface UpdateDayDTO {
    day_name?: string
    date_text?: string
    subtitle?: string
    tag?: string
    color?: string
    order_num?: number
}
