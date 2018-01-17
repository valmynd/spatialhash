// read http://paulbourke.net/geometry/platonic/

export function octahedron() {
  return {
    positions: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, -1]
    ],
    cells: [
      [0, 1, 2],
      [0, 5, 1],
      [3, 2, 1],
      [3, 1, 5],
      [0, 2, 4],
      [0, 4, 5],
      [3, 4, 2],
      [3, 5, 4]
    ]
  }
}

export function hexahedron() {
  let irad = Math.sqrt(1 / 3)
  let diag = Math.sqrt(2 / 3)
  return {
    positions: [
      [0, irad, diag],
      [diag, irad, 0],
      [0, irad, -diag],
      [-diag, irad, 0],
      [-diag, -irad, 0],
      [0, -irad, diag],
      [diag, -irad, 0],
      [0, -irad, -diag]
    ],
    cells: [
      [0, 1, 2],
      [0, 2, 3],
      [0, 6, 1],
      [0, 5, 6],
      [0, 3, 4],
      [0, 4, 5],
      [7, 2, 1],
      [7, 1, 6],
      [7, 6, 5],
      [7, 5, 4],
      [7, 4, 3],
      [7, 3, 2]
    ]
  }
}

export function tetrahedron() {
  let a0 = 0
  let a1 = 2 * Math.PI / 3
  let a2 = 2 * Math.PI * 2 / 3
  let height = 4 / 3
  let b = 1 - height
  let d = Math.sqrt(0.5) * height
  return {
    positions: [
      [0, 0, 1],
      [d * Math.cos(a0), d * Math.sin(a0), b],
      [d * Math.cos(a1), d * Math.sin(a1), b],
      [d * Math.cos(a2), d * Math.sin(a2), b]
    ],
    cells: [
      [0, 1, 2],
      [2, 3, 0],
      [3, 1, 0],
      [1, 3, 2]
    ]
  }
}

function scale(v, factor) {
  return [
    v[0] * factor,
    v[1] * factor,
    v[2] * factor,
  ]
}

function normalize(v) {
  let len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
  return (len > 0) ? scale(v, 1 / len) : v
}

export function dodecahedron() {
  let r = 0.5
  let phi = (1 + Math.sqrt(5)) / 2
  let a = r
  let b = r / phi
  let c = r * (2 - phi)
  return {
    positions: [
      [c, 0, a],
      [-c, 0, a],
      [-b, b, b],
      [0, a, c],
      [b, b, b],
      [b, -b, b],
      [0, -a, c],
      [-b, -b, b],
      [c, 0, -a],
      [-c, 0, -a],
      [-b, -b, -b],
      [0, -a, -c],
      [b, -b, -b],
      [b, b, -b],
      [0, a, -c],
      [-b, b, -b],
      [a, c, 0],
      [-a, c, 0],
      [-a, -c, 0],
      [a, -c, 0]
    ].map(v => scale(normalize(v), r)),
    cells: [
      [4, 3, 2, 1, 0],
      [7, 6, 5, 0, 1],
      [12, 11, 10, 9, 8],
      [15, 14, 13, 8, 9],
      [14, 3, 4, 16, 13],
      [3, 14, 15, 17, 2],
      [11, 6, 7, 18, 10],
      [6, 11, 12, 19, 5],
      [4, 0, 5, 19, 16],
      [12, 8, 13, 16, 19],
      [15, 9, 10, 18, 17],
      [7, 1, 2, 17, 18]
    ]
  }
}

