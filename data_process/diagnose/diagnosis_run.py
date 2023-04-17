import argparse
import json
import os
import sys

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from diagnose import Diagnose
from myio.common_io import read_json_obj, write_lines

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Parse diagnose files")
    parser.add_argument('-d', '--dataset', type=str, required=True)
    args = parser.parse_args()

    dataset = args.dataset

    diagnose = Diagnose()

    indent = None

    data_folder = os.path.join(ROOT_PATH, dataset)
    for name in os.listdir(data_folder):
        print(name)

        out_file_path = os.path.join(data_folder, '{}/output/Diagnose.json'.format(name))
        if os.path.exists(out_file_path):
            print('skip')

        all_tasks_file_path = os.path.join(data_folder, '{}/output/FullTask.json'.format(name))
        if not os.path.exists(all_tasks_file_path):
            continue
        tasks_obj = read_json_obj(all_tasks_file_path)
        changed = tasks_obj["changed"]

        diagnose.initial(changed)
        vec_df, vec_machine_df = diagnose.diagnose_matrix_cal()

        diagnose_matrix = {
            "vec_df": json.loads(vec_df.sort_values(['duration_score'], ascending=(False)).to_json(orient="records")),
            "vec_machine_df": json.loads(
                vec_machine_df.sort_values(['duration_score'], ascending=(False)).to_json(orient="records"))
        }

        sim_str = json.dumps(diagnose_matrix, indent=indent)
        write_lines(out_file_path, [sim_str])

