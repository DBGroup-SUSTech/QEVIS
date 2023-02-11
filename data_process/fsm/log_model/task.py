import re
from collections import OrderedDict

from fsm.log_model.step import Step
from fsm.util.json_handler import JsonEncodable


class Task(JsonEncodable):
    """
    Task that run in one container
    """

    def __init__(self, task_type, task_id):
        self.task_type = task_type
        self.task_id = task_id
        # just use a tuple (step, time) for now
        self.start_time = None
        self.end_time = None
        self.steps: OrderedDict = OrderedDict()

    def __repr__(self):
        return f'Task{{{self.task_id}}}'

    def add_record(self, line):
        """
        Determine which step this record belongs to, then add it to the step obj
        """

        step_name = re.findall(r'\'(.*)\'', line)[0]

        # get the step obj (only one if exists)
        if step_name not in self.steps:
            step = Step(self, self.task_type, step_name)
            self.steps[step_name] = step
        else:
            step = self.steps[step_name]

        # save it to step obj
        step.add_line(line)

    def compute_step_values(self):
        """
        Compute the values of each step
        """
        for step in self.steps.values():
            step.compute_value()

    def get_time_dict(self) -> OrderedDict:
        """
        Iterate the records and statistic the tot time cost for each type of step
        """
        unpaird_dict = {}
        ord_dict = OrderedDict()
        for step, time in self.steps:
            if step in unpaird_dict:
                # this is an end-time-record
                time_cost = time - unpaird_dict.pop(step)
                if step not in ord_dict:
                    # init this step with time_cost
                    ord_dict[step] = time_cost
                else:
                    # add cost to exsiting item
                    ord_dict[step] += time_cost
            else:
                # this is a start-time-record
                unpaird_dict[step] = time
        return ord_dict

    def to_dict(self) -> dict:
        return self.__dict__
