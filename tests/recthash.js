import test from "ava";
import {RectHash} from "../dist/hash2d";


test.skip('RectHash.insert works correctly', t => {
  const rh = new RectHash(1) // cell-size=1
  rh.insert({
    id: 1, x: 1, y: 1,
    width: 1,
    height: 1
  })
  rh.insert({
    id: 2, x: 10, y: 10,
    width: 1,
    height: 1
  })
  t.is(rh.cells[rh.objects[1][0]][0].width, 1)
  t.is(rh.cells[rh.objects[2][0]][0].width, 1)
})

test.skip('RectHash.remove works correctly', t => {
  const rh = new RectHash()
  rh.insert({id: 1, x: 1, y: 1, width: 100, height: 100})
  rh.remove({id: 1, x: 1, y: 1, width: 100, height: 100})
  t.deepEqual(rh.objects, {})
  t.deepEqual(rh.cells, {})
})

test.skip('RectHash.update works correctly', t => {
  const rh = new RectHash()
  rh.insert({
    id: 1, x: 1, y: 1,
    width: 100,
    height: 100
  })
  rh.update({
    id: 1, x: 1, y: 1,
    width: 200,
    height: 200
  })
  t.is(rh.cells[rh.objects[1][0]][0].width, 200)
})

test.skip('RectHash.getCollisionCandidates works correctly', t => {
  const rh = new RectHash()
  const first = {
    id: 2, x: 0, y: 0,
    width: 100, height: 100
  }, second = {
    id: 1, x: 10, y: 10,
    width: 1, height: 1
  }
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.getCollisionCandidates({x: 5, y: 5, width: 10, height: 10}), [first, second])
  t.deepEqual(rh.getCollisionCandidates({x: 10, y: 10, width: 1, height: 1}), [first, second])
})


test.skip('RectHash.findEnclosedObjects works correctly', t => {
  const rh = new RectHash()
  const first = {
    id: 2, x: 0, y: 0,
    width: 100, height: 100
  }, second = {
    id: 1, x: 10, y: 10,
    width: 1, height: 1
  }
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.findEnclosedObjects({x: 5, y: 5, width: 10, height: 10}), [second])
  t.deepEqual(rh.findEnclosedObjects({x: -1, y: -1, width: 150, height: 150}), [first, second])
})


test.skip('RectHash.findIntersectingObjects works correctly', t => {
  const rh = new RectHash()
  const first = {
    id: 2, x: 0, y: 0,
    width: 100, height: 100
  }, second = {
    id: 1, x: 10, y: 10,
    width: 1, height: 1
  }
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.findIntersectingObjects({x: 5, y: 5, width: 10, height: 10}), [first, second])
  t.deepEqual(rh.findIntersectingObjects({x: -1, y: -1, width: 150, height: 150}), [first, second])
})

test.skip('RectHash.findNearestNeighbour works correctly', t => {
  const rh = new RectHash(6)
  const first = {
    id: 2, x: 0, y: 0,
    width: 100, height: 100
  }, second = {
    id: 1, x: 10, y: 10,
    width: 1, height: 1
  }
  rh.insert(first)
  rh.insert(second)
  t.is(rh.findNearestNeighbour({x: 9, y: 9}), first)
})


test.skip('RectHash.findNearestNeighbours works correctly', t => {
  const rh = new RectHash(20) // can get much slower for lower cell-sizes
  const first = {
    id: 1,
    x: 1,
    y: 1,
    width: 100,
    height: 100
  }, second = {
    id: 2,
    x: 11,
    y: 11,
    width: 1,
    height: 1
  }, third = {
    id: 3,
    x: 100,
    y: 100,
    width: 1,
    height: 1
  }
  rh.insert(first)
  rh.insert(second)
  rh.insert(third)
  t.deepEqual(rh.findNearestNeighbours({x: 1, y: 1}, 10, 600), [first, second, third])
  t.deepEqual(rh.findNearestNeighbours({x: 110, y: 110}, 10, 600), [first, third, second])
})
