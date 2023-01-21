import re

from fsm.util.dict_util import dict_filter
from fsm.util.json_handler import JsonEncodable


class HvEDat(JsonEncodable):

    def __init__(self, first_line: str):
        super().__init__()
        self.edge_type = self.__get_edge_type(first_line)

    def __repr__(self):
        return f'{self.__class__.__name__}({self.edge_type})'

    def __get_edge_type(self, first_line):
        """ Get the edge type from the first line """
        type_lst = re.findall(r'.*\[(.*)\].*', first_line)
        return 'UNKNOWN' if not type_lst else type_lst[0]

    def to_dict(self) -> dict:
        return dict_filter(self.__dict__, ['type', 'edge_type'])
