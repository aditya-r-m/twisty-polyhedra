class Tesseract {
  constructor(scale = 100) {
    this.displayName = "Tesseract";
    this.displaySize = 3;
    this.scale = scale;

    this.rotating = false;
    this.rotationInfo = { s: undefined, axis: undefined, direction: undefined };

    this.stickers = [];
    let offset = (this.offset = 0.8);
    let del = (this.del = 0.15);
    let radius = (this.radius = 0.07);
    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++)
        for (let k = -1; k <= 1; k++)
          this.stickers.push(
            new TesseractSticker(
              "yellow",
              -offset,
              i * del,
              j * del,
              k * del,
              radius
            ),
            new TesseractSticker(
              "white",
              offset,
              i * del,
              j * del,
              k * del,
              radius
            ),
            new TesseractSticker(
              "blue",
              i * del,
              -offset,
              j * del,
              k * del,
              radius
            ),
            new TesseractSticker(
              "red",
              i * del,
              offset,
              j * del,
              k * del,
              radius
            ),
            new TesseractSticker(
              "cyan",
              j * del,
              i * del,
              -offset,
              k * del,
              radius
            ),
            new TesseractSticker(
              "green",
              j * del,
              i * del,
              offset,
              k * del,
              radius
            ),
            new TesseractSticker(
              "magenta",
              k * del,
              i * del,
              j * del,
              -offset,
              radius
            ),
            new TesseractSticker(
              "purple",
              k * del,
              i * del,
              j * del,
              offset,
              radius
            )
          );
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
      [sticker[a], sticker[b]] = sticker.rotate(
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
      if (Math.abs(this.rotationInfo.s.w - this.offset) < 1 / 1024) {
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
    let touchedSticker = this.stickers.find((s) => s.overlaps(x, y));
    if (!touchedSticker) return;
    if (!touchedSticker.centerOfView()) {
      this.rotating = true;
      this.rotationInfo.s = touchedSticker;
      this.rotationInfo.axis = ["x", "y", "z"].reduce(
        (c, a) =>
          Math.abs(touchedSticker[c]) > Math.abs(touchedSticker[a]) ? c : a,
        "x"
      );
      this.rotationInfo.direction =
        touchedSticker[this.rotationInfo.axis] < 0 ? 1 : -1;
    }
  }

  drag(x, y) {}

  release() {}

  scramble() {
    throw "Not Implemented";
  }
}
