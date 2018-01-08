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
 * Check whether two boxes intersect
 * @param {Box} a
 * @param {Box} b
 * @param {int} [K]
 * @returns {boolean}
 */
export function boxesIntersect(a, b, K = a[0].length) {
  for (let axis = 0; axis < K; axis++) if (a[0][axis] > b[1][axis] || b[0][axis] > a[1][axis]) return false
  return true
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
  for (let i = 0; i < K; i++) if (inside[0][i] < outside[0][i] || inside[1][i] > outside[1][i]) return false
  return true
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
  for (let i = 0; i < K; i++) if (p[i] < box[0][i] || p[i] > box[1][i]) return false
  return true
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
  let d = 0
  for (let i = 0; i < K; i++) d += ((a[i] - b[i]) ** 2)
  return d
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
  let d = 0
  for (let i = 0; i < K; i++) d += (max(box[0][i] - p[i], 0, p[i] - box[1][i]) ** 2)
  return d
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
  let p = new Array(K)
  for (let i = 0; i < K; i++) p[i] = (box[0][i] + (box[0][i] - box[1][i])) / 2
  return p
}
