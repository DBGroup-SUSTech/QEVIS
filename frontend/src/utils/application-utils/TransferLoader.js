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


const ip2host = {
    "10.16.70.212": "dbg01",
    "10.16.70.217": "dbg02",
    "10.16.71.4"  : "dbg03",
    "10.16.70.236": "dbg04",
    "10.16.70.205": "dbg05",
    "10.16.70.249": "dbg06",
    "10.16.70.29" : "dbg07",
    "10.16.70.254": "dbg08",
    "10.16.70.23" : "dbg09",
    "10.16.70.240": "dbg10",
    "10.16.70.182": "dbg16",
    "10.16.70.44" : "dbg17",
    "10.16.70.104": "dbg18",
    "10.16.70.166": "dbg19",
    "10.16.70.192": "dbg20",
    "10.16.70.255": "dbg21",
}


/**
 * @param {import('@/utils/entities/Application').Application} app
 * @param {Object[]} mapTransfers
 */
export function loadStaticMapTransfers(app, mapTransfers) {
    mapTransfers.forEach(raw => {
        const task = app.taskMap.get(raw.tid);
        const data = JSON.parse(raw.content)
        data.forEach(record => {
            // replace IP with host names
            record.locations = record.locations.map(loc => {
                if (loc in ip2host) {
                    return ip2host[loc]
                } else {
                    return loc
                }
            })

            let location
            if (record.locations.length === 1) {
                location = record.locations[0]
            } else if (record.locations.length >= 1) {
                // multiple locations detected. we select localhost or the first one for now
                if (record.locations.includes(task.machine.machineName)) {
                    location = task.machine.machineName     // use localhost
                } else {
                    location = record.locations[0]
                }
            } else {
                // === 0
                console.error("Map transfer record locations is empty", raw)
            }

            if (task.mapTrans.length === 0) {
                task.mapTrans.push({machine: location, length: record.length})
            } else {
                // we assume that this task get data from one host, without check it
                // i.e., task.mapTrans[0].machine === location
                task.mapTrans[0].length += record.length
            }
        })
    });
    // console.log(app.taskMap)
}
