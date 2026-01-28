/* ENGINE TÉCNICA */
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

function calculateServerDelay(textLength) {
    const ms = parseInt(document.getElementById('msPerChar').value);
    const total = 1000 + (textLength * ms) + ((Math.random()*200)-100);
    return Math.floor(Math.max(1000, Math.min(8000, total)));
}