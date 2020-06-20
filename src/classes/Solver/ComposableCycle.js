// Composable cycles represent permutations of stickers & can be used to compose other permutations
// swapMap : Object of the form { targetStickerId : sourceStickerId }
// directedCycles : Full list of cycleIndex & direction of the original sticker "Cycles" that make up a specific composition
// When all the directed Cycles are applied on the original puzzle, it will make colorData from all the sourceStickers moving to corresponding targetStickers.
class ComposableCycle {
  constructor(swapMap, directedCycles) {
    this.swapMap = swapMap;
    for (const targetStickerId in swapMap) {
      const sourceStickerId = swapMap[targetStickerId];
      if (targetStickerId === sourceStickerId) {
        delete swapMap[targetStickerId];
      }
    }
    this.directedCycles = directedCycles;
    this.size = Object.keys(swapMap).length;
  }

  getSketchFromRootStickers(rootStickers) {
    const isVisited = {};
    const orderedStickerSets = [];
    for (const rootSticker of rootStickers) {
      if (!this.swapMap[rootSticker]) {
        continue;
      }
      let curSticker = rootSticker;
      if (this.swapMap[curSticker] && !isVisited[curSticker]) {
        let orderedStickers = [];
        let minSticker = curSticker;
        while (!isVisited[curSticker]) {
          isVisited[curSticker] = true;
          orderedStickers.push(curSticker);
          if (curSticker < minSticker) minSticker = curSticker;
          curSticker = this.swapMap[curSticker];
        }
        const minIndex = orderedStickers.lastIndexOf(minSticker);
        orderedStickers = orderedStickers
          .slice(minIndex)
          .concat(orderedStickers.slice(0, minIndex));
        orderedStickerSets.push(orderedStickers.join("|"));
      }
    }
    orderedStickerSets.sort();
    return orderedStickerSets.join("$");
  }

  inverse() {
    const iSwapMap = {};
    for (const key in this.swapMap) {
      iSwapMap[this.swapMap[key]] = key;
    }
    const iDirectedCycles = this.directedCycles
      .map(
        ({ cycleIndex, period, direction }) =>
          new DirectedCycle(cycleIndex, period, period - direction)
      )
      .reverse();
    return new ComposableCycle(iSwapMap, iDirectedCycles);
  }

  overlaps(composableCycle) {
    for (const key in composableCycle.swapMap) {
      if (this.swapMap[key]) {
        return true;
      }
    }
    return false;
  }
}

ComposableCycle.fromCycle = (cycle) => {
  const composableCycles = [];
  for (let direction = 1; direction < cycle.period; direction++) {
    const swapMap = {};
    for (const collection of cycle.stickerCollections) {
      if (collection.length === 1) continue;
      const increment = (direction * collection.length) / cycle.period;
      for (let index = 0; index < collection.length; index++) {
        const sticker = collection[index];
        swapMap[sticker.id] =
          collection[mod(index - increment, collection.length)].id;
      }
    }
    composableCycles.push(
      new ComposableCycle(swapMap, [
        new DirectedCycle(cycle.index, cycle.period, direction),
      ])
    );
  }
  return composableCycles;
};

ComposableCycle.fromComposableCycles = (composableCycles, metadata) => {
  let swapMap = {};
  let directedCycles = [];
  for (let i = 0; i < composableCycles.length; i++) {
    const composableCycle = composableCycles[i];
    const meta = metadata && metadata[i];
    const newSwapMap = {};
    for (const targetStickerId in swapMap) {
      const sourceStickerId = swapMap[targetStickerId];
      newSwapMap[targetStickerId] = sourceStickerId;
    }
    for (const targetStickerId in composableCycle.swapMap) {
      const sourceStickerId = composableCycle.swapMap[targetStickerId];
      if (swapMap[sourceStickerId]) {
        newSwapMap[targetStickerId] = swapMap[sourceStickerId];
      } else {
        newSwapMap[targetStickerId] = sourceStickerId;
      }
    }
    swapMap = newSwapMap;
    if (!meta) {
      directedCycles = directedCycles.concat(composableCycle.directedCycles);
    } else {
      directedCycles = directedCycles.concat(
        composableCycle.directedCycles.map(
          ({ cycleIndex, period, direction }) =>
            new DirectedCycle(
              cycleIndex,
              period,
              direction,
              meta.sequence,
              meta.subSequence
            )
        )
      );
    }
  }
  return new ComposableCycle(swapMap, directedCycles);
};
