/* CONFIGURAÇÃO E TEXTOS */
const CONTENT = {
    greetings: {
        firstContact: [
            "{Olá|Oi|Opa}, {SAUDACAO_TEMPO}! 🐼 Bem-vindo ao atendimento **Pandda**. Em que {posso ajudar|posso ser útil} hoje? 👇",
            "{Fala|E aí|Tudo bem}, {SAUDACAO_TEMPO}! 😃 Que bom te ver no **Pandda**. O que vamos {assistir|resolver} hoje? Escolha uma opção:",
            "{SAUDACAO_TEMPO}. Você está no auto-atendimento **Pandda**. 🚀 Para agilizar, escolha um dos assuntos abaixo:",
            "{Olá|Oi}! {SAUDACAO_TEMPO}. Somos a equipe **Pandda**. 🐼 Para começar, {digite|selecione} a opção desejada:",
            "{SAUDACAO_TEMPO}! 📺 O **Pandda** está pronto para te atender. Como podemos ajudar com seu acesso hoje?"
        ],
        returnMenu: [
            "{Entendido|Certo|Ok}! 👍 Voltando ao {início|menu principal}. O que mais você precisa?",
            "Menu reiniciado! 🔄 Escolha uma das opções abaixo:",
            "{Sem problemas|Combinado}. 🎬 Aqui estão as opções novamente para você:",
            "Segue o menu principal. 👇 Digite o número da opção:",
            "Voltando... 🔙 Como posso te ajudar agora?"
        ]
    },

    // MENU DINÂMICO (NOVO)
    menuSystem: {
        headers: [
            "{Confira|Veja|Aqui estão} as opções disponíveis 👇",
            "Como {posso te ajudar|podemos prosseguir}? Escolha uma opção:",
            "{Selecione|Digite} a opção desejada abaixo:",
            "Para {agilizar|continuar}, escolha um dos tópicos:"
        ],
        items: [
            "{1️⃣|1.|1 -} {Como funciona|Entender o sistema} {🤔|⚙️|👀}",
            "{2️⃣|2.|2 -} {Ver Planos|Preços e Planos|Tabela de Valores} {💰|💲|📊}",
            "{3️⃣|3.|3 -} {Assinar|Quero Assinar|Contratar Agora} {✍️|✅|🚀}",
            "{4️⃣|4.|4 -} {Testar|Gerar Teste|Quero um Teste} {🆓|⏱️|🍿}",
            "{5️⃣|5.|5 -} {Dúvidas|Perguntas Frequentes|Ajuda} {❓|❔|🤷‍♂️}",
            "{6️⃣|6.|6 -} {Falar com atendente|Suporte Humano|Falar com Pessoa} {👨‍💻|👩‍💻|🆘}"
        ]
    },

    howItWorks: [
        "Funciona 100% via {internet|conexão web} 🌐",
        "Sem {cabos|antenas|aparelhos extras}.",
        "Compatível com Smart TV, Celular, TV Box e PC 📺",
        "Sistema **DualAPP**: 2 apps para {maior estabilidade|não travar} 🚀",
        "Basta instalar e logar com os dados que fornecemos 🔑"
    ],
    plans: {
        intro: "Confira nossos planos Mensais (DualAPP):",
        list: "1️⃣ **Plano Base (1 tela):** R$ 34,90\n2️⃣ **Plano Dual (2 telas):** R$ 52,80\n3️⃣ **Plano Família (3 telas):** R$ 70,70",
        cta: "Digite **3** para Assinar agora ou **0** para Voltar."
    },
    signing: {
        askPlan: "Qual plano deseja? (Digite 1, 2 ou 3)",
        askCode: "Possui código de indicação? Se sim, digite. Se não, digite **Não**.",
        askAdult: "Código validado (ou ignorado). Deseja liberar canais Adultos? (Sim/Não)",
        successCode: "Código Válido! ✅ Ganhou bônus.",
        errorCode: "Código inválido ❌. Tente novamente ou digite 'Não'.",
        noCode: "Sem código. Entendido.",
        summaryHeader: "📝 **Resumo do Pedido:**",
        waitLink: "Aguardando confirmação..."
    },
    testing: {
        guideLink: "Instale o app: pandda.vip/guia",
        options: "Digite **1** p/ Testar Agora ou **2** p/ Agendar.",
        closed: "Ops! Geração de testes apenas das {START} às {END}. 🕒\nDigite **2** para Agendar.",
        askName: "Ok! Qual o seu Nome?",
        askSchedule: "Para qual horário deseja agendar? (Ex: 10h)",
        askCode: "Tem código de indicação? (Digite o código ou Não)",
        askAdult: "Liberar conteúdo Adulto? (Sim/Não)",
        success: "Obrigado {NAME}! Solicitação enviada. Aguarde seus dados."
    },
    faq: [
        "**Onde usar?** 🌍 Smart TV, Celular, PC.",
        "**Pagamento?** 💳 Pix e Cartão.",
        "**É assinatura?** ✍️ Não, é pré-pago sem fidelidade.",
        "**Quantas telas?** 📺 1, 2 ou 3 dependendo do plano."
    ],
    errors: {
        invalidOption: "Opção inválida. Tente novamente.",
        fallback: "Não entendi. Digite 0 para voltar ao menu."
    },
    support: "Chamando um atendente humano... 👩‍💻 Aguarde."
};