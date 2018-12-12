class Icosahedron extends Puzzle {
    constructor(size = 3, fullSpan = 200) {
        const grid = {};
        const stickerMap = {};
        const faces = [];
        const cycles = [];
        const scaledUnit = fullSpan / 2;
        const scaledPhi = scaledUnit * (1 + Math.sqrt(5)) / 2;
        const rootPoints = [
            new Point(0, scaledPhi, scaledUnit),
            new Point(0, scaledPhi, -scaledUnit),
            new Point(0, -scaledPhi, scaledUnit),
            new Point(0, -scaledPhi, -scaledUnit),

            new Point(scaledPhi, scaledUnit, 0),
            new Point(scaledPhi, -scaledUnit, 0),
            new Point(-scaledPhi, scaledUnit, 0),
            new Point(-scaledPhi, -scaledUnit, 0),

            new Point(scaledUnit, 0, scaledPhi),
            new Point(-scaledUnit, 0, scaledPhi),
            new Point(scaledUnit, 0, -scaledPhi),
            new Point(-scaledUnit, 0, -scaledPhi)
        ];
        const faceConfig = [
            { 'points': [rootPoints[0], rootPoints[4], rootPoints[1]], 'color': 'white' },
            { 'points': [rootPoints[0], rootPoints[1], rootPoints[6]], 'color': 'blue' },
            { 'points': [rootPoints[0], rootPoints[6], rootPoints[9]], 'color': 'red' },
            { 'points': [rootPoints[0], rootPoints[9], rootPoints[8]], 'color': 'lawngreen' },
            { 'points': [rootPoints[0], rootPoints[8], rootPoints[4]], 'color': 'skyblue' },

            { 'points': [rootPoints[3], rootPoints[2], rootPoints[7]], 'color': 'orange' },
            { 'points': [rootPoints[3], rootPoints[5], rootPoints[2]], 'color': 'darkolivegreen' },
            { 'points': [rootPoints[3], rootPoints[10], rootPoints[5]], 'color': 'yellow' },
            { 'points': [rootPoints[3], rootPoints[11], rootPoints[10]], 'color': 'lightgreen' },
            { 'points': [rootPoints[3], rootPoints[7], rootPoints[11]], 'color': 'salmon' },

            { 'points': [rootPoints[4], rootPoints[5], rootPoints[10]], 'color': 'magenta' },
            { 'points': [rootPoints[1], rootPoints[10], rootPoints[11]], 'color': 'crimson' },
            { 'points': [rootPoints[6], rootPoints[11], rootPoints[7]], 'color': 'indigo' },
            { 'points': [rootPoints[9], rootPoints[7], rootPoints[2]], 'color': 'brown' },
            { 'points': [rootPoints[8], rootPoints[2], rootPoints[5]], 'color': 'pink' },

            { 'points': [rootPoints[2], rootPoints[8], rootPoints[9]], 'color': 'aquamarine' },
            { 'points': [rootPoints[5], rootPoints[4], rootPoints[8]], 'color': 'burlywood' },
            { 'points': [rootPoints[10], rootPoints[1], rootPoints[4]], 'color': 'darkcyan' },
            { 'points': [rootPoints[11], rootPoints[6], rootPoints[1]], 'color': 'darkmagenta' },
            { 'points': [rootPoints[7], rootPoints[9], rootPoints[6]], 'color': 'goldenrod' }
        ];

        faceConfig.forEach((config, f) => {
            faces.push(new Face([new Sticker('', config.color, config.points.map(p => p.clone()))]));
        });
        super(faces, cycles);

        this.saveOrientation({
            'axis': new Vector({ x: 1, y: 0, z: 0}),
            'angle': - 27 * Math.PI / 40
        });
    }
}

