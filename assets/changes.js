/* What changed since previous snapshot — simple board delta for visitors */
(function () {
  const EXTRA = {
    en: {
      "panel.changes": "What changed",
      "changes.vs": "vs previous board",
      "changes.none": "No material score moves vs the previous snapshot.",
      "changes.loading": "Comparing boards…",
      "changes.noPrev": "Only one snapshot so far — nothing to compare yet.",
      "changes.status": "Status",
      "changes.score": "Score",
      "changes.lead": "Lead",
      "changes.headline": "Since {from} → {to}"
    },
    de: {
      "panel.changes": "Was sich geändert hat",
      "changes.vs": "vs vorheriges Brett",
      "changes.none": "Keine materiellen Score-Bewegungen zum vorherigen Snapshot.",
      "changes.loading": "Bretter werden verglichen…",
      "changes.noPrev": "Erst ein Snapshot — noch kein Vergleich möglich.",
      "changes.status": "Status",
      "changes.score": "Score",
      "changes.lead": "Führung",
      "changes.headline": "Seit {from} → {to}"
    }
  };

  function mergeI18n() {
    if (typeof I18N === "undefined") return;
    Object.keys(EXTRA).forEach(function (lng) {
      Object.assign(I18N[lng], EXTRA[lng]);
    });
  }

  function tt(key) {
    if (typeof t === "function") return t(key);
    return (EXTRA.en && EXTRA.en[key]) || key;
  }

  function playerName(id) {
    if (typeof PLAYERS !== "undefined" && PLAYERS[id]) return PLAYERS[id].name;
    return id;
  }

  function playerHex(id) {
    if (typeof PLAYERS !== "undefined" && PLAYERS[id]) return PLAYERS[id].hex;
    return "#888";
  }

  function leadOf(inf) {
    if (!inf) return null;
    var best = null, bestV = -1;
    Object.keys(inf).forEach(function (k) {
      var v = Number(inf[k]) || 0;
      if (v > bestV) {
        bestV = v;
        best = k;
      }
    });
    return best;
  }

  function computeDelta(prev, curr) {
    var lines = [];
    if (!prev || !curr) return lines;
    var prevMap = {};
    (prev.territories || []).forEach(function (t) {
      prevMap[t.id] = t;
    });
    (curr.territories || []).forEach(function (ct) {
      var pt = prevMap[ct.id];
      if (!pt) {
        lines.push({
          kind: "new",
          territory: ct.name || ct.id,
          text: "+",
          detail: ct.name || ct.id
        });
        return;
      }
      if (pt.status !== ct.status) {
        lines.push({
          kind: "status",
          territory: ct.name || ct.id,
          from: pt.status,
          to: ct.status
        });
      }
      var pInf = pt.influence || {};
      var cInf = ct.influence || {};
      var ids = {};
      Object.keys(pInf).forEach(function (k) {
        ids[k] = true;
      });
      Object.keys(cInf).forEach(function (k) {
        ids[k] = true;
      });
      Object.keys(ids).forEach(function (pid) {
        var a = Number(pInf[pid]) || 0;
        var b = Number(cInf[pid]) || 0;
        var d = Math.round((b - a) * 10) / 10;
        if (Math.abs(d) >= 1) {
          lines.push({
            kind: "score",
            territory: ct.name || ct.id,
            player: pid,
            delta: d
          });
        }
      });
      var pl = leadOf(pInf);
      var cl = leadOf(cInf);
      if (pl && cl && pl !== cl) {
        lines.push({
          kind: "lead",
          territory: ct.name || ct.id,
          from: pl,
          to: cl
        });
      }
    });
    lines.sort(function (a, b) {
      var rank = { lead: 0, status: 1, score: 2, new: 3 };
      return (rank[a.kind] || 9) - (rank[b.kind] || 9);
    });
    return lines;
  }

  function lineHtml(item) {
    if (item.kind === "status") {
      return (
        '<div class="change-row status"><span class="chg-tag">' +
        tt("changes.status") +
        '</span><span class="chg-body"><strong>' +
        item.territory +
        "</strong>: " +
        item.from +
        " → <em>" +
        item.to +
        "</em></span></div>"
      );
    }
    if (item.kind === "lead") {
      return (
        '<div class="change-row lead"><span class="chg-tag">' +
        tt("changes.lead") +
        '</span><span class="chg-body"><strong>' +
        item.territory +
        '</strong>: <span style="color:' +
        playerHex(item.from) +
        '">' +
        playerName(item.from) +
        '</span> → <span style="color:' +
        playerHex(item.to) +
        '">' +
        playerName(item.to) +
        "</span></span></div>"
      );
    }
    if (item.kind === "score") {
      var cls = item.delta > 0 ? "up" : "down";
      var sign = item.delta > 0 ? "+" : "";
      return (
        '<div class="change-row score ' +
        cls +
        '"><span class="chg-tag">' +
        tt("changes.score") +
        '</span><span class="chg-body"><span style="color:' +
        playerHex(item.player) +
        '">' +
        playerName(item.player) +
        "</span> · " +
        item.territory +
        ' <strong class="chg-delta">' +
        sign +
        item.delta +
        "</strong></span></div>"
      );
    }
    return (
      '<div class="change-row"><span class="chg-body">' +
      (item.detail || "") +
      "</span></div>"
    );
  }

  window.renderBoardChanges = function renderBoardChanges(prev, curr, fromId, toId) {
    var box = document.getElementById("changesList");
    var head = document.getElementById("changesHeadline");
    if (!box) return;
    if (head) {
      head.textContent = tt("changes.headline")
        .replace("{from}", fromId || "?")
        .replace("{to}", toId || "?");
    }
    if (!prev) {
      box.innerHTML =
        '<div class="change-empty">' + tt("changes.noPrev") + "</div>";
      return;
    }
    var lines = computeDelta(prev, curr);
    if (!lines.length) {
      box.innerHTML =
        '<div class="change-empty">' + tt("changes.none") + "</div>";
      return;
    }
    box.innerHTML = lines
      .slice(0, 12)
      .map(lineHtml)
      .join("");
  };

  async function bootChanges() {
    mergeI18n();
    if (typeof applyStaticI18n === "function") applyStaticI18n();
    var box = document.getElementById("changesList");
    if (box) box.innerHTML = '<div class="change-empty">' + tt("changes.loading") + "</div>";
    try {
      var idxRes = await fetch("data/history/index.json", { cache: "no-store" });
      if (!idxRes.ok) throw new Error("no index");
      var idx = await idxRes.json();
      var snaps = (idx.snapshots || []).slice().sort(function (a, b) {
        return (a.date || "").localeCompare(b.date || "");
      });
      if (snaps.length < 2) {
        window.renderBoardChanges(null, null, null, idx.current);
        return;
      }
      var currId = idx.current || snaps[snaps.length - 1].id;
      var currIdx = snaps.findIndex(function (s) {
        return s.id === currId;
      });
      if (currIdx < 1) currIdx = snaps.length - 1;
      var prevMeta = snaps[currIdx - 1];
      var currMeta = snaps[currIdx];
      var [prevRes, currRes] = await Promise.all([
        fetch("data/history/" + prevMeta.file, { cache: "no-store" }),
        fetch("data/snapshot.json", { cache: "no-store" })
      ]);
      if (!prevRes.ok || !currRes.ok) throw new Error("load failed");
      var prev = await prevRes.json();
      var curr = await currRes.json();
      window._prevBoard = prev;
      window._currBoard = curr;
      window.renderBoardChanges(prev, curr, prevMeta.date, currMeta.date || currId);
    } catch (e) {
      console.info("changes panel", e);
      if (box)
        box.innerHTML =
          '<div class="change-empty">' + tt("changes.noPrev") + "</div>";
    }
  }

  var _setLang = window.setLang;
  window.setLang = function (l) {
    if (typeof _setLang === "function") _setLang(l);
    if (window._prevBoard && window._currBoard) {
      var idxEl = document.getElementById("changesHeadline");
      /* re-render with same boards */
      var from = (window._prevBoard.meta && window._prevBoard.meta.snapshotDate) || "";
      var to = (window._currBoard.meta && window._currBoard.meta.snapshotDate) || "";
      window.renderBoardChanges(window._prevBoard, window._currBoard, from, to);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(bootChanges, 400);
    });
  } else {
    setTimeout(bootChanges, 400);
  }
})();
