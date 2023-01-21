from typing import List

from fsm.dag_model.edge import Edge
from fsm.dag_model.hv_vdat import HvVDat
from fsm.dag_model.vertex import Vertex
from fsm.util.json_handler import JsonEncodable


class Graph(JsonEncodable):

    def __init__(self, vdat_list: List[HvVDat] = None):
        self.vertexes = None
        if vdat_list:
            self.vertexes = [Vertex(idx, vdat) for idx, vdat in zip(range(len(vdat_list)), vdat_list)]
        self.edges = []

    def add_vertex(self, vdat=None):
        idx = len(self.vertexes)
        self.vertexes.append(Vertex(idx, vdat))

    def add_edge(self, frm_idx, to_idx, edat=None):
        if frm_idx > len(self.vertexes) - 1 or to_idx > len(self.vertexes) - 1:
            raise Exception('Vertex index out of bound')
        frm = self.vertexes[frm_idx]
        to = self.vertexes[to_idx]
        edge = Edge(frm, to, edat)
        self.edges.append(edge)
        frm.out_edges.append(edge)
        to.in_edges.append(edge)

    def get_vdat_at(self, v_idx: int):
        return self.vertexes[v_idx].vdat

    def get_vdat_list(self):
        return [vertex.vdat for vertex in self.vertexes]

    def get_precursors(self, idx) -> List[int]:
        """ Get all precursors (also in index) of the vertex with this idx """
        in_edges = self.vertexes[idx].in_edges
        return [edge.src.idx for edge in in_edges]

    def get_successors(self, idx) -> List[int]:
        """ Get all successors (also in index) of the vertex with this idx """
        out_edges = self.vertexes[idx].out_edges
        return [edge.dst.idx for edge in out_edges]

    def reverse_edge_list(self):
        """ Reverse edge list to make it easier to understand """
        self.edges = self.edges[::-1]

    def fix_duplicate_vertex(self):
        vec_list_dict = {}
        for vec in self.vertexes:
            if vec.vdat.hv_type not in ['Map', 'Reducer']:
                continue
            vec_name = vec.vdat.vertex_name
            if vec_name in vec_list_dict:
                vec_list_dict[vec_name].append(vec)
            else:
                vec_list_dict[vec_name] = [vec]

        vec_list_dict = {vec_name: vec_list for vec_name, vec_list
                         in vec_list_dict.items() if len(vec_list_dict) > 1}

        for vec_name, vec_list in vec_list_dict.items():

            # find the real one
            final_vec = None
            max_step_size = -1
            for vec in vec_list:
                if len(vec.vdat.step_list) > max_step_size:
                    max_step_size = len(vec.vdat.step_list)
                    final_vec = vec

            for vec in vec_list:
                if vec == final_vec:
                    continue
                # change all incoming edges of other vec
                for in_edge in vec.in_edges:
                    in_edge.dst = final_vec

                # change all outcoming edges of other vec
                for out_edge in vec.out_edges:
                    out_edge.src = final_vec

                self.vertexes.remove(vec)

    def to_dict(self) -> dict:
        dic = {
            'vertex_number': len(self.vertexes),
            'edge_number': len(self.edges),
            'vertexes': self.vertexes,
            'edges': self.edges
        }
        return dic
