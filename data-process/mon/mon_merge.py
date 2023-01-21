import json
import os
import sys

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from mon.monitor import MonData


def out_of_range(timestamp: float, start: float, end: float):
    return timestamp <= start - 5 * 10 ** 3 or timestamp >= end + 5 * 10 ** 3


def merge_data(example_path):
    MON_FILE_PATH = os.path.join(example_path, 'mon')
    SIM_FILE_PATH = os.path.join(example_path, 'output/SimulationFile.json')
    SIM_MON_PATH = os.path.join(example_path, 'output/MonitorFile.json')

    with open(SIM_FILE_PATH, 'r', encoding='utf-8') as fp:
        sim_obj = json.load(fp)

    merged = []
    skip = 0
    for mon_filename in os.listdir(MON_FILE_PATH):
        if not mon_filename.endswith('.mon'):
            continue
        file_path = os.path.join(MON_FILE_PATH, mon_filename)

        # check whether it use bin
        use_bin = True
        try:
            with open(file_path, 'r', encoding='utf-8') as fp:
                c = fp.read(1)
            use_bin = c != '{'
        except:
            pass

        mon_data = MonData(use_bin, file_path)
        mon_data.load()

        machine_id = mon_filename[:-4]  # mon_filename: <machine_id>.XXX
        mon_items = mon_data.items
        for item in mon_items:
            # check time
            if out_of_range(item['timestamp'] / 10 ** 6, sim_obj['start_time'], sim_obj['end_time']):
                skip += 1
                continue
            item['machineID'] = machine_id
            item['timestamp'] /= 10 ** 6  # ns -> ms
            merged.append(item)
    print(f'skip {skip}. left {len(merged)}')

    merged.sort(key=lambda item: int(item['timestamp']))
    with open(SIM_MON_PATH, 'w', encoding='utf-8') as fp:
        json.dump(merged, fp, indent=2)


if __name__ == '__main__':

    DATA_SET = 'data5'

    # names = [f'Example{i}' for i in [23]]
    # names = ['query5_0']
    names = list(os.listdir(os.path.join(ROOT_PATH, DATA_SET)))
    for name in names:
        example_path = os.path.join(ROOT_PATH, f'{DATA_SET}/{name}')
        print('merge mon data:', name)
        merge_data(example_path)
