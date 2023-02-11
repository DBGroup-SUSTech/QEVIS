import re
import sys
from collections import OrderedDict

from fsm.util.dict_util import dict_filter
from fsm.util.json_handler import JsonEncodable


class VecStep(JsonEncodable):

    def __init__(self):
        self.step_name = None
        self.attr_dict: OrderedDict = OrderedDict()

    def __repr__(self):
        return f'VecStep{{{self.step_name if self.step_name else "Unnamed step"}}}'

    def parse_normally(self, line0: str, line1: str):
        """
        Parse one step info from two str line.
        The data will be split by ',' and add to attr_dict
        """
        line0, line1 = line0.strip(), line1.strip() if line1 else line1

        def parse_first_line():
            step_name, label, _, estimation = re.findall(r'(.*)\s\[(.*)\](\s\((.*)\)|)', line0)[0]
            step_name = step_name.replace('<-', '')
            return step_name, label, estimation

        def parse_second_line() -> OrderedDict:
            ord_dict = OrderedDict()
            unnamed_idx = 0

            # special cases
            lstr = line1.replace('","', '"~"')     # replace all comma between [ and ].
            lstr = lstr.replace('),RS', ')~RS')
            lstr = lstr.replace("', '", "'~ '")

            for s in lstr.strip().split(','):
                if not s:
                    continue
                # replace them back
                s = s.replace('"~"', '"."')\
                    .replace(')~RS', '),RS')\
                    .replace("'~ '", "', '")
                if ':' in s:
                    # special cases like keys: keys:_col0, _col1, ...
                    special_break = False
                    for key_word in ['keys', 'PartitionCols']:
                        if key_word in s:
                            ord_dict[key_word] = lstr.split(key_word + ':')[1]
                            special_break = True
                            break
                    if special_break:
                        break
                    arr = s.split(':')
                    ord_dict[arr[0]] = arr[1]
                else:
                    ord_dict[f'@Attr_{unnamed_idx}'] = s
                    unnamed_idx += 1

            return ord_dict

        try:
            self.step_name, label, estimation = parse_first_line()
            self.attr_dict['@Estimation'] = estimation
            self.attr_dict['@Label'] = label
            if line1:
                self.attr_dict.update(parse_second_line())
        except IndexError as ie:
            sys.stderr.write(f'Error when parse {line0}, {line1}\n')
            sys.stderr.write(ie)
            self.step_name = '@Parse_error'
            self.attr_dict['@Error_info'] = str(ie)

    def parse_simply(self, step_name, line):
        self.step_name = step_name
        self.attr_dict['@Attr_0'] = line

    def to_dict(self) -> dict:
        return dict_filter(self.__dict__, ['step_name', 'attr_dict'])
