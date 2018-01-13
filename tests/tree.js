import test from "ava"
import {surfaceNets} from "../src/experimental/kdtree/surface_nets";
import {nth_element} from "../src/experimental/kdtree/cpp_stl";
import {KDTree} from "../src/experimental/kdtree/kdtree";
import {PointHash3D} from "../src/kdhash";
import {distanceBetweenPoints} from "../src/geometry";

function randomArray(rangeBegin = 0, rangeEnd = 9) {
  let arr = new Array(rangeEnd - rangeBegin)
  for (let i = rangeBegin, t = rangeEnd; i < t; i++) arr[i] = Math.round(Math.random() * t)
  return arr
}

test('nth_element', t => {
  let sample = randomArray()//[5, 6, 4, 3, 2, 6, 7, 9, 3]
  let m = Math.floor(sample.length / 2), l = sample.length
  nth_element(sample, 0, m, l)
  //console.log("nth_value() result:", sample, "(median=" + sample[m] + ")")
  for (let i = 0; i < m; i++) t.true(sample[i] <= sample[m])
  for (let i = m; i < l; i++) t.true(sample[i] >= sample[m])
})


const bounds = [[-10, -10, -10], [10, 10, 10]] // bounds of the sphere
const sphere = surfaceNets([32, 32, 32], (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)
const tree = new KDTree(sphere.positions, bounds), K = 3

test('make_kdtree', t => {
  let nodes = tree.nodes
  //console.log(nodes)
  for (let n of nodes) {
    let axis = n.level % K;
    if (n.l === -1 && n.r === -1) {
      continue;
    }
    if (n.l !== -1) {
      let l = nodes[n.l];
      //console.log("check l<=n at level", n.level, l.point, " <= ", n.point)
      t.true(l.point[axis] <= n.point[axis]);
    }
    if (n.r !== -1) {
      let r = nodes[n.r];
      //console.log("check n<=r at level", n.level, n.point, " <= ", r.point)
      t.true(n.point[axis] <= r.point[axis]);
    }
  }
})

/**
 * @param {Point} q
 * @param {Point[]} points
 * @param {int} K
 * @returns {Point}
 */
function findNearestNeighborBruteForce(q, points, K) {
  let sorted_pairs = points.map((p, i) => [i, distanceBetweenPoints(p, q, K)]).sort((a, b) => a[1] - b[1])
  return points[sorted_pairs[0][0]]
}

test('nearest neighbor search', t => {
  const hash = new PointHash3D()
  for (let i = 0, len = sphere.positions.length; i < len; i++) {
    hash.insert({id: i, bb: sphere.positions[i]})
  }
  //console.log(hash.cells['0,-1,-2'])
  let q = [4, 0, 4], radius = bounds[1][0] - bounds[0][0], K = 3
  let correctNearestPoint = findNearestNeighborBruteForce(q, sphere.positions, K)
  t.is(radius, 20)
  t.is(tree.findNearestNeighbour(q), correctNearestPoint)
  //t.is(hash.findNearestNeighbours(q, 1)[0].bb, correctNearestPoint)
  //t.is(hash.findNearestNeighbour(q, radius).bb, correctNearestPoint)
})
