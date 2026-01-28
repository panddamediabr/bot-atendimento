/* =================================================================
   FLUXOS DE CONVERSA (REGRAS DE NEGÓCIO)
   ================================================================= */

// Estado Global da Sessão
const Session = { 
    id: 'SES-INIT', 
    state: 'START', 
    firstContact: true, 
    data: {} 
};

// --- MENU PRINCIPAL ---
const FlowMenu = {
    getOptions: () => {
        let greeting = "";
        
        // 1. Lógica de Saudação (1º Contato vs Retorno)
        if (Session.firstContact) {
            // Sorteia um template de 1º contato
            greeting = processSpintax(getRandom(CONTENT.greetings.firstContact));
            
            // Substitui a variável temporal (ex: Bom dia)
            // Agora usando %SAUDACAO% para não conflitar com Spintax {}
            greeting = greeting.replace("%SAUDACAO%", getGreeting());
            
            // Marca que o primeiro contato já ocorreu
            Session.firstContact = false;
        } else {
            // Sorteia um template de Retorno ao Menu
            greeting = processSpintax(getRandom(CONTENT.greetings.returnMenu));
        }

        // 2. Geração Dinâmica do Menu (Anti-Ban)
        const header = processSpintax(getRandom(CONTENT.menuSystem.headers));
        
        // Processa cada linha do menu individualmente para variar os emojis
        const itemsList = CONTENT.menuSystem.items
            .map(item => processSpintax(item))
            .join('\n');
        
        // Monta o bloco final
        const menuBlock = `${header}\n\n${itemsList}`;

        // Retorna array [Saudação, Menu]
        // O main.js irá uni-los em um único balão
        return [greeting, menuBlock];
    },

    handle: (input) => {
        // Limpa o input, mantendo apenas números (ex: "Quero a 1" -> "1")
        const opt = input.replace(/[^0-9]/g, '');
        
        switch(opt) {
            case '1': return FlowHowItWorks.start();
            case '2': return FlowPlans.start();
            case '3': return FlowSigning.start();
            case '4': return FlowTesting.start();
            case '5': return FlowFAQ.start();
            case '6': return FlowSupport.start();
            default: return { text: [CONTENT.errors.invalidOption], newState: 'MENU' };
        }
    }
};

// --- COMO FUNCIONA ---
const FlowHowItWorks = {
    start: () => {
        // Embaralha as frases para não parecer texto decorado
        const shuffled = shuffleArray(CONTENT.howItWorks).map(t => processSpintax(t));
        return { 
            text: ["Veja como é simples:", ...shuffled, "Digite 0 para voltar."], 
            newState: 'MENU' 
        };
    }
};

// --- PLANOS ---
const FlowPlans = {
    start: () => ({
        text: [CONTENT.plans.intro, CONTENT.plans.list, CONTENT.plans.cta],
        newState: 'MENU'
    })
};

