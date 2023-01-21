import json
from typing import List, OrderedDict

from fsm.log_model.task import Task
from fsm.util.json_handler import JsonEncodable


class Vector(JsonEncodable):
    """
    Class for one stage, like 'Map 3' or 'Reducer 4'
    """

    def __init__(self, vector_name: str, vertex_parallelism: int):
        self.vector_name = vector_name
        self.vertex_parallelism = vertex_parallelism
        self.tasks: List[Task] = []

    def __repr__(self):
        return f'vector{{{self.vector_name}}}'

    def add_task(self, task_id: str):
        """ Add an empty task"""
        task_type = self.vector_name.split(' ')[0]
        task = Task(task_type, task_id)
        self.tasks.append(task)

    def get_last_task(self):
        return None if not self.tasks else self.tasks[-1]

    def compute_all_task_values(self):
        for task in self.tasks:
            task.compute_step_values()

    def fix_tasks_start_time(self):
        min_start_time = min([task.start_time for task in self.tasks])
        for task in self.tasks:
            task.start_time -= min_start_time
            task.end_time -= min_start_time

    def to_dict(self) -> dict:
        return self.__dict__
