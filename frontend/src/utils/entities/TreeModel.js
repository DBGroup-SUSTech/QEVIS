import * as d3 from 'd3';

export class TreeModel {
    /** @type {Application} */
    application

    /** @type {VertexTreeModel[]} */
    vertexTreeModelList = []
    /** @type {Map<number, VertexTreeModel>} */
    vertexTreeModelMap = new Map()

    /** @type {d3.scaleLinear} */
    xScale

    /**
     * @param {Application} application
     */
    constructor(application) {
        this.application = application;
    }

    /**
     * Load data from static application directly
     */
    loadStatic(unitHeight, detailHeight) {
        const tasks = this.application.tasks;

        const nestData = d3.nest()
            .key(d => d.vertex.vertexName)
            .key(d => d.machine.machineName)
            .entries(tasks)

        const vertexTreeModelList = [];
        const vertexTreeModelMap = new Map();

        nestData.forEach(vertexGroup => {
            const vertexName = vertexGroup.key;
            const vertexObj = this.application.vertexes.find(v => v.vertexName === vertexName);
            const vertexTreeModel = vertexObj.createTreeViewObj();
            const values = vertexGroup.values;     // machine data
            vertexTreeModel.vertexName = vertexName;
            vertexTreeModel.config = {
                outerSelect: false,
                height: unitHeight,
                totalHeight: unitHeight,
                detailHeight: detailHeight,
                unitHeight: unitHeight
            };

            vertexTreeModelList.push(vertexTreeModel);
            vertexTreeModelMap.set(vertexTreeModel.vid, vertexTreeModel);

            values.forEach(machineGroup => {
                const machineName = machineGroup.key;
                const machineObj = this.application.machineMap.get(machineName);
                const machineTreeModel = machineObj.createTreeViewObj();
                const values = machineGroup.values;     // task data
                machineTreeModel.vertexName = vertexName;
                machineTreeModel.machineName = machineName;
                machineTreeModel.config = {
                    outerSelect: false,
                    height: unitHeight,
                    totalHeight: unitHeight,
                    detailHeight: detailHeight,
                    unitHeight: unitHeight
                };

                vertexTreeModel.machineTreeModelList.push(machineTreeModel);
                vertexTreeModel.machineTreeModelMap.set(machineName, machineTreeModel);

                values.forEach(task => {
                    const taskTreeModel = task.createTreeViewObj();
                    taskTreeModel.vertexName = vertexName;
                    taskTreeModel.machineName = machineName;
                    taskTreeModel.config = {
                        outerSelect: false,
                        height: unitHeight,
                        totalHeight: unitHeight,
                        detailHeight: detailHeight,
                        unitHeight: unitHeight
                    };

                    machineTreeModel.taskTreeModelList.push(taskTreeModel);
                });
            });
        });

        this.vertexTreeModelList = vertexTreeModelList;
        this.vertexTreeModelMap = vertexTreeModelMap;

        // create xScale
        this.xScale = d3.scaleLinear().range([0, this.application.visDuration]);
    }

    changeSelectStatus(task, selected) {
        const taskVO = task._treeViewObj;

        const vertexVO = this.vertexTreeModelMap.get(taskVO.vertex.vid);
        vertexVO.config.outerSelect = selected;

        setTimeout(() => {
            const machineVO = vertexVO.machineTreeModelMap.get(taskVO.machineName);
            machineVO.config.outerSelect = selected;
        }, 0);

        taskVO.config.outerSelect = selected;
    }
}
