importScripts("../../utils.js");
importScripts("./SCycle.js");
importScripts("./CommutatorGenerator.js");

this.commutatorMap = {};
this.getPuzzleId = puzzle => `${puzzle.faces.length}-f-${puzzle.cycles.length}-c`;

this.onmessage = function(e) {
  let puzzle = e.data;
  let puzzleId = this.getPuzzleId(puzzle);
  if (!this.commutatorMap[puzzleId]) {
    this.commutatorMap[puzzleId] = this.generateCommutators(puzzle);
  }
  this.postMessage({ status: "INIT", commutatorMap });
}
