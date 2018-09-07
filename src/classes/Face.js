class Face {
    constructor(stickers) {
        this.stickers = stickers;
        this.normalVector = this.stickers[0].calculateNormalVector();
    }

    update(grid, theta, phi) {
        this.stickers.forEach(sticker => sticker.update(grid, theta, phi));
        this.normalVector = this.stickers[0].calculateNormalVector();
    }

    render(ctx, inverted, exploded) {
        this.stickers.forEach(sticker => sticker.render(ctx, inverted, exploded));
    }
}

