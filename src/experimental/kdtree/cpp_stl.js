// https://stackoverflow.com/questions/29145520/
const floor = Math.floor

/**
 * @param {number[]} arr
 * @param {int} i
 * @param {int} j
 */
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
  while (i < last) {
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

/**
 * ported from LLVM libc++, in libcxx/include/algorithm
 * libc++ is dual licensed under the MIT and the University of Illinois Open Source Licenses, see LICENSE_LIBCXX
 * @param {number[]} arr
 * @param {int} first
 * @param {int} nth
 * @param {int} last
 * @param {function} [cmp]
 */
export function nth_element(arr, first, nth, last, cmp = (a, b) => a > b) {
  function sort3(arr, i, j, k, cmp) {
    if (!cmp(arr[j], arr[i])) {
      if (!cmp(arr[k], arr[j])) return
      swap(arr, j, k)
      if (cmp(arr[j], arr[i])) swap(arr, i, j)
    } else if (cmp(arr[k], arr[j])) {
      swap(arr, i, k)
    } else {
      swap(arr, i, j)
      if (cmp(arr[k], arr[j])) swap(arr, j, k)
    }
  }

  const limit = 7
  restart:
    while (true) {
      if (nth === last) return
      let len = last - first
      switch (len) {
        case 0:
        case 1:
          return
        case 2:
          if (cmp(arr[--last], arr[first])) swap(arr, first, last)
          return
        case 3: {
          let m = first
          sort3(arr, first, ++m, --last, cmp)
          return
        }
      }
      if (len <= limit) {
        insertion_sort(arr, first, last, cmp)
        return
      }
      let m = first + len / 2
      let lm1 = last
      let n_swaps = sort3(arr, first, m, --lm1, cmp)
      // *m is median
      // partition [first, m) < *m and *m <= [m, last)
      // (this inhibits tossing elements equivalent to m around unnecessarily)
      let i = first, j = lm1
      // j points beyond range to be tested, *lm1 is known to be <= *m
      // The search going up is known to be guarded but the search coming down isn't.
      // Prime the downward search with a guard.
      if (!cmp(arr[i], arr[m])) {
        // *first == *m, *first doesn't go in first part
        // manually guard downward moving j against i
        while (true) {
          if (i === --j) {
            // *first == *m, *m <= all other elements
            // Parition instead into [first, i) == *first and *first < [i, last)
            ++i;
            j = last
            if (!cmp(arr[first], arr[--j])) {
              while (true) {
                if (i === j)
                  return;  // [first, last) all equivalent elements
                if (cmp(arr[first], arr[i])) {
                  swap(arr, i, j)
                  ++n_swaps
                  ++i
                  break
                }
                ++i
              }
            }
            // [first, i) == *first and *first < [j, last) and j == last - 1
            if (i === j) {
              return
            }
            while (true) {
              while (!cmp(arr[first], arr[i])) {
                ++i
              }
              while (cmp(arr[first], arr[--j])) {
              }
              if (i >= j) break
              swap(arr, i, j)
              ++n_swaps
              ++i
            }
            // [first, i) == *first and *first < [i, last)
            // The first part is sorted,
            if (nth < i) return
            // nth_element the secod part
            first = i
            continue restart
          }
          if (cmp(arr[j], arr[m])) {
            swap(arr, i, j)
            ++n_swaps
            break;  // found guard for downward moving j, now use unguarded partition
          }
        }
      }
      ++i
      // j points beyond range to be tested, *lm1 is known to be <= *m
      // if not yet partitioned...
      if (i < j) {
        // known that *(i - 1) < *m
        while (true) {
          // m still guards upward moving i
          while (cmp(arr[i], arr[m])) {
            ++i
          }
          // It is now known that a guard exists for downward moving j
          while (!cmp(arr[--j], arr[m])) {
          }
          if (i >= j) break
          swap(arr, i, j)
          ++n_swaps
          // It is known that m != j
          // If m just moved, follow it
          if (m === i)
            m = j
          ++i
        }
      }
      // [first, i) < *m and *m <= [i, last)
      if (i !== m && cmp(arr[m], arr[i])) {
        swap(arr, i, m)
        ++n_swaps
      }
      // [first, i) < *i and *i <= [i+1, last)
      if (nth === i) return
      there:
        if (n_swaps === 0) {
          // We were given a perfectly partitioned sequence.  Coincidence?
          if (nth < i) {
            // Check for [first, i) already sorted
            j = m = first
            while (++j !== i) {
              if (cmp(arr[j], arr[m]))
              // not yet sorted, so sort
                break there
              m = j
            }
            // [first, i) sorted
            return
          }
          else {
            // Check for [i, last) already sorted
            j = m = i
            while (++j !== last) {
              if (cmp(arr[j], arr[m]))
              // not yet sorted, so sort
                break there
              m = j
            }
            // [i, last) sorted
            return
          }
        }
      // nth_element on range containing nth
      if (nth < i) {
        // nth_element(first, nth, i, cmp)
        last = i
      }
      else {
        // nth_element(i+1, nth, last, cmp)
        first = ++i
      }
    }
}
