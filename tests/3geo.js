import test from "ava"
import {
  boxesIntersect, boxIsWithinBox, distanceBetweenBoxes, distanceBetweenPointAndBox, distanceBetweenPoints,
  pointIsWithinBox, squaredDistanceBetweenPointAndBox, squaredDistanceBetweenPoints
} from "../src/geometry";

const K = 3

function makeBox(x, y, z, width, height, depth) {
  return [
    [x, y, z],
    [x + width, y + height, z + depth]
  ]
}

test('boxesIntersect()', t => {
  t.is(boxesIntersect(makeBox(0, 0, 0, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100), K), true)
  t.is(boxesIntersect(makeBox(101, 101, 101, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100), K), false)
})

test('boxIsWithinBox()', t => {
  t.is(boxIsWithinBox(makeBox(0, 0, 0, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100), K), true)
  t.is(boxIsWithinBox(makeBox(50, 50, 50, 50, 50, 50), makeBox(0, 0, 0, 100, 100, 100), K), true)
  t.is(boxIsWithinBox(makeBox(0, 0, 0, 100, 100, 100), makeBox(50, 50, 50, 50, 50, 50), K), false)
})

test('pointIsWithinBox()', t => {
  t.is(pointIsWithinBox([10, 10, 10], makeBox(0, 0, 0, 100, 100, 100), K), true)
  t.is(pointIsWithinBox([0, 0, 0], makeBox(10, 10, 100, 100), K), false)
})

test('squaredDistanceBetweenPoints()', t => {
  t.is(squaredDistanceBetweenPoints([1, 2, 3], [1, 2, 3], K), 0)
  t.is(squaredDistanceBetweenPoints([1, 2, 3], [10, 20, 30], K), 1134)
})

test('distanceBetweenPoints()', t => {
  t.is(distanceBetweenPoints([1, 2, 3], [1, 2, 3], K), 0)
})

test('squaredDistanceBetweenPointAndRectangle()', t => {
  t.is(squaredDistanceBetweenPointAndBox([1, 2, 3], makeBox(1, 2, 3, 100, 100, 100), K), 0)
})

test('distanceBetweenPointAndRectangle()', t => {
  t.is(distanceBetweenPointAndBox([1, 2, 3], makeBox(1, 2, 3, 100, 100, 100), K), 0)
})

test('distanceBetweenRectangles()', t => {
  t.is(distanceBetweenBoxes(makeBox(0, 0, 0, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100), K), 0)
})
