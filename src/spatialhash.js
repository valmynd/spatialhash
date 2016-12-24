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
    let contents = this.cells[key]
    this.cells[key] = contents.filter(o => o !== obj)
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

  getCollisionCandidates(x, y, width, height) {
    // strategy: get all cells within the rectangle
    let ret = [], bx, by, d = this.cell_size
    for (bx = x; bx <= x + width; bx += d)
      for (by = y; by <= y + height; by += d)
        ret = ret.concat(this.cells[this.key(bx, by)])
    return this.removeDoublets(ret) // no-op for PointHash
  }

  /**
   * Find Objects, that fit completely within a rectangle
   * @param {int} x
   * @param {int} y
   * @param {int} width
   * @param {int} height
   * @returns {Object}
   */
  findEnclosedObjects(x, y, width, height) {
    let candidates = this.getCollisionCandidates(x, y, width, height), outside = {x, y, width, height}
    return candidates.filter(candidate => this.encloses(outside, candidate), this)
  }

  /**
   * Find Objects a rectangle intersects with
   * @param {int} x
   * @param {int} y
   * @param {int} width
   * @param {int} height
   * @returns {Object}
   */
  findIntersectingObjects(x, y, width, height) {
    let candidates = this.getCollisionCandidates(x, y, width, height), outside = {x, y, width, height}
    return candidates.filter(candidate => this.intersects(outside, candidate), this)
  }

  /**
   * Returns AT LEAST k nearest neighbours (if enough candidates available), sorted by the distance from a given point
   *   (the resulting array may contain more than k entries!)
   * As the region managed by the Spatial Hash can be unlimited in size, a max_radius parameter should be set
   * In many situations, using findNearestNeighbourNearby() is enough and should be preferred for performance reasons!
   * @param {int} x
   * @param {int} y
   * @param {int} [k]
   * @param {int} [max_radius]
   * @returns {Array}
   */
  findNearestNeighbours(x, y, k = 1, max_radius = this.cell_size) {
    // for getting the points/objects near a mouse pointer, use findNearestNeighbourNearby() instead!
    // ─┼───┼─
    //  │. ¹│²  Something outside the cell could be nearer! (that's why we start with radius=cell_size)
    // ─┼───┼─
    let candidates = [], bx, by, radius, d = this.cell_size, previous_radius = 0
    for (radius = d; candidates.length < k; radius += d) {
      // step by step, we need to broaden the search radius (we search within a rectangle where x and y are the center)
      // we want to exclude the cells, we searched already in previous steps
      for (bx = x - radius; bx <= x + radius; bx += d) {
        if (bx > x - radius + previous_radius)
          bx += previous_radius
        for (by = y - radius; by <= y + radius; by += d) {
          if (by > y - radius + previous_radius)
            by += previous_radius
          candidates = candidates.concat(this.cells[this.key(bx, by)])
        }
      }
      if (radius > max_radius) break // check that here, so we get at least one iteration
      previous_radius = radius
    }
    let best = {} // mapping of square-distances to objects
    candidates = this.removeDoublets(candidates)
    for (let i = 0, len = candidates.length; i < len; i++) {
      best[this.distance({x, y}, candidates[i])] = candidates[i]
    }
    return Object.keys(best).sort().map(distance => best[distance])
  }

  /**
   * Find the nearest object within the same radius as cell_size
   * Ideal for getting the nearest object near a mouse pointer
   * @param {int} x
   * @param {int} y
   * @returns {Object}
   */
  findNearestNeighbourNearby(x, y) {
    let radius = this.cell_size
    let candidates = this.getCollisionCandidates(x - radius, y - radius, radius * 2, radius * 2)
    return findNearestNeighbour({x, y}, candidates)
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