// --- ASSINATURA (Fluxo Passo a Passo) ---
const FlowSigning = {
    start: () => ({ 
        text: [CONTENT.signing.askPlan], 
        newState: 'SIGN_PLAN' 
    }),
    
    handle: (input, state) => {
        // Passo 1: Escolha do Plano
        if (state === 'SIGN_PLAN') {
            Session.data.plan = input;
            return { text: [CONTENT.signing.askCode], newState: 'SIGN_CODE' };
        }
        
        // Passo 2: Código de Indicação
        if (state === 'SIGN_CODE') {
            const clean = input.toLowerCase().replace(/['"]/g, '').trim();
            
            // Se o usuário disser "Não"
            if (['nao', 'não', 'n'].includes(clean)) {
                Session.data.code = null;
                return { 
                    text: [CONTENT.signing.noCode, CONTENT.signing.askAdult], 
                    newState: 'SIGN_ADULT' 
                };
            }
            
            // Simulação de validação no Banco de Dados
            // (Pega o valor do input hidden do painel de config)
            const validCodes = document.getElementById('validCodes').value.toUpperCase();
            const isValid = validCodes.includes(input.toUpperCase());
            
            logger('DB', 'Validação Cupom', { cupom: input, valido: isValid });
            
            if (isValid) {
                Session.data.code = input.toUpperCase();
                return { 
                    text: [CONTENT.signing.successCode, CONTENT.signing.askAdult], 
                    newState: 'SIGN_ADULT' 
                };
            } else {
                return { 
                    text: [CONTENT.signing.errorCode], 
                    newState: 'SIGN_CODE' // Mantém no mesmo estado para tentar de novo
                };
            }
        }
        
        // Passo 3: Conteúdo Adulto e Finalização
        if (state === 'SIGN_ADULT') {
            Session.data.adult = input;
            
            // Gera link de pagamento (Simulado)
            const url = `pagar.pandda.vip?id=${Session.id}&plan=${Session.data.plan}`;
            
            logger('WEBHOOK', 'Venda Iniciada', { 
                plano: Session.data.plan, 
                adulto: input, 
                cupom: Session.data.code 
            });
            
            return { 
                text: [
                    CONTENT.signing.summaryHeader, 
                    `Plano: ${Session.data.plan}`, 
                    `Adulto: ${input}`, 
                    `Link: ${url}`, 
                    CONTENT.signing.waitLink
                ], 
                newState: 'MENU' 
            };
        }
    }
};

// --- TESTE (Fluxo Condicional e Agendamento) ---
const FlowTesting = {
    start: () => {
        // Verifica Horário Comercial
        if (isBusinessHours()) {
            return { 
                text: [CONTENT.testing.guideLink, CONTENT.testing.options], 
                newState: 'TEST_OPT' 
            };
        } else {
            // Se fechado, força agendamento
            const [s, e] = [document.getElementById('workStart').value, document.getElementById('workEnd').value];
            const msg = CONTENT.testing.closed
                .replace("{START}", s)
                .replace("{END}", e);
                
            return { text: [msg], newState: 'TEST_OPT' };
        }
    },
    
    handle: (input, state) => {
        // Passo 1: Decisão (Testar Agora vs Agendar)
        if (state === 'TEST_OPT') {
            if (input === '1') {
                // Re-verifica horário caso o usuário tenha demorado
                if (!isBusinessHours()) {
                    return { text: ["Horário encerrado. Digite 2 para agendar."], newState: 'TEST_OPT' };
                }
                return { text: [CONTENT.testing.askName], newState: 'TEST_NAME' };
            }
            // Se for '2' ou qualquer outra coisa, vai para agendamento
            return { text: [CONTENT.testing.askSchedule], newState: 'TEST_SCHEDULE' };
        }
        
        // Passo 2 (Agendamento): Horário
        if (state === 'TEST_SCHEDULE') {
            Session.data.schedule = input;
            return { text: [CONTENT.testing.askName], newState: 'TEST_NAME' };
        }
        
        // Passo 3: Nome
        if (state === 'TEST_NAME') {
            Session.data.name = input;
            return { text: [CONTENT.testing.askCode], newState: 'TEST_CODE' };
        }
        
        // Passo 4: Código (Opcional)
        if (state === 'TEST_CODE') {
            Session.data.code = input; // Aceita qualquer input
            return { text: [CONTENT.testing.askAdult], newState: 'TEST_ADULT' };
        }
        
        // Passo 5: Finalização
        if (state === 'TEST_ADULT') {
            Session.data.adult = input;
            
            logger('WEBHOOK', 'Solicitação Teste', Session.data);
            
            const msg = CONTENT.testing.success.replace("{NAME}", Session.data.name);
            return { text: [msg], newState: 'MENU' };
        }
    }
};

// --- FAQ (Perguntas Frequentes) ---
const FlowFAQ = {
    start: () => {
        // Embaralha ordem das perguntas
        const shuffled = shuffleArray(CONTENT.faq);
        return { 
            text: ["Perguntas Frequentes:", ...shuffled], 
            newState: 'MENU' 
        };
    }
};

// --- SUPORTE HUMANO ---
const FlowSupport = {
    start: () => {
        logger('WEBHOOK', 'Humano Solicitado', { session: Session.id });
        return { 
            text: [CONTENT.support], 
            newState: 'MENU' 
        };
    }
};