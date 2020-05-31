importScripts("./utils.js");
importScripts("./classes/Solver/DirectedCycle.js");
importScripts("./classes/Solver/ComposableCycle.js");
importScripts("./classes/Solver/Cluster.js");
importScripts("./classes/Solver/Commutator.js");

this.commutatorCache = {};
this.clusterCache = {};
this.getPuzzleId = puzzle => `${puzzle.faces.length}-f-${puzzle.cycles.length}-c`;

this.getPuzzleStateAsComposableCycle = puzzle => {
  let puzzlePermutation = {};
  for (let sticker of puzzle.stickers) {
    puzzlePermutation[sticker.colorData.originalStickerId] = sticker.id;
  }
  return new ComposableCycle(puzzlePermutation, []);
}

this.correctParity = (puzzleStateAsComposableCycle, atomicComposableCycles, clusters) => {
  let hasOddOverlap = (cluster, composableCycle) => {
    let isVisited = {};
    let swapCount = 0;
    for (let sticker of cluster.stickers) {
      let currentSticker = sticker;
      if (!composableCycle.swapMap[currentSticker] || isVisited[currentSticker]) {
        continue;
      }
      swapCount--;
      while (!isVisited[currentSticker]) {
        isVisited[currentSticker] = true;
        currentSticker = composableCycle.swapMap[currentSticker];
        swapCount++;
      }
    }
    return swapCount & 1;
  };

  let puzzleStateAsEvenComposableCycle = puzzleStateAsComposableCycle;
  for (let cluster of clusters) {
    if (hasOddOverlap(cluster, puzzleStateAsEvenComposableCycle)) {
      for (let atomicComposableCycle of atomicComposableCycles) {
        if (hasOddOverlap(cluster, atomicComposableCycle)) {
          puzzleStateAsEvenComposableCycle = ComposableCycle.fromComposableCycles([
            puzzleStateAsEvenComposableCycle, atomicComposableCycle]);
          break;
        }
      }
    }
  }
  return { puzzleStateAsEvenComposableCycle };
}

this.onmessage = (e) => {
  let puzzle = e.data;
  let puzzleId = this.getPuzzleId(puzzle);
  let atomicComposableCycles = Array.prototype.concat.apply([], puzzle.cycles.map(
    cycle => ComposableCycle.fromCycle(cycle)));
  atomicComposableCycles.sort((a, b) => a.size - b.size);
  if (!this.commutatorCache[puzzleId]) {
    this.commutatorCache[puzzleId] = new Commutator(atomicComposableCycles);
  }
  if (!this.clusterCache[puzzleId]) {
    this.clusterCache[puzzleId] = Cluster.fromAtomicComposableCycles(atomicComposableCycles);
    this.clusterCache[puzzleId].sort((ca, cb) => cb.stickers.length - ca.stickers.length);
  }
  let commutators = this.commutatorCache[puzzleId];
  let clusters = this.clusterCache[puzzleId];
  let puzzleStateAsComposableCycle = getPuzzleStateAsComposableCycle(puzzle);
  this.postMessage({ status: "INIT", commutatorCache, clusterCache,
    cp: this.correctParity(puzzleStateAsComposableCycle, atomicComposableCycles, clusters) });
}
