from fsm.dag_model.vertex import Vertex
from fsm.util.json_handler import JsonEncodable


class Edge(JsonEncodable):

    def __init__(self, src: Vertex, dst: Vertex, edat=None):
        self.src = src
        self.dst = dst
        self.edat = edat

    def __repr__(self):
        return f'Edge({self.src.idx},{self.dst.idx},{self.edat})'

    def to_dict(self) -> dict:
        attr_list = ['src', 'dst']
        dic = {key: val.idx for key, val in self.__dict__.items() if key in attr_list}
        dic['edat'] = self.edat
        return dic
