# import argparse
# import json
# import os
# import platform
# import struct
# import threading
# import time
# from queue import Queue
# from socket import socket, AF_INET, SOCK_STREAM
# from typing import List, Tuple
#
# import psutil
#
#
# """
# V3
# 2021/3/8
# """
#
# MONITOR_ADDR = 'localhost:12000'
#
# # REAL_START_TIME = 1606273098435000000 - 5 * 10 ** 9     # ns
# REAL_START_TIME = -1  # use real time
#
# INTERVAL = 0.2  # second
#
# MACHINE_ID = ['dbg17_35901', 'dbg18_40517', 'dbg20_41869', 'dbg16_38165'][1]
# # MON_FILE_PATH = f'../data_local/Example3/monitor/{MACHINE_ID}.txt'
# MON_FILE_PATH = f'../data_local/Example3/monitor_bin/{MACHINE_ID}.bin'
#
# CORE_FILE_PATH = f'../data_local/Example3/core_use/{MACHINE_ID}.csv'
#
# # USE_BIN = False
# USE_BIN = True
#
#
# class HvMonitor:
#
#     def __init__(self):
#         psutil.cpu_percent(interval=None, percpu=True)      # first read is meaningless
#         time.sleep(1)
#
#     def monitor(self):
#         if REAL_START_TIME <= 0:
#             time_shift = 0
#         else:
#             time_shift = REAL_START_TIME - time.time_ns()
#
#         print(f"""
# Monitor start
# Record interval: {INTERVAL}
# Output path: {MON_FILE_PATH}
# Start time: {REAL_START_TIME if REAL_START_TIME > 0 else (str(time.time_ns()) + ' (current time)')}
# Use binary file: {USE_BIN}
#         """)
#
#         mon_data = MonData(USE_BIN, MON_FILE_PATH, True, time_shift)
#
#         while True:
#             mon_data.record()
#             time.sleep(INTERVAL)
#
#
# class MonData:
#
#     IOSTAT_PARAM_NAMES = ['diskName', 'rrqms', 'wrqms', 'rs', 'ws', 'rkBs', 'wkBs',
#                           'avgrqSz', 'avgquSz', 'await', 'rAwait', 'wAwait', 'svctm', 'util']
#     NET_IO_PARAM_NAMES = ['bytesSent', 'bytesRecv', 'packetsSent', 'packetsRecv',
#                           'errin', 'errout', 'dropin', 'dropout']
#
#     class ByteStream:
#         def __init__(self, bytes_: bytes):
#             self.__bytes = bytes_
#             self.__ptr = 0
#             self.__size = len(bytes_)
#
#         def left(self):
#             return self.__size - self.__ptr
#
#         def next_struct(self, fmt: str) -> Tuple:
#             size = struct.calcsize(fmt)
#             self.__ptr += size
#             return struct.unpack(fmt, self.__bytes[self.__ptr - size: self.__ptr])
#
#         def next_str(self):
#             str_len = self.next_struct('>i')[0]
#             self.__ptr += str_len
#             return self.__bytes[self.__ptr - str_len: self.__ptr].decode()
#
#     def __init__(self, use_bin, file_path, write=False, time_shift=0):
#         self.items = []
#         self.use_bin = use_bin
#         self.file_path = file_path
#         self.disk_names = None
#
#         if write:
#             self.item_cnt = 0
#             self.time_shift = time_shift
#             # init the file
#             with open(self.file_path, 'wb') as fp:
#                 pass
#
#     def load(self):
#         if self.use_bin:
#             self._load_use_bin()
#         else:
#             self._load_use_utf()
#
#     def record(self):
#         if self.use_bin:
#             self._record_use_bin()
#         else:
#             self._record_use_utf()
#
#     def _record_use_utf(self):
#         record = self._get_record()
#         with open(self.file_path, 'a', encoding='utf-8') as fp:
#             fp.write(json.dumps(record) + '\n')
#
#     def _load_use_utf(self):
#         with open(self.file_path, 'r', encoding='utf-8') as fp:
#             lines = fp.readlines()
#             json_str = '[\n'
#             for i in range(len(lines)):
#                 json_str += lines[i] + (',' if i != len(lines) - 1 else '') + '\n'
#             json_str += ']'
#             self.items = json.loads(json_str)
#
#     def _record_use_bin(self):
#         record = self._get_record()
#
#         per_cpu_percent = record['perCpuPercent']
#         cpu_cnt = len(per_cpu_percent)
#         iostat_dict = record['iostat']
#         disk_cnt = len(iostat_dict)
#
#         arr = bytearray()
#         # all diskName
#         if not self.disk_names:
#             arr += struct.pack('>2i', cpu_cnt, disk_cnt)
#             self.disk_names = list(iostat_dict.keys())
#             for disk_name in self.disk_names:
#                 arr += struct.pack('>i', len(disk_name))
#                 arr += disk_name.encode(encoding='utf-8')
#         # timestamp, cupCnt, perCpuPercent, memPercent
#         arr += struct.pack('>Q', record['timestamp'])
#         arr += struct.pack(f'>{cpu_cnt}f', *per_cpu_percent)
#         arr += struct.pack('>f', record['memPercent'])
#
#         # iostat
#         for iostat in iostat_dict.values():
#             for name in self.IOSTAT_PARAM_NAMES[1:]:
#                 if name == 'svctm':
#                     continue
#                 arr += struct.pack('>f', iostat[name])
#
#         # net io
#         net_io_dict = record['netIODict']
#         for name in self.NET_IO_PARAM_NAMES:
#             arr += struct.pack('>Q', net_io_dict[name])
#
#         with open(self.file_path, 'ab') as fp:
#             fp.write(bytes(arr))
#
#     def _load_use_bin(self):
#         self.items = []
#         with open(self.file_path, "rb") as fp:
#             data = fp.read()
#
#         bs = self.ByteStream(data)
#
#         self.disk_names = []
#         # cpuCnt, diskCnt, paramCnt
#         cpu_cnt, disk_cnt = bs.next_struct('>2i')
#         for i in range(disk_cnt):
#             self.disk_names.append(bs.next_str())
#
#         # item_cnt = bs.left() // (8 + cpu_cnt * 4 + 4 * (len(self.PARAM_NAMES) - 2) * disk_cnt)
#         # for i in range(item_cnt):
#         while bs.left() > 0:
#             # timestamp, perCpuPercent, memPercent
#             timestamp, = bs.next_struct('>Q')
#             per_cpu_percent = [round(f, 1) for f in bs.next_struct(f'>{cpu_cnt}f')]
#             mem_percent = round(bs.next_struct('>f')[0], 1)
#
#             # iostat: float * N
#             iostat_dict = {}
#             for disk_name in self.disk_names:
#                 iostat = {'diskName': disk_name}
#                 floats = bs.next_struct(f'>{len(self.IOSTAT_PARAM_NAMES) - 2}f')
#                 for name, float_ in zip(self.IOSTAT_PARAM_NAMES[1:], floats):
#                     if name == 'svctm':
#                         continue
#                     iostat[name] = round(float_, 1)
#                 iostat_dict[disk_name] = iostat
#
#             # net io: int * n
#             net_io = {}
#             integers = bs.next_struct(f'>{len(self.NET_IO_PARAM_NAMES)}Q')
#             for name, integer in zip(self.NET_IO_PARAM_NAMES, integers):
#                 net_io[name] = integer
#
#             self.items.append({
#                 'timestamp': timestamp,
#                 'perCpuPercent': per_cpu_percent,
#                 'memPercent': mem_percent,
#                 'iostat': iostat_dict,
#                 'netIO': net_io,
#             })
#
#     def _get_record(self):
#         cur_time = time.time_ns() + self.time_shift
#
#         per_cpu_percent = psutil.cpu_percent(interval=None, percpu=True)
#         mem_percent = psutil.virtual_memory().percent
#
#         # disk_io_counters = psutil.disk_io_counters(perdisk=True)
#         # disk_io_dict = {}
#         # for disk_name, counters in disk_io_counters.items():
#         #     disk_io_dict[disk_name] = {
#         #         'readCount': disk_io_counters.read_count,
#         #         'writeCount': disk_io_counters.write_count,
#         #         'readBytes': disk_io_counters.read_bytes,
#         #         'writeBytes': disk_io_counters.write_bytes,
#         #         'readTime': disk_io_counters.read_time,
#         #         'writeTime': disk_io_counters.write_time,
#         #     }
#         #     if platform.system() == 'Linux':
#         #         disk_io_dict.update({
#         #             'busyTime': disk_io_counters.busy_times,
#         #         })
#
#         """
#         disk info from iostat
#         """
#
#         if platform.system() == 'Linux':
#             cmd_ret = os.popen('iostat -d -x')
#             lines = cmd_ret.readlines()
#         else:
#             # for test
#             lines = read_lines('./iostat_out.txt')
#         iostat_dict = {}
#         for line in lines[3:]:
#             line = line.replace('\r', '').replace('\n', '')
#             if not line:
#                 continue
#             params = list(filter(lambda param: param != '', line.split(' ')))
#             iostat = {name: float(param) if name != 'diskName' else param
#                       for name, param in zip(self.IOSTAT_PARAM_NAMES, params)}
#             del iostat['svctm']     # useless
#             iostat_dict[iostat['diskName']] = iostat
#
#         """
#         network info from psutil
#         """
#
#         counter = psutil.net_io_counters()
#         net_io_dict = {
#             'bytesSent': counter.bytes_sent,
#             'bytesRecv': counter.bytes_recv,
#             'packetsSent': counter.packets_sent,
#             'packetsRecv': counter.packets_recv,
#             'errin': counter.errin,
#             'errout': counter.errout,
#             'dropin': counter.dropin,
#             'dropout': counter.dropout,
#         }
#
#         return {
#             'timestamp': cur_time,
#             'perCpuPercent': per_cpu_percent,
#             'memPercent': mem_percent,
#             # 'diskIODict': disk_io_dict,
#             'iostat': iostat_dict,
#             'netIODict': net_io_dict,
#         }
#
#     def find_closest(self, timestamp: int):
#         lo, hi = 0, len(self.items) - 1
#         while lo <= hi:
#             mi = (hi - lo) // 2 + lo
#             target = self.items[mi]
#             target_time = int(target['timestamp'])
#             if target_time < timestamp:
#                 lo = mi + 1
#             elif target_time > timestamp:
#                 hi = mi - 1
#             else:
#                 return target
#         return self.items[lo]   # approximate
#
#
# class CoreRecorder:
#
#     def __init__(self):
#         self.socket = socket(AF_INET, SOCK_STREAM)
#
#
#     def run(self):
#         try:
#             host, port = MONITOR_ADDR.split(':')
#             self.socket.bind((host, int(port)))
#             self.socket.listen(5)
#
#             print(f'CoreRecorder at {MONITOR_ADDR} start')
#             while True:
#                 client_socket, client_addr = self.socket.accept()
#                 recv_data = client_socket.recv(1024)
#                 recv = recv_data.decode('gbk')
#                 print('>>', recv)
#                 if recv.startswith('start'):
#                     # t = threading.Thread(target=self.monitor, args=())
#                     # t.start()
#                 elif recv.startswith('end'):
#                     self.queue.put('stop')
#                 client_socket.close()
#
#         except Exception as e:
#             print(e)
#         finally:
#             self.socket.close()
#
#
# def read_lines(filename: str) -> List[str]:
#     with open(filename, 'r', encoding='utf-8') as fp:
#         lines = fp.readlines()
#     return lines
#
#
# if __name__ == '__main__':
#     def monitor_thread():
#         HvMonitor().monitor()
#
#     def core_record_thread():
#         CoreRecorder().run()
#
#     threading.Thread(target=monitor_thread, args=())
#     threading.Thread(target=core_record_thread, args=())
