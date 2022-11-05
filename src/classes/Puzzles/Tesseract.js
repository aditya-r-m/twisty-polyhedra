class TesseractSticker {
  constructor(colorCode, w, x, y, z, r) {
    this.colorCode = colorCode;
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;

    this.rx = x;
    this.ry = y;
    this.rz = z;
  }

  outOfView() {
    return this.w < -0.5;
  }

  centerOfView() {
    return this.w > 0.5;
  }

  rotate(a, b, theta) {
    return [a*Math.cos(theta) - b*Math.sin(theta), a*Math.sin(theta) + b*Math.cos(theta)];
  }

  prepareRender(scale) {
    if (this.outOfView()) return;
    let p = 2 / (1 + this.w);
    [this.rx, this.ry, this.rz] = [this.x, this.y, this.z].map(a => p*scale*a);
    [this.rx, this.rz] = this.rotate(this.rx, this.rz, -Math.PI/4);
    [this.ry, this.rz] = this.rotate(this.ry, this.rz, Math.PI/6);
    this.rr = this.r*scale;
  }

  render(ctx) {
    if (this.outOfView()) return;
    ctx.fillStyle = this.colorCode;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(this.rx, this.ry, this.rr, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  overlaps(x, y) {
    if (this.outOfView()) return false;
    return (this.rx-x)**2 + (this.ry-y)**2 <= this.rr**2;
  }
}

class Tesseract {
  constructor(scale = 100) {
    this.displayName = "Tesseract";
    this.displaySize = 3;
    this.scale = scale;

    this.rotating = false;
    this.rotationInfo = { s: undefined, axis: undefined, direction: undefined };

    this.stickers = [];
    let offset = this.offset = 0.8;
    let del = this.del = 0.15;
    let radius = this.radius = 0.07;
    for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
    for (let k = -1; k <= 1; k++)
    this.stickers.push(
      new TesseractSticker("yellow", -offset, 0+i*del, 0+j*del, 0+k*del, radius),
      new TesseractSticker("white", offset, 0+i*del, 0+j*del, 0+k*del, radius),
      new TesseractSticker("blue", 0+i*del, -offset, 0+j*del, 0+k*del, radius),
      new TesseractSticker("red", 0+i*del, offset, 0+j*del, 0+k*del, radius),
      new TesseractSticker("cyan", 0+j*del, 0+i*del, -offset, 0+k*del, radius),
      new TesseractSticker("green", 0+j*del, 0+i*del, offset, 0+k*del, radius),
      new TesseractSticker("magenta", 0+k*del, 0+i*del, 0+j*del, -offset, radius),
      new TesseractSticker("purple", 0+k*del, 0+i*del, 0+j*del, offset, radius));
  }

  clearStats() {
    this.startTime = undefined;
    this.movesMade = 0;
  }

  render(ctx, _inverted, _exploded) {
    this.stickers.forEach(sticker => sticker.prepareRender(this.scale));
    this.stickers.sort((a, b) => b.rz - a.rz);
    this.stickers.forEach(sticker => sticker.render(ctx));
  }

  updateOrientation(_, a = 'w', b = 'z', i = -1) {
    this.stickers.forEach(sticker =>
      {
        [sticker[a], sticker[b]] = sticker.rotate(sticker[a], sticker[b], parseFloat(i) * Math.PI/96);
      }
    );
  }

  getUpdatedOrientation() {
    return {};
  }

  update() {
    if (this.rotating) {
      this.updateOrientation(undefined, 'w', this.rotationInfo.axis, this.rotationInfo.direction);
      if (Math.abs(this.rotationInfo.s.w - this.offset) < 1/1024) {
        this.rotating = false
        this.rotationInfo = { s: undefined, axis: undefined, direction: undefined };
      }
    }
  }

  isSolved() {
    throw "Not Implemented";
  }

  grab(x, y, type) {
    if (this.rotating) return;
    let touchedSticker = this.stickers.find(s => s.overlaps(x, y));
    if (!touchedSticker) return;
    if (!touchedSticker.centerOfView()) {
      this.rotating = true;
      this.rotationInfo.s = touchedSticker;
      this.rotationInfo.axis = ['x','y','z'].reduce(
        (c, a) => Math.abs(touchedSticker[c]) > Math.abs(touchedSticker[a]) ? c: a , 'x');
      this.rotationInfo.direction = touchedSticker[this.rotationInfo.axis] < 0 ? 1 : -1;
    }
  }

  drag(x, y) {
  }

  release() {}

  scramble() {
    throw "Not Implemented";
  }
}
