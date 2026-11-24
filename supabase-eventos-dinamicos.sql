-- Eventos dinâmicos + Retiro DNA (12 e 13/12/2026)
-- Rodar uma vez no SQL Editor do Supabase.

-- 1. Conteúdo da página do evento (texto, cronograma, área kids, idade mínima...)
ALTER TABLE events ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Filhos (crianças) vinculados à inscrição do responsável + observações
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS children JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. Inscrição: valor vem do kit cadastrado no evento (não do navegador), idade mínima, filhos e observações
DROP FUNCTION IF EXISTS submit_event_registration(jsonb, uuid, text, text, text, boolean, numeric);
CREATE OR REPLACE FUNCTION submit_event_registration(
    p_participant jsonb,
    p_event_id uuid,
    p_kit_option text,
    p_tshirt_size text DEFAULT NULL,
    p_tshirt_size_2 text DEFAULT NULL,
    p_staying_on_site boolean DEFAULT false,
    p_payment_amount numeric DEFAULT 0,
    p_notes text DEFAULT NULL,
    p_children jsonb DEFAULT '[]'::jsonb
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
    v_event events%ROWTYPE;
    v_amount numeric;
    v_min_age int;
    v_birth date := NULLIF(p_participant->>'birth_date', '')::date;
BEGIN
    SELECT * INTO v_event FROM events WHERE id = p_event_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Evento não encontrado.';
    END IF;

    SELECT (k->>'price')::numeric INTO v_amount
    FROM jsonb_array_elements(v_event.kit_options) k
    WHERE k->>'name' = p_kit_option
    LIMIT 1;
    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Opção de inscrição inválida.';
    END IF;

    v_min_age := NULLIF(v_event.content->>'min_age', '')::int;
    IF v_min_age IS NOT NULL THEN
        IF v_birth IS NULL THEN
            RAISE EXCEPTION 'Informe sua data de nascimento.';
        END IF;
        IF v_birth > COALESCE(v_event.start_date, current_date) - make_interval(years => v_min_age) THEN
            RAISE EXCEPTION 'A inscrição é para maiores de % anos. Crianças entram como filhos do responsável.', v_min_age;
        END IF;
    END IF;

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
            v_birth, NULLIF(p_participant->>'gender', ''),
            NULLIF(p_participant->>'address', ''), NULLIF(p_participant->>'city', ''),
            NULLIF(p_participant->>'parish', ''), NULLIF(p_participant->>'emergency_phone', '')
        ) RETURNING id INTO v_participant_id;
    ELSE
        UPDATE participants SET
            full_name = COALESCE(NULLIF(p_participant->>'full_name', ''), full_name),
            email = COALESCE(NULLIF(p_participant->>'email', ''), email),
            phone = COALESCE(NULLIF(p_participant->>'phone', ''), phone),
            cpf = COALESCE(NULLIF(p_participant->>'cpf', ''), cpf),
            birth_date = COALESCE(v_birth, birth_date),
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

    INSERT INTO registrations (participant_id, event_id, kit_option, tshirt_size, tshirt_size_2, staying_on_site, status, notes, children)
    VALUES (v_participant_id, p_event_id, p_kit_option, p_tshirt_size, p_tshirt_size_2, COALESCE(p_staying_on_site, false), 'Pendente',
            NULLIF(p_notes, ''), COALESCE(p_children, '[]'::jsonb))
    RETURNING id INTO v_registration_id;

    INSERT INTO payments (registration_id, amount, status, payment_method)
    VALUES (v_registration_id, v_amount, 'Pendente', 'PIX')
    RETURNING id INTO v_payment_id;

    RETURN jsonb_build_object(
        'participant_id', v_participant_id,
        'registration_id', v_registration_id,
        'payment_id', v_payment_id,
        'amount', v_amount
    );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_event_registration(jsonb, uuid, text, text, text, boolean, numeric, text, jsonb) TO anon, authenticated;

-- 4. Só um evento ativo por vez (a home e a inscrição usam o ativo)
UPDATE events SET status = 'completed' WHERE status = 'active';

-- 5. Retiro DNA
INSERT INTO events (slug, name, year, start_date, end_date, location, status, kit_options, pix_info, content)
VALUES (
    'dna-2026',
    'Retiro DNA 2026',
    2026,
    '2026-12-12',
    '2026-12-13',
    'Comunidade Voz de Deus - NH/SP',
    'active',
    '[{"id": "dna_adulto_30", "name": "DNA — Inscrição adulto (R$ 30,00)", "price": 30, "includesTshirt": false},
      {"id": "dna_casal_50", "name": "DNA — Inscrição casal (R$ 50,00)", "price": 50, "includesTshirt": false}]'::jsonb,
    (SELECT pix_info FROM events WHERE slug = 'adonai-2026'),
    '{
        "tagline": "12 e 13 de dezembro",
        "description": "Dois dias de serviço, comunhão e fé: preparamos juntos a cozinha, celebramos a Santa Missa na Matriz e partilhamos a mesa.",
        "min_age": 18,
        "overnight": false,
        "kids_area": {
            "enabled": true,
            "description": "Teremos uma área especial para as crianças. Cadastre seus filhos na sua inscrição — eles não pagam."
        },
        "schedule": [
            {
                "title": "Sábado – 12/12",
                "hours": "das 14h às 20h",
                "items": ["Preparação e organização da cozinha", "À noite, hot-dog para os participantes", "Encerramento das atividades às 20h"]
            },
            {
                "title": "Domingo – 13/12",
                "hours": "das 8h às 14h",
                "items": ["Participação na Missa na Matriz", "Preparação do café da manhã", "Preparação e serviço do almoço"]
            }
        ]
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    status = EXCLUDED.status,
    kit_options = EXCLUDED.kit_options,
    content = EXCLUDED.content;
