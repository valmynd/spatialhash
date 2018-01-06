// has nothing to do with the spatial-hash implementations!
import {nth_element} from "./cpp_stl"

const floor = Math.floor
const K = 3

/**
 * @typedef {Object} KDNode
 * @property {Point} point
 * @property {int} level
 * @property {int} left
 * @property {int} right
 */

/**
 * @typedef {Object} NNTask
 * @property {int} id
 * @property {Box} bb
 */


export class KDTree {
  constructor(points, bb) {
    let len = points.length
    /** @type{KDNode[]} */
    this.nodes = new Array(len)
    /** @type{int[]} */
    this.indices = new Array(len)
    for (let i = 0; i < len; i++) {
      this.indices[i] = i
      this.nodes[i] = {point: points[i], left: -1, right: -1, level: -1}
    }
    this.root = this.arrange(0, points.length)
  }

  /**
   * Arranges the indices array to eventually end up sorted
   * Initialize Node-Values like left, right and level
   * @param {int} first
   * @param {int} last
   * @param {int} depth
   * @returns {int}
   */
  arrange(first, last, depth = 0) {
    let len = last - first
    if (len === 0) return -1
    let nodes = this.nodes
    let axis = floor(depth % K)
    let mid = first + floor(len / 2)
    nth_element(this.indices, first, mid, last, (a, b) => (nodes[a].point[axis] < nodes[b].point[axis]))
    let i = this.indices[mid]
    nodes[i].level = depth
    nodes[i].left = this.arrange(first, mid, depth + 1)
    nodes[i].right = this.arrange(mid + 1, last, depth + 1)
    return i
  }
}

