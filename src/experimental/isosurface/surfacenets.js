const abs = Math.abs
// SurfaceNets in JavaScript by Mikola Lysenko (license: MIT, see LICENSE_THIRD_PARTY)
// Based on: S.F. Gibson, "Constrained Elastic Surface Nets". (1998) MERL Tech Report.
// pre-compute edge table, like Paul Bourke does.
// This saves a bit of time when computing the centroid of each boundary cell
let cube_edges = new Int32Array(24), edge_table = new Int32Array(256)
// Initialize the cube_edges table
// This is just the vertex number of each cube
for (let i = 0, k = 0; i < 8; ++i) {
  for (let j = 1; j <= 4; j <<= 1) {
    let p = i ^ j
    if (i <= p) {
      cube_edges[k++] = i
      cube_edges[k++] = p
    }
  }
}
// Initialize the intersection table.
// This is a 2^(cube configuration) -> 2^(edge configuration) map
// There is one entry for each possible cube configuration, and the output is a 12-bit vector enumerating all edges crossing the 0-level.
for (let i = 0; i < 256; ++i) {
  let em = 0, j = 0
  for (; j < 24; j += 2) em |= !!(i & (1 << cube_edges[j])) !== !!(i & (1 << cube_edges[j + 1])) ? (1 << (j >> 1)) : 0
  edge_table[i] = em
}

/**
 * Polygonize a continuous function via the SurfaceNets Algorithm
 * @param {Size} dims
 * @param {function} func
 * @param {Box} bounds
 * @return {{positions: Vector[], cells: Vector[]}}
 */
export function triangulate(dims, func, bounds = [[0, 0, 0], dims]) {
  let scale = [0, 0, 0], shift = [0, 0, 0]
  for (let i = 0; i < 3; ++i) {
    scale[i] = (bounds[1][i] - bounds[0][i]) / dims[i]
    shift[i] = bounds[0][i]
  }
  let vertices = [], faces = [], n = 0, buf_no = 1, buffer = {},
    R = [1, (dims[0] + 1), (dims[0] + 1) * (dims[1] + 1)],
    grid = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  // March over the voxel grid
  for (let z = 0; z < dims[2] - 1; ++z, n += dims[0], buf_no ^= 1, R[2] = -R[2]) {
    // m is the pointer into the buffer we are going to use.
    // This is slightly obtuse because javascript does not have good support for packed data structures, so we must use typed arrays :(
    // The contents of the buffer will be the indices of the vertices on the previous x/y slice of the volume
    let m = 1 + (dims[0] + 1) * (1 + buf_no * (dims[1] + 1))
    for (let y = 0; y < dims[1] - 1; ++y, ++n, m += 2) {
      for (let x = 0; x < dims[0] - 1; ++x, ++n, ++m) {
        // Read in 8 field values around this vertex and store them in an array
        // Also calculate 8-bit mask, like in marching cubes, so we can speed up sign checks later
        let mask = 0, g = 0
        for (let k = 0; k < 2; ++k) {
          for (let j = 0; j < 2; ++j) {
            for (let i = 0; i < 2; ++i, ++g) {
              let p = func(
                scale[0] * (x + i) + shift[0],
                scale[1] * (y + j) + shift[1],
                scale[2] * (z + k) + shift[2])
              grid[g] = p
              mask |= (p < 0) ? (1 << g) : 0
            }
          }
        }
        // Check for early termination if cell does not intersect boundary
        if (mask === 0 || mask === 0xff) {
          continue
        }
        // Sum up edge intersections
        let edge_mask = edge_table[mask], v = [0.0, 0.0, 0.0], e_count = 0
        // For every edge of the cube...
        for (let i = 0; i < 12; ++i) {
          // Use edge mask to check if it is crossed
          if (!(edge_mask & (1 << i))) {
            continue
          }
          // If it did, increment number of edge crossings
          ++e_count
          // Now find the point of intersection
          let e0 = cube_edges[i << 1], e1 = cube_edges[(i << 1) + 1] // unpack vertices
          let g0 = grid[e0], g1 = grid[e1] // unpack grid values
          let t = g0 - g1 // compute point of intersection
          if (abs(t) > 1e-6) {
            t = g0 / t
          } else {
            continue
          }
          // Interpolate vertices and add up intersections (this can be done without multiplying)
          for (let j = 0, k = 1; j < 3; ++j, k <<= 1) {
            let a = e0 & k, b = e1 & k
            if (a !== b) {
              v[j] += a ? 1.0 - t : t
            } else {
              v[j] += a ? 1.0 : 0
            }
          }
        }
        // Now we just average the edge intersections and add them to coordinate
        let s = 1.0 / e_count, xyz = [x, y, z]
        for (let i = 0; i < 3; ++i) {
          v[i] = scale[i] * (xyz[i] + s * v[i]) + shift[i]
        }
        // Add vertex to buffer, store pointer to vertex index in buffer
        buffer[m] = vertices.length
        vertices.push(v)
        // Now we need to add faces together, to do this we just loop over 3 basis components
        for (let i = 0; i < 3; ++i) {
          // The first three entries of the edge_mask count the crossings along the edge
          if (!(edge_mask & (1 << i))) {
            continue
          }
          // i = axes we are point along. iu, iv = orthogonal axes
          let iu = (i + 1) % 3, iv = (i + 2) % 3
          // If we are on a boundary, skip it
          if (xyz[iu] === 0 || xyz[iv] === 0) {
            continue
          }
          // Otherwise, look up adjacent edges in buffer
          let du = R[iu], dv = R[iv]
          // Remember to flip orientation depending on the sign of the corner.
          if (mask & 1) {
            faces.push([
              buffer[m] || 0,
              buffer[m - du] || 0,
              buffer[m - dv] || 0
            ])
            faces.push([
              buffer[m - dv] || 0,
              buffer[m - du] || 0,
              buffer[m - du - dv] || 0
            ])
          } else {
            faces.push([
              buffer[m] || 0,
              buffer[m - dv] || 0,
              buffer[m - du] || 0
            ])
            faces.push([
              buffer[m - du] || 0,
              buffer[m - dv] || 0,
              buffer[m - du - dv] || 0
            ])
          }
        }
      }
    }
  }
  // All done! Return the result
  return {positions: vertices, cells: faces}
}
