function generateCommutators(puzzle) {
  let baseSCycles = Array.prototype.concat.apply([], puzzle.cycles.map(cycle => SCycle.fromCycle(cycle)));
  let conjugates = [];
  for (let i = 0; i < baseSCycles.length; i++) {
    for (let j = 0; j < baseSCycles.length; j++) {
      if (baseSCycles[i].dCycles[0].cycle.id != baseSCycles[j].dCycles[0].cycle.id
          && baseSCycles[i].overlaps(baseSCycles[j])) {
        conjugates.push(SCycle.fromSCycles([baseSCycles[i], baseSCycles[j], baseSCycles[i].inverse()]));
      }
    }
  }
  let commutatorMap = {};
  conjugates.forEach(conjugate => {
    baseSCycles.forEach(baseSCycle => {
      if (conjugate.overlaps(baseSCycle)) {
        let commutator = SCycle.fromSCycles([conjugate, baseSCycle, conjugate.inverse(), baseSCycle.inverse()]);
        if (commutator.size > 0 && commutator.size % 3 == 0 && commutator.size < 13
            && commutator.size < baseSCycle.size && commutator.size < conjugate.size) {
          commutatorMap[commutator.getId()] = commutator;
        }
      }
    });
  });
  let commutators = Object.values(commutatorMap);
  return commutators
    .sort((ca, cb) => Object.keys(ca.sMap).length - Object.keys(cb.sMap).length);
}

