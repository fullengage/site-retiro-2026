# 🎉 Planejamento do Site - Retiro de Carnaval 2026

## 📋 Visão Geral do Projeto

Site para divulgação e inscrição do **Retiro de Carnaval 2026**, um evento cristão com tema inspirado no festival Holi (cores vibrantes).

---

## 📁 Estrutura Atual de Arquivos

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `Home.html` | Página principal com hero, galeria e calendário | ✅ Desenvolvido |
| `Paginadedoaçao.html` | Página para contribuições/doações via PIX | ✅ Desenvolvido |
| `paginacronograma.html` | Cronograma detalhado do evento (3 dias) | ✅ Desenvolvido |
| `homecomapaginadenoticiascerta.html` | Versão alternativa da home com seção de notícias | ⚠️ Em teste |

---

## 🎨 Design System

### Paleta de Cores
```
Dark (fundo):     #0a050f
Surface (cards):  #170a1f
Primary:          #d946ef (Fuchsia/Rosa)
Secondary:        #06b6d4 (Ciano)
Accent:           #facc15 (Amarelo)
Orange:           #f97316 (Laranja)
```

### Tecnologias Utilizadas
- **Framework CSS:** TailwindCSS (via CDN)
- **Fontes:** Google Fonts (Inter, Outfit, Material Icons)
- **Ícones:** Material Icons + Font Awesome
- **Efeitos:** Glassmorphism, gradientes, animações blob

---

## 📝 Tarefas Pendentes

### 🔴 Prioridade Alta
- [ ] Unificar navegação entre todas as páginas
- [ ] Criar sistema de inscrição funcional (também servirá como contato)
- [ ] Adicionar QR Code real para PIX
- [ ] Adicionar seção "Últimas Notícias" na Home.html (copiar de homecomapaginadenoticiascerta.html)

### 🟡 Prioridade Média
- [ ] Criar página de FAQ/Perguntas Frequentes
- [ ] Adicionar galeria de fotos de edições anteriores
- [ ] Implementar mapa de localização do evento

### 🟢 Prioridade Baixa
- [ ] Otimizar imagens para performance
- [ ] Adicionar animações de scroll
- [ ] Implementar modo claro/escuro toggle
- [ ] Criar página 404 personalizada

---

## 🗺️ Mapa do Site (Sitemap)

```
📦 Site Retiro de Carnaval
 ┣ 📄 index.html (Home.html - página principal)
 ┣ 📄 cronograma.html
 ┣ 📄 doacoes.html
 ┣ 📄 inscricao.html (criar - também funciona como contato)
 ┣ 📄 galeria.html (criar)
 ┣ 📄 faq.html (criar)
 ┗ 📁 assets/
   ┣ 📁 css/
   ┣ 📁 js/
   ┗ 📁 images/
```

---

## 📱 Seções da Página Principal

| Seção | Conteúdo | Implementado |
|-------|----------|--------------|
| Navbar | Logo, links, botão inscrição | ✅ |
| Hero | Título, data, CTA principal | ✅ |
| Sobre | "O que é o retiro?" | ✅ |
| Calendário | Data e contagem regressiva | ✅ |
| Atividades | Cards com highlights | ✅ |
| Galeria | Fotos estilo film strip | ✅ |
| Últimas Notícias | Seção de notícias do evento | ⏳ Adicionar |
| CTA Final | Chamada para inscrição | ✅ |
| Footer | Redes sociais, contato | ⚠️ Básico |

---

## 📅 Informações do Evento

- **Data:** Carnaval 2026 (14 Fev - 17 Fev)
- **Duração:** 4 dias (Sábado a Terça-feira)
- **Tema:** Festival Holi - Cores e Celebração
- **Público:** Jovens cristãos

---

## 🛠️ Próximos Passos Recomendados

1. **Organizar arquivos** - Renomear para padrão snake_case e criar pasta assets
2. **Adicionar seção Notícias na Home.html** - Copiar a seção "Últimas Notícias" de homecomapaginadenoticiascerta.html para Home.html
3. **Implementar navegação** - Links funcionais entre páginas
4. **Criar formulário de inscrição** - Integrar com Google Forms ou backend
5. **Adicionar informações reais** - PIX, local, valor, contatos

---

## 💡 Melhorias Sugeridas

### UX/UI
- Adicionar loading states e transições suaves
- Melhorar responsividade mobile do menu
- Adicionar breadcrumbs em páginas internas

### SEO
- Adicionar meta descriptions
- Incluir Open Graph tags para redes sociais
- Criar sitemap.xml

### Acessibilidade
- Adicionar atributos alt em todas imagens
- Melhorar contraste em alguns textos
- Implementar navegação por teclado

---

> **Nota:** Este documento serve como guia de desenvolvimento. Atualizar conforme progresso do projeto.
