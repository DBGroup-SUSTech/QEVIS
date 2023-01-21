import argparse
import json
import os
import platform
import struct
import sys
import time
import socket
from typing import List, Tuple

import psutil


"""
V5
2021/3/10
"""


# MONITOR_ADDR = 'localhost:12000'

# REAL_START_TIME = 1606273098435000000 - 5 * 10 ** 9     # ns
REAL_START_TIME = -1  # use real time

INTERVAL = 0.2  # second


# MON_FILE_PATH = f'../data_local/Example3/monitor/{MACHINE_ID}.txt'
MON_PATH = None         # ../data_local/Example3/monitor_bin
# MACHINE_ID = ['dbg17_35901', 'dbg18_40517', 'dbg20_41869', 'dbg16_38165'][1]
MACHINE_ID = socket.gethostname()
MON_FILE = f'{MACHINE_ID}.mon'

# USE_BIN = False
USE_BIN = True


class HvMonitor:

    def __init__(self):
        psutil.cpu_percent(interval=None, percpu=True)      # first read is meaningless
        time.sleep(1)

    def monitor(self):
        if REAL_START_TIME <= 0:
            time_shift = 0
        else:
            time_shift = REAL_START_TIME - time.time_ns()

        # create path if not exist
        if not os.path.exists(MON_PATH):
            new_dir = True
            os.makedirs(MON_PATH)
        else:
            new_dir = False

        file_path = os.path.join(MON_PATH, MON_FILE)

        print(f"""
Monitor start
Record interval: {INTERVAL}
Output path: {file_path + (' (new dir)' if new_dir else '')}
Start time: {REAL_START_TIME if REAL_START_TIME > 0 else (str(time.time_ns()) + ' (current time)')}
Use binary file: {USE_BIN}
        """)

        mon_data = MonData(USE_BIN, file_path, True, time_shift)

        while True:
            mon_data.record()
            time.sleep(INTERVAL)


