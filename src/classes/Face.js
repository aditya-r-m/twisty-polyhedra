// A face is Just a collection of stickers.
// Every sticker in the face has a normal vector defined by the point order (which is expected to follow the right hand thumb rule)
// The normal vector of the face is just the normal vector of any of it's stickers.
class Face {
  constructor(stickers) {
    this.stickers = stickers;
    this.normalVector = this.stickers[0].calculateNormalVector();
  }

  update(orientation) {
    this.stickers.forEach((sticker) => sticker.update(orientation));
    this.normalVector = this.stickers[0].calculateNormalVector();
  }

  render(ctx, inverted, exploded) {
    this.stickers.forEach((sticker) => sticker.render(ctx, inverted, exploded));
  }
}
