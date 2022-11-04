class TSticker {
  constructor(colorCode, w, x, y, z) {
    this.colorCode = colorCode;
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;

    this.rx = x;
    this.ry = y;
    this.rz = z;
  }

  rotate(a, b, theta) {
    return [a*Math.cos(theta) - b*Math.sin(theta), a*Math.sin(theta) + b*Math.cos(theta)];
  }

  prepareRender() {
    if (this.w < -0.5) return;
    let r = 2 / (1 + this.w);
    [this.rx, this.ry, this.rz] = [r*this.x, r*this.y, r*this.z];
    [this.rx, this.rz] = this.rotate(this.rx, this.rz, -Math.PI/9);
    [this.ry, this.rz] = this.rotate(this.ry, this.rz, Math.PI/9);
  }

  render(ctx, scale) {
    if (this.w < -0.5) return;
    ctx.fillStyle = this.colorCode;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(scale*this.rx, scale*this.ry, 7, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

class Tesseract {
  constructor(scale = 100) {
    this.displayName = "Tesseract";
    this.displaySize = 3;
    this.scale = scale;
    this.twisting = this.rotating = false;

    this.stickers = [];
    let del = 0.13;
    for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
    for (let k = -1; k <= 1; k++)
    this.stickers.push(
      new TSticker("white", -1, 0+i*del, 0+j*del, 0+k*del),
      new TSticker("yellow", 1, 0+i*del, 0+j*del, 0+k*del),
      new TSticker("blue", 0+i*del, -1, 0+j*del, 0+k*del),
      new TSticker("red", 0+i*del, 1, 0+j*del, 0+k*del),
      new TSticker("green", 0+j*del, 0+i*del, -1, 0+k*del),
      new TSticker("cyan", 0+j*del, 0+i*del, 1, 0+k*del),
      new TSticker("magenta", 0+k*del, 0+i*del, 0+j*del, -1),
      new TSticker("purple", 0+k*del, 0+i*del, 0+j*del, 1));
  }

  clearStats() {
    this.startTime = undefined;
    this.movesMade = 0;
  }

  render(ctx, _inverted, _exploded) {
    this.stickers.forEach(sticker => sticker.prepareRender());
    this.stickers.sort((a, b) => b.rz - a.rz);
    this.stickers.forEach(sticker => sticker.render(ctx, this.scale));
  }

  update() {
    this.stickers.forEach(sticker =>
      {
        [sticker.w, sticker.x] = sticker.rotate(sticker.w, sticker.x, Math.PI/100);
      }
    );
  }

  isSolved() {
    throw "Not Implemented";
  }

  grab(x, y, type) {
    throw "Not Implemented";
  }

  drag(x, y) {
    throw "Not Implemented";
  }

  release() {
    throw "Not Implemented";
  }

  scramble() {
    throw "Not Implemented";
  }
}
