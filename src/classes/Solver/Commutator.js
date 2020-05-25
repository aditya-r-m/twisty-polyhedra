class Commutator {
  constructor (puzzle) {
    this.puzzle = puzzle;
    this.commutators = this.generate();
  }

  generate() {
    let baseCompositeCycles = Array.prototype.concat.apply([], this.puzzle.cycles.map(
      cycle => CompositeCycle.fromCycle(cycle)));
    let conjugates = [];
    for (let i = 0; i < baseCompositeCycles.length; i++) {
      for (let j = 0; j < baseCompositeCycles.length; j++) {
        if (baseCompositeCycles[i].directedCycles[0].cycleIndex != baseCompositeCycles[j].directedCycles[0].cycleIndex
            && baseCompositeCycles[i].overlaps(baseCompositeCycles[j])) {
          conjugates.push(CompositeCycle.fromCompositeCycles([
            baseCompositeCycles[i], baseCompositeCycles[j], baseCompositeCycles[i].inverse()]));
        }
      }
    }
    let commutatorMap = {};
    for (let conjugate of conjugates) {
      for (let baseCompositeCycle of baseCompositeCycles) {
        if (conjugate.overlaps(baseCompositeCycle)) {
          let commutator = CompositeCycle.fromCompositeCycles([
            conjugate, baseCompositeCycle, conjugate.inverse(), baseCompositeCycle.inverse()]);
          if (commutator.size > 0 && commutator.size % 3 == 0 && commutator.size < 13
              && commutator.size < baseCompositeCycle.size && commutator.size < conjugate.size) {
            let sketch = commutator.getSketch();
            if (!commutatorMap[sketch] || commutatorMap[sketch].size > commutator.size) {
              commutatorMap[commutator.getSketch()] = commutator;
            }
          }
        }
      };
    };
    let commutators = Object.values(commutatorMap);
    return commutators.sort((ca, cb) => ca.size - cb.size);
  }
}
