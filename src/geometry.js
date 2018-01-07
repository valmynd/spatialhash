const sqrt = Math.sqrt, max = Math.max
export const X = 0, Y = 1, Z = 2, MIN = 0, MAX = 1

/**
 * 2D Points: X,Y coordinates
 * 3D Points: X,Y,Z coordinates
 * @typedef {number[]} Point
 */

/**
 * 2D Boxes: MIN for top left corner and MAX for bottom right corner
 * 3D Boxes: MIN for top left front corner and MAX for bottom right back corner
 * @typedef {Point[]} Box
 */

/**
 * @typedef {Object} SpatialHashEntry
 * @property {int} id
 * @property {Box} bb
 */

/**
 * Check whether two boxes intersect
 * @param {Box} a
 * @param {Box} b
 * @param {int} [K]
 * @returns {boolean}
 */
export function boxesIntersect(a, b, K = a[0].length) {
  if (K === 2) return (
    a[MIN][X] < b[MAX][X] &&
    b[MIN][X] < a[MAX][X] &&
    a[MIN][Y] < b[MAX][Y] &&
    b[MIN][Y] < a[MAX][Y]
  )
  return (
    a[MIN][X] < b[MAX][X] &&
    b[MIN][X] < a[MAX][X] &&
    a[MIN][Y] < b[MAX][Y] &&
    b[MIN][Y] < a[MAX][Y] &&
    a[MIN][Z] < b[MAX][Z] &&
    b[MIN][Z] < a[MAX][Z]
  )
}

/**
 * Check whether a first box is within the bounds of a second box
 * It is assumed, that both boxes are axis-aligned!
 * @param {Box} inside
 * @param {Box} outside
 * @param {int} [K]
 * @returns {boolean}
 */
export function boxIsWithinBox(inside, outside, K = inside[0].length) {
  if (inside.length === 2) return (
    inside[MIN][X] >= outside[MIN][X] &&
    inside[MAX][X] <= outside[MAX][X] &&
    inside[MIN][Y] >= outside[MIN][Y] &&
    inside[MAX][Y] <= outside[MAX][Y]
  )
  return (
    inside[MIN][X] >= outside[MIN][X] &&
    inside[MAX][X] <= outside[MAX][X] &&
    inside[MIN][Y] >= outside[MIN][Y] &&
    inside[MAX][Y] <= outside[MAX][Y] &&
    inside[MIN][Z] >= outside[MIN][Z] &&
    inside[MAX][Z] <= outside[MAX][Z]
  )
}

/**
 * Check whether a point is within the bounds of a box
 * It is assumed, that the box is axis-aligned!
 * @param {Point} p
 * @param {Box} box
 * @param {int} [K]
 * @returns {boolean}
 */
export function pointIsWithinBox(p, box, K = p.length) {
  if (K === 2) return (
    p[X] >= box[MIN][X] &&
    p[Y] >= box[MIN][Y] &&
    p[X] <= box[MAX][X] &&
    p[Y] <= box[MAX][Y]
  )
  return (
    p[X] >= box[MIN][X] &&
    p[Y] >= box[MIN][Y] &&
    p[Z] >= box[MIN][Z] &&
    p[X] <= box[MAX][X] &&
    p[Y] <= box[MAX][Y] &&
    p[Z] <= box[MAX][Z]
  )
}

/**
 * Calculate the squared distance between two points
 * (to be used when actual distance doesn't matter, because then it's faster)
 * @param {Point} a
 * @param {Point} b
 * @param {int} [K]
 * @returns {number}
 */
export function squaredDistanceBetweenPoints(a, b, K = a.length) {
  if (K === 2) return (
    (a[X] - b[X]) ** 2 +
    (a[Y] - b[Y]) ** 2
  )
  return (
    (a[X] - b[X]) ** 2 +
    (a[Y] - b[Y]) ** 2 +
    (a[Z] - b[Z]) ** 2
  )
}

/**
 * Calculate the squared distance between a point and a box
 * see http://stackoverflow.com/a/18157551
 * @param {Point} p
 * @param {Box} box
 * @param {int} [K]
 * @returns {number}
 */
export function squaredDistanceBetweenPointAndBox(p, box, K = p.length) {
  if (K === 2) return (
    max(box[MIN][X] - p[X], 0, p[X] - box[MAX][X]) ** 2 +
    max(box[MIN][Y] - p[Y], 0, p[Y] - box[MAX][Y]) ** 2
  )
  return (
    max(box[MIN][X] - p[X], 0, p[X] - box[MAX][X]) ** 2 +
    max(box[MIN][Y] - p[Y], 0, p[Y] - box[MAX][Y]) ** 2 +
    max(box[MIN][Z] - p[Z], 0, p[Z] - box[MAX][Z]) ** 2
  )
}

/**
 * Calculate the distance between two points
 * Consider using the squared variant of this function!
 * @param {Point} a
 * @param {Point} b
 * @param {int} [K]
 * @returns {number}
 */
export function distanceBetweenPoints(a, b, K = a.length) {
  return sqrt(squaredDistanceBetweenPoints(a, b, K))
}

/**
 * Calculate the squared distance between a point and a box
 * Only to be used, when the exact values are needed (the squared variant is faster and most often enough!)
 * @param {Point} p
 * @param {Box} box
 * @param {int} [K]
 * @returns {number}
 */
export function distanceBetweenPointAndBox(p, box, K = p.length) {
  return sqrt(squaredDistanceBetweenPointAndBox(p, box, K))
}

/**
 * Calculate the distance between two rectangles
 * @param {Box} a
 * @param {Box} b
 * @param {int} [K]
 * @returns {number}
 */
export function distanceBetweenBoxes(a, b, K = a[0].length) {
  if (boxesIntersect(a, b, K)) return 0
  let centerA = getCenterOfBox(a, K), centerB = getCenterOfBox(b, K),
    distanceBetweenCenters = distanceBetweenPoints(centerA, centerB, K),
    distanceFromCenterAToB = distanceBetweenPointAndBox(centerA, b, K),
    distanceFromCenterBToA = distanceBetweenPointAndBox(centerB, a, K)
  let nonDistance = distanceBetweenCenters - distanceFromCenterAToB - distanceFromCenterBToA
  return distanceBetweenCenters - nonDistance
}

/**
 * Returns the Center of an axis-aligned box
 * @param {Box} box
 * @param {int} [K]
 * @returns {Point}
 */
export function getCenterOfBox(box, K = box[0].length) {
  if (K === 2) return [
    (box[MIN][X] + (box[MIN][X] - box[MAX][X])) / 2, // x
    (box[MIN][Y] + (box[MIN][Y] - box[MAX][Y])) / 2, // y
  ]
  return [
    (box[MIN][X] + (box[MIN][X] - box[MAX][X])) / 2, // x
    (box[MIN][Y] + (box[MIN][Y] - box[MAX][Y])) / 2, // y
    (box[MIN][Z] + (box[MIN][Z] - box[MAX][Z])) / 2, // z
  ]
}
