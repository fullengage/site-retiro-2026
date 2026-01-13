-- Script para configurar o Storage e Database para o sistema de comprovantes de pagamento
-- Execute este script no SQL Editor do Supabase Dashboard

-- 0. Configurar políticas RLS para event_registrations
-- Permitir que qualquer pessoa faça inscrições (INSERT público)
CREATE POLICY "Permitir inscrições públicas"
ON event_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir que usuários autenticados visualizem todas as inscrições
CREATE POLICY "Permitir leitura para autenticados"
ON event_registrations FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuários autenticados atualizem inscrições
CREATE POLICY "Permitir atualização para autenticados"
ON event_registrations FOR UPDATE
TO authenticated
USING (true);

-- Permitir que o próprio usuário atualize sua inscrição (para upload de comprovante)
CREATE POLICY "Permitir atualização própria"
ON event_registrations FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 1. Criar o bucket de storage para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('pagamentos', 'pagamentos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar políticas de acesso ao bucket
-- Permitir que qualquer pessoa (incluindo anônimos) faça upload
CREATE POLICY "Permitir upload de comprovantes"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'pagamentos');

-- Permitir que qualquer pessoa visualize os comprovantes (público)
CREATE POLICY "Permitir visualização pública de comprovantes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pagamentos');

-- Permitir que admins deletem comprovantes
CREATE POLICY "Permitir admins deletarem comprovantes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pagamentos');

-- 3. Adicionar colunas necessárias na tabela event_registrations
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
ADD COLUMN IF NOT EXISTS tshirt_size_2 TEXT;

-- 4. Criar índice para melhorar performance de busca por comprovantes
CREATE INDEX IF NOT EXISTS idx_payment_receipt 
ON event_registrations(payment_receipt_url) 
WHERE payment_receipt_url IS NOT NULL;

-- 5. Verificar se RLS está habilitado (caso não esteja)
-- Se a tabela já existe sem RLS, você pode precisar habilitar:
-- ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Pronto! Agora o sistema de upload de comprovantes está configurado.
-- 
-- IMPORTANTE: Se você receber erro "policies already exist", pode ignorar.
-- O importante é que as políticas estejam criadas.
