// A cluster is a collection of stickers which can be swapped with each other by a sequence of valid moves.
// We also use this class to find out commutator patterns with can swap a small number of pieces in the cluster.
class Cluster {
  constructor(stickers, atomicComposableCycles) {
    this.stickers = stickers;
    this.stickers.sort();
    this.id = `${this.stickers[0]}-cluster`;
    this.size = this.stickers.length;
    this.atomicComposableCycles = atomicComposableCycles;
    this.order = 0;
    for (const atomicComposableCycle of atomicComposableCycles) {
      if (atomicComposableCycle.swapMap[stickers[0]]) {
        this.order++;
      }
    }
    this.commutators = this.generateCommutators();
  }

  countCycleOverlap(cycle) {
    let overlap = 0;
    for (const sticker of this.stickers) {
      if (cycle.swapMap[sticker]) {
        overlap++;
      }
    }
    return overlap;
  }

  generateCommutators() {
    const conjugates = [];
    for (let i = 0; i < this.atomicComposableCycles.length; i++) {
      if (this.countCycleOverlap(this.atomicComposableCycles[i])) {
        conjugates.push(this.atomicComposableCycles[i]);
      }
      for (let j = 0; j < this.atomicComposableCycles.length; j++) {
        if (
          this.atomicComposableCycles[i].directedCycles[0].cycleIndex !=
            this.atomicComposableCycles[j].directedCycles[0].cycleIndex &&
          this.atomicComposableCycles[i].overlaps(
            this.atomicComposableCycles[j]
          )
        ) {
          const conjugate = ComposableCycle.fromComposableCycles([
            this.atomicComposableCycles[i],
            this.atomicComposableCycles[j],
            this.atomicComposableCycles[i].inverse(),
          ]);
          if (this.countCycleOverlap(conjugate)) {
            conjugates.push(conjugate);
          }
        }
      }
    }
    const commutatorMap = {};
    let minOverlap = Infinity;
    let minSize = Infinity;
    for (const conjugate of conjugates) {
      for (const atomicComposableCycle of this.atomicComposableCycles) {
        if (conjugate.overlaps(atomicComposableCycle)) {
          const commutator = ComposableCycle.fromComposableCycles([
            conjugate,
            atomicComposableCycle,
            conjugate.inverse(),
            atomicComposableCycle.inverse(),
          ]);
          const overlap = this.countCycleOverlap(commutator);
          if (!overlap) continue;
          minOverlap = Math.min(overlap, minOverlap);
          minSize = Math.min(commutator.size, minSize);
          if (
            commutator.size < atomicComposableCycle.size &&
            commutator.size < conjugate.size &&
            overlap === minOverlap &&
            overlap < this.size - 3 &&
            commutator.size === minSize
          ) {
            const sketch = commutator.getSketchFromRootStickers(this.stickers);
            if (
              !commutatorMap[sketch] ||
              commutatorMap[sketch].size > commutator.size
            ) {
              commutatorMap[sketch] = commutator;
            }
          }
        }
      }
    }
    const commutators = Object.values(commutatorMap);
    if (!commutators.length) return [];
    return commutators
      .filter(
        (c) => this.countCycleOverlap(c) === minOverlap && c.size === minSize
      )
      .sort((ca, cb) => ca.size - cb.size);
  }
}

Cluster.fromAtomicComposableCycles = (
  atomicComposableCycles,
  stickerToAtomicComposableCycleMap
) => {
  const clusters = [];
  const stickerGraph = {};
  const addEdge = (sa, sb) => {
    if (!stickerGraph[sa]) stickerGraph[sa] = [];
    stickerGraph[sa].push(sb);
  };
  for (const atomicComposableCycle of atomicComposableCycles) {
    for (const targetStickerId in atomicComposableCycle.swapMap) {
      addEdge(atomicComposableCycle.swapMap[targetStickerId], targetStickerId);
    }
  }
  const nodes = Object.keys(stickerGraph);
  const visited = [];
  const dfs = (u, connectedComponent = []) => {
    visited[u] = true;
    connectedComponent.push(u);
    for (const v of stickerGraph[u]) {
      if (!visited[v]) {
        dfs(v, connectedComponent);
      }
    }
    return connectedComponent;
  };
  for (const node of nodes) {
    if (!visited[node]) {
      const connectedComponent = dfs(node);
      const atomicComposableCycles = [];
      const addedACCs = {};
      for (const sticker of connectedComponent) {
        for (const atomicComposableCycle of stickerToAtomicComposableCycleMap[
          sticker
        ]) {
          const dCycle = atomicComposableCycle.directedCycles[0];
          const acc = dCycle.cycleIndex + "-" + dCycle.direction;
          if (!addedACCs[acc]) {
            addedACCs[acc] = true;
            atomicComposableCycles.push(atomicComposableCycle);
          }
        }
      }
      clusters.push(new Cluster(connectedComponent, atomicComposableCycles));
    }
  }
  return clusters;
};
