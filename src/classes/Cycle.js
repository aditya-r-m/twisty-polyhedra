class Cycle {
    constructor(stickerCollections, period, unitVector, animationConfig) {
        this.stickerCollections = stickerCollections;
        this.period = period;
        this.unitVector = unitVector;
        this.animationConfig = animationConfig;
        this.stickerCover = {};
    }

    update() {
        this.stickerCollections.forEach(collection => collection.forEach(({ id }) => this.stickerCover[id] = true));
    }

    mod(n, m) {
        return ((n % m) + m) % m;
    }

    twist(direction = 1) {
        this.stickerCollections.forEach(collection => {
            if (collection.length === 1) return;
            let increment = direction * collection.length / this.period;
            collection.forEach((sticker, index) => {
                sticker.newColor = collection[this.mod(index - increment, collection.length)].color;
            });
            collection.forEach(sticker => {
                sticker.color = sticker.newColor;
                delete sticker.newColor;
            });
        });
    }
}
