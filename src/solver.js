(() => {
    window.sWorker = new Worker("src/classes/solver/SWorker.js");
    window.generateSolution = () => {
        console.log(new Date());
        window.sWorker.postMessage(window.selectedPuzzle);
    };
    window.sWorker.onmessage = e => {
        window.sres = e.data;
        console.log(new Date());
    }
})();
