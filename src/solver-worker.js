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
    puzzlePermutation[sticker.id] = sticker.colorData.originalStickerId;
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
  return puzzleStateAsEvenComposableCycle;
}

this.applyCommutators = (puzzleStateAsComposableCycle, commutatorCollection, clusters) => {
  let hasOverlap = (cluster, composableCycle) => {
    for (let sticker of cluster.stickers) {
      if (composableCycle.swapMap[sticker]) {
        return true;
      }
    }
    return false;
  }
  let stickerPairToCycleMap = {};
  let getPairId = (sa, sb) => `${sa}:${sb}`;
  for (let composableCycle of commutatorCollection) {
    for (let targetStickerId in composableCycle.swapMap) {
      let pairId = getPairId(targetStickerId, composableCycle.swapMap[targetStickerId]);
      if (!stickerPairToCycleMap[pairId]) {
        stickerPairToCycleMap[pairId] = [];
      }
      stickerPairToCycleMap[pairId].push(composableCycle);
    }
  }
  for (let cluster of clusters) {
    while (hasOverlap(cluster, puzzleStateAsComposableCycle)) {
      for (let sticker of cluster.stickers) {
        if (puzzleStateAsComposableCycle.swapMap[sticker]) {
          let pairToFix = getPairId(puzzleStateAsComposableCycle.swapMap[sticker], sticker);
          let foundImprovement = false;
          if (stickerPairToCycleMap[pairToFix]) {
            for (let composableCycle of stickerPairToCycleMap[pairToFix]) {
              let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                puzzleStateAsComposableCycle, composableCycle
              ]);
              if (newPuzzleStateAsComposableCycle.size < puzzleStateAsComposableCycle.size) {
                puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
                foundImprovement = true;
                break;
              }
            }
          }
          if (!foundImprovement) {
            let sourceSticker = sticker;
            let targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
            for (let linkingSticker of cluster.stickers) {
              let pairToFixInitial = getPairId(linkingSticker, sourceSticker);
              let pairToFixFinal = getPairId(targetSticker, linkingSticker);
              if (stickerPairToCycleMap[pairToFixInitial]) {
                for (let composableCycleFirst of stickerPairToCycleMap[pairToFixInitial]) {
                  if (stickerPairToCycleMap[pairToFixFinal]) {
                    for (let composableCycleSecond of stickerPairToCycleMap[pairToFixFinal]) {
                      let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                        puzzleStateAsComposableCycle, composableCycleFirst, composableCycleSecond
                      ]);
                      if (newPuzzleStateAsComposableCycle.size < puzzleStateAsComposableCycle.size) {
                        puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
                        foundImprovement = true;
                        break;
                      }
                    }
                    if (foundImprovement) {
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
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
  let commutatorCollection = this.commutatorCache[puzzleId].collection;
  let clusters = this.clusterCache[puzzleId];
  let puzzleStateAsComposableCycle = getPuzzleStateAsComposableCycle(puzzle);
  let puzzleStateAsEvenComposableCycle = this.correctParity(puzzleStateAsComposableCycle, atomicComposableCycles, clusters);
  this.postMessage({ status: "INIT", commutatorCache, clusterCache,
    solution: this.applyCommutators(puzzleStateAsEvenComposableCycle, commutatorCollection, clusters) });
}
