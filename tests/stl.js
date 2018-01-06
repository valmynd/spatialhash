import test from "ava"
import {heap_sort, insertion_sort, make_heap, nth_element, pop_heap} from "../dist/experimental/kdtree/cpp_stl";

function randomArray(rangeBegin = 0, rangeEnd = 9) {
  let arr = new Array(rangeEnd - rangeBegin)
  for (let i = rangeBegin, t = rangeEnd; i < t; i++) arr[i] = Math.round(Math.random() * t)
  return arr
}

test('sort methods', t => {
  let sample = randomArray(), copy1 = [...sample], copy2 = [...sample]
  heap_sort(copy1)
  insertion_sort(copy2)
  console.log(sample, copy1, copy2)
  t.deepEqual(copy1, copy2)
})

test('nth_element', t => {
  // example from http://en.cppreference.com/w/cpp/algorithm/pop_heap
  let sample = [5, 6, 4, 3, 2, 6, 7, 9, 3]
  nth_element(sample, 0, 2, sample.length)
  console.log({sample})
  t.deepEqual([2, 3, 3, 4, 6, 6, 7, 9, 5], sample)
})
