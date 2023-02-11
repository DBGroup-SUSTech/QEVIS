import threading


class MonFsm:
    def __init__(self):
        self.mon_data_dict = {}     # machine_id -> mon_list
        self.lock = threading.Lock()

    def reset(self):
        self.mon_data_dict = {}

    def get_incr_data(self) -> dict:
        with self.lock:
            incr_ret = self.mon_data_dict
            self.mon_data_dict = {}
        return incr_ret

    def update_mon(self, mon_item: dict):
        machine_id = str(mon_item['machineID'])
        del mon_item['machineID']
        with self.lock:
            if machine_id in self.mon_data_dict:
                mon_list = self.mon_data_dict[machine_id]
            else:
                mon_list = []
                self.mon_data_dict[machine_id] = mon_list
            mon_list.append(mon_item)
