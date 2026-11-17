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

test('el HTML directo muestra cómo arrancar y la demo funciona por HTTP con teclado', async (t) => {
  const page = await browser.page(t, 320);
  await page.open(new URL('../frontend/index.html', import.meta.url).href, false);
  await page.text('#startup-message', /node serve\.mjs/);
  await notVisible(page, '#start-demo');
  await page.open(url);
  await notVisible(page, '#startup-message');
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
  const widths = await page.evaluate(`(() => {
    const button = document.querySelector('[data-decision="approve"]');
    const height = button.getBoundingClientRect().height;
    document.documentElement.style.fontSize = '200%';
    return { height, overflow: document.documentElement.scrollWidth > innerWidth };
  })()`);
  assert.ok(widths.height >= 56);
  assert.equal(widths.overflow, false);
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
  await page.reload();
  await page.text('[data-reminder-next-step]', /Anota lo que necesitas conversar/);
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
  await page.text('#home-title', /Un préstamo pequeño/);
  await demoAction(page, 'start-demo');
  await page.text('#installment-breakdown', /Total pendiente \$7\.000/);
  await demoAction(page, 'reset-demo');
  await page.text('#sheet-votes', /4 de 5/);
  await notVisible(page, '#guided-return');
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
