import re
import sys
from typing import List

from fsm.util.json_handler import JsonEncodable


class Step(JsonEncodable):
    # TYPE_DICT = {
    #     'Map': [
    #         'Initialization',
    #         'Input',
    #         'Processor',
    #         'Sink',
    #         'Spill'
    #     ],
    #     'Reducer': [
    #         'Initialization',
    #         'Shuffle',
    #         'Processor',
    #         'Sink',
    #         'Output'
    #     ]
    # }

    def __init__(self, task, task_type, step_type):
        self.task = task
        self.task_type = task_type  # Map / Reducer
        self.step_type = step_type  # Input / Sink ...
        self.value: float = 0  # the final time record of this step
        self.data_list: List[str] = []

    def __repr__(self):
        return f'Step{{{self.task_type}, {self.step_type}, {self.value}}}'

    def add_line(self, data):
        self.data_list.append(data)

    def compute_value(self) -> float:
        """
        Compute the value of this step according to self.data_list
        """
        self.value = 0

        if self.task_type == 'Map':
            if self.step_type in ['Input', 'Processor', 'Spill']:
                self.value += self.get_last_diff()
            if self.step_type in ['Initialization', 'Input', 'Sink', 'Spill']:
                self.value += self.get_last_take()
        elif self.task_type == 'Reducer':
            if self.step_type in ['Shuffle', 'Processor', 'Output']:
                self.value += self.get_last_diff()
            if self.step_type in ['Initialization', 'Sink', 'Output']:
                self.value += self.get_last_take()
        else:
            raise Exception(f'Unsupported task type: {self.task_type}')

        if self.value == 0:
            raise Exception(f'Fail to get value in step {self.step_type}'
                            f' in {self.task}')

        return self.value

    def get_last_take(self) -> float:
        """
        Return the data of last row which contains 'take'
        Is a double. Time unit is ms.
        """
        for data in self.data_list[::-1]:
            if 'take' in data:
                return float(self.parse_time(data))
        # sys.stderr.write(f'Warning: No line contains "take" '
        #                  f'for step {self.step_type} in {self.task}\n')
        return 0

    def get_last_diff(self) -> float:
        """
        Return the difference of last pair
        with label 'start'(or 'continuing') and 'end'

        Is an integer. Time unit is ns.
        Hence, return the value in ms
        """
        end_time = None
        for data in self.data_list[::-1]:
            if ('end' in data) \
                    and end_time is None:
                end_time = int(self.parse_time(data))
            elif ('start' in data or 'continuing' in data) \
                    and end_time is not None:
                start_time = int(self.parse_time(data))
                return (end_time - start_time) / 10 ** 6
        # sys.stderr.write(f'Warning: No valid "start"/"end" pair '
        #                  f'for step {self.step_type} in {self.task}\n')
        return 0

    def parse_time(self, data) -> str:
        """
        Get the time string from the data
        """
        data = data.replace(':', '')        # remove : after 'time'
        return re.findall(r'time\s(.*)\s', data)[0]

    def to_dict(self) -> dict:
        return self.__dict__
