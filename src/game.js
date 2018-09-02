(() => {

    const ctx = gameCanvas.getContext('2d');
    ctx.translate(300, 300);

    const gameCanvasRect = gameCanvas.getBoundingClientRect();
    const eventOffset = {
        'x': gameCanvasRect.left + 300,
        'y': gameCanvasRect.top + 300
    }

    window.selectedPuzzle = new Cube(3);

    let loop = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.restore();
        window.selectedPuzzle.update();
        window.selectedPuzzle.render(ctx);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.addEventListener('contextmenu', event => event.preventDefault());
    gameCanvas.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        window.selectedPuzzle.grab(e.clientX - eventOffset.x, e.clientY - eventOffset.y, e.button);
    })

    gameCanvas.addEventListener('mousemove', e => {
        e.preventDefault();
        e.stopPropagation();
        window.selectedPuzzle.drag(e.clientX - eventOffset.x, e.clientY - eventOffset.y);
    })

    gameCanvas.addEventListener('mouseup', e => {
        e.preventDefault();
        e.stopPropagation();
        window.selectedPuzzle.release();
    })

})();
