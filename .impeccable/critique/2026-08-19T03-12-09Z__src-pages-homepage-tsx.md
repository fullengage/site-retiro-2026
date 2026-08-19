---
target: src/pages/HomePage.tsx
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-19T03-12-09Z
slug: src-pages-homepage-tsx
---
# Design Critique: Adonai Festival Landing Page

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Ticker regressivo claro e tags de lote ativos; feedback de âncoras/links funcional. |
| 2 | Match System / Real World | 4/4 | Linguagem autêntica de festival jovem ("Passaporte", "Duo", "Festa das Cores", "Palco"). |
| 3 | User Control and Freedom | 3/4 | Navegação por âncoras fluida, botão flutuante com acesso aos ingressos a qualquer momento. |
| 4 | Consistency and Standards | 2/4 | Conflito entre paleta terrosa streetwear (DESIGN.md) e grafismos neon ciano/amarelo inline na seção editorial. |
| 5 | Error Prevention | 3/4 | Clareza nas datas e avisos sobre restrições de idade e pré-requisitos de acampamento. |
| 6 | Recognition Rather Than Recall | 3/4 | Opções de passaporte visíveis lado a lado, mas listas de benefícios repetitivas geram sobrecarga. |
| 7 | Flexibility and Efficiency | n/a | Superfície Persuade/Landing page. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Seção Editorial com parede densa de texto e cards de ingressos com 11 itens redundantes cada. |
| 9 | Error Recovery | 4/4 | FAQ estruturado e links de contato claros para dúvidas sobre pagamentos e acomodação. |
| 10 | Help and Documentation | n/a | Superfície Persuade/Landing page. |
| **Total** | | **24/32** | **Good (75%)** |

---

### Design Specificity Verdict

**LLM assessment**: A landing page tem personalidade marcante e forte identificação com a proposta de festival católico jovem ("The Electric Revival"). No entanto, há dispersão visual em seções-chave: enquanto o Hero e os Ingressos usam o estilo streetwear terroso e estruturado, a Seção Editorial introduz grafismos de rabisco em ciano fluorescente (`#00e5ff`) e amarelo neon (`#fff53c`) com tipografia inline desalinhada, quebrando a autoridade visual do sistema.

**Deterministic scan**: O detector identificou inconsistências de cores fora da paleta de `DESIGN.md` (como `#00e5ff`, `#fff53c`, `#fee2e2`, `#cbd5e1`), além de bordas e raios customizados inline e seletores com side-tabs artificiais.

---

### Overall Impression

A landing page possui uma atmosfera envolvente e cheia de energia, com excelentes gatilhos emocionais e proposta de valor clara. O maior gargalo para conversão está na **alta carga cognitiva da tabela de ingressos** (muita redundância textual) e na **inconsistência estética da Seção Editorial**, que precisa ser alinhada ao design system "Electric Revival".

---

### What's Working

1. **Identidade do Hero e Countdown**: O banner de apresentação transmite imediatamente o peso do evento (datas, local em Novo Horizonte e proposta de valor "No mundo. Sem ser do mundo.").
2. **Barra Flutuante e Acessibilidade de Ingressos**: Facilita o acesso à conversão em qualquer ponto de rolagem da página.
3. **Seções Temáticas com Narrativa Forte**: A transição entre festa (Holi), reflexão (Pregações) e espiritualidade (Eucaristia) traduz com fidelidade o espírito do retiro.

---

### Priority Issues

#### [P1] Inconsistência de Cores e Estilos Inline na Seção Editorial
- **Por que importa:** A seção "O que é o Festival Adonai" usa tons de neon ciano (`#00e5ff`), amarelo vibrante e múltiplos tons cinzas de Tailwind, quebrando a harmonia da paleta solar/terracota/carvão do DESIGN.md.
- **Correção:** Refatorar a `EditorialSection` para adotar os tokens canônicos (`--adonai-orange`, `--adonai-terracotta`, `--adonai-charcoal`, `--adonai-cream`) e remover grafismos SVGs desconexos.
- **Comando sugerido:** `$impeccable colorize src/components/home/EditorialSection.tsx` ou `$impeccable layout src/components/home/EditorialSection.tsx`

