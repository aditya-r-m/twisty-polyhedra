class Dodecahedron extends Puzzle {
    constructor(size = 2, width = 200) {
        const phi = (1 + Math.sqrt(5)) / 2;
        const scale = width / 2;
        const scaledPhi = scale * phi;
        const scaledPhiInverse = scale * 1 / phi;
        const faces = [];
        const cycles = [];
        const rootPoints = [
            new Point(scale, scale, scale),
            new Point(scale, scale, -scale),
            new Point(scale, -scale, scale),
            new Point(scale, -scale, -scale),
            new Point(-scale, scale, scale),
            new Point(-scale, scale, -scale),
            new Point(-scale, -scale, scale),
            new Point(-scale, -scale, -scale),

            new Point(scaledPhi, scaledPhiInverse, 0),
            new Point(scaledPhi, -scaledPhiInverse, 0),
            new Point(-scaledPhi, scaledPhiInverse, 0),
            new Point(-scaledPhi, -scaledPhiInverse, 0),

            new Point(0, scaledPhi, scaledPhiInverse),
            new Point(0, scaledPhi, -scaledPhiInverse),
            new Point(0, -scaledPhi, scaledPhiInverse),
            new Point(0, -scaledPhi, -scaledPhiInverse),

            new Point(scaledPhiInverse, 0, scaledPhi),
            new Point(scaledPhiInverse, 0, -scaledPhi),
            new Point(-scaledPhiInverse, 0, scaledPhi),
            new Point(-scaledPhiInverse, 0, -scaledPhi)
        ];
        const faceConfig = [
            {
                'points': [rootPoints[8],rootPoints[1],rootPoints[13],rootPoints[12],rootPoints[0]],
                'color': 'red'
            }, {
                'points': [rootPoints[9],rootPoints[2],rootPoints[14],rootPoints[15],rootPoints[3]],
                'color': 'skyblue'
            }, {
                'points': [rootPoints[10],rootPoints[4],rootPoints[12],rootPoints[13],rootPoints[5]],
                'color': 'white'
            }, {
                'points': [rootPoints[11],rootPoints[7],rootPoints[15],rootPoints[14],rootPoints[6]],
                'color': 'yellow'
            }, {
                'points': [rootPoints[12],rootPoints[4],rootPoints[18],rootPoints[16],rootPoints[0]],
                'color': 'green'
            }, {
                'points': [rootPoints[13],rootPoints[1],rootPoints[17],rootPoints[19],rootPoints[5]],
                'color': 'blue'
            }, {
                'points': [rootPoints[14],rootPoints[2],rootPoints[16],rootPoints[18],rootPoints[6]],
                'color': 'pink'
            }, {
                'points': [rootPoints[15],rootPoints[7],rootPoints[19],rootPoints[17],rootPoints[3]],
                'color': 'darkviolet'
            }, {
                'points': [rootPoints[16],rootPoints[2],rootPoints[9],rootPoints[8],rootPoints[0]],
                'color': 'purple'
            }, {
                'points': [rootPoints[17],rootPoints[1],rootPoints[8],rootPoints[9],rootPoints[3]],
                'color': 'lawngreen'
            }, {
                'points': [rootPoints[18],rootPoints[4],rootPoints[10],rootPoints[11],rootPoints[6]],
                'color': 'magenta'
            }, {
                'points': [rootPoints[19],rootPoints[7],rootPoints[11],rootPoints[10],rootPoints[5]],
                'color': 'brown'
            }
        ];
        const grid = {};
        faceConfig.forEach((config, f) => {
            const stickers = [];
            config.points.forEach((refPoint, p) => {
                const baseVector = new Vector(refPoint);
                const vI = new Vector(refPoint, config.points[mod(p + 1, config.points.length)]).multiply(1 / (2 * size));
                const vJ = new Vector(refPoint, config.points[mod(p - 1, config.points.length)]).multiply(1 / (2 * size));
                let pointVector, i, j;
                for (i = 0; i <= size; i++) {
                    for (j = 0; j <= size; j++) {
                        pointVector = baseVector.add(vI.multiply(i)).add(vJ.multiply(j));
                        grid[`p-${f}-${p}-${i}-${j}`] = new Point(pointVector.x, pointVector.y, pointVector.z);
                        if (i && j) {
                            stickers.push(new Sticker(
                                `s-${f}-${p}-${i}-${j}`, config.color,
                                [
                                    grid[`p-${f}-${p}-${i}-${j}`].clone(),
                                    grid[`p-${f}-${p}-${i - 1}-${j}`].clone(),
                                    grid[`p-${f}-${p}-${i - 1}-${j - 1}`].clone(),
                                    grid[`p-${f}-${p}-${i}-${j - 1}`].clone()

                                ]
                            ));
                        }
                    }
                }
                const vl = new Vector(config.points[mod(p, config.points.length)], config.points[mod(p - 1, config.points.length)]).multiply(1 / (2 * size));
                const vr = new Vector(config.points[mod(p + 1, config.points.length)], config.points[mod(p + 2, config.points.length)]).multiply(1 / (2 * size));
                const midVector = baseVector.add(vI.multiply(size));
                let lVector, rVector;
                for (i = 0; i <= size; i++) {
                    lVector = midVector.add(vl.multiply(i));
                    rVector = midVector.add(vr.multiply(i));
                    grid[`p-m-${f}-${p}-${i}-l`] = new Point(lVector.x, lVector.y, lVector.z);
                    grid[`p-m-${f}-${p}-${i}-r`] = new Point(rVector.x, rVector.y, rVector.z);
                    if (i) {
                        stickers.push(new Sticker(
                            `s-${f}-${p}-${i}-${size + 1}`, config.color,
                            [
                                grid[`p-m-${f}-${p}-${i}-l`].clone(),
                                grid[`p-m-${f}-${p}-${i}-r`].clone(),
                                grid[`p-m-${f}-${p}-${i - 1}-r`].clone(),
                                grid[`p-m-${f}-${p}-${i - 1}-l`].clone()
                            ]
                        ));
                    }
                }
                const cVector = baseVector.add(vI.multiply(size)).add(vJ.multiply(size));
                grid[`p-${f}-${p}`] = new Point(cVector.x, cVector.y, cVector.z);
            });
            stickers.push(new Sticker(
                `${f}`, config.color,
                [
                    grid[`p-${f}-0`].clone(),
                    grid[`p-${f}-1`].clone(),
                    grid[`p-${f}-2`].clone(),
                    grid[`p-${f}-3`].clone(),
                    grid[`p-${f}-4`].clone(),
                ]
            ));
            faces.push(new Face(stickers));
        });
        super(faces, cycles);
    }
}

