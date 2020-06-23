# Table of contents
* [Introduction](#introduction)
* [Solver](#solver)
    * [Algorithm](#algorithm)
    * [Benchmarks](#benchmarks)
    * [Potential Improvements](#improvements)


## Introduction <a name="introduction"></a>

The project contains a basic framework to create different 3D twisty puzzles. It includes definitions for general sized permutation puzzles based on the platonic solids: Tetrahedral, Cubic & Dodecahedral puzzles as well as Face turning Octahedra & Axis turning Icosahedra.

The contained defnitions can be extended to model other known shapes or to create completely new permutation puzzles with crazy structures!

Live demo:
https://aditya-r-m.github.io/twisty-polyhedra

Techniques used to build the interface:
https://medium.com/@adityam.rtm/creating-3d-twisty-puzzles-using-programming-5800fb7eaab8

The interface relies on cursor gestures & works best with latest chrome on a desktop/laptop having screen resolutions at least 1366x768 on a reasonably fast machine, but it should also work fine on latest Firefox/Safari with screen resolution at least 1024x768.

## Solver <a name="solver"></a>

The project contains a polynomial time solver for the 5 platonic solids. The solver stays agnostic to the shape it's given & the solution length is quadratic in terms of edge length (i.e. bounded by the number of clusters with solution of each cluster bounded by some constant).

### Algorithm <a name="algorithm"></a>

The solver proceeds cluster by cluster. It breaks down the stickers into connected components & then does the following,

Pre-processing the puzzle
1. Generate Conjugates from simple twists. These are of the form `X . Y . X'` where **X** & **Y** are simple twists.
2. Generate Commutators by merging Conjugates & simple twists. These are of the form `C . X . C' . X'` where **C** is a conjugate & **X** is a simple twist.

The solver preserves the commutators which perform very small swaps - for example, 3 sticker cycles which leave all other stickers unaffected.
Once a puzzle is pre-processed, the information stays cached & need not be computed again until the tab is killed.

Processing the given state
1. Identify & align the face centers.
2. Identify & fix odd parity clusters.
3. Use pre-built commutators to solve clusters piece by piece.
    * **(L0)** Attempt application of simple commutators & look for improvements.
    * **(L1)** Attempt application of commutators conjugated by simple twists & look for improvements. These are of the form `X . Cm . X'` where **X** is simple twist & **Cm** is a commutator.
    * **(L2)** Find pairs of commutators whose chained application results in improvement. These are of the form `Cm . Cn` where **Cm** & **Cn** are different commutators.
    * **(L3)** Find pairs of commutators conjugated by simple twists & look for improvements. These are of the form `X . Cm . Cn . X'` where **X** is simple twist & **Cm**, **Cn** are different commutators.

For (L2) & (L3) algorithms, we can also consider the conjugates built by the two commutators without any significant overhead.

Note: We have to be careful with special clusters of the following kind,
1. No commutators result in small cycles for the cluster (ex. - corner & near-corner clusters of the Tetrahedra).
2. Commutators result in small cycles within the cluster, but all of them dislocate pieces of other clusters (ex. - star clusters on Dodecahedra).

We identify which cluster fall in these categories just by looking at the results of the preprocessing & solve these before considering the normal clusters. Since there are no useful commutators for type (1) special clusters, we substitute their simple atomic twists into the patterns which generally apply commutators to improve puzzle state.

In all these steps, the central part is composing different permutations & trying to move towards smaller & smaller permutations.

### Benchmarks (Chrome 83 | Intel i7-9750H @2.60GHz) <a name="benchmarks"></a>

Puzzle        | Edge size | Preprocessing time (ms) | Processing time (ms) | Solution length
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
Dodecahedron  | 2         | 3729                    | 499                  | 388
Dodecahedron  | 4         | 88374                   | 804                  | 2202
Dodecahedron  | 6         | 506571                  | 14709                | 4870
Icosahedron   | 2         | 4317                    | 130                  | 568
Icosahedron   | 3         | 26648                   | 272                  | 1312
Icosahedron   | 4         | 104973                  | 563                  | 2252

Most puzzles are well behaved, but Dodecahedra are especially problematic for 3 reasons,
1. Triangular faces can be incremented in size by adding 1 new layer of alternating triangular tiles on 1 of the sides. Square faces can be incremented in size by adding 1 new layer of square tiles on 2 of the sides. Pentagonal faces take 1 new layer of square tiles on all 5 sides for the least increment. Thus, the least increment we can do on Dodecahedra edge size is a jump of 2.
2. It takes many simple twists to move any piece on a dodecahedra to the opposite end.
3. The "star" clusters on dodecahedra inherently dislocate other pieces, so even the best commutators on them are much larger in size to maintain & process.

### Potential Improvements <a name="improvements"></a>

The symmetries across different clusters & stickers within the same cluster can be leveraged to avoid a significant fraction of the computation for preprocessing the larger puzzles.
