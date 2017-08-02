const pow = Math.pow, sqrt = Math.sqrt, max = Math.max


/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} Box
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} width
 * @property {number} height
 * @property {number} depth
 */

/**
 * @typedef {Box|Point} SpatialHashEntry
 * @property {*} id
 */

/**
 * Check whether two boxes intersect
 * @param {Box} b1
 * @param {Box} b2
 * @returns {boolean}
 */
export function boxesIntersect(b1, b2) {
  return (b1.x < b2.x + b2.width
    && b2.x < b1.x + b1.width
    && b1.y < b2.y + b2.height
    && b2.y < b1.y + b1.height
    && b1.z < b2.z + b2.depth
    && b2.z < b1.z + b1.depth)
}

/**
 * Check whether a first box is within the bounds of a second box
 * It is assumed, that both boxes are axis-aligned!
 * @param {Box} within
 * @param {Box} outside
 * @returns {boolean}
 */
export function boxIsWithinBox(within, outside) {
  return (within.x >= outside.x
    && within.y >= outside.y
    && within.z >= outside.z
    && within.x + within.width <= outside.x + outside.width
    && within.y + within.height <= outside.y + outside.height
    && within.z + within.depth <= outside.z + outside.depth)
}

/**
 * Check whether a point is within the bounds of a box
 * It is assumed, that the box is axis-aligned!
 * @param {Point} p
 * @param {Box} box
 * @returns {boolean}
 */
export function pointIsWithinBox(p, box) {
  return (p.x >= box.x
    && p.y >= box.y
    && p.z >= box.z
    && p.x <= box.x + box.width
    && p.y <= box.y + box.height
    && p.z <= box.z + box.depth)
}

/**
 * Calculate the squared distance between two points
 * (to be used when actual distance doesn't matter, because then it's faster)
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number}
 */
export function squaredDistanceBetweenPoints(p1, p2) {
  return pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2) + pow(p1.z - p2.z, 2)
}

/**
 * Calculate the squared distance between a point and a box
 * It is assumed, that the box is axis-aligned!
 * @param {Point} p
 * @param {Box} box
 * @returns {number}
 */
export function squaredDistanceBetweenPointAndBox(p, box) {
  let dx = max(box.x - p.x, 0, p.x - (box.x + box.width))
  let dy = max(box.y - p.y, 0, p.y - (box.y + box.height))
  let dz = max(box.z - p.z, 0, p.z - (box.z + box.depth))
  return pow(dx, 2) + pow(dy, 2) + pow(dz, 2)
}
