import abc
from json import JSONEncoder


class JsonEncodable(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def to_dict(self):
        pass


class MyJsonEncoder(JSONEncoder):
    def default(self, obj):
        if issubclass(obj.__class__, JsonEncodable):
            return obj.to_dict()
        return JSONEncoder.default(self, obj)
