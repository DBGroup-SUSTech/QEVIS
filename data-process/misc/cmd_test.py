import os

from myio.common_io import read_lines

if __name__ == '__main__':
    # ret = os.popen('dir')
    # print(ret.readlines())

    lines = read_lines('../mon/iostat_out.txt')
    iostat_dict = {}
    for line in lines[3:]:
        line = line.replace('\r', '').replace('\n', '')
        if not line:
            continue
        params = list(filter(lambda param: param != '', line.split(' ')))
        print('>>>', params)
