/**
 * @template K, V
 *
 * @param {Map<K, V>} map
 * @param {K} key
 * @param {function(K): V} compute
 * @returns {V}
 */
function computeIfAbsent(map, key, compute) {
    if (map.has(key)) {
        return map.get(key);
    }
    const value = compute(key);
    map.set(key, value);
    return value;
}

export const MapUtils = {
    computeIfAbsent,
}
