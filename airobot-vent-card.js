/*
 * Airobot Vent Card – Home Assistant Lovelace card for Airobot heat recovery
 * ventilation units (L, L5, S1, S2, V3, V4, V6, V8) connected over Modbus TCP.
 * Languages: Estonian, English (follows HA language, or `language: et|en`).
 * MIT License
 */
const CARD_VERSION = "0.4.0";

const DEFAULTS = {
  theme: "auto", // auto | light | dark
  language: "auto", // auto | et | en
  mode_auto_option: "Automaatne",
  mode_manual_option: "Käsitsi",
  room_co2_limit: 1200,
  entities: {
    outdoor_temp: "sensor.airobot_valisohu_temperatuur",
    supply_temp: "sensor.airobot_sissepuhke_temperatuur",
    extract_temp: "sensor.airobot_valjatombe_temperatuur",
    exhaust_temp: "sensor.airobot_heitohu_temperatuur",
    supply_level: "sensor.airobot_sissepuhke_ventilaatori_tase",
    exhaust_level: "sensor.airobot_valjatombe_ventilaatori_tase",
    supply_rpm: "sensor.airobot_sissepuhke_ventilaatori_poorded",
    exhaust_rpm: "sensor.airobot_valjatombe_ventilaatori_poorded",
    supply_airflow: null,
    exhaust_airflow: null,
    airflow: "sensor.airobot_ohuhulk",
    efficiency: "sensor.airobot_seadme_kasutegur",
    power: "sensor.konkukilp_ventilatsioon_power",
    co2: "sensor.airobot_co2",
    co2_setpoint: "number.airobot_co2_seadepunkt",
    humidity: "sensor.airobot_valjatombe_niiskus",
    humidity_setpoint: "number.airobot_niiskuse_seadepunkt",
    voc: "sensor.airobot_voc_indeks",
    voc_setpoint: "sensor.airobot_reg_voc_seadepunkt",
    pm25: "sensor.airobot_pm2_5",
    pm25_setpoint: "sensor.airobot_reg_pm2_5_seadepunkt",
    mode: "select.airobot_reziim",
    manual_level: "number.airobot_kasitsi_tase",
    boost: "switch.airobot_boost",
    overpressure: "switch.airobot_ulerohk",
    power_switch: "switch.airobot_toide",
    preheater: "binary_sensor.airobot_eelsoojendi_sees",
    bypass: "binary_sensor.airobot_bypass_avatud",
    filter_age: "sensor.airobot_filtri_vanus",
    filter_interval: "sensor.airobot_filtri_intervall",
    filter_alert: "binary_sensor.airobot_filtri_vahetus",
  },
  rooms: [],
};

const PALETTE = {
  light: {
    bg: "#FFFFFF", panel: "#F6F7F9", panel2: "#EEF1F4", line: "#DDE2E8", text: "#1B1F24", muted: "#5B6470",
    cold: "#2563A8", coldText: "#34506E", warm: "#C2531B", warmText: "#7A3A17", flowDash: "#FFFFFF",
    schemBg: "#F6F7F9", coldBg: "#E9F0F8", warmBg: "#FBEEE6", hub: "#FFFFFF", hubLine: "#D5DAE0",
    toggleBg: "#B8F5A8", toggleOn: "#1B1F24", toggleOnText: "#FFFFFF", toggleOffText: "#2D5A27",
    actOn: "#1B1F24", actOnText: "#FFFFFF", actOff: "#EEF1F4", actOffText: "#1B1F24",
    good: "#2E7D4F", warn: "#B26A00", bad: "#B3261E", badge: "#EEF1F4",
  },
  dark: {
    bg: "#212428", panel: "#2A2E33", panel2: "#2E3237", line: "#33373D", text: "#ECEEF0", muted: "#9AA3AD",
    cold: "#6FA8E8", coldText: "#8FC1F2", warm: "#F08A5D", warmText: "#F4A882", flowDash: "#1A1C1F",
    schemBg: "#1A1C1F", coldBg: "#1A1C1F", warmBg: "#1A1C1F", hub: "#2E3237", hubLine: "#3A3F46",
    toggleBg: "#B8F5A8", toggleOn: "#17191C", toggleOnText: "#ECEEF0", toggleOffText: "#2D5A27",
    actOn: "#ECEEF0", actOnText: "#17191C", actOff: "#17191C", actOffText: "#ECEEF0",
    good: "#8FD97C", warn: "#F2C14E", bad: "#FF8A80", badge: "#17191C",
  },
};

const ICON = {
  over: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16V8"/><path d="M8.5 11.5L12 8l3.5 3.5"/></svg>',
  boost: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h16a3 3 0 1 1-3 3"/><path d="M3 16h7"/></svg>',
  pause: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 6v12"/><path d="M15 6v12"/></svg>',
};


