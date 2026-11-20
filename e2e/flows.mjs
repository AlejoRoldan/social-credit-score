import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { serve } from '../backend/server.mjs';
import { launchBrowser } from './browser.mjs';

const members = ['ana', 'camilo', 'elena', 'jose', 'luz'];
let server;
let browser;
let url;

before(async () => {
  server = await serve(0);
  url = 'http://127.0.0.1:' + server.address().port + '/';
  browser = await launchBrowser();
});

after(async () => {
  try {
    await browser?.close();
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
  }
});

async function open(t, width) {
  const page = await browser.page(t, width);
  await page.open(url);
  return page;
}

async function openDemoControls(page) {
  if (!await page.evaluate('document.querySelector(".demo-controls").open')) {
    await page.click('.demo-controls summary');
  }
}
async function demoAction(page, id) {
  await openDemoControls(page);
  await page.click(`#${id}`);
}
async function changeProfile(page, id) {
  await openDemoControls(page);
  await page.select('#profile', id);
}
const navigate = (page, view) => page.click(`#navigation [data-go="${view}"]`);
const notVisible = async (page, selector) => assert.equal(await page.visible(selector), false, selector);

test('la práctica otorga un único bono privado al aprobar ambas competencias', async (t) => {
  const page = await open(t, 320);
  await navigate(page, 'score');
  await page.click('#score [data-go="education"]');
  await page.text('#education-practice', /1\.000\.000.*200\.000.*\$0 COP a capital.*Quedan.*1\.000\.000/);
  assert.equal(await page.evaluate(`(() => {
    const root = document.documentElement;
    root.style.fontSize = '200%';
    const fits = innerWidth === 320 && root.scrollWidth <= root.clientWidth;
    root.style.fontSize = '';
    return fits;
  })()`), true);

  await page.type('#education-capital', '240000');
  await page.click('#education-form input[value="principal"]');
  await page.type('#education-shortfall', '30000');
  await page.click('#education-form input[value="new-payment"]');
  await page.click('#education-form button[type="submit"]');
  await page.text('#education-result-title', /Revisa tus respuestas/);
  await page.text('#education-result-attempt', /Primer intento/);
  await page.text('#education-capital-feedback', /Resta del saldo solo/);
  assert.equal(await page.evaluate('document.querySelector("#education-cash-feedback").textContent'), '');

  await page.click('#education-retry');
  await page.text('#education-capital-case', /420\.000/);
  await page.type('#education-capital', '390000');
  await page.click('#education-form input[value="principal"]');
  await page.type('#education-shortfall', '0');
  await page.click('#education-form input[value="new-payment"]');
  await page.click('#education-form button[type="submit"]');
  await page.text('#education-result-title', /Revisa tus respuestas/);
  await page.text('#education-result-attempt', /Reintento 1/);
  await page.text('#education-cash-feedback', /Suma los pagos previstos/);
  assert.equal(await page.evaluate('document.querySelector("#education-capital-feedback").textContent'), '');

  await page.click('#education-retry');
  await page.text('#education-capital-case', /430\.000/);
  await page.type('#education-capital', '400000');
  await page.click('#education-form input[value="principal"]');
  await page.type('#education-shortfall', '30000');
  await page.click('#education-form input[value="new-payment"]');
  await page.click('#education-form button[type="submit"]');
  await page.text('#education-result-title', /\+2 puntos educativos/);
  await page.text('#education-result-attempt', /Reintento 2/);
  await notVisible(page, '#education-retry');

  await changeProfile(page, 'luz');
  await notVisible(page, '#education');
  await notVisible(page, '#own-education-bonus');
  assert.deepEqual(await page.evaluate(`['#own-education-bonus', '#education-result-title', '#education-result-attempt']
    .map(selector => document.querySelector(selector).textContent)`), ['', '', '']);
  assert.equal(await page.evaluate('document.querySelector("#education-form").hasAttribute("data-attempt-id")'), false);
  assert.equal(await page.evaluate('document.querySelector("#education-capital").value'), '');
  await changeProfile(page, 'diana');
  await page.reload();
  await page.text('#own-score-insufficient', /Historial insuficiente/);
  await page.text('#own-education-bonus', /\+2 por comprender capital e intereses/);
});

test('la evaluación avisa cuando el bono del primer intento queda solo en memoria', async (t) => {
  const page = await open(t);
  await navigate(page, 'score');
  await page.click('#score [data-go="education"]');
  await page.type('#education-capital', '285000');
  await page.click('#education-form input[value="principal"]');
  await page.type('#education-shortfall', '30000');
  await page.click('#education-form input[value="new-payment"]');
  await page.evaluate(`Storage.prototype.setItem = () => { throw new Error('Storage de prueba no disponible'); }`);
  await page.click('#education-form button[type="submit"]');
  await page.text('#education-result-attempt', /Primer intento/);
  await page.text('#education-result-title', /\+2 puntos educativos/);
  await page.text('#education-storage-note', /Al recargar, podrías perderlo/);
  await page.click('#education [data-go="score"]');
  await page.text('#own-education-storage-note', /Al recargar, podrías perderlo/);
  await page.reload();
  await page.text('#education-attempt-number', /Primer intento/);
  await notVisible(page, '#education-result');
});

