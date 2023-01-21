/**
 * @template T
 *
 * @param {T[]} array
 * @returns {T}
 */
export function getLastItemOf(array) {
    return array[array.length - 1];
}

/**
 * @template T
 *
 * @param {T[]} array
 * @param {function(T,T):number} comparator
 * @returns {T}
 */
export function findMax(array, comparator) {
    let maxItem = array[0];
    array.forEach(item => {
        if (comparator(item, maxItem) > 0) {
            maxItem = item;
        }
    })
    return maxItem;
}

/**
 * @template T
 *
 * @param {T[]} array
 * @param {function(T, i):boolean} predicate
 * @returns {T}
 */
export function find(array, predicate) {
    let result = null;
    array.forEach((item, i) => {
        if (predicate(item, i)) {
            result = item;
        }
    })
    return result;
}

export const ArrayUtils = {
    getLastItemOf,
    findMax,
    find,
}
