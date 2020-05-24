
class DCycle {
  constructor(cycle, direction) {
    this.cycle = cycle;
    this.direction = direction;
  }
}

class SCycle {
  constructor(sMap, dCycles) {
    this.sMap = sMap;
    this.dCycles = dCycles;
    this.size = Object.keys(sMap).length;
    this.$id = undefined;
  }

  getId() {
    if (this.$id == undefined) {
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
        this.$id = orderedSs.join("-");
    }
    return this.$id;
  }

  inverse() {
    let iSMap = {};
    let iDCycles = [];
    Object.entries(this.sMap).forEach(([k, v]) => {
      iSMap[v] = k;
    });
    this.dCycles.map(i => i).reverse().forEach(dCycle => {
      let iDirection = dCycle.cycle.period - dCycle.direction;
      iDCycles.push(new DCycle(dCycle.cycle, iDirection));
    });
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
    cycle.stickerCollections.forEach(collection => {
      if (collection.length === 1) return;
      let increment = direction * collection.length / cycle.period;
      collection.forEach((sticker, index) => {
          sMap[sticker.id] = collection[mod(index - increment, collection.length)].id;
      });
    });
    scycles.push(new SCycle(sMap, [new DCycle(cycle, direction)]));
  }
  return scycles;
};

SCycle.fromSCycles = sCycles => {
  let sMap = {};
  let dCycles = [];
  sCycles.forEach(sCycle => {
    let newSMap = {};
    Object.entries(sMap).forEach(([targetStickerId, sourceStickerId]) => {
      newSMap[targetStickerId] = sourceStickerId;
    })
    Object.entries(sCycle.sMap).forEach(([targetStickerId, sourceStickerId]) => {
      if (sMap[sourceStickerId]) {
        newSMap[targetStickerId] = sMap[sourceStickerId];
      } else {
        newSMap[targetStickerId] = sourceStickerId;
      }
    });
    sMap = newSMap;
    dCycles = dCycles.concat(sCycle.dCycles);
  });
  Object.entries(sMap).forEach(([targetStickerId, sourceStickerId]) => {
    if (targetStickerId == sourceStickerId) {
      delete sMap[targetStickerId];
    }
  });
  return new SCycle(sMap, dCycles);
};