async function openBallot(page, profile, version = 1) {
  await changeProfile(page, profile);
  await navigate(page, 'inbox');
  await page.click(`#notices button[data-version="${version}"]`);
  await page.text('#sheet-version', new RegExp('Versión ' + version));
}

async function startRequest(page, weeks = '4') {
  if (!await page.visible('#needs')) await navigate(page, 'application');
  await page.select('#amount', '300000');
  await page.select('#weeks', weeks);
  await page.click('#draft-submit');
  await page.text('#progress', /4 de 5/);
  await page.text('#circle-title', /Pendiente de respaldos/);
  await page.text('#support-next', /pedir respuesta.*invitar a otra persona/);
  assert.equal(await page.evaluate('document.querySelector("#review-button").disabled'), true);
}

async function approveGuided(page) {
  await demoAction(page, 'start-demo');
  await page.text('#sheet-votes', /4 de 5/);
  await page.click('[data-decision="approve"]');
  await page.click('#guided-return');
  await page.text('#applicant-disbursement', /Desembolso simulado registrado/);
}

async function tabTo(page, selector) {
  for (let step = 0; step < 32; step++) {
    if (await page.evaluate(`document.activeElement.matches(${JSON.stringify(selector)})`)) {
      assert.equal(await page.evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
      assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false, selector);
      return;
    }
    await page.key('Tab', 'Tab', 9);
  }
  assert.fail(`No se pudo enfocar con Tab: ${selector}`);
}

