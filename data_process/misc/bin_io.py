import struct
from typing import List, Tuple


# class TestObj:
#     def __init__(self):
#         self.integer = None
#         self.string = None
#         self.int_list = None
#         self.str_list = None
#
#     def set_val(self):
#         self.integer = 0
#         self.string = 'This is a string'
#         self.int_list = [1, 2, 3]
#         self.str_list = ['A', 'B', 'C']
#
#     @staticmethod
#     def read_from(filename: str):
#         with open(filename, 'rb') as fp:
#             obj = TestObj()
#             obj.integer = read_int(fp)
#             obj.string = read_str(fp)
#         return None
#
#     def write_to(self, filename: str):
#         with open(filename, 'wb') as fp:
#             raw_int = self.integer.to_bytes(length=4, byteorder='little', signed=True)
#             fp.write(raw_int)
#
#     def __str__(self):
#         return str(self.__dict__)


def write_int(fp, i: int):
    b = i.to_bytes(length=4, byteorder='little', signed=True)
    fp.write(b)


def read_int(fp) -> int:
    b = fp.read(4)
    return int.from_bytes(b, byteorder='little', signed=True)


def write_str(fp, s: str):
    len_ = len(s)
    write_int(fp, len_)
    fp.write(s.encode(encoding="utf-8"))


def read_str(fp) -> str:
    len_ = read_int(fp)
    return fp.read(len_).decode()


def write_int_list(fp, lst: List[int]):
    lst_len = len(lst)
    write_int(fp, lst_len)
    for i in lst:
        write_int(fp, i)


def read_int_list(fp) -> List[int]:
    lst_len = read_int(fp)
    lst = [read_int(fp) for _ in range(lst_len)]
    return lst


def write_struct(fp, fmt: str, tup: Tuple):
    b = struct.pack(fmt, *tup)
    fp.write(b)


def read_struct(fp, fmt: str) -> Tuple:
    len_ = struct.calcsize(fmt)
    b = fp.read(len_)
    return struct.unpack(fmt, b)


if __name__ == '__main__':
    with open('./test.bin', 'wb') as fp:
        write_int(fp, 1)
        write_int_list(fp, [2, 3, 4, 5])
        write_str(fp, 'This is a string.')
        write_struct(fp, '>2i2?', (1, 2, True, False))
    with open('./test.bin', 'rb') as fp:
        print(read_int(fp))
        print(read_int_list(fp))
        print(read_str(fp))
        print(read_struct(fp, '>2i2?'))
