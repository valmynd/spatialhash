import test from "ava"
import {
  boxesIntersect, boxIsWithinBox, distanceBetweenBoxes, distanceBetweenPointAndBox, distanceBetweenPoints,
  pointIsWithinBox, squaredDistanceBetweenPointAndBox, squaredDistanceBetweenPoints
} from "../dist/geometry";

const K = 2

function makeBox(x, y, width, height) {
  return [
    [x, y],
    [x + width, y + height]
  ]
}

test('boxesIntersect()', t => {
  t.is(boxesIntersect(makeBox(0, 0, 100, 100), makeBox(0, 0, 100, 100), K), true)
  t.is(boxesIntersect(makeBox(101, 101, 100, 100), makeBox(0, 0, 100, 100), K), false)
})

test('boxIsWithinBox()', t => {
  t.is(boxIsWithinBox(makeBox(0, 0, 100, 100), makeBox(0, 0, 100, 100), K), true)
  t.is(boxIsWithinBox(makeBox(50, 50, 50, 50), makeBox(0, 0, 100, 100), K), true)
  t.is(boxIsWithinBox(makeBox(0, 0, 100, 100), makeBox(50, 50, 50, 50), K), false)
})

test('pointIsWithinBox()', t => {
  t.is(pointIsWithinBox([10, 10], makeBox(0, 0, 100, 100), K), true)
  t.is(pointIsWithinBox([0, 0], makeBox(10, 10, 100, 100), K), false)
})

test('squaredDistanceBetweenPoints()', t => {
  t.is(squaredDistanceBetweenPoints([1, 2], [1, 2], K), 0)
  t.is(squaredDistanceBetweenPoints([1, 2], [10, 20], K), 405)
})

test('distanceBetweenPoints()', t => {
  t.is(distanceBetweenPoints([1, 2], [1, 2], K), 0)
})

test('squaredDistanceBetweenPointAndBox()', t => {
  t.is(squaredDistanceBetweenPointAndBox([1, 2], makeBox(1, 2, 100, 100), K), 0)
})

test('distanceBetweenPointAndBox()', t => {
  t.is(distanceBetweenPointAndBox([1, 2], makeBox(1, 2, 100, 100), K), 0)
})

test('distanceBetweenboxes()', t => {
  t.is(distanceBetweenBoxes(makeBox(0, 0, 100, 100), makeBox(0, 0, 100, 100), K), 0)
})
