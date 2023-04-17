import re
import sys
import threading
from typing import List, Dict

import numpy as np


class FSM:

    def __init__(self):
        self.changed_dict = {}              # clean after get
        self.buf_dict = {}
        self.tasks_dict = {}     # vertex name -> list of task_id
        self.counters = {}
        self.timestamp = 0      # timestamp of last update.

        self.fetch_incomplete_dict = {}

        self.fetch_changes = []             # clean after get
        # task_id -> end vertex input lst
        # represents vertex input of this task has been ended
        self.fetch_ends = {}
        # task_id -> map fetches
        self.task_to_map_fetches: Dict[str, List[Dict]] = {}

        self.to_compute_outlier = True
        self.outlier_changes = {}

        self.lock = threading.Lock()

    def reset(self):
        self.changed_dict = {}
        self.buf_dict = {}
        self.tasks_dict = {}
        self.counters = {}
        self.timestamp = 0

        self.fetch_changes = []
        self.fetch_ends = {}
        self.fetch_incomplete_dict = {}

        self.task_to_map_fetches = {}

    def set_compute_outlier(self, b: bool):
        self.to_compute_outlier = b

    def get_incr_data(self, sim_stop: bool) -> dict:
        with self.lock:
            changed_lst = list(self.changed_dict.values())
            self.changed_dict = {}
            # refresh incr list using buf
            for changed in changed_lst:
                task_id = changed['task_id']
                buf = self.buf_dict[task_id]
                changed['start_time'] = buf['task_start_time']
                if changed['end_time'] == -1:
                    changed['end_time'] = self.timestamp
                if 'fail' in buf:
                    changed['fail'] = True
                self._set_time_len_lst(changed, self.timestamp)
                self._set_step_info(changed, self.timestamp)
                self._change_step_5_to_3(changed)
        incr_ret = {
            'sim_stop': sim_stop,
            'changed': changed_lst,
        }
        return incr_ret

    def get_incr_fetch_data(self) -> dict:
        with self.lock:
            fetch_changes = self.fetch_changes
            self.fetch_changes = []
            fetch_ends = self.fetch_ends
            self.fetch_ends = {}
        incr_ret = {
            'changes': fetch_changes,
            'ends': fetch_ends
        }
        return incr_ret

    def get_incr_map_fetch_data(self) -> dict:
        with self.lock:
            task_to_map_fetches = self.task_to_map_fetches
            self.task_to_map_fetches = {}
        incr_ret = {
            'changes': task_to_map_fetches,
        }
        return incr_ret

    def get_incr_outlier_data(self) -> dict:
        with self.lock:
            outlier_changes = self.outlier_changes
            self.outlier_changes = {}
        return outlier_changes

    def update(self, sim_item: dict):
        with self.lock:
            timestamp = sim_item['timestamp']
            content = sim_item['content']
            vec_name = sim_item['vec_name']
            task_id = sim_item['task_id']

            self.timestamp = timestamp

            task = self._get_or_create_info(vec_name, task_id)
            self.changed_dict[task_id] = task
            if task_id not in self.buf_dict:
                self.buf_dict[task_id] = {'vec_name': vec_name}
                if vec_name not in self.tasks_dict:
                    self.tasks_dict[vec_name] = [task_id]
                else:
                    self.tasks_dict[vec_name].append(task_id)
            else:
                buf_item = self.buf_dict[task_id]
                task['container_id'] = buf_item['container_id']
                task['machine_id'] = buf_item['machine_id']

                # fix the fetch incomplete item
                if task_id in self.fetch_incomplete_dict:
                    # now task_id is the srcId
                    dst_task_id, pre_content, pre_timestamp = self.fetch_incomplete_dict[task_id]
                    del self.fetch_incomplete_dict[task_id]
                    self._update_fetch(dst_task_id, pre_content, pre_timestamp)

            if 'VertexParallelism' in content or 'InputReader' in content:
                pass    # do nothing
            elif content.startswith('[Fetcher_') or 'All inputs fetched for input vertex' in content \
                    or content.startswith('Processing split:'):
                # record of fetching;
                self._update_fetch(task_id, content, timestamp)
            elif 'TaskRunner2Result: TaskRunner2Result' in content:
                self._update_run_result(task_id, content)
                if 'eov' in sim_item:
                    task['eov'] = True
                    # if self.to_compute_outlier:
                    #     self._compute_outlier(vec_name)
            elif 'Container task starting' in content:
                buf_item = self.buf_dict[task_id]
                buf_item['task_start_time'] = self._get_time_ms(content)
                assert 'container_id' in sim_item and 'machine_id' in sim_item
                container_id, machine_id = sim_item['container_id'], sim_item['machine_id']
                # update data in buf for the rest of items
                buf_item['container_id'], buf_item['machine_id'] = container_id, machine_id
                # also update current task item in changed list
                task['container_id'], task['machine_id'] = container_id, machine_id
            elif 'Container task ending' in content:
                t = self._get_time_ms(content)
                self.buf_dict[task_id]['task_end_time'] = t
                task['end_time'] = t
            elif 'Final Counters for' in content:
                counter = self._parse_counters(content)
                task['counter'] = counter
                self.counters[task_id] = counter
            elif task['hv_type'] == 'Map':
                self._update_map_task(task_id, content, timestamp)
            elif task['hv_type'] == 'Reducer':
                self._update_reducer_task(task_id, content, timestamp)
            else:
                sys.stderr.write(f'Invalid sim_item : {sim_item}\n')

    def _get_or_create_info(self, vec_name, task_id):
        """
        Get task info from task_dict, or create a template dict
        """
        if task_id in self.changed_dict:
            task_info = self.changed_dict[task_id]
        else:
            task_info = {
                'vec_name': vec_name,
                'task_id': task_id,
                'machine_id': 'Unknown',
                'hv_type': self._get_hv_type(vec_name),
                'start_time': -1,
                'end_time': -1,
                'time_len': [0, 0, 0, 0, 0],
                'step_info': [0] * 10,
            }
        return task_info

    def _get_hv_type(self, vec_name: str):
        if 'Map' in vec_name:
            return 'Map'
        elif 'Reducer' in vec_name:
            return 'Reducer'
        else:
            return ''

    def _get_time_ms(self, content: str) -> float:
        t, unit = re.findall(r'time (.*) (.s)', content.replace(':', ''))[0]
        if unit == 'ns':
            t = int(t) / 10 ** 6
        else:
            t = float(t)
        return t

    def _update_fetch(self, dst_task_id, content, timestamp):
        buf_item = self.buf_dict[dst_task_id]
        # dst_vtx = buf_item['vec_name']
        # dst_container = buf_item['container_id']
        # dst_machine = buf_item['machine_id']

        if 'Completed fetch for attempt: ' in content:
            # parse data
            match = re.match(r'\[(.*)] Completed fetch for attempt: \{.*(attempt_.*)_\d{5}} to (.*), '
                             'csize=(.*),.*, EndTime=(.*), TimeTaken=(.*), Rate=(.*) MB/s',
                             content)
            names = ['label', 'src', 'type', 'csize', 'endTime', 'timeTake', 'rate']
            values = [match.group(i) for i in range(1, len(names) + 1)]
            data = {name: value for name, value in zip(names, values)}

            if data['type'] != 'DISK_DIRECT' and data['type'] != 'MEMORY':
                raise Exception(f'Unknown fetch type in content = {content}')

            # add more info
            src_task_id = data['src']

            if src_task_id not in self.buf_dict:
                self.fetch_incomplete_dict[src_task_id] = [dst_task_id, content, timestamp]
                return

            # src_buf_item = self.buf_dict[src_task_id]
            data.update({
                'label': 'NORMAL',
                'src': src_task_id,
                # 'srcVtxName': src_buf_item['vec_name'],
                # 'srcContainer': src_buf_item['container_id'],
                # 'srcMachine': src_buf_item['machine_id'],
                'dst': dst_task_id,
                # 'dstVtxName': dst_vtx,
                # 'dstContainer': dst_container,
                # 'dstMachine': dst_machine,
                # compute startTime, may be different for type MEMORY
                'startTime': int(data['endTime']) - int(data['timeTake']),
            })

            # fix num type
            data['csize'] = int(data['csize'])
            data['endTime'] = int(data['endTime'])
            data['rate'] = float(data['rate'])
            data['timeTake'] = float(data['timeTake'])

            self.fetch_changes.append(data)

        elif 'for url=' in content:
            # match = re.match(r'\[(.*)] for url=http://(.*):.*&map=(.*) sent hash and receievd', content)
            # label, src_machine = match.group(1), match.group(2)
            # for raw in match.group(3).split(','):
            #     src_task_id = re.match(r'.*(attempt_.*)_\d{5}', raw).group(1).strip()
            #     fetch_id = get_fetch_id(src_task_id, dst_task_id)
            #     data = {
            #         'label': label,
            #         'src': src_task_id,
            #         'srcMachine': src_machine,
            #         'dst': dst_task_id,
            #         'dstVtxName': dst_vtx,
            #         'dstContainer': dst_container,
            #         'dstMachine': dst_machine,
            #         'startTime': timestamp,          # endTime (3 more fields) is undefined
            #         'finished': False,
            #     }
            #     self.fetch_changes[fetch_id] = data
            pass
        
        elif 'Ignoring finished or obsolete source' in content:
            pass

        elif 'All inputs fetched' in content:
            src_vertex = content.split('for input vertex : ')[1].strip()        # all input from this vertex ended
            if dst_task_id in self.fetch_ends:
                self.fetch_ends[dst_task_id].append(src_vertex)
            else:
                self.fetch_ends[dst_task_id] = [src_vertex]

            if not content.startswith('[Fetcher_'):
                data = {
                    'label': 'ALL',
                    'srcVtxName': src_vertex,
                    'dst': dst_task_id,
                    # 'dstVtxName': dst_vtx,
                    # 'dstContainer': dst_container,
                    # 'dstMachine': dst_machine,
                    'endTime': timestamp,
                }
                self.fetch_changes.append(data)

        elif 'Processing split:' in content:
            # fetch data from hdfs (only for map)
            map_fetch = self._parse_map_fetch(content)
            map_fetch['timestamp'] = timestamp
            self.task_to_map_fetches.setdefault(dst_task_id, []).append(map_fetch)
        
        else:
            print('Parse fetch record failed. Ignored. Content:', content)

    def _update_run_result(self, task_id, content):
        result = re.match(r'.*TaskRunner2Result: TaskRunner2Result\{(.*)\}', content).group(1).strip()
        map_item = result.split(',')
        result_dict = {}
        for item in map_item:
            arr = item.split('=')
            result_dict[arr[0]] = arr[1]
        buf = self.buf_dict[task_id]
        buf['result'] = result_dict

        if result_dict['endReason'] != 'SUCCESS':
            buf['fail'] = True

    def _parse_counters(self, content):
        str_lst = content.split('[[', 1)[1].replace(']]', '', 1).split('][')
        counters = {}
        for s in str_lst:
            # print(s)
            # has some special cases
            if s.startswith('File System Counters '):
                s = s.split('File System Counters ', 1)[1]
            elif s.startswith('Shuffle Errors '):
                s = s.split('Shuffle Errors ', 1)[1]
            else:
                s = s.split(' ', 1)[1]
            for item in s.split(', '):
                name, value_str = item.split('=', 1)
                counters[name] = int(value_str)
        # if 'HDFS_BYTES_READ' not in counters:
        #     sys.stderr.write(f'Warning: NO HDFS_BYTES_READ\n')
        # target_names = [
        #     'FILE_BYTES_READ', 'FILE_BYTES_WRITTEN', 'HDFS_BYTES_READ',
        #     'INPUT_RECORDS_PROCESSED', 'OUTPUT_RECORDS',
        #     'INPUT_SPLIT_LENGTH_BYTES', 'OUTPUT_BYTES',
        #     'SHUFFLE_BYTES', 'SHUFFLE_BYTES_TO_MEM', 'SHUFFLE_BYTES_TO_DISK', 'SHUFFLE_BYTES_DISK_DIRECT'
        # ]
        # return {name: (counters[name] if name in counters else None) for name in target_names}
        return counters

    def _parse_map_fetch(self, content):
        """
        content example:
        2022-10-07 05:30:45,683 [INFO] [TezChild] |lib.MRReaderMapred|: Processing split: TezGroupedSplit{wrappedSplits=[org.apache.hadoop.mapred.TextInputFormat:hdfs://dbg03:9000/tmp/tpcds-generate/100/catalog_sales/data-m-00045:0+134217728, org.apache.hadoop.mapred.TextInputFormat:hdfs://dbg03:9000/tmp/tpcds-generate/100/catalog_sales/data-m-00045:134217728+134217728], wrappedInputFormatName='org.apache.hadoop.hive.ql.io.HiveInputFormat', locations=[dbg07], rack='null', length=268435456}
        """
        # we don't store block names for now
        # extract list of split data from wrappedSplits
        # split_data = content.split('wrappedSplits=[', 1)[1].split('], wrappedInputFormatName=', 1)[0].split(', ')
        # clean up split data, and get split description like catalog_sales/data-m-00045:0+134217728
        # blocks = [re.match(r'.*/(.+/data-m-.+)$', s).group(1).strip() for s in split_data]

        # extract list locations
        locations = content.split('locations=[', 1)[1].split('], rack=', 1)[0].split(', ')
        # extract length
        length = int(content.split('length=', 1)[1].split('}', 1)[0])
        return {
            # 'blocks': blocks,
            'locations': locations,
            'length': length,
        }

    def _compute_outlier(self, vtx_name):
        tasks = self.tasks_dict[vtx_name]

        # for v: {'step0', ..., 'tot'} -> boxplot_info
        # for vm: machine -> {'step0', ..., 'tot'} -> boxplot_info
        outlier_item = {'v': {}, 'vm': {}}

        records = []
        for task_id in tasks:
            buf = self.buf_dict[task_id]
            records.append({
                'task_id': task_id,
                'machine': buf['machine_id'],
                'step_info': [0] * 10,
                'hv_type': self._get_hv_type(buf['vec_name']),
                'start': buf['task_start_time'],
                'end': buf['task_end_time'],
            })

        # reuse func to set step info
        for record in records:
            self._set_step_info(record, None)

        # for record in records:
        #     lst = record['step_info']
        #     for i in range(5):
        #         if lst[2 * i + 1] < lst[2 * i]:
        #             print("step error, < 0")

        def get_boxplot_info(lst: List) -> List:
            """ The info to draw boxplot and find the outlier """
            arr = np.array(lst)
            q1, q3 = np.quantile(arr, 0.25), np.quantile(arr, 0.75)
            iqr = q3 - q1
            min_, max_ = np.min(lst), np.max(lst)
            o0, o1 = max(q1 - 1.5 * iqr, min_), min(q3 + 1.5 * iqr, max_)
            median = np.median(lst)
            return [o0, q1, median, q3, o1]

        # for v, step0-4
        for step_idx in range(5):
            # cnt = 0
            step_times = []
            for record in records:
                si = record['step_info']
                if si[step_idx + 1] is None or si[step_idx] is None:
                    sys.stderr.write(f'step info error {record}\n')
                step_times.append(si[2 * step_idx + 1] - si[2 * step_idx])
                if si[2 * step_idx + 1] - si[2 * step_idx] < 0:         # DEBUG
                    sys.stderr.write(f'{step_idx}, {record}')
            bp_info = get_boxplot_info(step_times)
            outlier_item['v'][f'step{step_idx}'] = bp_info
            # print(f'v: step_idx={step_idx}, {cnt} out of {len(records)}')

        # for v, tot
        tot_times = [r['end'] - r['start'] for r in records]
        bp_info = get_boxplot_info(tot_times)
        outlier_item['v']['tot'] = bp_info

        machine2records = {}
        for r in records:
            machine = r['machine']
            if machine in machine2records:
                machine2records[machine].append(r)
            else:
                machine2records[machine] = [r]
                outlier_item['vm'][machine] = {}

        # for vm
        for machine, m_records in machine2records.items():
            # step0-4
            for step_idx in range(5):
                step_times = []
                for record in m_records:
                    si = record['step_info']
                    step_times.append(si[2 * step_idx + 1] - si[2 * step_idx])
                bp_info = get_boxplot_info(step_times)
                outlier_item['vm'][machine][f'step{step_idx}'] = bp_info

            # tot
            tot_times = [r['end'] - r['start'] for r in m_records]
            bp_info = get_boxplot_info(tot_times)
            outlier_item['vm'][machine]['tot'] = bp_info

        self.outlier_changes[vtx_name] = outlier_item

    def _update_map_task(self, task_id, content, timestamp):
        step_name = re.findall(r'\'(.*)\'', content)[0].strip()
        t = self._get_time_ms(content)

        buf: dict = self.buf_dict[task_id]

        def get_or_default(key: str):
            if key in buf:
                return buf[key]
            ret = {}
            buf[key] = ret
            return ret

        if step_name == 'Initialization':
            buf_item = get_or_default('Initialization')
            if 'starting' in content:
                buf_item['start_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            elif 'take' in content:
                buf_item['take_time'] = t
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Input':
            buf_item = get_or_default('Input')
            if 'starting' in content:
                buf_item['start_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            elif 'take' in content:
                buf_item['take_time'] = t
                buf_item['_take_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Processor':
            buf_item = get_or_default('Processor')
            if 'starting' in content:
                buf_item['start_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Sink':
            buf_item = get_or_default('Sink')
            if '\'Sink\' @FAKE start' in content:
                buf_item['_start_timestamp'] = timestamp
            elif 'take' in content:
                buf_item['take_time'] = t
                if 'initialization' not in content:     # as @FAKE not use init to do offset
                    buf_item['_end_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Spill':
            buf_item = get_or_default('Spill')
            # if 'starting' in content:
            #     buf_item['start_time'] = t
            # elif 'finished' in content:
            #     buf_item['finished_time'] = t
            # elif 'take' in content:
            #     buf_item['take_time'] = t
            # elif 'continuing' in content:
            #     buf_item['con_time'] = t
            # elif 'ending' in content:
            #     buf_item['end_time'] = t
            # else:
            #     sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

            if 'continuing' in content:
                buf_item['con_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            elif 'start' in content or 'end' in content or 'finish' in content:
                pass
            elif 'take' in content:
                buf_item['take_time'] = t
                buf_item['_take_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

    def _update_reducer_task(self, task_id, content, timestamp):
        step_name = re.findall(r'\'(.*)\'', content)[0].strip()
        t = self._get_time_ms(content)

        buf: dict = self.buf_dict[task_id]

        def get_or_default(key: str):
            if key in buf:
                return buf[key]
            ret = {}
            buf[key] = ret
            return ret

        if step_name == 'Initialization':
            buf_item = get_or_default('Initialization')
            if 'starting' in content:
                buf_item['start_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            elif 'take' in content:
                buf_item['take_time'] = t
                buf_item['_take_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Shuffle':
            buf_item = get_or_default('Shuffle')
            if 'starting' in content:
                buf_item['start_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Processor':
            buf_item = get_or_default('Processor')
            if 'starting' in content:
                buf_item['start_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Sink':
            buf_item = get_or_default('Sink')
            if '\'Sink\' @FAKE start' in content:
                buf_item['_start_timestamp'] = timestamp
            elif 'take' in content:
                buf_item['take_time'] = t
                if 'initialization' not in content:
                    buf_item['_end_timestamp'] = timestamp
            elif 'start' in content or 'end' in content:
                pass
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

        elif step_name == 'Output':
            buf_item = get_or_default('Output')
            # if 'starting' in content:
            #     buf_item['start_time'] = t
            # elif 'finished' in content:
            #     buf_item['finished_time'] = t
            # elif 'take' in content:
            #     buf_item['take_time'] = t
            # elif 'continuing' in content:
            #     buf_item['con_time'] = t
            # elif 'ending' in content:
            #     buf_item['end_time'] = t
            # else:
            #     sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

            if 'continuing' in content:
                buf_item['con_time'] = t
                buf_item['_start_timestamp'] = timestamp
            elif 'ending' in content:
                buf_item['end_time'] = t
                buf_item['_end_timestamp'] = timestamp
            elif 'start' in content or 'end' in content or 'finish' in content:
                pass
            elif 'take' in content:
                buf_item['take_time'] = t
                buf_item['_take_timestamp'] = timestamp
            else:
                sys.stderr.write(f'Update failed. content is >>>\n{content}\n>>>\n')

    def _set_time_len_lst(self, changed_item, sim_time: float):
        buf = self.buf_dict[changed_item['task_id']]
        time_len_lst = changed_item['time_len']
        item_type = changed_item['hv_type']

        if item_type == 'Map':

            if 'Initialization' in buf:
                buf_item = buf['Initialization']
                value = 0.0
                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                time_len_lst[0] = value

            if 'Input' in buf:
                buf_item = buf['Input']
                value = 0.0
                if 'end_time' in buf_item:
                    value += buf_item['end_time'] - buf_item['start_time']
                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                time_len_lst[1] = value

            if 'Processor' in buf:
                buf_item = buf['Processor']
                value = 0.0
                if 'end_time' in buf_item:
                    value += (buf_item['end_time'] - buf_item['start_time']) if 'start_time' in buf_item else 0
                elif 'start_time' in buf_item:
                    value += sim_time - buf_item['_start_timestamp']
                time_len_lst[2] = value

            if 'Sink' in buf:
                buf_item = buf['Sink']
                value = 0.0
                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                time_len_lst[3] = value

            if 'Spill' in buf:
                buf_item = buf['Spill']
                value = 0.0

                # if 'take_time' in buf_item:
                #     value += buf_item['take_time']
                #     if 'end_time' in buf_item:
                #         value += buf_item['end_time'] - buf_item['con_time']
                # elif 'finished_time' in buf_item:
                #     value += buf_item['finished_time'] - buf_item['start_time']

                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                if 'con_time' in buf_item and 'end_time' in buf_item:
                    value += buf_item['end_time'] - buf_item['con_time']
                time_len_lst[4] = value

        elif item_type == 'Reducer':

            if 'Initialization' in buf:
                buf_item = buf['Initialization']
                value = 0.0
                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                time_len_lst[0] = value

            if 'Shuffle' in buf:
                buf_item = buf['Shuffle']
                value = 0.0
                if 'end_time' in buf_item:
                    value += buf_item['end_time'] - buf_item['start_time']
                time_len_lst[1] = value

            if 'Processor' in buf:
                buf_item = buf['Processor']
                value = 0.0
                if 'end_time' in buf_item:
                    value += (buf_item['end_time'] - buf_item['start_time']) if 'start_time' in buf_item else 0
                elif 'start_time' in buf_item:
                    value += sim_time - buf_item['_start_timestamp']
                time_len_lst[2] = value

            if 'Sink' in buf:
                buf_item = buf['Sink']
                value = 0.0
                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                time_len_lst[3] = value

            if 'Output' in buf:
                buf_item = buf['Output']
                value = 0.0

                # if 'take_time' in buf_item:
                #     value += buf_item['take_time']
                #     if 'end_time' in buf_item:
                #         value += buf_item['end_time'] - buf_item['con_time']
                # elif 'finished_time' in buf_item:
                #     value += buf_item['finished_time'] - buf_item['start_time']

                if 'take_time' in buf_item:
                    value += buf_item['take_time']
                if 'con_time' in buf_item and 'end_time' in buf_item:
                    value += buf_item['end_time'] - buf_item['con_time']
                time_len_lst[4] = value

        else:
            raise Exception('Unsupported item type')

    def _set_step_info(self, changed_item, sim_time: float):
        buf = self.buf_dict[changed_item['task_id']]
        step_info_lst = changed_item['step_info']
        item_type = changed_item['hv_type']

        if item_type == 'Map':

            if 'Initialization' in buf:
                buf_item = buf['Initialization']
                if '_start_timestamp' in buf_item:
                    step_info_lst[0] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[1] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[1] = sim_time
                else:
                    step_info_lst[0] = 0

            if 'Input' in buf:
                buf_item = buf['Input']
                if '_start_timestamp' in buf_item:
                    step_info_lst[2] = buf_item['_start_timestamp']
                    if '_take_timestamp' in buf_item:
                        step_info_lst[3] = buf_item['_take_timestamp']
                    elif '_end_timestamp' in buf_item:
                        step_info_lst[3] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[3] = sim_time
                else:
                    step_info_lst[2] = 0

            if 'Processor' in buf:
                buf_item = buf['Processor']
                if '_start_timestamp' in buf_item:
                    step_info_lst[4] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[5] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[5] = sim_time
                else:
                    step_info_lst[4] = 0

            if 'Sink' in buf:
                buf_item = buf['Sink']
                if '_start_timestamp' in buf_item:
                    step_info_lst[6] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[7] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[7] = sim_time
                else:
                    step_info_lst[6] = 0

            if 'Spill' in buf:
                buf_item = buf['Spill']
                if '_start_timestamp' in buf_item:
                    step_info_lst[8] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[9] = buf_item['_end_timestamp']
                    elif '_take_timestamp' in buf_item:
                        step_info_lst[9] = buf_item['_take_timestamp']
                    else:
                        step_info_lst[9] = sim_time
                else:
                    step_info_lst[8] = 0

        elif item_type == 'Reducer':

            if 'Initialization' in buf:
                buf_item = buf['Initialization']
                if '_start_timestamp' in buf_item:
                    step_info_lst[0] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[1] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[1] = sim_time
                else:
                    step_info_lst[0] = 0

            if 'Shuffle' in buf:
                buf_item = buf['Shuffle']
                if '_start_timestamp' in buf_item:
                    step_info_lst[2] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[3] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[3] = sim_time
                else:
                    step_info_lst[2] = 0

            if 'Processor' in buf:
                buf_item = buf['Processor']
                if '_start_timestamp' in buf_item:
                    step_info_lst[4] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[5] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[5] = sim_time
                else:
                    step_info_lst[4] = 0

            if 'Sink' in buf:
                buf_item = buf['Sink']
                if '_start_timestamp' in buf_item:
                    step_info_lst[6] = buf_item['_start_timestamp']
                    if '_end_timestamp' in buf_item:
                        step_info_lst[7] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[7] = sim_time
                else:
                    step_info_lst[6] = 0

            if 'Output' in buf:
                buf_item = buf['Output']
                if '_start_timestamp' in buf_item:
                    step_info_lst[8] = buf_item['_start_timestamp']
                    if '_take_timestamp' in buf_item:
                        step_info_lst[9] = buf_item['_take_timestamp']
                    elif '_end_timestamp' in buf_item:
                        step_info_lst[9] = buf_item['_end_timestamp']
                    else:
                        step_info_lst[9] = sim_time
                else:
                    step_info_lst[8] = 0

        else:
            raise Exception('Unsupported item type')

        if 'fail' in buf:
            for i in range(0, len(step_info_lst), 2):
                if step_info_lst[i] is None:
                    step_info_lst[i] = 0
            for i in range(1, len(step_info_lst), 2):
                if step_info_lst[i] is None:
                    step_info_lst[i] = step_info_lst[i - 1]

        # if not sim_time:
        #     print('>>', changed_item)

    def _change_step_5_to_3(self, changed):
        si = changed['step_info']
        step_info = [
            # input
            min(si[0], si[2]),
            max(si[1], si[3]),
            # process
            si[4],
            si[5],
            # output
            min(si[6], si[8]),
            max(si[7], si[9]),
        ]
        time_len = [
            step_info[1] - step_info[0],
            step_info[3] - step_info[2],
            step_info[5] - step_info[4],
        ]
        changed['step_info'] = step_info
        changed['time_len'] = time_len
