this.getPairId = (t, s) => `${t}:${s}`;
this.getSubSequenceDescription = (cluster) =>
  cluster.commutators.length ? "Commutator" : "Twist";

// Special clusters are one of the following 2 cases,
// 1. The cluster does not have any commutators (ex. - Tetrahedron corner & "near-corner" clusters).
// 2. The best commutators on the cluster spill onto other clusters (ex. - Dodecahedron "star" clusters).
// These need to be solved before any other cluster is solved.
this.getSpecialClusters = (clusters) => {
  const specialClusters = [];
  const stickerToClusterMap = {};
  for (const cluster of clusters) {
    for (const sticker of cluster.stickers) {
      stickerToClusterMap[sticker] = cluster.id;
    }
  }
  const clusterDependencies = {};
  for (const cluster of clusters) {
    clusterDependencies[cluster.id] = {};
    for (const commutator of cluster.commutators) {
      for (const sticker in commutator.swapMap) {
        clusterDependencies[cluster.id][stickerToClusterMap[sticker]] = true;
      }
    }
  }
  for (const cluster of clusters) {
    let isSpecial = !cluster.commutators.length;
    if (!isSpecial) {
      for (let dependentCluster in clusterDependencies[cluster.id]) {
        if (!clusterDependencies[dependentCluster][cluster.id]) {
          isSpecial = true;
          break;
        }
      }
    }
    if (isSpecial) {
      specialClusters.push(cluster);
    }
  }
  return specialClusters;
};

// The core assumes that the given permutation is even.
// The aim is to compose puzzleStateAsComposableCycle permutation with commutators & atomic twists to make it's size 0.
this.solveEvenPuzzleState = (puzzleStateAsComposableCycle, clusters) => {
  this.moveCounter = 1;
  let stickerPairToCycleMap = {};
  const specialClusters = this.getSpecialClusters(clusters);
  clusters.sort((ca, cb) => cb.order - ca.order);
  specialClusters.sort((ca, cb) => cb.order - ca.order);
  stickerPairToCycleMap = {};

  // Map sticker pairs to corresponding cycles for fast lookups
  for (const cluster of clusters) {
    const composableCycles = cluster.commutators.length
      ? cluster.commutators
      : cluster.atomicComposableCycles;
    for (const composableCycle of composableCycles) {
      for (const targetStickerId in composableCycle.swapMap) {
        if (!cluster.stickers.find((s) => s === targetStickerId)) continue;
        const pairId = this.getPairId(
          targetStickerId,
          composableCycle.swapMap[targetStickerId]
        );
        if (!stickerPairToCycleMap[pairId]) {
          stickerPairToCycleMap[pairId] = [];
        }
        stickerPairToCycleMap[pairId].push(composableCycle);
      }
    }
  }
  // We optimize the approach by using simpler algorithms as much as possible.
  // The solver only attempts L0 & L1 algorithms which are low cost.
  // If any clusters remaing, only then it starts considering L2 & L3 type compositions which consume a lot of time.
  for (let complexityLimit of [2, 5]) {
    for (const cluster of specialClusters) {
      if (!cluster.countCycleOverlap(puzzleStateAsComposableCycle)) continue;
      // Solve special clusters first.
      puzzleStateAsComposableCycle = this.solveCluster(
        puzzleStateAsComposableCycle,
        cluster,
        stickerPairToCycleMap,
        (n, o) => cluster.countCycleOverlap(n) < cluster.countCycleOverlap(o),
        complexityLimit
      );
    }
  }
  for (let complexityLimit of [2, 5]) {
    for (const cluster of clusters) {
      if (!cluster.countCycleOverlap(puzzleStateAsComposableCycle)) continue;
      // Solve simpler clusters later.
      puzzleStateAsComposableCycle = this.solveCluster(
        puzzleStateAsComposableCycle,
        cluster,
        stickerPairToCycleMap,
        (n, o) =>
          n.size < o.size &&
          o.size - n.size >=
            cluster.countCycleOverlap(o) - cluster.countCycleOverlap(n),
        complexityLimit
      );
    }
  }
  return puzzleStateAsComposableCycle;
};

