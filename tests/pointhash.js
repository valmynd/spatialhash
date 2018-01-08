import test from "ava";
import {PointHash2D, PointHash3D} from "../dist/kdhash";

function makeBox({x, y, z, width, height, depth}) {
  return [[x, y, z], [x + width, y + height, z + depth]]
}

test('PointHash.remove()', t => {
  const ph = new PointHash2D()
  ph.insert({id: 1, bb: [1, 1]})
  ph.remove({id: 1, bb: [1, 1]})
  t.deepEqual(ph.cells, {})
})

test('PointHash.update()', t => {
  const ph = new PointHash2D()
  ph.insert({id: 1, bb: [1, 1]})
  ph.update({id: 1, bb: [2, 2]})
  t.deepEqual([{id: 1, bb: [2, 2]}], ph.cells[ph.key([2, 2])])
})

test('PointHash.getCollisionCandidates()', t => {
  const first = {id: 1, bb: [10, 10, 10]}, second = {id: 2, bb: [11, 11, 11]}, third = {id: 3, bb: [100, 100, 100]}
  const ph = new PointHash3D()
  ph.insert(first)
  ph.insert(second)
  ph.insert(third)
  t.deepEqual(
    new Set([first, second]),
    ph.getCollisionCandidates(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})))
  t.deepEqual(
    new Set([first, second]),
    ph.getCollisionCandidates(makeBox({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 10})))
})

test('PointHash.findEnclosedObjects()', t => {
  const first = {id: 1, bb: [10, 10, 10]}, second = {id: 2, bb: [11, 11, 11]}, third = {id: 3, bb: [100, 100, 100]}
  const ph = new PointHash3D()
  ph.insert(first)
  ph.insert(second)
  ph.insert(third)
  t.deepEqual([first, second], ph.findEnclosedObjects(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})))
  t.deepEqual([first, second], ph.findEnclosedObjects(makeBox({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})))
})

test('PointHash.findIntersectingObjects()', t => {
  const first = {id: 1, bb: [10, 10, 10]}, second = {id: 2, bb: [11, 11, 11]}, third = {id: 3, bb: [100, 100, 100]}
  const ph = new PointHash3D()
  ph.insert(first)
  ph.insert(second)
  ph.insert(third)
  t.deepEqual(
    [first, second],
    ph.findIntersectingObjects(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})))
  t.deepEqual(
    [first, second],
    ph.findIntersectingObjects(makeBox({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})))
})

test('PointHash.findNearestNeighbour()', t => {
  const first = {id: 1, bb: [10, 10, 10]}, second = {id: 2, bb: [11, 11, 11]}, third = {id: 3, bb: [100, 100, 100]}
  const ph = new PointHash3D(6)
  ph.insert(first)
  ph.insert(second)
  ph.insert(third)
  t.is(ph.findNearestNeighbour([1, 1, 1]), first)
})

test('PointHash.findNearestNeighbours()', t => {
  const first = {id: 1, bb: [10, 10, 10]}, second = {id: 2, bb: [11, 11, 11]}, third = {id: 3, bb: [100, 100, 100]}
  const ph = new PointHash3D(6)
  ph.insert(first)
  ph.insert(second)
  ph.insert(third)
  t.deepEqual(ph.findNearestNeighbours([110, 110, 110], 3, 100), [third, second, first])
})

