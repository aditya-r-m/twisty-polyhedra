### Introduction

The project contains a basic framework to create different 3D twisty puzzles. It includes definitions for general sized permutation puzzles based on the platonic solids: Tetrahedral, Cubic & Dodecahedral puzzles as well as Face turning Octahedra & Axis turning Icosahedra.

The contained defnitions can be extended to model other known shapes or to create completely new permutation puzzles with crazy structures!

https://medium.com/@adityam.rtm/creating-3d-twisty-puzzles-using-programming-5800fb7eaab8

The project contains a polynomial time solver for the 5 platonic solids. The solver stays agnostic to the shape it's given & the solution length is quadratic in terms of edge length (i.e. bounded by the number of clusters with solution of each cluster bounded by some constant).
The solver proceeds cluster by cluster. It breaks down the stickers into connected components & then does the following,

Pre-processing the puzzle
1. Generate Conjugates from Atomic twists (X . Y . X')
2. Generate Commutators by merging Conjugates & Atomic twists (C . X . C' . X') where C is a conjugate & X is an atomic twist

The solver preserves the commutators which perform very small swaps - for example, 3 sticker cycles which leave all other stickers unaffected.
Once a puzzle is pre-processed, the information stays cached & need not be computed again until the tab is killed.

Processing the given state
1. Identify & align the face centers
2. Identify & fix odd parity clusters
3. Use pre-built commutators (or atomic twists if no commutators found) to solve clusters piece by piece
  3.1 (L0) Attempt application of simple commutators & look for improvements
  3.2 (L1) Attempt application of commutators conjugated by atomic twists & look for improvements (X . Cm . X') where X is atomic twist & Cm is a commutator
  3.3 (L2) Find pairs of commutators whose chained application results in improvement (Cm . Cn) where Cm & Cn are different commutators
  3.4 (L3) Find pairs of commutators conjugated by atomic twists & look for improvements (X . Cm . Cn . X') where X is atomic twist & Cm, Cn are different commutators

In all these steps, the central part is composing different permutations & trying to move towards smaller & smaller permutations.

### Demo

Refer to the following link for the demo & instructions:
https://aditya-r-m.github.io/twisty-polyhedra

### Requirements

The interface relies on cursor gestures & works best with latest chrome on a desktop/laptop having screen resolutions at least 1366x768 on a reasonably fast machine, but it should also work fine on latest Firefox/Safari with screen resolution at least 1024x768.

### Solver Benchmarks (Intel i7-9750H @2.60GHz)

Puzzle        | Edge size | Preprocessing time (ms) | processing time (ms) | Solution length
--------------|-----------|-------------------------|----------------------|------------------
Tetrahedron   | 3         | 468                     | 11                   | 38
Tetrahedron   | 4         | 1837                    | 15                   | 106
Tetrahedron   | 5         | 5654                    | 19                   | 250
Cube          | 2         | 149                     | 23                   | 64
Cube          | 3         | 1066                    | 32                   | 148
Cube          | 4         | 7052                    | 62                   | 340
Octahedron    | 2         | 216                     | 3                    | 33
Octahedron    | 3         | 2301                    | 13                   | 172
Octahedron    | 4         | 9839                    | 19                   | 366
Dodecahedron  | 2(+1)     | 3729                    | 499                  | 388
Dodecahedron  | 4(+1)     | 88374                   | 804                  | 2202
Dodecahedron  | 6(+1)     | 506571                  | 14709                | 4870
Icosahedron   | 2         | 4317                    | 130                  | 568
Icosahedron   | 3         | 26648                   | 272                  | 1312
Icosahedron   | 4         | 104973                  | 563                  | 2252

Most puzzles are well behaved, but Dodecahedra are especially bad for 2 reasons,
1. It takes many atomic twists to move any piece on a dodecahedra to the opposite end.
2. The "star" clusters on dodecahedra inherently dislocate other pieces, so even the best commutators on them are much larger in size to maintain & process.

### Potential Improvements

The symmetries across different clusters & stickers within the same cluster can be leveraged to avoid a significant fraction of the computation for preprocessing the larger puzzles.
