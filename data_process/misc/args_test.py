import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--time', type=int)
    parser.add_argument('-i', '--interval', type=int)
    parser.add_argument('-p', '--path', type=str)
    args = parser.parse_args()
    print(args.time, args.interval)
    print(args.path)
