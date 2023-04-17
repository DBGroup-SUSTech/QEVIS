import argparse
import os
import re
import sys
import textwrap
import time
from typing import Dict, Optional, List

import paramiko

FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)

from myio.common_io import read_lines, read_json_obj, read_json5_obj, write_json_obj, write_lines

MASTER_HOST = 'dbg03'


def main():
    parser = argparse.ArgumentParser(description="Execute hive query in batch and then collect monitor data and logs")
    parser.add_argument('-d', '--dataset', type=str, required=True,
                        help='dirname of dataset (required)')
    parser.add_argument('-b', '--batch-size', type=int, default=5,
                        help='batch count of queries to execute (default 5)')
    parser.add_argument('-w', '--wait-time', type=int, default=1 * 60,
                        help='waiting time for collecting logs in sec (default 60)')
    parser.add_argument('-t', '--task-filepath', type=str, required=True,
                        help='path of task description json file (required)')
    args = parser.parse_args()

    dataset = args.dataset
    batch_size = args.batch_size
    wait_time = args.wait_time
    task_filepath = args.task_filepath

    task_desc = read_json5_obj(task_filepath)
    hosts = task_desc['hosts']

    tasks = task_desc['tasks']

    for start in range(0, len(tasks), batch_size):
        batch_tasks: List = tasks[start: start + batch_size]

        for task in batch_tasks.copy():
            query_name = task['query_name']
            example_path = os.path.abspath(os.path.join(ROOT_PATH, dataset, query_name))
            if os.path.exists(example_path):
                if get_log_filename(example_path) is not None:
                    print(f"Skip {dataset}/{query_name} because example already exists.")
                    batch_tasks.remove(task)
            else:
                os.makedirs(example_path)

        # execute query tasks

        for task in batch_tasks:
            query_name = task['query_name']
            query_path = task['query_path']
            database = task['database']

            app_id = exe_query_and_monitor(dataset, query_name, query_path, database, hosts)
            task['app_id'] = app_id

        # collect logs for queries in this batch

        tasks_to_collect_log = [t for t in batch_tasks if t['app_id'] is not None]
        while len(tasks_to_collect_log) > 0:
            # wait
            print(f'Start waiting {wait_time} secs')
            time.sleep(wait_time)

            # collect log
            for task in tasks_to_collect_log.copy():
                query_name = task['query_name']
                database = task['database']
                app_id = task['app_id']

                collected = collect_log(dataset, query_name, app_id)

                if collected:
                    tasks_to_collect_log.remove(task)

        # collect plan, add set info and collect mon files

        tasks_to_collect_plan = [t for t in batch_tasks if t['app_id'] is not None]
        for task in tasks_to_collect_plan:
            query_name = task['query_name']
            database = task['database']
            query_path = task['query_path']
            app_id = task['app_id']

            collect_sql_and_plan(dataset, query_name, query_path, database)
            create_info_file(dataset, query_name, database, app_id)
            collect_mon_files(dataset, query_name)


def exec_and_wait(host, cmd) -> (str, str):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=22222)

    print(f"""=== exec cmd start ===
--- cmd ---
{textwrap.dedent(cmd)}""")
    sys.stdout.flush()

    cmd2 = '. ~/.zshrc\n' + cmd
    stdin, stdout, stderr = ssh.exec_command(cmd2, get_pty=True)
    while not stdout.channel.exit_status_ready():
        time.sleep(0.5)

    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()

    print(f"""--- out ---
{out}
--- err ---
{err}
=== exec cmd end ===
""")
    sys.stdout.flush()

    ssh.close()

    return out, err


def exec_without_close(host, cmd):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=22222)

    transport = ssh.get_transport()
    channel = transport.open_session()
    channel.get_pty()
    channel.set_combine_stderr(True)

    print(f"""=== exec without close start ===
--- cmd ---
{textwrap.dedent(cmd)}""")
    sys.stdout.flush()

    cmd2 = '. ~/.zshrc\n' + cmd
    channel.exec_command(cmd2)

    print(f"""=== exec without close end ===""")
    sys.stdout.flush()

    return channel


def get_log_filename(example_path: str) -> Optional[str]:
    log_filenames = list(filter(lambda path: '.log' in path, os.listdir(example_path)))
    if len(log_filenames) > 1:
        raise Exception(f"More than one log file exist in {example_path}")
    return None if len(log_filenames) == 0 else log_filenames[0]


