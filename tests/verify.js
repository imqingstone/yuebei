// 執行：node tests/verify.js
const assert = require('assert');
const Y = require('../docs/engine.js');
const D = require('../docs/data.js');
const fs = require('fs');

assert.strictEqual(Y.judge('flat', 'round'), 'sheng');
assert.strictEqual(Y.judge('round', 'flat'), 'sheng');
assert.strictEqual(Y.judge('flat', 'flat'), 'xiao');
assert.strictEqual(Y.judge('round', 'round'), 'yin');

// 機率：聖 1/2、笑 1/4、陰 1/4
let seed = 12345; const rand = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const n = 200000, cnt = {sheng: 0, xiao: 0, yin: 0};
for (let i = 0; i < n; i++) cnt[Y.throwOnce(rand).kind]++;
assert.ok(Math.abs(cnt.sheng / n - .5) < .01 && Math.abs(cnt.xiao / n - .25) < .01 && Math.abs(cnt.yin / n - .25) < .01, JSON.stringify(cnt));

// 連擲三次：遇到非聖筊就停，三聖約 1/8
let ok = 0;
for (let i = 0; i < n; i++) {
  const r = Y.throwThree(rand);
  assert.ok(r.rounds.length >= 1 && r.rounds.length <= 3);
  r.rounds.slice(0, -1).forEach(x => assert.strictEqual(x.kind, 'sheng'));
  if (r.rounds.length < 3) assert.notStrictEqual(r.rounds[r.rounds.length - 1].kind, 'sheng');
  assert.strictEqual(r.ok, r.rounds.length === 3 && r.rounds[2].kind === 'sheng');
  if (r.ok) ok++;
}
assert.ok(Math.abs(ok / n - .125) < .01, ok / n);

for (let i = 0; i < 1000; i++) { const x = Y.secureRand(); assert.ok(x >= 0 && x < 1); }

// 文字齊全，且避開指定用詞
const all = JSON.stringify(D) + fs.readFileSync(__dirname + '/../docs/index.html', 'utf8') + D.THREE.stop(2);
for (const k of ['sheng', 'xiao', 'yin']) { const R = D.RESULTS[k]; assert.ok(R.name && R.line && R.about && R.tips.length >= 5); }
for (const w of ['不必', '未必', '值得', '真正', '扛', '溫柔', '節奏', '落地', '看見', '穩穩', '允許自己', '你不需要']) assert.ok(!all.includes(w), w);

console.log('PASS: judge; odds ' + JSON.stringify(Object.fromEntries(Object.entries(cnt).map(([k, v]) => [k, (v / n).toFixed(3)]))) + '; three-throw 三聖 ' + (ok / n).toFixed(3) + '; texts.');
