from typing import List


def dict_filter(dic: dict, key_list: List[str]) -> dict:
    """
    Genreate a new dict whose key of item must be in key_list
    """
    return {key: val for key, val in dic.items() if key in key_list}
