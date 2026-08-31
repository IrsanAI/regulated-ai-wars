/**
 * Phase B/C elevation — loads after app.js
 * Leader/gap + contest meter on territories; trend-only world motion.
 */
(function () {
  function contestIndex(influence) {
    const vals = Object.values(influence || {})
      .map(Number)
      .filter((v) => !isNaN(v))
      .sort((a, b) => b - a);
    if (vals.length < 2) return 0;
    const gap = vals[0] - vals[1];
    const pack = vals.filter((v) => vals[0] - v <= 10).length;
    return Math.min(1, (pack / 4) * 0.6 + (1 - Math.min(gap, 30) / 30) * 0.4);
  }

  function leaderGap(influence) {
    const sorted = Object.entries(influence || {})
      .map(([k, v]) => [k, Number(v)])
      .filter(([, v]) => !isNaN(v))
      .sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    const gap = sorted.length > 1 ? Math.round(sorted[0][1] - sorted[1][1]) : 0;
    return {
      leader: sorted[0][0],
      leadScore: Math.round(sorted[0][1]),
      second: sorted[1] ? sorted[1][0] : null,
      gap,
    };
  }

  function gapLabel() {
    try {
      return typeof t === "function" ? t("board.gap") : "gap";
    } catch (e) {
      return "gap";
    }
  }
  function contestLabel() {
    try {
      return typeof t === "function" ? t("board.contest") : "contest";
    } catch (e) {
      return "contest";
    }
  }

  window.renderBoard = function renderBoard() {
    const board = document.getElementById("board");
    if (!board || typeof territories === "undefined") return;
    board.innerHTML = territories
      .map((tt) => {
        const total =
          Object.values(tt.influence).reduce((a, b) => a + b, 0) || 1;
        const sorted = Object.entries(tt.influence).sort((a, b) => b[1] - a[1]);
        const bars = sorted
          .map(([pid, val]) => {
            const hex = PLAYERS[pid] ? PLAYERS[pid].hex : "#555";
            const name = PLAYERS[pid] ? PLAYERS[pid].name : pid;
            return `<span style="width:${((val / total) * 100).toFixed(
              0
            )}%;background:${hex}" title="${name}: ${val}"></span>`;
          })
          .join("");
        const tokens = sorted
          .slice(0, 5)
          .map(([pid]) => {
            const p = PLAYERS[pid];
            if (!p) return "";
            const tr = (tt.trend && tt.trend[pid]) || "stable";
            return `<span class="token-wrap" title="${p.name}: ${tr}"><div class="token-mini" style="background:${
              p.hex
            }">${p.short}</div><span class="token-trend ${trendClass(
              tr
            )}">${trendGlyph(tr)}</span></span>`;
          })
          .join("");
        const sc =
          tt.status === "hot"
            ? "hot"
            : tt.status === "contested"
            ? "contested"
            : "";
        const badgeCls = tt.status === "hot" ? "hot-live" : "";
        const badge =
          tt.status === "hot"
            ? t("status.hot")
            : tt.status === "contested"
            ? t("status.contested")
            : t("status.stable");
        const lg = leaderGap(tt.influence);
        const ci = contestIndex(tt.influence);
        const leadP = lg && PLAYERS[lg.leader];
        const gapLine =
          lg && leadP
            ? `<div class="lead-gap"><span class="lead-name" style="color:${
                leadP.hex
              }">${leadP.short} ${lg.leadScore}</span><span class="gap-label">${gapLabel()} ${
                lg.gap
              }</span><span class="contest-meter" title="${contestLabel()} ${(ci * 100).toFixed(
                0
              )}%"><i style="width:${(ci * 100).toFixed(0)}%"></i></span></div>`
            : "";
        return `<div class="territory ${sc}" onclick="showDetail('${tt.id}')"><div class="status-badge ${badgeCls}">${badge}</div><div class="name">${tt.name}</div><div class="meta">${
          tt.meta || ""
        }</div><div class="influence-bar">${bars}</div>${gapLine}<div class="tokens">${tokens}</div></div>`;
      })
      .join("");
  };

  window.renderWorld = function renderWorld() {
    const beacons = document.getElementById("beacons");
    if (!beacons || typeof geoDominance === "undefined") return;
    beacons.innerHTML = "";
    Object.entries(geoDominance).forEach(([id, data]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const p = PLAYERS[data.dominant];
      if (!p) return;
      el.style.fill = p.hex;
      el.style.opacity = 0.28 + data.intensity * 0.55;
      const tr = data.trend || "stable";
      el.classList.toggle("high-intensity", data.intensity >= 0.7 && tr === "up");
      el.classList.toggle("fading", tr === "down");
      el.onclick = () => showGeoDetail(id);
      const [cx, cy] = CENTROIDS[id] || [0, 0];
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "beacon");
      g.innerHTML = `<circle class="beacon-ring${
        tr === "up" ? " pulse" : ""
      }" cx="${cx}" cy="${cy}" r="4" stroke="${p.hex}"/><circle class="beacon-core" cx="${cx}" cy="${cy}" r="3.2" fill="${p.hex}"/>`;
      beacons.appendChild(g);
      if (tr === "up" || tr === "down") {
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", cx + 10);
        label.setAttribute("y", cy + 4);
        label.setAttribute("fill", tr === "up" ? "#34d399" : "#f87171");
        label.setAttribute("font-size", "12");
        label.setAttribute("font-weight", "700");
        label.textContent = trendGlyph(tr);
        beacons.appendChild(label);
      }
    });
    const stamp = document.getElementById("worldBoardStamp");
    if (stamp) {
      const dateEl = document.getElementById("lastUpdate");
      const ds = (dateEl && dateEl.textContent) || "";
      const cleaned = ds.replace(/^Snapshot:\s*/i, "").trim();
      if (cleaned && cleaned !== "—") stamp.textContent = cleaned;
    }
    const leg = document.getElementById("worldLegend");
    if (leg) {
      leg.innerHTML = Object.values(PLAYERS)
        .map((p) => `<span><i style="background:${p.hex}"></i>${p.short}</span>`)
        .join("");
    }
  };

  const _showDetail = window.showDetail;
  window.showDetail = function showDetail(id) {
    if (typeof _showDetail === "function") _showDetail(id);
    const t0 = territories.find((x) => x.id === id);
    if (!t0) return;
    const body = document.getElementById("modalBody");
    if (!body) return;
    const lg = leaderGap(t0.influence);
    const ci = contestIndex(t0.influence);
    if (!lg) return;
    const chip = document.createElement("p");
    chip.style.cssText =
      "font-size:.8rem;margin:8px 0 10px;color:var(--muted)";
    chip.innerHTML = `${gapLabel()}: <strong style="color:var(--text)">${
      lg.gap
    }</strong> · ${contestLabel()}: <strong style="color:var(--text)">${(
      ci * 100
    ).toFixed(0)}%</strong>`;
    const h4 = body.querySelector("h4");
    if (h4) body.insertBefore(chip, h4);
    else body.appendChild(chip);
  };

  // Inject minimal i18n fallbacks
  if (typeof I18N !== "undefined") {
    if (I18N.en) {
      I18N.en["board.gap"] = I18N.en["board.gap"] || "gap";
      I18N.en["board.contest"] = I18N.en["board.contest"] || "contest";
      I18N.en["estimate.banner"] =
        I18N.en["estimate.banner"] ||
        "Relative estimates · not market share · not live telemetry";
      I18N.en["estimate.short"] =
        I18N.en["estimate.short"] || "Relative estimates only";
      I18N.en["nav.sim"] = "Demo drift";
    }
    if (I18N.de) {
      I18N.de["board.gap"] = I18N.de["board.gap"] || "Vorsprung";
      I18N.de["board.contest"] = I18N.de["board.contest"] || "Umkämpft";
      I18N.de["estimate.banner"] =
        I18N.de["estimate.banner"] ||
        "Relative Schätzungen · kein Marktanteil · keine Telemetrie";
      I18N.de["estimate.short"] =
        I18N.de["estimate.short"] || "Nur relative Schätzungen";
      I18N.de["nav.sim"] = "Demo-Drift";
    }
  }

  // Re-render once DOM + snapshot ready
  function refresh() {
    try {
      if (typeof renderBoard === "function") renderBoard();
      if (typeof renderWorld === "function") renderWorld();
      if (typeof applyStaticI18n === "function") applyStaticI18n();
    } catch (e) {
      console.info("board-logic refresh", e);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(refresh, 50));
  } else {
    setTimeout(refresh, 80);
  }
  // After external snapshot
  const prev = window.loadExternalSnapshot;
  if (typeof prev === "function") {
    window.loadExternalSnapshot = async function () {
      await prev.apply(this, arguments);
      refresh();
    };
  }
})();
