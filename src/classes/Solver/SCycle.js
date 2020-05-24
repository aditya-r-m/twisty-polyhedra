
class DCycle {
  constructor(cycleIndex, period, direction) {
    this.cycleIndex = cycleIndex;
    this.period = period;
    this.direction = direction;
  }
}

class SCycle {
  constructor(sMap, dCycles) {
    this.sMap = sMap;
    this.dCycles = dCycles;
    this.size = Object.keys(sMap).length;
  }

  getSketch() {
    let minS = 'z';
    for (let key in this.sMap) {
      if (key < minS) {
        minS = key;
      }
    }
    let orderedSs = [];
    let curS = minS;
    do {
      orderedSs.push(curS);
      curS = this.sMap[curS];
    } while (curS != minS);
    return orderedSs.join("-");
  }

  inverse() {
    let iSMap = {};
    for (let key in this.sMap) {
      iSMap[this.sMap[key]] = key;
    }
    let iDCycles = this.dCycles
      .map(({cycleIndex, period, direction}) => new DCycle(cycleIndex, period, period - direction))
      .reverse();
    return new SCycle(iSMap, iDCycles);
  }

  overlaps(sCycle) {
    for (let key in sCycle.sMap) {
      if (this.sMap[key]) {
        return true;
      }
    }
    return false;
  }
}

SCycle.fromCycle = cycle => {
  let scycles = [];
  for (let direction = 1; direction < cycle.period; direction++) {
    let sMap = {};
    for (let collection of cycle.stickerCollections) {
      if (collection.length === 1) continue;
      let increment = direction * collection.length / cycle.period;
      for (let index = 0; index < collection.length; index++) {
        let sticker = collection[index];
        sMap[sticker.id] = collection[mod(index - increment, collection.length)].id;
      };
    };
    scycles.push(new SCycle(sMap, [new DCycle(cycle.index, cycle.period, direction)]));
  }
  return scycles;
};

SCycle.fromSCycles = sCycles => {
  let sMap = {};
  let dCycles = [];
  sCycles.forEach(sCycle => {
    let newSMap = {};
    for (let targetStickerId in sMap) {
      let sourceStickerId = sMap[targetStickerId];
      newSMap[targetStickerId] = sourceStickerId;
    }
    for (let targetStickerId in sCycle.sMap) {
      let sourceStickerId = sCycle.sMap[targetStickerId];
      if (sMap[sourceStickerId]) {
        newSMap[targetStickerId] = sMap[sourceStickerId];
      } else {
        newSMap[targetStickerId] = sourceStickerId;
      }
    };
    sMap = newSMap;
    dCycles = dCycles.concat(sCycle.dCycles);
  });
  for (let targetStickerId in sMap) {
    let sourceStickerId = sMap[targetStickerId];
    if (targetStickerId == sourceStickerId) {
      delete sMap[targetStickerId];
    }
  };
  return new SCycle(sMap, dCycles);
};
