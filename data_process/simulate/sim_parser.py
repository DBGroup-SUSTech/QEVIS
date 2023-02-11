import time
import json
import os
import re
import sys
from typing import List, Dict


FILE_ABS_PATH = os.path.dirname(__file__)
ROOT_PATH = os.path.join(FILE_ABS_PATH, os.pardir)
sys.path.append(ROOT_PATH)


from myio.common_io import read_lines_cond, write_lines


def is_useful_line(line: str) -> bool:
    return 'Profiling: Tez' in line \
           or line.startswith('Container: container_') \
           or ('[Fetcher_' in line and 'CloseInMemoryFile' not in line
               and 'close onDiskFile.' not in line
               and 'DiskToDiskMerger' not in line
               and 'Already shutdown.' not in line
               and 'Transfer rate (CumulativeDataFetched/TimeSinceInputStarted))' not in line
               and 'Starting inMemoryMerger\'s merge since' not in line
               and 'MemtoDiskMerger' not in line) \
           or 'Final Counters for attempt' in line \
           or 'All inputs fetched' in line \
           or 'TaskRunner2Result: TaskRunner2Result' in line


def parse_machine_line(line: str):
    match = re.match(r'Container: (.*) on (.*)[_:]\d*', line)
    container_id = match.group(1)
    machine_id = match.group(2)
    return container_id, machine_id


def parse_task_info_line(line: str):
    vector_name, vertex_parallelism, task_id = \
        re.findall(r'VectorName:(.*) VertexParallelism: (.*) TaskID: (.*)$', line)[0]
    return vector_name.strip(), vertex_parallelism.strip(), task_id.strip()


def get_time_ms(content: str) -> float:
    t, unit = re.findall(r'time (.*) (.s)', content.replace(':', ''))[0]
    if unit == 'ns':
        t = int(t) / 10 ** 6
    else:
        t = float(t)
    return t


def parse_info_part(line: str):
    if ' Profiling: Tez ' in line:
        return line.split(' Profiling: Tez ')[1].strip()
    elif '@FAKE' in line:
        return line
    else:
        match = re.match(r'.*] (\[.*]) .*\|:(.*)', line)
        fetcher = match.group(1).strip()
        rest = match.group(2).strip()
        return fetcher + ' ' + rest


