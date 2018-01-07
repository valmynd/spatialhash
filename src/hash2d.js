import {
  boxesIntersect,
  boxIsWithinBox,
  pointIsWithinBox,
  squaredDistanceBetweenPoints,
  squaredDistanceBetweenPointAndBox
} from "./geometry";

/**
 * Spatial Hash for Point Objects
 * Implementation is based on this very good tutorial:
 *    http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
 */
export class PointHash {
  constructor(cell_size = 6) {
    this.objects = {} // maps object-ids to hash-keys (needed for removing objects)
    this.cells = {} // maps hash-keys to arrays of objects
    this.cell_size = cell_size // size of each cell in coordinate-space
    // Override the following methods, if objects are something else then points!
    this.removeDoublets = (array) => array
    this.distance = squaredDistanceBetweenPoints
    this.intersects = pointIsWithinBox
    this.encloses = pointIsWithinBox
  }

  clear() {
    this.cells = {}
    this.objects = {}
  }

  /**
   * Calculate Hash-Keys for given x- and y-Coordinates
   * Each Hash-Key represents a Cell in a Grid. Each Cell may contain multiple Objects.
   * Points will be in exactly one Cell, while Rectangles may span over multiple Cells.
   * @param {int} x
   * @param {int} y
   * @protected
   */
  key(x, y) {
    return Math.floor(x / this.cell_size) + "," + Math.floor(y / this.cell_size)
  }

  /**
   * Insert an object into the data structure
   * Inserted objects need to have an "id" property!
   * @param {SpatialHashEntry} obj
   */
  insert(obj) {
    let key = this.key(obj.x, obj.y)
    if (this.cells[key]) this.cells[key].push(obj)
    else this.cells[key] = [obj]
    this.objects[obj.id] = key
  }

  /**
   * Remove an object from the data structure
   * @param {SpatialHashEntry} obj
   */
  remove(obj) {
    let key = this.objects[obj.id]
    let contents = this.cells[key].filter(o => o.id !== obj.id)
    if (contents.length > 0)
      this.cells[key] = contents
    else delete this.cells[key]
    delete this.objects[obj.id]
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
   * @param {Box} rect
   * @returns {SpatialHashEntry[]}
   */
  getCollisionCandidates(rect) {
    // strategy: get all cells within the rectangle
    let {x, y, width, height} = rect
    let ret = [], bx, by, d = this.cell_size
    for (by = y; by <= y + height; by += d) {
      for (bx = x; bx <= x + width; bx += d) {
        let contents = this.cells[this.key(bx, by)]
        if (contents !== undefined) ret = ret.concat(contents)
      }
    }
    return this.removeDoublets(ret) // no-op for PointHash
  }

  /**
   * Find Objects, that fit completely within a rectangle
   * @param {Box} rect
   * @returns {SpatialHashEntry[]}
   */
  findEnclosedObjects(rect) {
    let candidates = this.getCollisionCandidates(rect)
    return candidates.filter(candidate => this.encloses(candidate, rect), this)
  }

  /**
   * Find Objects a rectangle intersects with
   * @param {Box} rect
   * @returns {SpatialHashEntry[]}
   */
  findIntersectingObjects(rect) {
    let candidates = this.getCollisionCandidates(rect)
    return candidates.filter(candidate => this.intersects(candidate, rect), this)
  }

  /**
   * Returns AT LEAST k nearest neighbours (if enough candidates available), sorted by the distance from a given point
   *   (the resulting array may contain more than k entries!)
   * As the region managed by the Spatial Hash can be unlimited in size, a max_radius parameter should be set
   * In many situations, using findNearestNeighbour() is enough and should be preferred for performance reasons!
   * @param {Point} p
   * @param {int} [k]
   * @param {int} [max_radius]
   * @returns {SpatialHashEntry[]}
   */
  findNearestNeighbours(p, k = 1, max_radius = this.cell_size) {
    // for getting the points/objects near a mouse pointer, use findNearestNeighbour() instead!
    // ─┼───┼─
    //  │. ¹│²  Something outside the cell could be nearer! (that's why we start with radius=cell_size)
    // ─┼───┼─
    const {x, y} = p, d = this.cell_size
    let candidates = [], key, contents, bx, by, radius, visited = new Set()
    for (radius = d; candidates.length < k; radius += d) {
      // step by step, we need to broaden the search radius (we search within a rectangle where x and y are the center)
      // we want to exclude the cells, we searched already in previous steps
      for (by = y - radius; by <= y + radius; by += d) {
        for (bx = x - radius; bx <= x + radius; bx += d) {
          key = this.key(bx, by)
          if (!visited.has(key)) {
            contents = this.cells[key]
            if (contents !== undefined)
              candidates = this.removeDoublets(candidates.concat(contents))
            visited.add(key)
          }
        }
      }
      if (radius > max_radius) break // check that here, so we get at least one iteration
    }
    let sorted_pairs = candidates.map((c, i) => [i, this.distance(p, c)], this).sort((a, b) => a[1] - b[1])
    return sorted_pairs.map(pair => candidates[pair[0]])
  }

  /**
   * Find the nearest object within the same radius as cell_size
   * Ideal for getting the nearest object near a mouse pointer
   * Returns null if nothing was found
   * @param {Point} p
   * @param {int} [radius]
   * @returns {SpatialHashEntry|null}
   */
  findNearestNeighbour(p, radius = this.cell_size) {
    let candidates = this.getCollisionCandidates({
      x: p.x - radius,
      y: p.y - radius,
      width: radius * 2,
      height: radius * 2
    }), len = candidates.length
    if (len === 0) return null
    if (len === 1) return candidates[0]
    let square_distance, best_square_dist = Infinity, best
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
 * Spatial Hash for Axis-Aligned Rectangular Objects (e.g. Bounding Boxes)
 * Implementation is based on this very good tutorial:
 *    http://www.gamedev.net/page/resources/_/technical/game-programming/spatial-hashing-r2697
 */
export class RectHash extends PointHash {
  constructor(cell_size = 6) {
    super(cell_size)
    this.removeDoublets = (array) => Array.from(new Set(array))
    this.distance = squaredDistanceBetweenPointAndBox
    this.intersects = boxesIntersect
    this.encloses = boxIsWithinBox
  }

  insert(obj) {
    let {id, x, y, width, height} = obj
    let bx, by, key, d = this.cell_size
    for (bx = x; bx <= x + width; bx += d) {
      for (by = y; by <= y + height; by += d) {
        key = this.key(bx, by)
        if (this.cells[key]) this.cells[key].push(obj)
        else this.cells[key] = [obj]
        if (this.objects[id]) this.objects[id].push(key)
        else this.objects[id] = [key]
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
