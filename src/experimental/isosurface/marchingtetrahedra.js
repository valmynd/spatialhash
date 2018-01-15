const abs = Math.abs
// Marching Tetrahedra in Javascript Javascript port by Mikola Lysenko (see LICENSE_THIRD_PARTY)
// Based on Paul Bourke's implementation http://local.wasp.uwa.edu.au/~pbourke/geometry/polygonise/
let cube_vertices = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1]
]
let tetra_list = [
  [0, 2, 3, 7],
  [0, 6, 2, 7],
  [0, 4, 6, 7],
  [0, 6, 1, 2],
  [0, 1, 6, 4],
  [5, 6, 1, 4]
]

/**
 * Polygonize a continuous function via the Marching Tetrahedra Algorithm
 * @param {Size} dims
 * @param {function} func
 * @param {Box} bounds
 * @return {{positions: Vector[], cells: Vector[]}}
 */
export function triangulate(dims, func, bounds = [[0, 0, 0], dims]) {
  let scale = [0, 0, 0]
  let shift = [0, 0, 0]
  for (let i = 0; i < 3; ++i) {
    scale[i] = (bounds[1][i] - bounds[0][i]) / dims[i]
    shift[i] = bounds[0][i]
  }
  let vertices = [], faces = [], n = 0, x = 0, y = 0, z = 0
  let grid = new Float32Array(8)
  const cut = (i0, i1) => {
    let g0 = grid[i0],
      g1 = grid[i1],
      p0 = cube_vertices[i0],
      p1 = cube_vertices[i1],
      v = [x, y, z],
      t = g0 - g1
    if (abs(t) > 1e-6) {
      t = g0 / t
    }
    for (let i = 0; i < 3; ++i) {
      v[i] = scale[i] * (v[i] + p0[i] + t * (p1[i] - p0[i])) + shift[i]
    }
    vertices.push(v)
    return vertices.length - 1
  }
  // March over the volume
  for (z = 0; z < dims[2] - 1; ++z, n += dims[0])
    for (y = 0; y < dims[1] - 1; ++y, ++n)
      for (x = 0; x < dims[0] - 1; ++x, ++n) {
        // Read in cube
        for (let i = 0; i < 8; ++i) {
          let cube_vert = cube_vertices[i]
          grid[i] = func(
            scale[0] * (x + cube_vert[0]) + shift[0],
            scale[1] * (y + cube_vert[1]) + shift[1],
            scale[2] * (z + cube_vert[2]) + shift[2])
        }
        for (let i = 0; i < tetra_list.length; ++i) {
          let T = tetra_list[i], triindex = 0
          if (grid[T[0]] < 0) triindex |= 1
          if (grid[T[1]] < 0) triindex |= 2
          if (grid[T[2]] < 0) triindex |= 4
          if (grid[T[3]] < 0) triindex |= 8
          // Handle each case
          switch (triindex) {
            case 0x00:
            case 0x0F:
              break
            case 0x0E:
              faces.push([
                cut(T[0], T[1]),
                cut(T[0], T[3]),
                cut(T[0], T[2])])
              break
            case 0x01:
              faces.push([
                cut(T[0], T[1]),
                cut(T[0], T[2]),
                cut(T[0], T[3])])
              break
            case 0x0D:
              faces.push([
                cut(T[1], T[0]),
                cut(T[1], T[2]),
                cut(T[1], T[3])])
              break
            case 0x02:
              faces.push([
                cut(T[1], T[0]),
                cut(T[1], T[3]),
                cut(T[1], T[2])])
              break
            case 0x0C:
              faces.push([
                cut(T[1], T[2]),
                cut(T[1], T[3]),
                cut(T[0], T[3]),
                cut(T[0], T[2])])
              break
            case 0x03:
              faces.push([
                cut(T[1], T[2]),
                cut(T[0], T[2]),
                cut(T[0], T[3]),
                cut(T[1], T[3])])
              break
            case 0x04:
              faces.push([
                cut(T[2], T[0]),
                cut(T[2], T[1]),
                cut(T[2], T[3])])
              break
            case 0x0B:
              faces.push([
                cut(T[2], T[0]),
                cut(T[2], T[3]),
                cut(T[2], T[1])])
              break
            case 0x05:
              faces.push([
                cut(T[0], T[1]),
                cut(T[1], T[2]),
                cut(T[2], T[3]),
                cut(T[0], T[3])])
              break
            case 0x0A:
              faces.push([
                cut(T[0], T[1]),
                cut(T[0], T[3]),
                cut(T[2], T[3]),
                cut(T[1], T[2])])
              break
            case 0x06:
              faces.push([
                cut(T[2], T[3]),
                cut(T[0], T[2]),
                cut(T[0], T[1]),
                cut(T[1], T[3])])
              break
            case 0x09:
              faces.push([
                cut(T[2], T[3]),
                cut(T[1], T[3]),
                cut(T[0], T[1]),
                cut(T[0], T[2])])
              break
            case 0x07:
              faces.push([
                cut(T[3], T[0]),
                cut(T[3], T[1]),
                cut(T[3], T[2])])
              break
            case 0x08:
              faces.push([
                cut(T[3], T[0]),
                cut(T[3], T[2]),
                cut(T[3], T[1])])
              break
          }
        }
      }
  return {positions: vertices, cells: faces}
}
