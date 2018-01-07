import {
  boxesIntersect, boxIsWithinBox, squaredDistanceBetweenPointAndBox,
  squaredDistanceBetweenPoints
} from "./geometry";

/**
 * @typedef {Object} SpatialHashEntry
 * @property {int} id
 * @property {Box|Point} bb
 */

/**
 * Spatial Hash for K-Dimensional Points -OR- K-Dimensional axis-aligned Boxes
 * Implementation is based on this very good tutorial:
 *    http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
 */
class KDHash {
  constructor(K = 3, cell_size = 6, stores_points = false) {
    this.objects = {} // maps object-ids to hash-keys (needed for removing objects)
    this.cells = {} // maps hash-keys to arrays of objects
    this.cellSize = cell_size // size of each cell in coordinate-space
    this.isPointHash = stores_points // choice of geometry methods etc.
    this.K = K // K dimensions of point/box objects relevant for calculations
  }

  clear() {
    this.cells = {}
    this.objects = {}
  }

  /**
   * Calculate Hash-Keys for given x- and y-Coordinates
   * Each Hash-Key represents a Cell in a Grid. Each Cell may contain multiple Objects.
   * Points will be in exactly one Cell, while Rectangles may span over multiple Cells.
   * @param {Point} p
   * @protected
   */
  key(p) {
    // return floor(x / this.cell_size) + "," + floor(y / this.cell_size)
    let floor = Math.floor, q = this.cellSize
    return p.map(v => floor(v / q)).join(",")
  }

  /**
   * @param {Point} p
   * @param {Box|Point} bb
   * @returns {number}
   */
  distance(p, bb) {
    if (this.isPointHash) return squaredDistanceBetweenPoints(p, bb, this.K)
    return squaredDistanceBetweenPointAndBox(p, bb, this.K)
  }

  /**
   * Insert an object into the data structure
   * Inserted objects need to have an "id" property!
   * @param {SpatialHashEntry} obj
   */
  insert(obj) {
    if (this.isPointHash) { // points can't span multiple cells
      let key = this.key(obj.bb)
      if (this.cells[key]) this.cells[key].push(obj)
      else this.cells[key] = [obj]
      this.objects[obj.id] = key
    } else {
      if (this.K === 2) { // 2D axis aligned boxes can span multiple cells in 2 dimensions
        let [[minX, minY], [maxX, maxY]] = obj.bb
        let key, bx, by, d = this.cellSize, id = obj.id
        for (bx = minX; bx <= maxX; bx += d) {
          for (by = minY; by <= maxY; by += d) {
            key = this.key([bx, by])
            if (this.cells[key]) this.cells[key].push(obj)
            else this.cells[key] = [obj]
            if (this.objects[id]) this.objects[id].push(key)
            else this.objects[id] = [key]
          }
        }
      } else { // 3D axis aligned boxes can span multiple cells in 3 dimensions (+1 loop)
        let [[minX, minY, minZ], [maxX, maxY, maxZ]] = obj.bb
        let key, bx, by, bz, d = this.cellSize, id = obj.id
        for (bz = minZ; bz <= maxZ; bz += d) {
          for (by = minY; by <= maxY; by += d) {
            for (bx = minX; bx <= maxX; bx += d) {
              key = this.key([bx, by, bz])
              if (this.cells[key]) this.cells[key].push(obj)
              else this.cells[key] = [obj]
              if (this.objects[id]) this.objects[id].push(key)
              else this.objects[id] = [key]
            }
          }
        }
      }
    }
  }

  /**
   * Remove an object from the data structure
   * @param {SpatialHashEntry} obj
   */
  remove(obj) {
    if (this.isPointHash) {
      let key = this.objects[obj.id]
      let contents = this.cells[key].filter(o => o.id !== obj.id)
      if (contents.length > 0) this.cells[key] = contents
      else delete this.cells[key]
      delete this.objects[obj.id]
    } else {
      this.objects[obj.id].forEach((key) => {
        let contents = this.cells[key].filter(o => o.id !== obj.id)
        if (contents.length > 0) this.cells[key] = contents
        else delete this.cells[key]
      }, this)
      delete this.objects[obj.id]
    }
  }

  /**
   * Always to be called, when the coordinates of an object has changed!
   * @param {SpatialHashEntry} obj
   */
  update(obj) {
    this.remove(obj)
    this.insert(obj)
  }

