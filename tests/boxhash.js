import test from "ava";
import {BoxHash3D} from "../dist/kdhash";

function makeEntry({id, ...rest}) {
  return {
    id: id,
    bb: makeBox(rest)
  }
}

function makeBox({x, y, z, width, height, depth}) {
  return [
    [x, y, z],
    [x + width, y + height, z + depth]
  ]
}


test('BoxHash.insert works correctly', t => {
  const rh = new BoxHash3D(1) // cell-size=1
  rh.insert(makeEntry({id: 1, x: 1, y: 1, z: 1, width: 1, height: 1, depth: 1}))
  rh.insert(makeEntry({id: 2, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}))
  t.is(rh.cells[rh.objects[1][0]][0].width, 1)
  t.is(rh.cells[rh.objects[2][0]][0].width, 1)
})

test('BoxHash3D.remove works correctly', t => {
  const rh = new BoxHash3D()
  rh.insert(makeEntry({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100}))
  rh.remove(makeEntry({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100}))
  t.deepEqual(rh.objects, {})
  t.deepEqual(rh.cells, {})
})

test('BoxHash3D.update works correctly', t => {
  const rh = new BoxHash3D()
  rh.insert(makeEntry({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100}))
  rh.update(makeEntry({id: 1, x: 1, y: 1, z: 1, width: 200, height: 200, depth: 100}))
  t.is(rh.cells[rh.objects[1][0]][0].width, 200)
})

test('BoxHash3D.getCollisionCandidates works correctly', t => {
  const rh = new BoxHash3D()
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.getCollisionCandidates(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})),
    [first, second])
  t.deepEqual(rh.getCollisionCandidates(makeBox({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 10})),
    [first, second])
})


test('BoxHash3D.findEnclosedObjects works correctly', t => {
  const rh = new BoxHash3D()
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.findEnclosedObjects(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})),
    [second])
  t.deepEqual(rh.findEnclosedObjects(makeBox({x: -1, y: -1, z: -1, width: 150, height: 150, depth: 150})),
    [first, second])
})


test('BoxHash3D.findIntersectingObjects works correctly', t => {
  const rh = new BoxHash3D()
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.findIntersectingObjects(makeBox({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10})),
    [first, second])
  t.deepEqual(rh.findIntersectingObjects(makeBox({x: -1, y: -1, z: -1, width: 150, height: 150, depth: 150})),
    [first, second])
})

test('BoxHash3D.findNearestNeighbour works correctly', t => {
  const rh = new BoxHash3D(6)
  const first = makeEntry({id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  t.is(rh.findNearestNeighbour([9, 9, 9]), first)
})


test('BoxHash3D.findNearestNeighbours works correctly', t => {
  const rh = new BoxHash3D(20) // can get much slower for lower cell-sizes
  const first = makeEntry({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100})
  const second = makeEntry({id: 2, x: 11, y: 11, z: 11, width: 1, height: 1, depth: 1})
  const third = makeEntry({id: 3, x: 100, y: 100, z: 100, width: 1, height: 1, depth: 1})
  rh.insert(first)
  rh.insert(second)
  rh.insert(third)
  t.deepEqual(rh.findNearestNeighbours([1, 1, 1], 10, 600), [first, second, third])
  t.deepEqual(rh.findNearestNeighbours([110, 110, 110], 10, 600), [first, third, second])
})
