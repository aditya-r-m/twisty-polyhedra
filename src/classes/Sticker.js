// A sticker is a collection of points. It's a polygon with a fill color
// A sticker has a normal vector that points outside the puzzle. This is implied by point order & right hand thumb rule
// Not that this is the only component of the Puzzle object which is actually rendered on the canvas
class ColorData {
  constructor(code, originalStickerId) {
    this.code = code;
    this.originalStickerId = originalStickerId;
  }
}

class Sticker {
  constructor(id, colorCode, points) {
    this.id = id;
    this.colorData = new ColorData(colorCode, this.id);
    this.points = points;
    this.attractor = {};
  }

  // To check if a sticker contains a point, we circle around the points
  // returns true if during the whole traversal the point was in one direction of the current vector (either left or right)
  // returns false otherwise
  // The left/right state can be check by performing a cross product of the current edge vector & the vector from current edge start to parameter point
  contains(p) {
    let u = this.points[this.points.length - 1];
    let zProduct = 0;
    let product;
    for (const v of this.points) {
      product = new Vector(u, v).cross(new Vector(u, p));
      if ((zProduct < 0 && product.z > 0) || (zProduct > 0 && product.z < 0)) {
        return false;
      } else if (product.z !== 0) {
        zProduct = product.z;
      }
      u = v;
    }
    return true;
  }

  // Normal vector implied by point order
  calculateNormalVector() {
    return new Vector(this.points[0], this.points[1]).cross(
      new Vector(this.points[0], this.points[this.points.length - 1])
    );
  }

  // Update all the points according to params & calcuclate attractor
  // Attractor is just the sum of all point vectors. This is used for "exploding" the stickers
  update(orientation) {
    this.points.forEach((point) => point.update(orientation));
    this.attractor = {
      x: this.points.reduce((a, p) => a + p.x, 0),
      y: this.points.reduce((a, p) => a + p.y, 0),
      z: this.points.reduce((a, p) => a + p.z, 0),
    };
  }

  // Simple paralled projection (ignore the z-coordinates)
  // Also, if sticker is exploded, move it's points a little bit close to the attractor before projecting
  getPointProjection(point, inverted, exploded) {
    const result = [point.x, point.y];
    if (exploded) {
      // If in some puzzle some stickers have more points than others, The magnitude of their attractor will be larger.
      // To normalize the outward-pull, we divide the result by points.length
      result[0] += (this.attractor.x - result[0]) / (10 * this.points.length); // xAttracted = xOriginal + (xAttractor - xOriginal) / (constant * points.length)
      result[1] += (this.attractor.y - result[1]) / (10 * this.points.length); // yAttracted = yOriginal + (yAttractor - yOriginal) / (constant * points.length)
    }
    if (inverted) result[0] = -result[0]; // Used for rear-view
    return result;
  }

  // Use canvas moveTo & lineTo for drawing projected sticker
  render(ctx, inverted, exploded) {
    ctx.fillStyle = this.colorData.code;
    ctx.strokeStyle = "#202020";
    ctx.beginPath();
    ctx.moveTo(...this.getPointProjection(this.points[0], inverted, exploded));
    this.points.forEach((p) =>
      ctx.lineTo(...this.getPointProjection(p, inverted, exploded))
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