const I18N = {
  et: {
    title: "Ventilatsioon",
    err_no_config: "Seadistus puudub",
    err_room: (i) => `rooms[${i}]: "entity" on kohustuslik`,
    info_pause: "Paus – ventilatsioon seisab. Ära jäta seadet pikalt seisma.",
    info_boost: "Õhutus – täiskiirus, lõpeb seadme taimeri järgi",
    info_over: "Ülerõhk – väljatõmme aeglasem, lõpeb seadme taimeri järgi",
    info_manual: "Käsitsi juhtimine – tase püsib, kuni muudad",
    info_co2: "CO₂ üle piiri – Airobot tõstab taset",
    info_rh: "Niiskus üle piiri – Airobot tõstab taset",
    info_ok: "Õhk on puhas – Airobot hoiab madalat taset",
    filter_replace: "Filter: vaheta!",
    filter_days: (d) => `Filter ${d} p`,
    preheater_on: "Eelsoojendi sees", preheater_off: "Eelsoojendi väljas",
    bypass_on: "Bypass avatud", bypass_off: "Bypass suletud",
    outside: "VÄLJAS", inside: "TOAS",
    outdoor: "Välisõhk", exhaust: "Heitõhk", extract: "Väljatõmme", supply: "Sissepuhe",
    level: "tase", schematic: "Ventilatsiooni skeem",
    auto: "Auto", manual: "Käsitsi",
    overpressure: "Ülerõhk", boost: "Õhutus", pause: "Paus",
    dec: "Vähenda taset", inc: "Suurenda taset", level_aria: (l) => `Tase ${l} / 10`,
    rooms: "Toad", humidity_short: "RH", rpm: "p/min",
    // redaktor
    g_rooms: "Toad (toaandurite CO₂)", g_temps: "Temperatuurid", g_fans: "Ventilaatorid ja energia",
    g_control: "Juhtimine", g_air: "Õhukvaliteet", g_status: "Olekud ja filter", g_advanced: "Täpsemalt",
    f_name: "Pealkiri", f_theme: "Teema", f_language: "Keel",
    f_room_entities: "Toaandurid (CO₂)", f_room_co2_limit: "Tubade CO₂ piir",
    f_mode_auto_option: "Režiimi valiku nimi: automaatne", f_mode_manual_option: "Režiimi valiku nimi: käsitsi",
    o_theme_auto: "Automaatne (HA teema järgi)", o_light: "Hele", o_dark: "Tume",
    o_lang_auto: "Automaatne (HA keele järgi)",
    h_rooms: "Plokk „Toad“ on kaardil ainult siis, kui siia on lisatud vähemalt üks andur.",
    h_mode_auto: "Režiimi olemi (select) valik, mis tähendab automaatset režiimi.",
    h_entity: "Tühjaks jäetud väli peidab vastava osa kaardilt.",
    h_name: "Tühi = vaikimisi pealkiri valitud keeles.",
    e_outdoor_temp: "Välisõhk", e_supply_temp: "Sissepuhe", e_extract_temp: "Väljatõmme (toaõhk)", e_exhaust_temp: "Heitõhk",
    e_supply_level: "Sissepuhke ventilaatori tase (0–10)", e_exhaust_level: "Väljatõmbe ventilaatori tase (0–10)",
    e_supply_rpm: "Sissepuhke ventilaatori pöörded", e_exhaust_rpm: "Väljatõmbe ventilaatori pöörded",
    e_supply_airflow: "Sissepuhke õhuhulk (m³/h)", e_exhaust_airflow: "Väljatõmbe õhuhulk (m³/h)",
    e_airflow: "Õhuhulk (m³/h)", e_efficiency: "Soojustagastuse kasutegur (%)", e_power: "Elektritarve (W)",
    e_mode: "Režiim (Auto / Käsitsi)", e_manual_level: "Käsitsi tase", e_boost: "Õhutus (boost)",
    e_overpressure: "Ülerõhk (kamin)", e_power_switch: "Toide (Paus)",
    e_co2: "CO₂", e_co2_setpoint: "CO₂ seadepunkt", e_humidity: "Niiskus", e_humidity_setpoint: "Niiskuse seadepunkt",
    e_voc: "VOC indeks", e_voc_setpoint: "VOC seadepunkt", e_pm25: "PM2.5", e_pm25_setpoint: "PM2.5 seadepunkt",
    e_preheater: "Eelsoojendi sees", e_bypass: "Bypass avatud", e_filter_age: "Filtri vanus (h)",
    e_filter_interval: "Filtri vahetusintervall (h)", e_filter_alert: "Filtri vahetuse hoiatus",
  },
  en: {
    title: "Ventilation",
    err_no_config: "Missing configuration",
    err_room: (i) => `rooms[${i}]: "entity" is required`,
    info_pause: "Paused – ventilation stopped. Do not leave the unit off for long.",
    info_boost: "Boost – full speed, ends on the unit's timer",
    info_over: "Overpressure – extract slowed, ends on the unit's timer",
    info_manual: "Manual control – level stays until you change it",
    info_co2: "CO₂ above limit – Airobot is raising the level",
    info_rh: "Humidity above limit – Airobot is raising the level",
    info_ok: "Air is clean – Airobot keeps a low level",
    filter_replace: "Filter: replace!",
    filter_days: (d) => `Filter ${d} d`,
    preheater_on: "Preheater on", preheater_off: "Preheater off",
    bypass_on: "Bypass open", bypass_off: "Bypass closed",
    outside: "OUTSIDE", inside: "INSIDE",
    outdoor: "Outdoor", exhaust: "Exhaust", extract: "Extract", supply: "Supply",
    level: "level", schematic: "Ventilation schematic",
    auto: "Auto", manual: "Manual",
    overpressure: "Overpressure", boost: "Boost", pause: "Pause",
    dec: "Decrease level", inc: "Increase level", level_aria: (l) => `Level ${l} / 10`,
    rooms: "Rooms", humidity_short: "RH", rpm: "rpm",
    g_rooms: "Rooms (room CO₂ sensors)", g_temps: "Temperatures", g_fans: "Fans and energy",
    g_control: "Control", g_air: "Air quality", g_status: "Status and filter", g_advanced: "Advanced",
    f_name: "Title", f_theme: "Theme", f_language: "Language",
    f_room_entities: "Room sensors (CO₂)", f_room_co2_limit: "Room CO₂ limit",
    f_mode_auto_option: "Mode option name: automatic", f_mode_manual_option: "Mode option name: manual",
    o_theme_auto: "Automatic (follow HA theme)", o_light: "Light", o_dark: "Dark",
    o_lang_auto: "Automatic (follow HA language)",
    h_rooms: "The Rooms section is shown only when at least one sensor is added here.",
    h_mode_auto: "The mode entity (select) option that means automatic mode.",
    h_entity: "Leave empty to hide this part of the card.",
    h_name: "Empty = default title in the selected language.",
    e_outdoor_temp: "Outdoor air", e_supply_temp: "Supply air", e_extract_temp: "Extract air (room)", e_exhaust_temp: "Exhaust air",
    e_supply_level: "Supply fan level (0–10)", e_exhaust_level: "Extract fan level (0–10)",
    e_supply_rpm: "Supply fan speed (rpm)", e_exhaust_rpm: "Extract fan speed (rpm)",
    e_supply_airflow: "Supply airflow (m³/h)", e_exhaust_airflow: "Extract airflow (m³/h)",
    e_airflow: "Airflow (m³/h)", e_efficiency: "Heat recovery efficiency (%)", e_power: "Power consumption (W)",
    e_mode: "Mode (Auto / Manual)", e_manual_level: "Manual level", e_boost: "Boost",
    e_overpressure: "Overpressure (fireplace)", e_power_switch: "Power (Pause)",
    e_co2: "CO₂", e_co2_setpoint: "CO₂ setpoint", e_humidity: "Humidity", e_humidity_setpoint: "Humidity setpoint",
    e_voc: "VOC index", e_voc_setpoint: "VOC setpoint", e_pm25: "PM2.5", e_pm25_setpoint: "PM2.5 setpoint",
    e_preheater: "Preheater on", e_bypass: "Bypass open", e_filter_age: "Filter age (h)",
    e_filter_interval: "Filter replacement interval (h)", e_filter_alert: "Filter replacement alert",
  },
};
const langOf = (hass, cfg) => {
  const l = cfg?.language && cfg.language !== "auto" ? cfg.language : (hass?.locale?.language || hass?.language || navigator.language || "en");
  return String(l).toLowerCase().startsWith("et") ? "et" : "en";
};
const tr = (lang, k, ...a) => { const v = (I18N[lang] || I18N.en)[k] ?? I18N.en[k] ?? k; return typeof v === "function" ? v(...a) : v; };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

