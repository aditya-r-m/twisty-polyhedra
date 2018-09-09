// A point is just a 3d vector which (optionally) contains an id which can be used to map cloned point objects to the static base grid
class Point {
    constructor(id, x, y, z) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Update is performed in two steps
    // 1) Point is rotated about a direction specified by unitVector & angle alpha (Used for animating twists)
    // 2) Point is rotated around Y-axis & then X-axis by angles theta & phi (Used for orienting the puzzle)
    update(referencePoint, theta, phi, unitVector, alpha) {
        let xn, yn, zn;
        let { x, y, z } = unitVector ? this.rotateAroundAxis(referencePoint, unitVector, alpha) : referencePoint;

        zn = z * Math.cos(-theta) - x * Math.sin(-theta);
        xn = z * Math.sin(-theta) + x * Math.cos(-theta);

        z = zn;
        yn = y * Math.cos(phi) - z * Math.sin(phi);
        zn = y * Math.sin(phi) + z * Math.cos(phi);

        this.x = xn;
        this.y = yn;
        this.z = zn;
    }

    clone() {
        return new Point(this.id, this.x, this.y, this.z);
    }

    // rotate given point about an arbitrary axis, given unit vector in the direction of the axis & angle 'alpha'
    // reference: http://paulbourke.net/geometry/rotate/
    rotateAroundAxis(point, unitVector, alpha) {
        let q = new Point(this.id, 0, 0, 0);

        let c = Math.cos(alpha);
        let t = (1 - Math.cos(alpha));
        let s = Math.sin(alpha);
        let X = unitVector.x;
        let Y = unitVector.y;
        let Z = unitVector.z;

        let d11 = t * X ** 2 + c;
        let d12 = t * X * Y - s * Z;
        let d13 = t * X * Z + s * Y;
        let d21 = t * X * Y + s * Z;
        let d22 = t * Y ** 2 + c;
        let d23 = t * Y * Z - s * X;
        let d31 = t * X * Z - s * Y;
        let d32 = t * Y * Z + s * X;
        let d33 = t * Z ** 2 + c;

        q.x = d11 * point.x + d12 * point.y + d13 * point.z;
        q.y = d21 * point.x + d22 * point.y + d23 * point.z;
        q.z = d31 * point.x + d32 * point.y + d33 * point.z;
        return q;
    }

}