  /**
   * Retrieve all objects of all cells that intersect with a given rectangle
   * @param {Box} box
   * @param {Set} [candidates] (this set gets updated)
   * @param {Set} [visited] (IF provided, holds keys of already visited cells, excludes them from search)
   * @returns {Set}
   */
  getCollisionCandidates(box, candidates = new Set(), visited = null) {
    const [[minX, minY, minZ], [maxX, maxY, maxZ]] = box, d = this.cellSize
    const check = (visited !== null)
    let bx, by, bz, key, contents
    if (this.K === 2) {
      for (by = minY; by <= maxY; by += d) {
        for (bx = minX; bx <= maxX; bx += d) {
          key = this.key([bx, by])
          if (check) {
            if (visited.has(key)) continue
            else visited.add(key)
          }
          contents = this.cells[key]
          if (contents !== undefined) contents.forEach(c => candidates.add(c))
        }
      }
    } else { // assert (this.K === 3)
      for (bz = minZ; bz <= maxZ; bz += d) {
        for (by = minY; by <= maxY; by += d) {
          for (bx = minX; bx <= maxX; bx += d) {
            key = this.key([bx, by, bz])
            if (check) {
              if (visited.has(key)) continue
              else visited.add(key)
            }
            contents = this.cells[key]
            if (contents !== undefined) contents.forEach(c => candidates.add(c))
          }
        }
      }
    }
    return candidates
  }

  /**
   * Find Objects, that fit completely within a rectangle
   * @param {Box} box
   * @returns {SpatialHashEntry[]}
   */
  findEnclosedObjects(box) {
    let candidates = Array.from(this.getCollisionCandidates(box))
    return candidates.filter(candidate => boxIsWithinBox(candidate.bb, box), this)
  }

  /**
   * Find Objects a rectangle intersects with
   * @param {Box} box
   * @returns {SpatialHashEntry[]}
   */
  findIntersectingObjects(box) {
    let candidates = Array.from(this.getCollisionCandidates(box))
    return candidates.filter(candidate => boxesIntersect(candidate.bb, box), this)
  }

  /**
   * Returns AT LEAST k nearest neighbours (if enough candidates available), sorted by the distance from a given point
   *   (the resulting array may contain slightly more than k entries!)
   * As the region managed by the Spatial Hash can be unlimited in size, a max_radius parameter should be set
   * In many situations, using findNearestNeighbour() is enough and should be preferred for performance reasons!
   * @param {Point} p
   * @param {int} [k]
   * @param {int} [max_radius]
   * @returns {SpatialHashEntry[]}
   */
  findNearestNeighbours(p, k = 1, max_radius = this.cellSize) {
    const [x, y, z = 0] = p, d = this.cellSize
    let candidates = new Set(), visited = new Set(), radius, area
    for (radius = d; candidates.size < k; radius += d) {
      // for getting the points/objects near a mouse pointer, use findNearestNeighbour() instead!
      // ─┼───┼─
      //  │. ¹│²  Something outside the cell could be nearer! (that's why we start with radius=cellSize)
      // ─┼───┼─
      // step by step, we need to broaden the search radius (we search within a box where x and y are the center)
      // we want to exclude the cells, we searched already in previous steps
      area = [[x - radius, y - radius, z - radius], [x + radius, y + radius, z + radius]]
      this.getCollisionCandidates(area, candidates, visited) // updates the candidates and visited sets
      if (radius > max_radius) break // check that here, so we get at least one iteration
    }
    let arr = Array.from(candidates) // turn into array so it's values are accessible via array index
    let pairs = arr.map((c, i) => [i, this.distance(p, c.bb)], this).sort((a, b) => a[1] - b[1])
    return pairs.map(pair => arr[pair[0]])
  }

  /**
   * Find the nearest object within the same radius as cellSize
   * Ideal for getting the nearest object near a mouse pointer
   * Returns null if nothing was found
   * @param {Point} p
   * @param {int} [radius]
   * @returns {SpatialHashEntry|null}
   */
  findNearestNeighbour(p, radius = this.cellSize) {
    const [x, y, z = 0] = p, area = [[x - radius, y - radius, z - radius], [x + radius, y + radius, z + radius]]
    let candidates = Array.from(this.getCollisionCandidates(area))
    let len = candidates.length
    if (len === 0) return null
    if (len === 1) return candidates[0]
    let distance, bestDistanceYet = Infinity, best = null
    for (let i = 0; i < len; i++) {
      distance = this.distance(p, candidates[i].bb)
      if (distance === 0) return candidates[i]
      if (distance < bestDistanceYet) {
        bestDistanceYet = distance
        best = candidates[i]
      }
    }
    return best
  }
}

export class BoxHash2D extends KDHash {
  constructor(cell_size = 6) {
    super(2, cell_size, false)
  }
}

export class BoxHash3D extends KDHash {
  constructor(cell_size = 6) {
    super(3, cell_size, false)
  }
}

export class PointHash2D extends KDHash {
  constructor(cell_size = 6) {
    super(2, cell_size, true)
  }
}

export class PointHash3D extends KDHash {
  constructor(cell_size = 6) {
    super(3, cell_size, true)
  }
}
