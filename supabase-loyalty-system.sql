-- ==============================================================================
-- SISTEMA DE FIDELIZAÇÃO DE PARTICIPANTES - COMUNIDADE VOZ DE DEUS
-- Cria identidade permanente de participante entre retiros + trava as tabelas
-- sensíveis contra leitura pública (só acessíveis via as funções RPC abaixo).
--
-- Rode este script inteiro no SQL Editor do Supabase. É seguro rodar mais de
-- uma vez (idempotente): usa IF NOT EXISTS / OR REPLACE / DROP...IF EXISTS.
-- Não apaga a tabela legada `event_registrations` nem a tabela `events`
-- existente — apenas endurece as permissões delas.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- 1. FUNÇÕES DE NORMALIZAÇÃO (usadas para casar e-mail/telefone/CPF com segurança)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION normalize_email(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT NULLIF(lower(trim(p)), '')
$$;

CREATE OR REPLACE FUNCTION normalize_digits(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT NULLIF(regexp_replace(coalesce(p, ''), '\D', '', 'g'), '')
$$;


-- ------------------------------------------------------------------------------
-- 2. TABELAS (events / participants / registrations / payments)
-- ------------------------------------------------------------------------------

-- 2.1 TABELA DE EVENTOS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
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

-- Seed de eventos se ainda não existirem
INSERT INTO events (slug, name, year, start_date, end_date, location, status, kit_options, pix_info)
VALUES 
(
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
),
(
    'adonai-2026',
    'Retiro ADONAI 2026',
    2026,
    '2026-09-25',
    '2026-09-27',
    'Escola FAF - Novo Horizonte/SP',
    'active',
    '[
        {"id": "adonai_sem_camiseta_50", "name": "ADONAI — SEM CAMISETA (R$ 50,00)", "price": 50, "includesTshirt": false},
        {"id": "adonai_com_camiseta_70", "name": "ADONAI — COM CAMISETA (Promocional até 10/09) (R$ 70,00)", "price": 70, "includesTshirt": true, "tshirtCount": 1}
    ]'::jsonb,
    '{
        "key": "255.985.138-54",
        "keyType": "CPF",
        "receiver": "Richard Wagner de Oliveira Portela",
        "bank": "Banco",
        "whatsappSupport": "5511955501090"
    }'::jsonb
),
(
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
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status;

-- 2.2 TABELA DE PARTICIPANTES
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL DEFAULT '',
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

ALTER TABLE participants 
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS cpf TEXT,
    ADD COLUMN IF NOT EXISTS birth_date TEXT,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS parish TEXT,
    ADD COLUMN IF NOT EXISTS emergency_phone TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE participants ALTER COLUMN name DROP NOT NULL;
ALTER TABLE participants ALTER COLUMN whatsapp DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participants_email_norm ON participants (normalize_email(email));
CREATE INDEX IF NOT EXISTS idx_participants_phone_norm ON participants (normalize_digits(phone));
CREATE INDEX IF NOT EXISTS idx_participants_cpf_norm ON participants (normalize_digits(cpf));

-- 2.3 TABELA DE INSCRIÇÕES
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
    CONSTRAINT uq_participant_event UNIQUE (participant_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON registrations(participant_id);

-- 2.4 TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'Pendente',
    payment_method TEXT DEFAULT 'PIX',
    payment_receipt_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendente',
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'PIX',
    ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('Pendente', 'Pago', 'Cancelado', 'Reembolsado', 'pending', 'confirmed', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);



-- ------------------------------------------------------------------------------
-- 3. MIGRAÇÃO DO HISTÓRICO LEGADO (event_registrations -> Carnaval 2026)
--    Idempotente: pula quem já foi migrado antes.
-- ------------------------------------------------------------------------------

DO $$
DECLARE
    v_adonai_id UUID;
    v_carnaval_id UUID;
    v_ato_id UUID;
    v_target_event_id UUID;
    rec RECORD;
    v_participant_id UUID;
    v_registration_id UUID;
BEGIN
    SELECT id INTO v_adonai_id FROM events WHERE slug = 'adonai-2026';
    SELECT id INTO v_carnaval_id FROM events WHERE slug = 'carnaval-2026';
    SELECT id INTO v_ato_id FROM events WHERE slug = 'ato-2026';

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
        FOR rec IN SELECT * FROM event_registrations LOOP
            -- 1. Identificar o evento correto baseado no kit_option
            IF rec.kit_option ILIKE '%ADONAI%' THEN
                v_target_event_id := v_adonai_id;
            ELSIF rec.kit_option ILIKE '%ATO%' THEN
                v_target_event_id := v_ato_id;
            ELSE
                v_target_event_id := v_carnaval_id;
            END IF;

            IF v_target_event_id IS NULL THEN
                v_target_event_id := v_carnaval_id;
            END IF;

            -- 2. Encontrar ou criar o participante
            v_participant_id := NULL;

            IF rec.email IS NOT NULL AND rec.email <> '' THEN
                SELECT id INTO v_participant_id FROM participants WHERE normalize_email(email) = normalize_email(rec.email) LIMIT 1;
            END IF;

            IF v_participant_id IS NULL AND rec.phone IS NOT NULL AND rec.phone <> '' THEN
                SELECT id INTO v_participant_id FROM participants WHERE normalize_digits(phone) = normalize_digits(rec.phone) LIMIT 1;
            END IF;

            IF v_participant_id IS NULL THEN
                INSERT INTO participants (
                    full_name, email, phone, birth_date, gender, address, city, parish, emergency_phone, created_at
                ) VALUES (
                    COALESCE(rec.full_name, 'Participante'),
                    rec.email, rec.phone, rec.birth_date::text, rec.gender, rec.address, rec.city, rec.parish, rec.emergency_phone,
                    COALESCE(rec.created_at, now())
                ) RETURNING id INTO v_participant_id;
            ELSE
                UPDATE participants SET
                    full_name = COALESCE(NULLIF(rec.full_name, ''), full_name),
                    phone = COALESCE(NULLIF(rec.phone, ''), phone),
                    birth_date = COALESCE(NULLIF(rec.birth_date::text, ''), birth_date),
                    gender = COALESCE(NULLIF(rec.gender, ''), gender),
                    address = COALESCE(NULLIF(rec.address, ''), address),
                    city = COALESCE(NULLIF(rec.city, ''), city),
                    parish = COALESCE(NULLIF(rec.parish, ''), parish),
                    emergency_phone = COALESCE(NULLIF(rec.emergency_phone, ''), emergency_phone),
                    updated_at = now()
                WHERE id = v_participant_id;
            END IF;

            SELECT id INTO v_registration_id FROM registrations
            WHERE participant_id = v_participant_id AND event_id = v_target_event_id;

            IF v_registration_id IS NULL THEN
                INSERT INTO registrations (
                    participant_id, event_id, kit_option, tshirt_size, tshirt_size_2,
                    staying_on_site, assigned_angel, status, created_at
                ) VALUES (
                    v_participant_id, v_target_event_id,
                    COALESCE(rec.kit_option, 'Kit 01 - Inscrição'),
                    rec.tshirt_size, rec.tshirt_size_2,
                    COALESCE(rec.staying_on_site, false), rec.assigned_angel,
                    CASE WHEN rec.payment_status = 'Pago' THEN 'Confirmada' ELSE 'Pendente' END,
                    COALESCE(rec.created_at, now())
                ) RETURNING id INTO v_registration_id;

                INSERT INTO payments (registration_id, amount, status, payment_method, payment_receipt_url, created_at)
                VALUES (
                    v_registration_id, COALESCE(rec.payment_amount, 50.00), COALESCE(rec.payment_status, 'Pendente'),
                    'PIX', rec.payment_receipt_url, COALESCE(rec.created_at, now())
                );
            ELSE
                UPDATE registrations SET
                    kit_option = COALESCE(rec.kit_option, kit_option),
                    tshirt_size = COALESCE(rec.tshirt_size, tshirt_size),
                    tshirt_size_2 = COALESCE(rec.tshirt_size_2, tshirt_size_2),
                    staying_on_site = COALESCE(rec.staying_on_site, staying_on_site),
                    assigned_angel = COALESCE(rec.assigned_angel, assigned_angel),
                    status = CASE WHEN rec.payment_status = 'Pago' THEN 'Confirmada' ELSE status END
                WHERE id = v_registration_id;
            END IF;
        END LOOP;
        RAISE NOTICE 'Migração de histórico inteligente por kit concluída.';
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 4. RLS -- tabelas sensíveis SEM acesso público direto.
--    O papel anônimo só consegue interagir através das funções RPC da seção 5,
--    que são SECURITY DEFINER (rodam como dono da função e ignoram a RLS).
-- ------------------------------------------------------------------------------

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas e permissivas (da tentativa anterior de normalização)
DROP POLICY IF EXISTS "Permitir leitura pública de eventos" ON events;
DROP POLICY IF EXISTS "Permitir gravação de eventos para autenticados" ON events;
DROP POLICY IF EXISTS "Permitir inserção e leitura pública de participantes" ON participants;
DROP POLICY IF EXISTS "Permitir criação de participantes" ON participants;
DROP POLICY IF EXISTS "Permitir atualização de participantes" ON participants;
DROP POLICY IF EXISTS "Permitir admin gerenciar participantes" ON participants;
DROP POLICY IF EXISTS "Permitir inserção pública de inscrições" ON registrations;
DROP POLICY IF EXISTS "Permitir leitura pública de inscrições" ON registrations;
DROP POLICY IF EXISTS "Permitir atualização de inscrições" ON registrations;
DROP POLICY IF EXISTS "Permitir admin gerenciar inscrições" ON registrations;
DROP POLICY IF EXISTS "Permitir inserção pública de pagamentos" ON payments;
DROP POLICY IF EXISTS "Permitir leitura pública de pagamentos" ON payments;
DROP POLICY IF EXISTS "Permitir atualização pública de pagamentos (comprovante)" ON payments;
DROP POLICY IF EXISTS "Permitir admin gerenciar pagamentos" ON payments;
DROP POLICY IF EXISTS "events_select_public" ON events;
DROP POLICY IF EXISTS "events_admin_all" ON events;
DROP POLICY IF EXISTS "participants_admin_all" ON participants;
DROP POLICY IF EXISTS "registrations_admin_all" ON registrations;
DROP POLICY IF EXISTS "payments_admin_all" ON payments;

-- EVENTS: dado não sensível, leitura pública ok. Escrita só admin.
CREATE POLICY "events_select_public" ON events FOR SELECT USING (true);
CREATE POLICY "events_admin_all" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PARTICIPANTS / REGISTRATIONS / PAYMENTS: só admin logado acessa direto.
-- (sem policy pra anon = acesso negado por padrão)
CREATE POLICY "participants_admin_all" ON participants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "registrations_admin_all" ON registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "payments_admin_all" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Tabela legada: mantida só como histórico/fallback de leitura do admin.
-- Corrige a falha encontrada antes (RLS desabilitada / leitura pública aberta).
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "enable_insert_for_all" ON event_registrations;
DROP POLICY IF EXISTS "enable_select_for_all" ON event_registrations;
DROP POLICY IF EXISTS "enable_update_for_all" ON event_registrations;
DROP POLICY IF EXISTS "Permitir inscrições públicas" ON event_registrations;
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON event_registrations;
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON event_registrations;
DROP POLICY IF EXISTS "Permitir atualização própria" ON event_registrations;
DROP POLICY IF EXISTS "event_registrations_admin_only" ON event_registrations;
CREATE POLICY "event_registrations_admin_only" ON event_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage do bucket de comprovantes: mantém upload/leitura pública (necessário
-- pro fluxo de pagamento), mas remove o DELETE público (hoje qualquer pessoa
-- pode apagar o comprovante de qualquer outra).
DROP POLICY IF EXISTS "public_upload" ON storage.objects;
DROP POLICY IF EXISTS "public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_delete" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir admins deletarem comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "pagamentos_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "pagamentos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "pagamentos_admin_delete" ON storage.objects;

CREATE POLICY "pagamentos_public_upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'pagamentos');
CREATE POLICY "pagamentos_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'pagamentos');
CREATE POLICY "pagamentos_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pagamentos');


-- ------------------------------------------------------------------------------
-- 5. FUNÇÕES RPC (SECURITY DEFINER) -- única porta de entrada do público
-- ------------------------------------------------------------------------------

-- Reconhece um participante pelo e-mail, telefone ou CPF que ELE MESMO digitou.
-- Retorna histórico real de retiros e se já está inscrito no evento informado.
CREATE OR REPLACE FUNCTION find_my_registration_status(p_identifier text, p_event_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_participant participants%ROWTYPE;
    v_digits text := normalize_digits(p_identifier);
    v_past_retreats text[];
    v_already boolean := false;
BEGIN
    IF p_identifier IS NULL OR length(trim(p_identifier)) < 5 THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    IF position('@' IN p_identifier) > 0 THEN
        SELECT * INTO v_participant FROM participants WHERE normalize_email(email) = normalize_email(p_identifier) LIMIT 1;
    END IF;

    IF v_participant.id IS NULL AND v_digits IS NOT NULL AND length(v_digits) >= 8 THEN
        SELECT * INTO v_participant FROM participants
        WHERE normalize_digits(phone) = v_digits OR normalize_digits(cpf) = v_digits
        LIMIT 1;
    END IF;

    IF v_participant.id IS NULL THEN
        RETURN jsonb_build_object('found', false);
    END IF;

    SELECT array_agg(e.name ORDER BY e.start_date NULLS LAST, e.year)
    INTO v_past_retreats
    FROM registrations r JOIN events e ON e.id = r.event_id
    WHERE r.participant_id = v_participant.id;

    IF p_event_id IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM registrations WHERE participant_id = v_participant.id AND event_id = p_event_id
        ) INTO v_already;
    END IF;

    RETURN jsonb_build_object(
        'found', true,
        'participant', jsonb_build_object(
            'id', v_participant.id,
            'full_name', v_participant.full_name,
            'email', v_participant.email,
            'phone', v_participant.phone,
            'cpf', v_participant.cpf,
            'birth_date', v_participant.birth_date,
            'gender', v_participant.gender,
            'address', v_participant.address,
            'city', v_participant.city,
            'parish', v_participant.parish,
            'emergency_phone', v_participant.emergency_phone
        ),
        'pastRetreats', COALESCE(to_jsonb(v_past_retreats), '[]'::jsonb),
        'alreadyRegisteredInEvent', v_already
    );
END;
$$;

-- Autocomplete e busca inteligente por nome com suporte a preenchimento em 1 clique
CREATE OR REPLACE FUNCTION search_participants_by_name(p_name text, p_event_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result jsonb;
BEGIN
    IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
        RETURN '[]'::jsonb;
    END IF;

    SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_result
    FROM (
        SELECT jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'email', p.email,
            'phone', p.phone,
            'cpf', p.cpf,
            'birth_date', p.birth_date,
            'gender', p.gender,
            'address', p.address,
            'city', p.city,
            'parish', p.parish,
            'emergency_phone', p.emergency_phone,
            'pastRetreats', COALESCE((
                SELECT array_agg(e.name ORDER BY e.start_date NULLS LAST, e.year)
                FROM registrations r JOIN events e ON e.id = r.event_id
                WHERE r.participant_id = p.id
            ), ARRAY[]::text[]),
            'alreadyRegisteredInEvent', CASE 
                WHEN p_event_id IS NOT NULL THEN
                    EXISTS (SELECT 1 FROM registrations WHERE participant_id = p.id AND event_id = p_event_id)
                ELSE false
            END
        ) AS row_data
        FROM participants p
        WHERE p.full_name ILIKE '%' || trim(p_name) || '%'
        ORDER BY p.full_name
        LIMIT 8
    ) sub;

    RETURN v_result;
END;
$$;

-- Cria/atualiza o participante e registra a inscrição no evento (upsert de
-- identidade por e-mail/telefone/CPF). Bloqueia duplicidade a nível de banco.
CREATE OR REPLACE FUNCTION submit_event_registration(
    p_participant jsonb,
    p_event_id uuid,
    p_kit_option text,
    p_tshirt_size text DEFAULT NULL,
    p_tshirt_size_2 text DEFAULT NULL,
    p_staying_on_site boolean DEFAULT false,
    p_payment_amount numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_participant_id uuid;
    v_email text := normalize_email(p_participant->>'email');
    v_phone_digits text := normalize_digits(p_participant->>'phone');
    v_cpf_digits text := normalize_digits(p_participant->>'cpf');
    v_registration_id uuid;
    v_payment_id uuid;
BEGIN
    IF v_email IS NOT NULL THEN
        SELECT id INTO v_participant_id FROM participants WHERE normalize_email(email) = v_email LIMIT 1;
    END IF;

    IF v_participant_id IS NULL AND v_phone_digits IS NOT NULL THEN
        SELECT id INTO v_participant_id FROM participants WHERE normalize_digits(phone) = v_phone_digits LIMIT 1;
    END IF;

    IF v_participant_id IS NULL AND v_cpf_digits IS NOT NULL THEN
        SELECT id INTO v_participant_id FROM participants WHERE normalize_digits(cpf) = v_cpf_digits LIMIT 1;
    END IF;

    IF v_participant_id IS NULL THEN
        INSERT INTO participants (full_name, email, phone, cpf, birth_date, gender, address, city, parish, emergency_phone)
        VALUES (
            p_participant->>'full_name', p_participant->>'email', p_participant->>'phone', p_participant->>'cpf',
            NULLIF(p_participant->>'birth_date', ''), NULLIF(p_participant->>'gender', ''),
            NULLIF(p_participant->>'address', ''), NULLIF(p_participant->>'city', ''),
            NULLIF(p_participant->>'parish', ''), NULLIF(p_participant->>'emergency_phone', '')
        ) RETURNING id INTO v_participant_id;
    ELSE
        UPDATE participants SET
            full_name = COALESCE(NULLIF(p_participant->>'full_name', ''), full_name),
            email = COALESCE(NULLIF(p_participant->>'email', ''), email),
            phone = COALESCE(NULLIF(p_participant->>'phone', ''), phone),
            cpf = COALESCE(NULLIF(p_participant->>'cpf', ''), cpf),
            birth_date = COALESCE(NULLIF(p_participant->>'birth_date', ''), birth_date),
            gender = COALESCE(NULLIF(p_participant->>'gender', ''), gender),
            address = COALESCE(NULLIF(p_participant->>'address', ''), address),
            city = COALESCE(NULLIF(p_participant->>'city', ''), city),
            parish = COALESCE(NULLIF(p_participant->>'parish', ''), parish),
            emergency_phone = COALESCE(NULLIF(p_participant->>'emergency_phone', ''), emergency_phone),
            updated_at = now()
        WHERE id = v_participant_id;
    END IF;

    IF EXISTS (SELECT 1 FROM registrations WHERE participant_id = v_participant_id AND event_id = p_event_id) THEN
        RAISE EXCEPTION 'Você já está inscrito(a) neste evento.';
    END IF;

    INSERT INTO registrations (participant_id, event_id, kit_option, tshirt_size, tshirt_size_2, staying_on_site, status)
    VALUES (v_participant_id, p_event_id, p_kit_option, p_tshirt_size, p_tshirt_size_2, COALESCE(p_staying_on_site, false), 'Pendente')
    RETURNING id INTO v_registration_id;

    INSERT INTO payments (registration_id, amount, status, payment_method)
    VALUES (v_registration_id, p_payment_amount, 'Pendente', 'PIX')
    RETURNING id INTO v_payment_id;

    RETURN jsonb_build_object(
        'participant_id', v_participant_id,
        'registration_id', v_registration_id,
        'payment_id', v_payment_id
    );
END;
$$;

-- Anexa a URL do comprovante ao pagamento certo, sem precisar de UPDATE
-- público direto na tabela payments.
CREATE OR REPLACE FUNCTION link_payment_receipt(p_registration_id uuid, p_receipt_url text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE payments SET payment_receipt_url = p_receipt_url, updated_at = now()
    WHERE registration_id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION normalize_email(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION normalize_digits(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION find_my_registration_status(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_participants_by_name(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_event_registration(jsonb, uuid, text, text, text, boolean, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION link_payment_receipt(uuid, text) TO anon, authenticated;

-- Pronto! Depois de rodar este script:
-- 1. Teste uma inscrição nova em /inscricao
-- 2. Teste repetir com o mesmo e-mail no mesmo evento -> deve bloquear
-- 3. Confira o /admin/inscricoes com a conta autenticada
