/*
 * Airobot Vent Card – Home Assistant Lovelace card for Airobot heat recovery
 * ventilation units (L, L5, S1, S2, V3, V4, V6, V8) connected over Modbus TCP.
 * Languages: Estonian, English (follows HA language, or `language: et|en`).
 * MIT License
 */
const CARD_VERSION = "0.12.0";

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
    moisture_recovery: "sensor.airobot_niiskustagastus",
    power: "sensor.konkukilp_ventilatsioon_power",
    co2: "sensor.airobot_co2",
    co2_setpoint: "number.airobot_co2_seadepunkt",
    humidity: "sensor.airobot_valjatombe_niiskus",
    outdoor_humidity: "sensor.airobot_valisohu_niiskus",
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
    preheater_power: "sensor.airobot_eelsoojendi_voimsus",
    bypass: "binary_sensor.airobot_bypass_avatud",
    filter_age: "sensor.airobot_filtri_vanus",
    filter_interval: "sensor.airobot_filtri_intervall",
    filter_alert: "binary_sensor.airobot_filtri_vahetus",
    errors: "sensor.airobot_rikked",
    fault: "binary_sensor.airobot_rike",
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
    good: "#2E7D4F", warn: "#B26A00", bad: "#B3261E", badge: "#EEF1F4", heat: "#D93A12", faultBg: "#B3261E", faultText: "#FFFFFF",
  },
  dark: {
    bg: "#212428", panel: "#2A2E33", panel2: "#2E3237", line: "#33373D", text: "#ECEEF0", muted: "#9AA3AD",
    cold: "#6FA8E8", coldText: "#8FC1F2", warm: "#F08A5D", warmText: "#F4A882", flowDash: "#1A1C1F",
    schemBg: "#1A1C1F", coldBg: "#1A1C1F", warmBg: "#1A1C1F", hub: "#2E3237", hubLine: "#3A3F46",
    toggleBg: "#B8F5A8", toggleOn: "#17191C", toggleOnText: "#ECEEF0", toggleOffText: "#2D5A27",
    actOn: "#ECEEF0", actOnText: "#17191C", actOff: "#17191C", actOffText: "#ECEEF0",
    good: "#8FD97C", warn: "#F2C14E", bad: "#FF8A80", badge: "#17191C", heat: "#FF7A45", faultBg: "#8C1D18", faultText: "#FFFFFF",
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
    fault_title: "Rike", fault_unknown: (b) => `Tundmatu viga (bitt ${b})`,
    err_bits: { 1: "Tulekahjusignaal", 2: "Sissepuhke ventilaator", 4: "Väljatõmbe ventilaator", 8: "Väljatõmbe andur", 16: "Sissepuhke andur", 32: "Välisõhu andur", 64: "Heitõhu andur", 128: "Lisaandur", 256: "CO₂ andur", 512: "Eelsoojendi", 1024: "Sissepuhe alla 5 °C" },
    e_errors: "Rikete andur (bitimask või tekst)", e_fault: "Rikke binaarandur",
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
    preheater_on: "Eelsoojendi sees", preheater_short: "eelsoojendi", bypass_short: "bypass", preheater_off: "Eelsoojendi väljas",
    bypass_on: "Bypass avatud", bypass_off: "Bypass suletud",
    outside: "VÄLJAS", inside: "TOAS",
    outdoor: "Välisõhk", exhaust: "Heitõhk", extract: "Väljatõmme", supply: "Sissepuhe",
    level: "tase", schematic: "Ventilatsiooni skeem",
    auto: "Auto", manual: "Käsitsi",
    overpressure: "Ülerõhk", boost: "Õhutus", pause: "Paus",
    dec: "Vähenda taset", inc: "Suurenda taset", level_aria: (l) => `Tase ${l} / 10`,
    rooms: "Toad", humidity_short: "RH", rpm: "p/min", heat: "soojus", moisture: "niiskus", recovery: "tagastus",
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
    e_airflow: "Õhuhulk (m³/h)", e_efficiency: "Soojustagastuse kasutegur (%)", e_moisture_recovery: "Niiskustagastus (%)", e_power: "Elektritarve (W)",
    e_mode: "Režiim (Auto / Käsitsi)", e_manual_level: "Käsitsi tase", e_boost: "Õhutus (boost)",
    e_overpressure: "Ülerõhk (kamin)", e_power_switch: "Toide (Paus)",
    e_co2: "CO₂", e_co2_setpoint: "CO₂ seadepunkt", e_humidity: "Niiskus (toaõhk)", e_outdoor_humidity: "Välisõhu niiskus", e_humidity_setpoint: "Niiskuse seadepunkt",
    e_voc: "VOC indeks", e_voc_setpoint: "VOC seadepunkt", e_pm25: "PM2.5", e_pm25_setpoint: "PM2.5 seadepunkt",
    e_preheater: "Eelsoojendi sees", e_preheater_power: "Eelsoojendi võimsus (W)", e_bypass: "Bypass avatud", e_filter_age: "Filtri vanus (h)",
    e_filter_interval: "Filtri vahetusintervall (h)", e_filter_alert: "Filtri vahetuse hoiatus",
  },
  en: {
    title: "Ventilation",
    fault_title: "Fault", fault_unknown: (b) => `Unknown fault (bit ${b})`,
    err_bits: { 1: "Fire alarm", 2: "Supply fan", 4: "Extract fan", 8: "Extract air sensor", 16: "Supply air sensor", 32: "Outdoor air sensor", 64: "Exhaust air sensor", 128: "Extra sensor", 256: "CO₂ sensor", 512: "Preheater", 1024: "Supply air below 5 °C" },
    e_errors: "Fault sensor (bitmask or text)", e_fault: "Fault binary sensor",
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
    preheater_on: "Preheater on", preheater_short: "preheater", bypass_short: "bypass", preheater_off: "Preheater off",
    bypass_on: "Bypass open", bypass_off: "Bypass closed",
    outside: "OUTSIDE", inside: "INSIDE",
    outdoor: "Outdoor", exhaust: "Exhaust", extract: "Extract", supply: "Supply",
    level: "level", schematic: "Ventilation schematic",
    auto: "Auto", manual: "Manual",
    overpressure: "Overpressure", boost: "Boost", pause: "Pause",
    dec: "Decrease level", inc: "Increase level", level_aria: (l) => `Level ${l} / 10`,
    rooms: "Rooms", humidity_short: "RH", rpm: "rpm", heat: "heat", moisture: "moisture", recovery: "recovery",
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
    e_airflow: "Airflow (m³/h)", e_efficiency: "Heat recovery efficiency (%)", e_moisture_recovery: "Moisture recovery (%)", e_power: "Power consumption (W)",
    e_mode: "Mode (Auto / Manual)", e_manual_level: "Manual level", e_boost: "Boost",
    e_overpressure: "Overpressure (fireplace)", e_power_switch: "Power (Pause)",
    e_co2: "CO₂", e_co2_setpoint: "CO₂ setpoint", e_humidity: "Humidity (room)", e_outdoor_humidity: "Outdoor humidity", e_humidity_setpoint: "Humidity setpoint",
    e_voc: "VOC index", e_voc_setpoint: "VOC setpoint", e_pm25: "PM2.5", e_pm25_setpoint: "PM2.5 setpoint",
    e_preheater: "Preheater on", e_preheater_power: "Preheater power (W)", e_bypass: "Bypass open", e_filter_age: "Filter age (h)",
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
    return Number(v).toLocaleString(this._hass?.locale?.language || "et", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
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

  _faults() {
    const st = this._st("errors");
    let mask = null;
    if (st) {
      if (st.attributes && st.attributes.bitimask !== undefined) mask = parseInt(st.attributes.bitimask, 10);
      else if (/^\d+$/.test(st.state)) mask = parseInt(st.state, 10);
    }
    const out = [];
    if (mask !== null && !isNaN(mask)) {
      const names = tr(langOf(this._hass, this._config), "err_bits");
      for (let b = 1; b <= mask && b < 2 ** 31; b *= 2) {
        if (!(mask & b) || b === 2048) continue; // 2048 = filter (näidatakse eraldi)
        out.push(names[b] || this._t("fault_unknown", b));
      }
    } else if (st && !["OK", "ok", "unknown", "unavailable", "", "none"].includes(st.state)) {
      out.push(...st.state.split(",").map((x) => x.trim()).filter((x) => x && !/^filter$/i.test(x)));
    }
    if (!out.length && this._on("fault")) out.push(this._t("fault_title"));
    return out;
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
    const faults = this._faults();
    const s = this._state();
    const flow = (l) => (!l || l <= 0) ? "animation-play-state:paused;opacity:0" : `animation-duration:${(6 / l).toFixed(2)}s`;

    const t = (k) => this._fmt(this._num(k), 1) + "°";
    const moist = this._num("moisture_recovery");
    const tempTxt = (key, label, x, y, anchor, col, rhKey) => this._id(key) ? `<g data-more="${esc(this._id(key))}" style="cursor:pointer">
        <text x="${x}" y="${y - 24}" font-size="11" fill="${col}" text-anchor="${anchor}">${this._t(label)}${rhKey && this._has(rhKey) ? ` · RH ${esc(this._fmt(this._num(rhKey), 0))}%` : ""}</text>
        <text class="num" x="${x}" y="${y}" font-size="22" fill="${p.text}" text-anchor="${anchor}">${t(key)}</text></g>` : "";
    const GAUGE = "M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L14.68,14.35C14.18,15.33 13.17,16 12,16M12,3C13.81,3 15.5,3.5 16.97,4.32L14.87,5.53C14,5.19 13,5 12,5A8,8 0 0,0 4,13C4,15.21 4.89,17.21 6.34,18.65H6.35C6.74,19.04 6.74,19.67 6.35,20.06C5.96,20.45 5.32,20.45 4.93,20.07V20.07C3.12,18.26 2,15.76 2,13A10,10 0 0,1 12,3M22,13C22,15.76 20.88,18.26 19.07,20.07V20.07C18.68,20.45 18.05,20.45 17.66,20.06C17.27,19.67 17.27,19.04 17.66,18.65V18.65C19.11,17.2 20,15.21 20,13C20,12 19.81,11 19.46,10.1L20.67,8C21.5,9.5 22,11.18 22,13Z";
    const FAN = "M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z";
    const rpmTxt = (key, flowKey, x, y) => {
      const useFlow = this._has(flowKey);
      const k = useFlow ? flowKey : key;
      if (!this._st(k)) return "";
      const v = s.powerOn ? this._num(k) : 0;
      return `<g data-more="${esc(this._id(k))}" style="cursor:pointer">
        <g transform="translate(${x} ${y - 14}) scale(0.75)"><path d="${GAUGE}" fill="${p.text}"/></g>
        <text class="num" x="${x + 24}" y="${y}" font-size="15" fill="${p.text}">${v === null ? "–" : esc(this._fmt(v, 0))} ${useFlow ? "m³/h" : this._t("rpm")}</text></g>`;
    };
    const prePow = this._num("preheater_power");
    const preOn = s.powerOn && (this._on("preheater") || (prePow !== null && prePow > 20));
    const heater = () => {
      if (!preOn) return "";
      const pw = prePow === null ? "" : prePow >= 1000 ? `${this._fmt(prePow / 1000, 1)} kW` : `${this._fmt(prePow, 0)} W`;
      const more = this._id("preheater_power") && this._st("preheater_power") ? "preheater_power" : "preheater";
      return `<g data-more="${esc(this._id(more))}" style="cursor:pointer">
        <rect class="glow" x="104" y="74" width="44" height="28" rx="6" fill="${p.heat}"/>
        <path d="M108 88 l4 -8 l4 16 l4 -16 l4 16 l4 -16 l4 16 l4 -16 l4 16 l3 -8" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <text x="126" y="70" font-size="10" fill="${p.heat}" text-anchor="middle">${this._t("preheater_short")}</text>
        ${pw ? `<text class="num" x="126" y="57" font-size="13" font-weight="600" fill="${p.heat}" text-anchor="middle">${esc(pw)}</text>` : ""}
      </g>`;
    };
    const bypassOn = this._on("bypass");
    const BYPASS = "M4 88 H150 Q165 88 165 103 V219 Q165 230 176 230 H285 Q296 230 296 219 V206 H436";
    const SUPPLY = "M4 88 H150 L290 206 H436";
    const pctTxt = (lvl, key, x, y) => {
      if (lvl === null || lvl === undefined) return "";
      const spin = lvl > 0 ? `animation-duration:${(4 / lvl).toFixed(2)}s` : "animation-play-state:paused";
      return `<g data-more="${esc(this._id(key))}" style="cursor:pointer">
        <text x="${x - 24}" y="${y}" font-size="15" fill="${p.text}" text-anchor="end"><tspan font-size="11" fill="${p.muted}">${this._t("level")} </tspan><tspan class="num">${esc(this._fmt(lvl, 0))}</tspan><tspan font-size="11" fill="${p.muted}"> · </tspan><tspan class="num">${esc(this._fmt(lvl * 10, 0))}%</tspan></text>
        <g transform="translate(${x - 18} ${y - 14}) scale(0.75)"><path class="spin" d="${FAN}" fill="${p.text}" style="${spin}"/></g></g>`;
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
    ].filter(([k]) => this._has(k));
    const metricCount = metrics.length;
    const metricsHtml = metrics.map(([k, spk, label, unit, d]) => {
      const v = this._num(k), sp = this._num(spk);
      const pct = sp ? Math.max(2, Math.min(100, (v / sp) * 100)) : 0;
      const col = sp && v > sp ? p.bad : sp && v > sp * 0.85 ? p.warn : p.good;
      return `<button class="metric" data-more="${esc(this._id(k))}" aria-label="${esc(label)} ${esc(this._fmt(v, d))} ${esc(unit)}">
        <span class="mlabel">${esc(label)}</span>
        <span class="mval">${esc(this._fmt(v, d))}</span>
        ${sp ? `<span class="bar"><span style="width:${pct}%;background:${col}"></span></span>` : ""}
        <span class="msub">${sp !== null ? `≤ ${esc(this._fmt(sp, 0))}` : ""}${unit ? `<span class="munit"> ${esc(unit)}</span>` : ""}</span>
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
    const status = [];
    if (this._st("preheater")) status.push(this._t(this._on("preheater") ? "preheater_on" : "preheater_off"));
    if (this._st("bypass")) status.push(this._t(this._on("bypass") ? "bypass_on" : "bypass_off"));
    let filterWarn = false;
    if (this._has("filter_age")) {
      const left = ((this._num("filter_interval") ?? 4320) - this._num("filter_age")) / 24;
      filterWarn = this._on("filter_alert");
      status.push(filterWarn ? this._t("filter_replace") : this._t("filter_days", this._fmt(Math.max(0, left), 0)));
    }

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
.fault{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:${p.faultBg};color:${p.faultText};text-align:left}
.ftext{display:flex;flex-direction:column;gap:2px;font-size:13px;line-height:1.3}
.ftitle{font-size:15px;font-weight:600}
.schem{position:relative;border-radius:14px;overflow:hidden;background:${p.schemBg}}
.schem svg{display:block;width:100%;height:auto}
.num{font-family:ui-monospace,"SF Mono","IBM Plex Mono",Menlo,monospace;font-variant-numeric:tabular-nums}
.flow{stroke-dasharray:4 20;animation:airflow linear infinite}
@keyframes airflow{to{stroke-dashoffset:-24}}
.spin{transform-box:fill-box;transform-origin:center;animation:spin linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.glow{animation:glow 1.6s ease-in-out infinite}
@keyframes glow{50%{opacity:.6}}
@media (prefers-reduced-motion:reduce){.flow,.spin,.glow{animation:none}}
.info{text-align:center;font-size:14px;color:${p.muted}}
.toggle{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:14px;background:${p.toggleBg}}
.toggle button{height:44px;border-radius:10px;text-align:center;font-size:15px}
.actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.actions button{height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px}
.stepper{display:flex;align-items:center;gap:12px}
.round{width:44px;height:44px;border-radius:50%;border:1px solid ${p.line} !important;background:${p.panel2} !important;font-size:22px;text-align:center !important}
.segs{flex:1;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px}
.seg{height:12px;border-radius:3px}
.metrics{display:grid;gap:6px}
.metric{display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:12px;background:${p.panel};min-width:0}
.mlabel{font-size:11px;color:${p.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mval{font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.munit{color:${p.muted}}
.msub{font-size:10px;color:${p.muted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:12px}
ha-card{container-type:inline-size}
.body{display:flex;flex-direction:column;gap:12px}
.col{display:flex;flex-direction:column;gap:12px;min-width:0}
@container (min-width:700px){
  .body{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:20px;align-items:start}
}
@container (min-width:1200px){
  .body{grid-template-columns:minmax(0,620px) minmax(0,1fr)}
}
@container (max-width:360px){.munit{display:none}.metric{padding:7px}.mval{font-size:17px}}
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

  <div class="body"><div class="col">
  ${faults.length ? `<button class="fault" data-more="${esc(this._id("errors") || this._id("fault"))}">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>
    <span class="ftext"><span class="ftitle">${esc(this._t("fault_title"))}</span><span>${faults.map(esc).join(" · ")}</span></span>
  </button>` : ""}

  <div class="schem">
    <svg viewBox="0 0 440 256" role="img" aria-label="${this._t("schematic")}">
      <rect x="0" y="0" width="220" height="256" fill="${p.coldBg}"/>
      <rect x="220" y="0" width="220" height="256" fill="${p.warmBg}"/>
      <text x="14" y="20" font-size="10" font-weight="600" letter-spacing="1" fill="${p.coldText}">${this._t("outside")}</text>
      <text x="426" y="20" font-size="10" font-weight="600" letter-spacing="1" fill="${p.warmText}" text-anchor="end">${this._t("inside")}</text>
      ${airflow !== null && s.powerOn ? `<text class="num" x="220" y="20" font-size="11" fill="${p.muted}" text-anchor="middle" data-more="${esc(this._id("airflow"))}" style="cursor:pointer">${esc(this._fmt(airflow, 0))} m³/h</text>` : ""}

      <path d="${SUPPLY}" stroke="${p.cold}" stroke-width="16" stroke-linejoin="round" fill="none" opacity="${bypassOn ? ".2" : ".9"}"/>
      <path d="M436 88 H290 L150 206 H4" stroke="${p.warm}" stroke-width="16" stroke-linejoin="round" fill="none" opacity=".9"/>
      ${bypassOn ? `<g data-more="${esc(this._id("bypass"))}" style="cursor:pointer">
        <path d="${BYPASS}" stroke="${p.cold}" stroke-width="12" stroke-linejoin="round" fill="none" opacity=".95"/>
        <text x="230" y="223" font-size="10" font-weight="600" letter-spacing="1" fill="${p.coldText}" text-anchor="middle">${this._t("bypass_short").toUpperCase()}</text></g>` : ""}
      <path class="flow" d="${bypassOn ? BYPASS : SUPPLY}" stroke="${p.flowDash}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" style="${flow(s.sup)}"/>
      <path class="flow" d="M436 88 H290 L150 206 H4" stroke="${p.flowDash}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" style="${flow(s.ex)}"/>

      ${tempTxt("outdoor_temp", "outdoor", 14, 68, "start", p.coldText, "outdoor_humidity")}
      ${heater()}
      ${tempTxt("exhaust_temp", "exhaust", 14, 186, "start", p.coldText)}
      ${tempTxt("extract_temp", "extract", 426, 68, "end", p.warmText, "humidity")}
      ${tempTxt("supply_temp", "supply", 426, 186, "end", p.warmText)}

      ${rpmTxt("supply_rpm", "supply_airflow", 14, 122)}
      ${rpmTxt("exhaust_rpm", "exhaust_airflow", 14, 242)}
      ${pctTxt(s.ex, "exhaust_level", 426, 122)}
      ${pctTxt(s.sup, "supply_level", 426, 242)}

      ${eff !== null || moist !== null ? `<g data-more="${esc(this._id(eff !== null ? "efficiency" : "moisture_recovery"))}" style="cursor:pointer">
        <circle cx="220" cy="147" r="50" fill="${p.hub}" stroke="${p.hubLine}" stroke-width="2"/>
        ${eff !== null ? `<text class="num" x="220" y="${moist !== null ? 140 : 154}" font-size="24" fill="${p.text}" text-anchor="middle">${esc(this._fmt(eff, 0))}%</text>
        <text x="220" y="${moist !== null ? 152 : 168}" font-size="9" fill="${p.muted}" text-anchor="middle">${this._t("heat")}</text>` : ""}
        ${moist !== null ? `<text class="num" x="220" y="${eff !== null ? 175 : 154}" font-size="${eff !== null ? 16 : 24}" fill="${p.text}" text-anchor="middle">${esc(this._fmt(moist, 0))}%</text>
        <text x="220" y="${eff !== null ? 187 : 168}" font-size="9" fill="${p.muted}" text-anchor="middle">${this._t("moisture")}</text>` : ""}
      </g>` : ""}
    </svg>
  </div>

  <div class="info">${esc(this._info(s))}</div>
  </div><div class="col">

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

  ${metricCount ? `<div class="metrics" style="grid-template-columns:repeat(${metricCount},minmax(0,1fr))">${metricsHtml}</div>` : ""}

  ${rooms ? `<div class="rooms">
    <div class="rhead"><span>${esc(this._t("rooms"))}</span><span class="badge">${esc(c.room_co2_limit)}</span><span class="unit">CO₂ ppm</span></div>
    ${rooms}
  </div>` : ""}

  ${status.length ? `<div class="status">${status.map((x) => `<span${filterWarn && x === this._t("filter_replace") ? ` style="color:${p.bad};font-weight:600"` : ""}>${esc(x)}</span>`).join("<span>·</span>")}</div>` : ""}
  </div></div>
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
    ["efficiency", ENT("sensor")], ["moisture_recovery", ENT("sensor")], ["power", ENT("sensor", { device_class: "power" })],
  ] },
  { key: "g_control", icon: "mdi:tune-variant", fields: [
    ["mode", ENT(["select", "input_select"])], ["manual_level", ENT(["number", "input_number"])],
    ["boost", ENT(["switch", "input_boolean"])], ["overpressure", ENT(["switch", "input_boolean"])],
    ["power_switch", ENT(["switch", "input_boolean"])],
  ] },
  { key: "g_air", icon: "mdi:air-filter", fields: [
    ["co2", ENT("sensor")], ["co2_setpoint", ENT(["number", "sensor", "input_number"])],
    ["humidity", ENT("sensor")], ["outdoor_humidity", ENT("sensor")], ["humidity_setpoint", ENT(["number", "sensor", "input_number"])],
    ["voc", ENT("sensor")], ["voc_setpoint", ENT(["number", "sensor", "input_number"])],
    ["pm25", ENT("sensor")], ["pm25_setpoint", ENT(["number", "sensor", "input_number"])],
  ] },
  { key: "g_status", icon: "mdi:information-outline", fields: [
    ["preheater", ENT("binary_sensor")], ["preheater_power", ENT("sensor", { device_class: "power" })], ["bypass", ENT("binary_sensor")], ["filter_age", ENT("sensor")],
    ["filter_interval", ENT("sensor")], ["filter_alert", ENT("binary_sensor")],
    ["errors", ENT("sensor")], ["fault", ENT("binary_sensor")],
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
