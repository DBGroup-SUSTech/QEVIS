import time

import psutil


if __name__ == '__main__':
    # print(psutil.cpu_count(), psutil.cpu_count(logical=False))
    #
    # print(psutil.cpu_times())
    # # scputimes(user=403632.0624, system=262939.1875, idle=2280278.296875, interrupt=11644.65625, dpc=5771.203125)
    # # idle: cpu空闲的时间
    # # dpc: Deferred Procedure Call 延迟过程调用
    #
    # time.sleep(0.5)
    #
    # for x in range(1):
    #     print(psutil.cpu_percent(percpu=True))

    io_status = [metric for metric in psutil.disk_io_counters()]
    with open('./psutil_learn.py', 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
        print(lines)
    with open('./test.txt', 'w', encoding='utf-8') as fp:
        fp.writelines(lines)
    io_status2 = psutil.disk_io_counters(nowrap=True)
    print(io_status2)
    print([metric - saved for metric, saved in zip(io_status2, io_status)])

    # print(psutil.disk_io_counters(perdisk=True))

    # mem = psutil.virtual_memory()       # in bytes
    # print(mem)
    # print(mem.used / mem.total)
    # print(mem.total / 2 ** 30)
