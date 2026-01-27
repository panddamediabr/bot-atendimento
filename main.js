/* =================================================================
   MAIN CONTROLLER (ROUTER E UI)
   ================================================================= */

// --- ROUTER ---
async function processMessage(msg) {
    const clean = msg.trim();
    
    // RESET GLOBAL
    if (clean === '0') {
        Session.state = 'MENU';
        const res = FlowMenu.getOptions();
        await sendBotMessages(res);
        updateStatusUI();
        return;
    }

    let res = { text: [], newState: Session.state };
    
    if (Session.state === 'START') res = { text: FlowMenu.getOptions()[0], newState: 'MENU' };
    else if (Session.state === 'MENU') res = FlowMenu.handle(clean);
    else if (Session.state.startsWith('SIGN')) res = FlowSigning.handle(clean, Session.state);
    else if (Session.state.startsWith('TEST')) res = FlowTesting.handle(clean, Session.state);
    else res = { text: [CONTENT.errors.fallback], newState: Session.state };

    if (res.newState) Session.state = res.newState;
    updateStatusUI();
    if (res.text) await sendBotMessages(res.text);
}

// --- SENDING LOGIC ---
async function sendBotMessages(msgs) {
    for (let raw of msgs) {
        if (!raw) continue;
        const final = processSpintax(raw);
        const delay = calculateServerDelay(final.length);
        
        logger('SERVER', 'Sending', { text: final, delay: delay });
        
        await new Promise(r => setTimeout(r, delay));
        addMsg(final, 'bot');
        await new Promise(r => setTimeout(r, 600));
    }
}

// --- UI HELPERS ---
function addMsg(txt, type) {
    const box = document.getElementById('chatBox');
    box.innerHTML += `<div class="message ${type}">${txt.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>`;
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
    document.getElementById('chatBox').innerHTML = ''; document.getElementById('logsPanel').innerHTML = '';
    Session.state = 'START'; Session.firstContact = true; Session.data = {}; Session.id = 'SES-'+Math.floor(Math.random()*999);
    updatePhoneClock(); logger('SYSTEM', 'Reset', {});
    // Auto start
    (async () => {
        const res = FlowMenu.getOptions();
        await sendBotMessages(res); 
        Session.state = 'MENU';
        updateStatusUI();
    })();
}

function clearLogs() { document.getElementById('logsPanel').innerHTML = ''; }
function toggleConfig() { document.getElementById('appContainer').classList.toggle('show-config'); }

// Init
updatePhoneClock();
setTimeout(() => restartChat(), 800);