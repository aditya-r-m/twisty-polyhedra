this.getPairId = (sa, sb) => `${sa}:${sb}`;
this.getClusterOrder = c => c.commutators.length ? c.commutators[c.commutators.length - 1] : 0;

this.solveEvenPuzzleState = (puzzleStateAsComposableCycle, clusters) => {
  let stickerPairToCycleMap = {};
  let specialClusters = [];
  clusters.sort((ca, cb) => this.getClusterOrder(cb) - this.getClusterOrder(ca));
  for (let cluster of clusters) {
    if (!cluster.commutators.length
      || !cluster.commutators.some(({ swapMap }) =>
        Object.keys(swapMap).every(sticker => cluster.stickers.find(s => s === sticker)))) {
      specialClusters.push(cluster);
    }
  }
  for (let cluster of specialClusters) {
    stickerPairToCycleMap = {};
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
    puzzleStateAsComposableCycle = this.solveCluster(
      puzzleStateAsComposableCycle, cluster, stickerPairToCycleMap,
      (n, o) => cluster.countCycleOverlap(n) < cluster.countCycleOverlap(o));
  }
  stillImproving = true;
  while (stillImproving) {
    stillImproving = false;
    for (let cluster of clusters) {
      stickerPairToCycleMap = {};
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
      let newPuzzleStateAsComposableCycle = this.solveCluster(
        puzzleStateAsComposableCycle, cluster, stickerPairToCycleMap, (n, o) => n.size < o.size);
      if (newPuzzleStateAsComposableCycle != puzzleStateAsComposableCycle) {
        stillImproving = true;
        puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

this.solveCluster = (puzzleStateAsComposableCycle, cluster, stickerPairToCycleMap, isProgress) => {
  let stillFindingImprovements = true;
  while (stillFindingImprovements && puzzleStateAsComposableCycle.size) {
    stillFindingImprovements = false;
    for (let sticker of cluster.stickers) {
      if (puzzleStateAsComposableCycle.swapMap[sticker]) {
        let pairToFix = this.getPairId(puzzleStateAsComposableCycle.swapMap[sticker], sticker);
        let foundImprovement = false;
        if (stickerPairToCycleMap[pairToFix]) {
          for (let composableCycle of stickerPairToCycleMap[pairToFix]) {
            let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
              puzzleStateAsComposableCycle, composableCycle
            ]);
            if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
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
            let pairToFixInitial = this.getPairId(linkingSticker, sourceSticker);
            let pairToFixFinal = this.getPairId(targetSticker, linkingSticker);
            if (linkingSticker == sourceSticker || linkingSticker == targetSticker) continue;
            if (stickerPairToCycleMap[pairToFixInitial]) {
              for (let composableCycleFirst of stickerPairToCycleMap[pairToFixInitial]) {
                if (stickerPairToCycleMap[pairToFixFinal]) {
                  for (let composableCycleSecond of stickerPairToCycleMap[pairToFixFinal]) {
                    let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                      puzzleStateAsComposableCycle, composableCycleFirst, composableCycleSecond
                    ]);
                    if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
                      puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
                      foundImprovement = true;
                      break;
                    }
                    newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                      puzzleStateAsComposableCycle, composableCycleFirst, composableCycleSecond, composableCycleFirst.inverse()
                    ]);
                    if (isProgress(newPuzzleStateAsComposableCycle, puzzleStateAsComposableCycle)) {
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
        if (foundImprovement) {
          stillFindingImprovements = true;
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};
