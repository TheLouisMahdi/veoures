(function (root) {
  'use strict';
  root.VeouresStatusPanel = function (element, status, mode, remaining) {
    element.replaceChildren();
    const data = [
      ['Mode', mode === 'shared' ? 'SHARED ONLINE' : mode === 'local' ? 'LOCAL DEMO' : mode.toUpperCase()],
      ['Touches until next opening', String(Math.max(0, remaining))],
      ['Next opening',status.opening], ['Age',status.age], ['Version',status.version], ['Contributions', status.mutations],
      ['Limbs',status.limbs],['Eyes',status.eyes],['Living scars', status.scars], ['Mass tissue', status.mass], ['Written traces', status.texts], ['Trace lifetime', '4 hours'],
      ['Pulse', `${status.pulse} BPM`]
    ];
    for (const [label, value] of data) {
      const row = document.createElement('div'); row.className = 'status-row';
      const l = document.createElement('span'); l.textContent = label;
      const v = document.createElement('strong'); v.textContent = value;
      row.append(l, v); element.append(row);
    }
  };
})(globalThis);