def generate_sim_file(input_path, output_path):
    lines = read_lines_cond(input_path, is_useful_line)

    sim_lst: List[Dict] = []

    cur_vec = ''
    cur_task = ''
    cur_container = ''
    cur_machine = ''
    last_start_line_item = None

    for line, idx in zip(lines, range(len(lines))):
        if line.startswith('Container: container'):
            cur_container, cur_machine = parse_machine_line(line)
            continue

        if 'Container task starting at' in line:
            last_start_line_item = {
                'content': line,
                'container_id': cur_container,
                'machine_id': cur_machine       # set machine info in 'start' item
            }
            sim_lst.append(last_start_line_item)
            continue

        if 'Container task info:' in line:
            cur_vec, _, cur_task = parse_task_info_line(line)
            # fix task starting record
            last_start_line_item.update({
                'vec_name': cur_vec,
                'task_id': cur_task,
            })
            continue

        sim_lst.append({
            'content': line,
            'vec_name': cur_vec,
            'task_id': cur_task,
        })

    sim_lst.sort(key=lambda sim: sim['content'].split(' [INFO] ')[0])

    def get_time(idx):
        """ Return the time (in ms) in the record content. (include time offset fix) """
        time_str = sim_lst[idx]['content'].split(' [INFO] ')[0]
        time_str, fractional_str = time_str.split(',')
        tm_struct = time.strptime(time_str, "%Y-%m-%d %H:%M:%S")
        timestamp = time.mktime(tm_struct) + float('0.' + fractional_str)       # second
        # offset = 8 * 3600 * 1000        # ms
        offset = 0
        return timestamp * 1000 + offset

    # set timestamp
    for idx in range(len(sim_lst)):
        timestamp = get_time(idx)
        sim_lst[idx]['timestamp'] = timestamp

    # set start record of Sink
    idx = 0
    processed_tasks = set()
    while idx < len(sim_lst):
        sim_item = sim_lst[idx]
        content = sim_item['content']
        if '\'Sink\'' in content and 'take' in content \
                and 'initialization' not in content \
                and sim_item['task_id'] not in processed_tasks:
            processed_tasks.add(sim_item['task_id'])
            # insert a start value in sim_list
            target_timestamp = sim_item['timestamp'] - get_time_ms(content)
            preIdx = idx - 1
            while sim_lst[preIdx]['timestamp'] > target_timestamp:
                preIdx -= 1
            sim_lst.insert(preIdx + 1, {
                'content': f'\'Sink\' @FAKE start at time {target_timestamp} ms',
                'vec_name': sim_item['vec_name'],
                'task_id': sim_item['task_id'],
                'timestamp': target_timestamp,
            })
            idx += 1
        idx += 1

    # set eov
    visited_set = set()
    for sim_item in sim_lst[::-1]:
        vec_name = sim_item['vec_name']
        if vec_name not in visited_set:
            sim_item['eov'] = True
            visited_set.add(vec_name)

    # fix the content
    for idx in range(len(sim_lst)):
        content = sim_lst[idx]['content']
        sim_lst[idx]['content'] = parse_info_part(content)

    # generate sim_obj
    start_time, end_time = None, None
    try:
        start_time = re.findall(r'time (\d*) ms', sim_lst[0]['content'])[0]
        start_time = float(start_time)

        for i in range(len(sim_lst) - 1, -1, -1):
            m = re.findall(r'time (\d*) ms', sim_lst[i]['content'])
            if len(m) != 0:
                end_time = m[0]
                end_time = float(end_time)
                break
        if end_time is None:
            raise IndexError()

    except IndexError:
        sys.stderr.write('The first/last item doesn\'t contain time')
        exit(-1)

    sim_obj = {
        'start_time': start_time,
        'end_time': end_time,
        'time_cost': end_time - start_time,
        'sim': sim_lst
    }
    sim_str = json.dumps(sim_obj, indent=2)

    write_lines(output_path, [sim_str])


if __name__ == '__main__':

    DATA_SET = 'data'

    def gen_batch():
        names = list(os.listdir(os.path.join(ROOT_PATH, DATA_SET)))
        for name in names:
            start_time = time.time()

            example_path = os.path.join(ROOT_PATH, f'{DATA_SET}/{name}')
            log_file_name = list(filter(lambda path: '.log' in path, os.listdir(example_path)))[0]
            log_path = os.path.join(example_path, log_file_name)

            output_path = os.path.join(example_path, 'output')
            if not os.path.exists(output_path):
                os.mkdir(output_path)

            sim_path = os.path.join(example_path, 'output', 'SimulationFile.json')

            generate_sim_file(log_path, sim_path)
            print(f'generate {name} done in {round(time.time() - start_time, 3)} s')

    def simple_filter():
        example_path = os.path.join(ROOT_PATH, f'data2/Example10')
        log_file_name = list(filter(lambda path: '.log' in path, os.listdir(example_path)))[0]
        log_path = os.path.join(example_path, log_file_name)
        # draft_out_path = os.path.join(example_path, 'draft/lineorder.log')
        # draft_out_path = os.path.join(example_path, 'draft/fetch.log')
        draft_out_path = os.path.join(example_path, 'draft/counters.log')

        def is_useful(line):
            # return 'lineorder' in line

            # dev view for fetch
            # return line.startswith('Container: container_') \
            #        or ('[Fetcher_' in line and 'CloseInMemoryFile' not in line
            #            and 'close onDiskFile.' not in line
            #            and 'Transfer rate (CumulativeDataFetched/TimeSinceInputStarted))' not in line)

            # return ('[Fetcher_' in line or line.startswith('Container: container_') or 'VertexName' in line) \
            #        and 'Transfer rate (CumulativeDataFetched/TimeSinceInputStarted))' not in line

            # dev view for counters
            return 'Final Counters' in line

        lines = read_lines_cond(log_path, is_useful)
        write_lines(draft_out_path, lines)

    gen_batch()
    # simple_filter()
