// has nothing to do with the spatial-hash implementations!
import {nth_element} from "./cpp_stl"
import {distanceBetweenPoints, squaredDistanceBetweenPoints} from "../../geometry"

const floor = Math.floor

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
 * @property {Point} c
 */

/**
 * @param {KDNode} node
 * @returns {boolean}
 */
function isLeaf(node) {
  return node.left !== -1 && node.right !== -1
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
      this.nodes[i] = {point: points[i], left: -1, right: -1, level: -1}
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
    nodes[i].left = this.arrange(first, mid, depth + 1)
    nodes[i].right = this.arrange(mid + 1, last, depth + 1)
    return i
  }

  /**
   * Nearest Neighbor Search
   * Find the nearest Point from the Query-Point
   * @param {Point} q
   * @returns {Point}
   */
  nn(q) {
    /** @type{NNTask[]} */
    let stack = []
    let nodes = this.nodes
    let bestDistanceYet = Infinity
    let bestNodeYet = nodes[this.root]
    stack.push({id: this.root, c: calcC(q, this.bb, this.K)})
    while (stack.length > 0) {
      let task = stack.pop()
      let node = nodes[task.id]
      // dismiss nodes (and their descendants) from the stack that are more or less obviously too far away
      // -> that is, if itcalcC's bounding-box' distance is greater than the bestDistanceYet
      if (distanceBetweenPoints(q, task.c, this.K) > bestDistanceYet) {
        continue
      }
      // if not leaf: depth-first traversal to leaf node
      while (!isLeaf(node)) { // ?
        let axis = floor(node.level % this.K)
        let qV = q[axis] // value in query-point at the relevant axis for this depth
        let nV = node.point[axis] // cutting value of the current node // "SPLIT"
        let c = [...task.c] // ~copy
        c[axis] = nV;
        if (qV < nV) { // in this case the query-point is on the left side of the cut
          stack.push({id: node.right, c: c}) // FAR
          node = nodes[node.left] // descend to the node with lower v (that will always be the left one) "NEAR"
        } else { // analogous to above: descend to the node with higher v, enqueue the other
          stack.push({id: node.left, c: c}) // FAR
          node = nodes[node.right] // NEAR
        }
      }
      // node is now one of the leaf nodes -> check if it's distance is better than the best-yet
      let d = squaredDistanceBetweenPoints(q, node.point, this.K)
      if (d < bestDistanceYet) {
        bestDistanceYet = d
        bestNodeYet = node
      }
    }
    return bestNodeYet.point
  }
}


function inBetween(x, x0, x1) {
  if (x < x0) return x0
  else if (x > x1) return x1
  return x
}

function calcC(p, bb, K) {
  let c = new Array(K), min = bb[0], max = bb[1]
  for (let i = 0; i < K; i++) c[i] = inBetween(p[i], min[i], max[i])
  return c
}
