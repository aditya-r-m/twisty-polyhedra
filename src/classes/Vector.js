class Vector{
    constructor(p, q) {
        this.x = q.x - p.x;
        this.y = q.y - p.y;
        this.z = q.z - p.z;
    }

    cross(v) {
        return new Vector(
            { x: 0, y: 0, z: 0},
            {
                x: this.y * v.z - this.z * v.y,
                y: this.z * v.x - this.x * v.z,
                z: this.x * v.y - this.y * v.x
            }
        );
    }
}

