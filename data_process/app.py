import json
import sys

from flask_cors import CORS
from flask import Flask, request, jsonify, Response

from diagnose.diagnose import Diagnose
from fsm.parse_dag import parse_dag
from fsm.util.json_handler import MyJsonEncoder
from my_script.app_info_parser import gen_batch
from myio.common_io import read_lines, read_json_obj
from simulate.simulator import Simulator

import os

simulator = Simulator()
diagnose = Diagnose()
simulation_task_list = []

top_k = 20
vec_df_column = ["vec_name", "duration_score"]
vec_machine_df_column = ["machine_id", "vec_name", "duration_score"]

app = Flask(__name__)
CORS(app)

FILE_ABS_PATH = os.path.dirname(__file__)
SERVER_PATH = os.path.join(FILE_ABS_PATH, './')

SIM_FILE_PATH = os.path.join(SERVER_PATH, 'data_local/Example6/SimulationFile.json')
MON_FILE_PATH = os.path.join(SERVER_PATH, 'data_local/Example6/MonitorFile.json')
PLAN_FILE_PATH = os.path.join(SERVER_PATH, 'data_local/Example6/ExecutionPlan.txt')

DATASET = 'data3'

task_map = {}  # task name to task
vertex_map = {}  # vertex to task name list

sim_task_map = {}  # task name to task
sim_vertex_map = {}  # vertex to task name list
sim_fetch_no_dst = []
sim_all_task = []


@app.route('/api/get_all_query_data', methods=['POST'])
def get_all_query_data():
    folder = os.path.join(SERVER_PATH, DATASET)
    file_names = list(filter(lambda name: name.startswith("Example") or name.startswith("Query"), os.listdir(folder)))
    # file_names = ["Query58"]

    dag_dic = {}
    info_dic = {}
    sql_dic = {}
    for data_name in file_names:
        example_path = os.path.join(SERVER_PATH, DATASET, data_name)
        plan_name = list(filter(lambda name: name.endswith('.plan'), os.listdir(example_path)))[0]
        PLAN_FILE_PATH = os.path.join(example_path, plan_name)
        dag = parse_dag(read_lines(PLAN_FILE_PATH))
        jsons = json.dumps(dag, cls=MyJsonEncoder)
        json_obj = json.loads(jsons)
        dag_dic[data_name] = json_obj

        app_info_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/AppInfo.json'.format(data_name))
        if not os.path.exists(app_info_file_path):
            continue
            # number_index = int(data_name.replace('Query', ''))
            # gen_batch(number_index, number_index + 1, SERVER_PATH)
        tasks_obj = read_json_obj(app_info_file_path)
        info_dic[data_name] = tasks_obj

        example_path = os.path.join(SERVER_PATH, DATASET, data_name)
        sql_files = list(filter(lambda name: '.sql' in name, os.listdir(example_path)))

        if len(sql_files) != 0:
            sql_file_name = sql_files[0]
            sql_name = sql_file_name.replace('.sql', '')

            sql_file_path = os.path.join(example_path, sql_file_name)
            sql = ''.join(read_lines(sql_file_path))
        else:
            sql_name = ''
            sql = ''

        sql_dic[data_name] = {'queryName': sql_name, 'content': sql}

    ret = {"dag": dag_dic,
           "info": info_dic,
           "sql": sql_dic}

    return jsonify(ret), 200, {"Content-Type": "application/json"}


@app.route('/api/get_data_names', methods=['POST'])
def get_folder_name():
    folder = os.path.join(SERVER_PATH, DATASET)
    file_names = list(filter(lambda name: name.startswith("Example") or name.startswith("Query1"), os.listdir(folder)))
    print('file_names ', file_names)
    return json.dumps(file_names)


@app.route('/api/record/', methods=['post'])
def upload_record():
    """ Receive data from database system """
    data = request.get_data()
    data = json.loads(data)
    # fsm.update(data)
    print('Record accept')
    return 'Record accept'


@app.route('/api/dag/', methods=['POST'])
def get_dag():
    params = request.json
    data_name = params['name']

    example_path = os.path.join(SERVER_PATH, DATASET, data_name)
    plan_name = list(filter(lambda name: name.endswith('.plan'), os.listdir(example_path)))[0]
    PLAN_FILE_PATH = os.path.join(example_path, plan_name)
    dag = parse_dag(read_lines(PLAN_FILE_PATH))

    print('query dag ', data_name)
    jsons = json.dumps(dag, cls=MyJsonEncoder)
    json_obj = json.loads(jsons)
    return jsonify(json_obj), 200, {"Content-Type": "application/json"}


