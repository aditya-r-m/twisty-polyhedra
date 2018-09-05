class Octahedron extends Puzzle {
    constructor(size = 3, fullSpan = 200) {
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
            new Point('', 0, 0, -fullSpan),
            new Point('', fullSpan, 0, 0),
            new Point('', 0, fullSpan, 0),
            new Point('', -fullSpan, 0, 0),
            new Point('', 0, -fullSpan, 0),
            new Point('', 0, 0, fullSpan)
        ];
        const faceConfig = [
            { 'points': [rootPoints[0], rootPoints[2], rootPoints[1]], 'color': 'white' },
            { 'points': [rootPoints[0], rootPoints[1], rootPoints[4]], 'color': 'blue' },
            { 'points': [rootPoints[0], rootPoints[4], rootPoints[3]], 'color': 'lawngreen' },
            { 'points': [rootPoints[0], rootPoints[3], rootPoints[2]], 'color': 'skyblue' },
            { 'points': [rootPoints[5], rootPoints[1], rootPoints[2]], 'color': 'red' },
            { 'points': [rootPoints[5], rootPoints[2], rootPoints[3]], 'color': 'darkorange' },
            { 'points': [rootPoints[5], rootPoints[3], rootPoints[4]], 'color': 'purple' },
            { 'points': [rootPoints[5], rootPoints[4], rootPoints[1]], 'color': 'yellow' }
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
                    while (grid[p.id]) p.id += '-n';
                    q.id = `p-${f}-${i + 1}-${j}`;
                    while (grid[q.id]) q.id += '-n';
                    r.id = `p-${f}-${i + 1}-${j + 1}`;
                    while (grid[r.id]) r.id += '-n';
                    grid[p.id] = p.clone();
                    grid[q.id] = q.clone();
                    grid[r.id] = r.clone();
                    stickers.push(new Sticker(`s-${f}-${i}-${2 * j}`, config.color, [p, q, r]));
                    stickerMap[stickers[stickers.length - 1].id] = stickers[stickers.length - 1];
                    if (j < preArr.length - 1) {
                        p = p.clone();
                        while (grid[p.id]) p.id += '-n';
                        r = r.clone();
                        while (grid[r.id]) r.id += '-n';
                        s = preArr[j + 1].clone();
                        s.id = `q-${f}-${i}-${j + 1}`;
                        while (grid[s.id]) s.id += '-n';
                        grid[p.id] = p.clone();
                        grid[r.id] = r.clone();
                        grid[s.id] = s.clone();
                        stickers.push(new Sticker(`s-${f}-${i}-${2 * j + 1}`, config.color, [p, r, s]));
                        stickerMap[stickers[stickers.length - 1].id] = stickers[stickers.length - 1];
                    }
                });
                preArr = nxtArr;
            }
            faces.push(new Face(stickers));
        });
        super(grid, faces, cycles, { theta: - Math.PI / 3, phi: 0 });
    }
}

