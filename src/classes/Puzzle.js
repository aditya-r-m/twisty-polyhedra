class Puzzle {
    constructor(grid, faces, cycles) {
        this.grid = grid;
        this.faces = faces;
        this.cycles = cycles;
        this.baseAngles = this.angles = { 'theta': - Math.PI / 4, 'phi': Math.PI / 8 };

        this.twisting = this.rotating = false;
        this.startEvtCoordinates = {};
        this.animationState = {
            active: false,
            counter: 0,
            direction: undefined,
            cycle: undefined
        };
        this.stickers = [].concat(...this.faces.map(face => face.stickers));

        this.cycleMap = {};
        this.processCycleMap();
        this.startSticker = undefined;
    }

    processCycleMap() {
        this.cycles.forEach((cycle, cycleIndex) => {
            let stickerCollection = cycle.stickerCollections[0]
            let previous = stickerCollection[stickerCollection.length - 1];
            stickerCollection.forEach(sticker => {
                this.cycleMap[sticker.id] = this.cycleMap[sticker.id] || {};
                this.cycleMap[previous.id] = this.cycleMap[previous.id] || {};
                this.cycleMap[sticker.id][previous.id] = { index: cycleIndex, direction: -1};
                this.cycleMap[previous.id][sticker.id] = { index: cycleIndex, direction: 1};
                previous = sticker;
            })
        });
    }

    update() {
        if (this.animationState.active && this.animationState.counter < this.animationState.cycle.animationConfig.steps) {
            let alpha = this.animationState.direction * this.animationState.counter * this.animationState.cycle.animationConfig.dAlpha;
            this.stickers.forEach(sticker => sticker.update(
                this.grid, this.angles.theta, this.angles.phi,
                ...(this.animationState.cycle.stickerCover[sticker.id] ? [this.animationState.cycle.unitVector, alpha] : []))
            );
            this.stickers.sort((s1, s2) => s2.attractor.z - s1.attractor.z);
            this.animationState.counter++;
        } else {
            if (this.animationState.active) {
                this.animationState.cycle.twist(this.animationState.direction)
                this.animationState = {
                    active: false,
                    counter: 0,
                    direction: undefined,
                    cycle: undefined
                };
            }
            this.faces.forEach(face => face.update(this.grid, this.angles.theta, this.angles.phi));
            this.faces.sort((f1, f2) => f2.normalVector.z - f1.normalVector.z);
        }
    }

    findTouchedSticker(x, y) {
        let sticker;
        for(let f = this.faces.length - 1; f >= 0; f--) {
            if (this.faces[f].normalVector.z >= 0) {
                return;
            }
            sticker = this.faces[f].stickers.find(sticker =>  sticker.contains({x, y, z: 0}));
            if (sticker) {
                return sticker;
            }
        }
    }

    grab(x, y, type) {
        if (type == 2) {
            this.rotating = true;
            this.startEvtCoordinates.x = x;
            this.startEvtCoordinates.y = y;
            this.baseAngles = {...this.angles};
        } else {
            this.startSticker = this.findTouchedSticker(x, y);
            this.twisting = !!this.startSticker;
        }
    }

    drag(x, y) {
        if (this.animationState.active) return;
        if (this.rotating) {
            this.angles.theta = this.baseAngles.theta + (x - this.startEvtCoordinates.x) / 100;
            this.angles.phi = this.baseAngles.phi + (y - this.startEvtCoordinates.y) / 100;
        } else if (this.twisting) {
            let currentSticker = this.findTouchedSticker(x, y);
            if (currentSticker && this.cycleMap[this.startSticker.id][currentSticker.id]) {
                this.animationState = {
                    active: true,
                    counter: 0,
                    direction: this.cycleMap[this.startSticker.id][currentSticker.id].direction,
                    cycle: this.cycles[this.cycleMap[this.startSticker.id][currentSticker.id].index]
                };
            }
            this.startSticker = currentSticker;
        }
    }

    release() {
        this.twisting = this.rotating = false;
        this.startEvtCoordinates = {};
        this.startSticker = undefined;
    }

    render(ctx) {
        if (!this.animationState.active) {
            this.faces.forEach(face => face.render(ctx));
        } else {
            this.stickers.forEach(sticker => sticker.render(ctx));
        }
    }
}

