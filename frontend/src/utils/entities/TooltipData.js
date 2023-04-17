import {StepType} from "@/utils/const/StepType";

export class TooltipData {
    /** @type {boolean} */
    show = false;

    layout = {
        x: 0,
        y: 0,
        width: 0,
    };

    /** @type {Task} */
    task = null;

    /** @type {Object[]} */
    counterItems = [];
    /** @type {Object[]} */
    steps = [];

    /**
     * @param {Task} task
     */
    setTask(task) {
        this.task = task;

        this.counterItems = Object.keys(task.counter).map(key => {
            let value = task.counter[key];

            if (key.includes('RECORD')) {
                if (value >= 1000) {
                    value = Math.round(value / 100) / 10
                    value += ' K'
                }
            } else {
                if (value < 1024) {
                    value += ' B';
                } else {
                    value = Math.round(value / 1024 * 10) / 10
                    value += ' KB';
                }
            }

            return {key, value};
        });
        if (task.vertex.type === 'Map'){
            if (task.mapTrans[0])
                this.counterItems["dataSource"] = task.mapTrans[0].machine??"None"
            // console.log(task)
        }
        const indexOffset = task.vertex.type === 'Map' ? 0 : 5;
        this.steps = [];
        for (let i = 0; i < 5; i++) {
            let key, value;

            key = StepType.getStepName(i);

            const step = task.stepMap.get(i + indexOffset);
            if (step) {
                value = Math.round((step.end - step.start) / 1000) + 's';
            } else {
                value = '(No data)';
            }

            this.steps.push({key, value});
        }

        this.show = true;
    }

    clearTask() {
        this.task = null;
        this.show = false;
    }
}
