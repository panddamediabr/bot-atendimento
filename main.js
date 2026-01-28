/* MAIN CONTROLLER */

async function processMessage(msg) {
    const clean = msg.trim();
    if (clean === '0') {
        Session.state = 'MENU';
        await sendBotMessages(FlowMenu.getOptions());
        updateStatusUI();
        return;
    }

    let res = { text: [], newState: Session.state };
    if (Session.state === 'START') res = { text: FlowMenu.getOptions(), newState: 'MENU' };
    else if (Session.state === 'MENU') res = FlowMenu.handle(clean);
    else if (Session.state.startsWith('SIGN')) res = FlowSigning.handle(clean, Session.state);
    else if (Session.state.startsWith('TEST')) res = FlowTesting.handle(clean, Session.state);
    else res = { text: [CONTENT.errors.fallback], newState: Session.state };

    if (res.newState) Session.state = res.newState;
    updateStatusUI();
    if (res.text) await sendBotMessages(res.text);
}

// ENGINE DE ENVIO ONE-SHOT (Agrupa mensagens para notificação)
async function sendBotMessages(msgs) {
    if (!msgs || msgs.length === 0) return;

    // JUNTAR MENSAGENS
    const textoAgrupado = msgs.join('\n\n');
    const finalText = processSpintax(textoAgrupado);
    
    // SMART DELAY (Calcula baseado no tamanho do bloco todo)
    const delayMs = calculateServerDelay(finalText.length);
    
    logger('SERVER', '⏳ Delay Smart', { 
        chars: finalText.length, 
        tempo: (delayMs / 1000).toFixed(2) + 's',
        tipo: finalText.length > 60 ? 'Colar (Longo)' : 'Digitar (Curto)'
    });
    
    await new Promise(r => setTimeout(r, delayMs));
    addMsg(finalText, 'bot');
}

// SINCRONIA MOBILE
function syncTime(val) {
    const desk = document.getElementById('simulatedTime');
    const mob = document.getElementById('simulatedTimeMobile');
    if(desk) desk.value = val;
    if(mob) mob.value = val;
    updatePhoneClock();
}

function updateStatusUI() {
    const state = Session.state;
    if(document.getElementById('displayState')) document.getElementById('displayState').innerText = state;
    if(document.getElementById('displayFirstContact')) document.getElementById('displayFirstContact').innerText = Session.firstContact;
    if(document.getElementById('displayStateMobile')) document.getElementById('displayStateMobile').innerText = state;
}

function addMsg(txt, type) {
    const box = document.getElementById('chatBox');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = txt.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function sendUserMessage() {
    const inp = document.getElementById('userInput');
    if (!inp.value) return;
    addMsg(inp.value, 'user');
    processMessage(inp.value);
    inp.value = '';
}

function handleEnter(e) { if (e.key === 'Enter') sendUserMessage(); }

function restartChat() {
    document.getElementById('chatBox').innerHTML = '';
    document.getElementById('logsPanel').innerHTML = '';
    Session.state = 'START'; Session.firstContact = true; Session.data = {};
    Session.id = 'SES-' + Math.floor(Math.random() * 9999);
    updateStatusUI();
    updatePhoneClock();
    processMessage('');
}

// Init
updatePhoneClock();
setTimeout(() => restartChat(), 500);