// Greedy approach to align face centers
this.alignFaceCentres = (
  puzzleStateAsComposableCycle,
  atomicComposableCycles,
  faceCentres
) => {
  const countOverlappingFaceCentres = (composableCycle) => {
    let result = 0;
    for (const sticker of faceCentres) {
      if (composableCycle.swapMap[sticker]) {
        result++;
      }
    }
    return result;
  };
  for (const sticker of faceCentres) {
    if (puzzleStateAsComposableCycle.swapMap[sticker]) {
      const sourceSticker = sticker;
      const targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
      for (const atomicComposableCycle of atomicComposableCycles) {
        if (atomicComposableCycle.swapMap[targetSticker] === sourceSticker) {
          const newPuzzleStateAsComposableCycle =
            ComposableCycle.fromComposableCycles(
              [puzzleStateAsComposableCycle, atomicComposableCycle],
              [undefined, { sequence: "Face center alignment" }]
            );
          if (
            countOverlappingFaceCentres(newPuzzleStateAsComposableCycle) <
            countOverlappingFaceCentres(puzzleStateAsComposableCycle)
          ) {
            puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

// Checks which clusters are "odd" swaps away from solved state. Applied "odd" atomic twists to them to bring them to even distances
this.correctParity = (
  puzzleStateAsComposableCycle,
  atomicComposableCycles,
  clusters
) => {
  const hasOddOverlap = (cluster, composableCycle) => {
    const isVisited = {};
    let swapCount = 0;
    for (const sticker of cluster.stickers) {
      let currentSticker = sticker;
      if (
        !composableCycle.swapMap[currentSticker] ||
        isVisited[currentSticker]
      ) {
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
  for (const cluster of clusters) {
    if (hasOddOverlap(cluster, puzzleStateAsEvenComposableCycle)) {
      for (const atomicComposableCycle of atomicComposableCycles) {
        if (hasOddOverlap(cluster, atomicComposableCycle)) {
          puzzleStateAsEvenComposableCycle =
            ComposableCycle.fromComposableCycles(
              [puzzleStateAsEvenComposableCycle, atomicComposableCycle],
              [undefined, { sequence: "Parity Correction" }]
            );
          break;
        }
      }
    }
  }
  return puzzleStateAsEvenComposableCycle;
};
