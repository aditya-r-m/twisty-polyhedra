importScripts("./utils.js");
importScripts("./classes/Solver/DirectedCycle.js");
importScripts("./classes/Solver/ComposableCycle.js");
importScripts("./classes/Solver/Cluster.js");
importScripts("./solver-preliminaries.js");
importScripts("./solver-core.js");

this.clusterCache = {};
this.getPuzzleId = puzzle => `${puzzle.faces.length}-f-${puzzle.cycles.length}-c`;

this.getPuzzleStateAsComposableCycle = puzzle => {
  let puzzlePermutation = {};
  for (let sticker of puzzle.stickers) {
    puzzlePermutation[sticker.id] = sticker.colorData.originalStickerId;
  }
  return new ComposableCycle(puzzlePermutation, []);
}

this.getFaceCentres = puzzle => {
  let faceCentres = [];
  for (let cycle of puzzle.cycles) {
    for (let collection of cycle.stickerCollections) {
      if (collection.length === 1) {
        faceCentres.push(collection[0].id);
      }
    }
  }
  return faceCentres;
}

this.onmessage = (e) => {
  let puzzle = e.data;
  let puzzleId = this.getPuzzleId(puzzle);
  let atomicComposableCycles = Array.prototype.concat.apply([], puzzle.cycles.map(
    cycle => ComposableCycle.fromCycle(cycle)));
  atomicComposableCycles.sort((a, b) => a.size - b.size);
  if (!this.clusterCache[puzzleId]) {
    this.clusterCache[puzzleId] = Cluster.fromAtomicComposableCycles(atomicComposableCycles);
  }
  let clusters = this.clusterCache[puzzleId];
  let puzzleStateAsComposableCycle = getPuzzleStateAsComposableCycle(puzzle);
  puzzleStateAsComposableCycle = this.alignFaceCentres(puzzleStateAsComposableCycle, atomicComposableCycles, getFaceCentres(puzzle));
  let puzzleStateAsEvenComposableCycle = this.correctParity(puzzleStateAsComposableCycle, atomicComposableCycles, clusters);
  this.postMessage({ status: "INIT", clusterCache,
    solution: solveEvenPuzzleState(puzzleStateAsEvenComposableCycle, clusters) });
}
