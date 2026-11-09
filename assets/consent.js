/* CannGo · Cookie-Banner und Einwilligung (Google Consent Mode v2, Basis-Modus)
   - Vor der Entscheidung: Consent Mode steht auf "denied", das Google-Skript wird gar nicht geladen,
     es geht also nichts an Google. Clarity wird ebenfalls nicht geladen.
   - Nach Zustimmung: Consent-Update auf "granted", dann wird GA4 bzw. Clarity geladen.
   - Die Auswahl wird erst NACH einer Entscheidung im Browser gespeichert (technisch notwendig).
   - Widerruf jederzeit über window.CGConsent.open() (Link "Cookie-Einstellungen" im Footer). */
(function(){
  'use strict';
  var MK = window.MESSKONZEPT || {};
  var KEY = 'cg_consent_v1';
  var loaded = { ga:false, clarity:false };
  function read(){ try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(_){ return null; } }
  function write(c){ try { localStorage.setItem(KEY, JSON.stringify(c)); } catch(_){} }
  function real(id){ return !!id && !/X{4,}|DEINE/.test(id); }

  // Consent Mode: Standard "abgelehnt", bevor irgendetwas passiert (nur lokal, kein Netzwerk)
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
                                      functionality_storage:'denied', personalization_storage:'denied', security_storage:'granted' });

  function gtmReal(){ return /^GTM-[A-Z0-9]{4,}$/.test(MK.gtm_id || ''); }
  // Google Tag Manager (Basis-Modus): erst nach Zustimmung laden, Consent-Status vorher setzen
  function loadGTM(){
    if (loaded.gtm || !gtmReal()) return; loaded.gtm = true;
    window.gtag('consent', 'update', { analytics_storage:'granted' });   // Werbung bleibt "denied"
    var c = window.CG ? window.CG.S : {};
    window.dataLayer.push({ event:'cg_init', user_id: c.code || undefined, teilnehmer_code: c.code || undefined, sitzung: c.sid, seite: c.seite, quelle: c.quelle });
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event:'gtm.js' });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(MK.gtm_id);
    document.head.appendChild(s);
    window.CG_GTM_READY = true;
  }
  function loadGA(){
    if (loaded.ga || !real(MK.ga4_id) || (gtmReal() && MK.ga4_ueber_gtm)) return; loaded.ga = true;
    window.gtag('consent', 'update', { analytics_storage:'granted' });   // Werbung bleibt immer "denied"
    window.gtag('js', new Date());
    var c = window.CG ? window.CG.S : {};
    window.gtag('config', MK.ga4_id, { user_id: c.code || undefined, send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MK.ga4_id);
    document.head.appendChild(s);
    window.CG_GA_READY = true;
  }
  function loadClarity(){
    if (loaded.clarity || !real(MK.clarity_id)) return; loaded.clarity = true;
    (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y); })(window, document, 'clarity', 'script', MK.clarity_id);
    try { window.clarity('consentv2', { ad_Storage:'denied', analytics_Storage:'granted' }); } catch(_){}
  }
  function wipe(){ // Cookies von GA und Clarity entfernen (Widerruf)
    document.cookie.split(';').forEach(function(x){
      var n = x.split('=')[0].trim();
      if (/^(_ga|_gid|_clck|_clsk|CLID|MUID)/.test(n)) {
        document.cookie = n + '=; Max-Age=0; path=/';
        document.cookie = n + '=; Max-Age=0; path=/; domain=.' + location.hostname;
      }
    });
  }
  function apply(c){
    if (window.CG) window.CG.S.consent = { statistik:!!c.statistik, analyse:!!c.analyse };
    if (c.statistik) { loadGTM(); loadGA(); }
    if (c.analyse) loadClarity();
    if (window.CG) { window.CG.applyIds(); if (c.statistik) window.CG.replayGA(); }
  }
  function decide(c, quelle){
    var prev = read();
    c.zeit = new Date().toISOString();
    write(c);
    if (window.CG) window.CG.track('consent_entscheidung', { statistik:!!c.statistik, analyse:!!c.analyse, irgendeine:!!(c.statistik||c.analyse), quelle:quelle });
    close();
    var widerruf = prev && ((prev.statistik && !c.statistik) || (prev.analyse && !c.analyse));
    if (widerruf) {
      try { window.gtag('consent', 'update', { analytics_storage:'denied' }); } catch(_){}
      try { if (typeof window.clarity === 'function') { window.clarity('consentv2', { ad_Storage:'denied', analytics_Storage:'denied' }); window.clarity('consent', false); } } catch(_){}
      wipe(); if (window.CG) window.CG.flush(); location.reload(); return;
    }
    apply(c);
  }

  /* ---------- Banner ---------- */
  var css = '.cgc{position:fixed;left:0;right:0;bottom:0;z-index:9999;padding:16px max(16px,env(safe-area-inset-left,0px)) calc(16px + env(safe-area-inset-bottom,0px));background:#10241c;color:#eef6f1;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 -10px 30px rgba(0,0,0,.25)}'+
    '.cgc *{box-sizing:border-box}.cgc-in{max-width:980px;margin:0 auto}.cgc h2{font:700 17px/1.3 inherit;margin:0 0 6px}.cgc p{margin:0 0 10px;color:#d3e4da}'+
    '.cgc a{color:#9fe3bf}.cgc-b{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}'+
    '.cgc button{flex:1 1 180px;min-height:46px;border-radius:10px;font:700 15px inherit;cursor:pointer;border:2px solid #eef6f1;background:#eef6f1;color:#10241c}'+
    '.cgc .cgc-b button.main{flex:1 1 200px}.cgc button.alt{background:transparent;color:#eef6f1}.cgc button:focus-visible{outline:3px solid #f8d048;outline-offset:2px}'+
    '.cgc-opt{display:grid;gap:8px;margin:10px 0}.cgc-opt label{display:flex;gap:10px;align-items:flex-start;background:#173528;border-radius:10px;padding:10px 12px}'+
    '.cgc-opt input{width:20px;height:20px;margin-top:2px;accent-color:#f8d048;flex:none}.cgc-opt small{display:block;color:#b5ccbf}.cgc:focus{outline:3px solid #f8d048;outline-offset:-3px}';
  var el = null;
  function close(){ if (el) { el.remove(); el = null; } }
  function open(settings){
    close();
    if (!document.getElementById('cgc-css')) { var st = document.createElement('style'); st.id='cgc-css'; st.textContent = css; document.head.appendChild(st); }
    var c = read() || {};
    var root = (document.documentElement.getAttribute('data-root') || '');
    el = document.createElement('div'); el.className = 'cgc'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Cookie-Einstellungen');
    el.innerHTML = '<div class="cgc-in"><h2>Darf ich messen, wie du diese Testseite nutzt?</h2>'+
      '<p>Diese Seite gehört zu meinem Lehrprojekt. Ohne Cookies und ohne Namen zähle ich, welche Knöpfe geklickt werden. Das läuft immer und speichert nichts auf deinem Gerät. '+
      'Wenn du zustimmst, nutze ich zusätzlich <b>Google Analytics</b> über den Google Tag Manager (Statistik)'+(real(MK.clarity_id)?' und <b>Microsoft Clarity</b> (Klick- und Scroll-Aufzeichnung)':'')+'. Dabei können Daten in die USA übertragen werden. '+
      'Du kannst deine Wahl jederzeit unter „Cookie-Einstellungen“ ändern. Mehr dazu in der <a href="'+root+'datenschutz.html">Datenschutzerklärung</a>.</p>'+
      (settings ? '<div class="cgc-opt">'+
        '<label><input type="checkbox" checked disabled><span><b>Notwendig</b><small>Speichert nur deine Auswahl hier. Immer aktiv.</small></span></label>'+
        '<label><input type="checkbox" id="cgc-s" '+(c.statistik?'checked':'')+'><span><b>Statistik: Google Analytics</b><small>Aufrufe, Klicks und Zeiten, mit pseudonymem Testcode.</small></span></label>'+
        (real(MK.clarity_id)?'<label><input type="checkbox" id="cgc-a" '+(c.analyse?'checked':'')+'><span><b>Nutzungsanalyse: Microsoft Clarity</b><small>Aufzeichnung von Klicks und Scrollen, Heatmaps.</small></span></label>':'')+'</div>' : '')+
      '<div class="cgc-b">'+
        '<button type="button" class="main" id="cgc-no">Alle ablehnen</button>'+
        (settings ? '<button type="button" class="alt" id="cgc-save">Auswahl speichern</button>' : '<button type="button" class="alt" id="cgc-set">Einstellungen</button>')+
        '<button type="button" class="main" id="cgc-yes">Alle akzeptieren</button></div></div>';
    el.tabIndex = -1; document.body.insertBefore(el, document.body.firstChild);
    el.querySelector('#cgc-no').onclick = function(){ decide({statistik:false, analyse:false}, settings?'einstellungen':'banner'); };
    el.querySelector('#cgc-yes').onclick = function(){ decide({statistik:true, analyse:true}, settings?'einstellungen':'banner'); };
    var set = el.querySelector('#cgc-set'); if (set) set.onclick = function(){ open(true); };
    var save = el.querySelector('#cgc-save'); if (save) save.onclick = function(){ decide({ statistik:el.querySelector('#cgc-s').checked, analyse:!!(el.querySelector('#cgc-a')&&el.querySelector('#cgc-a').checked) }, 'einstellungen'); };
    setTimeout(function(){ if (el) el.focus({preventScroll:true}); }, 0);
  }
  window.CGConsent = { open:function(){ open(true); }, read:read };
  function init(){ var c = read(); if (c) apply(c); else open(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
