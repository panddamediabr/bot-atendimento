/* =================================================================
   MAIN CONTROLLER (ROUTER E UI) - VERSÃO MENSAGEM ÚNICA (LEADS)
   ================================================================= */

// --- ROUTER PRINCIPAL ---
async function processMessage(msg) {
    const clean = msg.trim();
    
    // RESET GLOBAL (Voltar ao Menu com 0)
    if (clean === '0') {
        Session.state = 'MENU';
        Session.data = {};
        const res = FlowMenu.getOptions();
        await sendBotMessages(res);
        updateStatusUI();
        return;
    }

    let res = { text: [], newState: Session.state };
    
    // Lógica de Roteamento baseada no Estado
    if (Session.state === 'START') {
        // Primeiro contato ou entrada manual
        const greetingRes = FlowMenu.getOptions();
        res = { text: greetingRes, newState: 'MENU' };
    }
    else if (Session.state === 'MENU') {
        res = FlowMenu.handle(clean);
    }
    else if (Session.state.startsWith('SIGN')) {
        res = FlowSigning.handle(clean, Session.state);
    }
    else if (Session.state.startsWith('TEST')) {
        res = FlowTesting.handle(clean, Session.state);
    }
    else {
        // Fallback para entradas não reconhecidas
        res = { text: [CONTENT.errors.fallback], newState: Session.state };
    }

    // Atualização do Estado da Sessão
    if (res.newState) Session.state = res.newState;
    
    updateStatusUI();

    // Envio para a Engine de exibição
    if (res.text && res.text.length > 0) {
        await sendBotMessages(res.text);
    }
}

// --- ENGINE DE ENVIO (AGRUPAMENTO PARA NOTIFICAÇÃO) ---
async function sendBotMessages(msgs) {
    if (!msgs || msgs.length === 0) return;

    // 1. AGRUPAMENTO: Transforma o array em um único bloco de texto
    // Isso simula a limitação técnica da resposta via notificação.
    const textoAgrupado = msgs.join('\n\n');
    
    // 2. PROCESSAMENTO: Aplica Spintax no bloco inteiro
    const finalText = processSpintax(textoAgrupado);
    
    // 3. DELAY: Calcula o tempo baseado no tamanho do bloco total
    // A lógica no engine.js lerá o comprimento total e aplicará jitter.
    const delayMs = calculateServerDelay(finalText.length);
    
    // Log detalhado no painel de debug
    logger('SERVER', '⏳ Delay Agrupado (Modo Lead)', { 
        tamanho_total: finalText.length, 
        tempo_espera: (delayMs / 1000).toFixed(2) + 's',
        bolhas_originais: msgs.length 
    });
    
    // 4. ESPERA: Simula o processamento do servidor (time.sleep)
    await new Promise(r => setTimeout(r, delayMs));
    
    // 5. EXIBIÇÃO: Gera apenas UM balão de mensagem no chat
    addMsg(finalText, 'bot');
}

// --- AUXILIARES DE INTERFACE ---
function addMsg(txt, type) {
    const box = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    
    // Converte quebras de linha em HTML e aplica negrito simples
    div.innerHTML = txt
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendUserMessage() {
    const inp = document.getElementById('userInput');
    const txt = inp.value;
    if (!txt) return;
    
    addMsg(txt, 'user');
    processMessage(txt);
    inp.value = '';
}

function handleEnter(e) { 
    if (e.key === 'Enter') sendUserMessage(); 
}

function updateStatusUI() {
    document.getElementById('displayState').innerText = Session.state;
    document.getElementById('displaySession').innerText = Session.id;
    document.getElementById('displayFirstContact').innerText = Session.firstContact;
}

function restartChat() {
    // Limpa UI
    document.getElementById('chatBox').innerHTML = ''; 
    document.getElementById('logsPanel').innerHTML = '';
    
    // Reset da Sessão de Atendimento
    Session.state = 'START'; 
    Session.firstContact = true; 
    Session.data = {}; 
    Session.id = 'SES-' + Math.floor(Math.random() * 9999);
    
    updatePhoneClock(); 
    logger('SYSTEM', 'Sessão Reiniciada', { session_id: Session.id });
    
    // Início automático do atendimento
    processMessage('');
}

function clearLogs() { 
    document.getElementById('logsPanel').innerHTML = ''; 
}

function toggleConfig() { 
    document.getElementById('appContainer').classList.toggle('show-config'); 
}

// --- INICIALIZAÇÃO ---
updatePhoneClock();
// Pequeno delay para garantir carregamento dos arquivos externos
setTimeout(() => restartChat(), 800);