class Cube extends Puzzle {
  constructor(size = 2, fullSpan = 250) {
    const width = fullSpan / size;
    const span = fullSpan / 2;
    const alphaM = Math.PI / 2;
    const animationSteps = 10;
    const animationConfig = {
      steps: animationSteps,
      dAlpha: alphaM / animationSteps,
    };
    const grid = {};
    const faces = [];
    const faceConfig = [
      { fixed: "x", direction: -1, variable: ["y", "z"], color: "yellow" },
      { fixed: "x", direction: 1, variable: ["y", "z"], color: "white" },
      { fixed: "y", direction: -1, variable: ["z", "x"], color: "blue" },
      { fixed: "y", direction: 1, variable: ["z", "x"], color: "lawngreen" },
      { fixed: "z", direction: -1, variable: ["x", "y"], color: "red" },
      { fixed: "z", direction: 1, variable: ["x", "y"], color: "darkorange" },
    ];
    const cycleFamilyConfig = [
      {
        slices: [
          { fIndex: 1, sIndex: 0, sJump: size, cJump: 1 },
          { fIndex: 3, sIndex: size - 1, sJump: -1, cJump: size },
          { fIndex: 0, sIndex: (size - 1) * size, sJump: -size, cJump: 1 },
          { fIndex: 2, sIndex: 0, sJump: 1, cJump: size },
        ],
        attachedFaces: { ffIndex: 4, lfIndex: 5, iStep: size, jStep: 1 },
        unitVector: new Vector(new Point(0, 0, 1)),
      },
      {
        slices: [
          { fIndex: 1, sIndex: 0, sJump: 1, cJump: size },
          { fIndex: 5, sIndex: (size - 1) * size, sJump: -size, cJump: 1 },
          { fIndex: 0, sIndex: size - 1, sJump: -1, cJump: size },
          { fIndex: 4, sIndex: 0, sJump: size, cJump: 1 },
        ],
        attachedFaces: { ffIndex: 2, lfIndex: 3, iStep: 1, jStep: size },
        unitVector: new Vector(new Point(0, -1, 0)),
      },
      {
        slices: [
          { fIndex: 2, sIndex: 0, sJump: size, cJump: 1 },
          { fIndex: 5, sIndex: 0, sJump: 1, cJump: size },
          { fIndex: 3, sIndex: (size - 1) * size, sJump: -size, cJump: 1 },
          { fIndex: 4, sIndex: size - 1, sJump: -1, cJump: size },
        ],
        attachedFaces: { ffIndex: 0, lfIndex: 1, iStep: 1, jStep: size },
        unitVector: new Vector(new Point(-1, 0, 0)),
      },
    ];
    const fSliceConfig = [
      { key: "iStep", dir: 1 },
      { key: "jStep", dir: 1 },
      { key: "iStep", dir: -1 },
      { key: "jStep", dir: -1 },
    ];

    let v1;
    let v2;
    let pointDef;
    let pid;
    let sid;
    let spoints;
    faceConfig.forEach((config, f) => {
      const stickers = [];
      v1 = -span;
      for (let i = 0; i <= size; i++) {
        v2 = -span;
        for (let j = 0; j <= size; j++) {
          pid = `p-${f}-${i}-${j}`;
          pointDef = {};
          pointDef[config.fixed] = config.direction * span;
          pointDef[config.variable[0]] = v1;
          pointDef[config.variable[1]] = v2;
          grid[pid] = new Point(pointDef.x, pointDef.y, pointDef.z, pid);
          if (i && j) {
            sid = `s-${f}-${i}-${j}`;
            spoints = [
              grid[`p-${f}-${i}-${j}`].clone(),
              grid[`p-${f}-${i - 1}-${j}`].clone(),
              grid[`p-${f}-${i - 1}-${j - 1}`].clone(),
              grid[`p-${f}-${i}-${j - 1}`].clone(),
            ];
            if (config.direction === -1) {
              spoints.reverse();
            }
            stickers.push(new Sticker(sid, config.color, spoints));
          }
          v2 += width;
        }
        v1 += width;
      }
      faces.push(new Face(stickers));
    });

    const cycles = [];
    let cycle;
    let stickerCollection;
    let stickerIndex;
    let fCycle;
    let lCycle;
    let fFace;
    let lFace;
    cycleFamilyConfig.forEach((config) => {
      for (let c = 0; c < size; c++) {
        cycle = new Cycle(
          cycles.length,
          [],
          4,
          config.unitVector,
          animationConfig
        );
        stickerCollection = [];
        config.slices.forEach((slice) => {
          for (let s = 0; s < size; s++) {
            stickerIndex = slice.sIndex + s * slice.sJump + c * slice.cJump;
            stickerCollection.push(faces[slice.fIndex].stickers[stickerIndex]);
          }
        });
        cycle.stickerCollections.push(stickerCollection);
        cycles.push(cycle);
      }
      fCycle = cycles[cycles.length - size];
      fFace = faces[config.attachedFaces.ffIndex];
      for (let c = 0; c < Math.floor(size / 2); c++) {
        stickerCollection = [];
        stickerIndex = c * (size + 1);
        fSliceConfig.forEach(({ key, dir }) => {
          for (let s = 0; s < size - 2 * c - 1; s++) {
            stickerCollection.push(fFace.stickers[stickerIndex]);
            stickerIndex += config.attachedFaces[key] * dir;
          }
        });
        fCycle.stickerCollections.push(stickerCollection);
      }
      lCycle = cycles[cycles.length - 1];
      lFace = faces[config.attachedFaces.lfIndex];
      for (let c = 0; c < Math.floor(size / 2); c++) {
        stickerCollection = [];
        stickerIndex = c * (size + 1);
        fSliceConfig.forEach(({ key, dir }) => {
          for (let s = 0; s < size - 2 * c - 1; s++) {
            stickerCollection.push(lFace.stickers[stickerIndex]);
            stickerIndex += config.attachedFaces[key] * dir;
          }
        });
        lCycle.stickerCollections.push(stickerCollection);
      }
      if (size % 2) {
        fCycle.stickerCollections.push([fFace.stickers[(size * size - 1) / 2]]);
        lCycle.stickerCollections.push([lFace.stickers[(size * size - 1) / 2]]);
      }
    });
    cycles.forEach((cycle) => {
      cycle.stickerCollections[0].isPrimary = true;
      cycle.computeStickerCover();
    });
    super("Cube", size, faces, cycles);

    this.saveOrientation({
      axis: new Vector({ x: 0, y: 1, z: 0 }),
      angle: Math.PI / 4,
    });
    this.saveOrientation({
      axis: new Vector({ x: 1, y: 0, z: 0 }),
      angle: Math.PI / 8,
    });
  }
}
