(function (root) {
  'use strict';
  const mutation = root.VeouresMutation;
  class OrganismEngine {
    constructor() { this.state = mutation.seed(); this.knownIds = new Set(); this.clockOffset=0; this.ready=false; }
    now() { return Date.now()+this.clockOffset; }
    reset() { this.state = mutation.seed(); this.knownIds.clear(); }
    receive(event) {
      if (this.knownIds.has(event.id) || event.version <= this.state.version) return false;
      mutation.apply(this.state, event);
      this.knownIds.add(event.id);
      return true;
    }
    receiveMany(events) {
      let changed = false;
      for (const event of [...events].sort((a, b) => a.version - b.version)) changed = this.receive(event) || changed;
      return changed;
    }
    status() {
      const s = this.state;
      return { age: Math.max(0, Math.floor((Date.now()-Date.parse(s.bornAt))/3600000))+' h', version: s.version, mutations: s.totalContributions, limbs: s.limbs.length, scars: s.scars.filter(i => i.intensity > 0 && mutation.life(i,this.now()) > .002).length, buds: s.buds.length, mass: s.mass.filter(i => mutation.life(i,this.now()) > .002).length, texts: s.texts.filter(i => mutation.life(i,this.now()) > .002).length, pulse: Math.round(52 + s.mood.pulse * 52), mood: s.mood.tone };
    }
  }
  root.VeouresOrganism = OrganismEngine;
})(globalThis);
