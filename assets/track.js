/* CannGo · Messung
   Weg B (immer, ohne Cookies, ohne Speicherung auf dem Gerät, anonym): Ereignisse werden im Speicher
   gesammelt und an das Netlify-Formular "messung" geschickt (nur auf einer *.netlify.app-Adresse).
   Weg A (nur nach Einwilligung, siehe consent.js): dieselben Ereignisse zusätzlich an GA4 und Clarity.
   Kontrolle: Seite mit ?debug=1 öffnen, dann zeigt ein Fenster unten links jedes Ereignis live. */
(function(){
  'use strict';
  var MK = window.MESSKONZEPT || {};
  var qs = new URLSearchParams(location.search);
  function rid(){ return Math.random().toString(36).slice(2,10); }
  function clean(c){ return String(c||'').toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,16); }
  var KNOWN = {}; (MK.ereignisse||[]).forEach(function(x){ KNOWN[x.e] = x; });
  var GA4_SKIP = { kommentar:1 };             // Freitext geht nie an Google
  var t0 = performance.now();
  var S = {
    sid: qs.get('sid') || rid(),
    code: clean(qs.get('code')),
    quelle: (qs.get('quelle') || qs.get('utm_source') || (document.referrer ? 'verweis' : 'direkt')).toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,30),
    seite: (document.documentElement.getAttribute('data-seite') || location.pathname),
    debug: qs.get('debug') === '1',
    variante: '', reihenfolge: '',
    consent: { statistik:false, analyse:false },
    events: [], sentUpTo: 0, chunk: 0
  };
  var screen = '', screenT = 0;
  function sek(){ return +((performance.now()-t0)/1000).toFixed(1); }

  // GA4 erlaubt nur kurze Texte und Zahlen
  function ga4Params(p){
    var o = {};
    Object.keys(p).forEach(function(k){
      if (GA4_SKIP[k]) return;
      var v = p[k];
      if (typeof v === 'boolean') v = v ? 'ja' : 'nein';
      else if (v && typeof v === 'object') return;
      else if (typeof v === 'string') v = v.slice(0,100);
      o[k.slice(0,40)] = v;
    });
    return o;
  }

  function track(e, p){
    p = p || {};
    var ev = Object.assign({ e:e, t:sek(), bildschirm:screen }, p);
    if (MK.ereignisse && !KNOWN[e]) { ev.unbekannt = true; try { console.warn('[CannGo-Messung] Unbekanntes Ereignis:', e); } catch(_){} }
    S.events.push(ev);
    var wege = ['B'];
    if (gaSend(ev)) wege.push('GA4');
    if (gtmSend(ev)) wege.push('GTM');
    if (S.consent.analyse && typeof window.clarity === 'function') { try { window.clarity('event', e); wege.push('Clarity'); } catch(_){} }
    debugAdd(ev, wege);
    return ev;
  }
  function gaSend(ev){
    if (ev._ga || !(S.consent.statistik && typeof window.gtag === 'function' && window.CG_GA_READY)) return false;
    var p = {}; Object.keys(ev).forEach(function(k){ if (['e','t','bildschirm','unbekannt','_ga','_gtm'].indexOf(k) < 0) p[k] = ev[k]; });
    try { window.gtag('event', ev.e, Object.assign(ga4Params(p), { bildschirm:ev.bildschirm||undefined, teilnehmer_code:S.code||undefined, variante:S.variante||p.variante||undefined, sitzung:S.sid }));
          ev._ga = true; return true; } catch(_){ return false; }
  }
  var gtmLast = {};
  // Tag Manager: jedes Ereignis als dataLayer-Event (Trigger in GTM: "Benutzerdefiniertes Ereignis")
  function gtmSend(ev){
    if (ev._gtm || !(S.consent.statistik && window.CG_GTM_READY && window.dataLayer)) return false;
    var p = {}; Object.keys(ev).forEach(function(k){ if (['e','t','bildschirm','unbekannt','_ga','_gtm'].indexOf(k) < 0) p[k] = ev[k]; });
    try {
      var obj = Object.assign({ event:ev.e, cg_event:true }, ga4Params(p), { bildschirm:ev.bildschirm||undefined, teilnehmer_code:S.code||undefined, user_id:S.code||undefined, variante:S.variante||p.variante||undefined, sitzung:S.sid, seite:S.seite, quelle:S.quelle });
      // GTM merkt sich Werte über Ereignisse hinweg: Werte des letzten Ereignisses, die jetzt fehlen, leeren
      Object.keys(gtmLast).forEach(function(k){ if (!(k in obj)) obj[k] = undefined; });
      gtmLast = {}; Object.keys(obj).forEach(function(k){ if (k !== 'event') gtmLast[k] = 1; });
      window.dataLayer.push(obj);
      ev._gtm = true; return true; } catch(_){ return false; }
  }
  // Nach der Zustimmung: Ereignisse dieser Seite von vor der Entscheidung einmal nachreichen (GA4 direkt bzw. GTM)
  function replayGA(){ var n = 0; S.events.forEach(function(ev){ if (gaSend(ev)) n++; if (gtmSend(ev)) n++; }); debugStatus(); return n; }
  function setScreen(name){
    if (screen && sek()-screenT >= 0.1) track('bildschirm_dauer', { name:screen, sek_auf:+(sek()-screenT).toFixed(1) });
    screen = name || ''; screenT = sek();
  }
  function applyIds(){
    if (S.consent.statistik && window.CG_GTM_READY && window.dataLayer) {
      try { window.dataLayer.push({ event:'cg_user', user_id:S.code || undefined, teilnehmer_code:S.code || undefined, variante:S.variante || undefined }); } catch(_){}
    }
    if (S.consent.statistik && typeof window.gtag === 'function' && MK.ga4_id && window.CG_GA_READY) {
      try { window.gtag('set', { user_id: S.code || undefined });
            window.gtag('set', 'user_properties', { teilnehmer_code:S.code||undefined, variante:S.variante||undefined }); } catch(_){}
    }
    if (S.consent.analyse && typeof window.clarity === 'function') {
      try { if (S.code) window.clarity('identify', S.code, S.sid, S.seite); if (S.variante) window.clarity('set','variante',S.variante);
            window.clarity('set','seite',S.seite); } catch(_){}
    }
    debugStatus();
  }
  function setUser(code){ S.code = clean(code); applyIds(); }
  function setVariante(v, reihenfolge){ S.variante = v||''; if (reihenfolge) S.reihenfolge = reihenfolge; applyIds(); }
  function payload(evs){
    return { v:MK.version, sid:S.sid, code:S.code, quelle:S.quelle, seite:S.seite, variante:S.variante,
             reihenfolge:S.reihenfolge, consent:S.consent, teil:S.chunk, ref:refDomain(), vw:window.innerWidth, vh:window.innerHeight, sprache:(navigator.language||'').slice(0,10), events:evs };
  }
  function refDomain(){ try { var r = document.referrer ? new URL(document.referrer).hostname : ''; return r === location.hostname ? '' : r; } catch(_){ return ''; } }
  // Wohin gesendet wird: Google-Tabelle (sammel_url) oder Netlify Forms
  function sammelUrl(){ var u = MK.sammel_url || ''; return /^https:\/\/(script\.google(usercontent)?\.com\/|[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev\/?)/.test(u) ? u : ''; }
  function online(){
    var host = location.hostname, live = MK.live_hosts instanceof RegExp ? MK.live_hosts.test(host) : /\.netlify\.app$/.test(host);
    if (!live) return false;
    return !!sammelUrl() || /\.netlify\.app$/.test(host);
  }
  // Ein Formular (vormerken, verbesserungsvorschlag) absenden. Rückgabe: Promise
  function sendForm(name, fields){
    var u = sammelUrl();
    if (u) return fetch(u, { method:'POST', mode:'no-cors', headers:{ 'Content-Type':'text/plain;charset=utf-8' }, body: JSON.stringify({ formular:name, felder:fields, v:MK.version }) });
    var body = new URLSearchParams(Object.assign({ 'form-name':name }, fields)).toString();
    return fetch('/', { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body:body }).then(function(r){ if (!r.ok) throw new Error(r.status); return r; });
  }
  var sentInfo = '';
  // Schickt alle noch nicht gesendeten Ereignisse
  function flush(){
    if (S.sentUpTo >= S.events.length) return false;
    var evs = S.events.slice(S.sentUpTo);
    if (!online()) { S.sentUpTo = S.events.length; sentInfo = 'Vorschau: nicht gesendet ('+evs.length+')'; debugStatus(); return false; }
    var json = JSON.stringify(payload(evs.map(function(x){ var y = Object.assign({}, x); delete y._ga; delete y._gtm; return y; })));
    var ok = false, u = sammelUrl(), ziel = u ? 'Datenbank' : 'Netlify';
    if (u) {
      var body = JSON.stringify({ formular:'messung', payload:json });
      try { ok = navigator.sendBeacon(u, new Blob([body], { type:'text/plain;charset=utf-8' })); } catch(_){}
      if (!ok) { try { fetch(u, { method:'POST', mode:'no-cors', body:body, keepalive:true, headers:{ 'Content-Type':'text/plain;charset=utf-8' } }); ok = true; } catch(_){} }
    } else {
      var fd = new FormData();
      fd.append('form-name', MK.netlify_form || 'messung');
      fd.append('payload', json);
      try { ok = navigator.sendBeacon('/', fd); } catch(_){}
      if (!ok) { try { fetch('/', { method:'POST', body:fd, keepalive:true }); ok = true; } catch(_){} }
    }
    if (ok) { S.sentUpTo = S.events.length; S.chunk++; sentInfo = 'an '+ziel+' gesendet: Teil '+S.chunk+' ('+evs.length+')'; }
    debugStatus();
    return ok;
  }
  // Link auf eine andere Seite mitnehmen: Sitzung, Code, Quelle, Debug
  function link(url, extra){
    var u = new URL(url, location.href);
    u.searchParams.set('sid', S.sid);
    if (S.code) u.searchParams.set('code', S.code);
    if (S.debug) u.searchParams.set('debug', '1');
    Object.keys(extra||{}).forEach(function(k){ u.searchParams.set(k, extra[k]); });
    return u.pathname + u.search;
  }

  /* ---------- Debug-Fenster (?debug=1) ---------- */
  var dbg = null, dbgList = null, dbgHead = null;
  function debugInit(){
    if (!S.debug || dbg) return;
    dbg = document.createElement('div');
    dbg.setAttribute('aria-live','off');
    dbg.style.cssText = 'position:fixed;left:max(8px,env(safe-area-inset-left,0px));bottom:max(8px,env(safe-area-inset-bottom,0px));z-index:10000;width:min(360px,calc(100vw - 16px));max-height:45vh;display:flex;flex-direction:column;background:#0d1a14;color:#e8f3ec;border:2px solid #f8d048;border-radius:12px;font:12px/1.4 ui-monospace,Menlo,Consolas,monospace;box-shadow:0 8px 24px rgba(0,0,0,.35)';
    dbg.innerHTML = '<div style="padding:8px 10px;border-bottom:1px solid #2c4a3b;display:flex;justify-content:space-between;gap:8px"><b style="color:#f8d048">Messung live</b><button type="button" style="background:none;border:0;color:#e8f3ec;cursor:pointer;font:inherit">ausblenden</button></div><div class="h" style="padding:6px 10px;border-bottom:1px solid #2c4a3b;color:#bcd5c7"></div><ol style="margin:0;padding:6px 10px 8px 28px;overflow:auto;flex:1"></ol>';
    dbgHead = dbg.querySelector('.h'); dbgList = dbg.querySelector('ol');
    dbg.querySelector('button').onclick = function(){ dbgList.hidden = !dbgList.hidden; this.textContent = dbgList.hidden ? 'einblenden' : 'ausblenden'; };
    document.body.appendChild(dbg);
    S.events.forEach(function(ev){ debugAdd(ev, ['B']); });
    debugStatus();
  }
  function debugStatus(){
    if (!dbgHead) return;
    dbgHead.textContent = 'Sitzung '+S.sid+(S.code?' · Code '+S.code:'')+' · GTM '+(S.consent.statistik?(window.CG_GTM_READY?'an':'–'):'aus')+' · GA4 direkt '+(S.consent.statistik?(window.CG_GA_READY?'an':'–'):'aus')+' · Clarity '+(S.consent.analyse?'an':'aus')+(sentInfo?' · '+sentInfo:'');
  }
  function debugAdd(ev, wege){
    if (!dbgList) return;
    var li = document.createElement('li');
    var extra = Object.keys(ev).filter(function(k){ return ['e','t','bildschirm','unbekannt','_ga','_gtm'].indexOf(k) < 0; }).map(function(k){ var v = ev[k]; return k+'='+(typeof v==='object'?JSON.stringify(v):v); }).join(' ');
    li.style.color = ev.unbekannt ? '#ff9a8f' : '';
    li.textContent = ev.t+'s '+ev.e+(extra?' · '+extra.slice(0,90):'')+' → '+wege.join('+')+(ev.unbekannt?' (UNBEKANNT)':'');
    dbgList.appendChild(li); dbgList.scrollTop = dbgList.scrollHeight;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', debugInit); else setTimeout(debugInit, 0);

  window.addEventListener('pagehide', function(){ setScreen(''); flush(); });
  window.CG = { S:S, track:track, setScreen:setScreen, setUser:setUser, setVariante:setVariante, applyIds:applyIds, replayGA:replayGA, flush:flush, link:link, sek:sek, online:online, sendForm:sendForm };
})();
