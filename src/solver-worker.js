// The interface from the web-worker to the UI
// The goal of the solver is to represent the puzzle state as a permutation (ComposableCycle)
// & to compose it with other ComposableCycles till the result is the Identity permutation
// The "DirectedCycles" contained within the final "Identity permutation" make up the solution.

importScripts("./utils.js");
importScripts("./classes/Solver/DirectedCycle.js");
importScripts("./classes/Solver/ComposableCycle.js");
importScripts("./classes/Solver/Cluster.js");
importScripts("./solver-preliminaries.js");
importScripts("./solver-core.js");

this.clusterCache = {};
this.getPuzzleId = (puzzle) =>
  `${puzzle.faces.length}-f-${puzzle.cycles.length}-c`;

this.getPuzzleStateAsComposableCycle = (puzzle) => {
  let puzzlePermutation = {};
  for (let sticker of puzzle.stickers) {
    puzzlePermutation[sticker.id] = sticker.colorData.originalStickerId;
  }
  return new ComposableCycle(puzzlePermutation, []);
};

this.getFaceCentres = (puzzle) => {
  let faceCentres = [];
  for (let cycle of puzzle.cycles) {
    for (let collection of cycle.stickerCollections) {
      if (collection.length === 1) {
        faceCentres.push(collection[0].id);
      }
    }
  }
  return faceCentres;
};

this.onmessage = (e) => {
  let puzzle = e.data;
  let puzzleId = this.getPuzzleId(puzzle);
  let atomicComposableCycles = Array.prototype.concat.apply(
    [],
    puzzle.cycles.map((cycle) => ComposableCycle.fromCycle(cycle))
  );
  atomicComposableCycles.sort((a, b) => a.size - b.size);
  let stickerToAtomicComposableCycleMap = {};
  for (let atomicComposableCycle of atomicComposableCycles) {
    for (let sticker in atomicComposableCycle.swapMap) {
      if (!stickerToAtomicComposableCycleMap[sticker]) {
        stickerToAtomicComposableCycleMap[sticker] = [];
      }
      stickerToAtomicComposableCycleMap[sticker].push(atomicComposableCycle);
    }
  }

  if (!this.clusterCache[puzzleId]) {
    this.clusterCache[puzzleId] = Cluster.fromAtomicComposableCycles(
      atomicComposableCycles,
      stickerToAtomicComposableCycleMap
    );
  }
  let clusters = this.clusterCache[puzzleId];
  this.postMessage({ status: "INITIALIZED" });
  // The initial state of puzzle contains a permutation but no DirectedCycle
  let puzzleStateAsComposableCycle = getPuzzleStateAsComposableCycle(puzzle);
  if (puzzleStateAsComposableCycle.size) {
    puzzleStateAsComposableCycle = this.alignFaceCentres(
      puzzleStateAsComposableCycle,
      atomicComposableCycles,
      getFaceCentres(puzzle)
    );
    puzzleStateAsComposableCycle = this.correctParity(
      puzzleStateAsComposableCycle,
      atomicComposableCycles,
      clusters
    );
    puzzleStateAsComposableCycle = this.solveEvenPuzzleState(
      puzzleStateAsComposableCycle,
      clusters
    );
  }
  // The final state of the puzzle will contain many directedCycles, but will have swapMap of size 0.
  // This "identity permutation" represents the solved state
  this.postMessage({
    status: "SOLVED",
    solution: puzzleStateAsComposableCycle.directedCycles,
  });
};
