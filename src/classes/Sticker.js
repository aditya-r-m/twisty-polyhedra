class Sticker {
    constructor(id, color, points) {
        this.id = id;
        this.color = color;
        this.points = points;
        this.attractor = {};
    }

    contains(p) {
        let u = this.points[this.points.length - 1], zProduct = 0, product;
        for (let v of this.points) {
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

    calculateNormalVector() {
        return new Vector(this.points[0], this.points[1]).cross(new Vector(this.points[0], this.points[this.points.length - 1]));
    }

    update(grid, theta, phi, unitVector, alpha) {
        this.points.forEach(point => point.update(grid[point.id], theta, phi, unitVector, alpha));
        this.attractor = {
            'x': this.points.reduce((a, p) => a + p.x, 0),
            'y': this.points.reduce((a, p) => a + p.y, 0),
            'z': this.points.reduce((a, p) => a + p.z, 0)
        };
    }

    getPointProjection(point) {
        return [point.x + ((this.attractor.x - point.x) >> 5), point.y + ((this.attractor.y - point.y) >> 5)];
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "#202020";
        ctx.beginPath();
        ctx.moveTo(...this.getPointProjection(this.points[0]));
        this.points.forEach(p => ctx.lineTo(...this.getPointProjection(p)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

