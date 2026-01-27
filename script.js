/* =================================================================
   1. SISTEMA DE LOGS & UTILS
   ================================================================= */
function formatJSON(obj) {
    let json = JSON.stringify(obj, null, 2);
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-num';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) cls = 'json-key';
            else cls = 'json-string';
        } else if (/true|false/.test(match)) cls = 'json-bool';
        else if (/null/.test(match)) cls = 'json-null';
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function logger(type, title, data) {
    const panel = document.getElementById('logsPanel');
    const simTime = document.getElementById('simulatedTime').value;
    
    const html = `
        <div class="log-entry border-${type}">
            <div class="log-header">
                <div>
                    <span class="log-tag tag-${type}">${type}</span>
                    <span style="font-weight:bold; color:#fff;">${title}</span>
                </div>
                <span style="color:#666; font-size:0.7rem;">${simTime}</span>
            </div>
            <div class="log-data">${formatJSON(data)}</div>
        </div>
    `;
    panel.insertAdjacentHTML('afterbegin', html);
}

// Utilitários de Texto
function processSpintax(text) {
    return text.replace(/\{([^{}]+)\}/g, (match, group) => {
        const options = group.split('|');
        return options[Math.floor(Math.random() * options.length)];
    });
}

function shuffleArray(arr) {
    let a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* =================================================================
   2. ENGINE DE TEMPO (TIME TRAVEL)
   ================================================================= */
function getSimulatedDate() {
    const simTime = document.getElementById('simulatedTime').value;
    const now = new Date();
    const [h, m] = simTime.split(':');
    now.setHours(h, m, 0, 0);
    return now;
}

function updatePhoneClock() {
    document.getElementById('phoneClock').innerText = document.getElementById('simulatedTime').value;
}

function getGreeting() {
    const h = getSimulatedDate().getHours();
    let p = "";
    let t = "";

    // 00:00 - 04:59 (Madrugada/Neutro)
    if (h >= 0 && h < 5) {
        p = "Madrugada"; t = "{Olá|Oi|Boa noite}";
    }
    // 05:00 - 11:59 (Bom dia)
    else if (h >= 5 && h < 12) {
        p = "Manhã"; t = "{Bom dia|Olá, bom dia|Dia}";
    }
    // 12:00 - 17:59 (Boa tarde)
    else if (h >= 12 && h < 18) {
        p = "Tarde"; t = "{Boa tarde|Olá, boa tarde|Tarde}";
    }
    // 18:00 - 23:59 (Boa noite)
    else {
        p = "Noite"; t = "{Boa noite|Olá, boa noite|Noite}";
    }

    logger('TIME', 'Cálculo Saudação', { hora: h, periodo: p, template: t });
    return t;
}

function isBusinessHours() {
    const now = getSimulatedDate();
    const nowVal = now.getHours() * 60 + now.getMinutes();
    
    const [sH, sM] = document.getElementById('workStart').value.split(':');
    const [eH, eM] = document.getElementById('workEnd').value.split(':');
    
    const startVal = parseInt(sH) * 60 + parseInt(sM);
    const endVal = parseInt(eH) * 60 + parseInt(eM);

    const isOpen = nowVal >= startVal && nowVal < endVal;
    return isOpen;
}

/* =================================================================
   3. ENGINE DE DELAY (SIMULAÇÃO DE SERVIDOR)
   ================================================================= */
function calculateServerDelay(textLength) {
    const msPerChar = parseInt(document.getElementById('msPerChar').value);
    const baseLatency = 1000;
    const typingTime = textLength * msPerChar;
    
    // Jitter (Variação de 20%)
    const jitter = typingTime * 0.2;
    const randomJitter = (Math.random() * jitter * 2) - jitter;
    
    const total = baseLatency + typingTime + randomJitter;
    // Teto de 8 segundos, Piso de 1 segundo
    return Math.floor(Math.max(1000, Math.min(8000, total)));
}

/* =================================================================
   4. DEFINIÇÃO DE FLUXOS (REGRAS DE NEGÓCIO)
   ================================================================= */
const Session = { 
    id: 'SES-INIT', 
    state: 'START', 
    firstContact: true, // Controla se dá Bom dia ou não
    data: {} 
};

// --- MENU PRINCIPAL (COM DUPLA VARIAÇÃO) ---
const FlowMenu = {
    // 5 Templates para Primeiro Contato
    templatesFirst: [
        "{Olá|Oi|Opa}, {SAUDACAO_TEMPO}! 🐼 Bem-vindo ao atendimento **Pandda**. Em que {posso ajudar|posso ser útil} hoje? 👇",
        "{Fala|E aí|Tudo bem}, {SAUDACAO_TEMPO}! 😃 Que bom te ver no **Pandda**. O que vamos {assistir|resolver} hoje? Escolha uma opção:",
        "{SAUDACAO_TEMPO}. Você está no auto-atendimento **Pandda**. 🚀 Para agilizar, escolha um dos assuntos abaixo:",
        "{Olá|Oi}! {SAUDACAO_TEMPO}. Somos a equipe **Pandda**. 🐼 Para começar, {digite|selecione} a opção desejada:",
        "{SAUDACAO_TEMPO}! 📺 O **Pandda** está pronto para te atender. Como podemos ajudar com seu acesso hoje?"
    ],
    // 5 Templates para Retorno (Reset)
    templatesReturn: [
        "{Entendido|Certo|Ok}! 👍 Voltando ao {início|menu principal}. O que mais você precisa?",
        "Menu reiniciado! 🔄 Escolha uma das opções abaixo:",
        "{Sem problemas|Combinado}. 🎬 Aqui estão as opções novamente para você:",
        "Segue o menu principal. 👇 Digite o número da opção:",
        "Voltando... 🔙 Como posso te ajudar agora?"
    ],
    
    getOptions: () => {
        let template = "";
        
        if (Session.firstContact) {
            // Usa lista A e injeta Saudação Temporal
            template = FlowMenu.templatesFirst[Math.floor(Math.random() * FlowMenu.templatesFirst.length)];
            template = template.replace("{SAUDACAO_TEMPO}", getGreeting());
            Session.firstContact = false; // Marca que já falou oi
        } else {
            // Usa lista B
            template = FlowMenu.templatesReturn[Math.floor(Math.random() * FlowMenu.templatesReturn.length)];
        }

        const menu = "1️⃣ Como funciona\n2️⃣ Planos\n3️⃣ Assinar\n4️⃣ Testar\n5️⃣ Dúvidas\n6️⃣ Falar com atendente";
        return [template, menu];
    },

    handle: (input) => {
        switch(input) {
            case '1': return FlowHowItWorks.start();
            case '2': return FlowPlans.start();
            case '3': return FlowSigning.start();
            case '4': return FlowTesting.start();
            case '5': return FlowFAQ.start();
            case '6': return FlowSupport.start();
            default: return { text: ["Opção inválida. Digite de 1 a 6."], newState: 'MENU' };
        }
    }
};

// --- COMO FUNCIONA (EMBARALHADO) ---
const FlowHowItWorks = {
    phrases: [
        "Funciona 100% via {internet|conexão web} 🌐",
        "Sem {cabos|antenas|aparelhos extras}.",
        "Compatível com Smart TV, Celular, TV Box e PC 📺",
        "Sistema **DualAPP**: 2 apps para {maior estabilidade|não travar} 🚀",
        "Basta instalar e logar com os dados que fornecemos 🔑"
    ],
    start: () => {
        const shuffled = shuffleArray(FlowHowItWorks.phrases).map(t => processSpintax(t));
        logger('ENGINE', 'Shuffle Info', { count: shuffled.length });
        return { text: ["Veja como é simples:", ...shuffled, "Digite 0 para voltar."], newState: 'MENU' };
    }
};

// --- PLANOS ---
const FlowPlans = {
    start: () => ({
        text: [
            "Confira nossos planos Mensais (DualAPP):",
            "1️⃣ **Plano Base (1 tela):** R$ 34,90\n2️⃣ **Plano Dual (2 telas):** R$ 52,80\n3️⃣ **Plano Família (3 telas):** R$ 70,70",
            "Digite **3** para Assinar agora ou **0** para Voltar."
        ],
        newState: 'MENU'
    })
};

// --- ASSINATURA ---
const FlowSigning = {
    start: () => ({ text: ["Qual plano deseja? (Digite 1, 2 ou 3)"], newState: 'SIGN_PLAN' }),
    handle: (input, state) => {
        if (state === 'SIGN_PLAN') {
            Session.data.plan = input;
            return { text: ["Possui código de indicação? Se sim, digite. Se não, digite **Não**."], newState: 'SIGN_CODE' };
        }
        if (state === 'SIGN_CODE') {
            const clean = input.toLowerCase().replace(/['"]/g, '').trim();
            if (['nao', 'não', 'n'].includes(clean)) {
                Session.data.code = null;
                return { text: ["Sem código. Deseja canais Adultos? (Sim/Não)"], newState: 'SIGN_ADULT' };
            }
            
            // Validação Mock DB
            const validList = document.getElementById('validCodes').value.toUpperCase().split(',').map(c=>c.trim());
            const isValid = validList.includes(input.toUpperCase());
            
            logger('DB', 'Query Code', { input: input, found: isValid });
            
            if (isValid) {
                Session.data.code = input.toUpperCase();
                return { text: ["Código Válido! ✅ Ganhou bônus. Deseja Adultos? (Sim/Não)"], newState: 'SIGN_ADULT' };
            } else {
                return { text: ["Código inválido ❌. Tente novamente ou digite 'Não'."], newState: 'SIGN_CODE' };
            }
        }
        if (state === 'SIGN_ADULT') {
            Session.data.adult = input;
            const url = `pagar.pandda.vip?ref=${Session.id}&plan=${Session.data.plan}`;
            
            logger('WEBHOOK', 'Discord: Pagamento', { plan: Session.data.plan, url: url });
            
            return { 
                text: [
                    "📝 **Resumo do Pedido:**",
                    `Plano: Opção ${Session.data.plan}`,
                    `Código: ${Session.data.code || 'Nenhum'}`,
                    `Adulto: ${input}`,
                    `🔗 Link: ${url}`,
                    "Aguardando confirmação..."
                ], 
                newState: 'MENU' 
            };
        }
    }
};

// --- TESTE ---
const FlowTesting = {
    start: () => {
        if (isBusinessHours()) {
            return { 
                text: ["Instale o app: pandda.vip/guia", "Digite **1** p/ Testar Agora ou **2** p/ Agendar."], 
                newState: 'TEST_OPT' 
            };
        } else {
            const [sH, sM] = document.getElementById('workStart').value.split(':');
            const [eH, eM] = document.getElementById('workEnd').value.split(':');
            return {
                text: [
                    `Ops! Geração de testes apenas das ${sH}:${sM} às ${eH}:${eM}. 🕒`,
                    "Mas você pode agendar para amanhã.",
                    "Digite **2** para Agendar."
                ],
                newState: 'TEST_OPT'
            };
        }
    },
    handle: (input, state) => {
        if (state === 'TEST_OPT') {
            if (input === '1') {
                if (!isBusinessHours()) return { text: ["Horário encerrado. Digite 2 para agendar."], newState: 'TEST_OPT' };
                return { text: ["Ok! Qual o seu Nome?"], newState: 'TEST_NAME' };
            } else {
                return { text: ["Para qual horário deseja agendar? (Ex: 10h)"], newState: 'TEST_SCHEDULE' };
            }
        }
        if (state === 'TEST_SCHEDULE') {
            Session.data.schedule = input;
            return { text: ["Certo. Qual seu nome?"], newState: 'TEST_NAME' };
        }
        if (state === 'TEST_NAME') {
            Session.data.name = input;
            return { text: ["Tem código de indicação? (Digite o código ou Não)"], newState: 'TEST_CODE' };
        }
        if (state === 'TEST_CODE') {
            Session.data.code = input;
            return { text: ["Liberar conteúdo Adulto? (Sim/Não)"], newState: 'TEST_ADULT' };
        }
        if (state === 'TEST_ADULT') {
            Session.data.adult = input;
            
            logger('WEBHOOK', 'Discord: Teste', Session.data);

            return { 
                text: [`Obrigado ${Session.data.name}! Solicitação enviada. Aguarde seus dados.`], 
                newState: 'MENU' 
            };
        }
    }
};

// --- FAQ ---
const FlowFAQ = {
    qs: [
        "**Onde usar?** 🌍 Smart TV, Celular, PC.",
        "**Pagamento?** 💳 Pix e Cartão.",
        "**É assinatura?** ✍️ Não, é pré-pago sem fidelidade.",
        "**Quantas telas?** 📺 1, 2 ou 3 dependendo do plano."
    ],
    start: () => {
        const shuffled = shuffleArray(FlowFAQ.qs);
        return { text: ["Dúvidas frequentes:", ...shuffled, "Mais em: pandda.vip/FAQ"], newState: 'MENU' };
    }
};

const FlowSupport = {
    start: () => {
        logger('WEBHOOK', 'Chamar Humano', { session: Session.id });
        return { text: ["Chamando um atendente humano... 👩‍💻 Aguarde."], newState: 'MENU' };
    }
};

/* =================================================================
   5. CONTROLADOR PRINCIPAL (ROUTER)
   ================================================================= */
async function processMessage(msg) {
    const clean = msg.trim();
    
    // RESET GLOBAL (Voltar ao Menu)
    if (clean === '0') {
        Session.state = 'MENU';
        Session.data = {};
        const res = FlowMenu.getOptions();
        await sendBotMessages(res);
        updateStatusUI();
        return;
    }

    let response = { text: [], newState: Session.state };

    // Roteamento
    if (Session.state === 'START') {
        const res = FlowMenu.getOptions();
        response = { text: res, newState: 'MENU' };
    }
    else if (Session.state === 'MENU') {
        response = FlowMenu.handle(clean);
    }
    else if (Session.state.startsWith('SIGN')) {
        response = FlowSigning.handle(clean, Session.state);
    }
    else if (Session.state.startsWith('TEST')) {
        response = FlowTesting.handle(clean, Session.state);
    }
    else {
        response = { text: ["Não entendi. Digite 0 para voltar."], newState: Session.state };
    }

    if (response.newState) Session.state = response.newState;
    updateStatusUI();

    if (response.text && response.text.length > 0) {
        await sendBotMessages(response.text);
    }
}

/* =================================================================
   6. UI INTERFACE & EVENTOS
   ================================================================= */
async function sendBotMessages(msgs) {
    for (let rawText of msgs) {
        // 1. Spintax
        const finalText = processSpintax(rawText);
        
        // 2. Delay Server
        const delayMs = calculateServerDelay(finalText.length);
        
        logger('SERVER', '⏳ Delay', { chars: finalText.length, delay: delayMs + 'ms' });
        
        // Espera (Simulação de Server processing)
        await new Promise(r => setTimeout(r, delayMs));
        
        // Envia
        addMsg(finalText, 'bot');
        
        // Pausa entre balões
        await new Promise(r => setTimeout(r, 600));
    }
}

function addMsg(txt, type) {
    const box = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = txt.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendUserMessage() {
    const inp = document.getElementById('userInput');
    if(!inp.value) return;
    addMsg(inp.value, 'user');
    processMessage(inp.value);
    inp.value = '';
}

function handleEnter(e) { if(e.key === 'Enter') sendUserMessage(); }

function updateStatusUI() {
    document.getElementById('displayState').innerText = Session.state;
    document.getElementById('displaySession').innerText = Session.id;
    document.getElementById('displayFirstContact').innerText = Session.firstContact;
}

function restartChat() {
    document.getElementById('chatBox').innerHTML = '';
    document.getElementById('logsPanel').innerHTML = '';
    
    // Reset da Sessão
    Session.state = 'START';
    Session.firstContact = true;
    Session.data = {};
    Session.id = 'SES-' + Math.floor(Math.random()*9999);
    
    updatePhoneClock();
    logger('SYSTEM', 'Hard Reset', {});
    
    // Gatilho inicial
    processMessage('');
}

function clearLogs() { document.getElementById('logsPanel').innerHTML = ''; }
function toggleConfig() { document.getElementById('appContainer').classList.toggle('show-config'); }

// Inicialização Automática
updatePhoneClock();
setTimeout(() => restartChat(), 800);