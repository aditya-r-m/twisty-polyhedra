// Useful Quaternion operations (reference: https://www.youtube.com/watch?v=d4EgbgTm0Bg)
// Quaternions are 4D extensions to complex numbers used to represent 3D rotations in the application
// Although there are other ways to implement rotations based on straight forward 3D geometry, Quaternions provide an elegant approach for the same

const qDimensions = ["w", "x", "y", "z"];
const qProductSign = [
  [1, 1, 1, 1],
  [1, -1, 1, -1],
  [1, -1, -1, 1],
  [1, 1, -1, -1],
];
const qProductAxis = [
  [0, 1, 2, 3],
  [1, 0, 3, 2],
  [2, 3, 0, 1],
  [3, 2, 1, 0],
];

class Quaternion {
  constructor(w, x, y, z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  conjugate() {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }

  multiply(q) {
    const product = new Quaternion(0, 0, 0, 0);
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        product[qDimensions[qProductAxis[x][y]]] +=
          qProductSign[x][y] * this[qDimensions[x]] * q[qDimensions[y]];
      }
    }
    return product;
  }
}
