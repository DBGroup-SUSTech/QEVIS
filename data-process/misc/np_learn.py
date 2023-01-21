import numpy as np

if __name__ == '__main__':

    arr = np.array([4, 2, 6, 1, 5, 3, 7])
    print(np.quantile(arr, 0.25), np.quantile(arr, 0.75))

    arr = np.array([1, 2, 4, 8])
    print(np.quantile(arr, 0.5), np.quantile(arr, 5 / 6))
