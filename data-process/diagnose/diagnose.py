import pandas as pd

from impact_function import get_impact_v1


class Diagnose:
    def __init__(self):
        self.df = None

        self.row_n = []
        self.col_n = []
        self.st = -1
        self.et = -1
        self.total_run_time = -1
        self.max_total_run_time = -1
        self.max_task_length = -1

    def initial(self, task_list):
        self.df = self._pd_transfer(task_list)

        self.st = min(task_list, key=lambda task: task['start_time'])['start_time']
        self.et = max(task_list, key=lambda task: task['end_time'])['end_time']
        self.max_task_length = max(self.df['duration'])
        self.row_n, self.col_n = len(self.df['vec_name'].unique()), len(self.df['machine_id'].unique())
        self.total_run_time = sum(self.df['duration'])
        self.max_total_run_time = max(self.df['duration']) * self.df.shape[0]

    def _pd_transfer(self, task_list):
        # short_task_list = [{
        #     'start_time': r['start_time'] - self.st,
        #     'end_time': r['end_time'] - self.st,
        #     'duration': r['end_time'] - r['start_time'],
        #     'vec_name': r['vec_name'],
        #     'machine_id': r['machine_id'],
        #     'taskId': r['task_id']} for r in task_list]
        short_task_list = [self._create_object(r) for r in task_list]
        return pd.DataFrame(short_task_list)

    def _create_object(self, r):
        obj = {
            'start_time': r['start_time'] - self.st,
            'end_time': r['end_time'] - self.st,
            'duration': r['end_time'] - r['start_time'],
            'vec_name': r['vec_name'],
            'machine_id': r['machine_id'],
            'taskId': r['task_id']
        }
        for i in range(0, int(len(r['step_info']) / 2)):
            obj['step_duration_{}'.format(i)] = r['step_info'][i * 2 + 1] - r['step_info'][i * 2]
        return obj

    def diagnose_matrix_cal(self):
        df = self.df
        vec_list = []
        # vec_dict = {}
        # vec_machine_dict = {}

        vec_machine_list = []

        max_end_time = max(df['end_time'])
        time_range = max(df['end_time']) - min(df['start_time'])

        for i, r in enumerate(list(df['vec_name'].unique())):
            _df = df[df['vec_name'] == r]
            # calc vertex features
            # if r not in vec_dict:
            #     vec_dict[r] = {}
            # vec_dict[r]['start_time'] = abnormalRation(_df['start_time'])
            # vec_dict[r]['end_time'] = abnormalRation(_df['end_time'])
            # vec_dict[r]['duration'] = abnormalRation(_df['duration'])

            vertex_impact = get_impact_v1(time_range, _df)
            obj = {
                'vec_name': r,
                'start_time': self._abnormal_ration(_df['start_time']),
                'end_time': self._abnormal_ration(_df['end_time']),
                'duration': self._abnormal_ration(_df['duration']),
                'vertex_impact': vertex_impact,
                'duration_ratio': max(_df['duration']) / max(df['duration']),
                'parallel_score': self.calc_parallel_score(_df)
            }
            for i in range(0, 3):
                obj['step_duration_score_{}'.format(i)] = self._abnormal_ration(_df['step_duration_{}'.format(i)])

            vec_list.append(obj)
            for j, c in enumerate(list(df['machine_id'].unique())):
                #  calc vertex machine features
                _df = df[(df['vec_name'] == r) & (df['machine_id'] == c)]

                # vec_machine_impact = (max(_df['end_time']) - min(_df['start_time'])) / time_range
                # if _df.shape[0] != 0 else 0

                vec_machine_impact = sum(_df['duration']) / self.total_run_time if _df.shape[0] != 0 else 0
                # if r not in vec_machine_dict:
                #     vec_machine_dict[r] = {}
                # if c not in vec_machine_dict[r]:
                #     vec_machine_dict[r][c] = {}
                if _df.shape[0] == 0:
                    continue
                obj = {
                    'machine_id': c,
                    'vec_name': r,
                    'start_time': self._abnormal_ration(_df['start_time']),
                    'end_time': self._abnormal_ration(_df['end_time']),
                    'duration': self._abnormal_ration(_df['duration']),
                    'vertex_impact': vertex_impact,
                    'vec_machine_impact': vec_machine_impact,
                    'duration_ratio': max(_df['duration']) / max(df['duration']),
                    'parallel_score': self.calc_parallel_score(_df)
                }
                for i in range(0, 3):
                    obj['step_duration_score_{}'.format(i)] = self._abnormal_ration(_df['step_duration_{}'.format(i)])
                vec_machine_list.append(obj)
                # vec_machine_dict[r][c]['start_time'] = self.abnormalRation(_df['start_time'])
                # vec_machine_dict[r][c]['end_time'] = self.abnormalRation(_df['end_time'])
                # vec_machine_dict[r][c]['duration'] = self.abnormalRation(_df['duration'])

        vec_machine_df = pd.DataFrame(vec_machine_list)
        vec_df = pd.DataFrame(vec_list)
        self.calc_features(vec_df)
        self.calc_features(vec_machine_df)
        return vec_df, vec_machine_df

    @staticmethod
    def _abnormal_ration(arr):
        values = sorted(arr)
        total_areas = (max(values) - min(values)) * len(values)
        # pre_value = 0
        sum_val = 0
        for i in range(len(values)):
            next_i = min(len(values) - 1, i + 1)
            dv = values[next_i] - values[i]
            count = i + 1
            sum_val += count * dv
        return 0 if total_areas == 0 else sum_val / total_areas

    @staticmethod
    def s_avg_score(df):
        return (df['start_time'] + df['end_time'] + df['duration']) / 3

    @staticmethod
    def s_max_score(df):
        return df[['start_time', 'end_time', 'duration']].max(axis=1)

    @staticmethod
    def s_min_score(df):
        return df[['start_time', 'end_time', 'duration']].min(axis=1)

    def calc_parallel_score(self, df):
        # times = [(t, 0) for t in list(df['start_time'])] + [(t, 1) for t in list(df['end_time'])]
        # times = sorted(times)
        # max_num = 0
        # parallel_num = 0
        # pallels = []
        # for to in times:
        #     if to[1] == 0:
        #         parallel_num += 1
        #     elif to[1] == 1:
        #         parallel_num -= 1
        #     max_num = max(max_num, parallel_num)

        max_num = len(df)

        return 1 - sum(df['duration']) / (max_num * (max(df['end_time']) - min(df['start_time'])))

    def calc_features(self, df):
        # df['ave'] = self.s_avg_score(df)
        # df['max'] = self.s_max_score(df)
        # df['min'] = self.s_min_score(df)
        ratio = df['duration_ratio'] if 'duration_ratio' in df else 1
        df['duration_score'] = df['vertex_impact'] * df['duration'] * ratio
        df['end_time_score'] = df['vertex_impact'] * df['end_time']
        df['parallel_score'] = df['parallel_score'] * df['vertex_impact']
        for i in range(0, 3):
            df['step_duration_score_{}'.format(i)] = df['step_duration_score_{}'.format(i)] * df['vertex_impact']
