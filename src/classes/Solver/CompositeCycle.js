class CompositeCycle {
  constructor(swapMap, directedCycles) {
    this.swapMap = swapMap;
    this.directedCycles = directedCycles;
    this.size = Object.keys(swapMap).length;
  }

  getSketch() {
    let minS = 'z';
    for (let key in this.swapMap) {
      if (key < minS) {
        minS = key;
      }
    }
    let orderedSs = [];
    let curS = minS;
    do {
      orderedSs.push(curS);
      curS = this.swapMap[curS];
    } while (curS != minS);
    return orderedSs.join("-");
  }

  inverse() {
    let iSwapMap = {};
    for (let key in this.swapMap) {
      iSwapMap[this.swapMap[key]] = key;
    }
    let iDirectedCycles = this.directedCycles
      .map(({cycleIndex, period, direction}) => new DirectedCycle(cycleIndex, period, period - direction))
      .reverse();
    return new CompositeCycle(iSwapMap, iDirectedCycles);
  }

  overlaps(compositeCycle) {
    for (let key in compositeCycle.swapMap) {
      if (this.swapMap[key]) {
        return true;
      }
    }
    return false;
  }
}

CompositeCycle.fromCycle = cycle => {
  let compositeCycles = [];
  for (let direction = 1; direction < cycle.period; direction++) {
    let swapMap = {};
    for (let collection of cycle.stickerCollections) {
      if (collection.length === 1) continue;
      let increment = direction * collection.length / cycle.period;
      for (let index = 0; index < collection.length; index++) {
        let sticker = collection[index];
        swapMap[sticker.id] = collection[mod(index - increment, collection.length)].id;
      };
    };
    compositeCycles.push(new CompositeCycle(swapMap, [new DirectedCycle(cycle.index, cycle.period, direction)]));
  }
  return compositeCycles;
};

CompositeCycle.fromCompositeCycles = compositeCycles => {
  let swapMap = {};
  let directedCycles = [];
  compositeCycles.forEach(compositeCycle => {
    let newSwapMap = {};
    for (let targetStickerId in swapMap) {
      let sourceStickerId = swapMap[targetStickerId];
      newSwapMap[targetStickerId] = sourceStickerId;
    }
    for (let targetStickerId in compositeCycle.swapMap) {
      let sourceStickerId = compositeCycle.swapMap[targetStickerId];
      if (swapMap[sourceStickerId]) {
        newSwapMap[targetStickerId] = swapMap[sourceStickerId];
      } else {
        newSwapMap[targetStickerId] = sourceStickerId;
      }
    };
    swapMap = newSwapMap;
    directedCycles = directedCycles.concat(compositeCycle.directedCycles);
  });
  for (let targetStickerId in swapMap) {
    let sourceStickerId = swapMap[targetStickerId];
    if (targetStickerId == sourceStickerId) {
      delete swapMap[targetStickerId];
    }
  };
  return new CompositeCycle(swapMap, directedCycles);
};
