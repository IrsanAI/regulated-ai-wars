/**
 * Shared player palette — single source for Risk Board, World, Human, Doctrine.
 * Keep in sync with data/snapshot.json player.hex when migrating colors deliberately.
 */
(function (root) {
  const PLAYERS_SHARED = {
    google: {
      id: "google",
      name: "Google",
      short: "G",
      hex: "#4285F4",
      role: "Hyperscaler – Industry Solutions",
    },
    microsoft: {
      id: "microsoft",
      name: "Microsoft",
      short: "MS",
      hex: "#F25022",
      role: "Hyperscaler – Copilot Ecosystem",
    },
    anthropic: {
      id: "anthropic",
      name: "Anthropic",
      short: "A",
      hex: "#C15F3C",
      role: "Foundation Lab – Enterprise LLM",
    },
    openai: {
      id: "openai",
      name: "OpenAI",
      short: "OAI",
      hex: "#10A37F",
      role: "Foundation Lab",
    },
    aws: {
      id: "aws",
      name: "AWS",
      short: "AWS",
      hex: "#FF9900",
      role: "Hyperscaler – Bedrock",
    },
    specialist: {
      id: "specialist",
      name: "Vertical Specialists",
      short: "VS",
      hex: "#A855F7",
      role: "Harvey, Healthcare AI etc.",
    },
    ibm: {
      id: "ibm",
      name: "IBM / Governance",
      short: "IBM",
      hex: "#0F62FE",
      role: "Governance-first",
    },
  };

  root.PLAYERS_SHARED = PLAYERS_SHARED;

  /** Merge shared hex/name into runtime PLAYERS if present. */
  root.applySharedPlayers = function applySharedPlayers(target) {
    const t = target || root.PLAYERS;
    if (!t) return;
    Object.keys(PLAYERS_SHARED).forEach((id) => {
      if (!t[id]) t[id] = Object.assign({}, PLAYERS_SHARED[id]);
      else {
        t[id].hex = PLAYERS_SHARED[id].hex;
        t[id].short = PLAYERS_SHARED[id].short;
        t[id].name = PLAYERS_SHARED[id].name;
      }
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
