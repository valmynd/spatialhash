import test from "ava";
import {BoxHash} from "../dist/hash3d";


test('BoxHash.insert works correctly', t => {
  const rh = new BoxHash(1) // cell-size=1
  rh.insert({id: 1, x: 1, y: 1, z: 1, width: 1, height: 1, depth: 1})
  rh.insert({id: 2, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1})
  t.is(rh.cells[rh.objects[1][0]][0].width, 1)
  t.is(rh.cells[rh.objects[2][0]][0].width, 1)
})

test('BoxHash.remove works correctly', t => {
  const rh = new BoxHash()
  rh.insert({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100})
  rh.remove({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100})
  t.deepEqual(rh.objects, {})
  t.deepEqual(rh.cells, {})
})

test('BoxHash.update works correctly', t => {
  const rh = new BoxHash()
  rh.insert({id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100})
  rh.update({id: 1, x: 1, y: 1, z: 1, width: 200, height: 200, depth: 100})
  t.is(rh.cells[rh.objects[1][0]][0].width, 200)
})

test('BoxHash.getCollisionCandidates works correctly', t => {
  const rh = new BoxHash()
  const first = {id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100}
  const second = {id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.getCollisionCandidates({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10}), [first, second])
  t.deepEqual(rh.getCollisionCandidates({x: 10, y: 10, z: 10, width: 1, height: 1, depth: 10}), [first, second])
})


test('BoxHash.findEnclosedObjects works correctly', t => {
  const rh = new BoxHash()
  const first = {id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100}
  const second = {id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.findEnclosedObjects({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10}), [second])
  t.deepEqual(rh.findEnclosedObjects({x: -1, y: -1, z: -1, width: 150, height: 150, depth: 150}), [first, second])
})


test('BoxHash.findIntersectingObjects works correctly', t => {
  const rh = new BoxHash()
  const first = {id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100}
  const second = {id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}
  rh.insert(first)
  rh.insert(second)
  t.deepEqual(rh.findIntersectingObjects({x: 5, y: 5, z: 5, width: 10, height: 10, depth: 10}), [first, second])
  t.deepEqual(rh.findIntersectingObjects({x: -1, y: -1, z: -1, width: 150, height: 150, depth: 150}), [first, second])
})

test('BoxHash.findNearestNeighbour works correctly', t => {
  const rh = new BoxHash(6)
  const first = {id: 2, x: 0, y: 0, z: 0, width: 100, height: 100, depth: 100}
  const second = {id: 1, x: 10, y: 10, z: 10, width: 1, height: 1, depth: 1}
  rh.insert(first)
  rh.insert(second)
  t.is(rh.findNearestNeighbour({x: 9, y: 9, z: 9}), first)
})


test('BoxHash.findNearestNeighbours works correctly', t => {
  const rh = new BoxHash(20) // can get much slower for lower cell-sizes
  const first = {id: 1, x: 1, y: 1, z: 1, width: 100, height: 100, depth: 100}
  const second = {id: 2, x: 11, y: 11, z: 11, width: 1, height: 1, depth: 1}
  const third = {id: 3, x: 100, y: 100, z: 100, width: 1, height: 1, depth: 1}
  rh.insert(first)
  rh.insert(second)
  rh.insert(third)
  t.deepEqual(rh.findNearestNeighbours({x: 1, y: 1, z: 1}, 10, 600), [first, second, third])
  t.deepEqual(rh.findNearestNeighbours({x: 110, y: 110, z: 110}, 10, 600), [first, third, second])
})
