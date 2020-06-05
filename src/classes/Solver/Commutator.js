class Commutator {
  constructor (atomicComposableCycles) {
    this.collection = this.generateComposableCycles(atomicComposableCycles);
  }

  generateComposableCycles(atomicComposableCycles) {
    let conjugates = [];
    for (let i = 0; i < atomicComposableCycles.length; i++) {
      for (let j = 0; j < atomicComposableCycles.length; j++) {
        if (atomicComposableCycles[i].directedCycles[0].cycleIndex != atomicComposableCycles[j].directedCycles[0].cycleIndex
            && atomicComposableCycles[i].overlaps(atomicComposableCycles[j])) {
          conjugates.push(ComposableCycle.fromComposableCycles([
            atomicComposableCycles[i], atomicComposableCycles[j], atomicComposableCycles[i].inverse()]));
        }
      }
    }
    let commutatorMap = {};
    for (let conjugate of conjugates) {
      for (let atomicComposableCycle of atomicComposableCycles) {
        if (conjugate.overlaps(atomicComposableCycle)) {
          let commutator = ComposableCycle.fromComposableCycles([
            conjugate, atomicComposableCycle, conjugate.inverse(), atomicComposableCycle.inverse()]);
          if (commutator.size > 0 && commutator.size % 3 == 0 && commutator.size < 13
              && commutator.size < atomicComposableCycle.size && commutator.size < conjugate.size) {
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
