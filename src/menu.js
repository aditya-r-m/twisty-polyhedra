(() => {
    window.menuConfig = {
        puzzles: []
    }
    for (let i = 2; i <= 4; i++) {
        window.menuConfig.puzzles.push({
            elem: window[`menu-1-item-${i - 1}`],
            create: isDemo => new Cube(i, isDemo ? 50 : undefined)
        })
    }
    for (let i = 3; i <= 5; i++) {
        window.menuConfig.puzzles.push({
            elem: window[`menu-2-item-${i - 2}`],
            create: isDemo => new Tetrahedron(i, isDemo ? 40 : undefined)
        })
    }
    for (let i = 2; i <= 4; i++) {
        window.menuConfig.puzzles.push({
            elem: window[`menu-3-item-${i - 1}`],
            create: isDemo => new Octahedron(i, isDemo ? 40 : undefined)
        })
    }

    window.menuConfig.puzzles.forEach(({ elem, create }) => {
        const ctx = elem.getContext('2d');
        const dT = ((Math.floor(Math.random() * 5) - 2) || 1) * Math.PI / 500;
        const dP = ((Math.floor(Math.random() * 5) - 2) || 1) * Math.PI / 500;
        const puzzle = create(true);
        ctx.translate(50, 50);
        let loop = () => {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
            ctx.restore();
            puzzle.baseAngles.theta += dT;
            puzzle.baseAngles.phi += dP;
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
