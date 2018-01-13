// has nothing to do with the spatial-hash implementations!
import {nth_element} from "./cpp_stl"
import {squaredDistanceBetweenPoints} from "../../geometry"

const floor = Math.floor, min = Math.min, max = Math.max

/**
 * @typedef {Object} KDNode
 * @property {Point} point
 * @property {int} level
 * @property {int} l
 * @property {int} r
 */

/**
 * @param {KDNode} node
 * @returns {boolean}
 */
function isLeaf(node) {
  return node.l === -1 && node.r === -1
}


export class KDTree {
  /**
   * @param {Point[]} points
   * @param {Box} bb
   * @param {int} K
   */
  constructor(points, bb, K = 3) {
    this.K = K
    let len = points.length
    /** @type{KDNode[]} */
    this.nodes = new Array(len)
    /** @type{int[]} */
    this.indices = new Array(len)
    for (let i = 0; i < len; i++) {
      this.indices[i] = i
      this.nodes[i] = {point: points[i], l: -1, r: -1, level: -1}
    }
    this.bb = bb // bounding box of all the points within the tree
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
    let axis = floor(depth % this.K)
    let mid = first + floor(len / 2)
    nth_element(this.indices, first, mid, last, (a, b) => (nodes[a].point[axis] < nodes[b].point[axis]))
    let i = this.indices[mid]
    nodes[i].level = depth
    nodes[i].l = this.arrange(first, mid, depth + 1)
    nodes[i].r = this.arrange(mid + 1, last, depth + 1)
    return i
  }

  /**
   * Nearest Neighbor Search
   * Find the nearest Point from the Query-Point
   * @param {Point} q
   * @returns {Point}
   */
  findNearestNeighbour(q) {
    let stack = [] // stores [node-index, closest-point] pairs
    let c = new Array(this.K) // see squaredDistanceBetweenPointAndBox(), gets adjusted below
    for (let i = 0; i < this.K; i++) c[i] = min(this.bb[1][i], max(q[i], this.bb[0][i]))
    stack.push([this.root, c])
    let nodes = this.nodes, bestDistanceYet = Infinity, bestNodeYet = nodes[this.root]
    while (stack.length > 0) {
      let [nodeIndex, closestPoint] = stack.pop()
      // dismiss nodes (and their descendants) from the stack that are more or less obviously too far away
      // -> that is, if it's bounding-box' distance is greater than the bestDistanceYet
      if (squaredDistanceBetweenPoints(q, closestPoint, this.K) > bestDistanceYet) {
        continue
      }
      // depth-first traversal to leaf node
      let node = nodes[nodeIndex]
      while (!isLeaf(node)) {
        let d = squaredDistanceBetweenPoints(q, node.point, this.K)
        if (d < bestDistanceYet) {
          bestDistanceYet = d
          bestNodeYet = node
        }
        let axis = floor(node.level % this.K)
        let cutClosestPoint = [...closestPoint]
        cutClosestPoint[axis] = node.point[axis]
        if (q[axis] < node.point[axis]) { // in this case the query-point is on the left side of the cut
          if (node.r !== -1) stack.push([node.r, cutClosestPoint])
          if (node.l === -1) break
          node = nodes[node.l]
        } else { // analogous to above: descend to the node with higher v, enqueue the other
          if (node.l !== -1) stack.push([node.l, cutClosestPoint])
          if (node.r === -1) break
          node = nodes[node.r]
        }
      }
    }
    return bestNodeYet.point
  }
}
