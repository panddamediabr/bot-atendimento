/* ENGINE TÉCNICA */

// --- LOGGING ---
function formatJSON(obj) {
    let json = JSON.stringify(obj, null, 2);
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-num';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) cls = 'json-key'; else cls = 'json-string';
        } else if (/true|false/.test(match)) cls = 'json-bool';
        else if (/null/.test(match)) cls = 'json-null';
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
function logger(type, title, data) {
    const panel = document.getElementById('logsPanel');
    const simTime = document.getElementById('simulatedTime').value;
    const html = `<div class="log-entry border-${type}"><div class="log-header"><div><span class="log-tag tag-${type}">${type}</span><span style="font-weight:bold; color:#fff;">${title}</span></div><span style="color:#666; font-size:0.7rem;">${simTime}</span></div><div class="log-data">${formatJSON(data)}</div></div>`;
    panel.insertAdjacentHTML('afterbegin', html);
}

// --- TEXT TOOLS ---
function processSpintax(text) {
    return text.replace(/\{([^{}]+)\}/g, (match, group) => {
        const options = group.split('|');
        return options[Math.floor(Math.random() * options.length)];
    });
}
function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function shuffleArray(arr) {
    let a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// --- TIME ENGINE ---
function getSimulatedDate() {
    const [h, m] = document.getElementById('simulatedTime').value.split(':');
    const now = new Date(); now.setHours(h, m, 0, 0); return now;
}
function updatePhoneClock() {
    document.getElementById('phoneClock').innerText = document.getElementById('simulatedTime').value;
}
function getGreeting() {
    const h = getSimulatedDate().getHours();
    if (h >= 0 && h < 5) return "{Olá|Oi|Boa noite}";
    if (h >= 5 && h < 12) return "{Bom dia|Olá, bom dia|Dia}";
    if (h >= 12 && h < 18) return "{Boa tarde|Olá, boa tarde|Tarde}";
    return "{Boa noite|Olá, boa noite|Noite}";
}
function isBusinessHours() {
    const now = getSimulatedDate(); const nowVal = now.getHours() * 60 + now.getMinutes();
    const [sH, sM] = document.getElementById('workStart').value.split(':');
    const [eH, eM] = document.getElementById('workEnd').value.split(':');
    return nowVal >= (parseInt(sH)*60 + parseInt(sM)) && nowVal < (parseInt(eH)*60 + parseInt(eM));
}

// --- SMART DELAY CALCULATOR ---
function calculateServerDelay(textLength) {
    // Limite para considerar "Texto Curto" (Digitação Manual)
    const LIMITE_CURTO = 60; 
    
    // CENÁRIO 1: Texto Longo (Menu, Textão) -> Simula "Colar" (Rápido)
    if (textLength > LIMITE_CURTO) {
        // Entre 2.0s e 3.5s
        const delayColar = 2000 + (Math.random() * 1500);
        return Math.floor(delayColar);
    } 
    // CENÁRIO 2: Texto Curto -> Simula Digitação Manual (Mais lento por letra)
    else {
        const velocidadeHumana = parseInt(document.getElementById('msPerChar').value) || 60;
        const delayDigitar = 1000 + (textLength * velocidadeHumana) + ((Math.random() * 400) - 200);
        return Math.floor(delayDigitar);
    }
}