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
            { 'points': [rootPoints[8],rootPoints[1],rootPoints[13],rootPoints[12],rootPoints[0]],
              'color': 'lawngreen' }
        ];
        faceConfig.forEach((config, f) => {
            let stickers = [new Sticker('', config.color, config.points)];
            faces.push(new Face(stickers));
        });
        super(faces, cycles);
    }
}

