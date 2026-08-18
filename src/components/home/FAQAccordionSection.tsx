import React from 'react'

interface FAQItem {
    question: string
    answer: string
}

const FAQS: FAQItem[] = [
    {
        question: 'O que é o ADONAI Festival?',
        answer: 'O ADONAI Festival é um acampamento católico para jovens, realizado pela Comunidade Católica Voz de Deus. O encontro reúne oração, Santa Missa, música, formação cristã, cultura, amizade e muita alegria.',
    },
    {
        question: 'Quem pode participar?',
        answer: 'O ADONAI Festival é destinado a jovens com mais de 12 anos, ou seja, a partir dos 13 anos de idade.',
    },
    {
        question: 'Quando e onde acontecerá o ADONAI Festival 2026?',
        answer: 'O ADONAI Festival 2026 acontecerá em setembro de 2026, no FAF (Escola Municipal de Ensino Fundamental Francisco Alvares Florence). O evento será realizado dentro de uma escola, totalmente preparada para funcionar como um acampamento acolhedor.',
    },
    {
        question: 'Como participar de graça ou abater o valor da minha inscrição?',
        answer: 'Sim, existem várias maneiras de participar sem custo ou cobrindo o valor da sua vaga! Você pode participar dos pedágios de arrecadação da comunidade, atuar como Anjo do retiro, ou ajudar na montagem, limpeza e organização geral quando chamado. Converse com nossa equipe para saber mais e garantir sua participação!',
    },
    {
        question: 'Quais são as opções e formas de pagamento?',
        answer: 'Oferecemos pagamento facilitado via PIX diretamente pelo site com confirmação instantânea. Se você participou do Retiro de Carnaval, possui o benefício do Pré-Convite com 50% de desconto (R$ 50). Também temos a opção ADONAI DUO (R$ 120 para duas pessoas, saindo R$ 60 por pessoa).',
    },
    {
        question: 'Menores de idade podem participar sozinhos?',
        answer: 'Participantes com 15 anos ou mais poderão dormir no acampamento sem um responsável acompanhando. Para participantes menores de 15 anos, é necessário estar acompanhado por um responsável.',
    },
    {
        question: 'O que devo levar para dormir no acampamento?',
        answer: 'Como o evento será realizado no formato de acampamento, cada participante deverá levar: colchão, travesseiro, roupa de cama e roupa de banho.',
    },
    {
        question: 'Como faço minha inscrição?',
        answer: 'É simples: escolha seu passaporte, preencha o formulário e realize o pagamento. Depois disso, um dos nossos Anjos, jovens que fazem parte da organização do ADONAI, entrará em contato com você para confirmar os dados e finalizar sua inscrição.',
    },
    {
        question: 'Como funciona a Festa das Cores?',
        answer: 'A Festa das Cores, também conhecida como Holi, é um momento de celebração com música e pós coloridos laváveis e atóxicos. Use roupas confortáveis que possam sujar e siga as orientações da equipe.',
    },
    {
        question: 'Preciso ser católico para participar?',
        answer: 'Não. O ADONAI acolhe todos os jovens que desejam conhecer ou aprofundar sua fé, sempre com respeito à proposta católica do festival e aos demais participantes.',
    },
]

export const FAQAccordionSection: React.FC = () => {
    return (
        <section id="duvidas" aria-labelledby="faq-title">
            <h2 id="faq-title">
                PERGUNTAS FREQUENTES
            </h2>

            <div>
                {FAQS.map((faq, idx) => (
                    <details key={idx}>
                        <summary>
                            <span>{faq.question}</span>
                            <span style={{ fontSize: '1.3rem' }}>▾</span>
                        </summary>
                        <p>{faq.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    )
}

export default FAQAccordionSection
