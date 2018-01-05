import test from "ava"
import {
  distanceBetweenPointAndRectangle, distanceBetweenPoints, distanceBetweenRectangles, getCornersOfRect,
  getEdgesOfRect, MAX_X, MAX_Y, MIN_X, MIN_Y, pointIsWithinRectangle, rectangleIsWithinRectangle, rectanglesIntersect,
  squaredDistanceBetweenPointAndRectangle, squaredDistanceBetweenPoints
} from "../dist/geometry2d"


function makeRect(x, y, width, height) {
  //if (isNaN(x)) let {x, y, width, height} = x
  let arr = new Array(4)
  arr[MIN_X] = x
  arr[MIN_Y] = y
  arr[MAX_X] = x + width
  arr[MAX_Y] = y + height
  return arr
}

test('rectanglesIntersect works correctly', t => {
  t.is(rectanglesIntersect(makeRect(0, 0, 100, 100), makeRect(0, 0, 100, 100)), true)
  t.is(rectanglesIntersect(makeRect(101, 101, 100, 100), makeRect(0, 0, 100, 100)), false)
})

test('rectangleIsWithinRectangle works correctly', t => {
  t.is(rectangleIsWithinRectangle(makeRect(0, 0, 100, 100), makeRect(0, 0, 100, 100)), true)
  t.is(rectangleIsWithinRectangle(makeRect(50, 50, 50, 50), makeRect(0, 0, 100, 100)), true)
  t.is(rectangleIsWithinRectangle(makeRect(0, 0, 100, 100), makeRect(50, 50, 50, 50)), false)
})

test('pointIsWithinRectangle works correctly', t => {
  t.is(pointIsWithinRectangle([10, 10], makeRect(0, 0, 100, 100)), true)
  t.is(pointIsWithinRectangle([0, 0], makeRect(10, 10, 100, 100)), false)
})

test('squaredDistanceBetweenPoints works correctly', t => {
  t.is(squaredDistanceBetweenPoints([1, 2], [1, 2]), 0)
  t.is(squaredDistanceBetweenPoints([1, 2], [10, 20]), 405)
})

test('distanceBetweenPoints works correctly', t => {
  t.is(distanceBetweenPoints([1, 2], [1, 2]), 0)
})

test('squaredDistanceBetweenPointAndRectangle works correctly', t => {
  t.is(squaredDistanceBetweenPointAndRectangle([1, 2], makeRect(1, 2, 100, 100)), 0)
})

test('distanceBetweenPointAndRectangle works correctly', t => {
  t.is(distanceBetweenPointAndRectangle([1, 2], makeRect(1, 2, 100, 100)), 0)
})

test('distanceBetweenRectangles works correctly', t => {
  t.is(distanceBetweenRectangles(makeRect(0, 0, 100, 100), makeRect(0, 0, 100, 100)), 0)
})

test('getCornersOfRect works correctly', t => {
  t.deepEqual(getCornersOfRect(makeRect(0, 0, 100, 100)), [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100]
  ])
})

test('getEdgesOfRect works correctly', t => {
  t.deepEqual(getEdgesOfRect(makeRect(0, 0, 100, 100)), [
    [[0, 0], [100, 0]], // top
    [[100, 0], [100, 100]], // right
    [[100, 100], [0, 100]], // bottom
    [[0, 100], [0, 0]]  // left
  ])
})