this.solveCluster = (
  puzzleStateAsComposableCycle,
  cluster,
  stickerPairToCycleMap,
  isProgress,
  complexityLimit
) => {
  let stillFindingImprovements = true;
  let newPuzzleStateAsComposableCycle;
  const clusterSolvers = [
    this.attemptL0Algorithms,
    this.attemptL1Algorithms,
    this.attemptL2Algorithms,
    this.attemptL3Algorithms,
    this.attemptL4Algorithms,
  ];
  while (stillFindingImprovements && puzzleStateAsComposableCycle.size) {
    stillFindingImprovements = false;
    for (const sticker of cluster.stickers) {
      if (puzzleStateAsComposableCycle.swapMap[sticker]) {
        for (
          let solverComplexity = 0;
          solverComplexity < complexityLimit;
          solverComplexity++
        ) {
          newPuzzleStateAsComposableCycle = clusterSolvers[solverComplexity](
            puzzleStateAsComposableCycle,
            cluster,
            sticker,
            stickerPairToCycleMap,
            isProgress
          );
          if (
            newPuzzleStateAsComposableCycle !== puzzleStateAsComposableCycle
          ) {
            puzzleStateAsComposableCycle = newPuzzleStateAsComposableCycle;
            stillFindingImprovements = true;
            break;
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

// Attempts simple twists/commutators
this.attemptL0Algorithms = (
  puzzleStateAsComposableCycle,
  cluster,
  sticker,
  stickerPairToCycleMap,
  isProgress
) => {
  const pairToFix = this.getPairId(
    puzzleStateAsComposableCycle.swapMap[sticker],
    sticker
  );
  if (stickerPairToCycleMap[pairToFix]) {
    for (const composableCycle of stickerPairToCycleMap[pairToFix]) {
      const newPuzzleStateAsComposableCycle =
        ComposableCycle.fromComposableCycles(
          [puzzleStateAsComposableCycle, composableCycle],
          [
            undefined,
            {
              sequence: `${this.moveCounter}) Simple Move`,
              subSequence: getSubSequenceDescription(cluster),
            },
          ]
        );
      if (
        isProgress(
          newPuzzleStateAsComposableCycle,
          puzzleStateAsComposableCycle
        )
      ) {
        this.moveCounter++;
        return newPuzzleStateAsComposableCycle;
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

// Attempts conjugated twists / commutators
this.attemptL1Algorithms = (
  puzzleStateAsComposableCycle,
  cluster,
  sticker,
  stickerPairToCycleMap,
  isProgress
) => {
  for (const atomicComposableCycle of cluster.atomicComposableCycles) {
    if (!atomicComposableCycle.swapMap[sticker]) continue;
    let linkingSticker;
    let targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
    for (const curSticker in atomicComposableCycle.swapMap) {
      if (atomicComposableCycle.swapMap[curSticker] === sticker) {
        linkingSticker = curSticker;
      }
      if (
        atomicComposableCycle.swapMap[curSticker] ===
        puzzleStateAsComposableCycle.swapMap[sticker]
      ) {
        targetSticker = curSticker;
      }
    }
    const pairToFix = this.getPairId(targetSticker, linkingSticker);
    if (stickerPairToCycleMap[pairToFix]) {
      for (const composableCycle of stickerPairToCycleMap[pairToFix]) {
        const newPuzzleStateAsComposableCycle =
          ComposableCycle.fromComposableCycles(
            [
              puzzleStateAsComposableCycle,
              atomicComposableCycle,
              composableCycle,
              atomicComposableCycle.inverse(),
            ],
            [
              undefined,
              {
                sequence: `${this.moveCounter}) Conjugated Move`,
                subSequence: "Setup move",
              },
              {
                sequence: `${this.moveCounter}) Conjugated Move`,
                subSequence: getSubSequenceDescription(cluster),
              },
              {
                sequence: `${this.moveCounter}) Conjugated Move`,
                subSequence: "Setup move inverse",
              },
            ]
          );
        if (
          isProgress(
            newPuzzleStateAsComposableCycle,
            puzzleStateAsComposableCycle
          )
        ) {
          this.moveCounter++;
          return newPuzzleStateAsComposableCycle;
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

// Atempts to pair up commutators - also, tries to conujugate second commutator by the first since it's practically free
this.attemptL2Algorithms = (
  puzzleStateAsComposableCycle,
  cluster,
  sticker,
  stickerPairToCycleMap,
  isProgress
) => {
  const sourceSticker = sticker;
  const targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
  for (const linkingSticker of cluster.stickers) {
    const pairToFixInitial = this.getPairId(linkingSticker, sourceSticker);
    const pairToFixFinal = this.getPairId(targetSticker, linkingSticker);
    if (linkingSticker === sourceSticker || linkingSticker === targetSticker) {
      continue;
    }
    if (stickerPairToCycleMap[pairToFixInitial]) {
      for (const composableCycleFirst of stickerPairToCycleMap[
        pairToFixInitial
      ]) {
        if (stickerPairToCycleMap[pairToFixFinal]) {
          for (const composableCycleSecond of stickerPairToCycleMap[
            pairToFixFinal
          ]) {
            let newPuzzleStateAsComposableCycle =
              ComposableCycle.fromComposableCycles(
                [
                  puzzleStateAsComposableCycle,
                  composableCycleFirst,
                  composableCycleSecond,
                ],
                [
                  undefined,
                  {
                    sequence: `${this.moveCounter}) Paired Move`,
                    subSequence: `First ${getSubSequenceDescription(cluster)}`,
                  },
                  {
                    sequence: `${this.moveCounter}) Paired Move`,
                    subSequence: `Second ${getSubSequenceDescription(cluster)}`,
                  },
                ]
              );
            if (
              isProgress(
                newPuzzleStateAsComposableCycle,
                puzzleStateAsComposableCycle
              )
            ) {
              this.moveCounter++;
              return newPuzzleStateAsComposableCycle;
            }
            newPuzzleStateAsComposableCycle =
              ComposableCycle.fromComposableCycles(
                [
                  puzzleStateAsComposableCycle,
                  composableCycleFirst,
                  composableCycleSecond,
                  composableCycleFirst.inverse(),
                ],
                [
                  undefined,
                  {
                    sequence: `${this.moveCounter}) Conjugated Pair`,
                    subSequence: `Setup ${getSubSequenceDescription(cluster)}`,
                  },
                  {
                    sequence: `${this.moveCounter}) Conjugated Pair`,
                    subSequence: `Core ${getSubSequenceDescription(cluster)}`,
                  },
                  {
                    sequence: `${this.moveCounter}) Conjugated Pair`,
                    subSequence: `Setup ${getSubSequenceDescription(
                      cluster
                    )} inverse`,
                  },
                ]
              );
            if (
              isProgress(
                newPuzzleStateAsComposableCycle,
                puzzleStateAsComposableCycle
              )
            ) {
              this.moveCounter++;
              return newPuzzleStateAsComposableCycle;
            }
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

// Attempts to conjuagte L2 type sequences with atomic twists
this.attemptL3Algorithms = (
  puzzleStateAsComposableCycle,
  cluster,
  sticker,
  stickerPairToCycleMap,
  isProgress
) => {
  for (const atomicComposableCycle of cluster.atomicComposableCycles) {
    if (!atomicComposableCycle.swapMap[sticker]) continue;
    let preLinkingSticker;
    let preTargetSticker;
    const targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
    for (const curSticker in atomicComposableCycle.swapMap) {
      if (atomicComposableCycle.swapMap[curSticker] === sticker) {
        preLinkingSticker = curSticker;
      }
      if (atomicComposableCycle.swapMap[curSticker] === targetSticker) {
        preTargetSticker = curSticker;
      }
    }
    for (const linkingSticker of cluster.stickers) {
      const pairToFixInitial = this.getPairId(
        linkingSticker,
        preLinkingSticker
      );
      const pairToFixFinal = this.getPairId(preTargetSticker, linkingSticker);
      if (
        linkingSticker === preLinkingSticker ||
        linkingSticker === preTargetSticker ||
        atomicComposableCycle.swapMap[linkingSticker]
      ) {
        continue;
      }
      if (stickerPairToCycleMap[pairToFixInitial]) {
        for (const composableCycleFirst of stickerPairToCycleMap[
          pairToFixInitial
        ]) {
          if (stickerPairToCycleMap[pairToFixFinal]) {
            for (const composableCycleSecond of stickerPairToCycleMap[
              pairToFixFinal
            ]) {
              let newPuzzleStateAsComposableCycle =
                ComposableCycle.fromComposableCycles(
                  [
                    puzzleStateAsComposableCycle,
                    atomicComposableCycle,
                    composableCycleFirst,
                    composableCycleSecond,
                    atomicComposableCycle.inverse(),
                  ],
                  [
                    undefined,
                    {
                      sequence: `${this.moveCounter}) Conjugated Pair`,
                      subSequence: `Setup move`,
                    },
                    {
                      sequence: `${this.moveCounter}) Conjugated Pair`,
                      subSequence: `First ${getSubSequenceDescription(
                        cluster
                      )}`,
                    },
                    {
                      sequence: `${this.moveCounter}) Conjugated Pair`,
                      subSequence: `Second ${getSubSequenceDescription(
                        cluster
                      )}`,
                    },
                    {
                      sequence: `${this.moveCounter}) Conjugated Pair`,
                      subSequence: `Setup move inverse`,
                    },
                  ]
                );
              if (
                isProgress(
                  newPuzzleStateAsComposableCycle,
                  puzzleStateAsComposableCycle
                )
              ) {
                this.moveCounter++;
                return newPuzzleStateAsComposableCycle;
              }
              newPuzzleStateAsComposableCycle =
                ComposableCycle.fromComposableCycles(
                  [
                    puzzleStateAsComposableCycle,
                    atomicComposableCycle,
                    composableCycleFirst,
                    composableCycleSecond,
                    composableCycleFirst.inverse(),
                    atomicComposableCycle.inverse(),
                  ],
                  [
                    undefined,
                    {
                      sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                      subSequence: `Setup move`,
                    },
                    {
                      sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                      subSequence: `First ${getSubSequenceDescription(
                        cluster
                      )}`,
                    },
                    {
                      sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                      subSequence: `Second ${getSubSequenceDescription(
                        cluster
                      )}`,
                    },
                    {
                      sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                      subSequence: `First ${getSubSequenceDescription(
                        cluster
                      )} inverse`,
                    },
                    {
                      sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                      subSequence: `Setup move inverse`,
                    },
                  ]
                );
              if (
                isProgress(
                  newPuzzleStateAsComposableCycle,
                  puzzleStateAsComposableCycle
                )
              ) {
                return newPuzzleStateAsComposableCycle;
              }
            }
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};

// Attempts to conjuagte L2 type sequences with 2 atomic twists
this.attemptL4Algorithms = (
  puzzleStateAsComposableCycle,
  cluster,
  sticker,
  stickerPairToCycleMap,
  isProgress
) => {
  for (const firstAtomicComposableCycle of cluster.atomicComposableCycles) {
    if (!firstAtomicComposableCycle.swapMap[sticker]) continue;
    for (const secondAtomicComposableCycle of cluster.atomicComposableCycles) {
      let setupMove = ComposableCycle.fromComposableCycles([
        firstAtomicComposableCycle,
        secondAtomicComposableCycle,
      ]);
      let preLinkingSticker;
      let preTargetSticker;
      const targetSticker = puzzleStateAsComposableCycle.swapMap[sticker];
      for (const curSticker in setupMove.swapMap) {
        if (setupMove.swapMap[curSticker] === sticker) {
          preLinkingSticker = curSticker;
        }
        if (setupMove.swapMap[curSticker] === targetSticker) {
          preTargetSticker = curSticker;
        }
      }
      for (const linkingSticker of cluster.stickers) {
        const pairToFixInitial = this.getPairId(
          linkingSticker,
          preLinkingSticker
        );
        const pairToFixFinal = this.getPairId(preTargetSticker, linkingSticker);
        if (
          linkingSticker === preLinkingSticker ||
          linkingSticker === preTargetSticker ||
          setupMove.swapMap[linkingSticker]
        ) {
          continue;
        }
        if (stickerPairToCycleMap[pairToFixInitial]) {
          for (const composableCycleFirst of stickerPairToCycleMap[
            pairToFixInitial
          ]) {
            if (stickerPairToCycleMap[pairToFixFinal]) {
              for (const composableCycleSecond of stickerPairToCycleMap[
                pairToFixFinal
              ]) {
                let newPuzzleStateAsComposableCycle =
                  ComposableCycle.fromComposableCycles(
                    [
                      puzzleStateAsComposableCycle,
                      setupMove,
                      composableCycleFirst,
                      composableCycleSecond,
                      setupMove.inverse(),
                    ],
                    [
                      undefined,
                      {
                        sequence: `${this.moveCounter}) Conjugated Pair`,
                        subSequence: `Setup move`,
                      },
                      {
                        sequence: `${this.moveCounter}) Conjugated Pair`,
                        subSequence: `First ${getSubSequenceDescription(
                          cluster
                        )}`,
                      },
                      {
                        sequence: `${this.moveCounter}) Conjugated Pair`,
                        subSequence: `Second ${getSubSequenceDescription(
                          cluster
                        )}`,
                      },
                      {
                        sequence: `${this.moveCounter}) Conjugated Pair`,
                        subSequence: `Setup move inverse`,
                      },
                    ]
                  );
                if (
                  isProgress(
                    newPuzzleStateAsComposableCycle,
                    puzzleStateAsComposableCycle
                  )
                ) {
                  this.moveCounter++;
                  return newPuzzleStateAsComposableCycle;
                }
                newPuzzleStateAsComposableCycle =
                  ComposableCycle.fromComposableCycles(
                    [
                      puzzleStateAsComposableCycle,
                      setupMove,
                      composableCycleFirst,
                      composableCycleSecond,
                      composableCycleFirst.inverse(),
                      setupMove.inverse(),
                    ],
                    [
                      undefined,
                      {
                        sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                        subSequence: `Setup move`,
                      },
                      {
                        sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                        subSequence: `First ${getSubSequenceDescription(
                          cluster
                        )}`,
                      },
                      {
                        sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                        subSequence: `Second ${getSubSequenceDescription(
                          cluster
                        )}`,
                      },
                      {
                        sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                        subSequence: `First ${getSubSequenceDescription(
                          cluster
                        )} inverse`,
                      },
                      {
                        sequence: `${this.moveCounter}) Nested Conjugated Pair`,
                        subSequence: `Setup move inverse`,
                      },
                    ]
                  );
                if (
                  isProgress(
                    newPuzzleStateAsComposableCycle,
                    puzzleStateAsComposableCycle
                  )
                ) {
                  return newPuzzleStateAsComposableCycle;
                }
              }
            }
          }
        }
      }
    }
  }
  return puzzleStateAsComposableCycle;
};
