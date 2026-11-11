/* =====================================================================
   CANNGO · MESSKONZEPT
   Hier stellst du alles ein, was gemessen und ausgewertet wird.
   Änderungen hier wirken auf Landingpage, Prototyp und Dashboard.
   ===================================================================== */
window.MESSKONZEPT = {

  /* --- 1. Deine IDs (Platzhalter ersetzen) ------------------------- */
  // Google Tag Manager: lädt erst nach Zustimmung (Statistik). Tags (z. B. GA4) werden im GTM-Konto eingerichtet.
  gtm_id:     'GTM-PKGMRPJT',
  ga4_ueber_gtm: true,               // true = GA4 läuft über den Tag Manager, nicht zusätzlich direkt (keine doppelten Daten)
  ga4_id:     'G-11BLE52G9V',        // Google Analytics 4: Verwaltung > Datenstreams > Mess-ID
  clarity_id: 'z9cx74st3n',    // Microsoft Clarity: Einstellungen > Übersicht > Projekt-ID

  /* --- 2. Allgemein -------------------------------------------------- */
  version: '2026-11-11-v19',
  netlify_form: 'messung',           // Name des Netlify-Formulars (nur falls du weiter Netlify nutzt)

  /* Datenspeicher für die eigene Messung (Weg B) und die Formulare:
     Web-App-Adresse deines Google Apps Scripts (endet auf /exec), siehe LIES_MICH Schritt 2.
     Solange hier der Platzhalter steht, wird nur auf *.netlify.app über Netlify Forms gesendet. */
  sammel_url: 'https://canngo-sammler.patrick-stelter.workers.dev/',
  // Adressen, auf denen wirklich gesendet wird (Vorschauen und lokale Dateien senden nie)
  live_hosts: /(\.pages\.dev|\.netlify\.app|\.github\.io|\.workers\.dev)$/,

  /* --- 3. KPIs --------------------------------------------------------
     typ:  'eindeutig' = Anzahl verschiedener Werte von feld (z. B. Testcodes)
     typ:  'anteil'  = Sitzungen mit zaehler ÷ Sitzungen mit nenner
           'mittel'  = Mittelwert eines Werts (feld) aus einem Ereignis
           'median'  = Median eines Werts
           'anzahl'  = Anzahl Sitzungen mit dem Ereignis
     wo:   Filter auf Ereignis-Werte, z. B. {produkt:'B'}
     ziel: Zielwert (Anteil 0–1, Sekunden oder Note). Leer lassen = kein Ziel.
     ziel_richtung: 'hoch' = mehr ist besser, 'tief' = weniger ist besser
     je_variante: true = getrennt nach IST und SOLL auswerten
     ------------------------------------------------------------------ */
  /* phase: AARRR-Phase (acquisition, activation, retention, referral, revenue, roadmap)
     eitel: true = Eitelkeitszahl, allein kein Erfolgsbeleg · pruef: Prüffrage aus dem Kurs */
  kpis: [
    // 1 · ACQUISITION · Wie finden uns Menschen?
    { id:'lp_aufrufe',      phase:'acquisition', name:'Besuche der Landingpage (Visitor Count)', typ:'anzahl', zaehler:{e:'lp_aufruf'}, eitel:true, pruef:'Viele Besuche heißen noch nicht, dass jemand testet.' },
    { id:'lp_klickrate',    phase:'acquisition', name:'Klickrate in den Test (CTR der Seite)', typ:'anteil', zaehler:{e:'lp_cta_klick'}, nenner:{e:'lp_aufruf'}, ziel:0.30, ziel_richtung:'hoch' },
    { id:'lp_zeit_klick',   phase:'acquisition', name:'Zeit bis zum Klick in den Test (Sek., Median)', typ:'median', zaehler:{e:'lp_cta_klick'}, feld:'sek', ziel:20, ziel_richtung:'tief' },
    { id:'lp_erste_akt',    phase:'acquisition', name:'Zeit bis zur ersten Interaktion (Sek., Median)', typ:'median', zaehler:{e:'lp_erste_interaktion'}, feld:'sek', ziel:8, ziel_richtung:'tief' },
    { id:'lp_scrolltiefe',  phase:'acquisition', name:'Scrolltiefe (Ø in %)', typ:'mittel', zaehler:{e:'lp_scroll_max'}, feld:'prozent', ziel:75, ziel_richtung:'hoch', eitel:true, pruef:'Tief scrollen kann auch Suchen heißen.' },
    { id:'lp_verweildauer', phase:'acquisition', name:'Verweildauer Landingpage (Sek., Median)', typ:'median', zaehler:{e:'lp_verlassen'}, feld:'sek', eitel:true, pruef:'Lange bleiben kann auch Verwirrung sein.' },
    { id:'lp_loesung',      phase:'acquisition', name:'Lösung gesehen (Abschnitt erreicht)', typ:'anteil', zaehler:{e:'lp_abschnitt_erreicht', wo:{abschnitt:'loesung'}}, nenner:{e:'lp_aufruf'}, ziel:0.6, ziel_richtung:'hoch' },
    { id:'consent_rate',    phase:'acquisition', name:'Einwilligungsrate Cookie-Banner', typ:'anteil', zaehler:{e:'consent_entscheidung', wo:{irgendeine:true}}, nenner:{e:'consent_entscheidung'}, pruef:'Zeigt, wie viele Besuche auch in GA4 auftauchen.' },

    // 2 · ACTIVATION · Erleben sie den Nutzen zum ersten Mal?  (Aktivierung = Anfrage im Test abgeschickt)
    { id:'onboarding',      phase:'activation', name:'Onboarding Rate (Tour beendet ÷ gestartet)', typ:'anteil', zaehler:{e:'tour_ende'}, nenner:{e:'tour_start'}, ziel:0.7, ziel_richtung:'hoch' },
    { id:'lp_test_start',   phase:'activation', name:'Aufruf → Test gestartet', typ:'anteil', zaehler:{e:'test_start'}, nenner:{e:'lp_aufruf'}, ziel:0.20, ziel_richtung:'hoch' },
    { id:'aktivierung',     phase:'activation', name:'Aktivierung: Aufruf → Anfrage im Test abgeschickt', typ:'anteil', zaehler:{e:'anfrage_gesendet'}, nenner:{e:'lp_aufruf'}, ziel:0.15, ziel_richtung:'hoch' },
    { id:'aufgabe',         phase:'activation', name:'Aufgabe gelöst (Produkt B in der Anfrage)', typ:'anteil', zaehler:{e:'anfrage_gesendet', wo:{produkt:'B'}}, nenner:{e:'test_start'}, ziel:0.9, ziel_richtung:'hoch', je_variante:true, pruef:'Meine wichtigste Zahl: Kommt an, was man wollte?' },
    { id:'testdauer',       phase:'activation', name:'Time to Value: Teststart → Absenden (Sek., Median)', typ:'median', zaehler:{e:'test_ende'}, feld:'sek', je_variante:true },
    { id:'gesundheit_nein', phase:'activation', name:'Erster Klick Gesundheit = „Nein“', typ:'anteil', zaehler:{e:'gesundheit_antwort', wo:{erste:true, wert:'nein'}}, nenner:{e:'test_start'}, je_variante:true },
    { id:'zurueck',         phase:'activation', name:'Klicks auf „Zurück“ pro Test (Ø)', typ:'mittel', zaehler:{e:'test_ende'}, feld:'zurueck', je_variante:true },
    { id:'aendern',         phase:'activation', name:'Klicks auf „Produkt/Gesundheit ändern“ pro Test (Ø)', typ:'mittel', zaehler:{e:'test_ende'}, feld:'aendern', je_variante:true },
    { id:'bewertung',       phase:'activation', name:'Bewertung Ø (1–5)', typ:'mittel', zaehler:{e:'bewertung_gesendet'}, feld:'durchschnitt', ziel:4, ziel_richtung:'hoch', je_variante:true },

    // 3 · RETENTION · Kommen sie wieder?
    { id:'testpersonen',    phase:'retention', name:'Unique Testpersonen (verschiedene Codes)', typ:'eindeutig', zaehler:{e:'test_start'}, feld:'code' },
    { id:'zweiter_test',    phase:'retention', name:'Testpersonen mit zweitem Test (IST und SOLL)', typ:'code_quote', zaehler:{e:'test_start'}, min:2, ziel:0.5, ziel_richtung:'hoch', pruef:'Ohne Cookies erkenne ich Wiederkehr nur über den Testcode.' },
    { id:'lp_vormerken',    phase:'retention', name:'Aufruf → als Testperson vorgemerkt', typ:'anteil', zaehler:{e:'lp_formular_gesendet', wo:{formular:'vormerken'}}, nenner:{e:'lp_aufruf'}, ziel:0.05, ziel_richtung:'hoch' },

    // 4 · REFERRAL · Empfehlen sie uns weiter?
    { id:'nps',             phase:'referral', name:'Net Promoter Score (−100 bis +100)', typ:'nps', zaehler:{e:'nps_antwort'}, feld:'wert', ziel:0, ziel_richtung:'hoch', je_variante:true },
    { id:'teilen',          phase:'referral', name:'Teilen-Klicks pro abgeschlossenem Test', typ:'verhaeltnis', zaehler:{e:'teilen_klick'}, nenner:{e:'test_ende'} },
    { id:'empfehlung',      phase:'referral', name:'Besuche über Empfehlungslink', typ:'anteil', zaehler:{e:'lp_aufruf', wo:{quelle:'empfehlung'}}, nenner:{e:'lp_aufruf'} },
    { id:'k_faktor',        phase:'referral', name:'k-Faktor (Näherung): Empfehlungsbesuche ÷ Teilende', typ:'verhaeltnis', zaehler:{e:'lp_aufruf', wo:{quelle:'empfehlung'}}, nenner:{e:'teilen_klick'}, ziel:1, ziel_richtung:'hoch', pruef:'Ab k > 1 wächst es von allein, bei kleinen Zahlen nur ein Hinweis.' },

    // 5 · REVENUE · Verdienen wir damit Geld?  (im Lehrprojekt nur simuliert)
    { id:'arpu_sim',        phase:'revenue', name:'Simulierte Prüfgebühr pro Besuch (ARPU-Näherung, €)', typ:'verhaeltnis', zaehler:{e:'anfrage_gesendet'}, nenner:{e:'lp_aufruf'}, faktor:14.99, einheit:'€', eitel:true, pruef:'Kein echter Umsatz, nur Größenordnung: Fehlbestellungen kosten später Geld.' },
    { id:'fehl_anfrage',    phase:'revenue', name:'Anfragen mit falschem Produkt (Kostenrisiko)', typ:'anteil', zaehler:{e:'anfrage_gesendet', wo:{produkt:'A'}}, nenner:{e:'anfrage_gesendet'}, ziel:0.1, ziel_richtung:'tief', je_variante:true },

    // Roadmap-Signale · Was wollen Nutzer als Nächstes?
    { id:'lp_ideen',        phase:'roadmap', name:'Ideen-Bereich gesehen', typ:'anteil', zaehler:{e:'lp_abschnitt_erreicht', wo:{abschnitt:'ideen'}}, nenner:{e:'lp_aufruf'} },
    { id:'lp_interesse',    phase:'roadmap', name:'Mind. eine Idee mit „Interessiert mich“', typ:'anteil', zaehler:{e:'lp_idee_interesse'}, nenner:{e:'lp_aufruf'} },
    { id:'lp_barrierefrei', phase:'roadmap', name:'Interesse Barrierefreiheit (Einfach-Modus oder Sprache)', typ:'anteil', zaehler:{e:'lp_idee_interesse', wo:{idee:['einfach_modus','sprach_anfrage']}}, nenner:{e:'lp_abschnitt_erreicht', wo:{abschnitt:'ideen'}} },
    { id:'lp_club',         phase:'roadmap', name:'Interesse Social-Club-Finder', typ:'anteil', zaehler:{e:'lp_idee_interesse', wo:{idee:'social_club_finder'}}, nenner:{e:'lp_abschnitt_erreicht', wo:{abschnitt:'ideen'}} },
    { id:'lp_idee_form',    phase:'roadmap', name:'Ideen eingereicht (Sitzungen)', typ:'anzahl', zaehler:{e:'lp_formular_gesendet', wo:{formular:'idee'}} },
    { id:'lp_formular_ab',  phase:'roadmap', name:'Formular begonnen → gesendet', typ:'anteil', zaehler:{e:'lp_formular_gesendet'}, nenner:{e:'lp_formular_start'}, ziel:0.6, ziel_richtung:'hoch' }
  ],

  phasen: [
    { id:'acquisition', name:'Acquisition', frage:'Wie finden uns Menschen?', icon:'🔭' },
    { id:'activation',  name:'Activation',  frage:'Erleben sie den Nutzen zum ersten Mal?', icon:'🧰' },
    { id:'retention',   name:'Retention',   frage:'Kommen sie wieder?', icon:'⚓' },
    { id:'referral',    name:'Referral',    frage:'Empfehlen sie uns weiter?', icon:'🦜' },
    { id:'revenue',     name:'Revenue',     frage:'Verdienen wir damit Geld? (simuliert)', icon:'🪙' },
    { id:'roadmap',     name:'Roadmap-Signale', frage:'Was wollen Nutzer als Nächstes?', icon:'🧭' }
  ],


  /* --- 5. Ereignisliste: feste Namen ----------------------------------
     Nur diese Namen werden verwendet. Ein unbekannter Name erscheint im
     Dashboard rot unter "Datenqualität".
     ga4: true  = in GA4 als Schlüsselereignis markieren
     param: Werte, die mitgeschickt werden (in GA4 als Dimension registrieren)
     ------------------------------------------------------------------ */
  ereignisse: [
    // Alle Seiten
    { e:'consent_entscheidung', ort:'Banner',      wann:'Entscheidung im Cookie-Banner', param:'statistik, analyse, irgendeine, quelle' },
    { e:'bildschirm_dauer',     ort:'Alle',        wann:'Beim Wechsel des Bildschirms / Verlassen', param:'name, sek_auf' },
    { e:'seite_datenschutz',    ort:'Rechtstexte', wann:'Datenschutzerklärung geöffnet' },
    { e:'seite_impressum',      ort:'Rechtstexte', wann:'Impressum geöffnet' },
    { e:'seite_teilnahme',      ort:'Rechtstexte', wann:'Teilnahmehinweise geöffnet' },
    { e:'seite_agb_demo',       ort:'Rechtstexte', wann:'Demo-AGB geöffnet' },
    // Landingpage
    { e:'lp_aufruf',            ort:'Landingpage', wann:'Seite geladen', param:'quelle' },
    { e:'lp_scroll',            ort:'Landingpage', wann:'25 / 50 / 75 / 100 % gescrollt', param:'prozent' },
    { e:'lp_scroll_max',        ort:'Landingpage', wann:'Beim Verlassen: tiefster Punkt', param:'prozent' },
    { e:'lp_cta_klick',         ort:'Landingpage', wann:'Jeder Knopf in den Klicktest', param:'sek, position, variante', ga4:true },
    { e:'lp_formular_start',    ort:'Landingpage', wann:'Erstes Feld eines Formulars angeklickt', param:'formular, sek' },
    { e:'lp_formular_gesendet', ort:'Landingpage', wann:'Formular „vormerken“ oder „Idee“ abgeschickt (ohne Inhalt)', param:'formular, sek, zeitraum, bereich, prioritaet', ga4:true },
    { e:'lp_formular_fehler',   ort:'Landingpage', wann:'Absenden fehlgeschlagen', param:'formular' },
    { e:'lp_formular_pruefung', ort:'Landingpage', wann:'Absenden mit fehlender Angabe versucht', param:'formular' },
    { e:'lp_erste_interaktion', ort:'Landingpage', wann:'Erstes Scrollen, Tippen oder Klicken', param:'art, sek' },
    { e:'lp_abschnitt_erreicht',ort:'Landingpage', wann:'Abschnitt zum ersten Mal 1 s sichtbar', param:'abschnitt, sek' },
    { e:'lp_abschnitt',         ort:'Landingpage', wann:'Beim Verlassen: Lesezeit pro Abschnitt', param:'abschnitt, sek_sichtbar' },
    { e:'lp_verlassen',         ort:'Landingpage', wann:'Beim Verlassen oder Wechsel in den Test', param:'grund, sek, scroll_max, abschnitte' },
    { e:'lp_nav_klick',         ort:'Landingpage', wann:'Klick im Menü oder auf „So funktioniert’s“', param:'ziel' },
    { e:'lp_ideen_filter',      ort:'Landingpage', wann:'Filter bei den Ideen', param:'filter' },
    { e:'lp_idee_interesse',    ort:'Landingpage', wann:'„Interessiert mich“ bei einer Idee', param:'idee', ga4:true },
    { e:'lp_idee_interesse_weg',ort:'Landingpage', wann:'„Interessiert mich“ zurückgenommen', param:'idee' },
    { e:'lp_idee_details',      ort:'Landingpage', wann:'Details einer Idee aufgeklappt', param:'idee' },
    // Prototyp: Einstieg und Tour
    { e:'app_aufruf',           ort:'Prototyp',    wann:'Prototyp geladen', param:'quelle' },
    { e:'tour_start',           ort:'Prototyp',    wann:'„Tour starten“' },
    { e:'tour_schritt',         ort:'Prototyp',    wann:'Jeder Tour-Schritt', param:'nr, name' },
    { e:'tour_ende',            ort:'Prototyp',    wann:'Letzter Tour-Schritt fertig' },
    { e:'tour_uebersprungen',   ort:'Prototyp',    wann:'„Tour überspringen“', param:'bei' },
    { e:'test_anmeldung',       ort:'Prototyp',    wann:'Code, Variante, Reihenfolge bestätigt', param:'variante, reihenfolge' },
    { e:'test_start',           ort:'Prototyp',    wann:'„Los geht’s“ nach der Aufgabe', param:'variante, reihenfolge', ga4:true },
    // Prototyp: Aufgabe
    { e:'produkte_ansicht',     ort:'Prototyp',    wann:'Produktliste geöffnet' },
    { e:'produkt_suche',        ort:'Prototyp',    wann:'Suchbegriff eingegeben', param:'suchbegriff, treffer' },
    { e:'produkt_in_warenkorb', ort:'Prototyp',    wann:'„In den Warenkorb“', param:'produkt' },
    { e:'warenkorb_ansicht',    ort:'Prototyp',    wann:'Warenkorb geöffnet', param:'variante' },
    { e:'gesundheit_antwort',   ort:'Prototyp',    wann:'Antwort auf die Gesundheitsfrage', param:'wert, erste, variante' },
    { e:'produkt_wahl',         ort:'Prototyp',    wann:'Produkt für die Anfrage gewählt', param:'produkt, variante' },
    { e:'produkt_aendern',      ort:'Prototyp',    wann:'„Produkt ändern“ in der Übersicht (SOLL)', param:'variante' },
    { e:'gesundheit_aendern',   ort:'Prototyp',    wann:'„Gesundheit ändern“ in der Übersicht (SOLL)', param:'variante' },
    { e:'zurueck_klick',        ort:'Prototyp',    wann:'Zurück-Pfeil', param:'von' },
    { e:'agb_geoeffnet',        ort:'Prototyp',    wann:'Demo-AGB angeklickt' },
    { e:'agb_akzeptiert',       ort:'Prototyp',    wann:'Häkchen AGB + Datenschutz gesetzt' },
    { e:'agb_abgewaehlt',       ort:'Prototyp',    wann:'Häkchen wieder entfernt' },
    { e:'anfrage_gesendet',     ort:'Prototyp',    wann:'Anfrage abgeschickt', param:'produkt, variante, warenkorb', ga4:true },
    { e:'test_ende',            ort:'Prototyp',    wann:'Direkt nach dem Absenden', param:'zurueck, aendern, sek, variante' },
    { e:'bewertung_gesendet',   ort:'Prototyp',    wann:'Kurzbewertung abgeschickt', param:'r1–r3, durchschnitt, geglaubt, sicherheit, variante', ga4:true },
    { e:'app_einstellung',      ort:'Prototyp',    wann:'Schalter „Größere Schrift“ (Barrierefreiheit)', param:'wert', ga4:true },
    { e:'nps_antwort',          ort:'Prototyp',    wann:'Empfehlungsfrage 0–10 in der Bewertung', param:'wert, kategorie, variante', ga4:true },
    { e:'teilen_klick',         ort:'Alle',        wann:'„Teilen“ / Link kopieren', param:'ort, variante' },
    { e:'klick',                ort:'Prototyp',    wann:'Jeder Knopf (Klickprotokoll)', param:'label' },
    { e:'nebenbereich',         ort:'Prototyp',    wann:'Bereich außerhalb der Aufgabe geöffnet', param:'name' }
  ],

  /* --- 4. Trichter: Schritte in Reihenfolge (Abbruch pro Schritt) --- */
  trichter: [
    { e:'lp_aufruf',          name:'Landingpage geöffnet' },
    { e:'lp_cta_klick',       name:'Knopf geklickt' },
    { e:'app_aufruf',         name:'App geöffnet' },
    { e:'test_start',         name:'Test gestartet' },
    { e:'produkt_in_warenkorb', name:'Produkt in den Warenkorb gelegt' },
    { e:'warenkorb_ansicht',  name:'Warenkorb erreicht' },
    { e:'gesundheit_antwort', name:'Gesundheitsfrage beantwortet' },
    { e:'anfrage_gesendet',   name:'Anfrage abgeschickt' },
    { e:'bewertung_gesendet', name:'Bewertung abgegeben' }
  ]
};
