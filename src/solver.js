(() => {
  window.showSolverUnsupportedMessage = () => {
    window.solverunsupported.style.display = "block";
    window.solvewrapper.style.display = "none";
  };

  // The interface from the UI thread to the solver worker.
  if (window.Worker) {
    window.solverWorker = new Worker("src/solver-worker.js");
    window.solverWorker.onerror = (evt) => showSolverUnsupportedMessage();
  } else {
    showSolverUnsupportedMessage();
  }

  // Generated solution can be traverses using 2 stacks.
  const solutionStack = (window.solutionStack = {
    movesMade: [],
    movesToMake: [],
  });

  window.updateSolutionPanel = () => {
    const sequence = solutionStack.movesToMake.length
      ? solutionStack.movesToMake[solutionStack.movesToMake.length - 1].sequence
      : solutionStack.movesMade.length
      ? "Solved!"
      : "Already Solved!";
    const subSequence = solutionStack.movesToMake.length
      ? solutionStack.movesToMake[solutionStack.movesToMake.length - 1]
          .subSequence
      : "";
    window.solutioninfo.innerHTML = `
            ${sequence}
            <br/>
            ${subSequence ? `${subSequence}<br/>` : ""}
            ${solutionStack.movesMade.length}/${
      solutionStack.movesMade.length + solutionStack.movesToMake.length
    }`;
    if (solutionStack.movesToMake.length) {
      window.applysolutionpanel.style.visibility = "visible";
    } else {
      window.applysolutionpanel.style.visibility = "hidden";
    }
    if (solutionStack.movesMade.length) {
      window.revertsolutionpanel.style.visibility = "visible";
    } else {
      window.revertsolutionpanel.style.visibility = "hidden";
    }
  };

  let inProgress = false;
  let isStale = false;
  let isDisabled = false;

  window.clearSolution = () => {
    if (inProgress) {
      isStale = true;
    } else {
      window.solutionpanel.style.display = "none";
    }
  };

  window.disableSolveButton = () => {
    window.solvebutton.style.color = "grey";
    window.solvebutton.style.borderColor = "grey";
    isDisabled = true;
  };

  window.enableSolveButton = () => {
    window.solvebutton.style.color = "skyblue";
    window.solvebutton.style.borderColor = "skyblue";
    isDisabled = false;
  };

  window.generateSolution = () => {
    if (inProgress || isDisabled) return;
    inProgress = true;
    window.selectedPuzzle.clearStats();
    window.solvebutton.style.display = "none";
    window.solverstatus.style.display = "block";
    window.solverstatustext.innerHTML = `Initializing solver for ${window.selectedPuzzle.displayName} of size ${window.selectedPuzzle.displaySize}
            <br/>(This may take minutes for large puzzles)
            `;
    window.solverWorker.postMessage(window.selectedPuzzle);
  };

  if (window.solverWorker) {
    window.solverWorker.onmessage = (e) => {
      if (e.data.status === "INITIALIZED") {
        window.solverstatustext.innerText = `Solving ${window.selectedPuzzle.displayName} of size ${window.selectedPuzzle.displaySize}`;
      }
      if (e.data.status === "SOLVED") {
        window.solverstatus.style.display = "none";
        window.solvebutton.style.display = "inline-block";
        if (!isStale) {
          window.solutionStack.movesMade = [];
          window.solutionStack.movesToMake = e.data.solution.reverse();
          window.solutionpanel.style.display = "block";
          updateSolutionPanel();
        }
        isStale = false;
        inProgress = false;
      }
    };
  }

  window.makeSolverMove = () => {
    if (!solutionStack.movesToMake.length) return;
    const moveToMake = solutionStack.movesToMake.pop();
    const direction =
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
    const moveToRevert = solutionStack.movesMade.pop();
    const direction =
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
    const sequenceToCover =
      solutionStack.movesToMake[solutionStack.movesToMake.length - 1].sequence;
    while (
      solutionStack.movesToMake.length &&
      solutionStack.movesToMake[solutionStack.movesToMake.length - 1]
        .sequence === sequenceToCover
    ) {
      const moveToMake = solutionStack.movesToMake.pop();
      window.selectedPuzzle.cycles[moveToMake.cycleIndex].twist(
        moveToMake.direction
      );
      solutionStack.movesMade.push(moveToMake);
    }
    updateSolutionPanel();
  };

  window.revertSolverMoveSequence = () => {
    if (!solutionStack.movesMade.length) return;
    const sequenceToCover =
      solutionStack.movesMade[solutionStack.movesMade.length - 1].sequence;
    while (
      solutionStack.movesMade.length &&
      solutionStack.movesMade[solutionStack.movesMade.length - 1].sequence ===
        sequenceToCover
    ) {
      const moveToRevert = solutionStack.movesMade.pop();
      window.selectedPuzzle.cycles[moveToRevert.cycleIndex].twist(
        -moveToRevert.direction
      );
      solutionStack.movesToMake.push(moveToRevert);
    }
    updateSolutionPanel();
  };

  window.makeAllSolverMoves = () => {
    while (solutionStack.movesToMake.length) {
      const moveToMake = solutionStack.movesToMake.pop();
      window.selectedPuzzle.cycles[moveToMake.cycleIndex].twist(
        moveToMake.direction
      );
      solutionStack.movesMade.push(moveToMake);
    }
    updateSolutionPanel();
  };

  window.revertAllSolverMoves = () => {
    while (solutionStack.movesMade.length) {
      const moveToRevert = solutionStack.movesMade.pop();
      window.selectedPuzzle.cycles[moveToRevert.cycleIndex].twist(
        -moveToRevert.direction
      );
      solutionStack.movesToMake.push(moveToRevert);
    }
    updateSolutionPanel();
  };
})();
