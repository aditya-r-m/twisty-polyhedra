(() => {
  let solutionStack = (window.solutionStack = {
    movesMade: [],
    movesToMake: [],
  });
  window.updateSolutionPanel = () => {
    let sequence = solutionStack.movesToMake.length
      ? solutionStack.movesToMake[solutionStack.movesToMake.length - 1].sequence
      : "Solved!";
    let subSequence = solutionStack.movesToMake.length
      ? solutionStack.movesToMake[solutionStack.movesToMake.length - 1]
          .subSequence
      : "";
    window.solutioninfo.innerHTML = `
            ${sequence}
            <br/>
            ${subSequence ? `${subSequence}<br/>` : ""}
            ${solutionStack.movesMade.length}/${
      solutionStack.movesMade.length + solutionStack.movesToMake.length
    }
        `;
  };
  window.clearSolution = () => {
    window.solutionpanel.style.display = "none";
  };
  window.showSolveButton = () => {
    window.solvebutton.style.display = "inline-block";
    window.clearSolution();
  };
  let inProgress = false;
  window.solverWorker = new Worker("src/solver-worker.js");
  window.generateSolution = () => {
    if (inProgress) return;
    inProgress = true;
    window.selectedPuzzle.clearStats();
    window.solverWorker.postMessage(window.selectedPuzzle);
    window.solvebutton.style.display = "none";
    window.solvebutton.style.color = "grey";
    window.solvebutton.style.borderColor = "grey";
    window.solverstatus.style.display = "block";
    window.solverstatustext.innerHTML = `Initializing solver for ${window.selectedPuzzle.displayName} of size ${window.selectedPuzzle.displaySize}
            <br/>(This may take minutes for large puzzles)
            `;
  };
  window.solverWorker.onmessage = (e) => {
    if (e.data.status === "INITIALIZED") {
      window.solverstatustext.innerText = `Solving ${window.selectedPuzzle.displayName} of size ${window.selectedPuzzle.displaySize}`;
    }
    if (e.data.status === "SOLVED") {
      window.solutionStack.movesMade = [];
      window.solutionStack.movesToMake = e.data.solution.reverse();
      updateSolutionPanel();
      window.solvebutton.style.color = "skyblue";
      window.solvebutton.style.borderColor = "skyblue";
      window.solverstatus.style.display = "none";
      window.solutionpanel.style.display = "block";
      inProgress = false;
    }
  };
  window.makeSolverMove = () => {
    if (!solutionStack.movesToMake.length) return;
    let moveToMake = solutionStack.movesToMake.pop();
    let direction =
      moveToMake.direction > moveToMake.period >> 1
        ? moveToMake.direction - moveToMake.period
        : moveToMake.direction;
    if (
      !window.selectedPuzzle.animateAndTwist(
        window.selectedPuzzle.cycles[moveToMake.cycleIndex],
        direction
      )
    ) {
      solutionStack.movesToMake.push(moveToMake);
      return;
    }
    solutionStack.movesMade.push(moveToMake);
    updateSolutionPanel();
  };
  window.revertSolverMove = () => {
    if (!solutionStack.movesMade.length) return;
    let moveToRevert = solutionStack.movesMade.pop();
    let direction =
      moveToRevert.direction > moveToRevert.period >> 1
        ? moveToRevert.direction - moveToRevert.period
        : moveToRevert.direction;
    if (
      !window.selectedPuzzle.animateAndTwist(
        window.selectedPuzzle.cycles[moveToRevert.cycleIndex],
        -direction
      )
    ) {
      solutionStack.movesMade.push(moveToRevert);
      return;
    }
    solutionStack.movesToMake.push(moveToRevert);
    updateSolutionPanel();
  };
  window.makeSolverMoveSequence = () => {
    if (!solutionStack.movesToMake.length) return;
    let sequenceToCover =
      solutionStack.movesToMake[solutionStack.movesToMake.length - 1].sequence;
    while (
      solutionStack.movesToMake.length &&
      solutionStack.movesToMake[solutionStack.movesToMake.length - 1]
        .sequence === sequenceToCover
    ) {
      let moveToMake = solutionStack.movesToMake.pop();
      window.selectedPuzzle.cycles[moveToMake.cycleIndex].twist(
        moveToMake.direction
      );
      solutionStack.movesMade.push(moveToMake);
    }
    updateSolutionPanel();
  };
  window.revertSolverMoveSequence = () => {
    if (!solutionStack.movesMade.length) return;
    let sequenceToCover =
      solutionStack.movesMade[solutionStack.movesMade.length - 1].sequence;
    while (
      solutionStack.movesMade.length &&
      solutionStack.movesMade[solutionStack.movesMade.length - 1].sequence ===
        sequenceToCover
    ) {
      let moveToRevert = solutionStack.movesMade.pop();
      window.selectedPuzzle.cycles[moveToRevert.cycleIndex].twist(
        -moveToRevert.direction
      );
      solutionStack.movesToMake.push(moveToRevert);
    }
    updateSolutionPanel();
  };
  window.makeAllSolverMoves = () => {
    while (solutionStack.movesToMake.length) {
      let moveToMake = solutionStack.movesToMake.pop();
      window.selectedPuzzle.cycles[moveToMake.cycleIndex].twist(
        moveToMake.direction
      );
      solutionStack.movesMade.push(moveToMake);
    }
    updateSolutionPanel();
  };
  window.revertAllSolverMoves = () => {
    while (solutionStack.movesMade.length) {
      let moveToRevert = solutionStack.movesMade.pop();
      window.selectedPuzzle.cycles[moveToRevert.cycleIndex].twist(
        -moveToRevert.direction
      );
      solutionStack.movesToMake.push(moveToRevert);
    }
    updateSolutionPanel();
  };
})();
