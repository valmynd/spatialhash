import test from "ava"
import {surfaceNets} from "../dist/experimental/kdtree/surface_nets";
import {KDTree} from "../dist/experimental/kdtree/3dtree";

const bounds = [[-10, -10, -10], [10, 10, 10]] // bounds of the sphere
const sphere = surfaceNets([32, 32, 32], (x, y, z) => (Math.sqrt(x ** 2 + y ** 2 + z ** 2) - 7), bounds)

test('make_kdtree', t => {
  let tree = new KDTree(sphere.positions, bounds)
  console.log(tree)
  t.is(1, 1)
})
