importScripts("./utils.js");
importScripts("./classes/Solver/DirectedCycle.js");
importScripts("./classes/Solver/CompositeCycle.js");
importScripts("./classes/Solver/Commutator.js");

this.commutatorMap = {};
this.getPuzzleId = puzzle => `${puzzle.faces.length}-f-${puzzle.cycles.length}-c`;

this.onmessage = function(e) {
  let puzzle = e.data;
  let puzzleId = this.getPuzzleId(puzzle);
  if (!this.commutatorMap[puzzleId]) {
    this.commutatorMap[puzzleId] = new Commutator(puzzle);
  }
  this.postMessage({ status: "INIT", commutatorMap });
}
