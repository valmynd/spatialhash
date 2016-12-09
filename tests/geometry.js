import test from "ava"
import {
  rectanglesIntersect,
  rectangleIsWithinRectangle,
  pointIsWithinRectangle,
  squaredDistanceBetweenPoints,
  distanceBetweenPoints,
  squaredDistanceBetweenPointAndRectangle,
  distanceBetweenPointAndRectangle,
  distanceBetweenRectangles,
  getCornersOfRect,
  getEdgesOfRect,
  findNearestNeighbour
} from "../dist/geometry"

test('rectanglesIntersect works correctly', t => {
  t.is(rectanglesIntersect({x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}), true)
  t.is(rectanglesIntersect({x: 101, y: 101, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}), false)
})

test('rectangleIsWithinRectangle works correctly', t => {
  t.is(rectangleIsWithinRectangle({x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}), true)
  t.is(rectangleIsWithinRectangle({x: 50, y: 50, width: 50, height: 50}, {x: 0, y: 0, width: 100, height: 100}), true)
  t.is(rectangleIsWithinRectangle({x: 0, y: 0, width: 100, height: 100}, {x: 50, y: 50, width: 50, height: 50}), false)
})

test('pointIsWithinRectangle works correctly', t => {
  t.is(pointIsWithinRectangle({x: 10, y: 10}, {x: 0, y: 0, width: 100, height: 100}), true)
  t.is(pointIsWithinRectangle({x: 0, y: 0}, {x: 10, y: 10, width: 100, height: 100}), false)
})

test('squaredDistanceBetweenPoints works correctly', t => {
  t.is(squaredDistanceBetweenPoints({x: 1, y: 2}, {x: 1, y: 2}), 0)
  t.is(squaredDistanceBetweenPoints({x: 1, y: 2}, {x: 10, y: 20}), 405)
})

test('distanceBetweenPoints works correctly', t => {
  t.is(distanceBetweenPoints({x: 1, y: 2}, {x: 1, y: 2}), 0)
  t.is(distanceBetweenPoints({x: 1, y: 2}, {x: 10, y: 20}), Math.sqrt(405))
})

test('squaredDistanceBetweenPointAndRectangle works correctly', t => {
  t.is(squaredDistanceBetweenPointAndRectangle({x: 1, y: 2}, {x: 1, y: 2, width: 100, height: 100}), 0)
})

test('distanceBetweenPointAndRectangle works correctly', t => {
  t.is(distanceBetweenPointAndRectangle({x: 1, y: 2}, {x: 1, y: 2, width: 100, height: 100}), 0)
})

test('distanceBetweenRectangles works correctly', t => {
  t.is(distanceBetweenRectangles({x: 0, y: 0, width: 100, height: 100}, {x: 0, y: 0, width: 100, height: 100}), 0)
})

test('getCornersOfRect works correctly', t => {
  t.deepEqual(getCornersOfRect({x: 0, y: 0, width: 100, height: 100}), [
    {x: 0, y: 0},
    {x: 100, y: 0},
    {x: 100, y: 100},
    {x: 0, y: 100}
  ])
})

test('getEdgesOfRect works correctly', t => {
  t.deepEqual(getEdgesOfRect({x: 0, y: 0, width: 100, height: 100}), [
    [{x: 0, y: 0}, {x: 100, y: 0}], // top
    [{x: 100, y: 0}, {x: 100, y: 100}], // right
    [{x: 100, y: 100}, {x: 0, y: 100}], // bottom
    [{x: 0, y: 100}, {x: 0, y: 0}]  // left
  ])
})

test('findNearestNeighbour works correctly', t => {
  t.deepEqual(
    findNearestNeighbour(
      {x: 10, y: 10},
      [
        {x: 0, y: 0},
        {x: 9, y: 9},
        {x: 12, y: 12}
      ]
    ),
    {x: 9, y: 9}
  )
})
