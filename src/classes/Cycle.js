// Class representing twistable slices
// A single cycle contains multiple sticker collections.
// Each of them is a sub-cycle. By convention, the first of these sub-cycles
// is the main slice. Other sub-cycles can be used to rotate attached face.
// The period is the numbe of operations after which the twist operation
// reverts the puzzle to it's original state. A cycle also contains unit vector
// normal to it's plane & a set of sticker ids afftected by it for quick lookup.
class Cycle {
  constructor(index, stickerCollections, period, unitVector, animationConfig) {
    this.index = index;
    this.stickerCollections = stickerCollections;
    this.period = period;
    this.unitVector = unitVector;
    this.animationConfig = animationConfig;
    this.stickerCover = {};
  }

  computeStickerCover() {
    this.stickerCollections.forEach((collection) =>
      collection.forEach(({ id }) => (this.stickerCover[id] = true))
    );
  }

  saveOrientation(orientation) {
    const p = new Point(
      this.unitVector.x,
      this.unitVector.y,
      this.unitVector.z
    );
    p.update(orientation);
    this.unitVector = new Vector(p);
  }

  twist(direction = 1) {
    this.stickerCollections.forEach((collection) => {
      if (collection.length === 1) return;
      const increment = (direction * collection.length) / this.period;
      collection.forEach((sticker, index) => {
        sticker.$newColorData =
          collection[mod(index - increment, collection.length)].colorData;
      });
      collection.forEach((sticker) => {
        sticker.colorData = sticker.$newColorData;
        delete sticker.$newColorData;
      });
    });
  }
}
