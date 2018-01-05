import {PointHash as PointHash2D} from "./hash2d"
import {
  boxesIntersect,
  boxIsWithinBox,
  pointIsWithinBox,
  squaredDistanceBetweenPoints,
  squaredDistanceBetweenPointAndRectangle
} from "./geometry3d";

/**
 * Spatial Hash for 3D Point Objects
 */
export class PointHash extends PointHash2D {
  constructor(cell_size = 6) {
    super(cell_size)
    this.distance = squaredDistanceBetweenPoints
    this.intersects = pointIsWithinBox
    this.encloses = pointIsWithinBox
  }

  clear() {
    this.cells = {}
    this.objects = {}
  }

  key(x, y, z) {
    return Math.floor(x / this.cell_size) + "," + Math.floor(y / this.cell_size) + "," + Math.floor(z / this.cell_size)
  }

  insert(obj) {
    let key = this.key(obj.x, obj.y, obj.z)
    if (this.cells[key]) this.cells[key].push(obj)
    else this.cells[key] = [obj]
    this.objects[obj.id] = key
  }

  getCollisionCandidates(box) {
    let {x, y, z, width, height, depth} = box
    let ret = [], bx, by, bz, d = this.cell_size
    for (bz = z; bz <= z + depth; bz += d) {
      for (by = y; by <= y + height; by += d) {
        for (bx = x; bx <= x + width; bx += d) {
          let contents = this.cells[this.key(bx, by, bz)]
          if (contents !== undefined) ret = ret.concat(contents)
        }
      }
    }
    return this.removeDoublets(ret)
  }

  findNearestNeighbours(p, k = 1, max_radius = this.cell_size) {
    const {x, y, z} = p, d = this.cell_size
    let candidates = [], key, contents, bx, by, bz, radius, visited = new Set()
    for (radius = d; candidates.length < k; radius += d) {
      for (bz = z - radius; bz <= z + radius; bz += d) {
        for (by = y - radius; by <= y + radius; by += d) {
          for (bx = x - radius; bx <= x + radius; bx += d) {
            key = this.key(bx, by, bz)
            if (!visited.has(key)) {
              contents = this.cells[key]
              if (contents !== undefined)
                candidates = this.removeDoublets(candidates.concat(contents))
              visited.add(key)
            }
          }
        }
      }
      if (radius > max_radius) break // check that here, so we get at least one iteration
    }
    let sorted_pairs = candidates.map((c, i) => [i, this.distance(p, c)], this).sort((a, b) => a[1] - b[1])
    return sorted_pairs.map(pair => candidates[pair[0]])
  }

  findNearestNeighbour(p, radius = this.cell_size) {
    const {x, y, z} = p
    let candidates = this.getCollisionCandidates({
      x: x - radius,
      y: y - radius,
      z: z - radius,
      width: radius * 2,
      height: radius * 2,
      depth: radius * 2
    }), len = candidates.length
    if (len === 0) return null
    if (len === 1) return candidates[0]
    let square_distance, best_square_dist = Infinity, best = null
    for (let i = 0; i < len; i++) {
      square_distance = this.distance(p, candidates[i])
      if (square_distance === 0) {
        return candidates[i]
      } else if (square_distance < best_square_dist) {
        best_square_dist = square_distance
        best = candidates[i]
      }
    }
    return best
  }
}

/**
 * Spatial Hash for Axis-Aligned 3D Box Objects (e.g. Bounding Boxes)
 */
export class BoxHash extends PointHash {
  constructor(cell_size = 6) {
    super(cell_size)
    this.removeDoublets = (array) => Array.from(new Set(array))
    this.distance = squaredDistanceBetweenPointAndRectangle
    this.intersects = boxesIntersect
    this.encloses = boxIsWithinBox
  }

  insert(obj) {
    let {id, x, y, z, width, height, depth} = obj
    let bx, by, bz, key, d = this.cell_size
    for (bz = z; bz <= z + depth; bz += d) {
      for (by = y; by <= y + height; by += d) {
        for (bx = x; bx <= x + width; bx += d) {
          key = this.key(bx, by, bz)
          if (this.cells[key]) this.cells[key].push(obj)
          else this.cells[key] = [obj]
          if (this.objects[id]) this.objects[id].push(key)
          else this.objects[id] = [key]
        }
      }
    }
  }

  remove(obj) {
    this.objects[obj.id].forEach((key) => {
      let contents = this.cells[key].filter(o => o.id !== obj.id)
      if (contents.length > 0)
        this.cells[key] = contents
      else delete this.cells[key]
    }, this)
    delete this.objects[obj.id]
  }
}
