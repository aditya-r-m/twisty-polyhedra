cat src/classes/Vector.js \
    src/classes/Quaternion.js \
    src/classes/Point.js \
    src/classes/Sticker.js \
    src/classes/Face.js \
    src/classes/Cycle.js \
    src/classes/Puzzle.js \
    src/classes/Puzzles/Cube.js \
    src/classes/Puzzles/Tetrahedron.js \
    src/classes/Puzzles/Octahedron.js \
    src/classes/Puzzles/Dodecahedron.js \
    src/menu.js \
    src/game.js \
> dist/temp.js

google-closure-compiler-js dist/temp.js > dist/build.js

rm dist/temp.js
