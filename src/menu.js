(() => {
    window.menuConfig = {
        puzzles: []
    }

    // Cube list
    for (let i = 2; i <= 4; i++) {
        window.menuConfig.puzzles.push({
            elem: window[`menu-1-item-${i - 1}`],
            create: isDemo => new Cube(i, isDemo ? 50 : undefined)
        })
    }

    // Tetrahedra list
    for (let i = 3; i <= 5; i++) {
        window.menuConfig.puzzles.push({
            elem: window[`menu-2-item-${i - 2}`],
            create: isDemo => new Tetrahedron(i, isDemo ? 40 : undefined)
        })
    }

    // Octahedra list
    for (let i = 2; i <= 4; i++) {
        window.menuConfig.puzzles.push({
            elem: window[`menu-3-item-${i - 1}`],
            create: isDemo => new Octahedron(i, isDemo ? 40 : undefined)
        })
    }

    // Set up update/render loops for menu items with random angular velocities
    window.menuConfig.puzzles.forEach(({ elem, create }) => {
        const ctx = elem.getContext('2d');
        const puzzle = create(true);
        puzzle.updatedOrientation = {
            'axis': new Vector({ x: 1, y: 1, z: 0 }),
            'angle': 0
        };
        ctx.translate(50, 50);
        let loop = () => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            ctx.restore();
            puzzle.updatedOrientation.angle += 0.015;
            puzzle.update();
            puzzle.render(ctx);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        elem.onmousedown = () => {
            window.selectedPuzzle = create()
            window.startbutton.style.visibility = 'visible';
        };
    });
})();
