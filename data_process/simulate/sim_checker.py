import os
from typing import List

from myio.common_io import read_json_obj

FILE_ABS_PATH = os.path.dirname(__file__)
SERVER_PATH = os.path.join(FILE_ABS_PATH, os.path.pardir)


def list_all_machine(sim_filename: str) -> List[str]:
    sim_obj = read_json_obj(sim_filename)
    machine_set = set()
    for sim_item in sim_obj['sim']:
        machine_id = sim_item.get('machine_id')
        if machine_id is not None:
            machine_set.add(machine_id)
    return list(machine_set)


if __name__ == '__main__':
    SIM_FILE_PATH = os.path.join(SERVER_PATH, 'data_local/Example3/SimulationFile.json')
    print(list_all_machine(SIM_FILE_PATH))
