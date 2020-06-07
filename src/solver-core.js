this.applyCommutators = (puzzleStateAsComposableCycle, commutatorCollection, clusters) => {
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
  let stillFindingImprovements = true;
  while (stillFindingImprovements && puzzleStateAsComposableCycle.size) {
    stillFindingImprovements = false;
    for (let cluster of clusters) {
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
                      newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
                        puzzleStateAsComposableCycle, composableCycleFirst, composableCycleSecond, composableCycleFirst.inverse()
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
          if (foundImprovement) {
            stillFindingImprovements = true;
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
}
