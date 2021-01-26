(() => {
  // Basic context configuration
  const ctx = gameCanvas.getContext("2d");
  const ctxInverted = gameCanvasInverted.getContext("2d");
  ctx.translate(300, 300);
  ctxInverted.scale(1 / 3, 1 / 3);
  ctxInverted.translate(300, 300);

  const getEventOffset = () => {
    const gameCanvasRect = gameCanvas.getBoundingClientRect();
    return {
      x: gameCanvasRect.left + 300,
      y: gameCanvasRect.top + 300,
    };
  };

  // Initial game configuration
  window.explodedStickers = true;
  window.animate = true;

  window.selectedPuzzle = new Tetrahedron();
  Puzzle.prototype.onFinish = (time) => {
    window.help.style.display = "none";
    window.menu.style.display = "none";
    window.success.style.display = "inline-block";
    window.message.innerHTML = `You solved it in ${time} seconds.<br/> Good Job.`;
  };

  const animationFPSThrottler = createAnimationFPSThrottler();
  // Game loop
  const loop = () => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.restore();
    window.selectedPuzzle.update();
    window.selectedPuzzle.render(ctx, false, window.explodedStickers);

    if (window.showRearView) {
      ctxInverted.save();
      ctxInverted.setTransform(1, 0, 0, 1, 0, 0);
      ctxInverted.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      ctxInverted.restore();
      window.selectedPuzzle.render(ctxInverted, true, window.explodedStickers);
    }

    if (window.selectedPuzzle.startTime) {
      const timeInSeconds = Math.floor(
        (new Date().getTime() - window.selectedPuzzle.startTime) / 1000
      );
      let minutes = `${Math.floor(timeInSeconds / 60)}`;
      let seconds = `${timeInSeconds % 60}`;
      if (minutes.length < 2) minutes = "0" + minutes;
      if (seconds.length < 2) seconds = "0" + seconds;
      window.stats.innerHTML = `Time Taken: ${minutes}:${seconds}, Moves Made: ${window.selectedPuzzle.movesMade}`;
    } else {
      window.stats.innerHTML = `Time Taken: --:--, Moves Made: --`;
    }

    animationFPSThrottler.requestAnimationFrame(loop);
  };
  animationFPSThrottler.requestAnimationFrame(loop);

  // Mouse event handlers
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  gameCanvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const eventOffset = getEventOffset();
    window.selectedPuzzle.grab(
      e.clientX - eventOffset.x,
      e.clientY - eventOffset.y,
      e.ctrlKey ? 2 : e.button
    );
  });

  gameCanvas.addEventListener("mousemove", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const eventOffset = getEventOffset();
    window.selectedPuzzle.drag(
      e.clientX - eventOffset.x,
      e.clientY - eventOffset.y
    );
  });

  gameCanvas.addEventListener("mouseup", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.selectedPuzzle.release();
  });

  gameCanvas.addEventListener("mouseleave", (e) => {
    window.selectedPuzzle.release();
  });

  // Touch event handlers
  gameCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const eventOffset = getEventOffset();
    window.selectedPuzzle.grab(
      e.touches[0].clientX - eventOffset.x,
      e.touches[0].clientY - eventOffset.y,
      1
    );
  });

  gameCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const eventOffset = getEventOffset();
    window.selectedPuzzle.drag(
      e.touches[0].clientX - eventOffset.x,
      e.touches[0].clientY - eventOffset.y
    );
  });

  gameCanvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.selectedPuzzle.release();
  });

  gameCanvas.addEventListener("touchcancel", (e) => {
    window.selectedPuzzle.release();
  });
})();
