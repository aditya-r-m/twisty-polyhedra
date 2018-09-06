(() => {

    const ctx = gameCanvas.getContext('2d');
    ctx.translate(300, 300);

    const gameCanvasRect = gameCanvas.getBoundingClientRect();
    const eventOffset = {
        'x': gameCanvasRect.left + 300,
        'y': gameCanvasRect.top + 300
    }

    window.selectedPuzzle = new Tetrahedron(3);
    window.congratulate = time => {
        window.help.style.display = 'none';
        window.menu.style.display = 'none';
        window.startbutton.style.display = 'inline-block';
        window.success.style.display = 'inline-block';
        window.message.innerHTML = `You solved it in ${time} seconds.<br/> Good Job.`;
    }

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
        window.selectedPuzzle.grab(e.clientX - eventOffset.x, e.clientY - eventOffset.y, e.ctrlKey ? 2 : e.button);
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

    gameCanvas.addEventListener('mouseleave', e => {
        window.selectedPuzzle.release();
    })

})();