class MonData:

    TEST_IOSTAT_PATH = './iostat_out.txt'
    TEST_DISK_TYPE_PATH = './disk_type_out.txt'

    MEM_PARAM_NAMES = ['total', 'available', 'percent', 'used']
    # IOSTAT_PARAM_NAMES = ['diskName', 'rrqms', 'wrqms', 'rs', 'ws', 'rkBs', 'wkBs',
    #                       'avgrqSz', 'avgquSz', 'await', 'rAwait', 'wAwait', 'svctm', 'util']
    IOSTAT_PARAM_NAMES = ['diskName', 'rs', 'ws', 'rkBs', 'wkBs', 'rrqms', 'wrqms', 'rrqm', 'wrqm',
                          'rAwait', 'wAwait', 'aquSz', 'rareqSz', 'wareqSz', 'svctm', 'util']
    NET_IO_PARAM_NAMES = ['bytesSent', 'bytesRecv', 'packetsSent', 'packetsRecv',
                          'errin', 'errout', 'dropin', 'dropout']

    class ByteStream:
        def __init__(self, bytes_: bytes):
            self.__bytes = bytes_
            self.__ptr = 0
            self.__size = len(bytes_)

        def left(self):
            return self.__size - self.__ptr

        def next_struct(self, fmt: str) -> Tuple:
            size = struct.calcsize(fmt)
            self.__ptr += size
            return struct.unpack(fmt, self.__bytes[self.__ptr - size: self.__ptr])

        def next_str(self):
            str_len = self.next_struct('>i')[0]
            self.__ptr += str_len
            return self.__bytes[self.__ptr - str_len: self.__ptr].decode()

    def __init__(self, use_bin, file_path, write=False, time_shift=0):
        self.items = []
        self.use_bin = use_bin
        self.file_path = file_path
        self.disk_names = None

        if write:
            self.item_cnt = 0
            self.time_shift = time_shift
            # init the file
            with open(self.file_path, 'wb') as fp:
                pass

    def load(self):
        if self.use_bin:
            self._load_use_bin()
        else:
            self._load_use_utf()

    def record(self):
        """ Save record to file, then return it """
        if self.use_bin:
            return self._record_use_bin()
        else:
            return self._record_use_utf()

    def _record_use_utf(self):
        record = self._get_record()
        with open(self.file_path, 'a', encoding='utf-8') as fp:
            fp.write(json.dumps(record) + '\n')
        return record

    def _load_use_utf(self):
        with open(self.file_path, 'r', encoding='utf-8') as fp:
            lines = fp.readlines()
            json_str = '[\n'
            for i in range(len(lines)):
                json_str += lines[i] + (',' if i != len(lines) - 1 else '') + '\n'
            json_str += ']'
            self.items = json.loads(json_str)

    def _record_use_bin(self):
        record = self._get_record()

        per_cpu_percent = record['perCpuPercent']
        cpu_cnt = len(per_cpu_percent)
        mem_dict = record['mem']
        iostat_dict = record['iostat']
        disk_cnt = len(iostat_dict)

        arr = bytearray()

        # all diskName
        if not self.disk_names:
            arr += struct.pack('>2i', cpu_cnt, disk_cnt)
            self.disk_names = list(iostat_dict.keys())
            for disk_name in self.disk_names:
                arr += struct.pack('>i', len(disk_name))
                arr += disk_name.encode(encoding='utf-8')
        # timestamp, cpuCnt, perCpuPercent
        arr += struct.pack('>Q', record['timestamp'])
        arr += struct.pack(f'>{cpu_cnt}f', *per_cpu_percent)

        # memory
        for name in self.MEM_PARAM_NAMES:
            if name == 'percent':
                arr += struct.pack('>f', mem_dict[name])
            else:
                arr += struct.pack('>Q', mem_dict[name])

        # iostat
        for iostat in iostat_dict.values():
            for name in self.IOSTAT_PARAM_NAMES[1:]:
                if name == 'svctm':
                    continue
                arr += struct.pack('>f', iostat[name])
            type_ = iostat['type']
            arr += struct.pack('>i', len(type_))
            arr += type_.encode(encoding='utf-8')

        # net io
        net_io_dict = record['netIO']
        for name in self.NET_IO_PARAM_NAMES:
            arr += struct.pack('>Q', net_io_dict[name])

        with open(self.file_path, 'ab') as fp:
            fp.write(bytes(arr))

        return record

    def _load_use_bin(self):
        self.items = []
        with open(self.file_path, "rb") as fp:
            data = fp.read()

        bs = self.ByteStream(data)

        self.disk_names = []
        # cpuCnt, diskCnt, paramCnt
        cpu_cnt, disk_cnt = bs.next_struct('>2i')
        for i in range(disk_cnt):
            self.disk_names.append(bs.next_str())

        # item_cnt = bs.left() // (8 + cpu_cnt * 4 + 4 * (len(self.PARAM_NAMES) - 2) * disk_cnt)
        # for i in range(item_cnt):
        while bs.left() > 0:
            # timestamp, perCpuPercent
            timestamp, = bs.next_struct('>Q')
            per_cpu_percent = [round(f, 1) for f in bs.next_struct(f'>{cpu_cnt}f')]

            mem_dict = {}
            for name in self.MEM_PARAM_NAMES:
                if name == 'percent':
                    float_ = bs.next_struct('>f')[0]
                    mem_dict[name] = round(float_, 1)
                else:
                    mem_dict[name] = bs.next_struct('>Q')[0]

            # iostat: float * N
            iostat_dict = {}
            for disk_name in self.disk_names:
                iostat = {'diskName': disk_name}
                # remove diskName & svctm
                names = list(filter(lambda name: name != 'svctm', self.IOSTAT_PARAM_NAMES[1:]))
                floats = bs.next_struct(f'>{len(names)}f')
                for name, float_ in zip(names, floats):
                    if name == 'svctm':
                        continue
                    iostat[name] = round(float_, 2)
                iostat['type'] = bs.next_str()
                iostat_dict[disk_name] = iostat

            # net io: int * n
            net_io = {}
            integers = bs.next_struct(f'>{len(self.NET_IO_PARAM_NAMES)}Q')
            for name, integer in zip(self.NET_IO_PARAM_NAMES, integers):
                net_io[name] = integer

            self.items.append({
                'timestamp': timestamp,
                'perCpuPercent': per_cpu_percent,
                'mem': mem_dict,
                'iostat': iostat_dict,
                'netIO': net_io,
            })

    def _get_record(self):
        cur_time = time.time_ns() + self.time_shift

        per_cpu_percent = psutil.cpu_percent(interval=None, percpu=True)

        """
        memory info
        """
        mem_info = psutil.virtual_memory()
        mem_dict = {
            'total': mem_info.total,
            'available': mem_info.available,
            'percent': mem_info.percent,
            'used': mem_info.used
        }

        # disk_io_counters = psutil.disk_io_counters(perdisk=True)
        # disk_io_dict = {}
        # for disk_name, counters in disk_io_counters.items():
        #     disk_io_dict[disk_name] = {
        #         'readCount': disk_io_counters.read_count,
        #         'writeCount': disk_io_counters.write_count,
        #         'readBytes': disk_io_counters.read_bytes,
        #         'writeBytes': disk_io_counters.write_bytes,
        #         'readTime': disk_io_counters.read_time,
        #         'writeTime': disk_io_counters.write_time,
        #     }
        #     if platform.system() == 'Linux':
        #         disk_io_dict.update({
        #             'busyTime': disk_io_counters.busy_times,
        #         })

        """
        disk info from iostat & sys
        """

        if platform.system() == 'Linux':
            cmd_ret = os.popen('iostat -d -x')
            lines = cmd_ret.readlines()
        else:
            # for test
            lines = read_lines(self.TEST_IOSTAT_PATH)
        iostat_dict = {}
        for line in lines[3:]:
            line = line.replace('\r', '').replace('\n', '')
            if not line:
                continue
            params = list(filter(lambda param: param != '', line.split(' ')))
            iostat = {name: float(param) if name != 'diskName' else param
                      for name, param in zip(self.IOSTAT_PARAM_NAMES, params)}
            del iostat['svctm']     # useless
            iostat_dict[iostat['diskName']] = iostat

        if platform.system() == 'Linux':
            cmd_ret = os.popen('grep ^ /sys/block/*/queue/rotational')
            lines = cmd_ret.readlines()
        else:
            # for test
            lines = read_lines(self.TEST_DISK_TYPE_PATH)
        type_dict = {}
        for line in lines:
            line = line.replace('\r', '').replace('\n', '')
            if not line:
                continue
            s1, s2 = line.split(':', 1)
            # len('/sys/block/')=11, len('/queue/rotational')=17
            disk_name = s1[11:][:-17]
            type_ = 'ssd' if s2 == '0' else 'hdd'
            type_dict[disk_name] = type_
        for disk_name, disk_info in iostat_dict.items():
            if disk_name in type_dict:
                type_ = type_dict[disk_name]
            else:
                type_ = 'unknown'
                sys.stderr.write(f'Unknown disk type. disk_name={disk_name}')
            disk_info['type'] = type_

        """
        network info from psutil
        """

        counter = psutil.net_io_counters()
        net_io_dict = {
            'bytesSent': counter.bytes_sent,
            'bytesRecv': counter.bytes_recv,
            'packetsSent': counter.packets_sent,
            'packetsRecv': counter.packets_recv,
            'errin': counter.errin,
            'errout': counter.errout,
            'dropin': counter.dropin,
            'dropout': counter.dropout,
        }

        return {
            'timestamp': cur_time,
            'perCpuPercent': per_cpu_percent,
            'mem': mem_dict,
            # 'diskIODict': disk_io_dict,
            'iostat': iostat_dict,
            'netIO': net_io_dict,
        }


def read_lines(filename: str) -> List[str]:
    with open(filename, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
    return lines


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--path', type=str)
    args = parser.parse_args()

    if args.path is None:
        raise Exception('Must set the path of result')

    MON_PATH = args.path

    HvMonitor().monitor()
