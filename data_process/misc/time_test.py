import time

if __name__ == '__main__':
    timestamp = time.time()     # ms
    print(timestamp, type(timestamp))

    time_struct = time.localtime(time.time())
    print(time_struct, time_struct.tm_year)

    time_str = time.strftime('%Y-%m-%d %H:%M:%S', time_struct)
    print(time_str)

    time_struct = time.strptime(time_str, '%Y-%m-%d %H:%M:%S')
    print(time_struct)

    timestamp = time.mktime(time_struct)
    print(timestamp)