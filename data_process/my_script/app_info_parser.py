import argparse
import sys
import time
import json
import os

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.path.pardir)
sys.path.append(ROOT_PATH)

if __name__ == '__main__':
    from myio.common_io import write_lines

    parser = argparse.ArgumentParser(description="Extract app info files")
    parser.add_argument('-d', '--dataset', type=str, required=True)
    args = parser.parse_args()

    dataset = args.dataset

    DATA_PATH = os.path.join(ROOT_PATH, dataset)

    names = os.listdir(DATA_PATH)
    for name in names:
        try:
            start_time = time.time()

            example_path = os.path.join(DATA_PATH, name)

            out_app_filepath = os.path.join(example_path, 'output', 'AppInfo.json')
            if os.path.exists(out_app_filepath):
                print('skip', name)
                continue

            # init

            # info_file_path = os.path.join(example_path, 'info.json')
            # with open(info_file_path, 'r', encoding='utf-8') as fp:
            #     app_info = json.load(fp)
            app_info = {}

            # process tasks

            task_file_path = os.path.join(example_path, 'output', 'FullTask.json')
            with open(task_file_path, 'r', encoding='utf-8') as fp:
                tasks = json.load(fp)['changed']

            vertex_set = set()
            for task in tasks:
                vertex_set.add(task['vec_name'])
            app_info['vertices'] = list(vertex_set)

            machine_set = set()
            for task in tasks:
                machine_set.add(task['machine_id'])
            app_info['machines'] = list(machine_set)

            max_time = 0
            min_time = float("inf")
            for task in tasks:
                max_time = max(max_time, task['end_time'])
                min_time = min(min_time, task['start_time'])
            app_info['endTime'] = max_time
            app_info['startTime'] = min_time

            app_info['taskCnt'] = len(tasks)

            # save

            app_info_str = json.dumps(app_info, indent=None)
            print('write info file')
            write_lines(out_app_filepath, [app_info_str])

            print(f'generate {name} done in {round(time.time() - start_time, 3)} s')
        except Exception as e:
            print(e)
            print(f'generate {name} failed')


