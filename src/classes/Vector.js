const origin = { x: 0, y: 0, z: 0 };

// Useful Vector operations
class Vector {
  // Creates vector from point 'p' to point 'q'
  // If 'q' is not provided, Vector from origin to point 'p' is created instead
  constructor(p, q) {
    if (!q) {
      q = p;
      p = origin;
    }
    this.x = q.x - p.x;
    this.y = q.y - p.y;
    this.z = q.z - p.z;
  }

  // Vector addition
  add(v) {
    return new Vector(origin, {
      x: this.x + v.x,
      y: this.y + v.y,
      z: this.z + v.z,
    });
  }

  // Vector subtraction
  subtract(v) {
    return this.add({ x: -v.x, y: -v.y, z: -v.z });
  }

  // Multiplication by a scalar
  multiply(s) {
    return new Vector(origin, {
      x: this.x * s,
      y: this.y * s,
      z: this.z * s,
    });
  }

  // Calculate vector length
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  // Unit vector in direction of current vector
  unit() {
    return this.multiply(1 / this.magnitude());
  }

  // Cross product with another vector
  cross(v) {
    return new Vector(origin, {
      x: this.y * v.z - this.z * v.y,
      y: this.z * v.x - this.x * v.z,
      z: this.x * v.y - this.y * v.x,
    });
  }
}
