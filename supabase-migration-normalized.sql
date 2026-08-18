-- ==============================================================================
-- SISTEMA MULTI-RETIROS - COMUNIDADE VOZ DE DEUS
-- Script de Criação de Tabelas Normalizadas + Migração do Histórico do Carnaval
-- ==============================================================================

-- 1. TABELA DE PARTICIPANTES (Perfil permanente da pessoa ao longo dos anos)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    birth_date TEXT,
    gender TEXT,
    address TEXT,
    city TEXT,
    parish TEXT,
    emergency_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para busca rápida de participantes
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_phone ON participants(phone);
CREATE INDEX IF NOT EXISTS idx_participants_cpf ON participants(cpf);


-- 2. TABELA DE EVENTOS / RETIROS (Carnaval, ADONAI, ATO ao longo dos anos)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL, -- ex: 'carnaval-2026', 'adonai-2026', 'ato-2026'
    name TEXT NOT NULL,        -- ex: 'Retiro ADONAI 2026'
    year INTEGER NOT NULL,     -- 2026
    start_date DATE,
    end_date DATE,
    location TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed', 'cancelled')),
    kit_options JSONB DEFAULT '[]'::jsonb,
    pix_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);


-- 3. TABELA DE INSCRIÇÕES (Vínculo de uma Pessoa com um Retiro específico)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    kit_option TEXT NOT NULL,
    tshirt_size TEXT,
    tshirt_size_2 TEXT,
    staying_on_site BOOLEAN DEFAULT false,
    assigned_angel TEXT,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmada', 'Cancelada', 'Presente')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- REGRA DE OURO: A mesma pessoa só se inscreve uma vez no mesmo retiro
    CONSTRAINT uq_participant_event UNIQUE (participant_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON registrations(participant_id);


-- 4. TABELA DE PAGAMENTOS (Cobrança e comprovante de cada inscrição)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago', 'Cancelado', 'Reembolsado')),
    payment_method TEXT DEFAULT 'PIX',
    payment_receipt_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);


-- ==============================================================================
-- 5. CADASTRO INICIAL DOS RETIROS DE 2026
-- ==============================================================================

-- Carnaval 2026 (Concluído)
INSERT INTO events (slug, name, year, start_date, end_date, location, status, kit_options, pix_info)
VALUES (
    'carnaval-2026',
    'Retiro de Carnaval 2026',
    2026,
    '2026-02-14',
    '2026-02-17',
    'Comunidade Voz de Deus - NH/SP',
    'completed',
    '[
        {"id": "kit_50", "name": "Kit 01 - Inscrição", "price": 50, "includesTshirt": false},
        {"id": "kit_100", "name": "Kit 02 - Inscrição + 1 Camiseta", "price": 100, "includesTshirt": true, "tshirtCount": 1},
        {"id": "kit_200", "name": "Kit 03 - Inscrição + 2 Camisetas", "price": 200, "includesTshirt": true, "tshirtCount": 2}
    ]'::jsonb,
    '{
        "key": "255.985.138-54",
        "keyType": "CPF",
        "receiver": "Richard Wagner de Oliveira Portela",
        "bank": "Banco",
        "whatsappSupport": "5511955501090"
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status;

-- ADONAI 2026 (ATIVO - Inscrições Abertas)
INSERT INTO events (slug, name, year, start_date, end_date, location, status, kit_options, pix_info)
VALUES (
    'adonai-2026',
    'Retiro ADONAI 2026',
    2026,
    '2026-06-20',
    '2026-06-22',
    'Comunidade Voz de Deus - NH/SP',
    'active',
    '[
        {"id": "kit_50", "name": "Kit 01 - Inscrição (R$ 50,00)", "price": 50, "includesTshirt": false},
        {"id": "kit_100", "name": "Kit 02 - Inscrição + 1 Camiseta (R$ 100,00)", "price": 100, "includesTshirt": true, "tshirtCount": 1},
        {"id": "kit_200", "name": "Kit 03 - Inscrição + 2 Camisetas (R$ 200,00)", "price": 200, "includesTshirt": true, "tshirtCount": 2}
    ]'::jsonb,
    '{
        "key": "255.985.138-54",
        "keyType": "CPF",
        "receiver": "Richard Wagner de Oliveira Portela",
        "bank": "Banco",
        "whatsappSupport": "5511955501090"
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status;

-- ATO 2026 (Próximo)
INSERT INTO events (slug, name, year, start_date, end_date, location, status, kit_options, pix_info)
VALUES (
    'ato-2026',
    'Retiro ATO 2026',
    2026,
    '2026-10-10',
    '2026-10-12',
    'Comunidade Voz de Deus - NH/SP',
    'upcoming',
    '[
        {"id": "kit_50", "name": "Kit 01 - Inscrição (R$ 50,00)", "price": 50, "includesTshirt": false}
    ]'::jsonb,
    '{
        "key": "255.985.138-54",
        "keyType": "CPF",
        "receiver": "Richard Wagner de Oliveira Portela",
        "bank": "Banco",
        "whatsappSupport": "5511955501090"
    }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;