@app.route('/api/info/', methods=['POST'])
def get_app_info():
    params = request.json
    data_name = params['name']

    app_info_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/AppInfo.json'.format(data_name))
    if not os.path.exists(app_info_file_path):
        number_index = int(data_name[7:9])
        gen_batch(number_index, number_index + 1, SERVER_PATH)
    tasks_obj = read_json_obj(app_info_file_path)

    print('get_app_info finished')
    return jsonify(tasks_obj), 200, {"Content-Type": "application/json"}


@app.route('/api/static/tasks/', methods=['POST'])
def get_all_tasks():
    task_map.clear()
    vertex_map.clear()
    params = request.json
    data_name = params['name']
    all_tasks_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/FullTask.json'.format(data_name))
    tasks_obj = read_json_obj(all_tasks_file_path)
    changed = tasks_obj["changed"]
    for task in changed:
        task_map[task["task_id"]] = task
        # if task["vec_name"] == "Map 11":
        #     print("Map 11!!!!!!!!!")
        if task["vec_name"] in vertex_map:
            vertex_map[task["vec_name"]].append(task)
        else:
            vertex_map[task["vec_name"]] = [task]

    diagnose.initial(changed)
    vec_df, vec_machine_df = diagnose.diagnose_matrix_cal()

    diagnose_matrix = {
        "vec_df": json.loads(vec_df.sort_values(['duration_score'], ascending=(False)).to_json(orient="records")),
        "vec_machine_df": json.loads(
            vec_machine_df.sort_values(['duration_score'], ascending=(False)).to_json(orient="records"))
    }
    tasks_obj["diagnoseMatrix"] = diagnose_matrix
    # jsons = json.dumps(tasks_obj, cls=MyJsonEncoder)
    # json_obj = json.loads(jsons)
    # print(tasks_obj)
    print('get_all_tasks finished')

    # return jsonify(tasks_obj), 200, {"Content-Type": "application/json"}
    return Response(json.dumps(tasks_obj), mimetype='application/json')


@app.route('/api/static/mons/', methods=['POST'])
def get_all_mons():
    params = request.json
    data_name = params['name']

    all_mons_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/FullMon.json'.format(data_name))
    mons_obj = read_json_obj(all_mons_file_path)

    print('get_all_mons finished')
    return jsonify(mons_obj), 200, {"Content-Type": "application/json"}


@app.route('/api/static/fetches/', methods=['POST'])
def get_all_fetches():
    params = request.json
    data_name = params['name']

    all_fetches_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/FullFetch.json'.format(data_name))
    fetches_obj = read_json_obj(all_fetches_file_path)

    del fetches_obj['ends']

    max_c_size = 0

    fetch_glyphs = []

    for fetch in fetches_obj['changes']:
        if fetch['label'] == 'NORMAL':
            max_c_size = max(max_c_size, fetch["csize"])

            x_time = task_map[fetch["dst"]]["start_time"]
            y_time = task_map[fetch["src"]]["end_time"]

            if x_time < y_time:
                fetch_glyph = {
                    # "fill": fetch["csize"],
                    # "fetch": fetch,
                    "srcTask": task_map[fetch["src"]]["task_id"],
                    "dstTask": task_map[fetch["dst"]]["task_id"],
                    "dep_id": task_map[fetch["src"]]["task_id"] + '_' + task_map[fetch["dst"]]["task_id"],
                    # "highlight": False,
                }
                fetch_glyphs.append(fetch_glyph)
            del fetch['type']
            del fetch['rate']
            del fetch['startTime']
            del fetch['endTime']
        else:
            x_time = task_map[fetch["dst"]]["start_time"]
            # if fetch["srcVtxName"] == "Map 24":
            #     print(fetch)
            for task in vertex_map[fetch["srcVtxName"]]:
                if "counter" not in task:
                    continue
                max_c_size = max(max_c_size, task["counter"]["OUTPUT_BYTES"])

                y_time = task["end_time"]
                if x_time < y_time:
                    fetch_glyph = {
                        # "fill": task["counter"]["OUTPUT_BYTES"],
                        # "fetch": fetch,
                        "srcTask": task["task_id"],  # ID here!!!
                        "dstTask": fetch["dst"],
                        "dep_id": task["task_id"] + '_' + fetch["dst"],
                        # "highlight": False,
                    }
                    fetch_glyphs.append(fetch_glyph)
            del fetch['endTime']
    # TODO add fetchGlyphs calculation and return
    fetches_obj["maxCSize"] = max_c_size
    fetches_obj["fetchGlyphs"] = fetch_glyphs

    print('get_all_fetches finished')
    print(fetches_obj["changes"] is None)
    return jsonify(fetches_obj), 200, {"Content-Type": "application/json"}


