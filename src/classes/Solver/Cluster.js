class Cluster {
    constructor(stickers, atomicComposableCycles) {
        this.stickers = stickers;
        this.id = 'z';
        for (let sticker of stickers) {
            if (this.id > sticker) {
                this.id = sticker;
            }
        }
        this.id += '-cluster';
        this.size = this.stickers.length;
        this.atomicComposableCycles = atomicComposableCycles;
        this.commutators = this.generateCommutators();
    }

    countCycleOverlap(cycle) {
        let overlap = 0;
        for (let sticker of this.stickers) {
            if (cycle.swapMap[sticker]) {
                overlap++;
            }
        }
        return overlap;
    }

    generateCommutators() {
        let conjugates = [];

        for (let i = 0; i < this.atomicComposableCycles.length; i++) {
            for (let j = 0; j < this.atomicComposableCycles.length; j++) {
                if (this.atomicComposableCycles[i].directedCycles[0].cycleIndex != this.atomicComposableCycles[j].directedCycles[0].cycleIndex
                    && this.atomicComposableCycles[i].overlaps(this.atomicComposableCycles[j])) {
                    let conjugate = ComposableCycle.fromComposableCycles([
                        this.atomicComposableCycles[i], this.atomicComposableCycles[j], this.atomicComposableCycles[i].inverse()]);
                    if (this.countCycleOverlap(conjugate)) {
                        conjugates.push(conjugate);
                    }
                }
            }
        }
        let commutatorMap = {};
        for (let conjugate of conjugates) {
            for (let atomicComposableCycle of this.atomicComposableCycles) {
                if (conjugate.overlaps(atomicComposableCycle)) {
                    let commutator = ComposableCycle.fromComposableCycles([
                        conjugate, atomicComposableCycle, conjugate.inverse(), atomicComposableCycle.inverse()]);
                    if (commutator.size > 0 && commutator.size % 3 == 0
                        && commutator.size < atomicComposableCycle.size && commutator.size < conjugate.size
                        && this.countCycleOverlap(commutator) && this.countCycleOverlap(commutator) < this.size - 3) {
                        let sketch = commutator.getSketch();
                        if (!commutatorMap[sketch] || commutatorMap[sketch].size > commutator.size) {
                            commutatorMap[commutator.getSketch()] = commutator;
                        }
                    }
                }
            };
        };
        let commutators = Object.values(commutatorMap);
        if (!commutators.length) return [];
        let minOverlap = this.countCycleOverlap(commutators[0]);
        for (let commutator of commutators) {
            let curOverlap = this.countCycleOverlap(commutator);
            if (curOverlap < minOverlap) {
                minOverlap = curOverlap;
            }
        }
        return commutators
            .filter(c => this.countCycleOverlap(c) === minOverlap)
            .sort((ca, cb) => ca.size - cb.size);
    }
}

Cluster.fromAtomicComposableCycles = atomicComposableCycles => {
    let stickerToAtomicComposableCycleMap = {};
    for (let atomicComposableCycle of atomicComposableCycles) {
        for (let sticker in atomicComposableCycle.swapMap) {
            if (!stickerToAtomicComposableCycleMap[sticker]) {
                stickerToAtomicComposableCycleMap[sticker] = [];
            }
            stickerToAtomicComposableCycleMap[sticker].push(atomicComposableCycle);
        }
    }

    let clusters = [];
    let stickerGraph = {};
    let addEdge = (sa, sb) => {
        if (!stickerGraph[sa]) stickerGraph[sa] = [];
        stickerGraph[sa].push(sb);
    }
    for (let atomicComposableCycle of atomicComposableCycles) {
        for (let targetStickerId in atomicComposableCycle.swapMap) {
            addEdge(atomicComposableCycle.swapMap[targetStickerId], targetStickerId);
        }
    }
    let nodes = Object.keys(stickerGraph);
    let visited = [];
    let dfs = (u, scc = []) => {
        visited[u] = true;
        scc.push(u);
        for (let v of stickerGraph[u]) {
            if (!visited[v]) {
                dfs(v, scc);
            }
        }
        return scc;
    }
    for (let node of nodes) {
        if (!visited[node]) {
            stronglyConnectedComponent = dfs(node);
            let atomicComposableCycles = [];
            let addedACCs = {};
            for (let sticker of stronglyConnectedComponent) {
                for (let atomicComposableCycle of stickerToAtomicComposableCycleMap[sticker]) {
                    let dCycle = atomicComposableCycle.directedCycles[0];
                    let acc = dCycle.cycleIndex + "-" + dCycle.direction;
                    if (!addedACCs[acc]) {
                        addedACCs[acc] = true;
                        atomicComposableCycles.push(atomicComposableCycle);
                    }
                }
            }
            clusters.push(new Cluster(stronglyConnectedComponent, atomicComposableCycles));
        }
    }
    return clusters;
}
