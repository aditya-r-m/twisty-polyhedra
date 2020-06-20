class Icosahedron extends Puzzle {
  constructor(size = 2, fullSpan = 200) {
    const grid = {};
    const stickerMap = {};
    const faces = [];
    const cycles = [];
    const alphaM = (2 * Math.PI) / 5;
    const animationSteps = 10;
    const animationConfig = {
      steps: animationSteps,
      dAlpha: alphaM / animationSteps,
    };
    const scaledUnit = fullSpan / 2;
    const scaledPhi = (scaledUnit * (1 + Math.sqrt(5))) / 2;
    const rootPoints = [
      new Point(0, scaledPhi, scaledUnit, "r0"),
      new Point(0, scaledPhi, -scaledUnit, "r1"),
      new Point(0, -scaledPhi, scaledUnit, "r2"),
      new Point(0, -scaledPhi, -scaledUnit, "r3"),

      new Point(scaledPhi, scaledUnit, 0, "r4"),
      new Point(scaledPhi, -scaledUnit, 0, "r5"),
      new Point(-scaledPhi, scaledUnit, 0, "r6"),
      new Point(-scaledPhi, -scaledUnit, 0, "r7"),

      new Point(scaledUnit, 0, scaledPhi, "r8"),
      new Point(-scaledUnit, 0, scaledPhi, "r9"),
      new Point(scaledUnit, 0, -scaledPhi, "r10"),
      new Point(-scaledUnit, 0, -scaledPhi, "r11"),
    ];
    const faceConfig = [
      { points: [rootPoints[0], rootPoints[4], rootPoints[1]], color: "white" },
      { points: [rootPoints[0], rootPoints[1], rootPoints[6]], color: "blue" },
      { points: [rootPoints[0], rootPoints[6], rootPoints[9]], color: "red" },
      {
        points: [rootPoints[0], rootPoints[9], rootPoints[8]],
        color: "lawngreen",
      },
      {
        points: [rootPoints[0], rootPoints[8], rootPoints[4]],
        color: "skyblue",
      },

      {
        points: [rootPoints[3], rootPoints[2], rootPoints[7]],
        color: "orange",
      },
      {
        points: [rootPoints[3], rootPoints[5], rootPoints[2]],
        color: "darkolivegreen",
      },
      {
        points: [rootPoints[3], rootPoints[10], rootPoints[5]],
        color: "yellow",
      },
      {
        points: [rootPoints[3], rootPoints[11], rootPoints[10]],
        color: "lightgreen",
      },
      {
        points: [rootPoints[3], rootPoints[7], rootPoints[11]],
        color: "salmon",
      },

      {
        points: [rootPoints[4], rootPoints[5], rootPoints[10]],
        color: "magenta",
      },
      {
        points: [rootPoints[1], rootPoints[10], rootPoints[11]],
        color: "crimson",
      },
      {
        points: [rootPoints[6], rootPoints[11], rootPoints[7]],
        color: "indigo",
      },
      { points: [rootPoints[9], rootPoints[7], rootPoints[2]], color: "brown" },
      {
        points: [rootPoints[8], rootPoints[2], rootPoints[5]],
        color: "darkblue",
      },

      { points: [rootPoints[2], rootPoints[8], rootPoints[9]], color: "pink" },
      {
        points: [rootPoints[5], rootPoints[4], rootPoints[8]],
        color: "burlywood",
      },
      {
        points: [rootPoints[10], rootPoints[1], rootPoints[4]],
        color: "darkcyan",
      },
      {
        points: [rootPoints[11], rootPoints[6], rootPoints[1]],
        color: "darkmagenta",
      },
      {
        points: [rootPoints[7], rootPoints[9], rootPoints[6]],
        color: "goldenrod",
      },
    ];
    faceConfig.forEach((f, i) => (f.id = i));
    const faceSliceConfig = {};
    const cycleFamilyConfig = [];
    rootPoints.forEach((point) => {
      const rootID = point.id;
      const config = { root: point, faces: [] };
      const pointChain = [];
      let face = faceConfig.find(({ points }) =>
        points.find((p) => p.id === rootID)
      );
      config.faces.push(face);
      pointChain.push(
        face.points[mod(face.points.findIndex((p) => p.id === rootID) + 2, 3)]
          .id
      );
      for (let c = 0; c < 4; c++) {
        const p0id = rootID;
        const p1id =
          face.points[mod(face.points.findIndex((p) => p.id === rootID) + 1, 3)]
            .id;
        const p2id =
          face.points[mod(face.points.findIndex((p) => p.id === rootID) + 2, 3)]
            .id;
        face = faceConfig.find(
          ({ points }) =>
            !points.find((p) => p.id === p1id) &&
            points.find((p) => p.id === p0id) &&
            points.find((p) => p.id === p2id)
        );
        config.faces.push(face);
      }
      cycleFamilyConfig.push(config);
    });
    faceConfig.forEach(({ points, color }, f) => {
      const stickers = [];
      const baseVector = new Vector(points[0]);
      const vI = new Vector(points[0], points[1]).multiply(1 / size);
      const vJ = new Vector(points[1], points[2]).multiply(1 / size);
      let pointVector;
      let i;
      let j;
      for (i = 0; i <= size; i++) {
        for (j = 0; j <= i; j++) {
          pointVector = baseVector.add(vI.multiply(i)).add(vJ.multiply(j));
          grid[`p-${f}-${i}-${j}`] = new Point(
            pointVector.x,
            pointVector.y,
            pointVector.z
          );
          if (i && j) {
            stickers.push(
              new Sticker(`s-${f}-${i}-${j}`, color, [
                grid[`p-${f}-${i - 1}-${j - 1}`].clone(),
                grid[`p-${f}-${i}-${j - 1}`].clone(),
                grid[`p-${f}-${i}-${j}`].clone(),
              ])
            );
            stickerMap[stickers[stickers.length - 1].id] =
              stickers[stickers.length - 1];
            if (j < i) {
              stickers.push(
                new Sticker(`s-${f}-${i}-${j}-r`, color, [
                  grid[`p-${f}-${i}-${j}`].clone(),
                  grid[`p-${f}-${i - 1}-${j}`].clone(),
                  grid[`p-${f}-${i - 1}-${j - 1}`].clone(),
                ])
              );
              stickerMap[stickers[stickers.length - 1].id] =
                stickers[stickers.length - 1];
            }
          }
        }
      }
      faces.push(new Face(stickers));

      const sliceConfig = {};
      sliceConfig[points[0].id] = [];
      for (let i = 1; i <= size; i++) {
        const slice = [];
        for (let j = 1; j <= i; j++) {
          slice.push(stickerMap[`s-${f}-${i}-${j}`]);
          if (j < i) {
            slice.push(stickerMap[`s-${f}-${i}-${j}-r`]);
          }
        }
        sliceConfig[points[0].id].push(slice);
      }
      sliceConfig[points[1].id] = [];
      for (let i = 1; i <= size; i++) {
        const slice = [];
        for (let j = 1; j <= i; j++) {
          slice.push(stickerMap[`s-${f}-${size - (j - 1)}-${i - (j - 1)}`]);
          if (j < i) {
            slice.push(stickerMap[`s-${f}-${size - (j - 1)}-${i - j}-r`]);
          }
        }
        sliceConfig[points[1].id].push(slice);
      }
      sliceConfig[points[2].id] = [];
      for (let i = 1; i <= size; i++) {
        const slice = [];
        for (let j = 1; j <= i; j++) {
          slice.push(
            stickerMap[`s-${f}-${size + (j - 1) - (i - 1)}-${size - (i - 1)}`]
          );
          if (j < i) {
            slice.push(
              stickerMap[
                `s-${f}-${size + 1 + (j - 1) - (i - 1)}-${size - (i - 1)}-r`
              ]
            );
          }
        }
        sliceConfig[points[2].id].push(slice);
      }
      faceSliceConfig[f] = sliceConfig;
    });

    cycleFamilyConfig.forEach(({ faces, root }) => {
      for (let c = 0; c < size; c++) {
        const unitVector = new Vector(root).unit();
        const stickerCollections = [
          Array.prototype.concat.apply(
            [],
            faces.map(({ id }) => faceSliceConfig[id][root.id][c])
          ),
        ];
        cycles.push(
          new Cycle(
            cycles.length,
            stickerCollections,
            5,
            unitVector,
            animationConfig
          )
        );
      }
    });
    cycles.forEach((cycle) => {
      cycle.stickerCollections[0].isPrimary = true;
      cycle.computeStickerCover();
    });
    super("Icosahedron", size, faces, cycles);

    this.saveOrientation({
      axis: new Vector({ x: 1, y: 0, z: 0 }),
      angle: (-27 * Math.PI) / 40,
    });
  }
}
