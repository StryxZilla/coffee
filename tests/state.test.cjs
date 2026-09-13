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
        innerHTML: '', textContent: id === 'mapData' ? mapData : '', style: {}, attrs: {}, handlers: {},
        clientWidth:1100,scrollWidth:1100,scrollLeft:0,
        addEventListener(name,fn) { (this.handlers[name]??=[]).push(fn); }, setAttribute(k, v) { this.attrs[k] = v; },
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
  assert.equal(a.run('origins.reduce((sum,c)=>sum+c.production,0)'), 10389.5);
  assert.equal(a.run('selected'), 'BRA');
  assert.match(a.el('metrics').innerHTML, /10\.4<small>million tonnes/);
  assert.match(a.el('metrics').innerHTML, /173\.2 million 60 kg bags/);
  assert.match(a.el('detail').innerHTML, /Brazil/);
  assert.equal((a.el('bars').innerHTML.match(/class="marker(?: active)?"/g) || []).length, 34);
});
test('all origin allocations and economics are internally consistent', () => {
  const a = app();
  assert.equal(a.run('origins.length'), 34);
  assert.equal(a.run('new Set(origins.map(c=>c.id)).size'), 34);
  assert.equal(a.run('origins.every(c=>c.flows.reduce((s,f)=>s+f[1],0)===100 && c.split.reduce((s,n)=>s+n,0)===100)'), true);
  assert.equal(a.run('origins.every(c=>c.cost>0&&c.yield>0&&c.exports>=0&&c.exports<=100&&c.arabica>=0&&c.arabica<=100)'), true);
  assert.equal(a.run('origins.every(c=>data.some(g=>g.iso===c.id)&&c.flows.every(f=>markets[f[0]]))'), true);
});
test('origin-based bean filters form a disjoint, exhaustive partition', () => {
  const a = app();
  assert.equal(a.run("filter='arabica'; eligible().length"), 21);
  assert.equal(a.run('eligible().every(c=>c.arabica>=80 && volume(c)===c.production)'), true);
  const arabica = a.run('eligible().reduce((s,c)=>s+volume(c),0)');
  assert.equal(a.run("filter='robusta'; eligible().length"), 5);
  assert.equal(a.run('eligible().every(c=>c.arabica<=20 && volume(c)===c.production)'), true);
  const robusta = a.run('eligible().reduce((s,c)=>s+volume(c),0)');
  assert.equal(a.run("filter='mixed'; eligible().length"), 8);
  const mixed = a.run('eligible().reduce((s,c)=>s+volume(c),0)');
  assert.equal(a.run('eligible().every(c=>c.arabica>20&&c.arabica<80)'), true);
  assert.ok(Math.abs(arabica + robusta + mixed - 10389.5) < 0.000001);
  a.run("filter='robusta'; selected='COL'; document.getElementById('beanFilter').onchange({target:{value:'robusta'}})");
  assert.equal(a.run('selected'), 'VNM');
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
        assert.equal((a.el('bars').innerHTML.match(/class="marker(?: active)?"/g) || []).length, ids.length);
        assert.equal((a.el('routes').innerHTML.match(/class="route"/g) || []).length, mode === 'flows' ? 4 : 0);
        combinations++;
      }
    }
  }
  assert.equal(combinations, 272);
});
test('composition summary, map, and selected origin preserve both bean shares', () => {
  const a=app();
  for(const filter of ['all','arabica','robusta','mixed']){
    a.run(`filter='${filter}';selected=eligible()[0].id;mode='mix';render()`);
    const share=a.run('Math.round(eligible().reduce((s,c)=>s+c.production*c.arabica/100,0)/eligible().reduce((s,c)=>s+c.production,0)*100)');
    assert.match(a.el('metrics').innerHTML,new RegExp(`Production in view: ${share}% Arabica, ${100-share}% Robusta`));
    assert.doesNotMatch(a.el('metrics').innerHTML,/Arabica share/);
    assert.equal((a.el('bars').innerHTML.match(/data-arabica=/g)||[]).length,a.run('eligible().length'));
    const selectedShare=a.run('country().arabica');
    assert.match(a.el('detail').innerHTML,new RegExp(`${selectedShare}% Arabica, ${100-selectedShare}% Robusta`));
  }
  a.run("filter='robusta';render()");
  assert.match(a.el('metrics').innerHTML,/Arabica/);
  assert.match(a.el('metrics').innerHTML,/Robusta/);
});
test('flat map colors reflect each layer and expanded origins can be selected', () => {
  const a=app();
  for(const mode of ['production','cost','mix']){
    a.run(`mode='${mode}';render()`);
    const marks=[...a.el('bars').innerHTML.matchAll(/class="anchor"[^>]*r="([\d.]+)"/g)];
    assert.equal(marks.length,34);
    assert.ok(marks.every(m=>Number(m[1])<=3.5));
    assert.doesNotMatch(a.el('bars').innerHTML,/bar-front|arabica-segment/);
  }
  assert.equal(a.run("mode='mix';countryColor({...country(),arabica:100})"),'#a4e6bc');
  assert.equal(a.run('countryColor({...country(),arabica:0})'),'#edb16c');
  const colors=a.run("new Set(['production','cost','mix','flows'].map(m=>{mode=m;return countryColor(country())})).size");
  assert.equal(colors,4);
  for(const id of ['PER','JAM','RWA','CIV','PNG','CHN']){
    a.run(`selectCountry('${id}')`);
    assert.match(a.el('detail').innerHTML,new RegExp(a.run('country().name')));
  }
});
test('table columns sort both ways without changing selected origin or camera',()=>{
  const a=app();
  assert.equal(a.run('sortedOrigins(eligible())[0].id'),'BRA');
  a.run("zoom=2;applyZoom();panTo(-200,-160);changeSort('origin')");
  assert.equal(a.run('sortedOrigins(eligible())[0].id'),'BOL');
  assert.match(a.el('tableHead').innerHTML,/aria-sort="ascending"/);
  assert.equal(a.run('selected'),'BRA');assert.equal(a.run('camera.x'),-200);
  assert.match(a.el('countryRows').innerHTML,/data-select="BRA"[^>]+aria-pressed="true"/);
  a.run("changeSort('origin')");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'VNM');
  a.run("changeSort('metric')");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'BRA');
  a.run("changeSort('metric')");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'JAM');
  a.run("setMode('cost');changeSort('secondary')");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'VNM');
  a.run("changeSort('secondary')");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'COD');
  a.run("setMode('production')");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'JAM');
  a.run("filter='robusta';renderTable(eligible())");assert.equal(a.run('sortedOrigins(eligible())[0].id'),'CMR');
  assert.match(a.el('tableHead').innerHTML,/aria-sort="ascending"/);
});
test('sorting leaves inputs unchanged and tie order is deterministic',()=>{
  const a=app();const before=a.run('origins.map(c=>c.id).join()');
  for(const mode of ['production','cost','mix','flows'])for(const key of ['origin','metric','secondary'])for(const direction of ['asc','desc']){
    a.run(`mode='${mode}';tableSort[mode]={key:'${key}',direction:'${direction}'};renderTable(eligible())`);
    assert.equal(a.run('origins.map(c=>c.id).join()'),before);
    assert.equal((a.el('countryRows').innerHTML.match(/data-select=/g)||[]).length,34);
    assert.doesNotMatch(a.el('countryRows').innerHTML,/NaN|undefined/);
  }
  a.run("mode='production';tableSort.production={key:'metric',direction:'desc'}");
  assert.equal(a.run("sortedOrigins(eligible()).filter(c=>c.production===360).map(c=>c.id).join()"),'HND,IND');
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
test('panning is bounded, persists through layer changes, and resets at default zoom',()=>{
  const a=app();
  a.run('zoom=2;applyZoom();panTo(-200,-160)');
  assert.equal(a.run('camera.x'),-200);assert.equal(a.run('camera.y'),-160);
  a.run("setMode('cost')");assert.equal(a.run('camera.x'),-200);
  a.run('panTo(1e6,-1e6)');
  assert.equal(a.run('camera.x'),0);assert.equal(a.run('camera.y'),-575);
  a.run('panTo(-1e6,1e6)');
  assert.equal(a.run('camera.x'),-1100);assert.equal(a.run('camera.y'),0);
  a.run("document.getElementById('reset').onclick()");
  assert.equal(a.run('camera.x'),0);assert.equal(a.run('camera.y'),0);
  assert.equal(a.el('mapWrap').attrs['data-zoomed'],'false');
});
test('mobile pan bounds cover the visible scrolled viewport',()=>{
  const a=app();a.el('world').clientWidth=860;
  Object.assign(a.el('mapWrap'),{clientWidth:345,scrollWidth:860});
  a.run('zoom=2;applyZoom();panTo(1e6,0)');
  const left=a.el('mapWrap').scrollLeft/860*1100;
  assert.ok(Math.abs(a.run('camera.x')-left)<1e-9);
  a.run('panTo(-1e6,0)');
  const right=(a.el('mapWrap').scrollLeft+345)/860*1100;
  assert.ok(Math.abs(a.run('camera.x')-(right-2200))<1e-9);
  assert.equal(a.el('mapWrap').attrs['data-zoomed'],'true');
});
test('mouse and touch drags suppress selection while taps and default-zoom scroll stay available',()=>{
  for(const pointerType of ['mouse','touch']){
    const a=app(),wrap=a.el('mapWrap'),target={capture:false,setPointerCapture(){this.capture=true},hasPointerCapture(){return this.capture},releasePointerCapture(){this.capture=false}};
    const event=(x,y)=>({pointerId:7,isPrimary:true,button:0,clientX:x,clientY:y,pointerType,target,preventDefault(){this.prevented=true}});
    wrap.handlers.pointerdown[0](event(300,300));
    assert.equal(a.run('mapDrag'),null);assert.equal(target.capture,false);
    a.run('zoom=2;applyZoom()');const before=a.run('camera.x');
    wrap.handlers.pointerdown[0](event(300,300));
    wrap.handlers.pointermove[0](event(303,302));
    assert.equal(a.run('mapDrag.moved'),false);assert.equal(a.run('camera.x'),before);
    wrap.handlers.pointerup[0](event(303,302));
    assert.equal(a.run('suppressMapClick'),false);
    wrap.handlers.pointerdown[0](event(300,300));
    wrap.handlers.pointermove[0](event(400,340));
    assert.equal(a.run('camera.x'),before+100);
    wrap.handlers.pointerup[0](event(400,340));
    assert.equal(target.capture,false);assert.equal(a.run('mapDrag'),null);
    const click={detail:1,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true}};
    wrap.handlers.click[0](click);assert.equal(click.stopped,true);
    wrap.handlers.pointerdown[0](event(300,300));
    wrap.handlers.pointermove[0](event(400,340));
    wrap.handlers.pointercancel[0](event(400,340));
    assert.equal(a.run('mapDrag'),null);assert.equal(target.capture,false);
    const keyboard={detail:0,preventDefault(){throw Error('Keyboard click blocked')},stopPropagation(){throw Error('Keyboard click blocked')}};
    wrap.handlers.click[0](keyboard);
    a.run("document.getElementById('reset').onclick()");
    wrap.handlers.pointerdown[0](event(300,300));
    assert.equal(a.run('suppressMapClick'),false);
  }
});
