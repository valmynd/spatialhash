// https://stackoverflow.com/questions/29145520/
const floor = Math.floor

function swap(arr, i, j) {
  let tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}

/**
 * @param {number[]} arr
 * @param {function} [cmp]
 */
export function heap_sort(arr, cmp = (a, b) => a > b) {
  make_heap(arr)
  let last = arr.length - 1
  while (last > 0) {
    swap(arr, 0, last)
    sift_heap(arr, 0, last, cmp)
    last -= 1
  }
}

/**
 * @param {number[]} arr
 * @param {int} [first]
 * @param {int} [last]
 * @param {function} [cmp]
 * @param {int} [s]
 */
export function make_heap(arr, first = 0, last = arr.length, cmp = (a, b) => a > b, s = floor(arr.length / 2 - 1)) {
  for (let i = s; i >= first; i--) {
    sift_heap(arr, i, last, cmp)
  }
}

/**
 * @param {number[]} arr
 * @param {int} first
 * @param {int} last
 * @param {function} cmp
 */
function sift_heap(arr, first, last, cmp) {
  let i = first, j, a, b
  while (first < last) {
    j = i
    a = i * 2 + 1
    b = a + 1
    if (a < last && cmp(arr[a], arr[j])) j = a
    if (b < last && cmp(arr[b], arr[j])) j = b
    if (j === i) return
    swap(arr, i, j)
    i = j
  }
}

/**
 * Places the value in the location last-1 into the resulting heap [first, last)
 * bubbleUp
 *   - https://secweb.cs.odu.edu/~zeil/cs361/web/website/Lectures/heap/pages/ar01s04s01.html
 * @param {number[]} arr
 * @param {int} first
 * @param {int} last
 * @param {function} cmp
 * @param {int} [toBeBubbledDown]
 */
function push_heap(arr, first, last, cmp, toBeBubbledDown = last - 1) {
  let i = toBeBubbledDown, p = first + (toBeBubbledDown - first - 1) / 2
  while (i > 0 && cmp(arr[i], arr[i])) {
    swap(arr, i, p)
    i = p
    p = (i - 1) / 2
  }
}

/**
 * Swaps the value in location first with the value in the location last-1 and makes [first, last-1) into a heap.
 * What it does (assuming that [begin, end) forms a valid, non-empty heap) is rearrange the elements such that the
 * first element of the heap moves to be the last element of the range, and [begin, end-1) a valid heap.
 * percolateDown
 *   - https://secweb.cs.odu.edu/~zeil/cs361/web/website/Lectures/heap/pages/ar01s04s02.html
 *   - https://secweb.cs.odu.edu/~zeil/cs361/web/website/Lectures/heap/pages/ar01s04s03.html
 * @param {number[]} arr
 * @param {int} first
 * @param {int} last
 * @param {function} cmp
 * @param {int} [toBePercolatedDown]
 */
export function pop_heap(arr, first, last, cmp, toBePercolatedDown = 0) {
  if (last <= first) return
  swap(arr, first, last - 1)
  /*let i = toBePercolatedDown, len = last - first
  while (2 * i + 1 < len) {
    let a = 2 * i + 1 // left child
    let b = a + 1 // right child
    let l =  (b < len && cmp(arr[first + b] > arr[first + a])) ? a: b // larger child
    if (cmp(arr[first + l] , arr[first + i])) {
      swap(arr, (first + i), (first + l))
      i = l
    } else {
      i = len
    }
  }*/
  make_heap(arr, first, last - 1, cmp)
}


//export function pop_heap(arr, first, last, cmp) {
//  if (last <= first) return
//  swap(arr, first, last - 1)
//  sift_heap(arr, first, last - 1, cmp)
//}

/**
 *
 * @param {number[]} arr
 * @param {int} t
 * @param {int} a
 * @param {int} b
 * @param {int} c
 * @param {function} cmp
 */
function move_median_to_first(arr, t, a, b, c, cmp) {
  if (cmp(a, b)) {
    if (cmp(b, c)) swap(arr, t, b)
    else if (cmp(a, c)) swap(arr, t, c)
    else swap(arr, t, a)
  } else {
    if (cmp(a, c)) swap(arr, t, a)
    else if (cmp(b, c)) swap(arr, t, c)
    else swap(arr, t, b)
  }
}

/**
 * @param {number[]} arr
 * @param {int} first
 * @param {int} last
 * @param {int} pivot
 * @param {function} cmp
 */
function partition(arr, first, last, pivot, cmp) {
  while (true) {
    while (cmp(first, pivot)) ++first
    --last
    while (cmp(pivot, last)) --last
    if (first >= last) return first
    swap(arr, first, last)
    first++
  }
}

/**
 * @param {number[]} arr
 * @param {int} first
 * @param {int} nth
 * @param {int} last
 * @param {function} [cmp]
 */
export function nth_element(arr, first, nth, last, cmp = (a, b) => a > b) {
  console.log({first, nth, last})
  if (first === last || nth === last) return
  for (let k = Math.log2(last - first) * 2; last - first > 3; k--) {
    console.log({k})
    if (k === 0) {
      make_heap(arr, first, last, cmp, nth + 1)
      for (let i = nth + 1; i < last; i++) {
        if (cmp(i, first)) pop_heap(arr, first, nth + 1, cmp, i)
      }
      swap(arr, first, nth)
      return
    }
    move_median_to_first(arr, first, first + 1, first + (last - first) / 2, last - 1, cmp)
    let cut = partition(arr, first + 1, last, first, cmp)
    if (cut <= nth) first = cut
    else last = cut
  }
  insertion_sort(arr, first, last, cmp)
}

/**
 * @param {number[]} arr
 * @param [first]
 * @param [last]
 * @param {function} cmp
 */
export function insertion_sort(arr, first = 0, last = arr.length, cmp = (a, b) => a > b) {
  for (let i = first; i < last; i++) {
    let j, v = arr[i]
    for (j = i; j > 0; j--) {
      if (cmp(v, arr[j - 1])) break
      arr[j] = arr[j - 1]
    }
    arr[j] = v
  }
}
