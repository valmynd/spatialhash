/**
 * ported from C++ to Javascript
 * C++ Code can be found here: https://github.com/caosdoar/spheres/blob/master/src/spheres.cpp (License: MIT)
 * read https://github.com/caosdoar/spheres
 * ALSO READ http://paulbourke.net/geometry/platonic/
 */

/**
 * Scalar Product
 * @param {Vector} a
 * @param {Vector} b
 * @return {number}
 */
let dot = (a, b) => {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/**
 * Vector Product
 * @param {Vector} a
 * @param {Vector} b
 * @return {Vector}
 */
let vmul = (a, b) => {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]]
}

/**
 * Vector Sum
 * @param {Vector} a
 * @param {Vector} b
 * @return {Vector}
 */
let vadd = (a, b) => {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

let normalize = (a) => {
  const lrcp = 1 / Math.sqrt(dot(a, a))
  return [a[0] * lrcp, a[1] * lrcp, a[2] * lrcp]
}

function icosahedron() {
  const t = (1 + Math.sqrt(5)) / 2
  return {
    positions: [ // vertices
      normalize([-1, t, 0]),
      normalize([1, t, 0]),
      normalize([-1, -t, 0]),
      normalize([1, -t, 0]),
      normalize([0, -1, t]),
      normalize([0, 1, t]),
      normalize([0, -1, -t]),
      normalize([0, 1, -t]),
      normalize([t, 0, -1]),
      normalize([t, 0, 1]),
      normalize([-t, 0, -1]),
      normalize([-t, 0, 1])
    ],
    cells: [ // faces/triangles
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1],
    ]
  }
}

/**
 * @param {int} f0
 * @param {int} f1
 * @param {Vector} v0
 * @param {Vector} v1
 * @param {Object} io_mesh
 * @param {Object} io_divisions
 * @return {int}
 */
function subdivideEdge(f0, f1, v0, v1, io_mesh, io_divisions) {
  const edge = [f0, f1]
  let existing = io_divisions[edge.toString()]
  if (existing) return existing
  const v = normalize(vmul([0.5, 0.5, 0.5], vadd(v0, v1)))
  const f = io_mesh.positions.length
  io_mesh.positions.push(v)
  io_divisions[edge.toString()] = f
  return f
}

function subdivideMesh(meshIn) {
  let meshOut = {cells: [], positions: meshIn.positions}
  let divisions = {} // in original: std::map<Edge, uint32_t>  Edge -> new vertex
  for (let i = 0; i < meshIn.cells.length; ++i) {
    let f0 = meshIn.cells[i][0] // in original: triangles
    let f1 = meshIn.cells[i][1]
    let f2 = meshIn.cells[i][2]
    let v0 = meshIn.positions[f0]
    let v1 = meshIn.positions[f1]
    let v2 = meshIn.positions[f2]
    let f3 = subdivideEdge(f0, f1, v0, v1, meshOut, divisions)
    let f4 = subdivideEdge(f1, f2, v1, v2, meshOut, divisions)
    let f5 = subdivideEdge(f2, f0, v2, v0, meshOut, divisions)
    meshOut.cells.push(
      [f0, f3, f5],
      [f3, f1, f4],
      [f4, f2, f5],
      [f3, f4, f5]
    )
  }
  return meshOut
}

export const sphere = subdivideMesh(subdivideMesh(icosahedron()))

