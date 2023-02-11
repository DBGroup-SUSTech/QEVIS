/** @type {string[]} */
export const STEP_NAMES = [
    'Input',
    'Processing',
    'Output'
]

/** @type {string[]} */
const STEP_SELECTORS = [
    'Overall',
    'Input',
    'Processing',
    'Output'
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
 * @readonly
 */
export const StepType = {
    INPUT: 0,
    PROCESS: 1,
    OUTPUT: 2,

    START: 3,
    END: 4,

    getStepName: getStepName,
    STEP_SELECTORS: STEP_SELECTORS,
};
