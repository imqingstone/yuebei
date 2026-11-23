// 月杯・擲筊規則。每支筊平面或凸面朝上各一半機率。
(function(g){
'use strict';
// rand() 回傳 0 到 1 之間的亂數
function cup(rand){ return rand() < 0.5 ? 'flat' : 'round'; }
function judge(a, b){
  if (a !== b) return 'sheng';
  return a === 'flat' ? 'xiao' : 'yin';
}
function throwOnce(rand){ const a = cup(rand), b = cup(rand); return {cups: [a, b], kind: judge(a, b)}; }
// 連擲三次：遇到非聖筊就停
function throwThree(rand){
  const rounds = [];
  for (let i = 0; i < 3; i++) {
    const r = throwOnce(rand);
    rounds.push(r);
    if (r.kind !== 'sheng') break;
  }
  return {rounds, ok: rounds.length === 3 && rounds.every(r => r.kind === 'sheng')};
}
function secureRand(){
  const c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null;
  if (!c) return Math.random();
  const u = new Uint32Array(1); c.getRandomValues(u); return u[0] / 4294967296;
}
const api = {cup, judge, throwOnce, throwThree, secureRand};
if (typeof module !== 'undefined') module.exports = api; else g.Yuebei = api;
})(this);
