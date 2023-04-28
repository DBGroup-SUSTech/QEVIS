import argparse
import json
import os
import sys

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from fsm.parse_dag import parse_dag
from fsm.util.json_handler import MyJsonEncoder
from myio.common_io import read_lines, write_lines


def parse_dag_simple(plan_path: str) -> str:
    lines = read_lines(plan_path)
    assert 'Vertex dependency in root stage\n' in lines and 'Stage-0\n' in lines
    lines = lines[lines.index('Vertex dependency in root stage\n') + 1 : lines.index('Stage-0\n') - 1]

    vertexes = []
    edges = []
    id_cnt = 0
    name2id = {}

    for line in lines:
        grp = line.split('<-')
        dst_vertex_name = grp[0].strip()

        if dst_vertex_name not in name2id:
            name2id[dst_vertex_name] = id_cnt
            vertexes.append({
                'idx': id_cnt,
                'name': dst_vertex_name,
            })
            id_cnt += 1

        for src_str in grp[1].split(','):
            grp1 = src_str.replace(')\n', '').split('(')
            src_vertex_name = grp1[0].strip()
            edge_type = grp1[1].strip()

            if src_vertex_name not in name2id:
                name2id[src_vertex_name] = id_cnt
                vertexes.append({
                    'idx': id_cnt,
                    'name': src_vertex_name,
                })
                id_cnt += 1

            edges.append({
                'src': name2id[src_vertex_name],
                'dst': name2id[dst_vertex_name],
                'type': edge_type
            })
    
    dag = {
        'vertexes': vertexes,
        'edges': edges,
    }
    return json.dumps(dag, indent=None, separators=(',', ':'))

def process_dir(application_path):
    print('process db data: ' + application_path)
    file_candidates = list(filter(lambda name: name.endswith('.plan'), os.listdir(application_path)))
    if len(file_candidates) == 0:
        return
    plan_name = file_candidates[0]
    plan_path = os.path.join(application_path, plan_name)

    dag_json_path = os.path.join(application_path, 'output', 'Dag.json')

    if os.path.exists(dag_json_path):
        print('skip process')
        return

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

        # json_str = parse_dag_simple(plan_path)

        write_lines(dag_json_path, [json_str])

    except Exception as e:
        print(e)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Parse database meta files")
    parser.add_argument('-d', '--dataset', type=str, required=True)
    args = parser.parse_args()

    dataset = args.dataset

    data_path = os.path.join(ROOT_PATH, dataset)
    for name in os.listdir(data_path):
        process_dir(os.path.join(data_path, name))
