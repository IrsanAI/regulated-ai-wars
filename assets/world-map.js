/**
 * Phase D — Natural Earth 110m land under geoDominance paint.
 * Requires d3 + topojson-client (CDN). Falls back silently if load fails.
 */
(function () {
  const WIDTH = 1000;
  const HEIGHT = 520;
  const TOPO_URL =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  let landReady = false;
  let landFeatures = null;
  let projection = null;
  let pathGen = null;

  function theaterFromCoords(lon, lat) {
    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) return null;
    if (lat < -60) return null;
    if (lon < -25) return lat > 12 ? "na" : "sa";
    if (lon >= -25 && lon <= 45 && lat >= 34 && lat <= 72) return "eu";
    if (lon >= -20 && lon <= 55 && lat < 37 && lat > -36) return "af";
    if ((lon >= 110 && lon <= 180 && lat < 5 && lat > -50) || lon > 165)
      return "oc";
    if (lon > 25) return "as";
    return "eu";
  }

  function theaterCentroids() {
    return {
      na: [-100, 40],
      sa: [-58, -15],
      eu: [15, 50],
      af: [20, 5],
      as: [90, 35],
      oc: [140, -25],
    };
  }

  async function ensureLand() {
    if (landFeatures) return true;
    if (typeof d3 === "undefined" || typeof topojson === "undefined") {
      console.info("world-map: d3/topojson missing — blob fallback");
      return false;
    }
    try {
      const topo = await d3.json(TOPO_URL);
      const countries = topojson.feature(topo, topo.objects.countries);
      landFeatures = countries.features.filter((f) => {
        const id = String(f.id);
        return id !== "010"; // skip Antarctica if present as 010
      });
      projection = d3.geoEqualEarth().fitExtent(
        [
          [12, 12],
          [WIDTH - 12, HEIGHT - 12],
        ],
        { type: "FeatureCollection", features: landFeatures }
      );
      pathGen = d3.geoPath(projection);
      landReady = true;
      return true;
    } catch (e) {
      console.info("world-map: topo load failed", e);
      return false;
    }
  }

  function hideBlobContinents() {
    ["na", "sa", "eu", "af", "as", "oc"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = "none";
        el.style.pointerEvents = "none";
      }
    });
    document.querySelectorAll(".continent-label").forEach((el) => {
      el.style.display = "none";
    });
  }

  window.renderWorldPremium = async function renderWorldPremium() {
    const svg = document.getElementById("worldSvg");
    const beacons = document.getElementById("beacons");
    if (!svg || !beacons || typeof geoDominance === "undefined") return false;
    const ok = await ensureLand();
    if (!ok) return false;

    hideBlobContinents();

    let landLayer = document.getElementById("landLayer");
    if (!landLayer) {
      landLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      landLayer.setAttribute("id", "landLayer");
      svg.insertBefore(landLayer, beacons);
    }
    landLayer.innerHTML = "";

    landFeatures.forEach((feat) => {
      const [[minLon, minLat], [maxLon, maxLat]] = d3.geoBounds(feat);
      const lon = (minLon + maxLon) / 2;
      const lat = (minLat + maxLat) / 2;
      let theater = theaterFromCoords(lon, lat);
      // Greenland / Arctic edge → NA
      if (lat > 60 && lon < -20) theater = "na";
      if (!theater) return;
      const data = geoDominance[theater];
      if (!data || !PLAYERS[data.dominant]) return;
      const p = PLAYERS[data.dominant];
      const tr = data.trend || "stable";
      const opacity = 0.22 + (data.intensity || 0.4) * 0.55;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathGen(feat));
      path.setAttribute("fill", p.hex);
      path.setAttribute("fill-opacity", String(opacity));
      path.setAttribute("stroke", "rgba(255,255,255,0.14)");
      path.setAttribute("stroke-width", data.intensity >= 0.7 ? "0.9" : "0.45");
      path.setAttribute("class", "land-poly" + (tr === "up" && data.intensity >= 0.7 ? " high-intensity" : "") + (tr === "down" ? " fading" : ""));
      path.style.cursor = "pointer";
      path.addEventListener("click", () => {
        if (typeof showGeoDetail === "function") showGeoDetail(theater);
      });
      path.setAttribute("data-theater", theater);
      landLayer.appendChild(path);
    });

    beacons.innerHTML = "";
    const cents = theaterCentroids();
    Object.entries(geoDominance).forEach(([id, data]) => {
      const p = PLAYERS[data.dominant];
      if (!p) return;
      const ll = cents[id];
      if (!ll) return;
      const xy = projection(ll);
      if (!xy) return;
      const [cx, cy] = xy;
      const tr = data.trend || "stable";
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
        label.textContent = typeof trendGlyph === "function" ? trendGlyph(tr) : tr === "up" ? "▲" : "▼";
        beacons.appendChild(label);
      }
    });

    // Labels
    let labelLayer = document.getElementById("theaterLabels");
    if (!labelLayer) {
      labelLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      labelLayer.setAttribute("id", "theaterLabels");
      svg.appendChild(labelLayer);
    }
    labelLayer.innerHTML = "";
    const names = {
      na: "NORTH AMERICA",
      sa: "SOUTH AMERICA",
      eu: "EUROPE",
      af: "AFRICA",
      as: "ASIA",
      oc: "OCEANIA",
    };
    Object.entries(cents).forEach(([id, ll]) => {
      const xy = projection(ll);
      if (!xy) return;
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", xy[0]);
      t.setAttribute("y", xy[1] - 14);
      t.setAttribute("class", "continent-label");
      t.setAttribute("text-anchor", "middle");
      t.textContent = names[id] || id;
      labelLayer.appendChild(t);
    });

    const stamp = document.getElementById("worldBoardStamp");
    if (stamp) {
      const dateEl = document.getElementById("lastUpdate");
      const ds = (dateEl && dateEl.textContent) || "";
      const cleaned = ds.replace(/^Snapshot:\s*/i, "").trim();
      if (cleaned && cleaned !== "—") stamp.textContent = cleaned;
    }
    const leg = document.getElementById("worldLegend");
    if (leg && typeof PLAYERS !== "undefined") {
      leg.innerHTML = Object.values(PLAYERS)
        .map((p) => `<span><i style="background:${p.hex}"></i>${p.short}</span>`)
        .join("");
    }
    return true;
  };

  // Wrap board-logic / app renderWorld
  function install() {
    const prev =
      typeof window.renderWorld === "function" ? window.renderWorld : null;
    window.renderWorld = async function () {
      const used = await window.renderWorldPremium();
      if (!used && prev) prev();
    };
    setTimeout(() => {
      if (typeof window.renderWorld === "function") window.renderWorld();
    }, 120);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
