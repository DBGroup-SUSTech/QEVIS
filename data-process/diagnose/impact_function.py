def get_impact_v1(time_range, _df):
    # FIXME and refactor
    return (max(_df['end_time']) - min(_df['start_time'])) / time_range if _df.shape[0] != 0 else 0


def get_impact_v2(total_run_time, _df):
    return sum(_df['duration']) / total_run_time


def get_impact_v3(max_total_run_time, _df):
    return max(_df['duration']) * _df.shape[0] / max_total_run_time
