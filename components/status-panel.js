(function (root) {
  'use strict';
  root.VeouresStatusPanel = function (element, status, mode, remaining) {
    element.replaceChildren();
    const data = [
      ['Mode', mode === 'shared' ? 'SHARED ONLINE' : mode === 'local' ? 'LOCAL DEMO' : mode.toUpperCase()],
      ['Changes left today', String(Math.max(0, remaining))],
      ['Age',status.age], ['Version',status.version], ['Contributions', status.mutations], ['Limbs', status.limbs],
      ['Scars', status.scars], ['Growth nodes', status.buds + status.mass],
      ['Pulse', `${status.pulse} BPM`], ['Growth tone', status.mood]
    ];
    for (const [label, value] of data) {
      const row = document.createElement('div'); row.className = 'status-row';
      const l = document.createElement('span'); l.textContent = label;
      const v = document.createElement('strong'); v.textContent = value;
      row.append(l, v); element.append(row);
    }
  };
})(globalThis);
