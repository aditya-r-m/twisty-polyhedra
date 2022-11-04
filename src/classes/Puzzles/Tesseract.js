class TesseractSticker {
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
    [this.rx, this.rz] = this.rotate(this.rx, this.rz, -Math.PI/4);
    [this.ry, this.rz] = this.rotate(this.ry, this.rz, Math.PI/6);
  }

  render(ctx, scale) {
    if (this.w < -0.5) return;
    ctx.fillStyle = this.colorCode;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(scale*this.rx, scale*this.ry, 7*scale/100, 0, 2*Math.PI);
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
    let offset = 0.8, del = 0.15;
    for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
    for (let k = -1; k <= 1; k++)
    this.stickers.push(
      new TesseractSticker("yellow", -offset, 0+i*del, 0+j*del, 0+k*del),
      new TesseractSticker("white", offset, 0+i*del, 0+j*del, 0+k*del),
      new TesseractSticker("blue", 0+i*del, -offset, 0+j*del, 0+k*del),
      new TesseractSticker("red", 0+i*del, offset, 0+j*del, 0+k*del),
      new TesseractSticker("cyan", 0+j*del, 0+i*del, -offset, 0+k*del),
      new TesseractSticker("green", 0+j*del, 0+i*del, offset, 0+k*del),
      new TesseractSticker("magenta", 0+k*del, 0+i*del, 0+j*del, -offset),
      new TesseractSticker("purple", 0+k*del, 0+i*del, 0+j*del, offset));
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

  updateOrientation() {
    console.log('called');
    this.stickers.forEach(sticker =>
      {
        [sticker.w, sticker.z] = sticker.rotate(sticker.w, sticker.z, -Math.PI/100);
      }
    );
  }

  getUpdatedOrientation() {
    return {};
  }

  update() {}

  isSolved() {
    throw "Not Implemented";
  }

  grab(x, y, type) {
    throw "Not Implemented";
  }

  drag(x, y) {}

  release() {}

  scramble() {
    throw "Not Implemented";
  }
}