@app.route('/api/static/outliers/', methods=['POST'])
def get_all_outliers():
    params = request.json
    data_name = params['name']

    all_outliers_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/FullOutlier.json'.format(data_name))
    outliers_obj = read_json_obj(all_outliers_file_path)

    print('get_all_outliers finished')
    return jsonify(outliers_obj), 200, {"Content-Type": "application/json"}


@app.route('/api/dag-time/', methods=['POST'])
def get_dag_with_time():
    params = request.json
    dataName = params['name']
    dag_time_path = os.path.join(SERVER_PATH, 'data_local/{}/dag_with_time.json'.format(dataName))
    print('query dag_with_time ', dataName)
    json_obj = read_json_obj(dag_time_path)
    return jsonify(json_obj), 200, {"Content-Type": "application/json"}


@app.route('/api/incr/', methods=['POST'])
def get_incr():
    """ Get the increment in simulation """
    # try:
    incr = simulator.get_log_incr()
    changed = incr["changed"]
    # simulation_task_list.append(changed)

    for task in changed:
        sim_all_task.append(task)
        sim_task_map[task["task_id"]] = task
        if task["vec_name"] in sim_vertex_map:
            sim_vertex_map[task["vec_name"]].append(task)
        else:
            sim_vertex_map[task["vec_name"]] = [task]
    if (len(sim_all_task) > 0):
        diagnose.initial(sim_all_task)
        vec_df, vec_machine_df = diagnose.diagnose_matrix_cal()

        diagnose_matrix = {
            "vec_df": json.loads(vec_df.sort_values(['duration_score'], ascending=(False)).to_json(orient="records")),
            "vec_machine_df": json.loads(
                vec_machine_df.sort_values(['duration_score'], ascending=(False)).to_json(orient="records"))
        }

        incr["diagnoseMatrix"] = diagnose_matrix
    else:
        incr["diagnoseMatrix"] = {
            "vec_df": [],
            "vec_machine_df": []
        }

    # except Exception as e:
    #     print('get_incr error: \n' + str(e))
    #     return 'get_incr error: \n' + str(e), 500, []
    return jsonify(incr), 200, {"Content-Type": "application/json"}


@app.route('/api/incr/monitor/', methods=['POST'])
def get_mon_incr():
    """ Get the increment in monitor """
    try:
        incr = simulator.get_mon_incr()
    except Exception as e:
        print('Error: \n' + str(e))
        return 'Error:\n' + str(e), 500, []
    return jsonify(incr), 200, {"Content-Type": "application/json"}


@app.route('/api/incr/fetch/', methods=['POST'])
def get_fetch_incr():
    """ Get the increment in fetch operations """
    # try:
    incr = simulator.get_fetch_incr()

    del incr['ends']

    max_c_size = 0

    fetch_glyphs = []
    fetch_all_changes = sim_fetch_no_dst + incr['changes']
    for fetch in fetch_all_changes:
        if fetch["dst"] not in sim_task_map:
            sim_fetch_no_dst.append(fetch)
            continue
        if fetch['label'] == 'NORMAL':
            max_c_size = max(max_c_size, fetch["csize"])

            x_time = sim_task_map[fetch["dst"]]["start_time"]
            y_time = sim_task_map[fetch["src"]]["end_time"]

            if x_time < y_time:
                fetch_glyph = {
                    # "fill": fetch["csize"],
                    # "fetch": fetch,
                    "srcTask": sim_task_map[fetch["src"]]["task_id"],
                    "dstTask": sim_task_map[fetch["dst"]]["task_id"],
                    "dep_id": sim_task_map[fetch["src"]]["task_id"] + '_' + sim_task_map[fetch["dst"]]["task_id"],
                    # "highlight": False,
                }
                fetch_glyphs.append(fetch_glyph)
            if "type" not in fetch:
                continue
            del fetch['type']
            del fetch['rate']
            del fetch['startTime']
            del fetch['endTime']
        else:
            x_time = sim_task_map[fetch["dst"]]["start_time"]

            for task in sim_vertex_map[fetch["srcVtxName"]]:
                if "counter" not in task:
                    # print(task)
                    pass
                else:
                    max_c_size = max(max_c_size, task["counter"]["OUTPUT_BYTES"])

                y_time = task["end_time"]
                if x_time < y_time:
                    fetch_glyph = {
                        # "fill": task["counter"]["OUTPUT_BYTES"],
                        # "fetch": fetch,
                        "srcTask": task["task_id"],  # ID here!!!
                        "dstTask": fetch["dst"],
                        "dep_id": task["task_id"] + '_' + fetch["dst"],
                        # "highlight": False,
                    }
                    fetch_glyphs.append(fetch_glyph)
            if "endTime" not in fetch:
                continue
            del fetch['endTime']
    # TODO add fetchGlyphs calculation and return
    incr["maxCSize"] = max_c_size
    incr["fetchGlyphs"] = fetch_glyphs
    # except Exception as e:
    #     print('Error: \n' + str(e))
    #     return 'Error:\n' + str(e), 500, []
    return jsonify(incr), 200, {"Content-Type": "application/json"}


