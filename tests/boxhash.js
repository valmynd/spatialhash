import test from "ava";
import {BoxHash3D} from "../dist/kdhash";

function makeEntry({id, ...rest}) {
  return {id: id, bb: makeBox(rest)}
}

function makeBox({x, y, z, width, height, depth}) {
  return [[x, y, z], [x + width, y + height, z + depth]]
}

test('BoxHash3D.getCollisionCandidates()', t => {
  const rh = new BoxHash3D()
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(new Set([first, second]),
    rh.getCollisionCandidates(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})))
  t.deepEqual(new Set([first, second]),
    rh.getCollisionCandidates(makeBox({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 10})))
})

test('BoxHash3D.findEnclosedObjects()', t => {
  const rh = new BoxHash3D()
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.deepEqual([second],
    rh.findEnclosedObjects(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})))
  t.deepEqual([first, second],
    rh.findEnclosedObjects(makeBox({x: -1, y: -1, z: -1, width: 150, height: 150, depth: 150})))
})

test('BoxHash3D.findIntersectingObjects()', t => {
  const rh = new BoxHash3D()
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.deepEqual([first, second], rh.findIntersectingObjects(
    makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})))
  t.deepEqual([first, second], rh.findIntersectingObjects(
    makeBox({x: -1, y: -1, z: -1, width: 150, height: 150, depth: 150})))
})

test('BoxHash3D.findNearestNeighbour()', t => {
  const rh = new BoxHash3D(6)
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.is(rh.findNearestNeighbour([9, 9, 9]), first)
})

test('BoxHash3D.findNearestNeighbours()', t => {
  const rh = new BoxHash3D(20) // cell-sizes may have a huge performance-impact, here
  const first = makeEntry({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 2, x: 11, y: 11, z: 11, width: 1, height: 1, depth: 1})
  const third = makeEntry({id: 3, x: 100, y: 100, z: 100, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  rh.insert(third)
  t.deepEqual(rh.findNearestNeighbours([1, 1, 1], 10, 200), [first, second, third])
  t.deepEqual(rh.findNearestNeighbours([110, 110, 110], 10, 200), [first, third, second])
})