-- ==============================================================================
-- 6. MIGRAÇÃO AUTOMÁTICA DOS DADOS HISTÓRICOS (event_registrations -> Novo Modelo)
-- ==============================================================================

DO $$
DECLARE
    carnaval_event_id UUID;
    rec RECORD;
    v_participant_id UUID;
    v_registration_id UUID;
BEGIN
    -- Obter o ID do evento Carnaval 2026
    SELECT id INTO carnaval_event_id FROM events WHERE slug = 'carnaval-2026';

    -- Verificar se a tabela antiga existe antes de tentar migrar
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
        FOR rec IN SELECT * FROM event_registrations LOOP
            -- 1. Inserir ou recuperar participante (pelo email se existir, ou telefone/nome)
            IF rec.email IS NOT NULL AND rec.email <> '' THEN
                SELECT id INTO v_participant_id FROM participants WHERE email = rec.email LIMIT 1;
            ELSIF rec.phone IS NOT NULL AND rec.phone <> '' THEN
                SELECT id INTO v_participant_id FROM participants WHERE phone = rec.phone LIMIT 1;
            ELSE
                v_participant_id := NULL;
            END IF;

            IF v_participant_id IS NULL THEN
                INSERT INTO participants (
                    full_name, email, phone, birth_date, gender, address, city, parish, emergency_phone, created_at
                ) VALUES (
                    COALESCE(rec.full_name, 'Participante'),
                    rec.email,
                    rec.phone,
                    rec.birth_date,
                    rec.gender,
                    rec.address,
                    rec.city,
                    rec.parish,
                    rec.emergency_phone,
                    COALESCE(rec.created_at, now())
                ) RETURNING id INTO v_participant_id;
            END IF;

            -- 2. Inserir Inscrição no Carnaval 2026 (se ainda não existir)
            SELECT id INTO v_registration_id FROM registrations 
            WHERE participant_id = v_participant_id AND event_id = carnaval_event_id;

            IF v_registration_id IS NULL THEN
                INSERT INTO registrations (
                    participant_id, event_id, kit_option, tshirt_size, tshirt_size_2,
                    staying_on_site, assigned_angel, status, created_at
                ) VALUES (
                    v_participant_id,
                    carnaval_event_id,
                    COALESCE(rec.kit_option, 'Kit 01 - Inscrição'),
                    rec.tshirt_size,
                    rec.tshirt_size_2,
                    COALESCE(rec.staying_on_site, false),
                    rec.assigned_angel,
                    CASE WHEN rec.payment_status = 'Pago' THEN 'Confirmada' ELSE 'Pendente' END,
                    COALESCE(rec.created_at, now())
                ) RETURNING id INTO v_registration_id;

                -- 3. Inserir Pagamento vinculado à inscrição
                INSERT INTO payments (
                    registration_id, amount, status, payment_method, payment_receipt_url, created_at
                ) VALUES (
                    v_registration_id,
                    COALESCE(rec.payment_amount, 50.00),
                    COALESCE(rec.payment_status, 'Pendente'),
                    'PIX',
                    rec.payment_receipt_url,
                    COALESCE(rec.created_at, now())
                );
            END IF;
        END LOOP;
        RAISE NOTICE 'Migração de histórico do Carnaval 2026 concluída com sucesso!';
    END IF;
END $$;


-- ==============================================================================
-- 7. POLÍTICAS DE SEGURANÇA (RLS)
-- ==============================================================================

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- EVENTS: Leitura pública, gravação apenas admin
CREATE POLICY "Permitir leitura pública de eventos" ON events FOR SELECT USING (true);
CREATE POLICY "Permitir gravação de eventos para autenticados" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PARTICIPANTS: Qualquer pessoa pode inserir seu cadastro e buscar por email/telefone para auto-preenchimento
CREATE POLICY "Permitir inserção e leitura pública de participantes" ON participants FOR SELECT USING (true);
CREATE POLICY "Permitir criação de participantes" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de participantes" ON participants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir admin gerenciar participantes" ON participants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- REGISTRATIONS: Inscrição pública e gerenciamento admin
CREATE POLICY "Permitir inserção pública de inscrições" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura pública de inscrições" ON registrations FOR SELECT USING (true);
CREATE POLICY "Permitir atualização de inscrições" ON registrations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir admin gerenciar inscrições" ON registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PAYMENTS: Pagamentos e envio de comprovantes
CREATE POLICY "Permitir inserção pública de pagamentos" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura pública de pagamentos" ON payments FOR SELECT USING (true);
CREATE POLICY "Permitir atualização pública de pagamentos (comprovante)" ON payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir admin gerenciar pagamentos" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
