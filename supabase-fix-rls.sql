-- Script de correção para políticas RLS
-- Execute este script no SQL Editor do Supabase

-- OPÇÃO 1: Desabilitar RLS temporariamente (mais simples)
-- Use esta opção se você quer que qualquer pessoa possa fazer inscrições sem restrições
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Manter RLS mas com políticas permissivas
-- Comente a linha acima e descomente as linhas abaixo se preferir manter RLS

/*
-- Primeiro, remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Permitir inscrições públicas" ON event_registrations;
DROP POLICY IF EXISTS "Permitir leitura para autenticados" ON event_registrations;
DROP POLICY IF EXISTS "Permitir atualização para autenticados" ON event_registrations;
DROP POLICY IF EXISTS "Permitir atualização própria" ON event_registrations;

-- Habilitar RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para INSERT (qualquer pessoa pode inserir)
CREATE POLICY "enable_insert_for_all"
ON event_registrations
FOR INSERT
TO public
WITH CHECK (true);

-- Criar política permissiva para SELECT (qualquer pessoa pode ler)
CREATE POLICY "enable_select_for_all"
ON event_registrations
FOR SELECT
TO public
USING (true);

-- Criar política permissiva para UPDATE (qualquer pessoa pode atualizar)
CREATE POLICY "enable_update_for_all"
ON event_registrations
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
*/

-- Adicionar colunas se não existirem
ALTER TABLE event_registrations 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT,
ADD COLUMN IF NOT EXISTS tshirt_size_2 TEXT;

-- Configurar Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('pagamentos', 'pagamentos', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas antigas do storage
DROP POLICY IF EXISTS "Permitir upload de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública de comprovantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir admins deletarem comprovantes" ON storage.objects;

-- Criar políticas permissivas para storage
CREATE POLICY "public_upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'pagamentos');

CREATE POLICY "public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pagamentos');

CREATE POLICY "public_delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'pagamentos');

-- Pronto! Agora deve funcionar.
