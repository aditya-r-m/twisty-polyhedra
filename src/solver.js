(() => {
    window.solverWorker = new Worker("src/solver-worker.js");
    window.generateSolution = () => {
        console.log(new Date());
        window.solverWorker.postMessage(window.selectedPuzzle);
    };
    window.solverWorker.onmessage = e => {
        window.sres = e.data;
        console.log(new Date());
    }
})();
