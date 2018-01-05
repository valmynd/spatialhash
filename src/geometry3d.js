const sqrt = Math.sqrt, max = Math.max
export const X = 0, Y = 1, Z = 2, MIN_X = 0, MIN_Y = 1, MIN_Z = 2, MAX_X = 3, MAX_Y = 4, MAX_Z = 5

/**
 * @typedef {Array} Point
 */

/**
 * @typedef {Array} Box
 */

/**
 * @typedef {Box|Point} SpatialHashEntry
 * @property {*} id
 */

/**
 * Check whether two boxes intersect
 * @param {Box} a
 * @param {Box} b
 * @returns {boolean}
 */
export function boxesIntersect(a, b) {
  return (
    a[MIN_X] < b[MAX_X] &&
    b[MIN_X] < a[MAX_X] &&
    a[MIN_Y] < b[MAX_Y] &&
    b[MIN_Y] < a[MAX_Y] &&
    a[MIN_Z] < b[MAX_Z] &&
    b[MIN_Z] < a[MAX_Z]
  )
}

/**
 * Check whether a first box is within the bounds of a second box
 * It is assumed, that both boxes are axis-aligned!
 * @param {Box} inside
 * @param {Box} outside
 * @returns {boolean}
 */
export function boxIsWithinBox(inside, outside) {
  return (
    inside[MIN_X] >= outside[MIN_X] &&
    inside[MAX_X] <= outside[MAX_X] &&
    inside[MIN_Y] >= outside[MIN_Y] &&
    inside[MAX_Y] <= outside[MAX_Y] &&
    inside[MIN_Z] >= outside[MIN_Z] &&
    inside[MAX_Z] <= outside[MAX_Z]
  )
}

/**
 * Check whether a point is within the bounds of a box
 * It is assumed, that the box is axis-aligned!
 * @param {Point} p
 * @param {Box} box
 * @returns {boolean}
 */
export function pointIsWithinBox(p, box) {
  return (
    p[X] >= box[MIN_X] &&
    p[Y] >= box[MIN_Y] &&
    p[Z] >= box[MIN_Z] &&
    p[X] <= box[MAX_X] &&
    p[Y] <= box[MAX_Y] &&
    p[Z] <= box[MAX_Z]
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
    (a[Y] - b[Y]) ** 2 +
    (a[Z] - b[Z]) ** 2
  )
}

/**
 * Calculate the squared distance between a point and a box
 * It is assumed, that the box is axis-aligned!
 * @param {Point} p
 * @param {Box} box
 * @returns {number}
 */
export function squaredDistanceBetweenPointAndBox(p, box) {
  return (
    max(box[MIN_X] - p[X], 0, p[X] - box[MAX_X]) ** 2 +
    max(box[MIN_Y] - p[Y], 0, p[Y] - box[MAX_Y]) ** 2 +
    max(box[MIN_Z] - p[Z], 0, p[Z] - box[MAX_Z]) ** 2
  )
}

/**
 * Calculate the distance between two points
 * Consider using the squared variant of this function!
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 */
export function distanceBetweenPoints(a, b) {
  return sqrt(squaredDistanceBetweenPoints(a, b))
}

/**
 * Calculate the squared distance between a point and a box
 * Only to be used, when the exact values are needed (the squared variant is faster and most often enough!)
 * @param {Point} p
 * @param {Box} box
 * @returns {number}
 */
export function distanceBetweenPointAndBox(p, box) {
  return sqrt(squaredDistanceBetweenPointAndBox(p, box))
}

/**
 * Calculate the distance between two rectangles
 * @param {Box} a
 * @param {Box} b
 * @returns {number}
 */
export function distanceBetweenBoxes(a, b) {
  if (boxesIntersect(a, b)) return 0
  let centerA = getCenterOfBox(a), centerB = getCenterOfBox(b),
    distanceBetweenCenters = distanceBetweenPoints(centerA, centerB),
    distanceFromCenterAToB = distanceBetweenPointAndBox(centerA, b),
    distanceFromCenterBToA = distanceBetweenPointAndBox(centerB, a)
  let nonDistance = distanceBetweenCenters - distanceFromCenterAToB - distanceFromCenterBToA
  return distanceBetweenCenters - nonDistance
}

/**
 * Returns the Center of an axis-aligned box
 * @param {Box} box
 * @returns {Point}
 */
export function getCenterOfBox(box) {
  return [
    (box[MIN_X] + (box[MIN_X] - box[MAX_X])) / 2, // x
    (box[MIN_Y] + (box[MIN_Y] - box[MAX_Y])) / 2, // y
    (box[MIN_Z] + (box[MIN_Z] - box[MAX_Z])) / 2 // y
  ]
}
