import time
import json
import os
import sys
import traceback

from fsm.fsm import FSM
from fsm.mon_fsm import MonFsm
from myio.common_io import write_lines


def gen_batch(begin, end, SERVER_PATH):
    # names = [f'Example{i}' for i in range(36, 38)]
    names = [f'Example{i}' for i in range(begin, end)]
    for name in names:
        start_time = time.time()

        example_path = os.path.join(SERVER_PATH, f'data3/{name}')

        out_path = os.path.join(SERVER_PATH, f'data3/{name}/output/')
        if not os.path.exists(out_path):
            os.makedirs(out_path)

        # init

        # info_file_path = os.path.join(example_path, 'info.json')
        # with open(info_file_path, 'r', encoding='utf-8') as fp:
        #     app_info = json.load(fp)
        app_info = {}

        # process tasks

        task_file_path = os.path.join(example_path, 'output/FullTask.json')
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

        out_mon_file_path = os.path.join(out_path, 'AppInfo.json')
        app_info_str = json.dumps(app_info, indent=None)
        print('write info file')
        write_lines(out_mon_file_path, [app_info_str])

        print(f'generate {name} done in {round(time.time() - start_time, 3)} s')


if __name__ == '__main__':
    FILE_ABS_PATH = os.path.dirname(__file__)
    SERVER_PATH = os.path.join(FILE_ABS_PATH, os.path.pardir)

    indent = None

    # gen_batch()
