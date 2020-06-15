this.getPairId = (t, s) => `${t}:${s}`;

this.getSpecialClusters = clusters => {
  let specialClusters = [];
  for (let cluster of clusters) {
    if (!cluster.commutators.length
      || !cluster.commutators.some(({ swapMap }) =>
        Object.keys(swapMap).every(sticker => cluster.stickers.find(s => s === sticker)))) {
      specialClusters.push(cluster);
    }
  }
  return specialClusters;
}

this.solveEvenPuzzleState = (puzzleStateAsComposableCycle, clusters) => {
  let stickerPairToCycleMap = {};
  let specialClusters = this.getSpecialClusters(clusters);
  clusters.sort((ca, cb) => cb.order - ca.order);
  specialClusters.sort((ca, cb) => cb.order - ca.order);
  stickerPairToCycleMap = {};

  for (let cluster of clusters) {
    let composableCycles = cluster.commutators.length ? cluster.commutators : cluster.atomicComposableCycles;
    for (let composableCycle of composableCycles) {
      for (let targetStickerId in composableCycle.swapMap) {
        if (!cluster.stickers.find(s => s === targetStickerId)) continue;
        let pairId = this.getPairId(targetStickerId, composableCycle.swapMap[targetStickerId]);
        if (!stickerPairToCycleMap[pairId]) {
          stickerPairToCycleMap[pairId] = [];
        }
        stickerPairToCycleMap[pairId].push(composableCycle);
      }
    }
  }
  for (let complexityLimit = 2; complexityLimit <= 4; complexityLimit += 2) {
    for (let cluster of specialClusters) {
      if (!cluster.countCycleOverlap(puzzleStateAsComposableCycle)) continue;
      puzzleStateAsComposableCycle = this.solveCluster(
        puzzleStateAsComposableCycle, cluster, stickerPairToCycleMap,
        (n, o) => cluster.countCycleOverlap(n) < cluster.countCycleOverlap(o),
        complexityLimit);
    }
  }
  stillImproving = true;
  while (stillImproving) {
    stillImproving = false;
    for (let complexityLimit = 2; complexityLimit <= 4; complexityLimit += 2) {
      for (let cluster of clusters) {
        if (!cluster.countCycleOverlap(puzzleStateAsComposableCycle)) continue;
        let newPuzzleStateAsComposableCycle = this.solveCluster(
          puzzleStateAsComposableCycle, cluster, stickerPairToCycleMap,
          (n, o) => n.size < o.size && o.size - n.size >= cluster.countCycleOverlap(o) - cluster.countCycleOverlap(n),
          complexityLimit);
        if (newPuzzleStateAsComposableCycle !== puzzleStateAsComposableCycle) {
          stillImproving = true;
          puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

this.solveCluster = (puzzleStateAsComposableCycle, cluster, stickerPairToCycleMap, isProgress, complexityLimit) => {
  let stillFindingImprovements = true;
  let newPuzzleStateAsComposableCycle;
  let clusterSolvers = [this.attemptL0Algorithms, this.attemptL1Algorithms, this.attemptL2Algorithms, this.attemptL3Algorithms];
  while (stillFindingImprovements && puzzleStateAsComposableCycle.size) {
    stillFindingImprovements = false;
    for (let sticker of cluster.stickers) {
      if (puzzleStateAsComposableCycle.swapMap[sticker]) {
        for (let solverComplexity = 0; solverComplexity < complexityLimit; solverComplexity++) {
          newPuzzleStateAsComposableCycle =
            clusterSolvers[solverComplexity](puzzleStateAsComposableCycle, cluster, sticker, stickerPairToCycleMap, isProgress);
          if (newPuzzleStateAsComposableCycle !== puzzleStateAsComposableCycle) {
            puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
            stillFindingImprovements = true;
            break;
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

this.attemptL0Algorithms = (puzzleStateAsComposableCycle, _, sticker, stickerPairToCycleMap, isProgress) => {
  let pairToFix = this.getPairId(puzzleStateAsComposableCycle.swapMap[sticker], sticker);
  if (stickerPairToCycleMap[pairToFix]) {
    for (let composableCycle of stickerPairToCycleMap[pairToFix]) {
      let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
        puzzleStateAsComposableCycle, composableCycle
      ]);
      if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
        return newPuzzleStateAsComposableCycle;
      }
    }
  }
  return puzzleStateAsComposableCycle;
}

this.attemptL1Algorithms = (puzzleStateAsComposableCycle, cluster, sticker, stickerPairToCycleMap, isProgress) => {
  for (let atomicComposableCycle of cluster.atomicComposableCycles) {
    if (!atomicComposableCycle.swapMap[sticker]) continue;
    let linkingSticker;
    let targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
    for (let curSticker in atomicComposableCycle.swapMap) {
      if (atomicComposableCycle.swapMap[curSticker] === sticker) {
        linkingSticker = curSticker;
      }
      if (atomicComposableCycle.swapMap[curSticker] === puzzleStateAsComposableCycle.swapMap[sticker]) {
        targetSticker = curSticker;
      }
    }
    let pairToFix = this.getPairId(targetSticker, linkingSticker);
    if (stickerPairToCycleMap[pairToFix]) {
      for (let composableCycle of stickerPairToCycleMap[pairToFix]) {
        let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
          puzzleStateAsComposableCycle, atomicComposableCycle, composableCycle, atomicComposableCycle.inverse()
        ]);
        if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
          return newPuzzleStateAsComposableCycle;
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
}

this.attemptL2Algorithms = (puzzleStateAsComposableCycle, cluster, sticker, stickerPairToCycleMap, isProgress) => {
  let sourceSticker = sticker;
  let targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
  for (let linkingSticker of cluster.stickers) {
    let pairToFixInitial = this.getPairId(linkingSticker, sourceSticker);
    let pairToFixFinal = this.getPairId(targetSticker, linkingSticker);
    if (linkingSticker === sourceSticker || linkingSticker === targetSticker) continue;
    if (stickerPairToCycleMap[pairToFixInitial]) {
      for (let composableCycleFirst of stickerPairToCycleMap[pairToFixInitial]) {
        if (stickerPairToCycleMap[pairToFixFinal]) {
          for (let composableCycleSecond of stickerPairToCycleMap[pairToFixFinal]) {
            let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
              puzzleStateAsComposableCycle, composableCycleFirst, composableCycleSecond
            ]);
            if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
              return newPuzzleStateAsComposableCycle;
            }
            newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
              puzzleStateAsComposableCycle, composableCycleFirst, composableCycleSecond, composableCycleFirst.inverse()
            ]);
            if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
              return newPuzzleStateAsComposableCycle;
            }
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
}

this.attemptL3Algorithms = (puzzleStateAsComposableCycle, cluster, sticker, stickerPairToCycleMap, isProgress) => {
  for (let atomicComposableCycle of cluster.atomicComposableCycles) {
    if (!atomicComposableCycle.swapMap[sticker]) continue;
    let preLinkingSticker, preTargetSticker;
    let targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
    for (let curSticker in atomicComposableCycle.swapMap) {
      if (atomicComposableCycle.swapMap[curSticker] === sticker) {
        preLinkingSticker = curSticker;
      }
      if (atomicComposableCycle.swapMap[curSticker] === targetSticker) {
        preTargetSticker = curSticker;
      }
    }
    for (let linkingSticker of cluster.stickers) {
      let pairToFixInitial = this.getPairId(linkingSticker, preLinkingSticker);
      let pairToFixFinal = this.getPairId(preTargetSticker, linkingSticker);
      if (linkingSticker === preLinkingSticker || linkingSticker === preTargetSticker || atomicComposableCycle.swapMap[linkingSticker]) continue;
      if (stickerPairToCycleMap[pairToFixInitial]) {
        for (let composableCycleFirst of stickerPairToCycleMap[pairToFixInitial]) {
          if (stickerPairToCycleMap[pairToFixFinal]) {
            for (let composableCycleSecond of stickerPairToCycleMap[pairToFixFinal]) {
              let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                puzzleStateAsComposableCycle,
                atomicComposableCycle, composableCycleFirst, composableCycleSecond, atomicComposableCycle.inverse()
              ]);
              if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
                return newPuzzleStateAsComposableCycle;
              }
              newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                puzzleStateAsComposableCycle,
                atomicComposableCycle, composableCycleFirst, composableCycleSecond, composableCycleFirst.inverse(), atomicComposableCycle.inverse()
              ]);
              if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
                return newPuzzleStateAsComposableCycle;
              }
            }
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
}
