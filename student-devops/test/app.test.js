const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../src/server');

let server, base;
before(async () => {
  server = createServer();
  await new Promise(r => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const json = { 'Content-Type': 'application/json' };

test('health endpoint returns UP', async () => {
  const r = await fetch(base + '/health');
  assert.strictEqual(r.status, 200);
  assert.strictEqual((await r.json()).status, 'UP');
});

test('can add and list a student', async () => {
  const post = await fetch(base + '/api/students', { method: 'POST', headers: json, body: JSON.stringify({ name: 'Ravi', course: 'Docker' }) });
  assert.strictEqual(post.status, 201);
  const list = await (await fetch(base + '/api/students')).json();
  assert.ok(list.some(s => s.name === 'Ravi'));
});

test('rejects invalid student', async () => {
  const r = await fetch(base + '/api/students', { method: 'POST', headers: json, body: '{}' });
  assert.strictEqual(r.status, 400);
});

test('can delete a student', async () => {
  const s = await (await fetch(base + '/api/students', { method: 'POST', headers: json, body: JSON.stringify({ name: 'Temp', course: 'Git' }) })).json();
  const del = await fetch(`${base}/api/students/${s.id}`, { method: 'DELETE' });
  assert.strictEqual(del.status, 200);
});

test('metrics endpoint exposes counters', async () => {
  const t = await (await fetch(base + '/metrics')).text();
  assert.match(t, /app_requests_total/);
});
