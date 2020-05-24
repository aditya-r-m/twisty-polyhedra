(() => {
    window.sWorker = new Worker("src/classes/solver/SWorker.js");
    window.generateSolution = () => {
        window.sWorker.postMessage(window.selectedPuzzle);
    };
    window.sWorker.onmessage = e => {
        window.sres = e.data;
    }
})();