def exe_query_and_monitor(dataset: str, query_name: str, query_path: str, database: str, hosts: [str]) -> Optional[str]:
    print(f'Start execute and monitor query {database}/{query_name}')

    ssh_list = start_monitor_scripts(hosts, query_name, dataset)
    app_id = exec_hive_query(query_name, query_path, database, dataset)
    stop_monitor_scripts(hosts, ssh_list)

    return app_id


def start_monitor_scripts(hosts: List[str], query_name: str, dataset: str) -> List:
    channel_list = []

    for host in hosts:
        print(f'Start monitor script on {host}')

        cmd = f"""
        cd ~/workspace/yzx_workspace/profiling/monitor_utils
        python3.7 monitor.py -p ../result/{dataset}/{query_name}
        """
        channel = exec_without_close(host, cmd)
        channel_list.append(channel)
    
    return channel_list


def stop_monitor_scripts(hosts: List[str], channel_list: List):
    for host, channel in zip(hosts, channel_list):
        print(f'Stop monitor script on {host}')
        channel.close()


def exec_hive_query(query_name: str, query_path: str, database: str, dataset: str) -> str:
    print(f'Execute query: {dataset}/{query_name} on {database}')

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(MASTER_HOST, port=22222)

    query_str = ''.join(read_lines(query_path))
    cmd = f'hive --database {database} -e "{query_str}" 1> /dev/null'

    out, err = exec_and_wait(MASTER_HOST, cmd)

    if 'Executing on YARN cluster with App id ' in out:
        m = re.search(r'\(Executing on YARN cluster with App id (.*)\)', out)
        app_id = m.group(1)
        print(f'Get app id: {app_id}')
    else:
        app_id = None
        print(f"Fail to get app id for query: {dataset}/{query_name} on {database}")

    ssh.close()

    return app_id


def collect_log(dataset: str, query_name: str, app_id: str) -> bool:
    print(f'Collect log for {dataset}/{query_name}: {app_id}')

    example_path = os.path.abspath(os.path.join(ROOT_PATH, dataset, query_name))
    out_log_filepath = os.path.abspath(os.path.join(example_path, f'{query_name}.log'))

    collect_cmd = f'yarn logs --applicationId {app_id} 1> {out_log_filepath}'
    out, err = exec_and_wait(MASTER_HOST, collect_cmd)

    return not ('Retrying connect to server:' in out)


def create_info_file(dataset: str, query_name: str, database: str, app_id: str):
    print(f'Create info meta file for {dataset}/{query_name}: {app_id}')

    example_path = os.path.abspath(os.path.join(ROOT_PATH, dataset, query_name))
    out_info_filepath = os.path.abspath(os.path.join(example_path, 'info.json'))
    info = {
        "appId": app_id,
        "database": database,
        "queryName": query_name,
        "dataset": dataset,
    }
    write_json_obj(out_info_filepath, info, indent=2)


def collect_sql_and_plan(dataset: str, query_name: str, query_path: str, database: str):
    print(f'Collect sql and plan for {dataset}/{query_name}')

    example_path = os.path.abspath(os.path.join(ROOT_PATH, dataset, query_name))
    out_sql_filepath = os.path.abspath(os.path.join(example_path, f'{query_name}.sql'))
    out_plan_filepath = os.path.abspath(os.path.join(example_path, f'{query_name}.plan'))

    # copy sql
    os.system(f'cp {query_path} {out_sql_filepath}')
    
    # save plan
    query_str = ''.join(read_lines(query_path))
    collect_cmd = f'hive --database {database} -e "explain {query_str}"'
    out, err = exec_and_wait(MASTER_HOST, collect_cmd)

    lines = out.split('\n')
    lines = [line for line in lines if 'Time taken' not in line]
    write_lines(out_plan_filepath, lines)


def collect_mon_files(dataset: str, query_name: str):
    print(f'Collect monitor files for {dataset}/{query_name}')

    example_path = os.path.abspath(os.path.join(ROOT_PATH, dataset, query_name))

    cmd = f"""
    cd ~/workspace/yzx_workspace/profiling/monitor_utils
    ./collector ../result/{dataset}/{query_name}
    mkdir {example_path}/mon
    mv ../result/{dataset}/{query_name}/*.mon {example_path}/mon
    """
    exec_and_wait(MASTER_HOST, cmd)


if __name__ == '__main__':
    main()
