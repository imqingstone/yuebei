'use strict';
const $ = s => document.querySelector(s);
const E = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const {RESULTS, THREE, GUIDE} = window.YuebeiData;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
const pick = arr => arr[Math.floor(Yuebei.secureRand() * arr.length)];
let busy = false;

$('#guide').innerHTML = GUIDE.map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join('');

function setCups(cups){
  document.querySelectorAll('.cup').forEach((el, i) => {
    el.dataset.face = cups[i];
    el.querySelector('use').setAttribute('href', cups[i] === 'flat' ? '#cup-flat' : '#cup-round');
    el.querySelector('.face').textContent = cups[i] === 'flat' ? '平面' : '凸面';
  });
}

async function toss(r){
  const box = $('#cups');
  box.classList.remove('land'); void box.offsetWidth;
  box.classList.add('toss');
  await wait(650);
  setCups(r.cups);
  box.classList.remove('toss'); box.classList.add('land');
  await wait(380);
}

function roundsHTML(rounds, total){
  return Array.from({length: total}, (_, i) => {
    const r = rounds[i];
    return '<span class="rd' + (r ? ' ' + r.kind : '') + '">' + (r ? RESULTS[r.kind].name : '第 ' + (i + 1) + ' 擲') + '</span>';
  }).join('');
}

function show(kind, head, q){
  const R = RESULTS[kind];
  $('#result').innerHTML =
    (q ? '<p class="q">你問：' + E(q) + '</p>' : '') +
    '<h2 class="' + kind + '">' + head + '</h2>' +
    '<p class="line">' + R.line + '</p>' +
    '<p class="about"><b>' + R.name + '（' + R.faces + '）</b>' + R.about + '</p>' +
    '<p class="tip"><span>小提醒</span>' + pick(R.tips) + '</p>';
  $('#result').hidden = false;
}

$('#throw').addEventListener('click', async () => {
  if (busy) return;
  busy = true; $('#throw').disabled = true; $('#result').hidden = true;
  const q = $('#q').value.trim();
  const three = document.querySelector('input[name=mode]:checked').value === 'three';
  try {
    if (!three) {
      $('#rounds').innerHTML = '';
      const r = Yuebei.throwOnce(Yuebei.secureRand);
      await toss(r);
      show(r.kind, RESULTS[r.kind].name, q);
    } else {
      const res = Yuebei.throwThree(Yuebei.secureRand);
      $('#rounds').innerHTML = roundsHTML([], 3);
      for (let i = 0; i < res.rounds.length; i++) {
        await toss(res.rounds[i]);
        $('#rounds').innerHTML = roundsHTML(res.rounds.slice(0, i + 1), 3);
        if (i < res.rounds.length - 1) await wait(500);
      }
      const last = res.rounds[res.rounds.length - 1];
      if (res.ok) { show('sheng', '三聖筊', q); $('#result .line').textContent = THREE.done; }
      else { show(last.kind, RESULTS[last.kind].name, q); $('#result .line').textContent = THREE.stop(res.rounds.length) + RESULTS[last.kind].line; }
    }
    useCount();
    $('#result').scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'nearest'});
  } finally { busy = false; $('#throw').disabled = false; }
});

// 使用次數：每次擲筊記一筆到 GoatCounter，並在頁尾顯示累計次數（只記次數，不送出問題內容）。
const usagePath = 'yuebei-throw';
function useCount(){ try { const gc = window.goatcounter; if (gc && gc.count) gc.count({path: usagePath, title: '月杯擲筊', event: true, no_session: true}); } catch (e) {} }
fetch('https://imqingstone.goatcounter.com/counter/' + usagePath + '.json').then(r => r.ok ? r.json() : null)
  .then(d => { const el = document.getElementById('usage'); if (el && d && d.count) { el.textContent = '已擲過 ' + d.count + ' 次筊'; el.hidden = false; } }).catch(() => {});
