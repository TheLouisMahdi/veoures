/* Canonical deterministic mutation reducer. Works in browser and Node/CommonJS. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.VeouresMutation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Legacy types remain replayable. The interface offers these three contribution tools.
  const ACTIVE_TYPES = ['draw_scar', 'feed_mass', 'leave_text'];
  const TYPES = ['draw_scar', 'seed_letter', 'feed_word', 'add_limb', 'feed_mass', 'heal', 'corrupt', 'leave_text'];
  const LIFETIME = 4 * 60 * 60 * 1000;
  const KINDS = ['tendril', 'horn', 'tail', 'leg', 'wing'];
  const CAPS = { limbs: 420, mass: 320, buds: 420, scars: 220, corruptions: 180, texts: 24 };
  const MOODS = {
    love: ['connective', -.08, -8], fear: ['tense', .12, 6],
    rage: ['spiky', .20, 14], hope: ['luminous', .04, -20],
    dark: ['dense', -.03, 0], alive: ['branching', .16, -8],
    peace: ['smooth', -.10, -25], pain: ['fractured', .13, 16]
  };
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const coord = value => finite(value) && value >= 0 && value <= 1;
  const point = value => value && coord(value.x) && coord(value.y);
  const num = (value, low, high) => finite(value) && value >= low && value <= high;
  const clone = value => JSON.parse(JSON.stringify(value));
  function hash(value) {
    let h = 2166136261;
    for (const letter of String(value)) {
      h ^= letter.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function normalize(type, payload) {
    if (!TYPES.includes(type)) throw new Error('Unknown mutation type');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid payload');
    if (type === 'draw_scar') {
      if (!Array.isArray(payload.path) || payload.path.length < 2 || payload.path.length > 40 || !payload.path.every(point)) {
        throw new Error('Scar requires 2-40 normalized points');
      }
      const length = payload.path.reduce((sum, p, index) => index ? sum + Math.hypot(p.x - payload.path[index - 1].x, p.y - payload.path[index - 1].y) : 0, 0);
      if (length < .009) throw new Error('Draw a longer line');
      return { path: payload.path.map(p => ({ x: +p.x.toFixed(4), y: +p.y.toFixed(4) })) };
    }
    if (!point(payload)) throw new Error('Choose a point on the organism');
    const at = { x: +payload.x.toFixed(4), y: +payload.y.toFixed(4) };
    if (type === 'leave_text') {
      const text = typeof payload.text === 'string' ? payload.text.normalize('NFC').trim().replace(/\s+/gu, ' ') : '';
      if (!text || Array.from(text).length > 80 || /[<>\p{Cc}\p{Cs}\p{Co}\p{Cn}\u202a-\u202e\u2066-\u2069]/u.test(text)) throw new Error('Write 1–80 characters without markup or control characters');
      return { ...at, text };
    }
    if (type === 'seed_letter') {
      const letter = typeof payload.letter === 'string' ? payload.letter.trim().normalize('NFC') : '';
      const graphemes = typeof Intl !== 'undefined' && Intl.Segmenter
        ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(letter)) : Array.from(letter);
      if (graphemes.length !== 1 || !/^\p{L}[\p{L}\p{M}]*$/u.test(letter)) throw new Error('Enter exactly one letter');
      return { ...at, letter };
    }
    if (type === 'feed_word') {
      const word = typeof payload.word === 'string' ? payload.word.trim().normalize('NFC') : '';
      if (!word || Array.from(word).length > 32 || /[<>\p{C}\s]/u.test(word)) throw new Error('Enter one safe word (1-32 characters)');
      return { ...at, word };
    }
    if (type === 'add_limb') {
      if (!KINDS.includes(payload.kind) || !num(payload.angle, -6.284, 6.284) || !num(payload.length, .03, .35)) throw new Error('Invalid limb');
      return { ...at, kind: payload.kind, angle: +payload.angle.toFixed(4), length: +payload.length.toFixed(4) };
    }
    if (type === 'feed_mass') {
      if (!num(payload.amount, .01, .09)) throw new Error('Invalid mass amount');
      return { ...at, amount: +payload.amount.toFixed(4) };
    }
    return at;
  }
  function seed() {
    return {
      id: 'veoures-001', epoch: 1, bornAt: '2026-10-23T00:00:00.000Z', version: 0,
      core: { x: .5, y: .5, r: .134 },
      mass: [],
      limbs: [
        { id: 'primordial-a', x: 0.47, y: 0.49, angle: -2.85, length: 0.29, kind: 'tendril', curvature: 0.45 },
        { id: 'primordial-b', x: 0.51, y: 0.49, angle: -2.15, length: 0.27, kind: 'tendril', curvature: -0.58 },
        { id: 'primordial-c', x: 0.51, y: 0.49, angle: -1.2, length: 0.24, kind: 'tendril', curvature: 0.34 },
        { id: 'primordial-d', x: 0.54, y: 0.49, angle: -0.2, length: 0.31, kind: 'tendril', curvature: -0.44 },
        { id: 'primordial-e', x: 0.53, y: 0.53, angle: 0.62, length: 0.28, kind: 'tendril', curvature: 0.51 },
        { id: 'primordial-f', x: 0.48, y: 0.53, angle: 1.75, length: 0.25, kind: 'tendril', curvature: -0.36 },
        { id: 'primordial-g', x: 0.47, y: 0.51, angle: 2.55, length: 0.33, kind: 'tendril', curvature: 0.44 },
      ],
      buds: [], scars: [], corruptions: [], texts: [],
      mood: { tone: 'curious', pulse: .42, hue: 0 },
      totalContributions: 0, recent: []
    };
  }
  function bounded(items, limit) { if (items.length > limit) items.splice(0, items.length - limit); }
  function nearest(items, x, y) {
    let winner = null; let dist = Infinity;
    for (const item of items) {
      const p = item.path ? item.path[Math.floor(item.path.length / 2)] : item;
      const d = Math.hypot(x - p.x, y - p.y);
      if (d < dist && (item.intensity === undefined || item.intensity > 0)) { winner = item; dist = d; }
    }
    return dist <= .30 ? winner : null;
  }
  function apply(state, event) {
    if (!event || !Number.isInteger(event.version) || event.version !== state.version + 1) throw new Error('Out of sequence mutation');
    const payload = normalize(event.type, event.payload);
    const id = String(event.id || 'evt-' + event.version);
    const jitter = hash(event.type + JSON.stringify(payload)) / 4294967295;
    const x = payload.x ?? payload.path?.[0].x ?? .5;
    const y = payload.y ?? payload.path?.[0].y ?? .5;
    state.texts ||= [];
    const createdAt = event.createdAt || new Date(0).toISOString();
    if (event.type === 'draw_scar') {
      state.scars.push({ id, path: payload.path, intensity: 1 });
    } else if (event.type === 'leave_text') {
      state.texts.push({ id, x, y, text: payload.text });
    } else if (event.type === 'seed_letter' || event.type === 'feed_word') {
      const word = payload.letter || payload.word;
      const v = hash(word.toLowerCase());
      state.buds.push({ id, x, y, angle: (v % 6283) / 1000 - Math.PI, length: .03 + (v % 60) / 1400, splits: 1 + v % 3 });
      if (event.type === 'feed_word') {
        const m = MOODS[word.toLowerCase()] || ['unknown', ((v % 41) - 20) / 250, ((v % 37) - 18)];
        state.mood.tone = m[0]; state.mood.pulse = Math.max(.08, Math.min(.92, state.mood.pulse + m[1]));
        state.mood.hue = Math.max(-45, Math.min(45, state.mood.hue + m[2]));
      }
    } else if (event.type === 'add_limb') {
      state.limbs.push({ id, ...payload, curvature: (jitter - .5) * 1.6 });
    } else if (event.type === 'feed_mass') {
      state.mass.push({ id, x, y, r: payload.amount, intensity: .8 + jitter * .4 });
    } else if (event.type === 'heal') {
      const target = nearest([...state.scars, ...state.corruptions], x, y);
      if (target) target.intensity = Math.max(0, +(target.intensity - .7).toFixed(2));
      state.buds.push({ id, x, y, angle: jitter * 6.28, length: .021, splits: 1, healed: true });
    } else if (event.type === 'corrupt') {
      state.corruptions.push({ id, x, y, radius: .025 + jitter * .03, intensity: 1 });
    }
    for (const key of Object.keys(CAPS)) {
      const last = state[key].at(-1);
      if (last?.id === id) last.createdAt = createdAt;
      bounded(state[key], CAPS[key]);
    }
    state.version = event.version;
    state.totalContributions += 1;
    state.recent.unshift({ id, type: event.type, x, y, createdAt, ...(payload.text ? { text: payload.text } : {}) });
    state.recent.length = Math.min(state.recent.length, 30);
    return state;
  }
  // Presentation ages; the accepted event log is never deleted or rewritten.
  function life(item, now = Date.now()) {
    if (!item.createdAt || item.id === 'preview') return 1;
    const age = Math.max(0, now - Date.parse(item.createdAt));
    if (!Number.isFinite(age)) return 0;
    const p = Math.min(1, age / LIFETIME);
    return Math.pow(1 - p, 1.35);
  }
  return { TYPES, ACTIVE_TYPES, LIFETIME, life, KINDS, normalize, apply, seed, clone, hash };
});
