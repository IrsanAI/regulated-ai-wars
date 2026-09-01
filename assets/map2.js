/**
 * Map v2 preview — node/signal world board.
 * Activate: ?preview=map2  or localStorage raw_map2=1
 * Does not replace legacy renderer unless activated.
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";

  function previewOn() {
    try {
      const q = new URLSearchParams(location.search);
      if (q.get("preview") === "map2") return true;
      if (localStorage.getItem("raw_map2") === "1") return true;
    } catch (e) {}
    return false;
  }

  const LOBES = [
    { cx: 150, cy: 120, rx: 95, ry: 55 },
    { cx: 115, cy: 175, rx: 55, ry: 35 },
    { cx: 195, cy: 290, rx: 42, ry: 78 },
    { cx: 430, cy: 108, rx: 52, ry: 32 },
    { cx: 460, cy: 220, rx: 55, ry: 88 },
    { cx: 585, cy: 115, rx: 115, ry: 65 },
    { cx: 625, cy: 178, rx: 75, ry: 45 },
    { cx: 685, cy: 300, rx: 50, ry: 32 },
  ];

  const COORDS = {
    na: { x: 150, y: 120, name: "North America" },
    sa: { x: 195, y: 290, name: "South America" },
    eu: { x: 430, y: 118, name: "Europe" },
    af: { x: 460, y: 225, name: "Africa" },
    as: { x: 600, y: 145, name: "Asia" },
    oc: { x: 685, y: 300, name: "Oceania" },
  };

  function confidenceFromIntensity(i) {
    if (i >= 0.65) return "high";
    if (i >= 0.35) return "medium";
    return "directional";
  }

  function scoreFromIntensity(i) {
    return Math.round(18 + Math.max(0, Math.min(1, i)) * 62);
  }

  function buildRegions() {
    const geo = typeof geoDominance !== "undefined" ? geoDominance : {};
    const players = typeof PLAYERS !== "undefined" ? PLAYERS : window.PLAYERS_SHARED || {};
    return Object.keys(COORDS).map((id) => {
      const c = COORDS[id];
      const data = geo[id] || { dominant: "microsoft", intensity: 0.2, trend: "stable", note: "" };
      const intensity = Number(data.intensity) || 0;
      const conf = confidenceFromIntensity(intensity);
      const score = scoreFromIntensity(intensity);
      const leaders = [
        {
          player: data.dominant,
          score: score,
          confidence: conf,
        },
      ];
      // Soft contested: mid intensity + competitive theaters (honest heuristic until event log exists)
      let contested = false;
      if ((id === "eu" || id === "na") && intensity >= 0.45 && intensity < 0.75) {
        contested = true;
        const second = data.dominant === "microsoft" ? "google" : "microsoft";
        leaders.push({
          player: second,
          score: Math.max(20, score - 6),
          confidence: "medium",
        });
      }
      return {
        id,
        name: c.name,
        x: c.x,
        y: c.y,
        intensity,
        trend: data.trend || "stable",
        note: data.note || "",
        leaders,
        contested,
        players,
      };
    });
  }

  function ensureDom() {
    const world = document.getElementById("worldView");
    if (!world) return null;
    let root = document.getElementById("map2Root");
    if (root) return root;
    root = document.createElement("div");
    root.id = "map2Root";
    root.className = "map2-root";
    root.innerHTML = `
      <div class="map2-banner">Map v2 preview · signal nodes · not ownership</div>
      <div class="map2-panel">
        <div class="map2-scan"></div>
        <svg id="map2Svg" viewBox="0 0 800 400" role="img" aria-label="Signal node world board">
          <g id="map2Grid"></g>
          <g id="map2Land"></g>
          <g id="map2Nodes"></g>
        </svg>
      </div>
      <div class="map2-ticker" id="map2Ticker"></div>
      <div class="map2-detail" id="map2Detail">
        <div class="d-title">Tap a marker</div>
        <div>Theater footprint signals — relative, not market share.</div>
      </div>
      <div class="map2-conf">
        <span>● solid = high confidence</span>
        <span>◐ faded = medium</span>
        <span>○ dashed = directional</span>
        <span>◑ split = contested (heuristic)</span>
      </div>`;
    world.appendChild(root);
    return root;
  }

  function drawGrid(svgG) {
    svgG.innerHTML = "";
    for (let x = 0; x <= 800; x += 80) {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", x);
      l.setAttribute("x2", x);
      l.setAttribute("y1", 0);
      l.setAttribute("y2", 400);
      l.setAttribute("class", "map2-grid");
      svgG.appendChild(l);
    }
    for (let y = 0; y <= 400; y += 80) {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", 0);
      l.setAttribute("x2", 800);
      l.setAttribute("y1", y);
      l.setAttribute("y2", y);
      l.setAttribute("class", "map2-grid");
      svgG.appendChild(l);
    }
  }

  function drawLand(svgG) {
    svgG.innerHTML = "";
    LOBES.forEach((lobe) => {
      const count = Math.round((lobe.rx * lobe.ry) / 55);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        const x = lobe.cx + Math.cos(a) * lobe.rx * r;
        const y = lobe.cy + Math.sin(a) * lobe.ry * r;
        if (Math.random() < 0.15 * r) continue;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", x.toFixed(1));
        c.setAttribute("cy", y.toFixed(1));
        c.setAttribute("r", 1.3);
        c.setAttribute("class", "map2-dot");
        svgG.appendChild(c);
      }
    });
  }

  function polar(cx, cy, r, angleDeg) {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function arc(cx, cy, r, startAngle, endAngle) {
    const start = polar(cx, cy, r, endAngle);
    const end = polar(cx, cy, r, startAngle);
    const large = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
  }

  function playerHex(id, players) {
    if (players && players[id] && players[id].hex) return players[id].hex;
    if (window.PLAYERS_SHARED && window.PLAYERS_SHARED[id])
      return window.PLAYERS_SHARED[id].hex;
    return "#8b93a6";
  }
  function playerName(id, players) {
    if (players && players[id] && players[id].name) return players[id].name;
    if (window.PLAYERS_SHARED && window.PLAYERS_SHARED[id])
      return window.PLAYERS_SHARED[id].name;
    return id;
  }

  function showDetail(region) {
    const el = document.getElementById("map2Detail");
    if (!el) return;
    const names = region.leaders
      .map(
        (l) =>
          `${playerName(l.player, region.players)} (${l.score} · ${l.confidence})`
      )
      .join(region.contested ? " vs " : ", ");
    el.innerHTML = `
      <div class="d-title">${region.name}</div>
      <div>${region.contested ? "Contested heuristic: " : "Lead footprint: "}${names}</div>
      <div>${region.note || "No theater note this cycle."}</div>
      <div class="d-meta">intensity ${region.intensity.toFixed(2)} · trend ${region.trend} · relative footprint, not ownership</div>`;
  }

  function drawNodes(svgG, regions) {
    svgG.innerHTML = "";
    regions.forEach((region) => {
      const wrap = document.createElementNS(NS, "g");
      wrap.setAttribute("class", "map2-node");
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("data-id", region.id);
      const leader = region.leaders[0];
      const r = 8 + leader.score * 0.18;
      const color = playerHex(leader.player, region.players);

      if (region.contested && region.leaders[1]) {
        const color2 = playerHex(region.leaders[1].player, region.players);
        [1.9, 1.4].forEach((mult, i) => {
          const halo = document.createElementNS(NS, "circle");
          halo.setAttribute("cx", region.x);
          halo.setAttribute("cy", region.y);
          halo.setAttribute("r", r * mult);
          halo.setAttribute("fill", color);
          halo.setAttribute("opacity", i === 0 ? 0.06 : 0.1);
          wrap.appendChild(halo);
        });
        const arc1 = document.createElementNS(NS, "path");
        arc1.setAttribute("d", arc(region.x, region.y, r, 0, 180));
        arc1.setAttribute("stroke", color);
        arc1.setAttribute("stroke-width", 3.5);
        arc1.setAttribute("fill", "none");
        const arc2 = document.createElementNS(NS, "path");
        arc2.setAttribute("d", arc(region.x, region.y, r, 180, 360));
        arc2.setAttribute("stroke", color2);
        arc2.setAttribute("stroke-width", 3.5);
        arc2.setAttribute("fill", "none");
        wrap.appendChild(arc1);
        wrap.appendChild(arc2);
      } else {
        const circle = document.createElementNS(NS, "circle");
        circle.setAttribute("cx", region.x);
        circle.setAttribute("cy", region.y);
        circle.setAttribute("r", r);
        circle.setAttribute("stroke", color);
        if (leader.confidence === "high") {
          circle.setAttribute("fill", color);
          circle.setAttribute("fill-opacity", 0.85);
          circle.setAttribute("stroke-width", 0);
        } else if (leader.confidence === "medium") {
          circle.setAttribute("fill", color);
          circle.setAttribute("fill-opacity", 0.32);
          circle.setAttribute("stroke-width", 1);
        } else {
          circle.setAttribute("fill", "none");
          circle.setAttribute("stroke-width", 1.4);
          circle.setAttribute("stroke-dasharray", "2,3");
        }
        wrap.appendChild(circle);
      }

      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", region.x);
      label.setAttribute("y", region.y + r + 12);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "map2-label");
      label.textContent = region.name.toLowerCase();
      wrap.appendChild(label);

      wrap.addEventListener("click", () => showDetail(region));
      wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter") showDetail(region);
      });
      svgG.appendChild(wrap);
    });
  }

  function drawTicker(regions) {
    const el = document.getElementById("map2Ticker");
    if (!el) return;
    const events =
      typeof window.events !== "undefined"
        ? window.events
        : typeof events !== "undefined"
        ? events
        : [];
    let lines = [];
    if (Array.isArray(events) && events.length) {
      lines = events.slice(0, 4).map((ev) => {
        const d = (ev.time || "").slice(0, 10);
        return `<div><span class="tag">${d}</span> <span class="pos">${(
          ev.text || ""
        ).replace(/</g, "&lt;")}</span></div>`;
      });
    } else {
      lines = regions
        .filter((r) => r.intensity >= 0.35)
        .map(
          (r) =>
            `<div><span class="tag">${r.id}</span> <span class="pos">${playerName(
              r.leaders[0].player,
              r.players
            )} · ${r.leaders[0].confidence}</span> — intensity ${r.intensity.toFixed(
              2
            )}</div>`
        );
    }
    el.innerHTML = lines.join("") || "<div class=\"tag\">No signals</div>";
  }

  let landDrawn = false;

  window.renderMap2 = function renderMap2() {
    if (!previewOn()) return false;
    const root = ensureDom();
    if (!root) return false;
    const world = document.getElementById("worldView");
    if (world) world.classList.add("map2-active");

    if (typeof applySharedPlayers === "function") applySharedPlayers();

    const grid = document.getElementById("map2Grid");
    const land = document.getElementById("map2Land");
    const nodes = document.getElementById("map2Nodes");
    if (!grid || !land || !nodes) return false;

    if (!landDrawn) {
      drawGrid(grid);
      drawLand(land);
      landDrawn = true;
    }
    const regions = buildRegions();
    drawNodes(nodes, regions);
    drawTicker(regions);
    return true;
  };

  function install() {
    if (!previewOn()) return;
    if (typeof applySharedPlayers === "function") applySharedPlayers();

    const prev =
      typeof window.renderWorld === "function" ? window.renderWorld : null;
    window.renderWorld = async function () {
      const ok = window.renderMap2();
      if (!ok && prev) return prev();
    };

    // Re-render after snapshot load
    const prevLoad = window.loadExternalSnapshot;
    if (typeof prevLoad === "function") {
      window.loadExternalSnapshot = async function () {
        await prevLoad.apply(this, arguments);
        window.renderMap2();
      };
    }

    setTimeout(() => window.renderMap2(), 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
