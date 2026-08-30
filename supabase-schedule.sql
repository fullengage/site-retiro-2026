-- Migration: schedule_days and schedule_items
-- Criação das tabelas do cronograma dinâmico do Retiro 2026

CREATE TABLE IF NOT EXISTS public.schedule_days (
    id TEXT PRIMARY KEY,
    day_name TEXT NOT NULL,
    date_text TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    tag TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'from-fuchsia-500 to-pink-600',
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id TEXT NOT NULL REFERENCES public.schedule_days(id) ON DELETE CASCADE,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'activity',
    highlight BOOLEAN NOT NULL DEFAULT false,
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.schedule_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
DROP POLICY IF EXISTS "Public read schedule_days" ON public.schedule_days;
CREATE POLICY "Public read schedule_days" ON public.schedule_days
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read schedule_items" ON public.schedule_items;
CREATE POLICY "Public read schedule_items" ON public.schedule_items
    FOR SELECT USING (true);

-- Políticas de Escrita para Usuários Autenticados
DROP POLICY IF EXISTS "Authenticated write schedule_days" ON public.schedule_days;
CREATE POLICY "Authenticated write schedule_days" ON public.schedule_days
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated write schedule_items" ON public.schedule_items;
CREATE POLICY "Authenticated write schedule_items" ON public.schedule_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas de Fallback para anon em caso de cliente
DROP POLICY IF EXISTS "Anon write schedule_days" ON public.schedule_days;
CREATE POLICY "Anon write schedule_days" ON public.schedule_days
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon write schedule_items" ON public.schedule_items;
CREATE POLICY "Anon write schedule_items" ON public.schedule_items
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Seed Inicial de Dias
INSERT INTO public.schedule_days (id, day_name, date_text, subtitle, tag, color, order_num)
VALUES
    ('sexta', 'Sexta-feira', '25 de Setembro de 2026', 'Acolhida & Início da Jornada', '25/09', 'from-fuchsia-500 to-pink-600', 1),
    ('sabado', 'Sábado', '26 de Setembro de 2026', 'Imersão, Atividades & Celebração', '26/09', 'from-amber-400 to-orange-500', 2),
    ('domingo', 'Domingo', '27 de Setembro de 2026', 'Ápice da Fé & Missa Solene', '27/09', 'from-cyan-400 to-blue-600', 3)
ON CONFLICT (id) DO UPDATE SET
    day_name = EXCLUDED.day_name,
    date_text = EXCLUDED.date_text,
    subtitle = EXCLUDED.subtitle,
    tag = EXCLUDED.tag,
    color = EXCLUDED.color,
    order_num = EXCLUDED.order_num;

-- Seed Inicial de Eventos - Sexta
INSERT INTO public.schedule_items (day_id, time, title, category, highlight, order_num)
VALUES
    ('sexta', '19h00', 'Acolhida e abertura do retiro', 'welcome', true, 1),
    ('sexta', '20h30', 'Jantar', 'meal', false, 2),
    ('sexta', '21h30', 'Momento de oração e Adoração', 'prayer', true, 3),
    ('sexta', '22h30', 'Lanche', 'meal', false, 4),
    ('sexta', '23h00', 'Banho e descanso', 'rest', false, 5)
ON CONFLICT DO NOTHING;

-- Seed Inicial de Eventos - Sábado
INSERT INTO public.schedule_items (day_id, time, title, category, highlight, order_num)
VALUES
    ('sabado', '08h00', 'Recepção e café da manhã', 'meal', false, 1),
    ('sabado', '08h30', 'Início das atividades', 'activity', true, 2),
    ('sabado', '10h25', 'Intervalo', 'break', false, 3),
    ('sabado', '12h30', 'Almoço', 'meal', false, 4),
    ('sabado', '14h30', 'Retorno das atividades', 'activity', false, 5),
    ('sabado', '16h50', 'Intervalo', 'break', false, 6),
    ('sabado', '20h00', 'Tempo livre e organização pessoal', 'rest', false, 7),
    ('sabado', '20h30', 'Jantar', 'meal', false, 8),
    ('sabado', '21h30', 'Adoração', 'prayer', true, 9),
    ('sabado', '22h30', 'Lanche', 'meal', false, 10),
    ('sabado', '23h00', 'Banho e descanso', 'rest', false, 11)
ON CONFLICT DO NOTHING;

-- Seed Inicial de Eventos - Domingo
INSERT INTO public.schedule_items (day_id, time, title, category, highlight, order_num)
VALUES
    ('domingo', '07h00', 'Despertar', 'rest', false, 1),
    ('domingo', '07h30', 'Café da manhã', 'meal', false, 2),
    ('domingo', '09h00', 'Início das atividades', 'activity', false, 3),
    ('domingo', '10h30', 'Intervalo', 'break', false, 4),
    ('domingo', '12h30', 'Almoço', 'meal', false, 5),
    ('domingo', '14h00', 'Retorno das atividades', 'activity', false, 6),
    ('domingo', '15h00', 'Santa Missa com Dom José', 'mass', true, 7),
    ('domingo', '16h00', 'Intervalo', 'break', false, 8),
    ('domingo', '16h45', 'Retorno das atividades', 'activity', false, 9),
    ('domingo', 'Após as atividades', 'Encerramento previsto do retiro', 'welcome', true, 10)
ON CONFLICT DO NOTHING;
