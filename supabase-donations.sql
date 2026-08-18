-- Tabela de Itens de Doação
CREATE TABLE IF NOT EXISTS donation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    category TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- Qualquer um pode LER (para exibir na página de doações)
CREATE POLICY "Permitir leitura pública"
ON donation_items FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas autenticados (admins) podem ALTERAR (Update, Insert, Delete)
CREATE POLICY "Permitir modificação para autenticados"
ON donation_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Dados Iniciais (Seed)
INSERT INTO donation_items (name, quantity, category, checked) VALUES
-- Despensa & Básicos
('Arroz', '30 kg', 'Despensa & Básicos', false),
('Feijão', '10 kg', 'Despensa & Básicos', false),
('Macarrão Espaguete', '20 pcts', 'Despensa & Básicos', false),
('Óleo', '15 latas', 'Despensa & Básicos', false),
('Açúcar', '15 kg', 'Despensa & Básicos', false),
('Farinha de Rosca', '5 kg', 'Despensa & Básicos', false),
('Creme de Leite', '10 litros', 'Despensa & Básicos', false),
('Maionese', '3 kg', 'Despensa & Básicos', false),
('Vinagre', '5 frascos', 'Despensa & Básicos', true),

-- Café da Manhã
('Pó de Café', '10 kg', 'Café da Manhã', false),
('Achocolatado', '8 kg', 'Café da Manhã', false),
('Leite (cx 12 un)', '10 caixas', 'Café da Manhã', false),
('Chá Grande', '2 caixas', 'Café da Manhã', false),
('Suco em Pó', '30 kg', 'Café da Manhã', false),
('Bolacha Doce', '10 pcts', 'Café da Manhã', false),
('Bolacha Água e Sal', '10 pcts', 'Café da Manhã', false),
('Margarina', '5 kg', 'Café da Manhã', false),
('Pães (Div. Tipos)', '1200 un', 'Café da Manhã', false),

-- Carnes
('Peito de Frango', '90 kg', 'Carnes', false),
('Coxa/Sobrecoxa', '90 kg', 'Carnes', false),
('Linguiça Toscana', '50 kg', 'Carnes', false),
('Salsicha', '40 kg', 'Carnes', false),

-- Hortifruti
('Batata', '20 kg', 'Hortifruti', false),
('Cenoura', '4 kg', 'Hortifruti', false),
('Cebola', '5 kg', 'Hortifruti', false),
('Alho', '4 kg', 'Hortifruti', false),
('Alface', '20 pés', 'Hortifruti', false),
('Cheiro-verde', '3 maços', 'Hortifruti', false),
('Orégano Grande', '1 pct', 'Hortifruti', false),

-- Limpeza & Descartáveis
('Papel Higiênico', '80 rolos', 'Limpeza & Descartáveis', false),
('Papel Toalha', '10 pcts', 'Limpeza & Descartáveis', false),
('Copo Descartável', '80 pcts', 'Limpeza & Descartáveis', false),
('Guardanapo', '50 pcts', 'Limpeza & Descartáveis', false),
('Saco de Lixo 100L', '50 un', 'Limpeza & Descartáveis', false),
('Saco de Lixo 20L', '30 un', 'Limpeza & Descartáveis', false),
('Desinfetante 2L', '8 frascos', 'Limpeza & Descartáveis', false),
('Bucha de Louça', '5 un', 'Limpeza & Descartáveis', false);
