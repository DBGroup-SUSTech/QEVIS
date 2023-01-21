/** @type {string[]} */
const STEP_NAMES = [
    'Initialization',
    'Input',
    'Processor',
    'Sink',
    'Spill',

    'Initialization',
    'Shuffle',
    'Processor',
    'Sink',
    'Output',
];

/** @type {string[]} */
const STEP_SELECTORS = [
    'Overall',
    'Initialization',
    'Input/Shuffle',
    'Processor',
    'Sink',
    'Spill/Output'
]

/**
 * @param {StepType | number} stepType
 */
function getStepName(stepType) {
    if (typeof stepType !== 'number'
        || stepType < 0
        || stepType >= STEP_NAMES.length) {
        return 'Unknown';
    }
    return STEP_NAMES[stepType];
}


/**
 * @enum {number}
 * @readonly
 */
export const StepType = {
    M_INIT: 0,
    M_INPUT: 1,
    M_PROC: 2,
    M_SINK: 3,
    M_SPILL: 4,

    R_INIT: 5,
    R_SHUFFLE: 6,
    R_PROC: 7,
    R_SINK: 8,
    R_OUTPUT: 9,

    START: 10,
    END: 11,

    getStepName: getStepName,

    STEP_SELECTORS: STEP_SELECTORS,
};
