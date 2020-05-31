class Cluster {
    constructor(stickers) {
        this.stickers = stickers;
    }
}

Cluster.fromAtomicComposableCycles = atomicComposableCycles => {
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
    let dfs = (u, scc=[])  => {
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
            stronglyConnectecComponent = dfs(node);
            clusters.push(new Cluster(stronglyConnectecComponent));
        }
    }
    return clusters;
}
