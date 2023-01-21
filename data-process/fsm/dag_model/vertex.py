from fsm.util.json_handler import JsonEncodable


class Vertex(JsonEncodable):

    def __init__(self, idx: int, vdat = None):
        self.idx = idx
        self.out_edges = []
        self.in_edges = []
        self.vdat = vdat

    def __repr__(self):
        return f'vertex({self.idx},{self.vdat})'

    def to_dict(self):
        attr_list = ['idx', 'vdat']
        dic = {key: val for key, val in self.__dict__.items() if key in attr_list}
        return dic
