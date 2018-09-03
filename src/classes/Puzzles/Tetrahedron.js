class Tetrahedron extends Puzzle {
    constructor(size = 3, fullSpan = 250) {
        const altitude = fullSpan / Math.sqrt(2);
        const alphaM = 2 * Math.PI / 3;
        const animationSteps = 10;
        const animationConfig = {
            steps: animationSteps,
            dAlpha: alphaM / animationSteps
        };
        const grid = {};
        const stickerMap = {};
        const faces = [];
        const cycles = [];
        const rootPoints = [
            new Point('', fullSpan, 0, altitude),
            new Point('', -fullSpan, 0, altitude),
            new Point('', 0, fullSpan, -altitude),
            new Point('', 0, -fullSpan, -altitude)
        ];
        const faceConfig = [
            { 'points': [rootPoints[0], rootPoints[2], rootPoints[1]], 'color': 'white' },
            { 'points': [rootPoints[0], rootPoints[1], rootPoints[3]], 'color': 'blue' },
            { 'points': [rootPoints[0], rootPoints[3], rootPoints[2]], 'color': 'lawngreen' },
            { 'points': [rootPoints[1], rootPoints[2], rootPoints[3]], 'color': 'red' }
        ];
        const cycleFamilyConfig = [
            {
                'slices': [
                    { fIndex: 0, sIJ: row => [row, 0], dIJ: row => [0, 1] },
                    { fIndex: 1, sIJ: row => [row, 0], dIJ: row => [0, 1] },
                    { fIndex: 2, sIJ: row => [row, 0], dIJ: row => [0, 1] }
                ],
                'attachedFace': { fIndex: 3, steps: [row => [1, 0], row => [0, 2], row => [-1, -2]] },
                'unitVector': new Vector(new Point('', 0, 0, 0), rootPoints[0]).unit()
            }
        ];
        faceConfig.forEach((config, f) => {
            let stickers = [];
            let preArr = [config.points[0].clone()], nxtArr, p, q, r, s;
            let vI = new Vector(config.points[0], config.points[1]).multiply(1 / size);
            let vJ = new Vector(config.points[1], config.points[2]).multiply(1 / size);
            let vC;
            for (let i = 0; i < size; i++) {
                nxtArr = [];
                vC = vI.add(preArr[0]);
                nxtArr.push(new Point('', vC.x, vC.y, vC.z));
                for (let j = 0; j <= i; j++) {
                    vC = vJ.add(vC);
                    nxtArr.push(new Point('', vC.x, vC.y, vC.z));
                }
                preArr.forEach((point, j) => {
                    p = point.clone();
                    q = nxtArr[j].clone();
                    r = nxtArr[j + 1].clone();
                    p.id = `p-${f}-${i}-${j}`;
                    q.id = `p-${f}-${i + 1}-${j}`;
                    r.id = `p-${f}-${i + 1}-${j + 1}`;
                    grid[p.id] = p.clone();
                    grid[q.id] = q.clone();
                    grid[r.id] = r.clone();
                    stickers.push(new Sticker(`s-${f}-${i}-${2 * j}`, config.color, [p, q, r]));
                    stickerMap[stickers[stickers.length - 1].id] = stickers[stickers.length - 1];
                    if (j < preArr.length - 1) {
                        s = preArr[j + 1].clone();
                        s.id = `q-${f}-${i}-${j + 1}`;
                        grid[s.id] = s.clone();
                        stickers.push(new Sticker(`s-${f}-${i}-${2 * j + 1}`, config.color, [p, r, s]));
                        stickerMap[stickers[stickers.length - 1].id] = stickers[stickers.length - 1];
                    }
                });
                preArr = nxtArr;
            }
            faces.push(new Face(stickers));
        });
        let cycle, aFace, stickerCollection, sI, sJ, dI, dJ;
        cycleFamilyConfig.forEach(config => {
            for (let c = 0; c < size; c++) {
                cycle = new Cycle([], 3, config.unitVector, animationConfig);
                stickerCollection = [];
                config.slices.forEach(slice => {
                    [sI, sJ] = slice.sIJ(c);
                    [dI, dJ] = slice.dIJ(c);
                    for (let s = 0; s < 1 + (2 * c); s++) {
                        stickerCollection.push(stickerMap[`s-${slice.fIndex}-${sI}-${sJ}`]);
                        sI += dI;
                        sJ += dJ;
                    }
                });
                cycle.stickerCollections.push(stickerCollection);
                cycles.push(cycle);
                cycle.update();
            }
            cycle = cycles[cycles.length - 1];
            aFace = config.attachedFace.fIndex;
            let l = size - 1;
            let d = 1;
            let s = 0, i, j;
            while (l > 0) {
                i = j = s;
                stickerCollection = [];
                config.attachedFace.steps.forEach(stepConfigGetter => {
                    let [stepI, stepJ] = stepConfigGetter(s);
                    for (let x = 0; x < l; x++) {
                        stickerCollection.push(stickerMap[`s-${aFace}-${i}-${j}`]);
                        i += stepI;
                        j += stepJ;
                    }
                });
                cycle.stickerCollections.push(stickerCollection);
                s += 1;
                l -= d;
                d = d === 2 ? 1 : 2;
            }
            if (stickerMap[`s-${aFace}-${s}-${s}`]) {
                cycle.stickerCollections.push([stickerMap[`s-${aFace}-${s}-${s}`]]);
            }
            cycle.update();
        });
        super(grid, faces, cycles, { theta: 0, phi: 0 });
    }
}

