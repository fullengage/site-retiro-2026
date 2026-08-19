---
name: Adonai Festival 2026
description: Retro streetwear & electric festival design system for Catholic youth revival
colors:
  primary: "#F7942D"
  secondary: "#C94C22"
  sand-bg: "#F5D29C"
  charcoal: "#202020"
  cream: "#F1E6C8"
  brown: "#56382A"
typography:
  display:
    fontFamily: "Montserrat, sans-serif"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "0.05em"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
rounded:
  none: "0px"
  xs: "2px"
  sm: "4px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.xs}"
    padding: "16px 36px"
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
---

# Design System: Adonai Festival 2026

## Overview

**Creative North Star: "The Electric Revival"**

O sistema visual do Adonai Festival combina a energia crua de grandes festivais globais de música com a autenticidade e profundidade do streetwear contemporâneo e da juventude católica. Afastando-se de interfaces eclesiásticas tradicionais ou layouts genéricos de SaaS corporativo, a atmosfera é marcada por blocos de cor contrastantes em terracota, laranja solar, areia e carvão, tipografia em caixa alta imponente e elementos gráficos táteis com acabamento de pôster e zine cultural.

A experiência equilibra o impacto visual dinâmico com clareza funcional total para conversão de ingressos, inscrições de acampamento e navegação de cronograma.

**Key Characteristics:**
- Estética streetwear/festival: bordas retas ou micro-arredondadas (2px), sombras sólidas deslocadas (*hard shadow* sem desfoque) e bordas espessas.
- Paleta solar e terrosa de alto contraste: laranja vibrante, terracota profundo, carvão e fundo areia aquecido com microtextura de retícula.
- Tipografia de impacto: títulos monumentais em Montserrat Black/ExtraBold e rótulos de precisão em Space Grotesk.
- Elementos táteis: ingressos flutuantes, crachás adesivos, fitas adesivas e caixas de destaque em estilo fanzine/cartaz de festival.

## Colors

A paleta é quente, solar, terrosa e deliberadamente saturada em pontos focais para evocar o calor do festival, celebração ao ar livre e energia jovem.

