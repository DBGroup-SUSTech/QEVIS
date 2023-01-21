import {Transfer} from "@/utils/entities/Transfer";

/**
 * @param {import('@/utils/entities/Application').Application} app
 * @param {Object[]} abnormalTransferList
 */
export function loadStaticAbnormalTransfers(app, abnormalTransferList) {
    app.abnormalTransfers = [];
    abnormalTransferList.forEach(raw => {
        let newObject;
        if ('src_v' in raw) {
            newObject = Transfer.createAllType(
                app.vertexMap.get(raw.src_v),
                app.taskMap.get(raw.dst),
                raw.end,
                true,
            );
        } else {
            newObject = Transfer.createNormalType(
                app.taskMap.get(raw.src),
                app.taskMap.get(raw.dst),
                raw.start,
                raw.end,
                parseInt(raw.csize),
                true,
            );
        }
        app.abnormalTransfers.push(newObject);
    });
}
