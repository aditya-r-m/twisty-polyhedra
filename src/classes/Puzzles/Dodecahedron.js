class Dodecahedron extends Puzzle {
  constructor(size = 1, width = 200) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const scale = width / 2;
    const scaledPhi = scale * phi;
    const scaledPhiInverse = (scale * 1) / phi;
    const faces = [];
    const cycles = [];
    const grid = {};
    const stickerMap = {};
    const alphaM = (2 * Math.PI) / 5;
    const animationSteps = 10;
    const animationConfig = {
      steps: animationSteps,
      dAlpha: alphaM / animationSteps,
    };
    const rootPoints = [
      new Point(scale, scale, scale, "r0"),
      new Point(scale, scale, -scale, "r1"),
      new Point(scale, -scale, scale, "r2"),
      new Point(scale, -scale, -scale, "r3"),
      new Point(-scale, scale, scale, "r4"),
      new Point(-scale, scale, -scale, "r5"),
      new Point(-scale, -scale, scale, "r6"),
      new Point(-scale, -scale, -scale, "r7"),

      new Point(scaledPhi, scaledPhiInverse, 0, "r8"),
      new Point(scaledPhi, -scaledPhiInverse, 0, "r9"),
      new Point(-scaledPhi, scaledPhiInverse, 0, "r10"),
      new Point(-scaledPhi, -scaledPhiInverse, 0, "r11"),

      new Point(0, scaledPhi, scaledPhiInverse, "r12"),
      new Point(0, scaledPhi, -scaledPhiInverse, "r13"),
      new Point(0, -scaledPhi, scaledPhiInverse, "r14"),
      new Point(0, -scaledPhi, -scaledPhiInverse, "r15"),

      new Point(scaledPhiInverse, 0, scaledPhi, "r16"),
      new Point(scaledPhiInverse, 0, -scaledPhi, "r17"),
      new Point(-scaledPhiInverse, 0, scaledPhi, "r18"),
      new Point(-scaledPhiInverse, 0, -scaledPhi, "r19"),
    ];
    const faceConfig = [
      {
        points: [
          rootPoints[8],
          rootPoints[1],
          rootPoints[13],
          rootPoints[12],
          rootPoints[0],
        ],
        color: "purple",
      },
      {
        points: [
          rootPoints[9],
          rootPoints[2],
          rootPoints[14],
          rootPoints[15],
          rootPoints[3],
        ],
        color: "magenta",
      },
      {
        points: [
          rootPoints[10],
          rootPoints[4],
          rootPoints[12],
          rootPoints[13],
          rootPoints[5],
        ],
        color: "white",
      },
      {
        points: [
          rootPoints[11],
          rootPoints[7],
          rootPoints[15],
          rootPoints[14],
          rootPoints[6],
        ],
        color: "yellow",
      },
      {
        points: [
          rootPoints[12],
          rootPoints[4],
          rootPoints[18],
          rootPoints[16],
          rootPoints[0],
        ],
        color: "pink",
      },
      {
        points: [
          rootPoints[13],
          rootPoints[1],
          rootPoints[17],
          rootPoints[19],
          rootPoints[5],
        ],
        color: "blue",
      },
      {
        points: [
          rootPoints[14],
          rootPoints[2],
          rootPoints[16],
          rootPoints[18],
          rootPoints[6],
        ],
        color: "green",
      },
      {
        points: [
          rootPoints[15],
          rootPoints[7],
          rootPoints[19],
          rootPoints[17],
          rootPoints[3],
        ],
        color: "crimson",
      },
      {
        points: [
          rootPoints[16],
          rootPoints[2],
          rootPoints[9],
          rootPoints[8],
          rootPoints[0],
        ],
        color: "red",
      },
      {
        points: [
          rootPoints[17],
          rootPoints[1],
          rootPoints[8],
          rootPoints[9],
          rootPoints[3],
        ],
        color: "lawngreen",
      },
      {
        points: [
          rootPoints[18],
          rootPoints[4],
          rootPoints[10],
          rootPoints[11],
          rootPoints[6],
        ],
        color: "brown",
      },
      {
        points: [
          rootPoints[19],
          rootPoints[7],
          rootPoints[11],
          rootPoints[10],
          rootPoints[5],
        ],
        color: "skyblue",
      },
    ];
    const getCycleVector = (attachedFace) =>
      faceConfig[attachedFace].points.reduce(
        (v, p) => v.add(p),
        new Vector({ x: 0, y: 0, z: 0 })
      );
    const cycleFamilyConfig = [];
    for (let c = 0; c < 12; c++) {
      const cycleConfig = {
        unitVector: getCycleVector(c),
        slices: { length: 5 },
      };
      let face;
      let startV;
      let endV;
      for (face = 0; face < 12; face++) {
        if (face != c) {
          for (let u = 0; u < 5; u++) {
            for (let v = 0; v < 5; v++) {
              if (
                faceConfig[c].points[u].id === faceConfig[face].points[v].id &&
                faceConfig[c].points[mod(u + 1, 5)].id ===
                  faceConfig[face].points[mod(v - 1, 5)].id
              ) {
                startV = v;
                endV = mod(v - 1, 5);
                cycleConfig.slices[u] = { face, startV, endV };
              }
            }
          }
        }
      }
      cycleConfig.slices = Array.prototype.slice.apply(cycleConfig.slices);
      cycleFamilyConfig.push(cycleConfig);
    }
    faceConfig.forEach((config, f) => {
      const stickers = [];
      config.points.forEach((refPoint, p) => {
        const baseVector = new Vector(refPoint);
        const vI = new Vector(
          refPoint,
          config.points[mod(p + 1, config.points.length)]
        ).multiply(1 / (2 * size));
        const vJ = new Vector(
          refPoint,
          config.points[mod(p - 1, config.points.length)]
        ).multiply(1 / (2 * size));
        let pointVector;
        let i;
        let j;
        for (i = 0; i <= size; i++) {
          for (j = 0; j <= size; j++) {
            pointVector = baseVector.add(vI.multiply(i)).add(vJ.multiply(j));
            grid[`p-${f}-${p}-${i}-${j}`] = new Point(
              pointVector.x,
              pointVector.y,
              pointVector.z
            );
            if (i && j) {
              stickers.push(
                new Sticker(`s-${f}-${p}-${i - 1}-${j - 1}`, config.color, [
                  grid[`p-${f}-${p}-${i}-${j}`].clone(),
                  grid[`p-${f}-${p}-${i - 1}-${j}`].clone(),
                  grid[`p-${f}-${p}-${i - 1}-${j - 1}`].clone(),
                  grid[`p-${f}-${p}-${i}-${j - 1}`].clone(),
                ])
              );
              stickerMap[stickers[stickers.length - 1].id] =
                stickers[stickers.length - 1];
            }
          }
        }
        const vl = new Vector(
          config.points[mod(p, config.points.length)],
          config.points[mod(p - 1, config.points.length)]
        ).multiply(1 / (2 * size));
        const vr = new Vector(
          config.points[mod(p + 1, config.points.length)],
          config.points[mod(p + 2, config.points.length)]
        ).multiply(1 / (2 * size));
        const midVector = baseVector.add(vI.multiply(size));
        let lVector;
        let rVector;
        for (i = 0; i <= size; i++) {
          lVector = midVector.add(vl.multiply(i));
          rVector = midVector.add(vr.multiply(i));
          grid[`p-m-${f}-${p}-${i}-l`] = new Point(
            lVector.x,
            lVector.y,
            lVector.z
          );
          grid[`p-m-${f}-${p}-${i}-r`] = new Point(
            rVector.x,
            rVector.y,
            rVector.z
          );
          if (i) {
            stickers.push(
              new Sticker(`s-${f}-${p}-${i - 1}-${size}`, config.color, [
                grid[`p-m-${f}-${p}-${i}-l`].clone(),
                grid[`p-m-${f}-${p}-${i}-r`].clone(),
                grid[`p-m-${f}-${p}-${i - 1}-r`].clone(),
                grid[`p-m-${f}-${p}-${i - 1}-l`].clone(),
              ])
            );
            stickerMap[stickers[stickers.length - 1].id] =
              stickers[stickers.length - 1];
          }
        }
        const cVector = baseVector
          .add(vI.multiply(size))
          .add(vJ.multiply(size));
        grid[`p-${f}-${p}`] = new Point(cVector.x, cVector.y, cVector.z);
      });
      stickers.push(
        new Sticker(`s-${f}`, config.color, [
          grid[`p-${f}-0`].clone(),
          grid[`p-${f}-1`].clone(),
          grid[`p-${f}-2`].clone(),
          grid[`p-${f}-3`].clone(),
          grid[`p-${f}-4`].clone(),
        ])
      );
      stickerMap[stickers[stickers.length - 1].id] =
        stickers[stickers.length - 1];
      faces.push(new Face(stickers));
    });
    cycleFamilyConfig.forEach((config, attachedFace) => {
      let firstCycle;
      for (let i = 0; i < size; i++) {
        const cycle = new Cycle(
          cycles.length,
          [],
          5,
          config.unitVector,
          animationConfig
        );
        for (let j = 0; j < size; j++) {
          const stickerCollection = [];
          config.slices.forEach((slice) => {
            stickerCollection.push(
              stickerMap[`s-${slice.face}-${slice.startV}-${i}-${j}`]
            );
            stickerCollection.push(
              stickerMap[`s-${slice.face}-${slice.endV}-${j}-${i}`]
            );
          });
          cycle.stickerCollections.push(stickerCollection);
        }
        const stickerCollection = [];
        config.slices.forEach((slice) => {
          stickerCollection.push(
            stickerMap[`s-${slice.face}-${slice.endV}-${i}-${size}`]
          );
        });
        cycle.stickerCollections.push(stickerCollection);
        cycle.stickerCollections.forEach(
          (stickerCollection) => (stickerCollection.isPrimary = true)
        );
        cycles.push(cycle);
        if (!i) firstCycle = cycle;
      }
      for (let i = 0; i < size; i++) {
        for (let j = 0; j <= size; j++) {
          const stickerCollection = [];
          for (let p = 0; p < 5; p++) {
            stickerCollection.push(
              stickerMap[`s-${attachedFace}-${p}-${i}-${j}`]
            );
          }
          firstCycle.stickerCollections.push(stickerCollection);
        }
      }
      firstCycle.stickerCollections.push([stickerMap[`s-${attachedFace}`]]);
    });
    cycles.forEach((cycle) => cycle.computeStickerCover());
    super("Dodecahedron", size << 1, faces, cycles);
    this.saveOrientation({
      axis: new Vector({ x: 1, y: 0, z: 0 }),
      angle: -Math.PI / 5,
    });
  }
}
