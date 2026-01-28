/* FLUXOS DE NEGÓCIO */
const Session = { id: 'SES-INIT', state: 'START', firstContact: true, data: {} };

const FlowMenu = {
    getOptions: () => {
        let template = "";
        if (Session.firstContact) {
            template = CONTENT.greetings.firstContact[Math.floor(Math.random() * CONTENT.greetings.firstContact.length)];
            template = template.replace("{SAUDACAO_TEMPO}", getGreeting());
            Session.firstContact = false;
        } else {
            template = CONTENT.greetings.returnMenu[Math.floor(Math.random() * CONTENT.greetings.returnMenu.length)];
        }
        return [template, CONTENT.menuOptions];
    },
    handle: (input) => {
        switch(input) {
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

const FlowHowItWorks = {
    start: () => {
        const shuffled = shuffleArray(CONTENT.howItWorks).map(t => processSpintax(t));
        return { text: ["Veja como é simples:", ...shuffled, "Digite 0 para voltar."], newState: 'MENU' };
    }
};

const FlowPlans = {
    start: () => ({ text: [CONTENT.plans.intro, CONTENT.plans.list, CONTENT.plans.cta], newState: 'MENU' })
};

const FlowSigning = {
    start: () => ({ text: [CONTENT.signing.askPlan], newState: 'SIGN_PLAN' }),
    handle: (input, state) => {
        if (state === 'SIGN_PLAN') { Session.data.plan = input; return { text: [CONTENT.signing.askCode], newState: 'SIGN_CODE' }; }
        if (state === 'SIGN_CODE') {
            const clean = input.toLowerCase().replace(/['"]/g, '').trim();
            if (['nao', 'não', 'n'].includes(clean)) { Session.data.code = null; return { text: [CONTENT.signing.noCode, CONTENT.signing.askAdult], newState: 'SIGN_ADULT' }; }
            const valid = document.getElementById('validCodes').value.toUpperCase().includes(input.toUpperCase());
            logger('DB', 'Check Code', { code: input, valid: valid });
            if (valid) { Session.data.code = input.toUpperCase(); return { text: [CONTENT.signing.successCode, CONTENT.signing.askAdult], newState: 'SIGN_ADULT' }; }
            else { return { text: [CONTENT.signing.errorCode], newState: 'SIGN_CODE' }; }
        }
        if (state === 'SIGN_ADULT') {
            Session.data.adult = input;
            const url = `pagar.pandda.vip?id=${Session.id}`;
            logger('WEBHOOK', 'Venda Criada', { plan: Session.data.plan, adult: input });
            return { text: [CONTENT.signing.summaryHeader, `Plano: ${Session.data.plan}`, `Adulto: ${input}`, `Link: ${url}`, CONTENT.signing.waitLink], newState: 'MENU' };
        }
    }
};

const FlowTesting = {
    start: () => {
        if (isBusinessHours()) return { text: [CONTENT.testing.guideLink, CONTENT.testing.options], newState: 'TEST_OPT' };
        else {
            const [s, e] = [document.getElementById('workStart').value, document.getElementById('workEnd').value];
            return { text: [CONTENT.testing.closed.replace("{START}", s).replace("{END}", e)], newState: 'TEST_OPT' };
        }
    },
    handle: (input, state) => {
        if (state === 'TEST_OPT') {
            if (input === '1') {
                if (!isBusinessHours()) return { text: ["Fechado. Digite 2."], newState: 'TEST_OPT' };
                return { text: [CONTENT.testing.askName], newState: 'TEST_NAME' };
            }
            return { text: [CONTENT.testing.askSchedule], newState: 'TEST_SCHEDULE' };
        }
        if (state === 'TEST_SCHEDULE') { Session.data.schedule = input; return { text: [CONTENT.testing.askName], newState: 'TEST_NAME' }; }
        if (state === 'TEST_NAME') { Session.data.name = input; return { text: [CONTENT.testing.askCode], newState: 'TEST_CODE' }; }
        if (state === 'TEST_CODE') { Session.data.code = input; return { text: [CONTENT.testing.askAdult], newState: 'TEST_ADULT' }; }
        if (state === 'TEST_ADULT') {
            Session.data.adult = input;
            logger('WEBHOOK', 'Solicitacao Teste', Session.data);
            return { text: [CONTENT.testing.success.replace("{NAME}", Session.data.name)], newState: 'MENU' };
        }
    }
};

const FlowFAQ = {
    start: () => { const shuffled = shuffleArray(CONTENT.faq); return { text: ["FAQ:", ...shuffled], newState: 'MENU' }; }
};
const FlowSupport = {
    start: () => { logger('WEBHOOK', 'Humano Solicitado', {}); return { text: [CONTENT.support], newState: 'MENU' }; }
};