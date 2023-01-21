
/**
 * @param {import('@/utils/entities/Application').Application} app
 * @param {string} diagnose
 */
export function loadStaticDiagnose(app, diagnose) {
    app.diagnoseData = JSON.parse(diagnose);
}
