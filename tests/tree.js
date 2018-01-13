import test from "ava"
import {surfaceNets} from "../dist/experimental/kdtree/surface_nets";
import {KDTree} from "../dist/experimental/kdtree/kdtree";

const bounds = [[-10, -10, -10], [10, 10, 10]] // bounds of the sphere
const sphere = surfaceNets([32, 32, 32], (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)

test('make_kdtree', t => {
  let tree = new KDTree(sphere.positions, bounds), K = 3
  console.log(tree.nodes)
  for (let n of tree.nodes) {
    let axis = n.level % K;
    if (n.left === -1 && n.right === -1) {
      continue;
    }
    if (n.left !== -1) {
      let l = tree.nodes[n.left];
      t.true(l.point[axis] <= n.point[axis]);
    }
    if (n.right !== -1) {
      let r = tree.nodes[n.right];
      t.true(n.point[axis] <= r.point[axis]);
    }
  }
})
