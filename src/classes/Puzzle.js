class Puzzle {
    constructor(grid, faces, cycles, angles) {
        this.grid = grid;
        this.faces = faces;
        this.cycles = cycles;
        this.baseAngles = this.angles = angles || { 'theta': - Math.PI / 4, 'phi': Math.PI / 8 };

        this.twisting = this.rotating = false;
        this.startEvtCoordinates = {};
        this.twistCounter = 0;
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

    isSolved() {
        for (let f = 0; f < this.faces.length; f++)
            for (let s = 0; s < this.faces[f].stickers.length; s++)
                if (this.faces[f].stickers[s].color !== this.faces[f].stickers[0].color) return false;
        return true;
    }

    processCycleMap() {
        this.cycles.forEach(cycle => cycle.stickerCollections[0].forEach(sticker => {
            this.cycleMap[sticker.id] = this.cycleMap[sticker.id] || [];
            this.cycleMap[sticker.id].push(cycle);
        })
        );
    }

    update() {
        if (this.animationState.active && this.animationState.counter < this.animationState.cycle.animationConfig.steps) {
            let alpha = this.animationState.direction * this.animationState.counter * this.animationState.cycle.animationConfig.dAlpha;
            this.stickers.forEach(sticker => {
                sticker.update(
                    this.grid, this.angles.theta, this.angles.phi,
                    ...(this.animationState.cycle.stickerCover[sticker.id] ? [this.animationState.cycle.unitVector, alpha] : []))
            });
            this.stickers.sort((s1, s2) => s2.attractor.z - s1.attractor.z);
            this.animationState.counter++;
        } else {
            if (this.animationState.active) {
                this.animationState.cycle.twist(this.animationState.direction);
                if (this.startTime && this.isSolved()) {
                    window.congratulate((new Date().getTime() - this.startTime) / 1000);
                }
                if (this.animationState.callback) {
                    this.animationState.callback();
                    if (this.animationState.counter < this.animationState.cycle.animationConfig.steps) {
                        return this.update();
                    }
                }
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
        for (let f = this.faces.length - 1; f >= 0; f--) {
            if (this.faces[f].normalVector.z >= 0) {
                return;
            }
            sticker = this.faces[f].stickers.find(sticker => sticker.contains({ x, y, z: 0 }));
            if (sticker) {
                return sticker;
            }
        }
    }

    grab(x, y, type) {
        this.startEvtCoordinates.x = x;
        this.startEvtCoordinates.y = y;
        if (type == 2) {
            this.rotating = true;
            this.baseAngles = { ...this.angles };
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
            if (this.twistCounter < 9) {
                this.twistCounter++;
            } else {
                this.detectCycle(x, y);
            }
        }
    }

    detectCycle(x, y) {
        let v = new Vector(
            new Point('', this.startEvtCoordinates.x, this.startEvtCoordinates.y, 0),
            new Point('', x, y, 0)
        );
        let mxMg = 0, mxCycle, mxDirection;
        this.cycleMap[this.startSticker.id].forEach(cycle => {
            let unitPoint = new Point('', cycle.unitVector.x, cycle.unitVector.y, cycle.unitVector.z);
            unitPoint.update(unitPoint, this.angles.theta, this.angles.phi);
            unitPoint.z = 0;
            let vC = new Vector({ x: 0, y: 0, z: 0 }, unitPoint).unit();
            let product = v.cross(vC);
            if (mxMg < product.magnitude()) {
                mxMg = product.magnitude();
                mxCycle = cycle;
                mxDirection = product.z > 0 ? -1 : 1;
            }
        })
        this.animationState = {
            active: true,
            counter: 0,
            direction: mxDirection,
            cycle: mxCycle
        };
        this.release();
    }

    release() {
        this.twisting = this.rotating = false;
        this.startEvtCoordinates = {};
        this.twistCounter = 0;
        this.startSticker = undefined;
    }

    scramble() {
        const count = this.cycles.length * 3;
        const twists = [];
        for (let c = 0; c < count; c++)
            twists.push({ cycle: this.cycles[Math.floor(Math.random() * this.cycles.length)], direction: Math.random() < 0.5 ? -1 : 1 });
        const animationConfigs = [];
        twists.forEach(({ cycle, direction }, index) => {
            animationConfigs.push({
                active: true, counter: 0, direction, cycle,
                callback: index < count - 1 ? () => this.animationState = animationConfigs[index + 1] : () => this.startTime = new Date().getTime()
            })
        });
        this.animationState = animationConfigs[0];
    }

    render(ctx) {
        if (!this.animationState.active) {
            this.faces.forEach(face => face.render(ctx));
        } else {
            this.stickers.forEach(sticker => sticker.render(ctx));
        }
    }
}

