const max = Math.max, sqrt = Math.sqrt
export const X = 0, Y = 1, MIN_X = 0, MIN_Y = 1, MAX_X = 2, MAX_Y = 3

/**
 * @typedef {Array} Point
 */

/**
 * @typedef {Array} Rect
 */

/**
 * @typedef {Rect|Point} SpatialHashEntry
 * @property {*} id
 */

/**
 * Check whether two rectangles intersect
 * @param {Rect} a
 * @param {Rect} b
 * @returns {boolean}
 */
export function rectanglesIntersect(a, b) {
  return ( // to intersect, the corners of a need to be simultaneously left, right, above and below b
    a[MIN_X] < b[MAX_X] &&
    b[MIN_X] < a[MAX_X] &&
    a[MIN_Y] < b[MAX_Y] &&
    b[MIN_Y] < a[MAX_Y]
  )
}

/**
 * Check whether a first rectangle is within the bounds of a second rectangle
 * It is assumed, that both rectangles are axis-aligned!
 * @param {Rect} inside
 * @param {Rect} outside
 * @returns {boolean}
 */
export function rectangleIsWithinRectangle(inside, outside) {
  return (
    inside[MIN_X] >= outside[MIN_X] &&
    inside[MAX_X] <= outside[MAX_X] &&
    inside[MIN_Y] >= outside[MIN_Y] &&
    inside[MAX_Y] <= outside[MAX_Y]
  )
}

/**
 * Check whether a point is within the bounds of a rectangle
 * It is assumed, that the rectangle is axis-aligned!
 * @param {Point} p
 * @param {Rect} rect
 * @returns {boolean}
 */
export function pointIsWithinRectangle(p, rect) {
  return (
    p[X] >= rect[MIN_X] &&
    p[Y] >= rect[MIN_Y] &&
    p[X] <= rect[MAX_X] &&
    p[Y] <= rect[MAX_Y]
  )
}

/**
 * Calculate the squared distance between two points
 * (to be used when actual distance doesn't matter, because then it's faster)
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 */
export function squaredDistanceBetweenPoints(a, b) {
  return (
    (a[X] - b[X]) ** 2 +
    (a[Y] - b[Y]) ** 2
  )
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
  let dx = max(rect[MIN_X] - p[X], 0, p[X] - rect[MAX_X])
  let dy = max(rect[MIN_Y] - p[Y], 0, p[Y] - rect[MAX_Y])
  return dx ** 2 + dy ** 2
}

////////////////////////////////////////////////

/**
 * Calculate the distance between two points
 * Consider using the squared variant of this function!
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number}
 */
export function distanceBetweenPoints(p1, p2) {
  return sqrt(squaredDistanceBetweenPoints(p1, p2))
}

/**
 * Calculate the squared distance between a point and a rectangle
 * Only to be used, when the exact values are needed (the squared variant is faster and most often enough!)
 * @param {Point} p
 * @param {Rect} rect
 * @returns {number}
 */
export function distanceBetweenPointAndRectangle(p, rect) {
  return sqrt(squaredDistanceBetweenPointAndRectangle(p, rect))
}

/**
 * Calculate the distance between two rectangles
 * @param {Rect} a
 * @param {Rect} b
 * @returns {number}
 */
export function distanceBetweenRectangles(a, b) {
  if (rectanglesIntersect(a, b)) return 0
  let centerA = getCenterOfRect(a), centerB = getCenterOfRect(b),
    distanceBetweenCenters = distanceBetweenPoints(centerA, centerB),
    distanceFromCenterAToB = distanceBetweenPointAndRectangle(centerA, b),
    distanceFromCenterBToA = distanceBetweenPointAndRectangle(centerB, a)
  let nonDistance = distanceBetweenCenters - distanceFromCenterAToB - distanceFromCenterBToA
  return distanceBetweenCenters - nonDistance
}

/**
 * Returns the Center of an axis-aligned rectangle
 * @param {Rect} rect
 * @returns {Point}
 */
export function getCenterOfRect(rect) {
  return [
    (rect[MIN_X] + (rect[MIN_X] - rect[MAX_X])) / 2, // x
    (rect[MIN_Y] + (rect[MIN_Y] - rect[MAX_Y])) / 2 // y
  ]
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
    [rect[MIN_X], rect[MIN_Y]], // nw
    [rect[MAX_X], rect[MIN_Y]], // ne
    [rect[MAX_X], rect[MAX_Y]], // se
    [rect[MIN_X], rect[MAX_Y]] // sw
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

