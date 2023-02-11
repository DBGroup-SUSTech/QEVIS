import _thread
import json
import time
from typing import List, Dict

import requests

from fsm.fsm import FSM
from fsm.mon_fsm import MonFsm


class Simulator:

    DEFAULT_SIM_RATE = 1.0

    def __init__(self):
        self.sim_lst: List[Dict] = []
        self.mon_lst: List[Dict] = []
        self.with_mon: bool = True
        self.start_time: float = -1
        self.end_time: float = -1
        self.time_cost: float = -1

        self._sim_rate = self.DEFAULT_SIM_RATE

        # params for job
        self._fsm: FSM = FSM()
        self._mon_fsm: MonFsm = MonFsm()
        self._stop = True
        self.start_real_time = None

    def reset(self, sim_path, mon_path):
        self.stop_sim()

        with open(sim_path, 'r', encoding='utf-8') as fp:
            sim_obj = json.load(fp)
            self.sim_lst = sim_obj['sim']

        if mon_path is not None:
            with open(mon_path, 'r', encoding='utf-8') as fp:
                self.mon_lst = json.load(fp)
                self.with_mon = True
        else:
            print('WARNING: No monitor file')
            self.mon_lst = []
            self.with_mon = False

        self._fsm.reset()
        self._mon_fsm.reset()

    def get_rate(self):
        return self._sim_rate

    def set_rate(self, rate: float):
        self._sim_rate = rate

    def start_sim(self):
        self._stop = False
        _thread.start_new_thread(self._job, ())

    def stop_sim(self):
        self._stop = True

    def get_sim_time(self):
        if self._stop:
            return -1
        cur_real_time = time.time_ns() / 10 ** 6
        pass_sim_time = (cur_real_time - self.start_real_time) * self._sim_rate
        return self.start_time + pass_sim_time

    def get_log_incr(self):
        return self._fsm.get_incr_data(self._stop)

    def get_mon_incr(self):
        data = self._mon_fsm.get_incr_data()
        return {
            'sim_stop': self._stop,
            'data': data,
        }

    def get_fetch_incr(self):
        return self._fsm.get_incr_fetch_data()

    def _job(self):
        self.start_real_time = time.time_ns() / 10 ** 6

        if self.with_mon:
            sim_mon_lst = []
            sim_len, mon_len = len(self.sim_lst), len(self.mon_lst)
            sim_idx = mon_idx = 0
            while sim_idx < sim_len and mon_idx < mon_len:
                if mon_idx >= mon_len \
                        or self.sim_lst[sim_idx]['timestamp'] < self.mon_lst[mon_idx]['timestamp']:
                    sim_mon_lst.append(self.sim_lst[sim_idx])
                    sim_idx += 1
                else:
                    sim_mon_lst.append(self.mon_lst[mon_idx])
                    mon_idx += 1
        else:
            sim_mon_lst = self.sim_lst

        self.start_time = sim_mon_lst[0]['timestamp']
        self.end_time = sim_mon_lst[-1]['timestamp']
        self.time_cost = self.end_time - self.start_time

        print(f'\n>>> simulation starts. time_cost={self.time_cost / 1000}s, sim_rate={self._sim_rate}\n')

        print(f'start_time={self.start_time}')

        for cur_item in sim_mon_lst:
            cur_timestamp = cur_item['timestamp']
            real_time_threshold = (cur_timestamp - self.start_time) / self._sim_rate + self.start_real_time

            # wait until reached time_threshold
            while not self._stop and real_time_threshold > time.time_ns() / 10 ** 6:
                pass
            if self._stop:
                break

            # error check, ms
            # print(cur_item['timestamp'] - (time.time_ns() / 10 ** 6 - self.start_real_time + self.start_time))

            cur_type = 'mon' if 'machineID' in cur_item else 'sim'
            if cur_type == 'sim':
                # now simulate the update of this sim item
                self._fsm.update(cur_item)
                # print('.', end='')
            else:
                self._mon_fsm.update_mon(cur_item)

        # print(f'\n>>>error={(self.get_sim_time() - self.end_time) / 1000}')

        self._stop = True

        real_time_cost = time.time_ns() / 10 ** 6 - self.start_real_time
        sim_time_cost = self.time_cost / 1000
        print(f'\n>>> simulation ends. real_time_cost={real_time_cost / 1000}s. '
              f'sim_time_cost={sim_time_cost}s')
