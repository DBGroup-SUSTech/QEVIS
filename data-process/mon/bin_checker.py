from mon.monitor import MonData

if __name__ == '__main__':
    # mon_data = MonData(True, '../data_local/Example3/monitor_bin/dbg18_40517.bin')
    mon_data = MonData(True, "C:\\LocalDocument\\LocalDBGroup\\dbg20.mon")
    mon_data.load()
    for item in mon_data.items:
        print(item)
