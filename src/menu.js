(() => {
  // Configuration of different settings & user interaction handlers for the same
  window.menuConfig = {
    puzzles: {
      tetrahedron: (size, isDemo) =>
        new Tetrahedron(size, isDemo ? 42.5 : undefined),
      cube: (size, isDemo) => new Cube(size, isDemo ? 50 : undefined),
      octahedron: (size, isDemo) =>
        new Octahedron(size, isDemo ? 42.5 : undefined),
      dodecahedron: (size, isDemo) =>
        new Dodecahedron(size, isDemo ? 42.5 : undefined),
      icosahedron: (size, isDemo) =>
        new Icosahedron(size, isDemo ? 42.5 : undefined),
    },
    baseSizes: {
      tetrahedron: [3, 4, 5],
      cube: [2, 3, 4],
      octahedron: [2, 3, 4],
      dodecahedron: [1, 2, 3],
      icosahedron: [2, 3, 4],
    },
    sizeOffset: 0,
  };

  let menuStateCounter = 0;

  window.updateSizeOffset = (elem, count) => {
    const val = Math.max((parseInt(elem.value) || 0) + count, 0);
    elem.value = val;
    window.menuConfig.sizeOffset = val;
  };

  window.showShapeMenu = () => {
    // Create sizes.
    window.menuConfig.sizes = [];
    for (const [key, ary] of Object.entries(window.menuConfig.baseSizes)) {
      window.menuConfig.sizes[key] = ary.map(
        (val) => val + window.menuConfig.sizeOffset
      );
    }

    menuStateCounter++;
    window.puzzlemenu.style.display =
      window.shapemenu.style.display =
      window.settingsmenubutton.style.display =
        "inline-block";
    window.configurationmenu.style.display =
      window.puzzlemenubutton.style.display =
      window.sizemenu.style.display =
        "none";
    const localState = menuStateCounter;
    for (const elemId in window.menuConfig.puzzles) {
      const ctx = window[elemId].getContext("2d");
      const constructor = window.menuConfig.puzzles[elemId];
      const puzzle = constructor(undefined, true);
      puzzle.updatedOrientation = {
        axis: new Vector({ x: 1, y: 1, z: 0 }),
        angle: 0,
      };
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(50, 50);
      const animationFPSThrottler = createAnimationFPSThrottler();
      const loop = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.restore();
        puzzle.updatedOrientation.angle += 0.015;
        puzzle.update();
        puzzle.render(ctx);
        if (menuStateCounter === localState) {
          animationFPSThrottler.requestAnimationFrame(loop);
        }
      };
      animationFPSThrottler.requestAnimationFrame(loop);

      window[elemId].onmousedown = () => showSizeMenu(elemId);
    }
  };

  window.showSizeMenu = (elemId) => {
    menuStateCounter++;
    const localState = menuStateCounter;
    window.shapemenu.style.display = window.settingsmenubutton.style.display =
      "none";
    window.sizemenu.style.display = window.puzzlemenubutton.style.display =
      "inline-block";
    for (let i = 0; i < 3; i++) {
      const ctx = window[`size-${i + 1}`].getContext("2d");
      const constructor = window.menuConfig.puzzles[elemId];
      const puzzleSize = window.menuConfig.sizes[elemId][i];
      const puzzle = constructor(puzzleSize, true);
      puzzle.updatedOrientation = {
        axis: new Vector({ x: 1, y: 1, z: 0 }),
        angle: 0,
      };
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(50, 50);
      animationFPSThrottler = createAnimationFPSThrottler();
      const loop = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        ctx.restore();
        puzzle.updatedOrientation.angle += 0.015;
        puzzle.update();
        puzzle.render(ctx);
        if (menuStateCounter === localState) {
          animationFPSThrottler.requestAnimationFrame(loop);
        }
      };
      animationFPSThrottler.requestAnimationFrame(loop);

      window[`size-${i + 1}`].onmousedown = () => {
        window.clearSolution();
        window.selectedPuzzle = constructor(puzzleSize, false);
        window.showStartButton();
      };
    }
  };

  window.showSettingsMenu = () => {
    window.puzzlemenu.style.display = window.settingsmenubutton.style.display =
      "none";
    window.configurationmenu.style.display =
      window.puzzlemenubutton.style.display = "inline-block";
  };

  window.hideStartButton = () => {
    window.startbutton.style.visibility = "hidden";
  };

  window.showStartButton = () => {
    window.startbutton.style.visibility = "visible";
  };

  window.showShapeMenu();
})();
