import json
import re
from typing import List

from fsm.dag_model.graph import Graph
from fsm.dag_model.hv_edat import HvEDat
from fsm.dag_model.hv_vdat import HvVDat
from myio.common_io import read_lines, write_lines
from fsm.util.json_handler import MyJsonEncoder


def get_block(lines: List[str], line_idx):
    """
    Get a raw data block from the buttom to the top.
    Then return the line idx above this block.
    The block start with a '<-' and end at line_cnt.
    Return ([], -2) if no such block
    """

    def condition(line_idx_):
        """ The condition to determine whether it is the first line of a block """
        str_ = lines[line_idx_].strip()
        if str_.startswith('<-'):
            return True
        if line_idx_ > 0:
            last_line = lines[line_idx_ - 1]
            if last_line.strip().startswith('Stage'):
                return True
        return False

    ret = []
    idx = line_idx

    for _ in range(line_idx + 1):
        line = lines[idx]
        if line.strip().startswith('Stage'):
            break
        ret.insert(0, line)
        if condition(idx):
            # get a block
            return ret, idx - 1
        idx -= 1

    # no valid block found
    return [], -2


def get_all_vdat(lines: List[str]) -> List[HvVDat]:
    """
    Generate all vertex data from string list.
    Read the date from the buttom to the top, get all blocks and generate vdat.
    Notice that the vdat are ranked by ind_level in decrease
    """
    vdat_lst: List[HvVDat] = []
    line_idx = len(lines) - 1  # backwards iterate

    while True:
        block, line_idx = get_block(lines, line_idx)
        if line_idx < 0:
            break  # no more valid block
        hv_vdat = HvVDat(block)
        vdat_lst.append(hv_vdat)

    return vdat_lst


def translate_refer_label(vdat_list: List[HvVDat]):
    ref_dict = {}
    for vdat in vdat_list[::-1]:
        for step in vdat.step_list[::-1]:
            if step.step_name != '@Refer':
                label = step.attr_dict['@Label']
                ref_dict[label] = step
            else:
                ref = step.attr_dict['@Attr_0']
                ref = re.findall(r'.*\[(.*)\].*', ref)[0]
                ref_step = ref_dict[ref]
                if ref_step:
                    step.step_name = ref_step.step_name
                    step.attr_dict = ref_step.attr_dict.copy()
                    step.attr_dict['@Refer'] = True
                else:
                    step.attr_dict['@Attr_1'] = 'Can\'t find the refer step'


def generate_dag(vdat_list: List[HvVDat]) -> Graph:
    """
    Generate DAG according to the vdata_list.
    """
    if not vdat_list:
        raise Exception('vdat list is empty!')

    vdat_list = list(filter(lambda vdat: 'Please refer to' not in vdat.block[0], vdat_list))

    idx = len(vdat_list) - 1
    graph = Graph(vdat_list)  # create a new graph using vdat list
    last_idx = idx
    last_lv = vdat_list[last_idx].ind_level

    # iterate vdat_list backwards (i.e. from the root)

    while idx > 0:
        idx -= 1
        vdat = vdat_list[idx]
        lv = vdat_list[idx].ind_level
        edat = HvEDat(vdat.block[0])

        if last_lv < lv:
            # last vertex is the the parent of cur (notice the edge is reversed)
            graph.add_edge(idx, last_idx, edat)
        else:
            # now last_lv >= lv. this vertex is on another branch
            # find correct brother with same level
            if last_lv > lv:
                # find it in vdat_list
                brother_idx = idx + 1   # notice that the root is at the end of the list
                while vdat_list[brother_idx].ind_level > lv:
                    brother_idx += 1
                if vdat_list[brother_idx].ind_level != lv:
                    raise Exception(f'Data error. No brother was found where lv={lv}')
            else:
                # last vertex is its brother
                brother_idx = last_idx

            successor_idx = graph.get_successors(brother_idx)[0]    # now it has one and only one successors
            graph.add_edge(idx, successor_idx, edat)

        last_idx, last_lv = idx, lv

    graph.reverse_edge_list()
    graph.fix_duplicate_vertex()

    return graph


def compress_dag(graph: Graph) -> Graph:
    """
    :return: A new graph that cut some vertexes
    """
    cp_graph = Graph()
    # TODO
    return cp_graph


def parse_dag(lines: List[str]) -> Graph:
    vdat_lst = get_all_vdat(lines)
    translate_refer_label(vdat_lst)

    # print(vdat_lst)
    dag = generate_dag(vdat_lst)
    return dag


def parse_dag_file(plan_path: str, output_path: str):
    lines = read_lines(plan_path)
    vdat_lst = get_all_vdat(lines)
    translate_refer_label(vdat_lst)

    # print(vdat_lst)
    dag = generate_dag(vdat_lst)

    jsons = json.dumps(dag, cls=MyJsonEncoder, indent=2, separators=(',', ': '))
    # print(jsons)
    write_lines(output_path, [jsons])