test('el HTML directo muestra cómo arrancar y la demo funciona por HTTP con teclado', async (t) => {
  const page = await browser.page(t, 320);
  await page.open(new URL('../frontend/index.html', import.meta.url).href, false);
  await page.text('#startup-message', /node serve\.mjs/);
  await notVisible(page, '#start-demo');
  await page.open(url);
  await notVisible(page, '#startup-message');
  await page.evaluate("document.documentElement.style.fontSize = '200%'");
  await page.key('Tab', 'Tab', 9);
  assert.equal(await page.evaluate('document.activeElement.tagName'), 'SUMMARY');
  await page.key('Enter', 'Enter', 13);
  await page.key('Tab', 'Tab', 9);
  assert.equal(await page.evaluate('document.activeElement.id'), 'profile');
  assert.equal(await page.evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
  await page.key('Tab', 'Tab', 9);
  assert.equal(await page.evaluate('document.activeElement.id'), 'start-demo');
  await page.key('Enter', 'Enter', 13);
  await page.text('#sheet-votes', /4 de 5/);
  for (const selector of ['[data-decision="approve"]', '#guided-return', '#open-account', '#review-payment']) {
    await tabTo(page, selector);
    await page.key('Enter', 'Enter', 13);
  }
  await page.text('#payment-summary', /Cuota 1.*66\.000/);
  await tabTo(page, '#payment-dialog [value="confirm"]');
  await page.key('Enter', 'Enter', 13);
  await page.text('#payment-receipt', /SIM-V1-C1/);
  await tabTo(page, '#navigation [data-go="application"]');
  await page.key('Enter', 'Enter', 13);
  await tabTo(page, '[data-intention="need-to-talk"]');
  await page.key('Enter', 'Enter', 13);
  assert.equal(await page.evaluate('document.activeElement.id'), 'account-help-title');
  await tabTo(page, '#account-help-reason');
  await page.key('ArrowDown', 'ArrowDown', 40);
  await tabTo(page, '#account-help-form button');
  await page.key('Enter', 'Enter', 13);
  await page.text('#account-help-status', /Solicitud simulada registrada/);
});

test('una sesión dañada recupera el recorrido normal y descarta solo la guía inválida', async (t) => {
  const page = await open(t);
  await page.evaluate("sessionStorage.setItem('credito-comunitario-hu-1-1', '{}')");
  await page.reload();
  await page.text('#home-title', /Un préstamo pequeño/);
  await startRequest(page, '8');
  await page.evaluate(`sessionStorage.setItem('credito-comunitario-hu-2-2', JSON.stringify({
    ...JSON.parse(sessionStorage.getItem('credito-comunitario-hu-2-2')),
    active: true,
    guided: {draft: {}, circle: {}}
  }))`);
  await page.reload();
  await page.text('#progress', /4 de 5/);
  await notVisible(page, '#exit-demo');
  await navigate(page, 'application');
  await page.click('#circle [data-go="needs"]');
  assert.equal(await page.evaluate('document.querySelector("#weeks").value'), '8');
  await demoAction(page, 'start-demo');
  await page.text('#sheet-votes', /4 de 5/);
});

test('solicitud normal, respaldo, pausa, costo, revisión, desembolso único y privacidad', async (t) => {
  const page = await open(t);
  await startRequest(page);
  await changeProfile(page, 'luz');
  await page.text('#commitment', /10\.000 COP.*cuota sin pagar.*votar por separado.*no cobra dinero/);
  await page.click('#response-form [value="confirmed"]');
  await page.text('#support-explanation', /Aceptaste.*Podrás votar cuando Diana.*envíe la ficha/);
  await notVisible(page, '#open-current-sheet');
  await changeProfile(page, 'diana');
  await page.click('#review-button');
  await page.text('#review [data-field="installment"]', /82\.500/);
  await page.text('#review [data-cost-warning]', /2\s*% semanal.*desembolso simulado quedará bloqueado/);
  await page.reload();
  await page.text('#review-title', /Revisa y envía/);
  await page.click('#send-form button[type="submit"]');
  await page.text('#success-title', /Solicitud pendiente de votos/);
  await page.text('#applicant-decision', /Faltan 5 votos/);
  await page.text('#applicant-disbursement', /Pendiente de aprobación/);

  await changeProfile(page, 'luz');
  await navigate(page, 'support');
  await page.click('#open-current-sheet');
  await page.text('#sheet-version', /Versión 1/);
  await page.text('#sheet-votes', /0 de 5 votos/);
  await openBallot(page, 'ana');
  await page.click('[data-decision="approve"]');
  await openBallot(page, 'camilo');
  await page.click('[data-decision="pause"]');
  await changeProfile(page, 'diana');
  await page.text('#success-title', /Solicitud pendiente de reunión/);
  await page.text('#applicant-decision', /El grupo debe reunirse.*retomar la votación/);
  await openBallot(page, 'camilo');
  await page.reload();
  await page.text('#sheet-status', /Pendiente de reunión/);
  await page.click('[data-decision="resume"]');
  await page.text('#sheet-votes', /0 de 5/);
  for (const member of members) {
    await openBallot(page, member);
    await page.click('[data-decision="approve"]');
  }
  await changeProfile(page, 'diana');
  await page.text('#success-title', /Desembolso bloqueado/);
  await page.text('#applicant-disbursement', /Bloqueado por costo/);
  await page.text('#applicant-disbursement-next', /plazo que cumpla el límite/);
  await navigate(page, 'finance');
  await page.text('#budget-credit', /1\.000\.000/);
  await navigate(page, 'application');
  await page.click('#edit-revision');
  await page.text('#revision-preview [data-cost-warning]', /desembolso simulado quedará bloqueado/);
  await page.select('#weeks', '5');
  await notVisible(page, '#revision-preview [data-cost-warning]');
  await page.click('#term-comparison summary');
  await page.select('#alternative-weeks', '8');
  await page.text('#current-term [data-field="weeks"]', /5 semanas/);
  await page.text('#alternative-term [data-field="installment"]', /41\.250/);
  await page.click('#choose-alternative');
  await page.reload();
  await page.text('#needs-title', /versión 2/);
  await page.text('#revision-preview [data-field="installment"]', /41\.250/);
  await notVisible(page, '#revision-preview [data-cost-warning]');
  await page.click('#draft-submit');

  await openBallot(page, 'ana', 1);
  await page.text('#sheet-history-restriction', /fue sustituida.*votación.*cerrada/);
  await notVisible(page, '[data-decision="approve"]');
  for (const member of members) {
    await openBallot(page, member, 2);
    await page.click('[data-decision="approve"]');
  }
  await changeProfile(page, 'diana');
  await page.reload();
  await page.text('#success-title', /Desembolso simulado registrado/);
  await page.text('#applicant-disbursement', /Desembolso simulado registrado/);
  await page.text('#open-account', /Ver mi crédito/);
  await notVisible(page, '#edit-revision');
  await page.text('[data-reminder-amount]', /41\.250/);
  await page.click('[data-intention="need-to-talk"]');
  assert.equal(await page.evaluate('document.activeElement.id'), 'account-help-title');
  await notVisible(page, '#account-help-status');
  await page.select('#account-help-reason', 'Tuve un gasto imprevisto');
  await navigate(page, 'application');
  await notVisible(page, '[data-reminder-help-status]');
  await page.click('[data-intention="need-to-talk"]');
  assert.equal(await page.evaluate('document.querySelector("#account-help-reason").value'), '');
  await notVisible(page, '#account-help-status');
  await page.select('#account-help-reason', 'Bajaron mis ingresos o ventas');
  await page.click('#account-help-form button');
  await page.text('#account-help-status', /Solicitud simulada registrada.*Bajaron mis ingresos o ventas/);
  await page.reload();
  await page.text('#account-help-status', /Solicitud simulada registrada/);
  await navigate(page, 'application');
  await page.text('[data-reminder-help-status]', /Ya registraste una solicitud de ayuda simulada/);
  await page.click('[data-intention="need-to-talk"]');
  await page.text('#account-help-status', /Bajaron mis ingresos o ventas/);
  await notVisible(page, '#account-help-form');
  await changeProfile(page, 'luz');
  await notVisible(page, '#account-help');
  await notVisible(page, '[data-reminder-help-status]');
  assert.equal(await page.evaluate('document.querySelector("#account-help-status").textContent'), '');
  await openBallot(page, 'ana', 2);
  await notVisible(page, '[data-reminder-amount]');
  await changeProfile(page, 'diana');
  await navigate(page, 'finance');
  await page.text('#budget-credit', /700\.000/);
  await page.reload();
  await page.text('#budget-credit', /700\.000/);
  await changeProfile(page, 'rosa');
  await notVisible(page, '#finance');
  await notVisible(page, '#navigation [data-go="finance"]');
});

test('la demo guiada conserva la reserva, los aportes y el avance de cada recorrido', async (t) => {
  const page = await open(t);
  await startRequest(page, '8');
  await approveGuided(page);
  await page.text('[data-reminder-amount]', /66\.000/);
  await page.click('[data-intention="plan-to-pay"]');
  await page.click('#simulate-installment');
  await page.text('#installment', /Ejercicio de impago con datos de ejemplo/);
  for (const [index, member] of members.entries()) {
    await changeProfile(page, member);
    await page.click('[data-reserve-vote="approve"]');
    if (index === 3) await page.reload();
  }
  await changeProfile(page, 'diana');
  await page.text('#installment-status', /25\.000/);
  await page.text('#installment-balances', /Saldo después \$95\.000/);
  for (const member of members) {
    await changeProfile(page, member);
    await page.text('#installment-own', /7\.000/);
    await notVisible(page, '#installment-breakdown');
    await page.click(member === 'luz' ? '[data-contribution="failed"]' : '[data-contribution="paid"]');
  }
  await changeProfile(page, 'diana');
  await page.text('#installment-breakdown', /Total pendiente \$7\.000/);
  await page.click('[data-variant="empty"]');
  for (const member of members) {
    await changeProfile(page, member);
    await page.click('[data-contribution="paid"]');
  }
  await changeProfile(page, 'diana');
  await page.text('#installment-breakdown', /Total pendiente \$10\.000/);
  await page.click('[data-variant="reserve"]');
  await page.text('#installment-breakdown', /Total pendiente \$7\.000/);
  await demoAction(page, 'exit-demo');
  await page.text('#progress', /4 de 5 respaldos confirmados/);
  await demoAction(page, 'start-demo');
  await page.text('#installment-breakdown', /Total pendiente \$7\.000/);
  await demoAction(page, 'reset-demo');
  await page.text('#sheet-votes', /4 de 5/);
  await notVisible(page, '#guided-return');
  await demoAction(page, 'exit-demo');
  await page.text('#progress', /4 de 5 respaldos confirmados/);
  await page.click('#circle [data-go="needs"]');
  assert.equal(await page.evaluate('document.querySelector("#weeks").value'), '8');
});

test('el ejercicio de círculos empieza sin respaldos y conserva su avance separado', async (t) => {
  const page = await open(t);
  await startRequest(page, '8');
  const exercise = new URL('?ejercicio=circulo', url).href;
  await page.open(exercise);
  await page.click('#home-application');
  await page.click('#draft-submit');
  await page.text('#progress', /0 de 5 respaldos confirmados/);
  for (const [index, member] of members.entries()) {
    await page.select('#invitee', member);
    await page.click('#invite-form button[type="submit"]');
    await changeProfile(page, member);
    await page.click('#response-form [value="confirmed"]');
    await changeProfile(page, 'diana');
    await page.text('#progress', new RegExp(`${index + 1} (de 5 )?respaldos confirmados`));
  }
  await page.click('#review-button');
  await page.click('#send-form button[type="submit"]');
  await openBallot(page, 'luz');
  await page.text('#sheet-votes', /0 de 5 votos/);
  await page.open(url);
  await page.text('#progress', /4 de 5 respaldos confirmados/);
  await page.open(exercise);
  await page.text('#sheet-votes', /0 de 5 votos/);
});

test('el simulador y Mi crédito muestran costos, pagos y ayuda privada durante el recorrido', async (t) => {
  const page = await open(t, 320);
  await page.click('#home-support');
  await page.text('#support-title', /Mi respaldo/);
  await navigate(page, 'home');
  await page.click('#home-application');
  await page.select('#amount', '400000');
  await page.select('#weeks', '8');
  await page.text('#revision-preview', /55\.000.*23 de noviembre de 2026.*440\.000/);
  await page.evaluate('document.querySelector("#term-comparison summary").focus()');
  await page.key('Enter', 'Enter', 13);
  await page.key('Tab', 'Tab', 9);
  assert.equal(await page.evaluate('document.activeElement.id'), 'alternative-weeks');
  await page.select('#alternative-weeks', '4');
  await page.text('#current-term', /8 semanas.*55\.000.*440\.000/);
  await page.text('#alternative-term', /4 semanas.*110\.000.*440\.000.*desembolso simulado quedará bloqueado/);
  assert.equal(await page.evaluate(`(() => {
    const current = document.querySelector('#current-term').getBoundingClientRect();
    const alternative = document.querySelector('#alternative-term').getBoundingClientRect();
    return current.bottom <= alternative.top && document.documentElement.scrollWidth <= innerWidth;
  })()`), true);
  await page.reload();
  assert.equal(await page.evaluate('document.querySelector("#weeks").value'), '8');
  await page.click('#term-comparison summary');
  await page.select('#alternative-weeks', '5');
  await page.evaluate('document.querySelector("#alternative-weeks").focus()');
  await page.key('Tab', 'Tab', 9);
  assert.equal(await page.evaluate('document.activeElement.id'), 'choose-alternative');
  await page.key('Enter', 'Enter', 13);
  assert.equal(await page.evaluate('document.activeElement.id'), 'weeks');
  await page.text('#revision-preview', /88\.000.*440\.000/);
  await page.reload();
  assert.equal(await page.evaluate('document.querySelector("#weeks").value'), '5');
  await notVisible(page, '#navigation [data-go="account"]');

  await approveGuided(page);
  await page.click('#open-account');
  await page.text('#account-next-date', /23 de noviembre de 2026/);
  await page.text('#account-balance', /330\.000/);
  await page.click('#review-payment');
  await page.text('#payment-summary', /Cuota 1.*66\.000.*23 de noviembre de 2026/);
  await page.click('#payment-dialog [value="cancel"]');
  await page.text('#account-balance', /330\.000/);
  await page.text('#payment-progress-label', /0 de 5/);
  await notVisible(page, '#payment-receipt');
  await page.click('#review-payment');
  await page.click('#payment-dialog [value="confirm"]');
  await page.text('#payment-receipt', /SIM-V1-C1/);
  await page.text('#account-balance', /264\.000/);
  await page.text('#account-next-date', /30 de noviembre de 2026/);
  await page.evaluate(`document.querySelector('#payment-dialog form')
    .requestSubmit(document.querySelector('#payment-dialog [value="confirm"]'))`);
  await page.text('#account-balance', /264\.000/);
  await page.text('#account-next-date', /30 de noviembre de 2026/);
  assert.equal(await page.evaluate('document.documentElement.scrollWidth > innerWidth'), false);
  await page.click('.account-calendar summary');
  await page.text('#account-installments', /Cuota 1.*Pagada.*23 de noviembre.*SIM-V1-C1.*Cuota 2.*Pendiente/);
  await page.select('#account-help-reason', 'Bajaron mis ingresos o ventas');
  await page.click('#account-help-form button');
  await page.text('#account-help-status', /Solicitud simulada registrada/);
  await page.reload();
  await page.text('#payment-progress-label', /1 de 5/);
  await page.text('#payment-receipt', /SIM-V1-C1/);
  await page.text('#account-balance', /264\.000/);
  await page.click('.account-calendar summary');
  await page.text('#account-installments', /SIM-V1-C1.*Cuota 2.*30 de noviembre/);
  await page.text('#account-help-status', /Bajaron mis ingresos o ventas/);
  await changeProfile(page, 'ana');
  await notVisible(page, '#navigation [data-go="account"]');
  assert.equal(await page.evaluate('document.querySelector("#payment-receipt").textContent'), '');
  assert.equal(await page.evaluate('document.querySelector("#account-help-status").textContent'), '');
  await changeProfile(page, 'diana');
  await navigate(page, 'account');
  for (let number = 2; number <= 5; number++) {
    await page.click('#review-payment');
    await page.text('#payment-summary', new RegExp(`Cuota ${number}.*66\\.000`));
    await page.click('#payment-dialog [value="confirm"]');
  }
  await page.reload();
  await page.text('#account-next-label', /Crédito pagado/);
  await page.text('#account-balance', /^\$0 COP$/);
  await page.text('#payment-receipt', /SIM-V1-C5/);
  await notVisible(page, '#review-payment');
});

test('proyecto colectivo valida el saldo y registra un solo giro, con puntajes por perfil', async (t) => {
  const page = await open(t, 1024);
  await navigate(page, 'score');
  await page.text('#own-score-insufficient', /Historial insuficiente/);
  await page.text('#own-score-insufficient', /faltan datos para calcular tu puntaje individual/);
  await page.click('#score-comparison summary');
  await page.text('#score-comparison-cases', /82\/100.*58\/100/);
  await page.text('#score-comparison-cases article:first-child',
    /5 de 5 cuotas pagadas a tiempo.*Monto solicitado para todo el préstamo \$300\.000 COP.*Cuotas con vencimiento en las 10 semanas observadas \$250\.000 COP.*Pagos registrados en esas 10 semanas \$250\.000 COP/);
  await changeProfile(page, 'ana');
  await page.text('#own-score-value', /82 de 100/);
  await navigate(page, 'finance');
  await page.text('#circle-score-value', /78 de 100/);
  await page.text('#finance', /datos de ejemplo independientes de los puntajes individuales/);
  await page.click('#open-project');
  await page.type('#project-amount', '65000');
  await page.text('#project-error', /5\.000/);
  await page.type('#project-amount', '50000');
  await page.click('#project-form button[type="submit"]');
  for (const member of members) {
    await changeProfile(page, member);
    await page.click('[data-project-vote="approve"]');
    if (member !== 'luz') await notVisible(page, '#project-confirm');
  }
  await page.text('#project-balances', /Disponible para proyectos \$60\.000/);
  await page.click('#project-confirm');
  await page.text('#project-status', /Giro de \$50\.000 COP registrado/);
  assert.equal(await page.evaluate('document.querySelector("#project-amount").value'), '');
  await notVisible(page, '#project-error');
  await page.reload();
  await page.text('#project-balances', /Saldo \$70\.000.*Reserva \$40\.000.*Disponible para proyectos \$10\.000/);
  assert.equal(await page.evaluate('document.querySelector("#project-amount").value'), '');
  await notVisible(page, '#project-error');
  await notVisible(page, '#project-confirm');
  await changeProfile(page, 'rosa');
  await page.text('#project-denied', /no tiene acceso/);
  await notVisible(page, '#project-balances');
  await changeProfile(page, 'diana');
  await navigate(page, 'finance');
  await page.text('#circle-score-value', /78 de 100/);
  await page.text('#fund-available', /10\.000/);
});

test('rechazar respaldo o crédito mantiene los límites y permite reemplazar una invitación', async (t) => {
  const page = await open(t);
  await startRequest(page, '5');
  await changeProfile(page, 'luz');
  await page.click('#response-form [value="declined"]');
  await page.text('#support-explanation', /Rechazaste.*no cuenta para el mínimo/);
  await notVisible(page, '#open-current-sheet');
  await changeProfile(page, 'diana');
  await page.text('#progress', /4 de 5 respaldos confirmados.*Falta 1 respaldo/);
  await page.select('#invitee', 'mateo');
  await page.click('#invite-form button[type="submit"]');
  await changeProfile(page, 'mateo');
  await page.click('#response-form [value="confirmed"]');
  await changeProfile(page, 'diana');
  await page.click('#review-button');
  await page.click('#send-form button[type="submit"]');
  await changeProfile(page, 'luz');
  await page.text('#inbox-empty', /no tienes avisos/);
  await openBallot(page, 'mateo');
  await page.click('[data-decision="reject"]');
  await changeProfile(page, 'diana');
  await page.text('#applicant-status', /En revisión/);
  for (const member of members.slice(0, -1)) {
    await openBallot(page, member);
    await page.click('[data-decision="approve"]');
  }
  await changeProfile(page, 'diana');
  await page.text('#applicant-status', /Rechazada/);
  await page.text('#success-title', /Solicitud rechazada/);
  await page.text('#applicant-decision', /Puedes preparar una nueva versión/);
  await notVisible(page, '[data-reminder-amount]');
  await navigate(page, 'finance');
  await page.text('#budget-credit', /1\.000\.000/);
});

test('una solicitud aprobada muestra el saldo insuficiente y conserva el presupuesto al recargar', async (t) => {
  const page = await open(t);
  await startRequest(page, '5');
  await changeProfile(page, 'luz');
  await page.click('#response-form [value="confirmed"]');
  await changeProfile(page, 'diana');
  await page.click('#review-button');
  await page.click('#send-form button[type="submit"]');
  await page.evaluate(`(() => {
    const key = 'credito-comunitario-hu-1-1';
    const saved = JSON.parse(sessionStorage.getItem(key));
    saved.disbursements = [
      { authorizationId: 'previa:1', requestId: 'previa', version: 1, principalCop: 800000 },
    ];
    sessionStorage.setItem(key, JSON.stringify(saved));
  })()`);
  await page.reload();

  for (const member of members) {
    await openBallot(page, member);
    await page.click('[data-decision="approve"]');
  }
  await changeProfile(page, 'diana');
  await page.reload();
  await page.text('#success-title', /Desembolso bloqueado/);
  await page.text('#applicant-status', /Aprobada por el grupo/);
  await page.text('#applicant-disbursement', /Bloqueado por saldo insuficiente/);
  await page.text('#applicant-disbursement-next', /300\.000 COP.*200\.000 COP/);
  await notVisible(page, '#open-account');
  await navigate(page, 'finance');
  await page.text('#budget-credit', /200\.000/);
});

test('un respaldo fuera del padrón conserva su ficha histórica sin acciones de voto', async (t) => {
  const page = await open(t);
  await startRequest(page, '5');
  await page.select('#invitee', 'mateo');
  await page.click('#invite-form button[type="submit"]');
  for (const supporter of ['luz', 'mateo']) {
    await changeProfile(page, supporter);
    await page.click('#response-form [value="confirmed"]');
  }
  await changeProfile(page, 'diana');
  await page.click('#review-button');
  await page.click('#send-form button[type="submit"]');
  await page.click('#edit-revision');
  await page.click('#revision-choices input[value="mateo"]');
  await page.click('#draft-submit');
  await changeProfile(page, 'mateo');
  await navigate(page, 'support');
  await page.text('#support-explanation', /fuera del grupo habilitado para votar/);
  await notVisible(page, '#open-current-sheet');
  await openBallot(page, 'mateo', 1);
  await page.text('#sheet-history-restriction', /votación.*cerrada/);
  await notVisible(page, '#voting-actions');
});

test('un voto en contra bloquea el uso de la reserva y el giro colectivo', async (t) => {
  const page = await open(t);
  await approveGuided(page);
  await page.click('#simulate-installment');
  await changeProfile(page, 'ana');
  await page.click('[data-reserve-vote="reject"]');
  await notVisible(page, '#contribution-actions');
  await changeProfile(page, 'diana');
  await page.text('#installment-breakdown', /Total pendiente \$60\.000/);
  await page.text('#installment-balances', /Saldo después \$120\.000.*Reserva después \$40\.000/);
  await navigate(page, 'finance');
  await page.click('#open-project');
  await changeProfile(page, 'ana');
  await page.type('#project-amount', '50000');
  await page.click('#project-form button[type="submit"]');
  await page.click('[data-project-vote="reject"]');
  await page.text('#project-status', /giro quedó bloqueado/);
  await notVisible(page, '#project-confirm');
  await page.text('#project-balances', /Disponible para proyectos \$60\.000/);
  await page.type('#project-amount', '50000');
  await page.click('#project-form button[type="submit"]');
  await page.text('#project-status', /0 de 5/);
  await page.click('#project-history summary');
  await page.text('#project-history-list', /Propuesta rechazada/);
});

test('Diana actualiza el plan privado y recupera el resultado al recargar', async (t) => {
  const page = await open(t, 320);
  const save = () => page.click('#payment-plan-form [type="submit"]');
  const edit = () => page.click('#plan-editor summary');
  await navigate(page, 'payment-plan');
  await page.text('#plan-installment-gap', /\$35\.000/);
  await page.text('#plan-available', /\$15\.000/);
  await page.text('#plan-essentials', /\$45\.000/);
  await page.text('#plan-income-status', /por confirmar/);
  const contrast = await page.evaluate(String.raw`['.payment-plan-result', '#plan-income-status'].map(selector => {
    const style = getComputedStyle(document.querySelector(selector));
    const luminance = (color) => color.match(/\d+/g).slice(0, 3).map(Number).map(channel => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
    const text = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
  })`);
  assert.ok(contrast.every((ratio) => ratio >= 4.5), `Contraste de texto: ${contrast.join(', ')}`);

  await edit();
  assert.equal(await page.evaluate(`(() => {
    const root = document.documentElement;
    root.style.fontSize = '200%';
    const fits = innerWidth === 320 && root.scrollWidth <= root.clientWidth;
    root.style.fontSize = '';
    return fits;
  })()`), true);
  await page.type('#plan-cash', '25000');
  await page.click('#payment-plan-form input[name="incomeConfirmed"]');
  await save();
  await page.text('#plan-income-status', /confirmado y llega después del vencimiento/);
  await page.text('#plan-available', /\$0 COP/);
  await page.text('#plan-essential-gap', /\$20\.000/);
  await page.text('#plan-installment-gap', /\$50\.000/);
  assert.equal(await page.evaluate('document.activeElement.id'), 'plan-result-title');

  await edit();
  await page.type('#plan-cash', '90000');
  await page.click('#plan-cancel');
  await edit();
  assert.equal(await page.evaluate('document.querySelector("#plan-cash").value'), '25000');
  await page.type('#plan-installment', '65000');
  await page.evaluate(`document.querySelector('#plan-installment-date').value = '2026-11-21'`);
  await save();
  await page.text('#plan-due-amount', /\$65\.000/);
  await page.text('#plan-due-date', /21 de noviembre de 2026/);
  await page.text('#plan-income-status', /se incluye en el cálculo/);
  await page.text('#plan-available', /\$60\.000/);
  await page.text('#plan-installment-gap', /\$5\.000/);
  await page.text('#plan-essential-gap', /\$20\.000/);

  await edit();
  await page.type('#plan-installment', '0');
  await save();
  assert.equal(await page.evaluate('document.querySelector("#plan-editor").open'), true);
  assert.equal(await page.evaluate('document.querySelector("#plan-installment").validity.rangeUnderflow'), true);
  assert.ok(await page.evaluate('document.querySelector("#plan-installment").validationMessage'));
  await page.text('#plan-due-amount', /\$65\.000/);

  await page.reload();
  await page.text('#plan-available', /\$60\.000/);
  await page.text('#plan-due-amount', /\$65\.000/);
  await page.text('#plan-due-date', /21 de noviembre de 2026/);
  await page.text('#plan-installment-gap', /\$5\.000/);
  await changeProfile(page, 'luz');
  await notVisible(page, '#navigation [data-go="payment-plan"]');
  await notVisible(page, '#payment-plan');
  assert.deepEqual(await page.evaluate('[document.querySelector("#plan-available").textContent, document.querySelector("#plan-cash").value]'), ['', '']);
  await changeProfile(page, 'diana');
  await navigate(page, 'payment-plan');
  await page.text('#plan-available', /\$60\.000/);

  await page.evaluate(`Storage.prototype.setItem = () => { throw new Error('Storage de prueba no disponible'); }`);
  await edit();
  await page.type('#plan-cash', '10000');
  await save();
  await page.text('#plan-installment-gap', /\$20\.000/);
  await page.text('#plan-storage-note', /Al recargar, podrías perder los cambios/);
});

test('el plan guiado retira el aviso cuando una escritura posterior guarda los cambios', async (t) => {
  const page = await open(t);
  await demoAction(page, 'start-demo');
  await changeProfile(page, 'diana');
  await navigate(page, 'payment-plan');
  await page.click('#plan-editor summary');
  await page.type('#plan-cash', '53000');
  await page.evaluate(`window.saveOriginalPlanStorage = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('Storage de prueba no disponible'); };`);
  await page.click('#payment-plan-form [type="submit"]');
  await page.text('#plan-storage-note', /Al recargar, podrías perder los cambios/);
  await page.evaluate('Storage.prototype.setItem = window.saveOriginalPlanStorage');
  await navigate(page, 'payment-plan');
  await notVisible(page, '#plan-storage-note');
  await page.reload();
  await page.text('#plan-available', /\$8\.000/);
});

test('Diana compara costos y ve el calendario vigente de cada escenario', async (t) => {
  const page = await open(t, 320);
  await navigate(page, 'payment-plan');
  await page.click('#open-plan-comparison');
  await page.text('#plan-comparison-status', /pendiente.*original sigue vigente/);
  await page.text('#plan-original-terms', /\$50\.000.*Un pago.*\$5\.000.*\$50\.000/);
  await page.text('#plan-alternative-terms', /\$30\.000.*Dos pagos semanales.*\$15\.000.*\$60\.000.*27 de noviembre/);
  await page.text('#plan-comparison-difference', /baja \$20\.000.*aumenta \$10\.000/);
  await page.text('#plan-comparison-shortfall', /originales: faltan hasta \$35\.000.*mayor: faltan hasta \$45\.000/);
  assert.equal(await page.evaluate(`(() => {
    const root = document.documentElement;
    root.style.fontSize = '200%';
    const fits = innerWidth === 320 && root.scrollWidth <= root.clientWidth;
    root.style.fontSize = '';
    return fits;
  })()`), true);

  await page.select('#plan-comparison-scenario', 'offer');
  await page.text('#plan-comparison-status', /Oferta nueva.*Ninguna.*vigente/);
  await page.select('#plan-comparison-scenario', 'same-total');
  await page.text('#plan-comparison-difference', /total a devolver es el mismo/);
  await page.select('#plan-comparison-scenario', 'unavailable');
  await page.text('#plan-comparison-status', /No hay un plazo alternativo disponible/);
  await notVisible(page, '#plan-alternative');
  await page.click('#back-from-plan-comparison');
  await page.text('#plan-due-amount', /\$50\.000/);
  await page.click('#open-plan-comparison');
  await page.select('#plan-comparison-scenario', 'agreed');
  await page.text('#plan-comparison-status', /Prórroga acordada.*está vigente/);
  await page.reload();
  await page.text('#plan-comparison-status', /Prórroga acordada/);
  await page.click('#back-from-plan-comparison');
  await page.text('#plan-schedule-status', /Primera cuota de la prórroga acordada/);
  await page.text('#plan-due-amount', /\$30\.000/);
  await page.text('#plan-due-date', /20 de noviembre/);
});

test('Diana cancela o confirma ayuda privada y accede directamente a orientación', async (t) => {
  const page = await open(t, 320);
  await navigate(page, 'payment-plan');
  await page.click('#open-plan-orientation');
  await page.text('#plan-orientation', /Ruta de prueba.*no se piden datos.*círculo/);
  await page.click('#back-from-plan-orientation');
  assert.equal(await page.evaluate('document.activeElement.id'), 'open-plan-orientation');
  await page.click('#open-plan-help');
  await page.select('#plan-help-reason', 'Quiero hablar sobre mi fecha de pago');
  await page.click('#back-from-plan-help');
  await page.text('#plan-installment-gap', /\$35\.000/);
  await page.click('#open-plan-comparison');
  await page.click('#open-comparison-help');
  await notVisible(page, '#plan-help-status');
  assert.equal(await page.evaluate('document.querySelector("#plan-help-reason").value'), '');
  await page.select('#plan-help-reason', 'Quiero hablar sobre mi fecha de pago');
  await page.click('#plan-help-form button[type="submit"]');
  await page.text('#plan-help-status', /Solicitud de prueba registrada.*Quiero hablar sobre mi fecha de pago/);
  await notVisible(page, '#plan-help-form');
  await page.reload();
  await page.text('#plan-help-status', /Solicitud de prueba registrada/);
  await changeProfile(page, 'luz');
  await notVisible(page, '#plan-help');
  assert.equal(await page.evaluate('document.querySelector("#plan-help-status").textContent'), '');
  await changeProfile(page, 'diana');
  await navigate(page, 'payment-plan');
  await page.text('#plan-installment-gap', /\$35\.000/);
  await page.click('#open-plan-help');
  await page.text('#plan-help-status', /Quiero hablar sobre mi fecha de pago/);
});

test('V3 integrada: Diana conserva el bono, el plan, la prórroga y la ayuda en una sesión privada', async (t) => {
  const page = await open(t, 320);
  await navigate(page, 'score');
  await page.click('#score [data-go="education"]');
  await page.type('#education-capital', '285000');
  await page.click('#education-form input[value="principal"]');
  await page.type('#education-shortfall', '30000');
  await page.click('#education-form input[value="new-payment"]');
  await page.click('#education-form button[type="submit"]');
  await page.text('#education-result-title', /\+2 puntos educativos/);

  await navigate(page, 'payment-plan');
  await page.click('#plan-editor summary');
  await page.type('#plan-cash', '65000');
  await page.click('#payment-plan-form button[type="submit"]');
  await page.text('#plan-available', /\$20\.000/);
  await page.text('#plan-installment-gap', /\$30\.000/);
  await page.click('#open-plan-comparison');
  await page.text('#plan-comparison-status', /pendiente.*original sigue vigente/);
  await page.select('#plan-comparison-scenario', 'agreed');
  await page.text('#plan-comparison-status', /Prórroga acordada.*está vigente/);

  await page.click('#open-comparison-help');
  await page.select('#plan-help-reason', 'Quiero hablar sobre mi fecha de pago');
  await page.click('#plan-help-form button[type="submit"]');
  await page.reload();
  await page.text('#plan-help-status', /Solicitud de prueba registrada.*Quiero hablar sobre mi fecha de pago/);

  await changeProfile(page, 'luz');
  await notVisible(page, '#plan-help');
  await notVisible(page, '#navigation [data-go="payment-plan"]');
  assert.equal(await page.evaluate('document.querySelector("#plan-help-status").textContent'), '');
  await navigate(page, 'score');
  await notVisible(page, '#own-education-bonus');

  await changeProfile(page, 'diana');
  await page.text('#own-education-bonus', /^\+2 por comprender capital e intereses/);
  await navigate(page, 'payment-plan');
  await page.text('#plan-schedule-status', /Primera cuota de la prórroga acordada/);
  await page.text('#plan-due-date', /20 de noviembre/);
  await page.text('#plan-installment-gap', /\$10\.000/);
  await page.click('#open-plan-help');
  await page.text('#plan-help-status', /Quiero hablar sobre mi fecha de pago/);
});
