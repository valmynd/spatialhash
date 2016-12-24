import {
  findNearestNeighbour,
  rectanglesIntersect,
  rectangleIsWithinRectangle,
  pointIsWithinRectangle,
  squaredDistanceBetweenPoints,
  squaredDistanceBetweenPointAndRectangle
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
    this.intersects = pointIsWithinRectangle
    this.encloses = pointIsWithinRectangle
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
   * @param {Rect} rect
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
   * @param {Rect} rect
   * @returns {SpatialHashEntry[]}
   */
  findEnclosedObjects(rect) {
    let candidates = this.getCollisionCandidates(rect)
    return candidates.filter(candidate => this.encloses(candidate, rect), this)
  }

  /**
   * Find Objects a rectangle intersects with
   * @param {Rect} rect
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
    let candidates = [], key, contents, bx, by, radius = 0, visited = new Set()
    for (radius = d; candidates.length < k; radius += d) {
      // step by step, we need to broaden the search radius (we search within a rectangle where x and y are the center)
      // we want to exclude the cells, we searched already in previous steps
      for (by = y - radius; by <= y + radius; by += d) {
        for (bx = x - radius; bx <= x + radius; bx += d) {
          key = this.key(bx, by)
          if (!visited.has(key)) {
            contents = this.cells[key]
            if (contents !== undefined)
              candidates = candidates.concat(contents)
            visited.add(key)
          }
        }
      }
      if (radius > max_radius) break // check that here, so we get at least one iteration
    }
    let best = {} // mapping of square-distances to objects
    candidates = this.removeDoublets(candidates)
    for (let i = 0, len = candidates.length; i < len; i++) {
      best[this.distance(p, candidates[i])] = candidates[i]
    }
    let sorted_keys = Object.keys(best).sort((a, b) => parseInt(a) - parseInt(b)) // object-keys are always strings
    return sorted_keys.map(k => best[k])
  }

  /**
   * Find the nearest object within the same radius as cell_size
   * Ideal for getting the nearest object near a mouse pointer
   * Returns null if nothing was found
   * @param {Point} p
   * @param {int} radius
   * @returns {SpatialHashEntry|null}
   */
  findNearestNeighbour(p, radius = this.cell_size) {
    let candidates = this.getCollisionCandidates({
      x: p.x - radius,
      y: p.y - radius,
      width: radius * 2,
      height: radius * 2
    })
    return findNearestNeighbour(p, candidates)
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
    this.distance = squaredDistanceBetweenPointAndRectangle
    this.intersects = rectanglesIntersect
    this.encloses = rectangleIsWithinRectangle
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
    this.objects[obj.id].forEach(function (key) {
      let contents = this.cells[key]
      this.cells[key] = contents.filter(o => o !== obj)
      delete this.objects[obj.id]
    })
  }
}
