import json, json5
from typing import List


def read_lines(filename: str) -> List[str]:
    with open(filename, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
    return lines


def read_lines_cond(filename: str, line_filter=(lambda line: True)):
    """ Read all line that satisfies the filter """
    lines = []
    with open(filename, 'r', encoding='utf-8') as fp:
        while True:
            line = fp.readline()
            if not line:
                break
            if line_filter(line):
                lines.append(line)
    return lines


def read_json_obj(filename: str):
    with open(filename, 'r', encoding='utf-8') as fp:
        json_obj = json.load(fp)
    return json_obj


def read_json5_obj(filename: str):
    with open(filename, 'r', encoding='utf-8') as fp:
        json_obj = json5.load(fp)
    return json_obj


def write_lines(filename: str, lines: List[str]):
    with open(filename, 'w', encoding='utf-8') as fp:
        fp.writelines(lines)


def write_json_obj(filename: str, obj: any, indent = None):
    with open(filename, 'w', encoding='utf-8') as fp:
        json.dump(obj, fp, indent=indent)


def write_json5_obj(filename: str, obj: any, indent = None):
    with open(filename, 'w', encoding='utf-8') as fp:
        json5.dump(obj, fp, indent=indent)

