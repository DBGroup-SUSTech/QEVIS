import {Record} from "@/utils/entities/Record";

/**
 * @param {Application} app
 * @param {Object[]} fullRecords
 */
export function loadStaticRecords(app, fullRecords) {
    const machineMap = app.machineMap;
    fullRecords.forEach(rawRecord => {
        const r = new Record();
        r.timestamp = rawRecord.t;
        r.machine = rawRecord.m;
        const {perCpuPercent, mem, iostat, netIO} = JSON.parse(rawRecord.c);
        r.cpu = perCpuPercent;
        r.mem = mem;
        r.io = iostat;
        r.net = netIO;

        if (machineMap.has(r.machine)) {
            machineMap.get(r.machine).records.push(r);
        } else {
            // console.warn('Machine ' + r.machine + ' is not exists');
        }
    });
}
