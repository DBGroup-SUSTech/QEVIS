/**
 * @param {any[]} array
 * @returns {any}
 */
export function getLastItemOf(array) {
  return array[array.length - 1]
}

/**
 * @param {any[]} array
 * @param {any} item
 * @returns {boolean}
 */
export function removeItemFrom(array, item) {
  let index = array.indexOf(item)
  if (index === -1) return false
  array.splice(index, 1)
  return true
}

/**
 * @param {any[]} array
 * @param {function(any, any): boolean} isLess
 * @returns {boolean}
 */
export function findMinElement(array, isLess) {
  let minItemIdx = 0
  array.forEach((item, i) => {
    if (isLess(item, array[minItemIdx])) {
      minItemIdx = i
    }
  })
  return array[minItemIdx]
}

export function isSameSequence(array0, array1) {
  if (array0.length !== array1.length) {
    return false
  }
  for (let i = 0; i < array0.length; ++i) {
    if (array0[i] !== array1[i]) {
      return false
    }
  }
  return true
}

export function unique(array) {
  return Array.from(new Set(array))
}
