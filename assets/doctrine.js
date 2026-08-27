/* Doctrine / Why view — extends regulated-ai-wars UI */
(function () {
  let WHY = { territories: {}, cold: [] };

  const I18N_EXTRA = {
    en: {
      "nav.doctrine": "Why",
      "view.doctrine": "DOCTRINE — Why these markets",
      "why.stamp": "WHY THESE MARKETS",
      "why.title": "The high ground is regulated",
      "why.thesis": "Players do not fight for every AI use-case. They fight for <strong>regulated verticals</strong> where data is sticky, compliance is mandatory, and humans sit in the loop — every accepted suggestion is a reward signal into the platform.",
      "why.dim.data": "Data density",
      "why.dim.dataV": "Sticky records, workflows, audit trails",
      "why.dim.reg": "Regulation",
      "why.dim.regV": "Compliance gates lock platforms in",
      "why.dim.hitl": "Human-in-the-loop",
      "why.dim.hitlV": "Experts reward or reject every agent move",
      "why.dim.switch": "Switching cost",
      "why.dim.switchV": "Once embedded, hard to rip out",
      "why.hotTitle": "Contested high ground",
      "why.coldTitle": "Low contest / not the prize",
      "why.coldLead": "These markets may use AI — but they are not the sticky, regulated high ground this board tracks.",
      "why.score": "Contest gravity"
    },
    de: {
      "nav.doctrine": "Warum",
      "view.doctrine": "DOKTRIN — Warum diese Märkte",
      "why.stamp": "WARUM DIESE MÄRKTE",
      "why.title": "Das Hochland ist reguliert",
      "why.thesis": "Player kämpfen nicht um jeden KI-Use-Case. Sie kämpfen um <strong>regulierte Vertikalen</strong>, in denen Daten kleben, Compliance Pflicht ist und Menschen im Loop sitzen — jeder akzeptierte Vorschlag ist ein Reward-Signal in die Plattform.",
      "why.dim.data": "Datendichte",
      "why.dim.dataV": "Klebrige Akten, Workflows, Audit-Trails",
      "why.dim.reg": "Regulierung",
      "why.dim.regV": "Compliance-Tore schließen Plattformen ein",
      "why.dim.hitl": "Human-in-the-loop",
      "why.dim.hitlV": "Experten belohnen oder verwerfen jeden Agent-Schritt",
      "why.dim.switch": "Wechselkosten",
      "why.dim.switchV": "Einmal eingebettet, schwer herauszureißen",
      "why.hotTitle": "Umkämpftes Hochland",
      "why.coldTitle": "Geringer Contest / kein Hauptpreis",
      "why.coldLead": "Diese Märkte nutzen vielleicht KI — sie sind aber nicht das klebrige, regulierte Hochland, das dieses Brett trackt.",
      "why.score": "Contest-Schwerkraft"
    }
  };

  function mergeI18n() {
    if (typeof I18N === "undefined") return;
    Object.keys(I18N_EXTRA).forEach(function (lng) {
      Object.assign(I18N[lng], I18N_EXTRA[lng]);
    });
  }

  function tt(key) {
    if (typeof t === "function") return t(key);
    return key;
  }

  function currentLang() {
    return typeof lang !== "undefined" ? lang : "en";
  }

  window.renderDoctrine = function renderDoctrine() {
    const hotEl = document.getElementById("whyHotGrid");
    const coldEl = document.getElementById("whyColdGrid");
    if (!hotEl || !coldEl) return;
    const lng = currentLang();
    const terr = typeof territories !== "undefined" ? territories : [];
    hotEl.innerHTML = terr
      .map(function (tt0) {
        const meta = WHY.territories[tt0.id];
        if (!meta) return "";
        const loc = meta[lng] || meta.en;
        const g = meta.gravity || 50;
        return (
          '<div class="why-card"><div class="why-card-top"><strong>' +
          tt0.name +
          '</strong><span class="gravity">' +
          tt("why.score") +
          ": " +
          g +
          '</span></div><p>' +
          loc.why +
          '</p><div class="prize">' +
          loc.prize +
          '</div><div class="gbar"><i style="width:' +
          g +
          '%"></i></div></div>'
        );
      })
      .join("");
    coldEl.innerHTML = (WHY.cold || [])
      .map(function (m) {
        const loc = m[lng] || m.en;
        return (
          '<div class="why-card cold"><div class="why-card-top"><strong>' +
          loc.name +
          '</strong><span class="gravity cold-tag">LOW</span></div><p>' +
          loc.why +
          "</p></div>"
        );
      })
      .join("");
  };

  const _switchView = window.switchView;
  window.switchView = function (view) {
    const doc = document.getElementById("doctrineView");
    const btnD = document.getElementById("btnDoctrine");
    if (doc) doc.classList.remove("active");
    if (btnD) btnD.classList.remove("active");
    if (view === "doctrine") {
      const board = document.getElementById("board");
      const world = document.getElementById("worldView");
      const human = document.getElementById("humanView");
      const btnB = document.getElementById("btnBoard");
      const btnW = document.getElementById("btnWorld");
      const btnH = document.getElementById("btnHuman");
      if (board) board.classList.add("hidden");
      if (world) world.classList.remove("active");
      if (human) human.classList.remove("active");
      if (btnB) btnB.classList.remove("active");
      if (btnW) btnW.classList.remove("active");
      if (btnH) {
        btnH.classList.remove("active");
        btnH.classList.remove("human-active");
      }
      if (doc) doc.classList.add("active");
      if (btnD) btnD.classList.add("active");
      const vt = document.getElementById("viewTitle");
      if (vt) vt.textContent = tt("view.doctrine");
      window.renderDoctrine();
      return;
    }
    if (typeof _switchView === "function") _switchView(view);
  };

  const _showDetail = window.showDetail;
  window.showDetail = function (id) {
    if (typeof _showDetail === "function") _showDetail(id);
    const meta = WHY.territories[id];
    if (!meta) return;
    const body = document.getElementById("modalBody");
    if (!body || body.querySelector(".why-inline")) return;
    const loc = meta[currentLang()] || meta.en;
    const box = document.createElement("div");
    box.className = "why-inline";
    box.innerHTML =
      "<strong>" +
      tt("why.stamp") +
      "</strong><p>" +
      loc.why +
      '</p><div class="prize">' +
      loc.prize +
      "</div>";
    const h4 = body.querySelector("h4");
    if (h4) body.insertBefore(box, h4);
    else body.appendChild(box);
  };

  const _setLang = window.setLang;
  window.setLang = function (l) {
    if (typeof _setLang === "function") _setLang(l);
    if (typeof applyStaticI18n === "function") applyStaticI18n();
    window.renderDoctrine();
  };

  async function boot() {
    mergeI18n();
    try {
      const res = await fetch("data/why.json", { cache: "no-store" });
      if (res.ok) WHY = await res.json();
    } catch (e) {
      console.info("why.json not loaded", e);
    }
    if (typeof applyStaticI18n === "function") applyStaticI18n();
    window.renderDoctrine();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
