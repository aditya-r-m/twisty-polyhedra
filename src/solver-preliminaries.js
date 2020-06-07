this.alignFaceCentres = (puzzleStateAsComposableCycle, atomicComposableCycles, faceCentres) => {
  let countOverlappingFaceCentres = composableCycle => {
    let result = 0;
    for (let sticker of faceCentres) {
      if (composableCycle.swapMap[sticker]) {
        result++;
      }
    }
    return result;
  }
  for (let sticker of faceCentres) {
    if (puzzleStateAsComposableCycle.swapMap[sticker]) {
      let sourceSticker = sticker;
      let targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
      for (let atomicComposableCycle of atomicComposableCycles) {
        if (atomicComposableCycle.swapMap[targetSticker] === sourceSticker) {
          let newPuzzleStateAsComposableCycle = ComposableCycle.fromComposableCycles([
            puzzleStateAsComposableCycle, atomicComposableCycle
          ]);
          if (countOverlappingFaceCentres(newPuzzleStateAsComposableCycle) <
            countOverlappingFaceCentres(puzzleStateAsComposableCycle)) {
              puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

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
};
