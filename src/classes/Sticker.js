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

    getPointProjection(point, inverted, exploded) {
        let result = [point.x, point.y];
        if (exploded) {
            result[0] += ((this.attractor.x - result[0]) >> 5);
            result[1] += ((this.attractor.y - result[1]) >> 5);
        }
        if (inverted) result[0] = -result[0];
        return result;
    }

    render(ctx, inverted, exploded) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "#202020";
        ctx.beginPath();
        ctx.moveTo(...this.getPointProjection(this.points[0], inverted, exploded));
        this.points.forEach(p => ctx.lineTo(...this.getPointProjection(p, inverted, exploded)));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