class AirobotVentCard extends HTMLElement {
  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    return document.createElement("airobot-vent-card-editor");
  }

  setConfig(config) {
    if (!config) throw new Error(tr(langOf(null, null), "err_no_config"));
    const rooms = Array.isArray(config.rooms) ? [...config.rooms] : [];
    rooms.forEach((r, i) => {
      if (!r || typeof r.entity !== "string") throw new Error(tr(langOf(null, config), "err_room", i));
    });
    // Visuaalse redaktori toaandurid: lihtne olemite nimekiri (nimi = olemi nimi)
    (Array.isArray(config.room_entities) ? config.room_entities : []).forEach((e) => {
      if (typeof e === "string" && e && !rooms.some((r) => r.entity === e)) rooms.push({ entity: e });
    });
    this._config = {
      ...DEFAULTS,
      ...config,
      entities: { ...DEFAULTS.entities, ...(config.entities || {}) },
      rooms,
    };
    this._lastKey = null;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    }
    if (this._hass) this._render(true);
  }

  set hass(hass) {
    this._hass = hass;
    this._render(false);
  }

  getCardSize() {
    return 9 + Math.ceil((this._config?.rooms?.length || 0) / 2);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  // ---------- helpers
  _t(k, ...a) { return tr(langOf(this._hass, this._config), k, ...a); }
  _id(key) { return this._config.entities[key]; }
  _st(key) { const id = this._id(key); return id ? this._hass.states[id] : undefined; }
  _has(key) { const s = this._st(key); return !!s && !["unavailable", "unknown"].includes(s.state); }
  _num(key) { const s = this._st(key); if (!s) return null; const n = parseFloat(s.state); return isNaN(n) ? null : n; }
  _on(key) { const s = this._st(key); return !!s && s.state === "on"; }
  _fmt(v, d = 0) {
    if (v === null || v === undefined) return "–";
    return Number(v).toLocaleString(this._hass?.locale?.language || "et", { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  _isDark() {
    const t = this._config.theme;
    if (t === "dark") return true;
    if (t === "light") return false;
    if (this._hass?.themes?.darkMode !== undefined) return !!this._hass.themes.darkMode;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  _state() {
    const c = this._config;
    const modeSt = this._st("mode");
    const powerOn = this._st("power_switch") ? this._on("power_switch") : true;
    const boost = this._on("boost");
    const over = this._on("overpressure");
    const isAuto = modeSt ? modeSt.state === c.mode_auto_option : true;
    const sup = this._num("supply_level");
    const ex = this._num("exhaust_level");
    return { powerOn, boost, over, isAuto, sup: powerOn ? sup : 0, ex: powerOn ? ex : 0, hasMode: !!modeSt };
  }

  _info(s) {
    if (!s.powerOn) return this._t("info_pause");
    if (s.boost) return this._t("info_boost");
    if (s.over) return this._t("info_over");
    if (!s.isAuto) return this._t("info_manual");
    const co2 = this._num("co2"), co2sp = this._num("co2_setpoint");
    if (co2 !== null && co2sp !== null && co2 > co2sp) return this._t("info_co2");
    const rh = this._num("humidity"), rhsp = this._num("humidity_setpoint");
    if (rh !== null && rhsp !== null && rh > rhsp) return this._t("info_rh");
    return this._t("info_ok");
  }

  // ---------- render
  _render(force) {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    const ids = [...Object.values(this._config.entities), ...this._config.rooms.map((r) => r.entity)].filter(Boolean);
    const key = ids.map((id) => { const s = this._hass.states[id]; return s ? s.state : "-"; }).join("|") + "|" + this._isDark() + "|" + langOf(this._hass, this._config);
    if (!force && key === this._lastKey) return;
    this._lastKey = key;

    const c = this._config;
    const p = PALETTE[this._isDark() ? "dark" : "light"];
    const s = this._state();
    const flow = (l) => (!l || l <= 0) ? "animation-play-state:paused;opacity:0" : `animation-duration:${(6 / l).toFixed(2)}s`;

    const t = (k) => this._fmt(this._num(k), 1) + "°";
    // kanali kiirus: tase · õhuhulk või pöörded
    const pill = (lvlKey, flowKey, rpmKey, lvl, x, y, col, more) => {
      if (lvl === null || lvl === undefined) return "";
      const flowV = s.powerOn ? this._num(flowKey) : null;
      const rpmV = s.powerOn ? this._num(rpmKey) : null;
      const extra = flowV !== null ? `${this._fmt(flowV, 0)} m³/h` : rpmV !== null ? `${this._fmt(rpmV, 0)} ${this._t("rpm")}` : "";
      const txt = `${this._fmt(lvl, 0)}${extra ? " · " + extra : ""}`;
      const w = Math.max(28, txt.length * 6.4 + 14);
      return `<g data-more="${esc(this._id(more) || "")}" style="cursor:pointer">
        <rect x="${x - w / 2}" y="${y - 11}" width="${w}" height="20" rx="10" fill="${p.hub}" stroke="${col}" stroke-width="1.5"/>
        <text class="num" x="${x}" y="${y + 3}" font-size="11" fill="${p.text}" text-anchor="middle">${esc(txt)}</text></g>`;
    };
    const eff = this._num("efficiency");
    const airflow = this._num("airflow");
    const power = this._num("power");

    // --- mõõtmised (ainult olemasolevad)
    const metrics = [
      ["co2", "co2_setpoint", "CO₂", "ppm", 0],
      ["humidity", "humidity_setpoint", this._t("humidity_short"), "%", 0],
      ["voc", "voc_setpoint", "VOC", "", 0],
      ["pm25", "pm25_setpoint", "PM2.5", "µg/m³", 0],
    ].filter(([k]) => this._has(k)).map(([k, spk, label, unit, d]) => {
      const v = this._num(k), sp = this._num(spk);
      const pct = sp ? Math.max(2, Math.min(100, (v / sp) * 100)) : 0;
      const col = sp && v > sp ? p.bad : sp && v > sp * 0.85 ? p.warn : p.good;
      return `<button class="metric" data-more="${esc(this._id(k))}" aria-label="${esc(label)} ${esc(this._fmt(v, d))} ${esc(unit)}">
        <span class="mlabel">${esc(label)}${sp !== null ? ` · ${esc(this._fmt(sp, 0))}` : ""}</span>
        <span class="mval">${esc(this._fmt(v, d))}${unit ? `<span class="munit"> ${esc(unit)}</span>` : ""}</span>
        ${sp ? `<span class="bar"><span style="width:${pct}%;background:${col}"></span></span>` : ""}
      </button>`;
    }).join("");

    // --- toad (ainult kui olemid on lisatud ja olemas)
    const rooms = c.rooms.filter((r) => this._hass.states[r.entity]).map((r) => {
      const st = this._hass.states[r.entity];
      const v = parseFloat(st.state);
      const name = r.name || String(st.attributes.friendly_name || r.entity).replace(/\s*(CO2|CO₂|carbon dioxide|süsihappegaas)\s*$/i, "");
      const lim = c.room_co2_limit;
      const pct = isNaN(v) ? 0 : Math.max(2, Math.min(100, (v / lim) * 100));
      const col = v > lim ? p.bad : v > lim * 0.85 ? p.warn : p.good;
      return `<button class="room" data-more="${esc(r.entity)}">
        <span class="rname">${esc(name)}</span>
        <span class="bar grow"><span style="width:${pct}%;background:${col}"></span></span>
        <span class="rval">${isNaN(v) ? "–" : esc(this._fmt(v, 0))}</span>
      </button>`;
    }).join("");

    // --- olekud
    const chips = [];
    if (power !== null) chips.push(`${this._fmt(power, 0)} W`);
    if (this._has("filter_age")) {
      const left = ((this._num("filter_interval") ?? 4320) - this._num("filter_age")) / 24;
      chips.push(this._on("filter_alert") ? this._t("filter_replace") : this._t("filter_days", this._fmt(Math.max(0, left), 0)));
    }
    const status = [];
    if (this._st("preheater")) status.push(this._t(this._on("preheater") ? "preheater_on" : "preheater_off"));
    if (this._st("bypass")) status.push(this._t(this._on("bypass") ? "bypass_on" : "bypass_off"));

    const lvl = this._num("manual_level");
    const segs = Array.from({ length: 10 }, (_, i) => `<span class="seg" style="background:${lvl !== null && i < lvl ? p.cold : p.line}"></span>`).join("");
    const showStepper = s.hasMode && !s.isAuto && !s.boost && !s.over && s.powerOn && this._st("manual_level");

    const act = (on) => on ? `background:${p.actOn};color:${p.actOnText};font-weight:600` : `background:${p.actOff};color:${p.actOffText}`;
    const tog = (on) => on ? `background:${p.toggleOn};color:${p.toggleOnText};font-weight:600` : `background:transparent;color:${p.toggleOffText}`;

    this.shadowRoot.innerHTML = `
<style>
:host{display:block}
ha-card{background:${p.bg};color:${p.text};padding:16px;display:flex;flex-direction:column;gap:12px;font-family:var(--ha-font-family-body, var(--paper-font-body1_-_font-family, system-ui, sans-serif));border-radius:var(--ha-card-border-radius,16px)}
button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;padding:0;text-align:inherit}
button:focus-visible{outline:2px solid ${p.cold};outline-offset:2px}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.title{font-size:17px;font-weight:600}
.chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.chip{padding:4px 9px;border-radius:999px;background:${p.panel2};font-size:12px;color:${p.muted}}
.schem{position:relative;border-radius:14px;overflow:hidden;background:${p.schemBg}}
.schem svg{display:block;width:100%;height:auto}
.num{font-family:ui-monospace,"SF Mono","IBM Plex Mono",Menlo,monospace;font-variant-numeric:tabular-nums}
.flow{stroke-dasharray:4 20;animation:airflow linear infinite}
@keyframes airflow{to{stroke-dashoffset:-24}}
@media (prefers-reduced-motion:reduce){.flow{animation:none}}
.info{text-align:center;font-size:14px;color:${p.muted}}
.toggle{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:14px;background:${p.toggleBg}}
.toggle button{height:44px;border-radius:10px;text-align:center;font-size:15px}
.actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.actions button{height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px}
.stepper{display:flex;align-items:center;gap:12px}
.round{width:44px;height:44px;border-radius:50%;border:1px solid ${p.line} !important;background:${p.panel2} !important;font-size:22px;text-align:center !important}
.segs{flex:1;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px}
.seg{height:12px;border-radius:3px}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:6px}
.metric{display:flex;flex-direction:column;gap:4px;padding:10px;border-radius:12px;background:${p.panel}}
.mlabel{font-size:12px;color:${p.muted}}
.mval{font-size:20px}
.munit{font-size:12px;color:${p.muted}}
.bar{display:block;height:3px;border-radius:2px;background:${p.line};overflow:hidden}
.bar>span{display:block;height:3px;border-radius:2px}
.grow{flex:1}
.rooms{display:flex;flex-direction:column}
.rhead{display:flex;align-items:center;gap:8px;padding-bottom:6px;font-size:14px;font-weight:600}
.badge{padding:1px 7px;border-radius:6px;background:${p.badge};font-size:12px}
.rhead .unit{margin-left:auto;font-size:12px;font-weight:400;color:${p.muted}}
.room{display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid ${p.line};min-height:24px}
.rname{font-size:14px;width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rval{font-size:17px;width:48px;text-align:right;font-family:ui-monospace,"IBM Plex Mono",Menlo,monospace}
.status{display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:${p.muted}}
</style>
<ha-card>
  <div class="head">
    <div class="title">${esc(c.name || this._t("title"))}</div>
    <div class="chips">${chips.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>
  </div>

  <div class="schem">
    <svg viewBox="0 0 440 260" role="img" aria-label="${this._t("schematic")}">
      <rect x="0" y="0" width="220" height="260" fill="${p.coldBg}"/>
      <rect x="220" y="0" width="220" height="260" fill="${p.warmBg}"/>
      <text x="14" y="22" font-size="11" font-weight="600" letter-spacing="1" fill="${p.coldText}">${this._t("outside")}</text>
      <text x="426" y="22" font-size="11" font-weight="600" letter-spacing="1" fill="${p.warmText}" text-anchor="end">${this._t("inside")}</text>
      <path d="M92 80 H160 L280 184 H348" stroke="${p.cold}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/>
      <path d="M348 80 H280 L160 184 H92" stroke="${p.warm}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/>
      <path class="flow" d="M92 80 H160 L280 184 H348" stroke="${p.flowDash}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" style="${flow(s.sup)}"/>
      <path class="flow" d="M348 80 H280 L160 184 H92" stroke="${p.flowDash}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" style="${flow(s.ex)}"/>
      <g data-more="${esc(this._id("outdoor_temp"))}" style="cursor:pointer"><text x="14" y="52" font-size="12" fill="${p.coldText}">${this._t("outdoor")}</text><text class="num" x="14" y="76" font-size="22" fill="${p.text}">${t("outdoor_temp")}</text></g>
      <g data-more="${esc(this._id("exhaust_temp"))}" style="cursor:pointer"><text x="14" y="214" font-size="12" fill="${p.coldText}">${this._t("exhaust")}</text><text class="num" x="14" y="238" font-size="22" fill="${p.text}">${t("exhaust_temp")}</text></g>
      <g data-more="${esc(this._id("extract_temp"))}" style="cursor:pointer"><text x="426" y="52" font-size="12" fill="${p.warmText}" text-anchor="end">${this._t("extract")}</text><text class="num" x="426" y="76" font-size="22" fill="${p.text}" text-anchor="end">${t("extract_temp")}</text></g>
      <g data-more="${esc(this._id("supply_temp"))}" style="cursor:pointer"><text x="426" y="214" font-size="12" fill="${p.warmText}" text-anchor="end">${this._t("supply")}</text><text class="num" x="426" y="238" font-size="22" fill="${p.text}" text-anchor="end">${t("supply_temp")}</text></g>
      ${pill("supply_level", "supply_airflow", "supply_rpm", s.sup, 98, 110, p.cold, this._id("supply_rpm") ? "supply_rpm" : "supply_level")}
      ${pill("exhaust_level", "exhaust_airflow", "exhaust_rpm", s.ex, 342, 110, p.warm, this._id("exhaust_rpm") ? "exhaust_rpm" : "exhaust_level")}
      <circle cx="220" cy="132" r="58" fill="${p.hub}" stroke="${p.hubLine}" stroke-width="2"/>
      <text class="num" x="220" y="140" font-size="44" fill="${p.text}" text-anchor="middle">${s.sup === null ? "–" : esc(this._fmt(s.sup, 0))}</text>
      <text class="num" x="220" y="160" font-size="12" fill="${p.muted}" text-anchor="middle">${airflow !== null && s.powerOn ? esc(this._fmt(airflow, 0)) + " m³/h" : this._t("level")}</text>
      ${eff !== null ? `<text x="220" y="176" font-size="11" fill="${p.muted}" text-anchor="middle">η ${esc(this._fmt(eff, 0))} %</text>` : ""}
    </svg>
  </div>

  <div class="info">${esc(this._info(s))}</div>

  ${s.hasMode ? `<div class="toggle">
    <button data-mode="auto" aria-pressed="${s.isAuto}" style="${tog(s.isAuto)}">${this._t("auto")}</button>
    <button data-mode="manual" aria-pressed="${!s.isAuto}" style="${tog(!s.isAuto)}">${this._t("manual")}</button>
  </div>` : ""}

  <div class="actions">
    ${this._st("overpressure") ? `<button data-act="overpressure" aria-pressed="${s.over}" style="${act(s.over)}">${ICON.over}<span>${this._t("overpressure")}</span></button>` : ""}
    ${this._st("boost") ? `<button data-act="boost" aria-pressed="${s.boost}" style="${act(s.boost)}">${ICON.boost}<span>${this._t("boost")}</span></button>` : ""}
    ${this._st("power_switch") ? `<button data-act="pause" aria-pressed="${!s.powerOn}" style="${act(!s.powerOn)}">${ICON.pause}<span>${this._t("pause")}</span></button>` : ""}
  </div>

  ${showStepper ? `<div class="stepper">
    <button class="round" data-step="-1" aria-label="${this._t("dec")}">−</button>
    <div class="segs" role="img" aria-label="${this._t("level_aria", lvl ?? "–")}">${segs}</div>
    <button class="round" data-step="1" aria-label="${this._t("inc")}">+</button>
  </div>` : ""}

  ${metrics ? `<div class="metrics">${metrics}</div>` : ""}

  ${rooms ? `<div class="rooms">
    <div class="rhead"><span>${esc(this._t("rooms"))}</span><span class="badge">${esc(c.room_co2_limit)}</span><span class="unit">CO₂ ppm</span></div>
    ${rooms}
  </div>` : ""}

  ${status.length ? `<div class="status">${status.map((x) => `<span>${esc(x)}</span>`).join("<span>·</span>")}</div>` : ""}
</ha-card>`;
  }

  // ---------- tegevused
  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.mode || n.dataset.act || n.dataset.step || n.dataset.more));
    if (!el) return;
    const d = el.dataset;
    const c = this._config;
    if (d.mode) {
      const option = d.mode === "auto" ? c.mode_auto_option : c.mode_manual_option;
      this._call("select", "select_option", { entity_id: this._id("mode"), option });
    } else if (d.act === "boost" || d.act === "overpressure") {
      this._call("switch", "toggle", { entity_id: this._id(d.act) });
    } else if (d.act === "pause") {
      this._call("switch", this._on("power_switch") ? "turn_off" : "turn_on", { entity_id: this._id("power_switch") });
    } else if (d.step) {
      const cur = this._num("manual_level") ?? 5;
      const value = Math.max(0, Math.min(10, cur + parseInt(d.step, 10)));
      this._call("number", "set_value", { entity_id: this._id("manual_level"), value });
    } else if (d.more) {
      const e = new Event("hass-more-info", { bubbles: true, composed: true });
      e.detail = { entityId: d.more };
      this.dispatchEvent(e);
    }
  }

  _call(domain, service, data) {
    if (!data.entity_id) return;
    this._hass.callService(domain, service, data).catch((err) => {
      const e = new Event("hass-notification", { bubbles: true, composed: true });
      e.detail = { message: `Airobot: ${err.message || err}` };
      this.dispatchEvent(e);
    });
  }
}

customElements.define("airobot-vent-card", AirobotVentCard);

// ---------------------------------------------------------------------------
// Visuaalne redaktor
// ---------------------------------------------------------------------------
const ENT = (domain, extra = {}) => ({ entity: { domain, ...extra } });
const EDITOR_GROUPS = [
  { key: "g_temps", icon: "mdi:thermometer", fields: [
    ["outdoor_temp", ENT("sensor", { device_class: "temperature" })],
    ["supply_temp", ENT("sensor", { device_class: "temperature" })],
    ["extract_temp", ENT("sensor", { device_class: "temperature" })],
    ["exhaust_temp", ENT("sensor", { device_class: "temperature" })],
  ] },
  { key: "g_fans", icon: "mdi:fan", fields: [
    ["supply_level", ENT("sensor")], ["exhaust_level", ENT("sensor")],
    ["supply_rpm", ENT("sensor")], ["exhaust_rpm", ENT("sensor")],
    ["supply_airflow", ENT("sensor")], ["exhaust_airflow", ENT("sensor")], ["airflow", ENT("sensor")],
    ["efficiency", ENT("sensor")], ["power", ENT("sensor", { device_class: "power" })],
  ] },
  { key: "g_control", icon: "mdi:tune-variant", fields: [
    ["mode", ENT(["select", "input_select"])], ["manual_level", ENT(["number", "input_number"])],
    ["boost", ENT(["switch", "input_boolean"])], ["overpressure", ENT(["switch", "input_boolean"])],
    ["power_switch", ENT(["switch", "input_boolean"])],
  ] },
  { key: "g_air", icon: "mdi:air-filter", fields: [
    ["co2", ENT("sensor")], ["co2_setpoint", ENT(["number", "sensor", "input_number"])],
    ["humidity", ENT("sensor")], ["humidity_setpoint", ENT(["number", "sensor", "input_number"])],
    ["voc", ENT("sensor")], ["voc_setpoint", ENT(["number", "sensor", "input_number"])],
    ["pm25", ENT("sensor")], ["pm25_setpoint", ENT(["number", "sensor", "input_number"])],
  ] },
  { key: "g_status", icon: "mdi:information-outline", fields: [
    ["preheater", ENT("binary_sensor")], ["bypass", ENT("binary_sensor")], ["filter_age", ENT("sensor")],
    ["filter_interval", ENT("sensor")], ["filter_alert", ENT("binary_sensor")],
  ] },
];
const EKEY = (k) => "e__" + k;

class AirobotVentCardEditor extends HTMLElement {
  _t(k, ...a) { return tr(langOf(this._hass, this._config), k, ...a); }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    else this._render();
  }

  async connectedCallback() {
    // ha-form laaditakse HA-s laisalt – tagame, et see on olemas
    if (!customElements.get("ha-form") && window.loadCardHelpers) {
      try { const h = await window.loadCardHelpers(); await h.createCardElement({ type: "entities", entities: [] }).constructor.getConfigElement?.(); } catch (e) { /* ignore */ }
    }
    this._render();
  }

  _schema() {
    return [
      { name: "name", selector: { text: {} } },
      { name: "theme", selector: { select: { mode: "dropdown", options: [
        { value: "auto", label: this._t("o_theme_auto") },
        { value: "light", label: this._t("o_light") },
        { value: "dark", label: this._t("o_dark") },
      ] } } },
      { name: "language", selector: { select: { mode: "dropdown", options: [
        { value: "auto", label: this._t("o_lang_auto") },
        { value: "et", label: "Eesti" },
        { value: "en", label: "English" },
      ] } } },
      { type: "expandable", name: "", flatten: true, title: this._t("g_rooms"), icon: "mdi:home-thermometer", schema: [
        { name: "room_entities", selector: { entity: { domain: "sensor", multiple: true } } },
        { name: "room_co2_limit", selector: { number: { min: 400, max: 5000, step: 50, mode: "box", unit_of_measurement: "ppm" } } },
      ] },
      ...EDITOR_GROUPS.map((g) => ({
        type: "expandable", name: "", flatten: true, title: this._t(g.key), icon: g.icon,
        schema: g.fields.map(([k, sel]) => ({ name: EKEY(k), selector: sel })),
      })),
      { type: "expandable", name: "", flatten: true, title: this._t("g_advanced"), icon: "mdi:cog", schema: [
        { name: "mode_auto_option", selector: { text: {} } },
        { name: "mode_manual_option", selector: { text: {} } },
      ] },
    ];
  }

  _data() {
    const c = this._config || {};
    const ents = { ...DEFAULTS.entities, ...(c.entities || {}) };
    const d = {
      name: c.name ?? "",
      theme: c.theme ?? DEFAULTS.theme,
      language: c.language ?? DEFAULTS.language,
      room_entities: [...(c.room_entities || []), ...((c.rooms || []).map((r) => r.entity))],
      room_co2_limit: c.room_co2_limit ?? DEFAULTS.room_co2_limit,
      mode_auto_option: c.mode_auto_option ?? DEFAULTS.mode_auto_option,
      mode_manual_option: c.mode_manual_option ?? DEFAULTS.mode_manual_option,
    };
    Object.keys(DEFAULTS.entities).forEach((k) => { d[EKEY(k)] = ents[k] || ""; });
    return d;
  }

  _label(s) {
    if (s.name && s.name.startsWith("e__")) return this._t("e_" + s.name.slice(3));
    if (s.name) return this._t("f_" + s.name);
    return s.title;
  }

  _helper(s) {
    if (s.name && s.name.startsWith("e__")) return this._t("h_entity");
    return { room_entities: this._t("h_rooms"), mode_auto_option: this._t("h_mode_auto"), name: this._t("h_name") }[s.name];
  }

  _changed(ev) {
    ev.stopPropagation();
    const v = ev.detail.value;
    const prev = this._config || {};
    const cfg = { type: prev.type || "custom:airobot-vent-card" };
    if (v.name) cfg.name = v.name;
    if (v.theme && v.theme !== DEFAULTS.theme) cfg.theme = v.theme;
    if (v.language && v.language !== DEFAULTS.language) cfg.language = v.language;
    if (v.mode_auto_option && v.mode_auto_option !== DEFAULTS.mode_auto_option) cfg.mode_auto_option = v.mode_auto_option;
    if (v.mode_manual_option && v.mode_manual_option !== DEFAULTS.mode_manual_option) cfg.mode_manual_option = v.mode_manual_option;
    if (v.room_co2_limit && Number(v.room_co2_limit) !== DEFAULTS.room_co2_limit) cfg.room_co2_limit = Number(v.room_co2_limit);
    // toad: säilita YAML-is antud nimed, uued lisanduvad room_entities alla
    const chosen = (v.room_entities || []).filter(Boolean);
    const named = (prev.rooms || []).filter((r) => chosen.includes(r.entity));
    const plain = chosen.filter((e) => !named.some((r) => r.entity === e));
    if (named.length) cfg.rooms = named;
    if (plain.length) cfg.room_entities = plain;
    // olemid: salvesta ainult vaikimisi väärtusest erinevad; tühi = null (peidetud)
    const ents = {};
    Object.keys(DEFAULTS.entities).forEach((k) => {
      const val = v[EKEY(k)];
      if (!val) ents[k] = null;
      else if (val !== DEFAULTS.entities[k]) ents[k] = val;
    });
    if (Object.keys(ents).length) cfg.entities = ents;
    // muud võtmed (nt grid_options) jäävad alles
    Object.keys(prev).forEach((k) => {
      if (!["type", "name", "theme", "language", "mode_auto_option", "mode_manual_option", "room_co2_limit", "rooms", "room_entities", "entities"].includes(k)) cfg[k] = prev[k];
    });
    this._config = cfg;
    if (this._form) { this._form.schema = this._schema(); this._form.data = this._data(); }
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
  }

  _render() {
    if (!this._config) return;
    if (!customElements.get("ha-form")) {
      if (!this._waiting) {
        this._waiting = true;
        customElements.whenDefined("ha-form").then(() => { this._waiting = false; this._render(); });
      }
      return;
    }
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => this._label(s);
      this._form.computeHelper = (s) => this._helper(s);
      this._form.addEventListener("value-changed", (ev) => this._changed(ev));
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = this._data();
  }
}

customElements.define("airobot-vent-card-editor", AirobotVentCardEditor);


window.customCards = window.customCards || [];
window.customCards.push({
  type: "airobot-vent-card",
  name: "Airobot Vent Card",
  description: "Airobot heat recovery ventilation card: animated schematic, modes, air quality and room CO₂ sensors (Estonian / English).",
  preview: true,
  documentationURL: "https://github.com/kaimo123/airobot-vent-card",
});

console.info(`%c AIROBOT-VENT-CARD %c ${CARD_VERSION} `, "color:#fff;background:#2563A8;font-weight:600", "color:#2563A8;background:#fff");
