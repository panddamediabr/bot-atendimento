/* MAIN CONTROLLER - ONE-SHOT & RESPONSIVE */

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

// ONE-SHOT LOGIC (Mensagem Única)
async function sendBotMessages(msgs) {
    if (!msgs || msgs.length === 0) return;
    
    const textoAgrupado = msgs.join('\n\n'); // Simula a junção para Notificação
    const finalText = processSpintax(textoAgrupado);
    const delayMs = calculateServerDelay(finalText.length);
    
    logger('SERVER', '⏳ Delay Agrupado', { chars: finalText.length, time: (delayMs/1000).toFixed(2)+'s' });
    
    await new Promise(r => setTimeout(r, delayMs));
    addMsg(finalText, 'bot');
}

// SINCRONIA MOBILE
function syncTime(val) {
    document.getElementById('simulatedTime').value = val;
    document.getElementById('simulatedTimeMobile').value = val;
    updatePhoneClock();
}

function updateStatusUI() {
    const state = Session.state;
    document.getElementById('displayState').innerText = state;
    document.getElementById('displayFirstContact').innerText = Session.firstContact;
    if(document.getElementById('displayStateMobile')) 
        document.getElementById('displayStateMobile').innerText = state;
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

setTimeout(() => restartChat(), 800);