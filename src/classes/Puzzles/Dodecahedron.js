class Dodecahedron extends Puzzle {
    constructor(size = 3, width = 200) {
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
        faceConfig.forEach((config, f) => {
            let stickers = [new Sticker('', config.color, config.points.map(p => p.clone()))];
            faces.push(new Face(stickers));
        });
        super(faces, cycles);
    }
}

