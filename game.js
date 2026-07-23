// NEON BOSS SHOOTER V2 — COMPLETE SINGLE-FILE BUILD
// Put this file beside index.html and load it with: <script src="game-v2.js"></script>
(() => {
  "use strict";

  // ============================================================
  // PAGE / CANVAS / STYLE
  // ============================================================
  const oldRoot = document.getElementById("nbs-v2-root");
  if (oldRoot) oldRoot.remove();

  const root = document.createElement("div");
  root.id = "nbs-v2-root";
  root.innerHTML = `
    <canvas id="nbs-v2-canvas"></canvas>
    <div id="nbs-v2-hud"></div>
    <div id="nbs-v2-overlay"></div>
    <div id="nbs-v2-mobile"></div>
  `;
  document.body.innerHTML = "";
  document.body.appendChild(root);

  const style = document.createElement("style");
  style.textContent = `
    *{box-sizing:border-box} html,body,#nbs-v2-root{width:100%;height:100%;margin:0;overflow:hidden;background:#050714}
    body{font-family:Inter,Arial,sans-serif;user-select:none;touch-action:none;overscroll-behavior:none;color:#fff}
    #nbs-v2-canvas{display:block;width:100%;height:100%;background:#050714}
    #nbs-v2-hud{position:fixed;inset:0;pointer-events:none;z-index:10;color:#fff;text-shadow:0 1px 4px #000}
    #nbs-v2-overlay{position:fixed;inset:0;z-index:20;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(2,4,14,.78);backdrop-filter:blur(4px);overflow:auto}
    #nbs-v2-overlay.show{display:flex}
    .nbs-panel{width:min(1040px,96vw);max-height:94vh;overflow:auto;border:1px solid #33477e;border-radius:18px;background:linear-gradient(180deg,rgba(13,18,43,.98),rgba(5,7,20,.98));box-shadow:0 0 42px rgba(74,137,255,.25);padding:22px}
    .nbs-title{margin:0 0 8px;text-align:center;font-size:clamp(30px,6vw,66px);letter-spacing:.05em;text-shadow:0 0 24px #52d8ff}
    .nbs-subtitle{text-align:center;color:#bfd2ff;margin:0 0 22px}
    .nbs-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center}
    .nbs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}
    .nbs-btn{appearance:none;border:1px solid #5b79c9;background:#15214a;color:#fff;border-radius:12px;padding:12px 16px;font-size:16px;font-weight:700;cursor:pointer;transition:.12s transform,.12s background,.12s box-shadow}
    .nbs-btn:hover{transform:translateY(-1px);background:#20336e;box-shadow:0 0 18px rgba(100,180,255,.25)}
    .nbs-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
    .nbs-btn.danger{border-color:#b72f62;background:#4b1630}
    .nbs-btn.good{border-color:#4fe2a1;background:#154938}
    .nbs-card{position:relative;min-height:230px;border:2px solid var(--rarity,#888);border-radius:16px;padding:16px;background:rgba(9,13,31,.96);cursor:pointer;overflow:hidden;box-shadow:0 0 18px color-mix(in srgb,var(--rarity) 28%,transparent)}
    .nbs-card:hover{transform:translateY(-2px)}
    .nbs-card h3{margin:0 0 4px;font-size:21px}.nbs-card .rarity{font-weight:800;color:var(--rarity)}
    .nbs-card .desc{color:#d9e2ff;line-height:1.35}.nbs-card .details{margin-top:12px;color:#9fb4e8;font-size:13px}
    .nbs-card .diamonds{position:absolute;right:12px;top:10px;color:var(--rarity);letter-spacing:2px}
    .nbs-stat{padding:12px;border:1px solid #2e416f;border-radius:12px;background:#0c132b}.nbs-stat b{color:#7dfcff}
    .nbs-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.nbs-tab.active{background:#3150a0}
    .nbs-progress{height:12px;border:1px solid #4b6095;border-radius:99px;background:#0a1025;overflow:hidden}.nbs-progress>i{display:block;height:100%;background:linear-gradient(90deg,#7dfcff,#ab66ff)}
    .nbs-small{font-size:13px;color:#aebfe8}.nbs-center{text-align:center}.nbs-hidden{display:none!important}
    #nbs-v2-mobile{position:fixed;inset:0;z-index:15;pointer-events:none;display:none}
    #nbs-v2-mobile.show{display:block}
    .nbs-stick{position:absolute;left:22px;bottom:28px;width:132px;height:132px;border-radius:50%;border:2px solid rgba(255,255,255,.38);background:rgba(75,105,180,.18);pointer-events:auto;touch-action:none}
    .nbs-knob{position:absolute;left:43px;top:43px;width:46px;height:46px;border-radius:50%;background:rgba(125,252,255,.55);border:2px solid rgba(255,255,255,.7)}
    .nbs-mbtn{position:absolute;width:66px;height:66px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(40,65,135,.55);color:#fff;font-weight:800;pointer-events:auto;touch-action:none}
    .nbs-mbtn.ability{right:26px;bottom:118px}.nbs-mbtn.dash{right:104px;bottom:38px}.nbs-mbtn.pause{right:20px;top:20px;width:52px;height:52px}.nbs-mbtn.map{right:82px;top:20px;width:52px;height:52px}
    @media(max-width:600px){.nbs-panel{padding:14px}.nbs-grid{grid-template-columns:1fr}.nbs-card{min-height:180px}.nbs-btn{padding:11px 13px}}
  `;
  document.head.appendChild(style);

  const canvas = document.getElementById("nbs-v2-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const hud = document.getElementById("nbs-v2-hud");
  const overlay = document.getElementById("nbs-v2-overlay");
  const mobileLayer = document.getElementById("nbs-v2-mobile");

  let DPR = 1;
  function resizeCanvas() {
    DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    canvas.width = Math.floor(innerWidth * DPR);
    canvas.height = Math.floor(innerHeight * DPR);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (game.world) {
      game.world.w = Math.max(1500, innerWidth * 1.7);
      game.world.h = Math.max(950, innerHeight * 1.7);
      clampPlayer();
    }
  }
  addEventListener("resize", resizeCanvas);

  // ============================================================
  // HELPERS
  // ============================================================
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
  const randi = (a, b = 0) => Math.floor(rand(a, b));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const dist2 = (a, b) => { const x = a.x - b.x, y = a.y - b.y; return x * x + y * y; };
  const dist = (a, b) => Math.sqrt(dist2(a, b));
  const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const uid = (() => { let n = 1; return () => n++; })();
  const nowSec = () => performance.now() / 1000;
  const fmt = n => Math.round(n).toLocaleString();
  const deepClone = obj => JSON.parse(JSON.stringify(obj));
  function weighted(items, weightFn) {
    let total = 0;
    for (const item of items) total += Math.max(0, weightFn(item));
    if (total <= 0) return items[0];
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= Math.max(0, weightFn(item));
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }
  function circleHit(a, b, extra = 0) {
    const rr = (a.r || 0) + (b.r || 0) + extra;
    return dist2(a, b) <= rr * rr;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }

  // ============================================================
  // RARITY / BALANCE DATA
  // ============================================================
  const RARITIES = {
    COMMON:    { name: "Common", color: "#a8b0c0", rank: 0, diamonds: 1 },
    UNCOMMON:  { name: "Uncommon", color: "#63df87", rank: 1, diamonds: 2 },
    RARE:      { name: "Rare", color: "#57a5ff", rank: 2, diamonds: 3 },
    EPIC:      { name: "Epic", color: "#a56cff", rank: 3, diamonds: 4 },
    LEGENDARY: { name: "Legendary", color: "#ffbf47", rank: 4, diamonds: 5 },
    MYTHICAL:  { name: "Mythical", color: "#ff4f9a", rank: 5, diamonds: 6 },
    GOD:       { name: "God", color: "#ffffff", rank: 6, diamonds: 7 },
    ASCENDED:  { name: "Ascended", color: "#7dfcff", rank: 7, diamonds: 8 }
  };
  const RARITY_KEYS = ["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY","MYTHICAL","GOD"];
  const BASE_RARITY = [45, 28, 15, 7, 3, 1.5, 0.5];
  function rarityWeights(luck, bossReward = false) {
    const t = clamp((luck - 1) / 2, 0, 1.5);
    const start = BASE_RARITY.slice();
    const end = [30, 27, 21, 11, 6, 4, 1];
    const w = start.map((v, i) => lerp(v, end[i], Math.min(1, t)));
    if (luck > 3) {
      const extra = luck - 3;
      w[0] -= 3 * extra;
      w[2] += 1.25 * extra;
      w[3] += 0.75 * extra;
      w[4] += 0.5 * extra;
      w[5] += 0.375 * extra;
      w[6] += 0.25 * extra;
    }
    if (bossReward) {
      const oldGod = w[6];
      w[6] = oldGod * 2;
      w[0] = Math.max(1, w[0] - oldGod);
    }
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map(v => v * 100 / sum);
  }
  function rollRarity(luck, bossReward = false) {
    const w = rarityWeights(luck, bossReward);
    let r = Math.random() * 100;
    for (let i = 0; i < w.length; i++) {
      r -= w[i];
      if (r <= 0) return RARITY_KEYS[i];
    }
    return "COMMON";
  }
  const rarityPower = { COMMON:1, UNCOMMON:1.35, RARE:1.85, EPIC:2.6, LEGENDARY:3.6, MYTHICAL:5, GOD:7.5, ASCENDED:10 };

  const SAVE_KEY = "neonBossShooterV2_Release_1";
  const SAVE_VERSION = 2;
  const DEFAULT_SAVE = {
    version: SAVE_VERSION,
    coins: 0,
    selectedCharacter: "CORE",
    ownedCharacters: ["CORE"],
    revealedCharacters: ["CORE","BLAZE","VOLT","TANK","GHOST","NOVA"],
    unlockedWeapons: ["PISTOL","SHOTGUN","BURST","MINIGUN","SAWBLADE","PULSE_ORB","SCOUT_DRONE","MINE_LAYER"],
    unlockedBooks: ["POWER","VITALITY","VELOCITY","MAGNET","FORTRESS","HASTE","EXPANSION","PRECISION"],
    chaosUnlocked: false,
    creatorDefeated: false,
    fakeEndingSeen: false,
    trueEndingSeen: false,
    bestNormal: 0,
    bestChaos: 0,
    bestPostCreator: 0,
    totalRuns: 0,
    totalKills: 0,
    totalBosses: 0,
    totalPlaySeconds: 0,
    upgrades: { damage:0, hp:0, speed:0, defense:0, fireRate:0, cooldown:0, pickup:0, xp:0 },
    slots: { weapons:3, books:3 },
    luck: 1,
    achievements: {},
    records: {},
    settings: {
      mobileMode: false,
      damageNumbers: "combined",
      minimapCorner: "top-right",
      minimapExpanded: false,
      screenShake: 0.7,
      particles: 0.8,
      volume: 0.45,
      reducedEffects: false,
      cameraSmoothing: 0.12
    }
  };

  function repairSave(raw) {
    const s = Object.assign(deepClone(DEFAULT_SAVE), raw || {});
    s.version = SAVE_VERSION;
    s.upgrades = Object.assign({}, DEFAULT_SAVE.upgrades, raw?.upgrades || {});
    s.slots = Object.assign({}, DEFAULT_SAVE.slots, raw?.slots || {});
    s.settings = Object.assign({}, DEFAULT_SAVE.settings, raw?.settings || {});
    for (const k of Object.keys(s.upgrades)) s.upgrades[k] = clamp(Number(s.upgrades[k]) || 0, 0, 10);
    s.slots.weapons = clamp(Number(s.slots.weapons) || 3, 3, 5);
    s.slots.books = clamp(Number(s.slots.books) || 3, 3, 5);
    s.luck = clamp(Number(s.luck) || 1, 1, 3);
    s.coins = Math.max(0, Number(s.coins) || 0);
    for (const key of ["ownedCharacters","revealedCharacters","unlockedWeapons","unlockedBooks"]) {
      if (!Array.isArray(s[key])) s[key] = deepClone(DEFAULT_SAVE[key]);
      s[key] = [...new Set(s[key])];
    }
    if (!s.ownedCharacters.includes("CORE")) s.ownedCharacters.unshift("CORE");
    return s;
  }
  let save;
  try { save = repairSave(JSON.parse(localStorage.getItem(SAVE_KEY) || "null")); }
  catch { save = repairSave(null); }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }
    catch (err) { console.warn("Save failed:", err); }
  }

  // ============================================================
  // CONTENT DATA — CHARACTERS / WEAPONS / BOOKS / ENEMIES
  // ============================================================
  const CHARACTERS = {
    CORE:{name:"Core",cost:0,color:"#65b7ff",ring:"#7dfcff",weapon:"PISTOL",hp:115,speed:270,damage:1.0,armor:0,ability:"CORE_HEAL",cooldown:32,passive:"Stabilization: regenerate slowly after avoiding damage.",unlock:"Starter"},
    BLAZE:{name:"Blaze",cost:350,color:"#ff6b3d",ring:"#ffde59",weapon:"FLAMER",hp:100,speed:260,damage:1.12,armor:0,ability:"FIRE_NOVA",cooldown:24,passive:"Accelerant: burns last 25% longer.",unlock:"Buy with coins"},
    VOLT:{name:"Volt",cost:450,color:"#7dfcff",ring:"#ffffff",weapon:"SPARK",hp:92,speed:315,damage:1.0,armor:0,ability:"TIME_SLOW",cooldown:27,passive:"Kinetic Charge: moving improves ability recharge.",unlock:"Buy with coins"},
    TANK:{name:"Tank",cost:600,color:"#6cff7a",ring:"#b6ffca",weapon:"RPG",hp:180,speed:225,damage:1.03,armor:7,ability:"SHIELD",cooldown:28,passive:"Heavy Frame: armor and reduced knockback.",unlock:"Buy with coins"},
    GHOST:{name:"Ghost",cost:800,color:"#b28cff",ring:"#ff5eec",weapon:"BURST",hp:88,speed:350,damage:1.04,armor:0,ability:"GHOST",cooldown:25,passive:"Afterimage: speed boost after a successful dash.",unlock:"Buy with coins"},
    NOVA:{name:"Nova",cost:1000,color:"#ffffff",ring:"#ff5eec",weapon:"RAILGUN",hp:102,speed:255,damage:1.17,armor:1,ability:"OVERCHARGE",cooldown:31,passive:"Heavy Caliber: slow weapons deal 15% more damage.",unlock:"Buy with coins"},
    VOID:{name:"Void",cost:2200,color:"#4a1b83",ring:"#b28cff",weapon:"ORBIT",hp:122,speed:295,damage:1.08,armor:1,ability:"VOID_PUSH",cooldown:27,passive:"Event Horizon: orbitals rotate faster and farther.",unlock:"Defeat wave 50"},
    OVERLORD:{name:"Overlord",cost:4200,color:"#ff2f88",ring:"#ffde59",weapon:"NOVABURST",hp:150,speed:265,damage:1.18,armor:3,ability:"BOSS_RAGE",cooldown:34,passive:"Dominance: +15% damage to elites and bosses.",unlock:"Defeat Worldbreaker"},
    PHANTOM:{name:"Phantom",cost:3800,color:"#dac7ff",ring:"#8d6bff",weapon:"CHAIN_SICKLE",hp:96,speed:375,damage:1.1,armor:0,ability:"PHASE_BLINK",cooldown:23,passive:"Momentum: brief damage boost after dashing.",unlock:"Reach wave 40 with Ghost"},
    TITAN:{name:"Titan",cost:6500,color:"#8cff9f",ring:"#ffffff",weapon:"HEAVY_RPG",hp:230,speed:220,damage:1.08,armor:11,ability:"FORTRESS",cooldown:32,passive:"Unbreakable: reduced hazard damage.",unlock:"Beat Worldbreaker with Tank"},
    ECLIPSE:{name:"Eclipse",cost:7200,color:"#ffde59",ring:"#2b114f",weapon:"SOLAR_LANCE",hp:132,speed:310,damage:1.13,armor:2,ability:"SOLAR_COLLAPSE",cooldown:30,passive:"Duality: alternates damage and haste bonuses.",unlock:"Reach Chaos wave 60"},
    APEX:{name:"Apex",cost:12000,color:"#ffffff",ring:"#ff2f88",weapon:"GENESIS_ARRAY",hp:190,speed:340,damage:1.25,armor:5,ability:"APEX",cooldown:38,passive:"Adaptive Core: small bonus for each weapon family.",unlock:"Beat the Fallen Creator"},
    ENGINEER:{name:"Engineer",cost:1800,color:"#f0a84a",ring:"#7dfcff",weapon:"SCOUT_DRONE",hp:108,speed:270,damage:1.0,armor:2,ability:"DEPLOY",cooldown:27,passive:"Mechanic: drones attack 18% faster.",unlock:"Own 8 weapons"},
    CRYO:{name:"Cryo",cost:2000,color:"#9eeaff",ring:"#ffffff",weapon:"FROST_SHARDS",hp:106,speed:280,damage:1.02,armor:2,ability:"FROST_NOVA",cooldown:28,passive:"Deep Freeze: frost builds 25% faster.",unlock:"Freeze 200 enemies"},
    REAPER:{name:"Reaper",cost:3000,color:"#d43b73",ring:"#ff8db8",weapon:"REAPER_SCYTHE",hp:104,speed:300,damage:1.16,armor:1,ability:"BLOOD_RUSH",cooldown:29,passive:"Execution: +20% damage to enemies below 25% HP.",unlock:"Defeat 1,000 enemies"},
    WARDEN:{name:"Warden",cost:3400,color:"#74e0a3",ring:"#b6ffca",weapon:"BARRIER_DISC",hp:155,speed:245,damage:1.0,armor:6,ability:"WARD",cooldown:30,passive:"Bulwark: shields last 20% longer.",unlock:"Prevent 5,000 damage"},
    GAMBLER:{name:"Gambler",cost:5000,color:"#ffcf66",ring:"#ff5eec",weapon:"GAMBLE_CANNON",hp:100,speed:300,damage:1.05,armor:0,ability:"ROLL_DICE",cooldown:35,passive:"Loaded Odds: +0.25 temporary Luck.",unlock:"Find a God card"},
    REMNANT:{name:"Creator Remnant",cost:20000,color:"#d9f8ff",ring:"#7dfcff",weapon:"CREATOR_SHARD",hp:170,speed:330,damage:1.22,armor:4,ability:"REWRITE",cooldown:40,passive:"Aftercode: one random stat rises each wave.",unlock:"Defeat the Fallen Creator and continue"}
  };

  const W = (name, rarity, behavior, cooldown, damage, extra={}) => Object.assign({name,rarity,behavior,cooldown,damage,maxLevel:5,projectileSpeed:720,count:1,spread:0,r:5,color:RARITIES[rarity].color,target:"nearest",description:""},extra);
  const WEAPONS = {
    PISTOL:W("Pistol","COMMON","manual",0.28,9,{maxLevel:6,description:"Accurate manual sidearm."}),
    SHOTGUN:W("Shotgun","UNCOMMON","manualSpread",0.9,5,{maxLevel:7,count:8,spread:.65,projectileSpeed:620,description:"Close-range pellet blast."}),
    BURST:W("Burst Cannon","UNCOMMON","manualBurst",0.55,7,{maxLevel:7,count:3,spread:.1,description:"Three-shot aimed burst."}),
    MINIGUN:W("Minigun","RARE","auto",0.11,4.2,{maxLevel:8,spread:.12,target:"nearest",description:"Rapid automatic fire."}),
    SPARK:W("Spark","RARE","autoChain",0.48,11,{maxLevel:8,target:"cluster",status:"shock",description:"Lightning that chains between enemies."}),
    RPG:W("RPG","RARE","manualRocket",1.15,32,{maxLevel:8,projectileSpeed:480,r:9,blast:100,description:"Slow explosive rocket."}),
    RAILGUN:W("Railgun","EPIC","manualPierce",1.5,48,{maxLevel:9,projectileSpeed:1250,pierce:5,r:6,description:"Heavy piercing precision shot."}),
    FLAMER:W("Flamer","EPIC","manualFlame",0.075,2.4,{maxLevel:9,projectileSpeed:440,life:.38,spread:.58,status:"burn",description:"Short fire stream that stacks Burn."}),
    NOVABURST:W("Nova Burst","LEGENDARY","manualSpread",0.8,15,{maxLevel:10,count:5,spread:.5,pierce:2,description:"Heavy fan of piercing shots."}),
    SOLAR_LANCE:W("Solar Lance","MYTHICAL","manualBeam",1.2,65,{maxLevel:11,pierce:8,description:"A devastating aimed beam."}),
    JUDGMENT:W("Judgment Engine","GOD","judgment",1.0,75,{maxLevel:12,pierce:8,blast:135,description:"Alternates divine beams and explosive volleys."}),

    FROST_SHARDS:W("Frost Shards","UNCOMMON","auto",0.52,8,{maxLevel:7,count:2,spread:.18,target:"fastest",status:"frost",description:"Automatic freezing shards."}),
    THUNDER_ROD:W("Thunder Rod","EPIC","autoChain",0.9,22,{maxLevel:9,target:"cluster",status:"shock",description:"Strikes the densest enemy group."}),
    TOXIC_BLOOM:W("Toxic Bloom","EPIC","autoZone",1.35,8,{maxLevel:9,target:"highest",status:"poison",zoneRadius:90,zoneLife:3.5,description:"Creates poisonous spore zones."}),
    MIRROR_CANNON:W("Mirror Cannon","LEGENDARY","mirror",1.4,20,{maxLevel:10,description:"Copies a weakened manual attack."}),
    CREATOR_SHARD:W("Creator Shard","MYTHICAL","creator",0.75,28,{maxLevel:11,pierce:3,blast:70,description:"Cycles between beam, burst, and zone attacks."}),

    PULSE_ORB:W("Pulse Orb","COMMON","orbital",0,7,{maxLevel:6,orbitCount:1,orbitRadius:70,orbitSpeed:1.8,description:"A simple damaging orbital."}),
    ORBIT:W("Orbit","EPIC","orbital",0,12,{maxLevel:9,orbitCount:3,orbitRadius:92,orbitSpeed:2.2,description:"Three orbiting projectiles."}),
    BLADE_HALO:W("Blade Halo","EPIC","orbital",0,18,{maxLevel:9,orbitCount:2,orbitRadius:62,orbitSpeed:3.1,status:"bleed",description:"Close rotating blades."}),
    STORM_RING:W("Storm Ring","LEGENDARY","orbitalArc",0,15,{maxLevel:10,orbitCount:4,orbitRadius:105,orbitSpeed:2.4,status:"shock",description:"Orbiting nodes arc lightning outward."}),
    SINGULARITY_CROWN:W("Singularity Crown","GOD","orbital",0,30,{maxLevel:12,orbitCount:6,orbitRadius:120,orbitSpeed:2.8,pull:45,description:"Layered orbitals with gravitational pull."}),

    SCOUT_DRONE:W("Scout Drone","UNCOMMON","drone",0.75,8,{maxLevel:7,droneCount:1,target:"nearest",description:"A following automatic drone."}),
    SENTRY_DRONE:W("Sentry Drone","RARE","drone",1.05,18,{maxLevel:8,droneCount:1,target:"highest",description:"Targets high-HP enemies."}),
    PHOENIX_DRONE:W("Phoenix Drone","LEGENDARY","drone",0.7,14,{maxLevel:10,droneCount:1,status:"burn",description:"A burning drone that reforms."}),
    ECHO_FAMILIAR:W("Echo Familiar","EPIC","droneEcho",1.1,12,{maxLevel:9,droneCount:1,description:"Repeats weakened manual attacks."}),
    GENESIS_ARRAY:W("Genesis Array","GOD","drone",0.42,18,{maxLevel:12,droneCount:3,pierce:1,target:"adaptive",description:"Three adaptive combat drones."}),

    TWIN_DAGGERS:W("Twin Daggers","COMMON","manualMelee",0.32,13,{maxLevel:6,meleeRange:75,arc:1.15,status:"bleed",description:"Fast aimed melee slashes."}),
    BOOMERANG:W("Boomerang","UNCOMMON","manualReturn",0.8,15,{maxLevel:7,projectileSpeed:600,pierce:4,description:"Returns through enemies."}),
    SAWBLADE:W("Sawblade","COMMON","autoBounce",0.75,10,{maxLevel:6,bounces:3,target:"nearest",description:"Bounces between nearby enemies."}),
    CHAIN_SICKLE:W("Chain Sickle","RARE","manualReturn",0.95,25,{maxLevel:8,projectileSpeed:680,pierce:6,status:"bleed",description:"Sweeping returning chain blade."}),
    REAPER_SCYTHE:W("Reaper Scythe","MYTHICAL","manualMelee",1.15,58,{maxLevel:11,meleeRange:145,arc:1.7,status:"bleed",description:"A huge delayed execution slash."}),

    MINE_LAYER:W("Mine Layer","UNCOMMON","trap",1.5,22,{maxLevel:7,blast:90,description:"Drops mines while moving."}),
    CHRONO_MINE:W("Chrono Mine","LEGENDARY","trap",2.0,32,{maxLevel:10,blast:115,status:"slow",description:"Mines create powerful slowing fields."}),
    GRAVITY_WELL:W("Gravity Well","EPIC","autoZone",1.8,10,{maxLevel:9,target:"cluster",zoneRadius:110,zoneLife:3,pull:90,description:"Pulling damage zones."}),
    PRISM_DISC:W("Prism Disc","RARE","autoZone",1.6,13,{maxLevel:8,target:"cluster",zoneRadius:85,zoneLife:3.5,description:"A stationary projectile prism."}),
    BLACK_HOLE:W("Black Hole","MYTHICAL","autoZone",2.4,24,{maxLevel:11,target:"cluster",zoneRadius:145,zoneLife:4.2,pull:160,description:"Large pulling void zone."}),
    THERMAL_BEACON:W("Thermal Beacon","RARE","autoZone",1.35,11,{maxLevel:8,target:"cluster",zoneRadius:95,zoneLife:3,status:"thermal",description:"Alternates fire and frost zones."}),
    HEAVY_RPG:W("Titan Cannon","LEGENDARY","manualRocket",1.45,55,{maxLevel:10,projectileSpeed:430,r:12,blast:145,description:"Massive armored rocket launcher."}),
    BARRIER_DISC:W("Barrier Disc","EPIC","orbital",0,10,{maxLevel:9,orbitCount:2,orbitRadius:88,orbitSpeed:1.65,blocksBullets:true,description:"Orbitals that damage and block bullets."}),
    GAMBLE_CANNON:W("Gamble Cannon","LEGENDARY","gamble",0.75,22,{maxLevel:10,description:"Each shot rolls a different modifier."})
  };

  const BOOKS = {
    POWER:{name:"Power Tome",rarity:"COMMON",max:8,desc:"+6% damage per level.",stat:"damage",amount:.06},
    VITALITY:{name:"Vitality Tome",rarity:"COMMON",max:8,desc:"+8% maximum HP per level.",stat:"hp",amount:.08},
    VELOCITY:{name:"Velocity Tome",rarity:"COMMON",max:7,desc:"+5% movement speed per level.",stat:"speed",amount:.05},
    MAGNET:{name:"Magnet Tome",rarity:"COMMON",max:7,desc:"+18% XP pickup range per level.",stat:"pickup",amount:.18},
    FORTRESS:{name:"Fortress Tome",rarity:"UNCOMMON",max:7,desc:"+3 armor per level.",stat:"armor",amount:3},
    HASTE:{name:"Haste Tome",rarity:"UNCOMMON",max:7,desc:"+5% attack speed per level.",stat:"fireRate",amount:.05},
    EXPANSION:{name:"Expansion Tome",rarity:"UNCOMMON",max:6,desc:"+8% area size per level.",stat:"area",amount:.08},
    PRECISION:{name:"Precision Tome",rarity:"RARE",max:6,desc:"+4% crit chance per level.",stat:"crit",amount:.04},
    CRITICAL:{name:"Critical Tome",rarity:"RARE",max:6,desc:"+18% critical damage per level.",stat:"critDamage",amount:.18},
    PIERCE:{name:"Piercing Tome",rarity:"RARE",max:4,desc:"+1 projectile pierce per level.",stat:"pierce",amount:1},
    ECHO:{name:"Echo Tome",rarity:"EPIC",max:5,desc:"Chance to repeat an attack.",stat:"echo",amount:.06},
    ORBIT:{name:"Orbit Tome",rarity:"EPIC",max:5,desc:"Improves orbital speed and radius.",stat:"orbit",amount:.1},
    COMBUSTION:{name:"Combustion Tome",rarity:"EPIC",max:5,desc:"Burn deals more damage and lasts longer.",stat:"burn",amount:.15},
    CHAIN:{name:"Chain Tome",rarity:"EPIC",max:5,desc:"Lightning gains extra jumps.",stat:"chain",amount:1},
    FROST:{name:"Frost Tome",rarity:"EPIC",max:5,desc:"Frost builds faster.",stat:"frost",amount:.15},
    VENOM:{name:"Venom Tome",rarity:"EPIC",max:5,desc:"Poison stacks and duration improve.",stat:"poison",amount:.15},
    BLOOD:{name:"Blood Tome",rarity:"EPIC",max:5,desc:"Bleed gains damage and stack cap.",stat:"bleed",amount:.15},
    ENGINEER:{name:"Engineer Tome",rarity:"LEGENDARY",max:4,desc:"Drones attack faster and inherit more damage.",stat:"drone",amount:.12},
    WARD:{name:"Ward Tome",rarity:"LEGENDARY",max:4,desc:"Shields are stronger and last longer.",stat:"shield",amount:.12},
    LUCKY:{name:"Lucky Core",rarity:"LEGENDARY",max:1,desc:"+0.5 Luck for this run.",special:"luck"},
    LOADED_DIE:{name:"Loaded Die",rarity:"LEGENDARY",max:1,desc:"Gain one extra reroll.",special:"reroll"},
    VAMPIRE:{name:"Vampire Codex",rarity:"MYTHICAL",max:1,desc:"Heal 1 HP after every 18 kills.",special:"vampire"},
    SECOND_CHANCE:{name:"Second Chance",rarity:"MYTHICAL",max:1,desc:"Revive once with 30% HP.",special:"revive"},
    DIVINITY:{name:"Book of Divinity",rarity:"GOD",max:1,desc:"All weapon levels count as one higher.",special:"divinity"}
  };

  const PASSIVES = {
    DAMAGE:{name:"Overclocked Core",desc:"Increase all damage.",max:8,stat:"damage"},
    HEALTH:{name:"Reinforced Shell",desc:"Increase maximum HP.",max:8,stat:"hp"},
    SPEED:{name:"Neon Step",desc:"Increase movement speed.",max:6,stat:"speed"},
    FIRE_RATE:{name:"Rapid Cycle",desc:"Increase attack speed.",max:7,stat:"fireRate"},
    AREA:{name:"Wide Geometry",desc:"Increase area and projectile size.",max:6,stat:"area"},
    PROJECTILE:{name:"Accelerator",desc:"Increase projectile speed.",max:6,stat:"projectileSpeed"},
    CRIT:{name:"Deadeye",desc:"Increase critical chance.",max:6,stat:"crit"},
    CRIT_DAMAGE:{name:"Execution Code",desc:"Increase critical damage.",max:6,stat:"critDamage"},
    DASH_BLAST:{name:"Dash Blast",desc:"Dashing releases projectiles.",max:1,special:"dashBlast"},
    KILL_EXPLOSION:{name:"Chain Reaction",desc:"Kills can explode.",max:4,special:"killExplosion"},
    MOVING_POWER:{name:"Kinetic Power",desc:"Deal more damage while moving.",max:4,special:"movingPower"},
    LOW_HP:{name:"Last Stand",desc:"Gain power below 35% HP.",max:3,special:"lowHp"},
    RETURNING:{name:"Return Protocol",desc:"Some projectiles reverse once.",max:1,special:"returning"},
    ARMOR_BREAK:{name:"Fracture",desc:"Critical hits apply Armor Break.",max:1,special:"armorBreak"},
    ORBIT_LAUNCH:{name:"Orbital Ejection",desc:"Orbitals periodically launch outward.",max:1,special:"orbitLaunch"},
    SUMMON_LINK:{name:"Neural Link",desc:"Summons inherit more stats.",max:4,special:"summonLink"},
    PICKUP:{name:"Magnetic Field",desc:"Increase pickup range.",max:5,stat:"pickup"},
    XP:{name:"Scholar",desc:"Increase XP gained.",max:5,stat:"xp"},
    ARMOR:{name:"Reactive Armor",desc:"Increase armor.",max:5,stat:"armor"},
    COOLDOWN:{name:"Ability Circuit",desc:"Reduce ability cooldown.",max:5,stat:"cooldown"}
  };

  const EVOLUTIONS = [
    {id:"PISTOL_DEADEYE",weapon:"PISTOL",reqBook:"PRECISION",name:"Deadeye Core",rarity:"UNCOMMON",desc:"Pistol gains pierce and guaranteed empowered shots.",mods:{damage:1.55,cooldown:.82,pierce:2}},
    {id:"PISTOL_BARRAGE",weapon:"PISTOL",reqPassive:"FIRE_RATE",name:"Neon Barrage",rarity:"UNCOMMON",desc:"Pistol fires a tight three-shot spread.",mods:{damage:.8,count:3,spread:.16,cooldown:.8}},
    {id:"SHOTGUN_WORLD",weapon:"SHOTGUN",reqBook:"EXPANSION",name:"World Scatter",rarity:"RARE",desc:"More pellets and a wider damaging cone.",mods:{damage:1.15,count:5,spread:.18}},
    {id:"RPG_CATACLYSM",weapon:"RPG",reqBook:"COMBUSTION",name:"Cataclysm Launcher",rarity:"EPIC",desc:"Huge burning explosions.",mods:{damage:1.45,blast:55,status:"burn"}},
    {id:"RAIL_STORM",weapon:"RAILGUN",reqBook:"CHAIN",name:"Stormpiercer",rarity:"LEGENDARY",desc:"Rail hits arc lightning to nearby enemies.",mods:{damage:1.35,pierce:4,chain:3,status:"shock"}},
    {id:"FLAME_INFERNO",weapon:"FLAMER",reqBook:"COMBUSTION",name:"Inferno Engine",rarity:"LEGENDARY",desc:"Longer range, stronger burn, periodic fire bursts.",mods:{damage:1.45,life:.2,spread:.12,status:"burn"}},
    {id:"FLAME_SOLAR",weapon:"FLAMER",reqBook:"ORBIT",name:"Solar Ring",rarity:"LEGENDARY",desc:"Flame becomes a rotating burning ring.",mods:{overrideBehavior:"orbital",orbitCount:5,orbitRadius:105,orbitSpeed:2.7,damage:2}},
    {id:"SPARK_CRYO",weapon:"SPARK",reqBook:"FROST",name:"Cryo Thunder",rarity:"EPIC",desc:"Chains apply both Shock and Frost.",mods:{damage:1.35,chain:2,status:"shockfrost"}},
    {id:"ORBIT_EVENT",weapon:"ORBIT",reqBook:"EXPANSION",name:"Event Horizon",rarity:"LEGENDARY",desc:"Larger orbit, more nodes, and gravity pull.",mods:{damage:1.6,orbitCount:2,orbitRadius:35,pull:70}},
    {id:"DRONE_FLEET",weapon:"SCOUT_DRONE",reqBook:"ENGINEER",name:"Replication Fleet",rarity:"RARE",desc:"Deploys additional combat drones.",mods:{damage:1.3,droneCount:2,cooldown:.82}},
    {id:"BLACK_COLLAPSE",weapon:"BLACK_HOLE",reqBook:"DIVINITY",name:"Collapsed Reality",rarity:"GOD",desc:"Massive void with escalating damage.",mods:{damage:2.1,zoneRadius:60,zoneLife:2,pull:120}},
    {id:"JUDGMENT_ASCENDED",weapon:"JUDGMENT",reqBook:"DIVINITY",name:"Ascended Final Verdict",rarity:"ASCENDED",desc:"The Judgment Engine reaches its final form.",mods:{damage:2.2,cooldown:.72,pierce:8,blast:80,count:2}}
  ];

  const E = (name, ai, hp, speed, damage, extra={}) => Object.assign({name,ai,hp,speed,damage,r:16,color:"#ff5e5e",unlock:1,shoot:0,bulletSpeed:240,weight:1,xp:5},extra);
  const ENEMY_TYPES = {
    CHASER:E("Chaser","chase",18,80,10,{color:"#ff5e5e",weight:14}),
    STRIKER:E("Striker","circle",14,145,11,{color:"#ffb347",unlock:5,weight:9}),
    JUGGERNAUT:E("Juggernaut","chase",70,48,22,{r:27,color:"#ff7bba",unlock:12,weight:5,xp:12}),
    BLADE_RUNNER:E("Blade Runner","dash",32,86,18,{r:19,color:"#ff914d",unlock:8,weight:6,xp:8}),
    DETONATOR:E("Detonator","explode",24,98,28,{color:"#ff365d",unlock:10,weight:5,xp:8}),
    LEAPER:E("Leaper","leap",28,95,17,{color:"#e7ff57",unlock:18,weight:5,xp:9}),
    BURROWER:E("Burrower","burrow",36,90,18,{color:"#9a6cff",unlock:25,weight:4,xp:10}),
    NEEDLER:E("Needler","shooter",20,60,10,{color:"#7dfcff",unlock:4,shoot:2.2,bulletSpeed:270,weight:9,xp:6}),
    SCATTERER:E("Scatterer","scatter",28,54,8,{color:"#69bfff",unlock:14,shoot:2.6,bulletSpeed:250,weight:6,xp:8}),
    PULSE_GUNNER:E("Pulse Gunner","radial",34,50,10,{color:"#ffde59",unlock:20,shoot:3.1,bulletSpeed:210,weight:5,xp:9}),
    MORTAR:E("Mortar","mortar",42,42,20,{r:21,color:"#ff9f43",unlock:28,shoot:3.4,weight:4,xp:11}),
    SNIPER:E("Sniper Eye","sniper",25,38,30,{color:"#ffffff",unlock:22,shoot:3.7,bulletSpeed:650,weight:4,xp:10}),
    SPIRAL:E("Spiral Caster","spiral",40,44,12,{color:"#7dfcff",unlock:32,shoot:.42,bulletSpeed:225,weight:4,xp:11}),
    RICOCHET:E("Ricochet Unit","ricochet",38,52,13,{color:"#d3a4ff",unlock:38,shoot:2.3,bulletSpeed:300,weight:3,xp:12}),
    MINE_SEEDER:E("Mine Seeder","mine",38,65,17,{color:"#ff6f91",unlock:24,shoot:2.8,weight:4,xp:10}),
    WALL_PROJECTOR:E("Wall Projector","wall",50,42,12,{r:22,color:"#80bfff",unlock:35,shoot:4.2,weight:3,xp:13}),
    GRAVITY_UNIT:E("Gravity Unit","gravity",48,48,13,{r:22,color:"#8b5cff",unlock:40,shoot:4.0,weight:3,xp:13}),
    FROST_CASTER:E("Frost Caster","frost",36,50,10,{color:"#b8f3ff",unlock:26,shoot:2.8,weight:4,xp:10}),
    HAZARD_WEAVER:E("Hazard Weaver","line",46,50,18,{color:"#ff4fa3",unlock:45,shoot:4.4,weight:3,xp:14}),
    ANCHOR:E("Anchor","anchor",90,32,24,{r:29,color:"#8fa3c8",unlock:50,shoot:4.0,weight:2,xp:16}),
    MEDIC:E("Medic","supportHeal",34,58,7,{color:"#63ff9c",unlock:12,shoot:3.0,weight:2,xp:12,support:true}),
    SHIELDER:E("Shielder","supportShield",42,54,8,{color:"#8bd7ff",unlock:18,shoot:3.5,weight:2,xp:12,support:true}),
    AMPLIFIER:E("Amplifier","supportDamage",40,55,9,{color:"#ff8bd6",unlock:24,shoot:3.1,weight:2,xp:13,support:true}),
    HASTE_BEACON:E("Haste Beacon","supportHaste",36,60,8,{color:"#ffe17a",unlock:30,shoot:3.1,weight:2,xp:13,support:true}),
    SUMMONER:E("Summoner","summoner",46,48,9,{color:"#a2ff7a",unlock:22,shoot:4.5,weight:3,xp:14,support:true}),
    CONTROLLER:E("Controller","controller",52,45,11,{color:"#b06cff",unlock:42,shoot:3.8,weight:2,xp:15,support:true}),
    PHASE_HUNTER:E("Phase Hunter","phase",42,125,19,{color:"#d9c2ff",unlock:60,weight:3,xp:15}),
    CREATOR_WISP:E("Creator Wisp","creator",55,105,20,{color:"#e8fcff",unlock:110,shoot:1.8,weight:2,xp:18})
  };

  const ELITE_MODS = {
    ARMORED:{name:"Armored",color:"#a8b0c0",icon:"◆"},
    SHIELDED:{name:"Shielded",color:"#7dfcff",icon:"⬡"},
    EXPLOSIVE:{name:"Explosive",color:"#ff5e3b",icon:"✹"},
    VAMPIRIC:{name:"Vampiric",color:"#ff4f9a",icon:"♥"},
    SPLITTING:{name:"Splitting",color:"#a77dff",icon:"◇"},
    ENRAGED:{name:"Enraged",color:"#ff3030",icon:"!"},
    TELEPORTING:{name:"Teleporting",color:"#c391ff",icon:"↯"},
    HASTE:{name:"Haste Aura",color:"#ffde59",icon:"»"},
    RESISTANT:{name:"Projectile Resistant",color:"#80bfff",icon:"▣"},
    DEATH_PULSE:{name:"Death Pulse",color:"#ff8bd6",icon:"◉"},
    REGENERATING:{name:"Regenerating",color:"#63ff9c",icon:"+"},
    REFLECTIVE:{name:"Reflective",color:"#ffffff",icon:"↩"},
    CORRUPTED:{name:"Corrupted",color:"#c026ff",icon:"✦"},
    GIANT:{name:"Giant",color:"#ff9f43",icon:"⬆"},
    PHANTOM:{name:"Phantom",color:"#dac7ff",icon:"◌"}
  };

  const MINOR_BOSSES = ["CHARGER","BLADE","SOLAR","IRON","CRYSTAL","HIVE","SPIRAL","WHITE_EYE","PULSE_CROWN","SHADOW","GRAVITY_WARDEN","STORM_MACHINE","SENTINEL"];
  const BOSS_NAMES = {
    CHARGER:"Ravager Scout",BLADE:"Blade Tyrant",SOLAR:"Solar Core",IRON:"Iron Titan",CRYSTAL:"Crystal Splitter",HIVE:"Hive Monarch",SPIRAL:"Spiral Engine",WHITE_EYE:"White Eye",PULSE_CROWN:"Pulse Crown",SHADOW:"Shadow Clone",GRAVITY_WARDEN:"Gravity Warden",STORM_MACHINE:"Storm Machine",SENTINEL:"Corrupted Sentinel",RAVAGER:"Ravager: Awakened",WORLDBREAKER:"Worldbreaker Ravager",CREATOR:"The Fallen Creator"
  };

  // ============================================================
  // GAME STATE / INPUT / AUDIO
  // ============================================================
  const game = {
    state:"menu",
    mode:"normal",
    world:{w:Math.max(1500,innerWidth*1.7),h:Math.max(950,innerHeight*1.7)},
    camera:{x:0,y:0,shake:0},
    player:null,
    wave:0,
    runLevel:1,
    xp:0,
    xpNeed:45,
    rerolls:3,
    tempLuck:0,
    weapons:[],
    books:[],
    passives:{},
    abilityEvolved:false,
    startingBonus:null,
    enemies:[],
    projectiles:[],
    zones:[],
    traps:[],
    gems:[],
    particles:[],
    numbers:[],
    landmarks:[],
    batches:[],
    batchIndex:0,
    spawnPending:false,
    rewardQueue:[],
    currentChoices:[],
    choiceContext:null,
    bossRewardPending:false,
    specialBoss:null,
    postCreator:false,
    continuePrompted:false,
    runStartedAt:0,
    waveStartedAt:0,
    pausedFrom:"playing",
    runStats:null,
    banner:{text:"",sub:"",life:0,color:"#7dfcff"},
    lastFrame:0,
    elapsed:0,
    dev:false,
    nextWaveDelay:0,
    supportCounts:{heal:0,shield:0,damage:0,haste:0}
  };

  resizeCanvas();

  const input = {
    keys:Object.create(null),
    mouseX:innerWidth/2,mouseY:innerHeight/2,
    worldMouseX:0,worldMouseY:0,
    firing:false,
    aimAngle:0,
    moveX:0,moveY:0,
    dashPressed:false,
    abilityPressed:false,
    mobileStick:{active:false,id:null,x:0,y:0,dx:0,dy:0},
    mobileAim:{active:false,id:null}
  };

  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { audioCtx = null; }
    }
    if (audioCtx?.state === "suspended") audioCtx.resume().catch(()=>{});
  }
  function sfx(freq=440,dur=.06,type="sine",vol=.03) {
    if (!audioCtx || save.settings.volume <= 0) return;
    try {
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(vol*save.settings.volume,audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);
      o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur);
    } catch {}
  }

  function resetInputs() {
    input.keys=Object.create(null); input.firing=false; input.moveX=0; input.moveY=0;
    input.dashPressed=false; input.abilityPressed=false;
    input.mobileStick.active=false; input.mobileStick.dx=0; input.mobileStick.dy=0;
    input.mobileAim.active=false;
  }

  addEventListener("keydown", e => {
    ensureAudio();
    const k=e.key.toLowerCase(); input.keys[k]=true;
    if ([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k)) e.preventDefault();
    if (e.key === "F1") { e.preventDefault(); openDevConsole(); return; }
    if (game.state === "playing") {
      if (k==="p" || e.key==="Escape") { pauseGame(); return; }
      if (k==="shift" || k==="x") input.dashPressed=true;
      if (k==="f" || k==="1") input.abilityPressed=true;
      if (k==="m") { save.settings.minimapExpanded=!save.settings.minimapExpanded; persist(); }
      if (k===" ") input.firing=true;
    } else if (game.state === "paused" && (k==="p" || e.key==="Escape")) {
      resumeGame();
    } else if (game.state === "choice") {
      if (["1","2","3"].includes(k)) chooseCard(Number(k)-1);
      if (k==="r") rerollChoices();
    }
  });
  addEventListener("keyup", e => { input.keys[e.key.toLowerCase()]=false; if(e.key===" ") input.firing=false; });
  canvas.addEventListener("pointermove", e => {
    input.mouseX=e.clientX; input.mouseY=e.clientY;
    if (e.pointerType !== "touch") updateAimFromScreen(e.clientX,e.clientY);
  });
  canvas.addEventListener("pointerdown", e => {
    ensureAudio();
    if (game.state!=="playing") return;
    if (e.pointerType==="touch") {
      if (save.settings.mobileMode && e.clientX > innerWidth*.38) {
        input.mobileAim.active=true; input.mobileAim.id=e.pointerId; input.firing=true; updateAimFromScreen(e.clientX,e.clientY);
        canvas.setPointerCapture?.(e.pointerId);
      } else if (!save.settings.mobileMode) {
        input.firing=true; updateAimFromScreen(e.clientX,e.clientY);
      }
    } else { input.firing=true; updateAimFromScreen(e.clientX,e.clientY); }
  });
  canvas.addEventListener("pointerup", e => {
    if (e.pointerType!=="touch" || input.mobileAim.id===e.pointerId || !save.settings.mobileMode) {
      input.firing=false; input.mobileAim.active=false;
    }
  });
  canvas.addEventListener("pointercancel",()=>{input.firing=false;input.mobileAim.active=false;});
  canvas.addEventListener("contextmenu",e=>e.preventDefault());
  addEventListener("blur",()=>{ if(game.state==="playing") pauseGame(); resetInputs(); });

  function updateAimFromScreen(x,y) {
    input.mouseX=x;input.mouseY=y;
    if (!game.player) return;
    input.worldMouseX=x+game.camera.x;input.worldMouseY=y+game.camera.y;
    input.aimAngle=Math.atan2(input.worldMouseY-game.player.y,input.worldMouseX-game.player.x);
  }

  // ============================================================
  // HTML UI HELPERS / MENUS
  // ============================================================
  function showOverlay(html) { overlay.innerHTML=html; overlay.classList.add("show"); }
  function hideOverlay() { overlay.classList.remove("show"); overlay.innerHTML=""; }
  function button(text, action, cls="") {
    return `<button type="button" class="nbs-btn ${cls}" data-action="${action}">${escapeHtml(text)}</button>`;
  }
  overlay.addEventListener("click", e => {
    const btn=e.target.closest("[data-action]"); if(!btn) return;
    ensureAudio(); const action=btn.dataset.action;
    if(action.startsWith("choose:")) chooseCard(Number(action.split(":")[1]));
    else if(action.startsWith("char:")) selectCharacter(action.split(":")[1]);
    else if(action.startsWith("buychar:")) buyCharacter(action.split(":")[1]);
    else if(action.startsWith("shopbuy:")) buyShop(action.split(":")[1]);
    else handleAction(action);
  });

  function handleAction(action) {
    const actions={
      "start-normal":()=>startRun("normal"),
      "start-chaos":()=>startRun("chaos"),
      "characters":showCharacters,
      "shop":()=>showShop("stats"),
      "records":showRecords,
      "settings":showSettings,
      "main":showMainMenu,
      "resume":resumeGame,
      "pause":pauseGame,
      "end-run":()=>endRun("ended"),
      "reroll":rerollChoices,
      "mobile-toggle":()=>{save.settings.mobileMode=!save.settings.mobileMode;persist();updateMobileUI();showSettings();},
      "minimap-toggle":()=>{save.settings.minimapExpanded=!save.settings.minimapExpanded;persist();},
      "damage-mode":()=>{const a=["combined","full","important","off"];save.settings.damageNumbers=a[(a.indexOf(save.settings.damageNumbers)+1)%a.length];persist();showSettings();},
      "effects-toggle":()=>{save.settings.reducedEffects=!save.settings.reducedEffects;persist();showSettings();},
      "reset-save":()=>{if(confirm("Reset all Neon Boss Shooter V2 progress?")){localStorage.removeItem(SAVE_KEY);location.reload();}},
      "continue-201":()=>{game.postCreator=true;game.continuePrompted=true;hideOverlay();game.state="playing";game.wave=201;prepareWave();},
      "finish-creator":()=>endRun("true-victory"),
      "finish-worldbreaker":()=>endRun("fake-victory"),
      "continue-101":()=>{hideOverlay();game.state="playing";game.wave=101;prepareWave();}
    };
    if(actions[action]) actions[action]();
    else if(action.startsWith("tab:")) showShop(action.split(":")[1]);
  }

  function showMainMenu() {
    game.state="menu"; resetInputs(); hideOverlay(); updateMobileUI();
    const c=CHARACTERS[save.selectedCharacter]||CHARACTERS.CORE;
    showOverlay(`<div class="nbs-panel">
      <h1 class="nbs-title">NEON BOSS SHOOTER V2</h1>
      <p class="nbs-subtitle">Roguelike endless arena • Wave 100 false ending • Chaos wave 200 true ending</p>
      <div class="nbs-grid" style="margin-bottom:18px">
        <div class="nbs-stat"><b>${escapeHtml(c.name)}</b><br>${escapeHtml(c.passive)}<br><span class="nbs-small">Signature: ${escapeHtml(WEAPONS[c.weapon].name)}</span></div>
        <div class="nbs-stat"><b>${fmt(save.coins)} coins</b><br>Normal best: ${save.bestNormal}<br>Chaos best: ${save.bestChaos}</div>
        <div class="nbs-stat"><b>${save.slots.weapons} weapon / ${save.slots.books} book slots</b><br>Luck: ${save.luck.toFixed(1)}×<br><span class="nbs-small">Chaos: ${save.chaosUnlocked?"Unlocked":"Locked"}</span></div>
      </div>
      <div class="nbs-row">
        ${button("Start Normal","start-normal","good")}
        <button class="nbs-btn ${save.chaosUnlocked?"good":""}" data-action="start-chaos" ${save.chaosUnlocked?"":"disabled"}>Start Chaos</button>
        ${button("Characters","characters")}
        ${button("Permanent Shop","shop")}
        ${button("Records","records")}
        ${button("Settings","settings")}
      </div>
      <p class="nbs-center nbs-small" style="margin-top:18px">WASD/Arrows move • Mouse + Click/Space shoot • Shift/X dash • F/1 ability • P/Esc pause • M minimap</p>
    </div>`);
  }

  function charUnlockedByProgress(id) {
    if (save.ownedCharacters.includes(id)) return true;
    if (["VOID"].includes(id)) return save.fakeEndingSeen || save.bestNormal>=50;
    if (id==="OVERLORD") return save.fakeEndingSeen;
    if (id==="PHANTOM") return (save.records.GHOST_BEST||0)>=40;
    if (id==="TITAN") return !!save.achievements.TANK_WORLD;
    if (id==="ECLIPSE") return save.bestChaos>=60;
    if (id==="APEX") return save.creatorDefeated;
    if (id==="ENGINEER") return save.unlockedWeapons.length>=8;
    if (id==="CRYO") return (save.records.FROZEN||0)>=200;
    if (id==="REAPER") return save.totalKills>=1000;
    if (id==="WARDEN") return (save.records.DAMAGE_PREVENTED||0)>=5000;
    if (id==="GAMBLER") return !!save.achievements.GOD_CARD;
    if (id==="REMNANT") return save.creatorDefeated && save.bestPostCreator>=201;
    return save.revealedCharacters.includes(id);
  }
  function showCharacters() {
    const cards=Object.entries(CHARACTERS).map(([id,c])=>{
      const owned=save.ownedCharacters.includes(id), revealed=charUnlockedByProgress(id);
      return `<div class="nbs-stat"><b style="color:${c.color}">${escapeHtml(c.name)}</b><br>
        <span class="nbs-small">HP ${c.hp} • SPD ${c.speed} • Armor ${c.armor}<br>${escapeHtml(c.passive)}<br>Weapon: ${escapeHtml(WEAPONS[c.weapon].name)}<br>${escapeHtml(c.unlock)}</span><br><br>
        ${owned?button(save.selectedCharacter===id?"Selected":"Select","char:"+id,save.selectedCharacter===id?"good":""):revealed?button(`Buy — ${fmt(c.cost)}`,"buychar:"+id):`<button class="nbs-btn" disabled>Locked</button>`}
      </div>`;
    }).join("");
    showOverlay(`<div class="nbs-panel"><h2 class="nbs-center">Characters</h2><div class="nbs-grid">${cards}</div><div class="nbs-row" style="margin-top:16px">${button("Back","main")}</div></div>`);
  }
  function selectCharacter(id){if(save.ownedCharacters.includes(id)){save.selectedCharacter=id;persist();showCharacters();}}
  function buyCharacter(id){const c=CHARACTERS[id];if(!c||!charUnlockedByProgress(id)||save.coins<c.cost)return;if(!confirm(`Buy ${c.name} for ${c.cost} coins?`))return;save.coins-=c.cost;save.ownedCharacters.push(id);save.selectedCharacter=id;if(!save.unlockedWeapons.includes(c.weapon))save.unlockedWeapons.push(c.weapon);persist();showCharacters();}

  const SHOP_STATS={damage:["Damage",.05],hp:["Maximum HP",.05],speed:["Movement Speed",.045],defense:["Defense",.035],fireRate:["Attack Speed",.04],cooldown:["Ability Cooldown",.03],pickup:["Pickup Range",.05],xp:["XP Gain",.03]};
  const statCosts=[20,40,75,130,225,400,700,1200,2400,5000];
  function showShop(tab="stats") {
    const tabs=["stats","slots","luck","characters","unlocks"];
    let body="";
    if(tab==="stats") body=`<div class="nbs-grid">${Object.entries(SHOP_STATS).map(([id,[name,inc]])=>{const lv=save.upgrades[id],cost=statCosts[lv]||0;return `<div class="nbs-stat"><b>${name}</b><br>Level ${lv}/10 • +${Math.round(lv*inc*100)}%<br><span class="nbs-small">Next: ${lv<10?`+${Math.round((lv+1)*inc*100)}% — ${fmt(cost)} coins`:"MAX"}</span><br><br><button class="nbs-btn" data-action="shopbuy:stat-${id}" ${lv>=10||save.coins<cost?"disabled":""}>Upgrade</button></div>`}).join("")}</div>`;
    if(tab==="slots") body=`<div class="nbs-grid"><div class="nbs-stat"><b>Weapon Slots</b><br>${save.slots.weapons}/5<br><br><button class="nbs-btn" data-action="shopbuy:weapon-slot" ${save.slots.weapons>=5||save.coins<(save.slots.weapons===3?6000:18000)?"disabled":""}>${save.slots.weapons>=5?"MAX":`Buy next — ${fmt(save.slots.weapons===3?6000:18000)}`}</button></div><div class="nbs-stat"><b>Book Slots</b><br>${save.slots.books}/5<br><br><button class="nbs-btn" data-action="shopbuy:book-slot" ${save.slots.books>=5||save.coins<(save.slots.books===3?4500:14000)?"disabled":""}>${save.slots.books>=5?"MAX":`Buy next — ${fmt(save.slots.books===3?4500:14000)}`}</button></div></div>`;
    if(tab==="luck") {const costs={1:1500,1.5:4000,2:10000,2.5:25000},cost=costs[save.luck];body=`<div class="nbs-stat nbs-center"><b>Permanent Luck: ${save.luck.toFixed(1)}×</b><p>Improves the whole rarity distribution. God remains extremely rare.</p><button class="nbs-btn" data-action="shopbuy:luck" ${save.luck>=3||save.coins<cost?"disabled":""}>${save.luck>=3?"MAX":`Upgrade to ${(save.luck+.5).toFixed(1)}× — ${fmt(cost)}`}</button></div>`;}
    if(tab==="characters") body=`<p class="nbs-center">Characters are bought and selected in the Character menu.</p><div class="nbs-row">${button("Open Characters","characters")}</div>`;
    if(tab==="unlocks") body=`<div class="nbs-grid"><div class="nbs-stat"><b>Weapons</b><br>${save.unlockedWeapons.length}/${Object.keys(WEAPONS).length}</div><div class="nbs-stat"><b>Books</b><br>${save.unlockedBooks.length}/${Object.keys(BOOKS).length}</div><div class="nbs-stat"><b>Chaos</b><br>${save.chaosUnlocked?"Unlocked":"Beat wave 100"}</div><div class="nbs-stat"><b>Creator</b><br>${save.creatorDefeated?"Defeated":"Chaos wave 200"}</div></div>`;
    showOverlay(`<div class="nbs-panel"><h2 class="nbs-center">Permanent Shop — ${fmt(save.coins)} coins</h2><div class="nbs-tabs">${tabs.map(t=>`<button class="nbs-btn nbs-tab ${t===tab?"active":""}" data-action="tab:${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join("")}</div>${body}<div class="nbs-row" style="margin-top:16px">${button("Back","main")}</div></div>`);
  }
  function buyShop(key){
    if(key.startsWith("stat-")){const id=key.slice(5),lv=save.upgrades[id],cost=statCosts[lv];if(lv<10&&save.coins>=cost){save.coins-=cost;save.upgrades[id]++;persist();showShop("stats");}}
    if(key==="weapon-slot"){const cost=save.slots.weapons===3?6000:18000;if(save.slots.weapons<5&&save.coins>=cost){save.coins-=cost;save.slots.weapons++;persist();showShop("slots");}}
    if(key==="book-slot"){const cost=save.slots.books===3?4500:14000;if(save.slots.books<5&&save.coins>=cost){save.coins-=cost;save.slots.books++;persist();showShop("slots");}}
    if(key==="luck"){const costs={1:1500,1.5:4000,2:10000,2.5:25000},cost=costs[save.luck];if(save.luck<3&&save.coins>=cost){save.coins-=cost;save.luck+=.5;persist();showShop("luck");}}
  }

  function showSettings(){showOverlay(`<div class="nbs-panel"><h2 class="nbs-center">Settings</h2><div class="nbs-grid"><div class="nbs-stat"><b>Mobile Mode</b><br>${save.settings.mobileMode?"ON":"OFF"}<br><br>${button("Toggle","mobile-toggle")}</div><div class="nbs-stat"><b>Damage Numbers</b><br>${save.settings.damageNumbers}<br><br>${button("Cycle","damage-mode")}</div><div class="nbs-stat"><b>Reduced Effects</b><br>${save.settings.reducedEffects?"ON":"OFF"}<br><br>${button("Toggle","effects-toggle")}</div><div class="nbs-stat"><b>Minimap</b><br>${save.settings.minimapExpanded?"Expanded":"Small"}<br><br>${button("Toggle","minimap-toggle")}</div></div><div class="nbs-row" style="margin-top:16px">${button("Reset Save","reset-save","danger")}${button("Back","main")}</div></div>`);}
  function showRecords(){showOverlay(`<div class="nbs-panel"><h2 class="nbs-center">Records</h2><div class="nbs-grid"><div class="nbs-stat"><b>Normal Best</b><br>${save.bestNormal}</div><div class="nbs-stat"><b>Chaos Best</b><br>${save.bestChaos}</div><div class="nbs-stat"><b>Post-Creator</b><br>${save.bestPostCreator}</div><div class="nbs-stat"><b>Total Runs</b><br>${save.totalRuns}</div><div class="nbs-stat"><b>Total Kills</b><br>${fmt(save.totalKills)}</div><div class="nbs-stat"><b>Total Bosses</b><br>${save.totalBosses}</div></div><div class="nbs-row" style="margin-top:16px">${button("Back","main")}</div></div>`);}

  // ============================================================
  // MOBILE CONTROLS
  // ============================================================
  function updateMobileUI(){
    mobileLayer.classList.toggle("show",!!save.settings.mobileMode && game.state==="playing");
    if(!save.settings.mobileMode){mobileLayer.innerHTML="";return;}
    if(!mobileLayer.innerHTML) mobileLayer.innerHTML=`<div class="nbs-stick"><div class="nbs-knob"></div></div><button class="nbs-mbtn ability">ABILITY</button><button class="nbs-mbtn dash">DASH</button><button class="nbs-mbtn pause">Ⅱ</button><button class="nbs-mbtn map">MAP</button>`;
    const stick=mobileLayer.querySelector(".nbs-stick"), knob=mobileLayer.querySelector(".nbs-knob");
    if(!stick.dataset.ready){
      stick.dataset.ready="1";
      stick.addEventListener("pointerdown",e=>{e.preventDefault();input.mobileStick.active=true;input.mobileStick.id=e.pointerId;stick.setPointerCapture?.(e.pointerId);moveStick(e);});
      stick.addEventListener("pointermove",e=>{if(input.mobileStick.active&&e.pointerId===input.mobileStick.id)moveStick(e);});
      const end=e=>{if(e.pointerId===input.mobileStick.id){input.mobileStick.active=false;input.mobileStick.dx=input.mobileStick.dy=0;knob.style.transform="translate(0,0)";}};
      stick.addEventListener("pointerup",end);stick.addEventListener("pointercancel",end);
      mobileLayer.querySelector(".ability").addEventListener("pointerdown",e=>{e.preventDefault();input.abilityPressed=true;});
      mobileLayer.querySelector(".dash").addEventListener("pointerdown",e=>{e.preventDefault();input.dashPressed=true;});
      mobileLayer.querySelector(".pause").addEventListener("pointerdown",e=>{e.preventDefault();pauseGame();});
      mobileLayer.querySelector(".map").addEventListener("pointerdown",e=>{e.preventDefault();save.settings.minimapExpanded=!save.settings.minimapExpanded;persist();});
    }
    function moveStick(e){const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy)||1,max=r.width*.33;input.mobileStick.dx=clamp(dx/max,-1,1);input.mobileStick.dy=clamp(dy/max,-1,1);if(len>max){dx=dx/len*max;dy=dy/len*max;}knob.style.transform=`translate(${dx}px,${dy}px)`;}
  }

  // ============================================================
  // RUN CREATION / PLAYER STATS
  // ============================================================
  function newRunStats(){return {kills:0,elites:0,bosses:0,damage:0,damageTaken:0,healing:0,prevented:0,weaponDamage:{},highestHit:0,rarities:{},rerollsUsed:0,levels:0,startTime:nowSec(),finalSource:"Unknown",frozen:0};}
  function baseRunStat(name){
    const char=CHARACTERS[save.selectedCharacter]||CHARACTERS.CORE;
    const up=save.upgrades;
    if(name==="damage")return char.damage*(1+up.damage*.05);
    if(name==="hp")return char.hp*(1+up.hp*.05);
    if(name==="speed")return char.speed*(1+up.speed*.045);
    if(name==="armor")return char.armor+up.defense*2.2;
    if(name==="fireRate")return 1+up.fireRate*.04;
    if(name==="cooldown")return Math.max(.65,1-up.cooldown*.03);
    if(name==="pickup")return 115*(1+up.pickup*.05);
    if(name==="xp")return 1+up.xp*.03;
    return 1;
  }
  function createPlayer(){
    const c=CHARACTERS[save.selectedCharacter]||CHARACTERS.CORE;
    const hp=baseRunStat("hp");
    return {id:uid(),x:game.world.w/2,y:game.world.h/2,r:17,color:c.color,ring:c.ring,hp,maxHp:hp,shield:0,maxShield:0,speed:baseRunStat("speed"),damage:baseRunStat("damage"),armor:baseRunStat("armor"),fireRate:baseRunStat("fireRate"),abilityCooldown:c.cooldown*baseRunStat("cooldown"),abilityTimer:0,dashTimer:0,dashCooldown:3.2,dashDuration:.14,dashSpeed:1250,dashX:0,dashY:0,invuln:0,lastDamage:0,regenTimer:0,ghost:0,rage:0,overcharge:0,timeSlow:0,crit:.05,critDamage:1.75,area:1,projectileSpeed:1,pickup:baseRunStat("pickup"),xpGain:baseRunStat("xp"),pierce:0,echo:0,orbit:0,chain:0,burn:0,frost:0,poison:0,bleed:0,drone:0,shieldPower:0,cooldownMult:1,revive:false,revived:false,vampire:false,divinity:false,moving:false,dashBuff:0,phaseBoost:0,abilityReadyFlash:false};
  }
  function startRun(mode){
    if(mode==="chaos"&&!save.chaosUnlocked)return;
    game.mode=mode;game.state="starting";game.wave=1;game.runLevel=1;game.xp=0;game.xpNeed=45;game.rerolls=3;game.tempLuck=(save.selectedCharacter==="GAMBLER"?.25:0);game.weapons=[{id:CHARACTERS[save.selectedCharacter].weapon,level:1,evolution:null,lastShot:-99,alt:false,orbitHits:{}}];game.books=[];game.passives={};game.abilityEvolved=false;game.startingBonus=null;game.enemies=[];game.projectiles=[];game.zones=[];game.traps=[];game.gems=[];game.particles=[];game.numbers=[];game.batches=[];game.batchIndex=0;game.rewardQueue=[];game.bossRewardPending=false;game.specialBoss=null;game.postCreator=false;game.continuePrompted=false;game.player=createPlayer();game.camera.x=clamp(game.player.x-innerWidth/2,0,game.world.w-innerWidth);game.camera.y=clamp(game.player.y-innerHeight/2,0,game.world.h-innerHeight);game.runStartedAt=nowSec();game.runStats=newRunStats();game.dev=false;game.nextWaveDelay=0;generateLandmarks();resetInputs();updateMobileUI();
    const bonuses=startingBonusCards(save.selectedCharacter);openChoiceScreen(bonuses,"starting");
  }
  function startingBonusCards(charId){
    const generic=[
      {kind:"start",id:"STABLE",name:"Stable Reactor",rarity:"COMMON",desc:"+10% maximum HP.",apply:()=>{game.player.maxHp*=1.1;game.player.hp=game.player.maxHp;}},
      {kind:"start",id:"PRECISION",name:"Precision Frame",rarity:"UNCOMMON",desc:"+8% damage and projectile speed.",apply:()=>{game.player.damage*=1.08;game.player.projectileSpeed*=1.08;}},
      {kind:"start",id:"EMERGENCY",name:"Emergency Charge",rarity:"RARE",desc:"Begin each wave with a 12 HP shield.",apply:()=>{game.startingBonus="EMERGENCY";}},
      {kind:"start",id:"SPRINTER",name:"Neon Sprinter",rarity:"UNCOMMON",desc:"+9% movement speed.",apply:()=>{game.player.speed*=1.09;}},
      {kind:"start",id:"SCAVENGER",name:"Core Scavenger",rarity:"RARE",desc:"+20% pickup range and +5% XP.",apply:()=>{game.player.pickup*=1.2;game.player.xpGain*=1.05;}}
    ];
    const special={
      BLAZE:{kind:"start",id:"HOT_START",name:"Hot Start",rarity:"RARE",desc:"Burn damage +18%.",apply:()=>game.player.burn+=.18},
      VOLT:{kind:"start",id:"CAPACITOR",name:"Overcharged Capacitor",rarity:"RARE",desc:"Shock gains one extra chain.",apply:()=>game.player.chain+=1},
      TANK:{kind:"start",id:"PLATING",name:"Titanium Plating",rarity:"RARE",desc:"+5 armor.",apply:()=>game.player.armor+=5},
      GHOST:{kind:"start",id:"PHASE",name:"Phase Battery",rarity:"RARE",desc:"Dash cooldown -15%.",apply:()=>game.player.dashCooldown*=.85},
      NOVA:{kind:"start",id:"CALIBER",name:"Heavy Chamber",rarity:"RARE",desc:"Slow weapons deal +12% damage.",apply:()=>game.player.damage*=1.12},
      VOID:{kind:"start",id:"GRAVITY",name:"Dense Orbit",rarity:"RARE",desc:"Orbit radius and damage +12%.",apply:()=>game.player.orbit+=.12},
      ENGINEER:{kind:"start",id:"DRONE",name:"Twin Protocol",rarity:"RARE",desc:"Drone damage +15%.",apply:()=>game.player.drone+=.15},
      CRYO:{kind:"start",id:"ICE",name:"Cold Start",rarity:"RARE",desc:"Frost buildup +20%.",apply:()=>game.player.frost+=.2},
      REAPER:{kind:"start",id:"BLOOD",name:"Fresh Edge",rarity:"RARE",desc:"Bleed damage +20%.",apply:()=>game.player.bleed+=.2}
    }[charId];
    const pool=generic.slice();if(special)pool.push(special);
    const out=[];while(out.length<3){const c=pick(pool);if(!out.some(x=>x.id===c.id))out.push(c);}return out;
  }
  function prepareWave(){
    if(!game.player)return;
    game.state="playing";hideOverlay();updateMobileUI();
    game.enemies.length=0;game.projectiles.length=0;game.zones=game.zones.filter(z=>z.persistent);game.traps.length=0;game.batches=[];game.batchIndex=0;game.spawnPending=false;game.bossRewardPending=false;game.waveStartedAt=nowSec();game.banner={text:`WAVE ${game.wave}`,sub:game.mode==="chaos"?"CHAOS":"",life:2.2,color:game.mode==="chaos"?"#ff4fdf":"#7dfcff"};
    if(game.startingBonus==="EMERGENCY")game.player.shield=Math.max(game.player.shield,12);
    if(save.selectedCharacter==="REMNANT"){
      const options=["damage","speed","fireRate","area"];const stat=pick(options);game.player[stat]*=1.01;
    }
    buildWaveBatches();spawnNextBatch();
  }
  function clampPlayer(){if(!game.player)return;game.player.x=clamp(game.player.x,game.player.r,game.world.w-game.player.r);game.player.y=clamp(game.player.y,game.player.r,game.world.h-game.player.r);}

  // ============================================================
  // CARD GENERATION / LEVELING / EVOLUTION
  // ============================================================
  function rarityAllowed(candidateRarity, rolled){return RARITIES[candidateRarity].rank<=RARITIES[rolled].rank;}
  function getOwnedWeapon(id){return game.weapons.find(w=>w.id===id);}
  function getOwnedBook(id){return game.books.find(b=>b.id===id);}
  function weaponMaxLevel(w){return WEAPONS[w.id].maxLevel+(game.player.divinity?1:0);}
  function eligibleEvolutions(){return EVOLUTIONS.filter(e=>{const w=getOwnedWeapon(e.weapon);if(!w||w.evolution||w.level<WEAPONS[e.weapon].maxLevel)return false;if(e.reqBook&&!getOwnedBook(e.reqBook))return false;if(e.reqPassive&&!game.passives[e.reqPassive])return false;return true;});}
  function generateCard(bossReward=false,excludedFamilies=new Set()){
    const luck=save.luck+game.tempLuck;
    const rolled=rollRarity(luck,bossReward);
    const candidates=[];
    for(const id of save.unlockedWeapons){const def=WEAPONS[id];if(!def||!rarityAllowed(def.rarity,rolled))continue;const owned=getOwnedWeapon(id);if(owned){if(owned.level<weaponMaxLevel(owned)&&!owned.evolution)candidates.push({kind:"weapon",id,family:"weapon:"+id,rarity:def.rarity,name:def.name,desc:`Upgrade to level ${owned.level+1}/${weaponMaxLevel(owned)}.`});}else if(game.weapons.length<save.slots.weapons)candidates.push({kind:"weapon",id,family:"weapon:"+id,rarity:def.rarity,name:def.name,desc:`Equip: ${def.description}`});}
    for(const id of save.unlockedBooks){const def=BOOKS[id];if(!def||!rarityAllowed(def.rarity,rolled))continue;const owned=getOwnedBook(id);if(owned){if(owned.level<def.max)candidates.push({kind:"book",id,family:"book:"+id,rarity:def.rarity,name:def.name,desc:`Upgrade to level ${owned.level+1}/${def.max}. ${def.desc}`});}else if(game.books.length<save.slots.books)candidates.push({kind:"book",id,family:"book:"+id,rarity:def.rarity,name:def.name,desc:`Equip: ${def.desc}`});}
    const statFamilies=["DAMAGE","HEALTH","SPEED","FIRE_RATE","AREA","PROJECTILE","CRIT","CRIT_DAMAGE","PICKUP","XP","ARMOR","COOLDOWN"];
    for(const id of statFamilies){const p=PASSIVES[id],lv=game.passives[id]||0;if(lv<p.max)candidates.push({kind:"passive",id,family:"passive:"+id,rarity:rolled,name:p.name,desc:p.desc});}
    for(const [id,p] of Object.entries(PASSIVES)){if(statFamilies.includes(id))continue;const lv=game.passives[id]||0;if(lv<p.max&&RARITIES[rolled].rank>=2)candidates.push({kind:"passive",id,family:"passive:"+id,rarity:rolled,name:p.name,desc:p.desc});}
    for(const evo of eligibleEvolutions())if(rarityAllowed(evo.rarity,rolled))candidates.push({kind:"evolution",id:evo.id,family:"evolution:"+evo.weapon,rarity:evo.rarity,name:evo.name,desc:evo.desc});
    if(!game.abilityEvolved&&game.wave>=25&&RARITIES[rolled].rank>=4)candidates.push({kind:"ability",id:"ABILITY_EVOLUTION",family:"ability",rarity:rolled,name:"Ability Evolution",desc:"Transform this character's active ability."});
    const valid=candidates.filter(c=>!excludedFamilies.has(c.family));
    if(!valid.length){const id=pick(statFamilies);const p=PASSIVES[id];return {kind:"passive",id,family:"fallback:"+id,rarity:rolled,name:p.name,desc:p.desc};}
    const exact=valid.filter(c=>c.rarity===rolled);return pick(exact.length?exact:valid);
  }
  function makeThreeChoices(bossReward=false,excludeIds=[]){const out=[],families=new Set(),ids=new Set(excludeIds);let guard=0;while(out.length<3&&guard++<100){const c=generateCard(bossReward,families);if(ids.has(c.id))continue;out.push(c);families.add(c.family);ids.add(c.id);}while(out.length<3){const id=["DAMAGE","HEALTH","SPEED"][out.length];out.push({kind:"passive",id,family:"safe:"+id,rarity:"COMMON",name:PASSIVES[id].name,desc:PASSIVES[id].desc});}return out;}
  function openChoiceScreen(cards,context="level"){
    game.state="choice";game.currentChoices=cards;game.choiceContext=context;resetInputs();updateMobileUI();
    const cardHtml=cards.map((c,i)=>{const r=RARITIES[c.rarity]||RARITIES.COMMON;return `<div class="nbs-card" style="--rarity:${r.color}" data-action="choose:${i}"><div class="diamonds">${"◆".repeat(Math.min(8,r.diamonds))}</div><div class="rarity">${r.name} • ${c.kind.toUpperCase()}</div><h3>${escapeHtml(c.name)}</h3><p class="desc">${escapeHtml(c.desc)}</p><p class="details">Click to choose • Key ${i+1}</p></div>`}).join("");
    const title=context==="starting"?"Choose a Starting Bonus":context==="boss"?"Boss Reward":context==="level"?`LEVEL ${game.runLevel}`:"Choose an Upgrade";
    showOverlay(`<div class="nbs-panel"><h2 class="nbs-center">${title}</h2><p class="nbs-center nbs-small">Luck ${(save.luck+game.tempLuck).toFixed(2)}× • Weapons ${game.weapons.length}/${save.slots.weapons} • Books ${game.books.length}/${save.slots.books}</p><div class="nbs-grid">${cardHtml}</div><div class="nbs-row" style="margin-top:16px"><button class="nbs-btn" data-action="reroll" ${game.rerolls<=0?"disabled":""}>Reroll all (${game.rerolls})</button></div></div>`);
  }
  function rerollChoices(){if(game.state!=="choice"||game.rerolls<=0)return;const old=game.currentChoices.map(c=>c.id);game.rerolls--;game.runStats.rerollsUsed++;const boss=game.choiceContext==="boss";openChoiceScreen(game.choiceContext==="starting"?startingBonusCards(save.selectedCharacter):makeThreeChoices(boss,old),game.choiceContext);}
  function chooseCard(index){if(game.state!=="choice")return;const c=game.currentChoices[index];if(!c)return;sfx(660,.08,"triangle",.05);game.runStats.rarities[c.rarity]=(game.runStats.rarities[c.rarity]||0)+1;if(c.rarity==="GOD"){save.achievements.GOD_CARD=true;persist();}
    if(c.kind==="start")c.apply();
    if(c.kind==="weapon"){const owned=getOwnedWeapon(c.id);if(owned)owned.level=Math.min(weaponMaxLevel(owned),owned.level+1);else game.weapons.push({id:c.id,level:1,evolution:null,lastShot:-99,alt:false,orbitHits:{}});}
    if(c.kind==="book"){const owned=getOwnedBook(c.id);if(owned)owned.level++;else game.books.push({id:c.id,level:1});applyBook(c.id);}
    if(c.kind==="passive"){game.passives[c.id]=(game.passives[c.id]||0)+1;applyPassive(c.id,c.rarity);}
    if(c.kind==="evolution"){const e=EVOLUTIONS.find(x=>x.id===c.id),w=getOwnedWeapon(e.weapon);if(w)w.evolution=e.id;}
    if(c.kind==="ability")game.abilityEvolved=true;
    hideOverlay();
    if(game.choiceContext==="starting"){game.startingBonus=game.startingBonus||c.id;prepareWave();return;}
    if(game.choiceContext==="boss"){game.bossRewardPending=false;game.wave++;prepareWave();return;}
    game.state="playing";updateMobileUI();processRewardQueue();
  }
  function applyBook(id){const b=BOOKS[id];if(!b)return;if(b.special==="luck")game.tempLuck=Math.min(4-save.luck,game.tempLuck+.5);if(b.special==="reroll")game.rerolls++;if(b.special==="vampire")game.player.vampire=true;if(b.special==="revive")game.player.revive=true;if(b.special==="divinity")game.player.divinity=true;recalculateBookStats();}
  function recalculateBookStats(){const p=game.player;if(!p)return;const hpRatio=clamp(p.hp/Math.max(1,p.maxHp),0,1);p.damage=baseRunStat("damage");p.maxHp=baseRunStat("hp");p.hp=Math.min(p.maxHp,p.maxHp*hpRatio);p.speed=baseRunStat("speed");p.armor=baseRunStat("armor");p.fireRate=baseRunStat("fireRate");p.pickup=baseRunStat("pickup");p.xpGain=baseRunStat("xp");p.area=1;p.projectileSpeed=1;p.cooldownMult=1;p.crit=.05;p.critDamage=1.75;p.pierce=0;p.echo=0;p.orbit=0;p.chain=0;p.burn=0;p.frost=0;p.poison=0;p.bleed=0;p.drone=0;p.shieldPower=0;
    const char=CHARACTERS[save.selectedCharacter];if(save.selectedCharacter==="BLAZE")p.burn+=.25;if(save.selectedCharacter==="VOID")p.orbit+=.12;if(save.selectedCharacter==="ENGINEER")p.drone+=.18;if(save.selectedCharacter==="CRYO")p.frost+=.25;
    for(const ob of game.books){const b=BOOKS[ob.id],n=ob.level;if(!b?.stat)continue;const v=b.amount*n;if(b.stat==="damage")p.damage*=1+v;if(b.stat==="hp"){const ratio=p.hp/p.maxHp;p.maxHp=baseRunStat("hp")*(1+v);p.hp=Math.min(p.maxHp,p.maxHp*ratio);}if(b.stat==="speed")p.speed*=1+v;if(b.stat==="pickup")p.pickup*=1+v;if(b.stat==="armor")p.armor+=v;if(b.stat==="fireRate")p.fireRate*=1+v;if(b.stat==="area")p.area*=1+v;if(b.stat==="crit")p.crit+=v;if(b.stat==="critDamage")p.critDamage+=v;if(b.stat==="pierce")p.pierce+=v;if(b.stat==="echo")p.echo+=v;if(b.stat==="orbit")p.orbit+=v;if(b.stat==="chain")p.chain+=v;if(b.stat==="burn")p.burn+=v;if(b.stat==="frost")p.frost+=v;if(b.stat==="poison")p.poison+=v;if(b.stat==="bleed")p.bleed+=v;if(b.stat==="drone")p.drone+=v;if(b.stat==="shield")p.shieldPower+=v;}
    for(const [id,lv] of Object.entries(game.passives))applyPassiveStatOnly(id,lv);
  }
  function applyPassiveStatOnly(id,lv){const p=game.player;if(!p||!lv)return;const per={DAMAGE:.045,HEALTH:.06,SPEED:.04,FIRE_RATE:.045,AREA:.06,PROJECTILE:.07,CRIT:.025,CRIT_DAMAGE:.12,PICKUP:.12,XP:.04,ARMOR:2,COOLDOWN:.045};if(id==="DAMAGE")p.damage*=1+per[id]*lv;if(id==="HEALTH"){const ratio=p.hp/p.maxHp;p.maxHp*=1+per[id]*lv;p.hp=Math.min(p.maxHp,p.maxHp*ratio);}if(id==="SPEED")p.speed*=1+per[id]*lv;if(id==="FIRE_RATE")p.fireRate*=1+per[id]*lv;if(id==="AREA")p.area*=1+per[id]*lv;if(id==="PROJECTILE")p.projectileSpeed*=1+per[id]*lv;if(id==="CRIT")p.crit+=per[id]*lv;if(id==="CRIT_DAMAGE")p.critDamage+=per[id]*lv;if(id==="PICKUP")p.pickup*=1+per[id]*lv;if(id==="XP")p.xpGain*=1+per[id]*lv;if(id==="ARMOR")p.armor+=per[id]*lv;if(id==="COOLDOWN")p.cooldownMult=Math.max(.7,1-per[id]*lv);}
  function applyPassive(id){recalculateBookStats();}
  function gainXp(amount){if(game.state!=="playing")return;game.xp+=amount*game.player.xpGain;while(game.xp>=game.xpNeed){game.xp-=game.xpNeed;game.runLevel++;game.runStats.levels++;game.xpNeed=Math.floor(42+Math.pow(game.runLevel,1.58)*15);game.rewardQueue.push({type:"level"});}processRewardQueue();}
  function processRewardQueue(){if(game.state!=="playing"||!game.rewardQueue.length)return;const r=game.rewardQueue.shift();if(r.type==="level")openChoiceScreen(makeThreeChoices(false),"level");}

  // ============================================================
  // WAVE DIRECTOR / SPAWNING / BOSSES
  // ============================================================
  function waveScale(){
    const w=game.wave;
    const chaos=game.mode==="chaos"?1.55:1;
    const post=game.postCreator?1+Math.max(0,w-200)*.015:1;
    return {hp:(1+w*.095+Math.pow(w,1.18)*.008)*chaos*post,damage:(1+w*.035)*Math.sqrt(chaos)*Math.sqrt(post),speed:Math.min(1.85,(1+w*.0045)*(game.mode==="chaos"?1.12:1)),projectile:Math.min(1.8,(1+w*.0035)*(game.mode==="chaos"?1.1:1))};
  }
  function buildWaveBatches(){
    if(game.wave===50){game.batches=[{boss:"RAVAGER"}];return;}
    if(game.wave===100){game.batches=[{boss:"WORLDBREAKER"}];return;}
    if(game.mode==="chaos"&&game.wave===200){game.batches=[{boss:"CREATOR"}];return;}
    if(game.wave%10===0){
      const boss=MINOR_BOSSES[(Math.floor(game.wave/10)-1)%MINOR_BOSSES.length];
      game.batches=[{boss}];
      if(game.wave%25===0)game.batches.push({boss:MINOR_BOSSES[(Math.floor(game.wave/5)+3)%MINOR_BOSSES.length],small:true});
      return;
    }
    const total=Math.min(42,Math.floor(6+game.wave*.34+(game.mode==="chaos"?5:0)));
    const batchCount=game.wave<12?1:game.wave<40?2:3;
    let remaining=total;
    for(let i=0;i<batchCount;i++){const n=i===batchCount-1?remaining:Math.ceil(remaining/(batchCount-i));remaining-=n;game.batches.push({count:n,eliteHeavy:game.wave%7===0&&i===batchCount-1,formation:game.wave>=18&&Math.random()<.35});}
  }
  function spawnNextBatch(){
    if(game.batchIndex>=game.batches.length)return;
    const batch=game.batches[game.batchIndex++];
    if(batch.boss){spawnBoss(batch.boss,!!batch.small);return;}
    const types=availableEnemyTypes();
    let supports=0;
    for(let i=0;i<batch.count;i++){
      let id=weighted(types,t=>ENEMY_TYPES[t].weight);
      if(ENEMY_TYPES[id].support){if(supports>=Math.max(1,Math.floor(batch.count/10))){id=pick(types.filter(t=>!ENEMY_TYPES[t].support));}else supports++;}
      const eliteChance=game.wave<15?0:Math.min(.32,.035+game.wave*.0015+(game.mode==="chaos"?.08:0)+(batch.eliteHeavy?.12:0));
      spawnEnemy(id,Math.random()<eliteChance,batch.formation?i:0,batch.count);
    }
  }
  function availableEnemyTypes(){const shift=game.mode==="chaos"?25:0;const arr=Object.entries(ENEMY_TYPES).filter(([,d])=>d.unlock<=game.wave+shift).map(([id])=>id);return arr.length?arr:["CHASER"];}
  function distributedSpawn(index=0,total=1){
    const margin=85,side=index%4;
    let x,y;
    if(side===0){x=margin+(game.world.w-margin*2)*(index+1)/(total+1);y=margin;}
    else if(side===1){x=game.world.w-margin;y=margin+(game.world.h-margin*2)*(index+1)/(total+1);}
    else if(side===2){x=margin+(game.world.w-margin*2)*(index+1)/(total+1);y=game.world.h-margin;}
    else{x=margin;y=margin+(game.world.h-margin*2)*(index+1)/(total+1);}
    const minD=260;for(let tries=0;tries<8&&Math.hypot(x-game.player.x,y-game.player.y)<minD;tries++){x=rand(game.world.w-margin,margin);y=rand(game.world.h-margin,margin);}
    return{x,y};
  }
  function spawnEnemy(typeId,elite=false,index=0,total=1){
    const d=ENEMY_TYPES[typeId]||ENEMY_TYPES.CHASER,s=waveScale(),pos=distributedSpawn(index,total);
    const e={id:uid(),typeId,name:d.name,x:pos.x,y:pos.y,r:d.r,hp:d.hp*s.hp,maxHp:d.hp*s.hp,speed:d.speed*s.speed,damage:d.damage*s.damage,color:d.color,ai:d.ai,shootCooldown:d.shoot||0,shootTimer:rand(d.shoot||2,.2),bulletSpeed:d.bulletSpeed*s.projectile,xp:d.xp*(1+game.wave*.012),elite:false,eliteMods:[],boss:false,dead:false,active:true,hitFlash:0,contactTimer:0,stateTimer:rand(2,.2),angle:rand(TAU),dashTimer:0,dashVx:0,dashVy:0,telegraph:0,support:d.support||false,status:{burn:0,burnTime:0,poison:0,poisonTime:0,bleed:0,bleedTime:0,frost:0,shock:0,slow:0,slowTime:0,armorBreak:0},shield:0,summoned:false,formationIndex:index,formationTotal:total,zoneId:null,lastHitBy:Object.create(null)};
    if(elite)makeElite(e);
    game.enemies.push(e);return e;
  }
  function makeElite(e){
    e.elite=true;const count=game.wave<45?1:game.wave<100?2:3;const keys=Object.keys(ELITE_MODS);const blocked=new Set();
    for(let i=0;i<count;i++){let mod;for(let g=0;g<30;g++){const candidate=pick(keys);if(e.eliteMods.includes(candidate))continue;if((candidate==="VAMPIRIC"||candidate==="REGENERATING")&&(e.eliteMods.includes("VAMPIRIC")||e.eliteMods.includes("REGENERATING")))continue;mod=candidate;break;}if(mod)e.eliteMods.push(mod);}
    e.hp*=1.7+count*.28;e.maxHp=e.hp;e.damage*=1.2+count*.1;e.xp*=2.5+count*.4;e.r*=e.eliteMods.includes("GIANT")?1.45:1.12;
    if(e.eliteMods.includes("ARMORED"))e.armor=12+game.wave*.08;
    if(e.eliteMods.includes("SHIELDED"))e.shield=e.maxHp*.35;
    if(e.eliteMods.includes("ENRAGED"))e.speed*=1.25;
    if(e.eliteMods.includes("CORRUPTED")){e.damage*=1.2;e.color="#c026ff";}
  }
  function spawnBoss(type,small=false){
    const s=waveScale(),pos={x:game.world.w/2,y:game.world.h*.22};
    const special=type==="RAVAGER"||type==="WORLDBREAKER"||type==="CREATOR";
    const baseHp=type==="RAVAGER"?3400:type==="WORLDBREAKER"?9000:type==="CREATOR"?18000:650+game.wave*48;
    const e={id:uid(),typeId:"BOSS",bossType:type,name:BOSS_NAMES[type]||"Boss",x:pos.x,y:pos.y,r:special?(type==="CREATOR"?105:90):(small?44:62),hp:baseHp*s.hp*(small?.55:1),maxHp:baseHp*s.hp*(small?.55:1),speed:(special?55:70)*s.speed,damage:(special?32:24)*s.damage,color:type==="CREATOR"?"#e7fcff":type==="WORLDBREAKER"?"#ff2f88":type==="RAVAGER"?"#ff5e3b":"#ff3b93",ai:"boss",shootCooldown:1.4,shootTimer:1.2,bulletSpeed:260*s.projectile,xp:200+game.wave*12,elite:false,eliteMods:[],boss:true,dead:false,active:true,hitFlash:0,contactTimer:0,stateTimer:2.2,angle:0,dashTimer:0,dashVx:0,dashVy:0,telegraph:0,status:{burn:0,burnTime:0,poison:0,poisonTime:0,bleed:0,bleedTime:0,frost:0,shock:0,slow:0,slowTime:0,armorBreak:0},shield:0,phase:1,phaseTimer:0,objective:0,invulnerable:false,smallBoss:small,lastHitBy:Object.create(null)};
    game.enemies.push(e);game.specialBoss=special?e:null;game.banner={text:e.name,sub:special?"SPECIAL ENCOUNTER":"BOSS",life:3,color:e.color};sfx(70,.45,"sawtooth",.1);
  }
  function updateWaveDirector(dt){
    if(game.state!=="playing")return;
    if(game.nextWaveDelay>0){game.nextWaveDelay-=dt;if(game.nextWaveDelay<=0){game.wave++;prepareWave();}return;}
    const alive=game.enemies.some(e=>!e.dead&&e.active);
    if(!alive&&game.batchIndex<game.batches.length){spawnNextBatch();return;}
    if(!alive&&game.batchIndex>=game.batches.length&&!game.bossRewardPending){
      const wasBoss=game.wave%10===0||[50,100,200].includes(game.wave);
      if(wasBoss){game.bossRewardPending=true;openChoiceScreen(makeThreeChoices(true),"boss");}
      else{game.nextWaveDelay=.8;}
    }
  }

  // ============================================================
  // WEAPON FIRING / PROJECTILES / ORBITALS / DRONES
  // ============================================================
  function effectiveWeapon(w){
    const base=Object.assign({},WEAPONS[w.id]);
    base.level=w.level;
    const scale=1+(w.level-1)*(.14+RARITIES[base.rarity].rank*.012);
    base.damage*=scale;base.cooldown/=1+(w.level-1)*.035;
    if(w.evolution){const e=EVOLUTIONS.find(x=>x.id===w.evolution);if(e){base.name=e.name;for(const [k,v] of Object.entries(e.mods)){if(k==="damage"||k==="cooldown")base[k]*=v;else if(typeof v==="number"&&typeof base[k]==="number")base[k]+=v;else base[k]=v;}if(base.overrideBehavior)base.behavior=base.overrideBehavior;}}
    return base;
  }
  function totalDamageMultiplier(enemy=null){let m=game.player.damage;if(game.player.rage>0)m*=1.45;if(game.player.overcharge>0)m*=1.55;if(game.player.moving&&game.passives.MOVING_POWER)m*=1+game.passives.MOVING_POWER*.06;if(game.player.hp/game.player.maxHp<.35&&game.passives.LOW_HP)m*=1+game.passives.LOW_HP*.12;if(game.player.dashBuff>0)m*=1.18;if(enemy?.elite||enemy?.boss){if(save.selectedCharacter==="OVERLORD")m*=1.15;}if(enemy&&save.selectedCharacter==="REAPER"&&enemy.hp/enemy.maxHp<.25)m*=1.2;return m;}
  function critRoll(rapid=false){const chance=game.player.crit*(rapid?.45:1);return Math.random()<chance;}
  function fireWeapons(dt,time){
    if(game.state!=="playing")return;
    for(const w of game.weapons){if(w.disabled>0)continue;const d=effectiveWeapon(w);if(["orbital","orbitalArc","drone","droneEcho"].includes(d.behavior))continue;const manual=d.behavior.startsWith("manual")||["judgment","gamble"].includes(d.behavior);if(manual&&!input.firing)continue;const cd=Math.max(.045,d.cooldown/(game.player.fireRate*(1+(game.player.overcharge>0?.2:0))));if(time-w.lastShot<cd)continue;w.lastShot=time;fireWeapon(w,d);if(Math.random()<game.player.echo)fireWeapon(w,d,.12);}
    updateOrbitals(dt,time);updateDrones(dt,time);
  }
  function targetEnemy(rule="nearest",origin=game.player){const alive=game.enemies.filter(e=>!e.dead&&e.active&&!e.invulnerable);if(!alive.length)return null;if(rule==="highest")return alive.reduce((a,b)=>b.hp>a.hp?b:a);if(rule==="fastest")return alive.reduce((a,b)=>b.speed>a.speed?b:a);if(rule==="cluster")return alive.reduce((best,e)=>{const n=alive.filter(o=>dist2(e,o)<160*160).length;return n>(best.n||-1)?{e,n}:best},{e:alive[0],n:-1}).e;if(rule==="adaptive")return game.wave%2?targetEnemy("highest",origin):targetEnemy("cluster",origin);return alive.reduce((a,b)=>dist2(origin,b)<dist2(origin,a)?b:a);}
  function fireWeapon(w,d,delay=0){
    const p=game.player;let angle=input.aimAngle,target=null;
    if(!d.behavior.startsWith("manual")&&!['judgment','gamble','mirror','creator'].includes(d.behavior)){target=targetEnemy(d.target,p);if(!target)return;angle=angleTo(p,target);}
    const shoot=()=>{
      if(game.state!=="playing")return;
      if(d.behavior==="manualSpread"||d.behavior==="manualBurst"){const n=d.count||3;for(let i=0;i<n;i++)spawnPlayerBullet(p.x,p.y,angle+(i-(n-1)/2)*(d.spread/(Math.max(1,n-1))),d,w);}
      else if(d.behavior==="manualRocket")spawnPlayerBullet(p.x,p.y,angle,d,w,{explosive:true,blast:d.blast||95});
      else if(d.behavior==="manualPierce")spawnPlayerBullet(p.x,p.y,angle,d,w,{pierce:(d.pierce||3)+game.player.pierce});
      else if(d.behavior==="manualFlame")spawnPlayerBullet(p.x,p.y,angle+rand(d.spread,-d.spread),d,w,{life:d.life||.4,status:d.status});
      else if(d.behavior==="manualBeam")beamAttack(p.x,p.y,angle,d,w);
      else if(d.behavior==="manualMelee")meleeAttack(angle,d,w);
      else if(d.behavior==="manualReturn")spawnPlayerBullet(p.x,p.y,angle,d,w,{pierce:(d.pierce||3)+game.player.pierce,returning:true});
      else if(d.behavior==="auto")spawnPlayerBullet(p.x,p.y,angle,d,w,{status:d.status});
      else if(d.behavior==="autoChain")chainAttack(target||targetEnemy(d.target,p),d,w);
      else if(d.behavior==="autoBounce")bounceAttack(target||targetEnemy("nearest",p),d,w);
      else if(d.behavior==="autoZone")createPlayerZone((target||targetEnemy(d.target,p))?.x||p.x,(target||targetEnemy(d.target,p))?.y||p.y,d,w);
      else if(d.behavior==="trap")placeTrap(d,w);
      else if(d.behavior==="mirror")mirrorAttack(d,w);
      else if(d.behavior==="creator")creatorWeaponAttack(d,w);
      else if(d.behavior==="judgment")judgmentAttack(d,w);
      else if(d.behavior==="gamble")gambleAttack(d,w);
      else spawnPlayerBullet(p.x,p.y,angle,d,w);
      sfx(WEAPONS[w.id].rarity==="GOD"?900:420,.035,"square",.018);
    };
    if(delay)setTimeout(shoot,delay*1000);else shoot();
  }
  function spawnPlayerBullet(x,y,angle,d,w,extra={}){
    const speed=(d.projectileSpeed||720)*game.player.projectileSpeed;
    const crit=critRoll(d.cooldown<.16),damage=d.damage*totalDamageMultiplier()* (crit?game.player.critDamage:1);
    const b=Object.assign({id:uid(),x:x+Math.cos(angle)*24,y:y+Math.sin(angle)*24,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:(d.r||5)*game.player.area,damage,color:d.color||RARITIES[d.rarity].color,life:d.life||2.2,enemy:false,pierce:(d.pierce||0)+game.player.pierce,explosive:false,blast:0,status:d.status||null,weaponId:w.id,crit,hitIds:new Set(),returning:false,returned:false,bounces:d.bounces||0},extra);
    game.projectiles.push(b);return b;
  }
  function beamAttack(x,y,angle,d,w){const max=1500,ex=x+Math.cos(angle)*max,ey=y+Math.sin(angle)*max;game.zones.push({id:uid(),type:"beamFx",x,y,ex,ey,life:.12,color:d.color,width:10*game.player.area});for(const e of game.enemies){if(e.dead||e.invulnerable)continue;const dx=e.x-x,dy=e.y-y,t=clamp((dx*Math.cos(angle)+dy*Math.sin(angle))/max,0,1),px=x+Math.cos(angle)*max*t,py=y+Math.sin(angle)*max*t;if(Math.hypot(e.x-px,e.y-py)<e.r+12*game.player.area)dealDamage(e,d.damage*totalDamageMultiplier(e),w.id,critRoll(false),d.status);}}
  function meleeAttack(angle,d,w){const range=(d.meleeRange||80)*game.player.area,arc=d.arc||1.2;game.zones.push({id:uid(),type:"slashFx",x:game.player.x,y:game.player.y,angle,range,arc,life:.18,color:d.color});for(const e of game.enemies){if(e.dead||e.invulnerable)continue;const a=angleTo(game.player,e),diff=Math.atan2(Math.sin(a-angle),Math.cos(a-angle));if(Math.abs(diff)<=arc/2&&dist(game.player,e)<=range+e.r)dealDamage(e,d.damage*totalDamageMultiplier(e),w.id,critRoll(false),d.status);}}
  function chainAttack(start,d,w){if(!start)return;const hit=[],max=2+Math.floor(game.player.chain)+(w.level>5?1:0);let current=start;for(let i=0;i<max&&current;i++){hit.push(current);dealDamage(current,d.damage*totalDamageMultiplier(current)*Math.pow(.82,i),w.id,critRoll(true),d.status);const next=game.enemies.filter(e=>!e.dead&&!hit.includes(e)&&dist2(e,current)<220*220).sort((a,b)=>dist2(a,current)-dist2(b,current))[0];if(next)game.zones.push({id:uid(),type:"lineFx",x:current.x,y:current.y,ex:next.x,ey:next.y,life:.12,color:d.color,width:3});current=next;}}
  function bounceAttack(start,d,w){if(!start)return;const hit=[];let current=start;for(let i=0;i<(d.bounces||3)+1&&current;i++){hit.push(current);dealDamage(current,d.damage*totalDamageMultiplier(current)*Math.pow(.88,i),w.id,critRoll(true),d.status);const next=game.enemies.filter(e=>!e.dead&&!hit.includes(e)&&dist2(e,current)<240*240).sort((a,b)=>dist2(a,current)-dist2(b,current))[0];current=next;}}
  function createPlayerZone(x,y,d,w){game.zones.push({id:uid(),type:"playerZone",x,y,r:(d.zoneRadius||90)*game.player.area,life:d.zoneLife||3,tick:0,damage:d.damage*totalDamageMultiplier(),status:d.status,weaponId:w.id,color:d.color,pull:d.pull||0});}
  function placeTrap(d,w){game.traps.push({id:uid(),x:game.player.x,y:game.player.y,r:13,life:16,armed:.35,damage:d.damage*totalDamageMultiplier(),blast:(d.blast||90)*game.player.area,status:d.status,weaponId:w.id,color:d.color});}
  function mirrorAttack(d,w){const manual=game.weapons.find(x=>x.id!==w.id&&effectiveWeapon(x).behavior.startsWith("manual"));if(manual){const md=effectiveWeapon(manual);const copy=Object.assign({},md,{damage:md.damage*.55,cooldown:d.cooldown});fireWeapon(w,copy);}else spawnPlayerBullet(game.player.x,game.player.y,input.aimAngle,d,w);}
  function creatorWeaponAttack(d,w){const mode=Math.floor(game.elapsed/4)%3;if(mode===0)beamAttack(game.player.x,game.player.y,input.aimAngle,d,w);else if(mode===1){for(let i=-2;i<=2;i++)spawnPlayerBullet(game.player.x,game.player.y,input.aimAngle+i*.16,d,w,{pierce:3});}else{const t=targetEnemy("cluster");if(t)createPlayerZone(t.x,t.y,d,w);}}
  function judgmentAttack(d,w){w.alt=!w.alt;if(w.alt)beamAttack(game.player.x,game.player.y,input.aimAngle,d,w);else for(let i=-2;i<=2;i++)spawnPlayerBullet(game.player.x,game.player.y,input.aimAngle+i*.19,d,w,{explosive:true,blast:d.blast});}
  function gambleAttack(d,w){const r=Math.random();const mod=Object.assign({},d);if(r<.2){mod.damage*=2.5;beamAttack(game.player.x,game.player.y,input.aimAngle,mod,w);}else if(r<.4){for(let i=0;i<8;i++)spawnPlayerBullet(game.player.x,game.player.y,i*TAU/8,mod,w);}else if(r<.6){const t=targetEnemy("cluster");if(t)createPlayerZone(t.x,t.y,Object.assign(mod,{zoneRadius:110,zoneLife:2.5}),w);}else if(r<.8){for(let i=-3;i<=3;i++)spawnPlayerBullet(game.player.x,game.player.y,input.aimAngle+i*.14,mod,w,{pierce:2});}else{game.player.shield+=18*(1+game.player.shieldPower);}}
  function updateOrbitals(dt,time){
    for(const w of game.weapons){if(w.disabled>0)continue;const d=effectiveWeapon(w);if(!["orbital","orbitalArc"].includes(d.behavior))continue;const count=(d.orbitCount||1)+Math.floor(w.level/4),radius=(d.orbitRadius||70)*(1+game.player.orbit),speed=(d.orbitSpeed||2)*(1+game.player.orbit*.4);for(let i=0;i<count;i++){const a=time*speed+i*TAU/count,ox=game.player.x+Math.cos(a)*radius,oy=game.player.y+Math.sin(a)*radius;for(const e of game.enemies){if(e.dead||e.invulnerable)continue;const key=e.id+":"+i,last=w.orbitHits[key]||0;if(Math.hypot(e.x-ox,e.y-oy)<e.r+10*game.player.area&&time-last>.28){w.orbitHits[key]=time;dealDamage(e,d.damage*totalDamageMultiplier(e)*.42,w.id,critRoll(true),d.status);if(d.pull&&!e.boss){const an=angleTo(e,game.player);e.x+=Math.cos(an)*d.pull*dt;e.y+=Math.sin(an)*d.pull*dt;}}}if(d.behavior==="orbitalArc"&&Math.floor(time*2+i)%8===0){const t=targetEnemy("nearest",{x:ox,y:oy});if(t&&dist2(t,{x:ox,y:oy})<260*260)dealDamage(t,d.damage*.25*totalDamageMultiplier(t),w.id,false,"shock");}}}
  }
  function updateDrones(dt,time){
    for(const w of game.weapons){if(w.disabled>0)continue;const d=effectiveWeapon(w);if(!["drone","droneEcho"].includes(d.behavior))continue;const count=(d.droneCount||1)+Math.floor(w.level/5);if(!w.droneTimers)w.droneTimers=[];for(let i=0;i<count;i++){const a=time*.75+i*TAU/count,dx=game.player.x+Math.cos(a)*(52+i*7),dy=game.player.y+Math.sin(a)*(52+i*7);const last=w.droneTimers[i]||-99,cd=Math.max(.12,d.cooldown/(game.player.fireRate*(1+game.player.drone)));if(time-last>=cd){const t=targetEnemy(d.target,{x:dx,y:dy});if(t){w.droneTimers[i]=time;const an=Math.atan2(t.y-dy,t.x-dx);spawnPlayerBullet(dx,dy,an,d,w,{damage:d.damage*totalDamageMultiplier(t)*(1+game.player.drone)});}}}}
  }

  // ============================================================
  // PLAYER / ABILITY / DAMAGE
  // ============================================================
  function pauseGame(){if(game.state!=="playing")return;game.pausedFrom=game.state;game.state="paused";resetInputs();updateMobileUI();showOverlay(`<div class="nbs-panel nbs-center"><h2>Paused</h2><div class="nbs-row">${button("Resume","resume","good")}${button("End Run","end-run","danger")}</div></div>`);}
  function resumeGame(){if(game.state!=="paused")return;hideOverlay();game.state="playing";resetInputs();updateMobileUI();game.lastFrame=performance.now();}
  function updatePlayer(dt){
    const p=game.player;if(!p)return;
    let mx=0,my=0;if(input.keys.w||input.keys.arrowup)my--;if(input.keys.s||input.keys.arrowdown)my++;if(input.keys.a||input.keys.arrowleft)mx--;if(input.keys.d||input.keys.arrowright)mx++;mx+=input.mobileStick.dx;my+=input.mobileStick.dy;let len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len;}p.moving=len>.08;
    p.invuln=Math.max(0,p.invuln-dt);p.ghost=Math.max(0,p.ghost-dt);p.rage=Math.max(0,p.rage-dt);p.overcharge=Math.max(0,p.overcharge-dt);p.timeSlow=Math.max(0,p.timeSlow-dt);p.dashBuff=Math.max(0,p.dashBuff-dt);p.phaseBoost=Math.max(0,p.phaseBoost-dt);p.abilityTimer=Math.max(0,p.abilityTimer-dt);p.dashTimer=Math.max(0,p.dashTimer-dt);
    if(save.selectedCharacter==="VOLT"&&p.moving)p.abilityTimer=Math.max(0,p.abilityTimer-dt*.18);
    if(save.selectedCharacter==="ECLIPSE"){const phase=Math.floor(game.elapsed/6)%2;if(phase===0)p.damagePhase=1.08;else p.damagePhase=1;}
    if(input.dashPressed){input.dashPressed=false;if(p.dashTimer<=0){p.dashTimer=p.dashCooldown;p.invuln=Math.max(p.invuln,.25);const a=len>.08?Math.atan2(my,mx):input.aimAngle;p.dashX=Math.cos(a);p.dashY=Math.sin(a);p.dashing=p.dashDuration;p.dashBuff=1.3;if(save.selectedCharacter==="GHOST")p.phaseBoost=1.1;if(game.passives.DASH_BLAST){for(let i=0;i<8;i++)game.projectiles.push({id:uid(),x:p.x,y:p.y,vx:Math.cos(i*TAU/8)*650,vy:Math.sin(i*TAU/8)*650,r:4,damage:8*game.passives.DASH_BLAST*totalDamageMultiplier(),color:"#7dfcff",life:1,enemy:false,pierce:1,hitIds:new Set(),weaponId:"DASH"});}sfx(180,.08,"triangle",.06);}}
    if(p.dashing>0){p.x+=p.dashX*p.dashSpeed*dt;p.y+=p.dashY*p.dashSpeed*dt;p.dashing-=dt;}else{const speed=p.speed*(p.phaseBoost>0?1.15:1);p.x+=mx*speed*dt;p.y+=my*speed*dt;}
    clampPlayer();
    if(input.abilityPressed){input.abilityPressed=false;useAbility();}
    if(save.selectedCharacter==="CORE"){if(game.elapsed-p.lastDamage>6&&p.hp<p.maxHp){p.regenTimer+=dt;if(p.regenTimer>=2){p.regenTimer=0;healPlayer(1);}}else p.regenTimer=0;}
    updateAimFromScreen(input.mouseX,input.mouseY);
  }
  function useAbility(){
    const p=game.player;if(!p||p.abilityTimer>0)return;const c=CHARACTERS[save.selectedCharacter];p.abilityTimer=p.abilityCooldown*p.cooldownMult;const evo=game.abilityEvolved;sfx(880,.12,"triangle",.06);
    switch(c.ability){
      case"CORE_HEAL":healPlayer(evo?28:14);if(evo)p.invuln=.6;break;
      case"FIRE_NOVA":abilityBlast(evo?230:165,evo?70:38,"burn");if(evo)game.zones.push({id:uid(),type:"playerZone",x:p.x,y:p.y,r:180,life:5,tick:0,damage:12*totalDamageMultiplier(),status:"burn",weaponId:"ABILITY",color:"#ff5e3b"});break;
      case"TIME_SLOW":p.timeSlow=evo?6:4.2;break;
      case"SHIELD":p.shield+= (evo?75:48)*(1+p.shieldPower);break;
      case"GHOST":p.ghost=evo?3.5:2.5;p.invuln=p.ghost;if(evo)abilityBlast(130,35,"void");break;
      case"OVERCHARGE":p.overcharge=evo?7:5;break;
      case"VOID_PUSH":abilityBlast(evo?260:210,evo?65:40,"void",true);break;
      case"BOSS_RAGE":p.rage=evo?8:6;p.shield+= (evo?50:30)*(1+p.shieldPower);break;
      case"PHASE_BLINK":{const a=input.aimAngle;p.x+=Math.cos(a)*(evo?330:240);p.y+=Math.sin(a)*(evo?330:240);clampPlayer();p.invuln=1;if(evo)for(let i=0;i<3;i++)setTimeout(()=>game.state==="playing"&&abilityBlast(120,28,"void"),i*120);break;}
      case"FORTRESS":p.shield+=(evo?110:75)*(1+p.shieldPower);abilityBlast(evo?260:210,evo?55:32,"force",true);break;
      case"SOLAR_COLLAPSE":abilityBlast(evo?330:260,evo?110:70,"burn");break;
      case"APEX":p.shield+=70*(1+p.shieldPower);p.rage=evo?8:5;p.overcharge=evo?8:5;abilityBlast(evo?420:330,evo?160:100,"shock");break;
      case"DEPLOY":{const w=getOwnedWeapon("SCOUT_DRONE");if(w)w.level=Math.min(weaponMaxLevel(w),w.level+1);else if(game.weapons.length<save.slots.weapons)game.weapons.push({id:"SCOUT_DRONE",level:1,evolution:null,lastShot:-99,orbitHits:{}});if(evo)p.drone+=.3;break;}
      case"FROST_NOVA":abilityBlast(evo?260:200,evo?55:30,"frost");break;
      case"BLOOD_RUSH":p.rage=evo?8:5;healPlayer(evo?18:8);break;
      case"WARD":p.shield+=(evo?90:60)*(1+p.shieldPower);game.zones.push({id:uid(),type:"ward",x:p.x,y:p.y,r:evo?170:130,life:evo?7:5,color:"#74e0a3"});break;
      case"ROLL_DICE":{const r=Math.random();if(r<.25)p.rage=7;else if(r<.5)p.shield+=60;else if(r<.75)healPlayer(30);else game.tempLuck=Math.min(4-save.luck,game.tempLuck+.25);break;}
      case"REWRITE":p.invuln=evo?3:2;p.overcharge=evo?9:6;game.projectiles=game.projectiles.filter(b=>!b.enemy);break;
    }
    game.banner={text:evo?"EVOLVED ABILITY":"ABILITY",sub:c.name,life:1.2,color:c.ring};
  }
  function abilityBlast(radius,damage,status,push=false){const p=game.player;game.zones.push({id:uid(),type:"blastFx",x:p.x,y:p.y,radius,life:.35,color:p.ring});for(const e of game.enemies){if(e.dead||e.invulnerable)continue;if(dist(p,e)<=radius+e.r){dealDamage(e,damage*totalDamageMultiplier(e),"ABILITY",false,status);if(push&&!e.boss){const a=angleTo(p,e);e.x+=Math.cos(a)*80;e.y+=Math.sin(a)*80;}}}}
  function healPlayer(amount){const p=game.player;if(!p)return;const old=p.hp;p.hp=Math.min(p.maxHp,p.hp+amount);const healed=p.hp-old;if(healed>0){game.runStats.healing+=healed;showNumber(p.x,p.y-32,"+"+Math.ceil(healed),"#63ff9c",true);}}
  function armorReduction(armor){return armor/(armor+100);}
  function hurtPlayer(amount,source="Enemy",bypass=.0){const p=game.player;if(!p||p.invuln>0||p.ghost>0||game.state!=="playing")return;let reduction=armorReduction(Math.max(0,p.armor))*(1-bypass);if(save.selectedCharacter==="TITAN"&&source.includes("Hazard"))reduction=Math.min(.75,reduction+.15);let dmg=Math.max(1,amount*(1-reduction));if(p.shield>0){const blocked=Math.min(p.shield,dmg);p.shield-=blocked;dmg-=blocked;game.runStats.prevented+=blocked;showNumber(p.x,p.y-32,"-"+Math.ceil(blocked)+" SHIELD","#7dfcff",true);}if(dmg>0){p.hp-=dmg;p.lastDamage=game.elapsed;p.invuln=.45;game.runStats.damageTaken+=dmg;game.runStats.finalSource=source;showNumber(p.x,p.y-36,"-"+Math.ceil(dmg),"#ff5e6d",true);game.camera.shake=Math.max(game.camera.shake,6);sfx(100,.1,"sawtooth",.06);}if(p.hp<=0){if(p.revive&&!p.revived){p.revived=true;p.hp=p.maxHp*.3;p.invuln=2.2;game.banner={text:"SECOND CHANCE",sub:"REVIVED",life:2,color:"#ffffff"};}else endRun("death");}}
  function dealDamage(e,amount,weaponId="UNKNOWN",crit=false,status=null){if(!e||e.dead||e.invulnerable)return 0;let dmg=amount;if(e.armor)dmg*=1-armorReduction(Math.max(0,e.armor-(e.status.armorBreak||0)*3));if(e.eliteMods?.includes("RESISTANT")&&weaponId!=="ABILITY")dmg*=.72;if(crit&&game.passives.ARMOR_BREAK)e.status.armorBreak=Math.min(5,e.status.armorBreak+1);if(e.shield>0){const b=Math.min(e.shield,dmg);e.shield-=b;dmg-=b;}if(dmg<=0)return 0;e.hp-=dmg;e.hitFlash=.08;game.runStats.damage+=dmg;game.runStats.weaponDamage[weaponId]=(game.runStats.weaponDamage[weaponId]||0)+dmg;game.runStats.highestHit=Math.max(game.runStats.highestHit,dmg);showDamageNumber(e,dmg,crit);applyStatus(e,status,dmg);if(e.eliteMods?.includes("REFLECTIVE")&&Math.random()<.06)hurtPlayer(dmg*.08,"Reflected damage");if(e.hp<=0)killEnemy(e,weaponId);return dmg;}
  function applyStatus(e,status,baseDamage){if(!status)return;const s=e.status;if(status==="burn"||status==="thermal"||status==="shockfrost"){s.burn=Math.min(8,s.burn+1+game.player.burn);s.burnTime=3.5*(1+game.player.burn);}if(status==="poison"){s.poison=Math.min(10,s.poison+1+game.player.poison);s.poisonTime=6*(1+game.player.poison);}if(status==="bleed"){s.bleed=Math.min(10,s.bleed+1+game.player.bleed);s.bleedTime=3.5;}if(status==="slow"||status==="thermal"){s.slow=Math.max(s.slow,.35);s.slowTime=3;}if(status==="frost"||status==="shockfrost"){s.frost+=18*(1+game.player.frost);if(s.frost>=100&&!e.boss){s.frost=0;s.slow=.85;s.slowTime=1.3;game.runStats.frozen++;save.records.FROZEN=(save.records.FROZEN||0)+1;}}if(status==="shock"||status==="shockfrost"){s.shock+=25;if(s.shock>=100&&!e.boss){s.shock=0;e.stun=.35;}}}

  // ============================================================
  // ENEMY AI / SUPPORTS / STATUS / SEPARATION
  // ============================================================
  function enemyShoot(e,angle,speed=e.bulletSpeed,count=1,spread=0,extra={}){for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*(count>1?spread/(count-1):0);game.projectiles.push(Object.assign({id:uid(),x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6,damage:e.damage,color:e.color,life:6,enemy:true,pierce:0,hitIds:new Set(),source:e.name,bounce:0},extra));}}
  function updateEnemies(dt){
    const p=game.player,slowWorld=p.timeSlow>0?.55:1;
    game.supportCounts={heal:0,shield:0,damage:0,haste:0};
    for(const e of game.enemies){if(e.dead||!e.active)continue;e.hitFlash=Math.max(0,e.hitFlash-dt);e.contactTimer=Math.max(0,e.contactTimer-dt);e.shootTimer-=dt*slowWorld;e.stateTimer-=dt*slowWorld;e.telegraph=Math.max(0,e.telegraph-dt);if(e.stun>0){e.stun-=dt;continue;}updateEnemyStatus(e,dt);if(e.dead)continue;
      let speed=e.speed*(e.status.slowTime>0?(1-e.status.slow):1)*slowWorld;if(e.eliteMods?.includes("HASTE"))speed*=1.2;if(e.eliteMods?.includes("REGENERATING"))e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.004*dt);
      const a=angleTo(e,p),d=dist(e,p);
      if(e.boss){updateBoss(e,dt,a,d);continue;}
      switch(e.ai){
        case"chase":moveEnemy(e,a,speed,dt);break;
        case"circle":moveEnemy(e,a+Math.sin(game.elapsed+e.id)*.7,speed,dt);break;
        case"dash":if(e.dashTimer>0){e.x+=e.dashVx*dt;e.y+=e.dashVy*dt;e.dashTimer-=dt;}else if(e.stateTimer<=0){e.telegraph=.55;e.stateTimer=2.4;e.dashTimer=.45;e.dashVx=Math.cos(a)*speed*4.4;e.dashVy=Math.sin(a)*speed*4.4;}else moveEnemy(e,a,speed*.45,dt);break;
        case"explode":moveEnemy(e,a,speed,dt);if(d<70)explodeEnemy(e);break;
        case"leap":if(e.stateTimer<=0){e.x+=Math.cos(a)*Math.min(260,d*.7);e.y+=Math.sin(a)*Math.min(260,d*.7);e.stateTimer=3;}else moveEnemy(e,a,speed*.55,dt);break;
        case"burrow":if(e.stateTimer<=0){e.x=clamp(p.x+rand(300,-300),40,game.world.w-40);e.y=clamp(p.y+rand(300,-300),40,game.world.h-40);e.stateTimer=4;e.invulnerable=false;}else moveEnemy(e,a,speed*.7,dt);break;
        case"shooter":keepDistance(e,a,d,speed,dt,260);if(e.shootTimer<=0){enemyShoot(e,a);e.shootTimer=e.shootCooldown;}break;
        case"scatter":keepDistance(e,a,d,speed,dt,220);if(e.shootTimer<=0){enemyShoot(e,a,e.bulletSpeed,5,.65);e.shootTimer=e.shootCooldown;}break;
        case"radial":keepDistance(e,a,d,speed,dt,260);if(e.shootTimer<=0){for(let i=0;i<10;i++)enemyShoot(e,i*TAU/10);e.shootTimer=e.shootCooldown;}break;
        case"mortar":keepDistance(e,a,d,speed,dt,330);if(e.shootTimer<=0){game.zones.push({id:uid(),type:"enemyWarning",x:p.x+rand(60,-60),y:p.y+rand(60,-60),r:70,life:1.1,explodeDamage:e.damage,color:e.color,source:e.name});e.shootTimer=e.shootCooldown;}break;
        case"sniper":keepDistance(e,a,d,speed,dt,420);if(e.shootTimer<=0){e.telegraph=.8;setTimeout(()=>{if(!e.dead&&game.state==="playing")enemyShoot(e,angleTo(e,game.player),e.bulletSpeed,1,0,{r:8});},700);e.shootTimer=e.shootCooldown;}break;
        case"spiral":keepDistance(e,a,d,speed,dt,300);if(e.shootTimer<=0){e.angle+=.35;enemyShoot(e,e.angle);e.shootTimer=e.shootCooldown;}break;
        case"ricochet":keepDistance(e,a,d,speed,dt,300);if(e.shootTimer<=0){enemyShoot(e,a,e.bulletSpeed,1,0,{bounce:1});e.shootTimer=e.shootCooldown;}break;
        case"mine":keepDistance(e,a,d,speed,dt,230);if(e.shootTimer<=0){game.traps.push({id:uid(),enemy:true,x:e.x,y:e.y,r:14,life:12,armed:.5,damage:e.damage,blast:80,color:e.color,source:e.name});e.shootTimer=e.shootCooldown;}break;
        case"wall":keepDistance(e,a,d,speed,dt,300);if(e.shootTimer<=0){game.zones.push({id:uid(),type:"enemyWall",x:(e.x+p.x)/2,y:(e.y+p.y)/2,w:150,h:18,angle:a+Math.PI/2,life:4,color:e.color,damage:e.damage*.35,source:e.name});e.shootTimer=e.shootCooldown;}break;
        case"gravity":keepDistance(e,a,d,speed,dt,270);if(e.shootTimer<=0){game.zones.push({id:uid(),type:"enemyGravity",x:p.x,y:p.y,r:120,life:3,color:e.color,damage:e.damage*.18,source:e.name,pull:85});e.shootTimer=e.shootCooldown;}break;
        case"frost":keepDistance(e,a,d,speed,dt,270);if(e.shootTimer<=0){game.zones.push({id:uid(),type:"enemySlow",x:p.x,y:p.y,r:100,life:3,color:e.color,damage:e.damage*.12,source:e.name});e.shootTimer=e.shootCooldown;}break;
        case"line":keepDistance(e,a,d,speed,dt,320);if(e.shootTimer<=0){game.zones.push({id:uid(),type:"enemyLine",x:0,y:p.y,ex:game.world.w,ey:p.y,width:42,life:1.4,warn:.85,damage:e.damage,source:e.name,color:e.color});e.shootTimer=e.shootCooldown;}break;
        case"anchor":keepDistance(e,a,d,speed,dt,250);if(e.shootTimer<=0){for(let i=0;i<4;i++)enemyShoot(e,a+i*Math.PI/2,e.bulletSpeed);e.shootTimer=e.shootCooldown;}break;
        case"supportHeal":supportMove(e,a,d,speed,dt,"heal");break;
        case"supportShield":supportMove(e,a,d,speed,dt,"shield");break;
        case"supportDamage":supportMove(e,a,d,speed,dt,"damage");break;
        case"supportHaste":supportMove(e,a,d,speed,dt,"haste");break;
        case"summoner":keepDistance(e,a,d,speed,dt,330);if(e.shootTimer<=0&&game.enemies.filter(x=>x.summoned&&!x.dead).length<12){const n=spawnEnemy("CHASER",false,randi(4),4);n.x=e.x+rand(70,-70);n.y=e.y+rand(70,-70);n.summoned=true;n.hp*=.55;n.maxHp=n.hp;n.xp=0;e.shootTimer=e.shootCooldown;}break;
        case"controller":keepDistance(e,a,d,speed,dt,300);if(e.shootTimer<=0){game.zones.push({id:uid(),type:"enemySlow",x:p.x,y:p.y,r:130,life:2.6,color:e.color,damage:e.damage*.15,source:e.name});e.shootTimer=e.shootCooldown;}break;
        case"phase":if(e.stateTimer<=0){e.x=clamp(p.x+Math.cos(a+Math.PI)*150,30,game.world.w-30);e.y=clamp(p.y+Math.sin(a+Math.PI)*150,30,game.world.h-30);e.stateTimer=2.8;}moveEnemy(e,a,speed,dt);break;
        case"creator":keepDistance(e,a,d,speed,dt,260);if(e.shootTimer<=0){enemyShoot(e,a,e.bulletSpeed,3,.35);e.shootTimer=e.shootCooldown;}break;
      }
      if(circleHit(e,p)&&e.contactTimer<=0){hurtPlayer(e.damage,e.name);e.contactTimer=.7;}
      if(e.eliteMods?.includes("VAMPIRIC")&&circleHit(e,p))e.hp=Math.min(e.maxHp,e.hp+e.damage*.1*dt);
    }
    applyEnemySeparation(dt);applySupportEffects(dt);
  }
  function moveEnemy(e,a,speed,dt){e.x+=Math.cos(a)*speed*dt;e.y+=Math.sin(a)*speed*dt;e.x=clamp(e.x,e.r,game.world.w-e.r);e.y=clamp(e.y,e.r,game.world.h-e.r);}
  function keepDistance(e,a,d,speed,dt,wanted){if(d>wanted+35)moveEnemy(e,a,speed,dt);else if(d<wanted-35)moveEnemy(e,a+Math.PI,speed*.8,dt);else moveEnemy(e,a+Math.PI/2*Math.sign(Math.sin(game.elapsed+e.id)),speed*.35,dt);}
  function supportMove(e,a,d,speed,dt,type){const allies=game.enemies.filter(x=>x!==e&&!x.dead&&!x.support);const target=allies.sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];if(target){const td=dist(e,target),ta=angleTo(e,target);if(td>130)moveEnemy(e,ta,speed,dt);else if(td<80)moveEnemy(e,ta+Math.PI,speed*.5,dt);}else keepDistance(e,a,d,speed,dt,300);e.supportType=type;game.supportCounts[type]++;if(e.shootTimer<=0){enemyShoot(e,a,e.bulletSpeed*.8);e.shootTimer=e.shootCooldown;}}
  function applySupportEffects(dt){
    const supports=game.enemies.filter(e=>!e.dead&&e.support&&e.supportType);
    for(const ally of game.enemies){if(ally.dead||ally.support)continue;let heal=false,shield=false,damage=false,haste=false;for(const s of supports){if(dist2(ally,s)>150*150)continue;if(s.supportType==="heal")heal=true;if(s.supportType==="shield")shield=true;if(s.supportType==="damage")damage=true;if(s.supportType==="haste")haste=true;}
      if(heal)ally.hp=Math.min(ally.maxHp,ally.hp+ally.maxHp*.012*dt);if(shield)ally.shield=Math.min(ally.maxHp*.25,ally.shield+ally.maxHp*.02*dt);ally.supportDamage=damage?1.18:1;ally.supportHaste=haste?1.18:1;
    }
  }
  function applyEnemySeparation(dt){const cell=80,map=new Map();for(const e of game.enemies){if(e.dead||e.boss)continue;const k=Math.floor(e.x/cell)+","+Math.floor(e.y/cell);if(!map.has(k))map.set(k,[]);map.get(k).push(e);}for(const group of map.values())for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){const a=group[i],b=group[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01,min=a.r+b.r+4;if(d<min){const push=(min-d)*.5,nx=dx/d,ny=dy/d;a.x-=nx*push;b.x+=nx*push;a.y-=ny*push;b.y+=ny*push;}}}
  function updateEnemyStatus(e,dt){const s=e.status;if(s.burnTime>0){s.burnTime-=dt;dealDot(e,s.burn*(1.5+game.player.burn)*dt,"BURN");}else s.burn=0;if(s.poisonTime>0){s.poisonTime-=dt;dealDot(e,s.poison*(1.1+game.player.poison)*dt,"POISON");}else s.poison=0;if(s.bleedTime>0){s.bleedTime-=dt;dealDot(e,s.bleed*(1.4+game.player.bleed)*dt,"BLEED");}else s.bleed=Math.max(0,s.bleed-dt*2);if(s.slowTime>0)s.slowTime-=dt;else s.slow=0;}
  function dealDot(e,amount,id){if(e.dead)return;e.hp-=amount;game.runStats.damage+=amount;game.runStats.weaponDamage[id]=(game.runStats.weaponDamage[id]||0)+amount;if(e.hp<=0)killEnemy(e,id);}

  function updateBoss(e,dt,a,d){
    e.phaseTimer+=dt;e.shootTimer-=0;const hp=e.hp/e.maxHp;
    if(e.bossType==="RAVAGER"){
      if(hp<.72&&e.phase===1){e.phase=2;e.invulnerable=true;e.objective=3;for(let i=0;i<3;i++){const n=spawnEnemy("ANCHOR",false,i,3);n.name="Ravager Node";n.x=game.world.w*.3+i*game.world.w*.2;n.y=game.world.h*.68;n.nodeFor=e.id;n.hp*=2;n.maxHp=n.hp;n.xp=0;}game.banner={text:"DESTROY THE NODES",sub:"RAVAGER IS SHIELDED",life:2.6,color:"#ffde59"};}
      if(e.phase===2){const nodes=game.enemies.filter(x=>x.nodeFor===e.id&&!x.dead);if(!nodes.length){e.phase=3;e.invulnerable=false;e.speed*=1.3;game.banner={text:"RAVAGER AWAKENS",sub:"FINAL PHASE",life:2.3,color:"#ff2f88"};}else{if(e.shootTimer<=0){for(let i=0;i<14;i++)enemyShoot(e,i*TAU/14,e.bulletSpeed);e.shootTimer=1.8;}return;}}
      if(e.phase===1){moveEnemy(e,a,e.speed*.55,dt);if(e.shootTimer<=0){for(let i=0;i<8;i++)enemyShoot(e,i*TAU/8,e.bulletSpeed);e.shootTimer=1.6;}}
      else{if(e.stateTimer<=0){e.dashTimer=.45;e.dashVx=Math.cos(a)*e.speed*5;e.dashVy=Math.sin(a)*e.speed*5;e.stateTimer=2.2;}if(e.dashTimer>0){e.x+=e.dashVx*dt;e.y+=e.dashVy*dt;e.dashTimer-=dt;}else moveEnemy(e,a,e.speed*.7,dt);if(e.shootTimer<=0){enemyShoot(e,a,e.bulletSpeed*1.2,7,.8);e.shootTimer=1.1;}}
    } else if(e.bossType==="WORLDBREAKER"){
      const phase=hp>.68?1:hp>.36?2:3;if(phase!==e.phase){e.phase=phase;game.projectiles=game.projectiles.filter(b=>!b.enemy);game.banner={text:`WORLDBREAKER PHASE ${phase}`,sub:phase===3?"THE ARENA COLLAPSES":"",life:2,color:"#ff2f88"};if(phase===2)game.zones.push({id:uid(),type:"brokenBorder",side:"left",life:999,persistent:true});if(phase===3)game.zones.push({id:uid(),type:"brokenBorder",side:"right",life:999,persistent:true});}
      e.x=lerp(e.x,game.world.w/2,dt*.7);e.y=lerp(e.y,game.world.h*.25,dt*.7);
      if(e.shootTimer<=0){if(phase===1){for(let i=0;i<18;i++)enemyShoot(e,e.angle+i*TAU/18,e.bulletSpeed);e.angle+=.22;e.shootTimer=1.15;}else if(phase===2){game.zones.push({id:uid(),type:"enemyLine",x:0,y:game.player.y,ex:game.world.w,ey:game.player.y,width:55,life:1.25,warn:.72,damage:e.damage*1.25,source:e.name,color:e.color});for(let i=0;i<10;i++)enemyShoot(e,a+(i-4.5)*.12,e.bulletSpeed*1.25);e.shootTimer=1.35;}else{for(let ring=0;ring<2;ring++)for(let i=0;i<14;i++)enemyShoot(e,e.angle+i*TAU/14+(ring*.12),e.bulletSpeed*(1+ring*.2));e.angle+=.28;game.zones.push({id:uid(),type:"enemyWarning",x:game.player.x,y:game.player.y,r:85,life:.9,explodeDamage:e.damage*1.4,color:e.color,source:e.name});e.shootTimer=.95;}}
    } else if(e.bossType==="CREATOR"){
      const phase=hp>.8?1:hp>.6?2:hp>.4?3:hp>.2?4:5;if(phase!==e.phase){e.phase=phase;game.projectiles=game.projectiles.filter(b=>!b.enemy);game.banner={text:["","ARCHITECT","ERASURE","RECONSTRUCTION","BROKEN RULES","FINAL CREATION"][phase],sub:"THE CREATOR REWRITES THE ARENA",life:2.4,color:"#ffffff"};if(phase===2){const enabled=game.weapons.filter(w=>!w.disabled);if(enabled.length>1){const victim=pick(enabled);victim.disabled=5;}}if(phase===3)for(let i=0;i<5;i++){const n=spawnEnemy(pick(["CREATOR_WISP","PHASE_HUNTER","AMPLIFIER"]),i===4,i,5);n.x=e.x+rand(220,-220);n.y=e.y+rand(220,-220);}if(phase===4)game.reverseProjectiles=6;}
      e.x=lerp(e.x,game.world.w/2+Math.sin(game.elapsed*.4)*180,dt*.7);e.y=lerp(e.y,game.world.h*.22+Math.cos(game.elapsed*.6)*70,dt*.7);
      if(e.shootTimer<=0){if(phase===1){for(let i=0;i<16;i++)enemyShoot(e,e.angle+i*TAU/16,e.bulletSpeed*1.1);e.angle+=.18;e.shootTimer=.95;}else if(phase===2){for(let i=-4;i<=4;i++)enemyShoot(e,a+i*.11,e.bulletSpeed*1.45);e.shootTimer=.8;}else if(phase===3){game.zones.push({id:uid(),type:"enemyGravity",x:game.player.x,y:game.player.y,r:145,life:3,color:e.color,damage:e.damage*.2,source:e.name,pull:110});e.shootTimer=1.4;}else if(phase===4){for(let i=0;i<22;i++)enemyShoot(e,-e.angle+i*TAU/22,e.bulletSpeed*(i%2?1.2:.85));e.angle+=.3;e.shootTimer=.9;}else{for(let i=0;i<28;i++)enemyShoot(e,e.angle+i*TAU/28,e.bulletSpeed*1.3);game.zones.push({id:uid(),type:"enemyLine",x:game.player.x,y:0,ex:game.player.x,ey:game.world.h,width:48,life:1.1,warn:.62,damage:e.damage*1.3,source:e.name,color:e.color});e.angle+=.24;e.shootTimer=.72;}}
    } else {
      updateMinorBoss(e,dt,a,d);
    }
    e.x=clamp(e.x,e.r,game.world.w-e.r);e.y=clamp(e.y,e.r,game.world.h-e.r);
    if(circleHit(e,game.player)&&e.contactTimer<=0){hurtPlayer(e.damage,e.name,.15);e.contactTimer=.85;}
  }
  function updateMinorBoss(e,dt,a,d){
    const type=e.bossType;
    if(["CHARGER","BLADE","IRON","SHADOW","SENTINEL"].includes(type)){
      if(e.dashTimer>0){e.x+=e.dashVx*dt;e.y+=e.dashVy*dt;e.dashTimer-=dt;}else if(e.stateTimer<=0){e.dashTimer=.5;e.dashVx=Math.cos(a)*e.speed*4;e.dashVy=Math.sin(a)*e.speed*4;e.stateTimer=2.1;}else moveEnemy(e,a,e.speed*.55,dt);
    }else keepDistance(e,a,d,e.speed,dt,280);
    if(e.shootTimer<=0){
      if(type==="SOLAR"||type==="PULSE_CROWN"){for(let i=0;i<14;i++)enemyShoot(e,e.angle+i*TAU/14,e.bulletSpeed);e.angle+=.2;}
      else if(type==="SPIRAL"||type==="STORM_MACHINE"){for(let i=0;i<6;i++)enemyShoot(e,e.angle+i*TAU/6,e.bulletSpeed*1.15);e.angle+=.45;}
      else if(type==="WHITE_EYE"){e.telegraph=.7;setTimeout(()=>!e.dead&&game.state==="playing"&&enemyShoot(e,angleTo(e,game.player),e.bulletSpeed*2,1,0,{r:10}),600);}
      else if(type==="HIVE"&&game.enemies.filter(x=>x.summoned&&!x.dead).length<8){for(let i=0;i<3;i++){const n=spawnEnemy("CHASER",false,i,3);n.x=e.x+rand(80,-80);n.y=e.y+rand(80,-80);n.summoned=true;n.xp=0;}}
      else if(type==="GRAVITY_WARDEN")game.zones.push({id:uid(),type:"enemyGravity",x:game.player.x,y:game.player.y,r:130,life:3,color:e.color,damage:e.damage*.2,source:e.name,pull:100});
      else{enemyShoot(e,a,e.bulletSpeed,5,.6);}
      e.shootTimer=type==="STORM_MACHINE"?.7:1.45;
    }
  }

  // ============================================================
  // PROJECTILES / ZONES / TRAPS / GEMS / DEATH
  // ============================================================
  function updateProjectiles(dt){
    for(const b of game.projectiles){
      if(b.dead)continue;b.life-=dt;if(b.life<=0){if(b.returning&&!b.returned){b.returned=true;b.life=1.2;const a=angleTo(b,game.player);b.vx=Math.cos(a)*Math.hypot(b.vx,b.vy);b.vy=Math.sin(a)*Math.hypot(b.vx,b.vy);}else{b.dead=true;continue;}}
      if(game.reverseProjectiles>0&&b.enemy){b.vx*=-1;b.vy*=-1;}
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.bounce>0&&(b.x<b.r||b.x>game.world.w-b.r)){b.vx*=-1;b.bounce--;}if(b.bounce>0&&(b.y<b.r||b.y>game.world.h-b.r)){b.vy*=-1;b.bounce--;}
      if(b.x<-100||b.y<-100||b.x>game.world.w+100||b.y>game.world.h+100){b.dead=true;continue;}
      if(b.enemy){
        if(circleHit(b,game.player)){hurtPlayer(b.damage,b.source||"Projectile");b.dead=true;}
        if(!b.dead&&game.weapons.some(w=>effectiveWeapon(w).blocksBullets)){const t=nowSec();for(const w of game.weapons){const d=effectiveWeapon(w);if(!d.blocksBullets)continue;const count=(d.orbitCount||2)+Math.floor(w.level/4),radius=d.orbitRadius||88;for(let i=0;i<count;i++){const a=t*d.orbitSpeed+i*TAU/count,ox=game.player.x+Math.cos(a)*radius,oy=game.player.y+Math.sin(a)*radius;if(Math.hypot(b.x-ox,b.y-oy)<b.r+12){b.dead=true;break;}}}}
      }else{
        for(const e of game.enemies){if(e.dead||e.invulnerable||b.hitIds.has(e.id))continue;if(circleHit(b,e)){b.hitIds.add(e.id);dealDamage(e,b.damage,b.weaponId,b.crit,b.status);if(b.explosive)explodeAt(b.x,b.y,b.blast,b.damage*.72,b.weaponId,b.status);if(b.pierce>0)b.pierce--;else{b.dead=true;break;}}}
      }
    }
    game.projectiles=game.projectiles.filter(b=>!b.dead);
    if(game.projectiles.length>1600)game.projectiles.splice(0,game.projectiles.length-1600);
    if(game.reverseProjectiles>0)game.reverseProjectiles=Math.max(0,game.reverseProjectiles-dt);
  }
  function explodeAt(x,y,radius,damage,weaponId,status){game.zones.push({id:uid(),type:"blastFx",x,y,radius,life:.25,color:"#ff9f43"});for(const e of game.enemies){if(!e.dead&&!e.invulnerable&&Math.hypot(e.x-x,e.y-y)<radius+e.r)dealDamage(e,damage,weaponId,false,status);}}
  function explodeEnemy(e){game.zones.push({id:uid(),type:"enemyWarning",x:e.x,y:e.y,r:85,life:.35,explodeDamage:e.damage,color:e.color,source:e.name});killEnemy(e,"SELF");}
  function updateZones(dt){
    for(const z of game.zones){z.life-=dt;if(z.type==="playerZone"){z.tick-=dt;if(z.pull)for(const e of game.enemies){if(!e.dead&&!e.boss&&dist2(z,e)<z.r*z.r){const a=angleTo(e,z);e.x+=Math.cos(a)*z.pull*dt;e.y+=Math.sin(a)*z.pull*dt;}}if(z.tick<=0){z.tick=.28;for(const e of game.enemies)if(!e.dead&&!e.invulnerable&&dist2(z,e)<(z.r+e.r)**2)dealDamage(e,z.damage*.28,z.weaponId,false,z.status);}}
      if(z.type==="ward"){z.x=game.player.x;z.y=game.player.y;game.player.shield=Math.max(game.player.shield,8*(1+game.player.shieldPower));}
      if(z.type==="enemyWarning"&&z.life<=0&&!z.exploded){z.exploded=true;if(Math.hypot(game.player.x-z.x,game.player.y-z.y)<z.r+game.player.r)hurtPlayer(z.explodeDamage,z.source||"Hazard");game.camera.shake=Math.max(game.camera.shake,8);}
      if(z.type==="enemyGravity"||z.type==="enemySlow"){if(Math.hypot(game.player.x-z.x,game.player.y-z.y)<z.r+game.player.r){if(z.type==="enemyGravity"){const a=angleTo(game.player,z);game.player.x+=Math.cos(a)*z.pull*dt;game.player.y+=Math.sin(a)*z.pull*dt;}else{game.player.x-=input.moveX*game.player.speed*.25*dt;}hurtPlayer(z.damage*dt*2,z.source||"Hazard");}}
      if(z.type==="enemyLine"&&z.life<(z.warn||.7)){const distance=pointLineDistance(game.player.x,game.player.y,z.x,z.y,z.ex,z.ey);if(distance<z.width/2+game.player.r)hurtPlayer(z.damage,z.source||"Line Hazard");}
      if(z.type==="enemyWall"){const dx=game.player.x-z.x,dy=game.player.y-z.y,c=Math.cos(-z.angle),s=Math.sin(-z.angle),lx=dx*c-dy*s,ly=dx*s+dy*c;if(Math.abs(lx)<z.w/2&&Math.abs(ly)<z.h/2+game.player.r)hurtPlayer(z.damage,z.source||"Wall Hazard");}
    }
    game.zones=game.zones.filter(z=>z.life>0||z.persistent);
  }
  function pointLineDistance(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,len=dx*dx+dy*dy||1,t=clamp(((px-x1)*dx+(py-y1)*dy)/len,0,1),x=x1+t*dx,y=y1+t*dy;return Math.hypot(px-x,py-y);}
  function updateTraps(dt){for(const t of game.traps){t.life-=dt;t.armed-=dt;if(t.life<=0){t.dead=true;continue;}if(t.armed>0)continue;if(t.enemy){if(Math.hypot(game.player.x-t.x,game.player.y-t.y)<t.r+game.player.r+10){if(Math.hypot(game.player.x-t.x,game.player.y-t.y)<t.blast)hurtPlayer(t.damage,t.source||"Mine");t.dead=true;}}else{const e=game.enemies.find(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<e.r+t.r+8);if(e){explodeAt(t.x,t.y,t.blast,t.damage,t.weaponId,t.status);t.dead=true;}}}game.traps=game.traps.filter(t=>!t.dead);}
  function killEnemy(e,weaponId){if(e.dead)return;e.dead=true;e.active=false;game.runStats.kills++;save.totalKills++;if(e.elite){game.runStats.elites++;}if(e.boss){game.runStats.bosses++;save.totalBosses++;}if(e.nodeFor){/* node cleanup handled by boss */}if(e.eliteMods?.includes("EXPLOSIVE"))game.zones.push({id:uid(),type:"enemyWarning",x:e.x,y:e.y,r:80,life:.45,explodeDamage:e.damage*.8,color:e.color,source:"Elite explosion"});if(e.eliteMods?.includes("DEATH_PULSE"))for(let i=0;i<8;i++)enemyShoot(e,i*TAU/8,e.bulletSpeed*.8);if(e.eliteMods?.includes("SPLITTING")&&!e.boss){for(let i=0;i<2;i++){const n=spawnEnemy("CHASER",false,i,2);n.x=e.x+rand(30,-30);n.y=e.y+rand(30,-30);n.hp=e.maxHp*.18;n.maxHp=n.hp;n.xp=e.xp*.15;n.summoned=true;}}if(game.passives.KILL_EXPLOSION&&Math.random()<.08*game.passives.KILL_EXPLOSION)explodeAt(e.x,e.y,70,12*game.passives.KILL_EXPLOSION*totalDamageMultiplier(),"KILL_EXPLOSION",null);if(game.player.vampire&&game.runStats.kills%18===0)healPlayer(1);dropGem(e.x,e.y,e.xp*(e.elite?1.8:1)*(e.boss?3:1));burstParticles(e.x,e.y,e.color,e.boss?30:e.elite?18:8);if(e.boss){if(e.bossType==="WORLDBREAKER"){save.chaosUnlocked=true;save.fakeEndingSeen=true;if(save.selectedCharacter==="TANK")save.achievements.TANK_WORLD=true;unlockCharacterProgress("OVERLORD");unlockCharacterProgress("VOID");persist();showWorldbreakerEnding();return;}if(e.bossType==="CREATOR"){save.creatorDefeated=true;save.trueEndingSeen=true;unlockCharacterProgress("APEX");persist();showCreatorEnding();return;}}}
  function unlockCharacterProgress(id){if(!save.revealedCharacters.includes(id))save.revealedCharacters.push(id);}
  function dropGem(x,y,value){game.gems.push({id:uid(),x,y,vx:rand(80,-80),vy:rand(80,-80),r:value>100?10:value>25?7:5,value,life:999,color:value>100?"#ffde59":value>25?"#a77dff":"#7dfcff"});}
  function updateGems(dt){const p=game.player;for(const g of game.gems){g.x+=g.vx*dt;g.y+=g.vy*dt;g.vx*=.92;g.vy*=.92;const d=dist(g,p);if(d<p.pickup){const a=angleTo(g,p),force=250+(p.pickup-d)*5;g.vx+=Math.cos(a)*force*dt;g.vy+=Math.sin(a)*force*dt;}if(d<p.r+g.r+8){g.dead=true;gainXp(g.value);}}
    game.gems=game.gems.filter(g=>!g.dead);if(game.gems.length>220)mergeGems();}
  function mergeGems(){game.gems.sort((a,b)=>a.value-b.value);while(game.gems.length>160){const a=game.gems.shift(),b=game.gems.shift();game.gems.push({id:uid(),x:(a.x+b.x)/2,y:(a.y+b.y)/2,vx:0,vy:0,r:Math.min(12,Math.max(a.r,b.r)+1),value:a.value+b.value,life:999,color:"#a77dff"});}}
  function showWorldbreakerEnding(){game.state="ending";resetInputs();updateMobileUI();showOverlay(`<div class="nbs-panel nbs-center"><h1 style="color:#fff">WORLDBREAKER DEFEATED</h1><p>The Ravager signal falls silent. For one second, the neon world believes it is safe.</p><p style="color:#ff7bd0">Then the victory screen glitches. Somewhere beyond the arena, a second signal answers.</p><p><b>CHAOS MODE UNLOCKED</b></p><div class="nbs-row">${button("Finish Run","finish-worldbreaker","good")}${button("Continue Beyond 100","continue-101")}</div></div>`);}
  function showCreatorEnding(){game.state="ending";resetInputs();updateMobileUI();showOverlay(`<div class="nbs-panel nbs-center"><h1 style="color:#fff">THE FALLEN CREATOR IS DEFEATED</h1><p>The true architect of the Ravager collapses, and the hidden ending is revealed.</p><p>You may end the run—or continue into a world no longer protected by its own rules.</p><div class="nbs-row">${button("End With True Victory","finish-creator","good")}${button("Continue Past Wave 200","continue-201")}</div></div>`);}

  // ============================================================
  // LANDMARKS / CAMERA / PARTICLES / DAMAGE NUMBERS
  // ============================================================
  function generateLandmarks(){game.landmarks=[];const types=["tower","ring","wreck","pool","glyph","pillar","reactor","shard"];for(let i=0;i<12;i++)game.landmarks.push({id:uid(),type:types[i%types.length],x:rand(game.world.w-160,160),y:rand(game.world.h-160,160),r:rand(42,24),hp:i%5===0?120:0,interactive:i%5===0,color:i%2?"#315bc7":"#7dfcff"});}
  function updateCamera(dt){const c=game.camera,p=game.player;if(!p)return;const look=45,targetX=clamp(p.x-innerWidth/2+Math.cos(input.aimAngle)*look,0,Math.max(0,game.world.w-innerWidth)),targetY=clamp(p.y-innerHeight/2+Math.sin(input.aimAngle)*look,0,Math.max(0,game.world.h-innerHeight));const sm=clamp(save.settings.cameraSmoothing||.12,.03,.35);c.x=lerp(c.x,targetX,1-Math.pow(1-sm,dt*60));c.y=lerp(c.y,targetY,1-Math.pow(1-sm,dt*60));c.shake*=Math.pow(.08,dt);}
  function burstParticles(x,y,color,n=8){if(save.settings.reducedEffects)return;const max=Math.floor(n*save.settings.particles);for(let i=0;i<max;i++){const a=rand(TAU),s=rand(220,50);game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rand(4,1.5),life:rand(.65,.25),color});}if(game.particles.length>450)game.particles.splice(0,game.particles.length-450);}
  function updateParticles(dt){for(const p of game.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;}game.particles=game.particles.filter(p=>p.life>0);for(const n of game.numbers){n.y-=30*dt;n.life-=dt;}game.numbers=game.numbers.filter(n=>n.life>0);}
  function showNumber(x,y,text,color,important=false){const mode=save.settings.damageNumbers;if(mode==="off"||mode==="important"&&!important)return;game.numbers.push({x,y,text,color,life:.8,important});if(game.numbers.length>100)game.numbers.splice(0,game.numbers.length-100);}
  function showDamageNumber(e,dmg,crit){const mode=save.settings.damageNumbers;if(mode==="off"||mode==="important"&&!crit)return;if(mode==="combined"&&!crit){const existing=game.numbers.find(n=>n.targetId===e.id&&n.life>.45);if(existing){existing.value+=dmg;existing.text=fmt(existing.value);existing.life=.75;return;}game.numbers.push({x:e.x,y:e.y-e.r-8,text:fmt(dmg),value:dmg,targetId:e.id,color:"#fff",life:.75});}else showNumber(e.x,e.y-e.r-8,(crit?"CRIT ":"")+fmt(dmg),crit?"#ffde59":"#fff",crit);}

  // ============================================================
  // DRAWING
  // ============================================================
  function worldToScreen(x,y){return{x:x-game.camera.x,y:y-game.camera.y};}
  function visible(x,y,r=50){return x+r>=game.camera.x&&y+r>=game.camera.y&&x-r<=game.camera.x+innerWidth&&y-r<=game.camera.y+innerHeight;}
  function draw(){
    ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle="#050714";ctx.fillRect(0,0,innerWidth,innerHeight);
    drawBackground();
    if(game.player){const shake=game.camera.shake*save.settings.screenShake, sx=shake?rand(shake,-shake):0,sy=shake?rand(shake,-shake):0;ctx.save();ctx.translate(-game.camera.x+sx,-game.camera.y+sy);drawWorld();ctx.restore();drawMinimap();drawHUD();drawBanner();}
    ctx.restore();
  }
  function drawBackground(){const grad=ctx.createRadialGradient(innerWidth*.5,innerHeight*.45,20,innerWidth*.5,innerHeight*.5,Math.max(innerWidth,innerHeight));grad.addColorStop(0,"#11183a");grad.addColorStop(1,"#03040d");ctx.fillStyle=grad;ctx.fillRect(0,0,innerWidth,innerHeight);ctx.fillStyle="rgba(125,252,255,.22)";for(let i=0;i<80;i++){const x=(i*97+game.elapsed*8)%innerWidth,y=(i*53)%innerHeight;ctx.fillRect(x,y,1+(i%2),1+(i%3===0));}}
  function drawWorld(){
    drawGrid();drawLandmarks();drawBorder();drawZones();drawTraps();drawGems();drawProjectiles();drawEnemies();drawOrbitalsAndDrones();drawPlayer();drawParticlesAndNumbers();
  }
  function drawGrid(){ctx.strokeStyle="rgba(74,105,180,.11)";ctx.lineWidth=1;const step=90;for(let x=0;x<=game.world.w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,game.world.h);ctx.stroke();}for(let y=0;y<=game.world.h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(game.world.w,y);ctx.stroke();}}
  function drawBorder(){ctx.save();ctx.strokeStyle=game.mode==="chaos"?"#ff42ef":"#4fdcff";ctx.lineWidth=8;ctx.shadowBlur=20;ctx.shadowColor=ctx.strokeStyle;ctx.strokeRect(4,4,game.world.w-8,game.world.h-8);ctx.shadowBlur=0;ctx.setLineDash([22,14]);ctx.strokeStyle="rgba(255,255,255,.45)";ctx.lineWidth=2;ctx.strokeRect(15,15,game.world.w-30,game.world.h-30);ctx.restore();}
  function drawLandmarks(){for(const l of game.landmarks){if(!visible(l.x,l.y,l.r+20))continue;ctx.save();ctx.translate(l.x,l.y);ctx.globalAlpha=.55;ctx.strokeStyle=l.color;ctx.fillStyle="rgba(30,70,130,.18)";ctx.lineWidth=3;ctx.shadowBlur=12;ctx.shadowColor=l.color;if(l.type==="ring"){ctx.beginPath();ctx.arc(0,0,l.r,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,l.r*.55,0,TAU);ctx.stroke();}else if(l.type==="tower"||l.type==="pillar"){ctx.fillRect(-l.r*.35,-l.r,l.r*.7,l.r*2);ctx.strokeRect(-l.r*.35,-l.r,l.r*.7,l.r*2);}else{ctx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6,x=Math.cos(a)*l.r,y=Math.sin(a)*l.r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();}}
  function drawZones(){for(const z of game.zones){if(z.type==="brokenBorder")continue;ctx.save();ctx.globalAlpha=clamp(z.life,.12,.75);ctx.strokeStyle=z.color||"#ff4f9a";ctx.fillStyle=(z.color||"#ff4f9a")+"22";ctx.lineWidth=3;if(["playerZone","ward","enemyWarning","enemyGravity","enemySlow"].includes(z.type)){ctx.beginPath();ctx.arc(z.x,z.y,z.r||z.radius||80,0,TAU);ctx.fill();ctx.stroke();}else if(z.type==="enemyLine"||z.type==="lineFx"||z.type==="beamFx"){ctx.lineWidth=z.width||6;if(z.type==="enemyLine"&&z.life>(z.warn||.7))ctx.setLineDash([18,12]);ctx.beginPath();ctx.moveTo(z.x,z.y);ctx.lineTo(z.ex,z.ey);ctx.stroke();}else if(z.type==="slashFx"){ctx.lineWidth=8;ctx.beginPath();ctx.arc(z.x,z.y,z.range,z.angle-z.arc/2,z.angle+z.arc/2);ctx.stroke();}else if(z.type==="blastFx"){ctx.beginPath();ctx.arc(z.x,z.y,z.radius*(1-z.life/.35*.25),0,TAU);ctx.stroke();}else if(z.type==="enemyWall"){ctx.translate(z.x,z.y);ctx.rotate(z.angle);ctx.fillRect(-z.w/2,-z.h/2,z.w,z.h);ctx.strokeRect(-z.w/2,-z.h/2,z.w,z.h);}ctx.restore();}}
  function drawTraps(){for(const t of game.traps){ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle=t.color||"#ff9f43";ctx.strokeStyle="#fff";ctx.beginPath();ctx.arc(0,0,t.r,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}}
  function drawGems(){for(const g of game.gems){if(!visible(g.x,g.y,15))continue;ctx.save();ctx.translate(g.x,g.y);ctx.rotate(game.elapsed*2);ctx.fillStyle=g.color;ctx.shadowBlur=10;ctx.shadowColor=g.color;ctx.beginPath();ctx.moveTo(0,-g.r);ctx.lineTo(g.r,0);ctx.lineTo(0,g.r);ctx.lineTo(-g.r,0);ctx.closePath();ctx.fill();ctx.restore();}}
  function drawProjectiles(){for(const b of game.projectiles){if(!visible(b.x,b.y,b.r+5))continue;ctx.fillStyle=b.color;ctx.shadowBlur=8;ctx.shadowColor=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.shadowBlur=0;}}
  function drawEnemies(){for(const e of game.enemies){if(e.dead||!visible(e.x,e.y,e.r+40))continue;ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=e.hitFlash>0?"#ff3030":e.color;ctx.strokeStyle=e.elite?ELITE_MODS[e.eliteMods[0]]?.color||"#fff":"#161b34";ctx.lineWidth=e.elite?4:2;ctx.shadowBlur=e.boss?22:e.elite?13:5;ctx.shadowColor=e.color;ctx.beginPath();if(e.boss){for(let i=0;i<10;i++){const a=i*TAU/10,r=e.r*(i%2?1:.72),x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}else if(e.support){ctx.rect(-e.r,-e.r,e.r*2,e.r*2);}else{ctx.arc(0,0,e.r,0,TAU);}ctx.fill();ctx.stroke();ctx.shadowBlur=0;if(e.telegraph>0){ctx.strokeStyle="#fff";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r+10+Math.sin(game.elapsed*15)*4,0,TAU);ctx.stroke();}if(e.elite){ctx.fillStyle="#fff";ctx.font="14px Arial";ctx.textAlign="center";ctx.fillText(e.eliteMods.map(m=>ELITE_MODS[m].icon).join(" "),0,-e.r-12);}ctx.restore();
      if(e.boss||e.elite){const w=e.r*2.2,x=e.x-w/2,y=e.y-e.r-20;ctx.fillStyle="#11172b";ctx.fillRect(x,y,w,6);ctx.fillStyle=e.color;ctx.fillRect(x,y,w*clamp(e.hp/e.maxHp,0,1),6);if(e.shield>0){ctx.fillStyle="#7dfcff";ctx.fillRect(x,y-4,w*clamp(e.shield/(e.maxHp*.35),0,1),3);}}
    }}
  function drawOrbitalsAndDrones(){const t=nowSec();for(const w of game.weapons){if(w.disabled>0)continue;const d=effectiveWeapon(w);if(["orbital","orbitalArc"].includes(d.behavior)){const count=(d.orbitCount||1)+Math.floor(w.level/4),radius=(d.orbitRadius||70)*(1+game.player.orbit),speed=(d.orbitSpeed||2)*(1+game.player.orbit*.4);for(let i=0;i<count;i++){const a=t*speed+i*TAU/count,x=game.player.x+Math.cos(a)*radius,y=game.player.y+Math.sin(a)*radius;ctx.fillStyle=d.color;ctx.shadowBlur=12;ctx.shadowColor=d.color;ctx.beginPath();ctx.arc(x,y,8*game.player.area,0,TAU);ctx.fill();ctx.shadowBlur=0;}}if(["drone","droneEcho"].includes(d.behavior)){const count=(d.droneCount||1)+Math.floor(w.level/5);for(let i=0;i<count;i++){const a=t*.75+i*TAU/count,x=game.player.x+Math.cos(a)*(52+i*7),y=game.player.y+Math.sin(a)*(52+i*7);ctx.fillStyle=d.color;ctx.strokeStyle="#fff";ctx.fillRect(x-7,y-7,14,14);ctx.strokeRect(x-7,y-7,14,14);}}}}
  function drawPlayer(){const p=game.player;ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle=p.color;ctx.strokeStyle=p.ring;ctx.lineWidth=4;ctx.shadowBlur=18;ctx.shadowColor=p.ring;ctx.beginPath();ctx.arc(0,0,p.r,0,TAU);ctx.fill();ctx.stroke();ctx.rotate(input.aimAngle);ctx.fillStyle="#fff";ctx.fillRect(8,-4,25,8);ctx.rotate(-input.aimAngle);if(p.shield>0){ctx.strokeStyle="#7dfcff";ctx.beginPath();ctx.arc(0,0,p.r+9,0,TAU);ctx.stroke();}ctx.restore();}
  function drawParticlesAndNumbers(){for(const p of game.particles){ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();}ctx.globalAlpha=1;ctx.font="bold 14px Arial";ctx.textAlign="center";for(const n of game.numbers){ctx.globalAlpha=clamp(n.life*1.5,0,1);ctx.fillStyle=n.color;ctx.fillText(n.text,n.x,n.y);}ctx.globalAlpha=1;}
  function drawHUD(){const p=game.player;if(!p)return;const pad=14;ctx.save();ctx.fillStyle="rgba(5,8,23,.72)";ctx.fillRect(pad,pad,270,118);ctx.fillStyle="#fff";ctx.font="bold 16px Arial";ctx.textAlign="left";ctx.fillText(`Wave ${game.wave} • ${game.mode.toUpperCase()}`,pad+10,pad+22);ctx.font="13px Arial";ctx.fillText(`Level ${game.runLevel} • Rerolls ${game.rerolls} • Luck ${(save.luck+game.tempLuck).toFixed(2)}×`,pad+10,pad+43);drawBar(pad+10,pad+52,245,13,p.hp/p.maxHp,"#63ff8b",`HP ${Math.ceil(p.hp)}/${Math.ceil(p.maxHp)}`);if(p.shield>0)drawBar(pad+10,pad+70,245,8,Math.min(1,p.shield/100),"#7dfcff","");drawBar(pad+10,pad+84,245,11,game.xp/game.xpNeed,"#a77dff",`XP ${Math.floor(game.xp)}/${game.xpNeed}`);ctx.fillStyle="#c7d4ff";ctx.fillText(`Dash ${p.dashTimer<=0?"READY":p.dashTimer.toFixed(1)} • Ability ${p.abilityTimer<=0?"READY":p.abilityTimer.toFixed(1)}`,pad+10,pad+112);
    const boss=game.enemies.find(e=>e.boss&&!e.dead);if(boss){const w=Math.min(innerWidth*.62,720),x=(innerWidth-w)/2,y=18;ctx.fillStyle="#130716";ctx.fillRect(x,y,w,20);ctx.fillStyle=boss.color;ctx.fillRect(x,y,w*clamp(boss.hp/boss.maxHp,0,1),20);ctx.strokeStyle="#fff";ctx.strokeRect(x,y,w,20);ctx.fillStyle="#fff";ctx.font="bold 14px Arial";ctx.textAlign="center";ctx.fillText(boss.name,innerWidth/2,y+15);}
    ctx.restore();}
  function drawBar(x,y,w,h,ratio,color,label){ctx.fillStyle="#0b1024";ctx.fillRect(x,y,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w*clamp(ratio,0,1),h);ctx.strokeStyle="#53689c";ctx.strokeRect(x,y,w,h);if(label){ctx.fillStyle="#fff";ctx.font="10px Arial";ctx.textAlign="center";ctx.fillText(label,x+w/2,y+h-2);ctx.textAlign="left";}}
  function drawMinimap(){const expanded=save.settings.minimapExpanded,w=expanded?260:150,h=expanded?180:105,corner=save.settings.minimapCorner||"top-right",m=14,x=corner.includes("right")?innerWidth-w-m:m,y=corner.includes("bottom")?innerHeight-h-m:m;ctx.save();ctx.fillStyle="rgba(3,6,18,.74)";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#4f6fb8";ctx.strokeRect(x,y,w,h);const sx=w/game.world.w,sy=h/game.world.h;ctx.fillStyle="#7dfcff";ctx.beginPath();ctx.arc(x+game.player.x*sx,y+game.player.y*sy,3,0,TAU);ctx.fill();for(const e of game.enemies){if(e.dead)continue;if(!expanded&&!e.boss&&!e.elite&&!e.support)continue;ctx.fillStyle=e.boss?"#ff2f88":e.elite?"#ffde59":e.support?"#63ff9c":"#ff6b6b";ctx.fillRect(x+e.x*sx-1,y+e.y*sy-1,e.boss?5:3,e.boss?5:3);}ctx.restore();drawOffscreenIndicators();}
  function drawOffscreenIndicators(){for(const e of game.enemies){if(e.dead||(!e.boss&&!e.elite&&!e.support))continue;const s=worldToScreen(e.x,e.y);if(s.x>=0&&s.x<=innerWidth&&s.y>=0&&s.y<=innerHeight)continue;const cx=innerWidth/2,cy=innerHeight/2,a=Math.atan2(s.y-cy,s.x-cx),rx=innerWidth/2-28,ry=innerHeight/2-28,x=cx+Math.cos(a)*Math.min(rx,Math.abs(rx/Math.cos(a))),y=cy+Math.sin(a)*Math.min(ry,Math.abs(ry/Math.sin(a)));ctx.save();ctx.translate(clamp(x,24,innerWidth-24),clamp(y,24,innerHeight-24));ctx.rotate(a);ctx.fillStyle=e.boss?"#ff2f88":e.support?"#63ff9c":"#ffde59";ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-8,-7);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();ctx.restore();}}
  function drawBanner(){if(game.banner.life<=0)return;game.banner.life-=1/60;ctx.save();ctx.globalAlpha=clamp(game.banner.life,0,1);ctx.textAlign="center";ctx.fillStyle=game.banner.color;ctx.shadowBlur=20;ctx.shadowColor=game.banner.color;ctx.font="bold 38px Arial";ctx.fillText(game.banner.text,innerWidth/2,innerHeight*.22);ctx.font="17px Arial";ctx.fillStyle="#fff";ctx.fillText(game.banner.sub||"",innerWidth/2,innerHeight*.22+28);ctx.restore();}

  // ============================================================
  // ECONOMY / RECAP / PROGRESSION UNLOCKS
  // ============================================================
  function unlockMilestoneContent(){
    const milestones=[
      [8,["SPARK","TWIN_DAGGERS"],["CRITICAL"]],
      [15,["RPG","FROST_SHARDS","BOOMERANG"],["PIERCE"]],
      [25,["RAILGUN","ORBIT","THERMAL_BEACON"],["ECHO","COMBUSTION"]],
      [40,["FLAMER","THUNDER_ROD","SENTRY_DRONE"],["CHAIN","FROST","VENOM"]],
      [50,["NOVABURST","BLADE_HALO","GRAVITY_WELL"],["ORBIT","BLOOD"]],
      [75,["SOLAR_LANCE","PHOENIX_DRONE","CHRONO_MINE"],["ENGINEER","WARD"]],
      [100,["BLACK_HOLE","MIRROR_CANNON","REAPER_SCYTHE"],["VAMPIRE","SECOND_CHANCE"]],
      [150,["JUDGMENT","SINGULARITY_CROWN"],["DIVINITY"]]
    ];
    let changed=false;
    for(const [wave,weapons,books] of milestones){if(game.wave>=wave){for(const id of weapons)if(WEAPONS[id]&&!save.unlockedWeapons.includes(id)){save.unlockedWeapons.push(id);changed=true;}for(const id of books)if(BOOKS[id]&&!save.unlockedBooks.includes(id)){save.unlockedBooks.push(id);changed=true;}}}
    if(changed)persist();
  }
  function calculateCoins(reason){
    const w=Math.max(1,game.wave),mode=game.mode==="chaos"?1.75:1;
    let coins=Math.floor((Math.pow(w,1.38)*1.55+game.runStats.bosses*18+game.runStats.elites*1.5)*mode);
    if(w>=50)coins+=120;if(w>=100)coins+=350;if(game.mode==="chaos"&&w>=200)coins+=2200;if(game.postCreator)coins+=Math.max(0,w-200)*22;
    if(reason==="fake-victory")coins+=500;if(reason==="true-victory")coins+=1800;
    coins+=Math.max(0,game.rerolls)*3;
    return Math.max(0,coins);
  }
  function endRun(reason="death"){
    if(!game.player||["menu","recap"].includes(game.state))return;
    const coins=game.dev?0:calculateCoins(reason),duration=Math.max(0,nowSec()-game.runStats.startTime);
    if(!game.dev){save.coins+=coins;save.totalRuns++;save.totalKills+=0;save.totalPlaySeconds+=duration;if(game.mode==="normal")save.bestNormal=Math.max(save.bestNormal,game.wave);else save.bestChaos=Math.max(save.bestChaos,game.wave);if(game.postCreator)save.bestPostCreator=Math.max(save.bestPostCreator,game.wave);const charKey=save.selectedCharacter+"_BEST";save.records[charKey]=Math.max(save.records[charKey]||0,game.wave);save.records.DAMAGE_PREVENTED=(save.records.DAMAGE_PREVENTED||0)+Math.floor(game.runStats.prevented);persist();}
    game.state="recap";resetInputs();updateMobileUI();const top=Object.entries(game.runStats.weaponDamage).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,v])=>`<div class="nbs-stat"><b>${escapeHtml(WEAPONS[id]?.name||id)}</b><br>${fmt(v)} damage</div>`).join("");
    showOverlay(`<div class="nbs-panel"><h2 class="nbs-center">${reason==="death"?"RUN OVER":reason.includes("victory")?"VICTORY":"RUN ENDED"}</h2><div class="nbs-grid"><div class="nbs-stat"><b>Wave</b><br>${game.wave} ${game.mode.toUpperCase()}</div><div class="nbs-stat"><b>Time</b><br>${Math.floor(duration/60)}m ${Math.floor(duration%60)}s</div><div class="nbs-stat"><b>Kills</b><br>${game.runStats.kills}</div><div class="nbs-stat"><b>Bosses / Elites</b><br>${game.runStats.bosses} / ${game.runStats.elites}</div><div class="nbs-stat"><b>Total Damage</b><br>${fmt(game.runStats.damage)}</div><div class="nbs-stat"><b>Highest Hit</b><br>${fmt(game.runStats.highestHit)}</div><div class="nbs-stat"><b>Healing</b><br>${fmt(game.runStats.healing)}</div><div class="nbs-stat"><b>Coins Earned</b><br>${fmt(coins)}</div></div><h3>Weapon Damage</h3><div class="nbs-grid">${top||`<div class="nbs-stat">No weapon damage recorded.</div>`}</div><p class="nbs-center nbs-small">Final damage source: ${escapeHtml(game.runStats.finalSource)}</p><div class="nbs-row">${button("Main Menu","main","good")}</div></div>`);
  }

  // ============================================================
  // MAIN UPDATE LOOP
  // ============================================================
  function update(dt,time){
    if(game.state!=="playing")return;
    game.elapsed+=dt;unlockMilestoneContent();
    for(const w of game.weapons)if(w.disabled>0)w.disabled=Math.max(0,w.disabled-dt);
    updatePlayer(dt);fireWeapons(dt,time);updateEnemies(dt);updateProjectiles(dt);updateZones(dt);updateTraps(dt);updateGems(dt);updateParticles(dt);updateCamera(dt);updateWaveDirector(dt);processRewardQueue();
    game.enemies=game.enemies.filter(e=>!e.dead);
  }
  function frame(ms){
    const time=ms/1000,dt=Math.min(.033,Math.max(0,time-(game.lastFrame||time)));game.lastFrame=time;
    if(game.state==="playing")update(dt,time);else updateParticles(dt*.2);
    draw();requestAnimationFrame(frame);
  }

  // ============================================================
  // DEVELOPER CONSOLE
  // ============================================================
  function openDevConsole(){
    const pw=prompt("Developer password");if(pw!=="Neondevshooterdoggoz")return;
    const cmd=(prompt("Commands: coins, unlockall, wave50, wave100, wave200, god, clear, reset")||"").toLowerCase();
    if(cmd==="coins"){save.coins+=10000;persist();alert("+10,000 coins");}
    if(cmd==="unlockall"){save.ownedCharacters=Object.keys(CHARACTERS);save.revealedCharacters=Object.keys(CHARACTERS);save.unlockedWeapons=Object.keys(WEAPONS);save.unlockedBooks=Object.keys(BOOKS);save.chaosUnlocked=true;persist();alert("Unlocked all content");}
    if(cmd==="wave50"||cmd==="wave100"||cmd==="wave200"){const w=Number(cmd.slice(4));if(w===200)save.chaosUnlocked=true;startRun(w===200?"chaos":"normal");game.dev=true;hideOverlay();game.startingBonus="DEV";game.wave=w;prepareWave();}
    if(cmd==="god"&&game.player){game.dev=true;game.player.hp=game.player.maxHp=999999;game.player.damage*=50;}
    if(cmd==="clear"&&game.player){for(const e of game.enemies)if(!e.boss)killEnemy(e,"DEV");}
    if(cmd==="reset"&&confirm("Reset V2 save?")){localStorage.removeItem(SAVE_KEY);location.reload();}
  }

  // ============================================================
  // FINAL SAFETY / ERROR SCREEN
  // ============================================================
  addEventListener("error",event=>{
    console.error("Neon Boss Shooter V2 error:",event.error||event.message);
    if(game.state==="menu")showOverlay(`<div class="nbs-panel nbs-center"><h2>Game Error</h2><p>${escapeHtml(event.message||"Unknown error")}</p><p class="nbs-small">Open the browser console for the line number.</p>${button("Reload","main")}</div>`);
  });

  showMainMenu();
  requestAnimationFrame(frame);
})();
