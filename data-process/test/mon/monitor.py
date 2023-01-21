import os
import unittest

from mon.monitor import MonData

FILE_ABS_PATH = os.path.dirname(__file__)
SERVER_PATH = os.path.join(FILE_ABS_PATH, os.pardir, os.pardir)


class TestMonitor(unittest.TestCase):
    """ Test monitor.MonData """

    def test_record(self):
        test_out_path = './iostat_test.mon'

        mon_data = MonData(False, test_out_path, write=True)
        mon_data.TEST_IOSTAT_PATH = './iostat_out2.txt'
        mon_data.TEST_DISK_TYPE_PATH = './disk_type_out2.txt'
        res = mon_data.record()

        mon_data = MonData(False, test_out_path, write=False)
        mon_data.load()
        item = mon_data.items[0]
        print()
        self.assertEquals(item, res)

    def test_record_bin(self):
        test_out_path = './iostat_test.mon'

        mon_data = MonData(True, test_out_path, write=True)
        mon_data.TEST_IOSTAT_PATH = './iostat_out2.txt'
        mon_data.TEST_DISK_TYPE_PATH = './disk_type_out2.txt'
        res = mon_data.record()

        mon_data = MonData(True, test_out_path, write=False)
        mon_data.load()
        item = mon_data.items[0]
        print()
        print(item)
        print(res)
        self.assertEquals(item, res)


if __name__ == '__main__':
    unittest.main()
