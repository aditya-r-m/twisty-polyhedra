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
  const puzzlePermutation = {};
  for (const sticker of puzzle.stickers) {
    puzzlePermutation[sticker.id] = sticker.colorData.originalStickerId;
  }
  return new ComposableCycle(puzzlePermutation, []);
};

this.getFaceCentres = (puzzle) => {
  const faceCentres = [];
  for (const cycle of puzzle.cycles) {
    for (const collection of cycle.stickerCollections) {
      if (collection.length === 1) {
        faceCentres.push(collection[0].id);
      }
    }
  }
  return faceCentres;
};

this.onmessage = (e) => {
  const puzzle = e.data;
  const puzzleId = this.getPuzzleId(puzzle);
  const atomicComposableCycles = Array.prototype.concat.apply(
    [],
    puzzle.cycles.map((cycle) => ComposableCycle.fromCycle(cycle))
  );
  atomicComposableCycles.sort((a, b) => a.size - b.size);
  const stickerToAtomicComposableCycleMap = {};
  for (const atomicComposableCycle of atomicComposableCycles) {
    for (const sticker in atomicComposableCycle.swapMap) {
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
  const clusters = this.clusterCache[puzzleId];
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
