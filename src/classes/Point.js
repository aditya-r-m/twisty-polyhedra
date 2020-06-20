// A point is just a location in 3D space which (optionally) contains an id
// Every point object represents an orientation of a base location which is updated as puzzle is twisted or re-oriented
class Point {
  constructor(x, y, z, id) {
    this.base = { x, y, z };
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id;
  }

  // Updates the point by re-orienting it according to the given axis & angle
  update(orientation) {
    const { x, y, z } = this.rotateAroundAxis(
      this.base,
      orientation.axis.unit(),
      orientation.angle
    );
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Set the orientation as the new base orientation for the point
  saveOrientation(orientation) {
    this.update(orientation);
    this.base.x = this.x;
    this.base.y = this.y;
    this.base.z = this.z;
  }

  clone() {
    return new Point(this.x, this.y, this.z, this.id);
  }

  // rotate given point about an arbitrary axis, given unit vector in the direction of the axis & angle 'alpha'
  // references: https://eater.net/quaternions https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
  rotateAroundAxis(point, unitVector, alpha) {
    const cA = Math.cos(alpha / 2);
    const sA = Math.sin(alpha / 2);
    const qA = new Quaternion(
      cA,
      sA * unitVector.x,
      sA * unitVector.y,
      sA * unitVector.z
    );
    const qP = new Quaternion(0, point.x, point.y, point.z);
    const qR = qA.multiply(qP).multiply(qA.conjugate());
    return new Point(qR.x, qR.y, qR.z);
  }
}
