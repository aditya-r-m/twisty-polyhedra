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
    return [
      a * Math.cos(theta) - b * Math.sin(theta),
      a * Math.sin(theta) + b * Math.cos(theta),
    ];
  }

  prepareRender(scale) {
    if (this.outOfView()) return;
    let p = 2 / (1 + this.w);
    [this.rx, this.ry, this.rz] = [this.x, this.y, this.z].map(
      (a) => p * scale * a
    );
    [this.rx, this.rz] = this.rotate(this.rx, this.rz, -Math.PI / 4);
    [this.ry, this.rz] = this.rotate(this.ry, this.rz, Math.PI / 6);
    this.rr = this.r * scale;
  }

  render(ctx) {
    if (this.outOfView()) return;
    ctx.fillStyle = this.colorCode;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(this.rx, this.ry, this.rr, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  overlaps(x, y) {
    if (this.outOfView()) return false;
    return (this.rx - x) ** 2 + (this.ry - y) ** 2 <= this.rr ** 2;
  }
}