### Primary
- **Adonai Solar Orange** (#F7942D): Cor de ação primária, botões principais de conversão de ingresso, badges de urgência e destaques focais.

### Secondary
- **Adonai Terracotta Flame** (#C94C22): Acento quente e enérgico para sombras sólidas deslocadas, bordas de destaque e estados de hover ativos.

### Tertiary
- **Adonai Rich Umber** (#56382A): Tom de profundidade e contraste intermediário para cartões de palco, fundos de badges secundários e divisórias editoriais.

### Neutral
- **Adonai Sand Canvas** (#F5D29C): Fundo quente e iluminado da landing page, transmitindo a sensação de arena de festival ao entardecer.
- **Adonai Deep Charcoal** (#202020): Cor base de textos, cabeçalhos, contornos estruturais e barras de topo de alta densidade.
- **Adonai Vintage Cream** (#F1E6C8): Contraste claro para superfícies escuras, texto em botões escuros e detalhes luminosos.

### Named Rules
**The Solid Contrast Rule.** O contraste nunca depende de transparências sutis; elementos de ação e cartões usam cores sólidas e bordas nítidas de 2px a 4px em Deep Charcoal (#202020) ou Solar Orange (#F7942D).

**The Hard Shadow Doctrine.** As sombras de elevação não usam blur gaussiano suave; são deslocamentos sólidos e angulares (ex: `box-shadow: 6px 6px 0 #C94C22`).

## Typography

**Display Font:** Montserrat (fallback: sans-serif)  
**Headline & Label Font:** Space Grotesk (fallback: sans-serif)  
**Body Font:** Inter (fallback: -apple-system, BlinkMacSystemFont, sans-serif)  

**Character:** A tipografia combina a monumentalidade e o peso de festival do Montserrat Black/900 com o rigor técnico de painel do Space Grotesk e a clareza e ritmo de leitura impecáveis do Inter para todo o corpo de texto.

### Hierarchy
- **Display** (Montserrat, weight 900, clamp(2.8rem, 8vw, 6rem), line-height 0.92, tracking -0.04em): Títulos principais do Hero e slogans monumentais.
- **Headline** (Montserrat / Space Grotesk, weight 800/900, 1.75rem a 2.5rem, line-height 1.1, letter-spacing 0.02em): Títulos de seções, palcos e atrações.
- **Title** (Montserrat, weight 700/800, 1.25rem a 1.5rem, line-height 1.25): Títulos de cartões, módulos de FAQ e lotes de ingressos.
- **Body** (Inter, weight 400/500/600, 1rem a 1.125rem, line-height 1.68, measure 65-75ch): Textos de descrição, detalhes do evento e informativos.
- **Label & Telemetry** (Space Grotesk, weight 800/900, 0.72rem a 0.85rem, letter-spacing 0.1em, uppercase): Badges, tags de localização/data, chips, cronômetro e tickers de sinal.

### Named Rules
**The All-Caps Accent Rule.** Toda tag, badge de credencial e botão de ação primária é renderizado estritamente em caixa alta com espaçamento entre letras (letter-spacing: 0.05em a 0.12em).

## Layout

O layout segue uma grade modular de impacto com densidade visual dinâmica:
- **Max-width do Conteúdo:** 1280px centralizado com padding lateral fluido (`clamp(16px, 4vw, 64px)`).
- **Ritmo Vertical:** Seções com respiro generoso (padding vertical de 80px a 120px) contrastadas com blocos internos densos e compactos de pôster.
- **Componentes Flutuantes:** Barra lateral de acesso rápido a ingressos fixada na lateral direita no desktop, recolhendo para barra de ação inferior no mobile.
- **Responsividade:** Em telas móveis (< 768px), o layout empilha cartões verticalmente e preserva os botões de ação em tamanho mínimo de toque de 48px.

## Elevation & Depth

O sistema rejeita intencionalmente o realismo de sombras difusas (skeuomorphism/soft shadows) e o glassmorphism excessivo. A profundidade é construída puramente através de:
1. **Camadas Tonais Sólidas:** Fundo areia (#F5D29C) sobreposto por cartões em carvão (#202020) ou creme (#F1E6C8).
2. **Hard Shadows:** Deslocamento sólido em eixo 45° ou horizontal/vertical direto.

### Shadow Vocabulary
- **Card Pop Shadow** (`box-shadow: 6px 6px 0 #202020`): Aplicado em cards brancos/creme sobre fundo claro.
- **Accent Solid Shadow** (`box-shadow: 7px 7px 0 #C94C22`): Aplicado em botões de destaque e caixas flutuantes.
- **Hover Lift** (`transform: translate(-3px, -3px); box-shadow: 10px 10px 0 #202020`): Estado de interação de botões e cartões interativos.

### Named Rules
**The Tactile Lift Rule.** Ao interagir com qualquer elemento clicável (botão ou cartão interativo), o elemento deve mover-se fisicamente no espaço 2px a 3px no sentido oposto à sua sombra sólida.

## Shapes

- **Raio de Borda (Corner Radius):** Predominantemente angular (`border-radius: 0px` a `2px`), com variações de `4px` apenas para inputs e formulários onde a usabilidade exige delimitação de campo.
- **Bordas Estruturais:** Bordas sólidas e bem definidas de 2px a 4px de espessura (`border: 3px solid #202020`).
- **Recortes & Formas:** Uso de faixas recortadas (*torn paper* e *sheared badges*) para selos de "Últimos Ingressos" ou "Confirmado".

## Components

### Buttons
- **Primary Button (btn-sziget-primary):**
  - **Forma:** Retangular nítido (radius 2px), borda de 3px solid #202020.
  - **Cores:** Fundo Solar Orange (#F7942D), texto Deep Charcoal (#202020) em Space Grotesk 800 caixa alta.
  - **Sombra & Hover:** Sombra sólida de 5px 5px 0 #202020; no hover transiciona para fundo Terracotta (#C94C22) com deslocamento `translate(-2px, -2px)`.
- **Secondary Button (btn-sziget-secondary):**
  - **Forma:** Retangular nítido (radius 2px), borda de 3px solid #202020.
  - **Cores:** Fundo Deep Charcoal (#202020), texto Vintage Cream (#F1E6C8).
  - **Hover:** Transiciona com deslocamento e borda em Solar Orange (#F7942D).

### Cards & Stages
- **Stage / Attraction Card:**
  - **Fundo:** Deep Charcoal (#202020) com texto Vintage Cream (#F1E6C8).
  - **Borda:** 3px solid #202020 com acento superior ou lateral sólido em Terracotta (#C94C22).
  - **Padding Interno:** 24px a 32px.

### Inputs & Formulários
- **Campos de Inscrição:**
  - **Fundo:** #FFFFFF ou Vintage Cream (#F1E6C8).
  - **Borda:** 2px solid #202020 com raio de 4px.
  - **Focus State:** Borda destacada em Solar Orange (#F7942D) com glow sólido sutil (`box-shadow: 3px 3px 0 #202020`).

### Chips & Badges
- **Festival Pill / Badge:**
  - **Fundo:** Deep Charcoal (#202020) ou Solar Orange (#F7942D).
  - **Texto:** Space Grotesk Bold, 0.75rem, uppercase, letter-spacing 0.1em.
  - **Padding:** 4px 12px.

## Do's and Don'ts

### Do:
- **Do** manter as sombras duras e deslocadas sem desfoque para reforçar a identidade física de cartaz/festival.
- **Do** utilizar textos de botões, tags e badges sempre em caixa alta com peso bold/black.
- **Do** preservar o fundo aquecido em areia/creme com a textura sutil de retícula para conferir personalidade ao projeto.
- **Do** garantir contraste AAA entre fundos e tipografia em todos os formulários e tabelas de ingressos.

### Don't:
- **Don't** utilizar sombras difusas e suaves de estilo Tailwind padrão (`shadow-lg`, `shadow-xl` sem customização).
- **Don't** aplicar cantos arredondados excessivos (`rounded-2xl`, `rounded-full` em botões principais de ação).
- **Don't** diluir a personalidade visual com degradês translúcidos roxo/azul genéricos.
- **Don't** sobrecarregar o usuário com animações lentas; transições devem ser rápidas e responsivas (0.15s a 0.2s com cubic-bezier firme).