#### [P1] Alta Carga Cognitiva e Redundância na Seção de Ingressos
- **Por que importa:** Os 3 cards de passaporte repetem 10 itens idênticos ("Acesso aos 3 dias", "Alimentação", "Kit Holi", "Camiseta", etc.), forçando o usuário a ler listas gigantes para descobrir a real diferença entre eles (Individual vs Duo vs Retiro Carnaval).
- **Correção:** Destacar apenas o diferencial de cada lote (badge de benefício único, economia por pessoa) e agrupar os benefícios comuns em uma barra compacta de "O que todos os passaportes incluem".
- **Comando sugerido:** `$impeccable distill src/components/home/TicketsSection.tsx`

#### [P1] Seção de Pregações/Insights Visualmente Subdesenvolvida
- **Por que importa:** A seção `PreachingSection` apresenta apenas 4 tags isoladas ("Heróis & Virtudes", etc.) sem imagens, sem oradores, sem contexto de temas ou cards que transmitam o impacto real das palestras.
- **Correção:** Enriquecer a seção com cartões editoriais estilo fanzine/pôster de festival com descrições curtas e visual impactante.
- **Comando sugerido:** `$impeccable bolder src/components/home/PreachingSection.tsx`

#### [P2] Inconsistência de Tipografia e Hierarquia de Leitura
- **Por que importa:** Textos longos em parágrafos usam `Space Grotesk` com pesos altos (800/900) em algumas seções em vez de `Montserrat`, reduzindo a legibilidade e cansando a vista do usuário.
- **Correção:** Padronizar títulos com `Montserrat 900` / `Space Grotesk 800` (apenas para labels e números) e corpo de texto com `Montserrat 400/500`.
- **Comando sugerido:** `$impeccable typeset src/components/home/`

#### [P3] Comportamento Responsivo e Posicionamento da Barra Flutuante
- **Por que importa:** Em telas intermediárias (tablets e celulares pequenos), a barra lateral de tickets pode se sobrepor a cards ou elementos de texto.
- **Correção:** Transformar em barra de ação compacta inferior (sticky bottom bar) no mobile.
- **Comando sugerido:** `$impeccable adapt src/components/home/FloatingTicketBar.tsx`

---

### Persona Red Flags

**Jordan (Jovem de Primeira Vez):**
- *Ponto de atrito:* Ao chegar na seção de ingressos, fica indeciso entre "Adonai Essencial" e "Adonai Experience" porque ambos dizem "Para quem não quer apenas participar. Quer viver tudo." e a lista de itens é idêntica.
- *Impacto:* Risco de desistência no momento da escolha do lote.

**Casey (Usuário Mobile em Rede Social):**
- *Ponto de atrito:* Na seção editorial, o texto é muito longo com parágrafos densos que ocupam várias telas de rolagem vertical antes de chegar nos ingressos.
- *Impacto:* Perda de atenção antes do primeiro CTA de compra.

---

### Minor Observations
- O FAQ utiliza `<details>` nativo, que é funcional e leve, mas poderia ter um tratamento visual mais polido no accordion.
- Na seção Eucaristia, a tag de hover da imagem ("Ver Mais na Galeria") usa amarelo `#fff53c` e `rounded-full`, fora do padrão angular streetwear.

---

### Questions to Consider
- *Como podemos transformar a tabela de ingressos em uma decisão rápida de 5 segundos para o jovem escolher entre ir sozinho ou levar um amigo?*
- *A seção editorial pode ser resumida em 3 pilares visuais dinâmicos (Arte, Fé e Comunidade) em vez de longos parágrafos de texto?*
