/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Rect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} SpatialHashEntry
 * @property {*} id
 * @property {number} x
 * @property {number} y
 * @property {number} [width]
 * @property {number} [height]
 */


/**
 * Check whether two rectangles intersect
 * @param {Rect} r1
 * @param {Rect} r2
 * @returns {boolean}
 */
export function rectanglesIntersect(r1, r2) {
  return (r1.x < r2.x + r2.width && r2.x < r1.x + r1.width && r1.y < r2.y + r2.height)
}

/**
 * Check whether a first rectangle is within the bounds of a second rectangle
 * It is assumed, that both rectangles are axis-aligned!
 * @param {Rect} within
 * @param {Rect} outside
 * @returns {boolean}
 */
export function rectangleIsWithinRectangle(within, outside) {
  return (within.x >= outside.x
  && within.y >= outside.y
  && within.x + within.width <= outside.x + outside.width
  && within.y + within.height <= outside.y + outside.height)
}


/**
 * Check whether a point is within the bounds of a rectangle
 * It is assumed, that the rectangle is axis-aligned!
 * @param {Point} p
 * @param {Rect} rect
 * @returns {boolean}
 */
export function pointIsWithinRectangle(p, rect) {
  return (p.x >= rect.x
  && p.y >= rect.y
  && p.x <= rect.x + rect.width
  && p.y <= rect.y + rect.height)
}

/**
 * Calculate the squared distance between two points
 * (to be used when actual distance doesn't matter, because then it's faster)
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number}
 */
export function squaredDistanceBetweenPoints(p1, p2) {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
}

/**
 * Calculate the distance between two points
 * Consider using the squared variant of this function!
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number}
 */
export function distanceBetweenPoints(p1, p2) {
  return Math.sqrt(squaredDistanceBetweenPoints(p1, p2))
}


/**
 * Calculate the squared distance between a point and a rectangle
 * It is assumed, that the rectangle is axis-aligned!
 * @param {Point} p
 * @param {Rect} rect
 * @returns {number}
 */
export function squaredDistanceBetweenPointAndRectangle(p, rect) {
  // source and explanation: http://stackoverflow.com/a/18157551
  let dx = Math.max(rect.x - p.x, 0, p.x - (rect.x + rect.width))
  let dy = Math.max(rect.y - p.y, 0, p.y - (rect.y + rect.height))
  return Math.pow(dx, 2) + Math.pow(dy, 2)
}

/**
 * Calculate the squared distance between a point and a rectangle
 * Only to be used, when the exact values are needed (the squared variant is faster and most often enough!)
 * @param {Point} p
 * @param {Rect} rect
 * @returns {number}
 */
export function distanceBetweenPointAndRectangle(p, rect) {
  return Math.sqrt(squaredDistanceBetweenPointAndRectangle(p, rect))
}

/**
 * Calculate the distance between two rectangles
 * @param {Rect} rect1
 * @param {Rect} rect2
 * @returns {number}
 */
export function distanceBetweenRectangles(rect1, rect2) {
  if (rectanglesIntersect(rect1, rect2)) return 0
  let center1 = {
    x: rect1.x + rect1.width / 2,
    y: rect1.y + rect1.height / 2
  }
  let center2 = {
    x: rect2.x + rect2.width / 2,
    y: rect2.y + rect2.height / 2
  }
  let distance_between_centers = distanceBetweenPoints(center1, center2),
    distance_from_center1_to_rect2 = distanceBetweenPointAndRectangle(center1, rect2),
    distance_from_center2_to_rect1 = distanceBetweenPointAndRectangle(center2, rect1)
  let unneeded = distance_between_centers - distance_from_center1_to_rect2 - distance_from_center2_to_rect1
  return distance_between_centers - unneeded
}

/**
 * Returns the Corners of an axis-aligned rectangle
 * @example
 *  let [nw, ne, se, sw] = getCornersOfRect(rect)
 * @param {Rect} rect
 * @returns {Point[]}
 */
export function getCornersOfRect(rect) {
  return [
    {x: rect.x, y: rect.y}, // nw
    {x: rect.x + rect.width, y: rect.y}, // ne
    {x: rect.x + rect.width, y: rect.y + rect.height}, // se
    {x: rect.x, y: rect.y + rect.height} // sw
  ]
}

/**
 * Returns the edges of an axis-aligned rectangle
 * @example
 *  let [top, right, bottom, left] = getCornersOfRect(rect)
 */
export function getEdgesOfRect(rect) {
  let [nw, ne, se, sw] = getCornersOfRect(rect)
  return [
    [nw, ne], // top
    [ne, se], // right
    [se, sw], // bottom
    [sw, nw]  // left
  ]
}

/**
 * Calculate which candidate has the shortest distance to a given point
 * @param {Point} p
 * @param {SpatialHashEntry[]} candidates
 * @returns {*}
 */
export function findNearestNeighbour(p, candidates) {
  let best_square_dist = Infinity, best = null, square_distance = null
  for (let i = 0, len = candidates.length; i < len; i++) {
    let obj = candidates[i]
    if (obj.width === undefined || (obj.width <= 1 && obj.height <= 1)) {
      square_distance = squaredDistanceBetweenPoints(p, obj)
    } else {
      square_distance = squaredDistanceBetweenPointAndRectangle(p, obj)
    }
    if (square_distance < best_square_dist) {
      best_square_dist = square_distance
      best = obj
    }
  }
  return best
}
