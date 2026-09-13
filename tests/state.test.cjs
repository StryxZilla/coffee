// Dependency-free state/render smoke tests. Browser layout checks are documented separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const mapData = html.match(/<script id="mapData" type="application\/json">([\s\S]*?)<\/script>/)[1];
const source = html.match(/<script>\s*('use strict';[\s\S]*?)<\/script>/)[1];
function app() {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        innerHTML: '', textContent: id === 'mapData' ? mapData : '', style: {}, attrs: {},
        addEventListener() {}, setAttribute(k, v) { this.attrs[k] = v; },
        showModal() {}, close() {},
      });
      return elements.get(id);
    },
    querySelectorAll() { return []; }, querySelector() { return null; },
  };
  const context = vm.createContext({ document });
  vm.runInContext(source, context);
  return { run: expression => vm.runInContext(expression, context), el: id => elements.get(id) };
}
test('standalone entrypoint has geometry and no external runtime assets', () => {
  assert.ok(JSON.parse(mapData).length > 170);
  assert.doesNotMatch(html, /__MAP_DATA__|<script[^>]+src=|<link[^>]+rel="stylesheet"|<img[^>]+src="https?:/);
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|localStorage/);
  new vm.Script(source);
});
test('sample totals, bag conversion, and default origin are correct', () => {
  const a = app();
  assert.equal(a.run('origins.reduce((sum,c)=>sum+c.production,0)'), 8700);
  assert.equal(a.run('selected'), 'BRA');
  assert.match(a.el('metrics').innerHTML, /8\.7<small>million t/);
  assert.match(a.el('metrics').innerHTML, /145 million 60 kg bags/);
  assert.match(a.el('detail').innerHTML, /Brazil/);
  assert.equal((a.el('bars').innerHTML.match(/class="marker"/g) || []).length, 8);
});
test('all origin allocations and economics are internally consistent', () => {
  const a = app();
  assert.equal(a.run('origins.length'), 8);
  assert.equal(a.run('new Set(origins.map(c=>c.id)).size'), 8);
  assert.equal(a.run('origins.every(c=>c.flows.reduce((s,f)=>s+f[1],0)===100 && c.split.reduce((s,n)=>s+n,0)===100)'), true);
  assert.equal(a.run('origins.every(c=>c.cost>0&&c.yield>0&&c.exports>=0&&c.exports<=100&&c.arabica>=0&&c.arabica<=100)'), true);
  assert.equal(a.run('origins.every(c=>data.some(g=>g.iso===c.id)&&c.flows.every(f=>markets[f[0]]))'), true);
});
test('bean filters conserve volume and exclude incompatible origins', () => {
  const a = app();
  assert.equal(a.run("filter='arabica'; eligible().length"), 8);
  const arabica = a.run('eligible().reduce((s,c)=>s+volume(c),0)');
  assert.equal(a.run("filter='robusta'; eligible().length"), 5);
  const robusta = a.run('eligible().reduce((s,c)=>s+volume(c),0)');
  assert.ok(Math.abs(arabica + robusta - 8700) < 0.000001);
  assert.equal(a.run("filter='mixed'; eligible().length"), 4);
  a.run("filter='robusta'; selected='COL'; document.getElementById('beanFilter').onchange({target:{value:'robusta'}})");
  assert.equal(a.run('selected'), 'BRA');
});
test('every layer, filter, and eligible country renders valid content', () => {
  const a = app(); let combinations = 0;
  for (const filter of ['all', 'arabica', 'robusta', 'mixed']) {
    a.run(`filter='${filter}'`);
    const ids = JSON.parse(a.run('JSON.stringify(eligible().map(c=>c.id))'));
    for (const mode of ['production', 'cost', 'mix', 'flows']) {
      for (const id of ids) {
        a.run(`mode='${mode}';selected='${id}';render()`);
        for (const el of ['metrics','detail','bars','routes','countryRows','chainBody']) {
          assert.doesNotMatch(a.el(el).innerHTML, /NaN|undefined|Infinity/, `${mode}/${filter}/${id}/${el}`);
        }
        assert.equal((a.el('bars').innerHTML.match(/class="marker"/g) || []).length, ids.length);
        assert.equal((a.el('routes').innerHTML.match(/class="route"/g) || []).length, mode === 'flows' ? 4 : 0);
        combinations++;
      }
    }
  }
  assert.equal(combinations, 100);
});
test('selection, supply chain, call-to-action, and zoom boundaries work', () => {
  const a = app();
  a.run("selectCountry('VNM')");
  assert.match(a.el('detail').innerHTML, /Vietnam/);
  a.run("document.getElementById('flowAction').onclick()");
  assert.equal(a.run('mode'), 'flows');
  assert.equal(a.run('step'), 2);
  assert.match(a.el('chainBody').innerHTML, /1,566k tonnes exported/);
  for (let step = 0; step < 5; step++) {
    a.run(`step=${step};renderChain()`);
    assert.match(a.el('chainBody').innerHTML, /<h3>.+<\/h3>/);
  }
  for (let i=0;i<10;i++) a.run("document.getElementById('zoomIn').onclick()");
  assert.equal(a.run('zoom'), 2.5);
  assert.equal(a.el('zoomIn').disabled, true);
  for (let i=0;i<10;i++) a.run("document.getElementById('zoomOut').onclick()");
  assert.equal(a.run('zoom'), 1);
  assert.equal(a.el('zoomOut').disabled, true);
});
