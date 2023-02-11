import re
import sys
from typing import List

from py import std

from fsm.dag_model.vec_step import VecStep
from fsm.util.dict_util import dict_filter
from fsm.util.json_handler import JsonEncodable


class HvVDat(JsonEncodable):

    def __init__(self, block: List[str]):
        super().__init__()
        self.block = list(filter(lambda line: line.strip() != '', block))
        self.vertex_name = self.__get_vertex_name()

        self.hv_type = None
        if re.match(r'(Map\s\d+)|(Reducer\s\d+)', self.vertex_name):
            self.hv_type = self.vertex_name.split(' ')[0]

        self.step_list: List[VecStep] = self.__get_step_list()
        self.ind_level = self.cnt_indentation(self.block[0])

    def __repr__(self):
        return f'HvVDat({self.vertex_name})'

    def __get_vertex_name(self):
        """ Get the name from the first line """
        first_line = self.block[0]
        s = first_line.strip().replace('<-', '  ').replace('vectorized', '')
        if '[' in s:
            s = s.split('[', 2)[0]
        return s.strip()

    def __get_step_list(self) -> List[VecStep]:
        """
        Get the step list from self.block
        """
        steps = []
        block = self.block

        if 'Operator' in block[0]:
            idx = 0
        else:
            idx = 1
        block[0] = block[0].replace('<-', '  ')

        while idx < len(block):
            step = VecStep()

            # print(block[idx])

            if idx == len(block) - 1:
                # only last line
                line0, line1 = block[idx], None
                if 'Please refer' in line0:
                    step.parse_simply('@Refer', block[-1].strip())
                else:
                    step.parse_normally(line0, line1)
                idx += 1
            elif idx == len(block) - 2:
                # only last 2 lines
                line0, line1 = block[idx: idx + 2]
                step.parse_normally(line0, line1)
                idx += 2
            else:
                line0, line1, line2 = block[idx: idx + 3]
                # the cnt of blank at left
                cnt0, cnt1, cnt2 = [len(line) - len(line.lstrip())
                                    for line in block[idx: idx + 3]]

                if 'Please refer' in line2 or \
                        cnt0 + 2 == cnt1 == cnt2:
                    idx += 2
                    step.parse_normally(line0, line1)
                elif cnt0 + 2 == cnt1 == cnt2 - 2:
                    idx += 1
                    step.parse_normally(line0, None)
                else:
                    # error
                    sys.stderr.write('error step: \n' + ''.join(block[idx: idx + 3]))
                    idx += 1

            steps.append(step)

        return steps

    def cnt_indentation(self, line: str):
        """
        Return the number of indentation (count in space) of this line.
        If it startes with '<-', add 2 to the result.
        """
        striped = line.lstrip()
        cnt = len(line) - len(striped)
        if striped.startswith('<-'):
            cnt += 2
        return cnt

    def to_dict(self) -> dict:
        return dict_filter(self.__dict__, ['type', 'vertex_name', 'hv_type', 'step_list'])
