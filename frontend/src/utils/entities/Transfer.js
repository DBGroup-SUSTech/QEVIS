export class Transfer {
    /** @type {Task} */
    src;
    /** @type {Task} */
    dst;
    /** @type {Vertex} */
    srcV;
    /** @type {number} */
    start;
    /** @type {number} */
    end;
    /** @type {number} */
    csize;

    /** @type {boolean} */
    isAbnormal;
    /** @type {'normal' | 'all'} */
    type;

    /* interact */
    /** @type {boolean} */
    highlight = false;

    /**
     * @param {Task} src
     * @param {Task} dst
     * @param {number} start
     * @param {number} end
     * @param {number} csize
     * @param {boolean} isAbnormal
     */
    static createNormalType(src, dst, start, end, csize, isAbnormal) {
        const object = new Transfer();

        object.src = src;
        object.dst = dst;
        object.start = start;
        object.end = end;
        object.csize = csize;

        object.isAbnormal = isAbnormal;

        object.type = 'normal';

        return object;
    }

    /**
     * @param {Vertex} srcV
     * @param {Task} dst
     * @param {number} end
     * @param {boolean} isAbnormal
     */
    static createAllType(srcV, dst, end, isAbnormal) {
        const object = new Transfer();

        object.srcV = srcV;
        object.dst = dst;
        object.end = end;

        object.isAbnormal = isAbnormal;

        object.type = 'all';

        return object;
    }
}
