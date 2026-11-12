import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

const candidates = [
  process.env.BROWSER_PATH,
  ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].filter((key) => process.env[key])
    .flatMap((key) => ['Google/Chrome/Application/chrome.exe', 'Microsoft/Edge/Application/msedge.exe']
      .map((name) => join(process.env[key], name))),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
];

export async function launchBrowser() {
  const executable = candidates.find((path) => path && existsSync(path));
  assert.ok(executable, 'Instala Chromium o define BROWSER_PATH con la ruta del ejecutable.');
  const profile = await mkdtemp(join(tmpdir(), 'entrevecinos-e2e-'));
  const flags = ['--headless', '--disable-gpu', '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'];
  if (process.env.BROWSER_NO_SANDBOX === '1') flags.unshift('--no-sandbox');
  const child = spawn(executable, flags, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const exited = once(child, 'exit');
  exited.catch(() => {});
  async function close() {
    child.kill();
    child.stderr.destroy();
    await exited.catch(() => {});
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
  let host;
  try {
    let timer;
    try {
      host = await Promise.race([
        new Promise((resolve) => {
          let output = '';
          child.stderr.on('data', (data) => {
            output += data;
            const match = output.match(/DevTools listening on ws:\/\/([^\s/]+)/);
            if (match) resolve(match[1]);
          });
        }),
        exited.then(([code]) => { throw new Error('Chromium terminó con código ' + code); }),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Chromium no inició en 15 segundos.')), 15_000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    await close();
    throw error;
  }

  return {
    close,
    async page(t, width = 390) {
      const root = 'http://' + host;
      const target = await (await fetch(root + '/json/new?about:blank', { method: 'PUT' })).json();
      const socket = new WebSocket(target.webSocketDebuggerUrl);
      await once(socket, 'open');
      const pending = new Map();
      const errors = [];
      let nextId = 0;
      socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        if (message.method === 'Runtime.exceptionThrown') {
          const detail = message.params.exceptionDetails;
          errors.push(detail.exception?.description ?? detail.text);
        }
        const request = pending.get(message.id);
        if (!request) return;
        pending.delete(message.id);
        if (message.error) request.reject(new Error(message.error.message));
        else request.resolve(message.result);
      });
      function send(method, params = {}) {
        const id = ++nextId;
        return new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
          socket.send(JSON.stringify({ id, method, params }));
        });
      }
      t.after(async () => {
        socket.close();
        await fetch(root + '/json/close/' + target.id);
        assert.deepEqual(errors, [], 'Excepciones en la aplicación');
      });
      await send('Runtime.enable');
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });

      async function evaluate(expression) {
        const result = await send('Runtime.evaluate', { expression, returnByValue: true });
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? expression);
        return result.result.value;
      }
      const selector = (value) => 'document.querySelector(' + JSON.stringify(value) + ')';
      const visible = (value) => evaluate('Boolean(' + selector(value) + '?.getClientRects().length)');
      async function waitFor(check) {
        for (let attempt = 0; attempt < 100; attempt++) {
          if (await evaluate(check)) return;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        assert.fail('Tiempo agotado esperando ' + check);
      }
      async function ready() {
        await waitFor('document.readyState === "complete" && document.querySelector("#startup-message")?.hidden === true');
      }
      return {
        evaluate, visible,
        async open(url, waitForApp = true) {
          const result = await send('Page.navigate', { url });
          assert.equal(result.errorText, undefined);
          if (waitForApp) await ready();
          else await waitFor('document.readyState === "complete" && document.querySelector("#startup-message")');
        },
        async reload() {
          await evaluate('window.entrevecinosReloadPending = true');
          await send('Page.reload');
          await waitFor('!window.entrevecinosReloadPending');
          await ready();
        },
        async click(value) {
          assert.ok(await visible(value), 'Control visible: ' + value);
          const point = await evaluate(`(() => {
            const element = ${selector(value)};
            if (element.disabled) return null;
            element.scrollIntoView({block:'center', inline:'nearest'});
            const box = element.getBoundingClientRect();
            return {x:box.left + box.width/2, y:box.top + box.height/2};
          })()`);
          assert.ok(point, 'Control habilitado: ' + value);
          await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
          await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
        },
        async select(value, choice) {
          assert.ok(await visible(value), 'Selector visible: ' + value);
          assert.equal(await evaluate(`(() => {
            const element = ${selector(value)};
            element.value = ${JSON.stringify(choice)};
            if (!element.value) return null;
            element.dispatchEvent(new Event('change', {bubbles:true}));
            return element.value;
          })()`), choice);
        },
        async type(value, content) {
          assert.ok(await visible(value), 'Campo visible: ' + value);
          await evaluate(`(() => {
            const element = ${selector(value)};
            element.value = ${JSON.stringify(content)};
            element.dispatchEvent(new Event('input', {bubbles:true}));
          })()`);
        },
        async key(key, code, virtualKeyCode) {
          const params = { key, code, windowsVirtualKeyCode: virtualKeyCode };
          await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...params });
          if (key === 'Enter') await send('Input.dispatchKeyEvent', { type: 'char', text: '\r', ...params });
          await send('Input.dispatchKeyEvent', { type: 'keyUp', ...params });
        },
        async text(value, expected) {
          assert.ok(await visible(value), 'Texto visible: ' + value);
          const actual = await evaluate(selector(value) + '.innerText');
          assert.match(actual.replaceAll(/\s+/g, ' '), expected);
        },
      };
    },
  };
}
