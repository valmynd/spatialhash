import test from "ava";
import {PointHash2D, PointHash3D} from "../dist/kdhash";

test.skip('PointHash.insert works correctly', t => {
  for (let ph of [new PointHash2D(1), new PointHash3D(1)]) { // cell-size=1
    ph.insert({
      id: 1,
      bb: [1, 1, 1]
    })
    ph.insert({
      id: 2,
      bb: [2, 1, 1]
    })
    t.is(ph.cells[ph.objects[1]][0].x, 1)
    t.is(ph.cells[ph.objects[2]][0].x, 2)
  }
})

test.skip('PointHash.remove works correctly', t => {
  const ph = new PointHash2D()
  ph.insert({id: 1, bb: [1, 1]})
  ph.remove({id: 1, bb: [1, 1]})
  t.deepEqual(ph.objects, {})
  t.deepEqual(ph.cells, {})
})

test.skip('PointHash.update works correctly', t => {
  for (let ph of [new PointHash2D(), new PointHash3D()]) {
    ph.insert({
      id: 1,
      bb: [1, 1]
    })
    ph.update({
      id: 1,
      bb: [2, 2]
    })
    t.is(ph.cells[ph.objects[1]][0][0], 2)
  }
})

test.skip('PointHash.getCollisionCandidates works correctly', t => {
  const first = {
    id: 1,
    bb: [10, 10, 10]
  }, second = {
    id: 2,
    bb: [11, 11, 11]
  }, third = {
    id: 3,
    bb: [100, 100, 100]
  }
  for (let ph of [new PointHash2D(), new PointHash3D()]) {
    ph.insert(first)
    ph.insert(second)
    ph.insert(third)
    t.deepEqual(ph.getCollisionCandidates({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10}), [first, second])
    t.deepEqual(ph.getCollisionCandidates({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 10}), [first, second])
  }
})

test.skip('PointHash.findEnclosedObjects works correctly', t => {
  const first = {
    id: 1,
    bb: [10, 10, 10]
  }, second = {
    id: 2,
    bb: [11, 11, 11]
  }, third = {
    id: 3,
    bb: [100, 100, 100]
  }
  for (let ph of [new PointHash2D(), new PointHash3D()]) {
    ph.insert(first)
    ph.insert(second)
    ph.insert(third)
    t.deepEqual(ph.findEnclosedObjects({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10}), [first, second])
    t.deepEqual(ph.findEnclosedObjects({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}), [first, second]) // sure?
  }
})

test.skip('PointHash.findIntersectingObjects works correctly', t => {
  const first = {
    id: 1,
    bb: [10, 10, 10]
  }, second = {
    id: 2,
    bb: [11, 11, 11]
  }, third = {
    id: 3,
    bb: [100, 100, 100]
  }
  for (let ph of [new PointHash2D(), new PointHash3D()]) {
    ph.insert(first)
    ph.insert(second)
    ph.insert(third)
    t.deepEqual(ph.findIntersectingObjects({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10}), [first, second])
    t.deepEqual(ph.findIntersectingObjects({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}), [first, second]) // sure?
  }
})

test.skip('PointHash.findNearestNeighbour works correctly', t => {
  const first = {
    id: 1,
    bb: [10, 10, 10]
  }, second = {
    id: 2,
    bb: [11, 11, 11]
  }, third = {
    id: 3,
    bb: [100, 100, 100]
  }
  for (let ph of [new PointHash2D(6), new PointHash3D(6)]) {
    ph.insert(first)
    ph.insert(second)
    ph.insert(third)
    t.is(ph.findNearestNeighbour({x: 1, y: 1, z: 1}), first)
  }
})

test.skip('PointHash.findNearestNeighbours works correctly', t => {
  const first = {
    id: 1,
    bb: [10, 10, 10]
  }, second = {
    id: 2,
    bb: [11, 11, 11]
  }, third = {
    id: 3,
    bb: [100, 100, 100]
  }
  for (let ph of [new PointHash2D(6), new PointHash3D(6)]) {
    ph.insert(first)
    ph.insert(second)
    ph.insert(third)
    t.deepEqual(ph.findNearestNeighbours({x: 110, y: 110, z: 110}, 3, 100), [third, second, first])
  }
})

