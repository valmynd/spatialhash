import test from "ava"
import {
  boxesIntersect, boxIsWithinBox, distanceBetweenBoxes, distanceBetweenPointAndBox, distanceBetweenPoints, MAX_X,
  MAX_Y, MAX_Z, MIN_X, MIN_Y, MIN_Z, pointIsWithinBox, squaredDistanceBetweenPointAndBox, squaredDistanceBetweenPoints
} from "../dist/geometry3d";

function makeBox(x, y, z, width, height, depth) {
  //if (isNaN(x)) let {x, y, z, width, height, depth} = x
  let arr = new Array(6)
  arr[MIN_X] = x
  arr[MIN_Y] = y
  arr[MIN_Z] = z
  arr[MAX_X] = x + width
  arr[MAX_Y] = y + height
  arr[MAX_Z] = z + depth
  return arr
}


test('boxesIntersect works correctly', t => {
  t.is(boxesIntersect(makeBox(0, 0, 0, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100)), true)
  t.is(boxesIntersect(makeBox(101, 101, 101, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100)), false)
})

test('boxIsWithinBox works correctly', t => {
  t.is(boxIsWithinBox(makeBox(0, 0, 0, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100)), true)
  t.is(boxIsWithinBox(makeBox(50, 50, 50, 50, 50, 50), makeBox(0, 0, 0, 100, 100, 100)), true)
  t.is(boxIsWithinBox(makeBox(0, 0, 0, 100, 100, 100), makeBox(50, 50, 50, 50, 50, 50)), false)
})

test('pointIsWithinBox works correctly', t => {
  t.is(pointIsWithinBox([10, 10, 10], makeBox(0, 0, 0, 100, 100, 100)), true)
  t.is(pointIsWithinBox([0, 0, 0], makeBox(10, 10, 100, 100)), false)
})

test('squaredDistanceBetweenPoints works correctly', t => {
  t.is(squaredDistanceBetweenPoints([1, 2, 3], [1, 2, 3]), 0)
  t.is(squaredDistanceBetweenPoints([1, 2, 3], [10, 20, 30]), 1134)
})

test('distanceBetweenPoints works correctly', t => {
  t.is(distanceBetweenPoints([1, 2, 3], [1, 2, 3]), 0)
})

test('squaredDistanceBetweenPointAndRectangle works correctly', t => {
  t.is(squaredDistanceBetweenPointAndBox([1, 2, 3], makeBox(1, 2, 3, 100, 100, 100)), 0)
})

test('distanceBetweenPointAndRectangle works correctly', t => {
  t.is(distanceBetweenPointAndBox([1, 2, 3], makeBox(1, 2, 3, 100, 100, 100)), 0)
})

test('distanceBetweenRectangles works correctly', t => {
  t.is(distanceBetweenBoxes(makeBox(0, 0, 0, 100, 100, 100), makeBox(0, 0, 0, 100, 100, 100)), 0)
})
