import time
import json
import os
import sys
import traceback

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from fsm.fsm import FSM
from fsm.mon_fsm import MonFsm
from myio.common_io import read_lines_cond, write_lines


def gen_all_tasks(sim_lst):
    fsm = FSM()
    fsm.set_compute_outlier(True)
    tot, i = len(sim_lst), 0
    div10 = int(tot / 10)
    cnt = 0
    try:
        for sim_item in sim_lst:
            if i % div10 == 0:
                print('.', end='')
                cnt += 1
            fsm.update(sim_item)
            i += 1
    except Exception as e:
        print(e)
        traceback.print_exc()
        print(sim_lst[i])
        sys.stderr.write('Parse error!\n')
    print()
    return fsm.get_incr_data(True), fsm.get_incr_fetch_data(), fsm.get_incr_outlier_data()


def gen_all_mons(mon_lst):
    mon_fsm = MonFsm()
    tot, i = len(mon_lst), 0
    div10 = int(tot / 10)
    cnt = 0
    try:
        for mon_item in mon_lst:
            if i % div10 == 0:
                print('.', end='')
                cnt += 1
            i += 1
            mon_fsm.update_mon(mon_item)
    except Exception as e:
        print(e)
        traceback.print_exc()
        print(mon_lst[i])
        sys.stderr.write('Parse error!\n')
    print()
    return mon_fsm.get_incr_data()


if __name__ == '__main__':
    indent = None

    DATA_SET = 'data5'

    def gen_batch():
        names = list(os.listdir(os.path.join(ROOT_PATH, DATA_SET)))
        names = ['Example19']
        for name in names:
            print('parse full task data:', name)
            start_time = time.time()

            example_path = os.path.join(ROOT_PATH, f'{DATA_SET}/{name}')

            out_path = os.path.join(ROOT_PATH, f'{DATA_SET}/{name}/output/')
            if not os.path.exists(out_path):
                os.makedirs(out_path)

            # all tasks

            sim_file_path = os.path.join(example_path, 'output/SimulationFile.json')
            if not os.path.exists(sim_file_path):
                continue

            print('processing', name, end=' ')

            with open(sim_file_path, 'r', encoding='utf-8') as fp:
                sim_obj = json.load(fp)
                sim_lst = sim_obj['sim']

            all_incr_data, all_incr_fetch_data, all_incr_outlier_data = gen_all_tasks(sim_lst)

            out_sim_file_path = os.path.join(out_path, 'FullTask.json')
            sim_str = json.dumps(all_incr_data, indent=indent)
            print('write sim file')
            write_lines(out_sim_file_path, [sim_str])

            out_fetch_file_path = os.path.join(out_path, 'FullFetch.json')
            fetch_str = json.dumps(all_incr_fetch_data, indent=indent)
            print('write fetch file')
            write_lines(out_fetch_file_path, [fetch_str])

            # out_outlier_file_path = os.path.join(out_path, 'FullOutlier.json')
            # outlier_str = json.dumps(all_incr_outlier_data, indent=indent)
            # print('write outlier file')
            # write_lines(out_outlier_file_path, [outlier_str])

            # all mons

            mon_file_path = os.path.join(example_path, 'output/MonitorFile.json')
            with open(mon_file_path, 'r', encoding='utf-8') as fp:
                mon_lst = json.load(fp)

            all_incr_mon_data = gen_all_mons(mon_lst)

            out_mon_file_path = os.path.join(out_path, 'FullMon.json')
            mon_str = json.dumps(all_incr_mon_data, indent=indent)
            print('write mon file')
            write_lines(out_mon_file_path, [mon_str])

            # print(len(all_incr_data['changed']))
            print(f'generate {name} done in {round(time.time() - start_time, 3)} s')

    gen_batch()
