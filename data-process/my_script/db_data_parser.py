import json
import os
import sys

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from fsm.parse_dag import parse_dag
from fsm.util.json_handler import MyJsonEncoder
from myio.common_io import read_lines, write_lines


def process_dir(application_path):
    print('process ' + application_path)
    file_candidates = list(filter(lambda name: name.endswith('.plan'), os.listdir(application_path)))
    if len(file_candidates) == 0:
        return
    plan_name = file_candidates[0]
    plan_path = os.path.join(application_path, plan_name)

    try:
        dag = parse_dag(read_lines(plan_path))
        json_str = json.dumps(dag, cls=MyJsonEncoder, indent=None)

        # reformat
        json_obj = json.loads(json_str)
        for v in json_obj['vertexes']:
            v['name'] = v['vdat']['vertex_name']
            del v['vdat']
        for e in json_obj['edges']:
            e['type'] = e['edat']['edge_type']
            del e['edat']
        del json_obj['vertex_number']
        del json_obj['edge_number']
        json_str = json.dumps(json_obj, indent=None, separators=(',', ':'))

        dag_json_path = os.path.join(application_path, 'output', 'Dag.json')
        write_lines(dag_json_path, [json_str])

    except Exception as e:
        print(e)


if __name__ == '__main__':
    data_path = os.path.join(ROOT_PATH, 'data5')
    for name in os.listdir(data_path):
        process_dir(os.path.join(data_path, name))
