class Tesseract {
  constructor(scale = 100) {
    this.displayName = "Tesseract";
    this.displaySize = 3;
    this.scale = scale;

    this.rotating = false;
    this.rotationInfo = { s: undefined, axis: undefined, direction: undefined };

    this.stickers = [];
    this.offset = 0.8;
    this.del = 0.16;
    this.radius = 0.08;
    this.stickers = buildTesseractStickers(this.offset, this.del, this.radius);
    this.cycles = buildTesseractCycles(this.stickers, this.offset, this.del);
    this.grid = [];
    for (let s of this.stickers) {
      this.grid.push({ w: s.w, x: s.x, y: s.y, z: s.z });
    }
  }

  clearStats() {
    this.startTime = undefined;
    this.movesMade = 0;
  }

  snapToGrid() {
    for (let s of this.stickers) {
      let g = this.grid.reduce((g1, g2) =>
        distsq4(g1, s) < distsq4(g2, s) ? g1 : g2
      );
      s.w = g.w;
      s.x = g.x;
      s.y = g.y;
      s.z = g.z;
    }
  }

  render(ctx, _inverted, _exploded) {
    this.stickers.forEach((sticker) => sticker.prepareRender(this.scale));
    this.stickers.sort((a, b) => b.rz - a.rz);
    this.stickers.forEach((sticker) => sticker.render(ctx));
  }

  updateOrientation(_, a = "w", b = "z", i = -1) {
    this.stickers.forEach((sticker) => {
      [sticker[a], sticker[b]] = rotate2(
        sticker[a],
        sticker[b],
        (parseFloat(i) * Math.PI) / 96
      );
    });
  }

  getUpdatedOrientation() {
    return {};
  }

  update() {
    if (this.rotating) {
      this.updateOrientation(
        undefined,
        "w",
        this.rotationInfo.axis,
        this.rotationInfo.direction
      );
      if (
        this.stickers.reduce((c, s) => c + s.centerOfView(this.offset), 0) == 27
      ) {
        this.snapToGrid();
        this.rotating = false;
        this.rotationInfo = {
          s: undefined,
          axis: undefined,
          direction: undefined,
        };
      }
    }
  }

  isSolved() {
    throw "Not Implemented";
  }

  grab(x, y, type) {
    if (this.rotating) return;
    let touchedSticker = this.stickers.findLast((s) => s.overlaps(x, y));
    if (!touchedSticker) return;
    if (!touchedSticker.closeToCenterOfView()) {
      this.rotating = true;
      this.rotationInfo.s = touchedSticker;
      this.rotationInfo.axis = ["x", "y", "z"].reduce(
        (c, a) =>
          Math.abs(touchedSticker[c]) > Math.abs(touchedSticker[a]) ? c : a,
        "x"
      );
      this.rotationInfo.direction =
        touchedSticker[this.rotationInfo.axis] < 0 ? 1 : -1;
    } else {
      let cycle = this.cycles.find((c) => c.index === touchedSticker.id);
      if (cycle) cycle.twist();
    }
  }

  drag(x, y) {}

  release() {}

  scramble() {
    throw "Not Implemented";
  }
}
