import os
import sys
from typing import Dict, Optional, List

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from myio.common_io import write_json5_obj, write_lines


def demo_1_25():
    hosts = [
        "dbg02",
        "dbg03",
        "dbg04",
        # "dbg05",
        "dbg07",
        "dbg08",
        "dbg09",
        # "dbg10",
    ]

    tasks = []
    for i in range(1, 25):
        task = {
            'query_name': f"Demo-Query{i}-0",
            'query_path': f"/home/zhengxin/env/GHiveUtils/hive-testbench/sample-queries-tpcds/query{i}.sql",
            'database': "tpcds_50"
        }
        tasks.append(task)

    task_desc = {
        'hosts': hosts,
        'tasks': tasks,
    }
    
    task_filename = 'demo-1-25.json5'
    
    write_json5_obj(task_filename, task_desc, indent=2)


if __name__ == '__main__':
    demo_1_25()
