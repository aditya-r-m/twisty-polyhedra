origin = { x: 0, y: 0, z: 0 };

class Vector {
    constructor(p, q) {
        this.x = q.x - p.x;
        this.y = q.y - p.y;
        this.z = q.z - p.z;
    }

    add(v) {
        return new Vector(
            origin,
            {
                x: this.x + v.x,
                y: this.y + v.y,
                z: this.z + v.z
            }
        );
    }

    subtract(v) {
        return this.add({ x: -v.x, y: -v.y, z: -v.z });
    }

    multiply(s) {
        return new Vector(
            origin,
            {
                x: this.x * s,
                y: this.y * s,
                z: this.z * s
            }
        );
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    unit() {
        return this.multiply(1 / this.magnitude());
    }

    cross(v) {
        return new Vector(
            origin,
            {
                x: this.y * v.z - this.z * v.y,
                y: this.z * v.x - this.x * v.z,
                z: this.x * v.y - this.y * v.x
            }
        );
    }
}