@app.route('/api/simulation/', methods=['get'])
def start_simulation():
    """ Start the simulation """

    request.data.decode('utf-8')
    # sim_file = request.form['sim_file']

    # sim_file_path = 'data/Example3/output/SimulationFile.json'

    simulator.reset(SIM_FILE_PATH, MON_FILE_PATH)

    simulator.start_sim()

    sim_task_map.clear()
    sim_vertex_map.clear()
    sim_all_task.clear()
    # simulation_task_list.clear()
    return 'Simulation started'


@app.route('/api/simulation/local/', methods=['POST', 'GET'])
def start_local_simulation():
    """ Start the local simulation """
    params = request.json
    print('start with simulation ', params)
    request.data.decode('utf-8')
    dataName = params['dataName']
    if dataName:
        SIM_FILE_PATH = os.path.join(SERVER_PATH, DATASET, '{}/output/SimulationFile.json'.format(dataName))
        MON_FILE_PATH = os.path.join(SERVER_PATH, DATASET, '{}/output/MonitorFile.json'.format(dataName))
    else:
        sys.stderr.write(f'Empty param: dataName\n')
        return 'Local simulation failed: Empty param \'dataName\'', 400, []
    print("SIM/MON Path", SIM_FILE_PATH, MON_FILE_PATH)
    simulator.reset(SIM_FILE_PATH, MON_FILE_PATH)
    simulator.start_sim()
    sim_task_map.clear()
    sim_vertex_map.clear()
    sim_all_task.clear()
    return 'Local simulation started'


@app.route('/api/simulation/stop/', methods=['POST', 'GET'])
def stop_simulation():
    """ Stop the simulation"""
    simulator.stop_sim()
    print('>>> simulation stop interrupt.')
    return 'Simulation stopped'


@app.route('/api/simulation/rate/update/', methods=['POST'])
def set_simulation_rate():
    """ Change the simulation"""
    params = request.json
    request.data.decode('utf-8')
    rate = params['simRate']
    simulator.set_rate(float(rate))
    return f'Change simulation rate to {rate}'


@app.route('/api/simulation/rate/', methods=['POST'])
def get_simulation_rate():
    return str(simulator.get_rate())


@app.route('/api/sql/', methods=['POST'])
def get_sql_str():
    params = request.json
    data_name = params['name']

    example_path = os.path.join(SERVER_PATH, DATASET, data_name)
    sql_files = list(filter(lambda name: '.sql' in name, os.listdir(example_path)))

    if len(sql_files) != 0:
        sql_file_name = sql_files[0]
        sql_name = sql_file_name.replace('.sql', '')

        sql_file_path = os.path.join(example_path, sql_file_name)
        sql = ''.join(read_lines(sql_file_path))
    else:
        sql_name = ''
        sql = ''

    ret = {'queryName': sql_name, 'content': sql}

    print(f'query sql {sql_name} of {data_name}')
    return jsonify(ret), 200, {"Content-Type": "application/json"}


@app.route('/api/diagnose/', methods=['POST'])
def diagnose_task():
    params = request.json
    data_name = params['name']
    all_tasks_file_path = os.path.join(SERVER_PATH, DATASET, '{}/output/FullTask.json'.format(data_name))
    tasks_obj = read_json_obj(all_tasks_file_path)
    changed = tasks_obj["changed"]

    diagnose.initial(changed)
    vec_df, vec_machine_df = diagnose.diagnose_matrix_cal()

    ret = {
        "vec_df": vec_df.sort_values(['duration_score'], ascending=(False)).head(top_k)[vec_df_column].to_json(
            orient="values"),
        "vec_machine_df": vec_machine_df.sort_values(['duration_score'], ascending=(False)).head(top_k)
        [vec_machine_df_column].to_json(orient="values")
    }
    return jsonify(ret), 200, {"Content-Type": "application/json"}


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
